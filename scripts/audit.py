#!/usr/bin/env python3
"""Dependency-free static audit. Findings are not a production-readiness certificate."""
from __future__ import annotations
import argparse
import binascii
import collections
import json
import re
import struct
import sys
import zlib
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def png_size(data: bytes) -> tuple[int, int]:
    """Check PNG chunk boundaries/CRCs and compressed data, not just the signature."""
    if not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise ValueError('Not a PNG')
    offset, size, compressed, ended = 8, None, bytearray(), False
    while offset < len(data):
        if offset + 12 > len(data):
            raise ValueError('Truncated PNG chunk')
        length, kind = struct.unpack('>I4s', data[offset:offset + 8])
        end = offset + 12 + length
        if end > len(data):
            raise ValueError('Truncated PNG payload')
        payload = data[offset + 8:end - 4]
        crc = struct.unpack('>I', data[end - 4:end])[0]
        if binascii.crc32(kind + payload) & 0xffffffff != crc:
            raise ValueError(f'Invalid {kind.decode("ascii", "replace")} CRC')
        if kind == b'IHDR':
            if size is not None or offset != 8 or length != 13:
                raise ValueError('Invalid IHDR')
            size = struct.unpack('>II', payload[:8])
            if min(size) < 1 or max(size) > 8192:
                raise ValueError('Invalid image dimensions')
        elif kind == b'IDAT':
            compressed.extend(payload)
        elif kind == b'IEND':
            if length or end != len(data):
                raise ValueError('Invalid IEND')
            ended = True
            break
        offset = end
    if not ended or size is None or not compressed:
        raise ValueError('Incomplete PNG')
    decoder = zlib.decompressobj()
    decoder.decompress(compressed, 64 * 1024 * 1024)
    if not decoder.eof or decoder.unused_data:
        raise ValueError('Invalid/oversized PNG image stream')
    return size


def manifest_resources(manifest: dict):
    """Yield (manifest field, local path), preserving the extension package boundary."""
    for scope in ('icons',):
        for key, value in manifest.get(scope, {}).items():
            yield f'{scope}.{key}', value
    for action in ('action', 'browser_action', 'page_action'):
        config = manifest.get(action, {})
        if config.get('default_popup'):
            yield f'{action}.default_popup', config['default_popup']
        icons = config.get('default_icon', {})
        if isinstance(icons, str):
            yield f'{action}.default_icon', icons
        else:
            for key, value in icons.items():
                yield f'{action}.default_icon.{key}', value
    for field in ('options_page', 'devtools_page'):
        if manifest.get(field):
            yield field, manifest[field]
    for field, prop in (('background', 'service_worker'), ('options_ui', 'page'), ('side_panel', 'default_path')):
        if manifest.get(field, {}).get(prop):
            yield f'{field}.{prop}', manifest[field][prop]
    for key, value in manifest.get('chrome_url_overrides', {}).items():
        yield f'chrome_url_overrides.{key}', value
    for i, script in enumerate(manifest.get('content_scripts', [])):
        for kind in ('js', 'css'):
            for value in script.get(kind, []):
                yield f'content_scripts.{i}.{kind}', value
    for value in manifest.get('sandbox', {}).get('pages', []):
        yield 'sandbox.pages', value
    for rule in manifest.get('declarative_net_request', {}).get('rule_resources', []):
        yield 'declarative_net_request.rule_resources', rule['path']
    for group in manifest.get('web_accessible_resources', []):
        for value in group.get('resources', []):
            yield 'web_accessible_resources', value
    if manifest.get('default_locale'):
        yield 'default_locale', f"_locales/{manifest['default_locale']}/messages.json"


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.references, self.inline_handlers, self.inline_scripts = [], [], []
        self.script = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.inline_handlers.extend(key for key in attrs if re.fullmatch(r'on[a-z]+', key))
        if tag == 'script':
            if attrs.get('src'):
                self.references.append(('script', attrs['src']))
            executable = attrs.get('type', '').lower() not in ('application/ld+json', 'application/json', 'importmap')
            self.script = executable and not attrs.get('src')
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split() and attrs.get('href'):
            self.references.append(('style', attrs['href']))
        if tag == 'img' and attrs.get('src'):
            self.references.append(('image', attrs['src']))

    def handle_data(self, data):
        if self.script and data.strip():
            self.inline_scripts.append(data.strip())

    def handle_endtag(self, tag):
        if tag == 'script':
            self.script = None


def contained_path(package: Path, base: Path, reference: str) -> Path:
    parsed = urlsplit(reference)
    if parsed.scheme or parsed.netloc:
        raise ValueError('Resource must be packaged locally')
    path = unquote(parsed.path)
    target = ((package if path.startswith('/') else base) / path.lstrip('/')).resolve()
    if not target.is_relative_to(package.resolve()):
        raise ValueError('Resource escapes extension package')
    return target


def audit(root: Path = ROOT) -> dict:
    errors, review, entries = [], [], []
    counts = collections.Counter()

    def issue(code, path, detail):
        errors.append({'code': code, 'path': str(path.relative_to(root)), 'detail': str(detail)})

    for file in sorted((root / 'extensions').glob('*/*/manifest.json')):
        package = file.parent
        counts['manifests'] += 1
        try:
            m = json.loads(file.read_text(encoding='utf-8'))
            if not isinstance(m, dict):
                raise ValueError('Manifest must be an object')
            if m.get('manifest_version') != 3:
                issue('manifest-version', file, 'Expected Manifest V3')
            for key in ('name', 'version'):
                if not isinstance(m.get(key), str) or not m[key].strip():
                    issue('manifest-field', file, f'Missing {key}')
            version = m.get('version', '')
            if (not re.fullmatch(r'(?:0|[1-9]\d*)(?:\.(?:0|[1-9]\d*)){0,3}', version)
                    or any(int(v) > 65535 for v in version.split('.') if v.isdigit())
                    or not any(v.isdigit() and int(v) > 0 for v in version.split('.'))):
                issue('manifest-field', file, 'Invalid Chrome version string')
            for permission in m.get('permissions', []):
                if permission in ('windows', 'commands'):
                    issue('invalid-permission', file, permission)
            for field, reference in manifest_resources(m):
                try:
                    target = contained_path(package, package, reference)
                    if '*' in reference and field == 'web_accessible_resources':
                        if not list(package.glob(reference.lstrip('/'))):
                            issue('missing-resource', file, f'{field}: {reference}')
                    elif not target.is_file():
                        issue('missing-resource', file, f'{field}: {reference}')
                except (ValueError, TypeError) as exc:
                    issue('invalid-resource', file, f'{field}: {reference}: {exc}')
            if any(p in ('<all_urls>', '*://*/*', 'https://*/*', 'http://*/*') for p in m.get('host_permissions', [])):
                review.append({'code': 'broad-host-permission', 'path': str(file.relative_to(root))})
            popup = package / 'popup.js'
            source = popup.read_text(encoding='utf-8') if popup.exists() else ''
            prototype = 'PROTOTYPE_ONLY' in source or "content.innerHTML = '<p>Action completed!</p>'" in source
            if prototype:
                counts['prototypes'] += 1
            entries.append({'path': str(package.relative_to(root)), 'name': m.get('name'),
                            'status': 'prototype' if prototype else 'example-needs-functional-review'})
        except (json.JSONDecodeError, ValueError, TypeError, AttributeError) as exc:
            issue('invalid-manifest', file, exc)
            continue
        for page in sorted(package.rglob('*.html')):
            counts['html'] += 1
            parser = PageParser()
            parser.feed(page.read_text(encoding='utf-8'))
            for handler in parser.inline_handlers:
                issue('inline-handler', page, handler)
            if parser.inline_scripts:
                issue('inline-script', page, 'Executable inline script violates default MV3 CSP')
            for kind, reference in parser.references:
                parsed = urlsplit(reference)
                if parsed.scheme or parsed.netloc:
                    if kind == 'script':
                        issue('remote-script', page, reference)
                    continue
                try:
                    if not contained_path(package, page.parent, reference).is_file():
                        issue('missing-page-resource', page, reference)
                except ValueError as exc:
                    issue('invalid-page-resource', page, exc)
        for image in sorted(package.rglob('*.png')):
            counts['png'] += 1
            try:
                png_size(image.read_bytes())
            except (ValueError, zlib.error, struct.error) as exc:
                issue('invalid-png', image, exc)
        for js in sorted(package.rglob('*.js')):
            counts['javascript'] += 1
            source = js.read_text(encoding='utf-8')
            if re.search(r'\b(?:eval\s*\(|new\s+Function\s*\()', source):
                issue('dynamic-code', js, 'Dynamic evaluation violates MV3 extension-page CSP')
            if re.search(r'\bon(?:click|error|change|input|load|submit)\s*=\s*[\"\x27]', source):
                issue('inline-handler-template', js, 'Inline event handler in generated markup')
            if '.innerHTML' in source:
                counts['javascript-with-innerHTML'] += 1
            if "Math.random()" in source and 'password' in package.name:
                issue('weak-password-rng', js, 'Password generation must use Web Crypto')
    return {'scope': 'Static checks only; passing does not certify behavior, security, or release readiness.',
            'counts': dict(counts), 'errors': errors, 'review': review, 'extensions': entries}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--json', type=Path, help='Write complete machine-readable inventory')
    args = parser.parse_args()
    result = audit()
    if args.json:
        args.json.parent.mkdir(parents=True, exist_ok=True)
        args.json.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'counts': result['counts'], 'errors': len(result['errors']),
                      'review': len(result['review'])}, ensure_ascii=False, indent=2))
    for item in result['errors'][:40]:
        print(f"ERROR {item['code']}: {item['path']}: {item['detail']}")
    if len(result['errors']) > 40:
        print('Further findings are in the JSON report.')
    return int(bool(result['errors']))


if __name__ == '__main__':
    sys.exit(main())

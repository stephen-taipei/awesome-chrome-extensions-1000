#!/usr/bin/env python3
"""Reproducible, narrowly scoped repairs for the September 2026 legacy snapshot.

Dry-run by default. --apply changes extension packages only. Customized prototypes
are never replaced; existing valid images and every category/home page are kept.
"""
from __future__ import annotations
import argparse
import binascii
import collections
import hashlib
import json
import re
import struct
import zlib
from pathlib import Path
from audit import ROOT, manifest_resources, png_size, contained_path

OLD_PROTOTYPE = """document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('action-btn');
  const content = document.getElementById('content');

  btn.addEventListener('click', () => {
    content.innerHTML = '<p>Action completed!</p>';
    chrome.storage.local.set({ data: 'active' });
  });

  chrome.storage.local.get(['data'], (result) => {
    if (result.data) {
      content.innerHTML = `<p>Status: ${result.data}</p>`;
    } else {
      content.innerHTML = '<p>Click the button to start.</p>';
    }
  });
});
"""
PROTOTYPE = """// PROTOTYPE_ONLY: this package is a UI concept, not an implemented tool.
// Do not report a successful operation or read/render legacy untrusted storage.
document.addEventListener('DOMContentLoaded', () => {
  document.body.dataset.implementation = 'prototype';
  const content = document.getElementById('content');
  const button = document.getElementById('action-btn');
  if (content) {
    const heading = document.createElement('strong');
    heading.textContent = 'Prototype — functionality not implemented';
    const explanation = document.createElement('p');
    explanation.textContent = 'This page demonstrates an interface only. It does not process, verify, fetch, or save your data. See docs/AUDIT-2026-09-24.md in the repository for implementation status.';
    content.replaceChildren(heading, explanation);
    content.setAttribute('role', 'note');
  }
  if (button) {
    button.disabled = true;
    button.textContent = 'Not implemented';
    button.title = 'This is a UI prototype, not a working extension.';
  }
});
"""

COPY_HELPERS = r'''
// MV3-safe copy controls: data is never interpolated into executable handlers.
function auditCopyAttribute(value) {
  return String(value ?? '').replace(/[&<>"'\r\n]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    '\r': '&#13;', '\n': '&#10;'
  })[char]);
}
async function auditCopyControl(target) {
  const control = target instanceof Element ? target.closest('[data-copy]') : null;
  if (!control) return;
  let status = document.getElementById('audit-copy-status');
  if (!status) {
    status = document.createElement('p');
    status.id = 'audit-copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    document.body.appendChild(status);
  }
  try {
    await navigator.clipboard.writeText(control.dataset.copy);
    status.textContent = 'Copied to clipboard.';
  } catch {
    status.textContent = 'Clipboard access was denied. Select and copy the text manually.';
  }
}
document.addEventListener('click', event => { void auditCopyControl(event.target); });
document.addEventListener('keydown', event => {
  const control = event.target instanceof Element ? event.target.closest('[data-copy]') : null;
  if (control && control.tagName !== 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    void auditCopyControl(control);
  }
});
'''
IMAGE_HELPER = r'''
// Capture resource errors outside inline handlers (which MV3 blocks).
document.addEventListener('error', event => {
  const image = event.target;
  if (image instanceof HTMLImageElement && image.hasAttribute('data-fallback-icon')) {
    image.style.visibility = 'hidden';
  }
}, true);
'''


def fallback_png(size: int) -> bytes:
    """Deterministic neutral four-tile icon; no libraries, fonts or remote assets."""
    def chunk(kind, payload):
        return (struct.pack('>I', len(payload)) + kind + payload
                + struct.pack('>I', binascii.crc32(kind + payload) & 0xffffffff))
    rows = bytearray()
    for y in range(size):
        rows.append(0)
        for x in range(size):
            u, v = (x + 0.5) / size, (y + 0.5) / size
            corner_x, corner_y = max(0.13 - u, u - 0.87, 0), max(0.13 - v, v - 0.87, 0)
            inside = corner_x * corner_x + corner_y * corner_y <= 0.13 ** 2
            tile = (0.23 <= u <= 0.46 or 0.54 <= u <= 0.77) and (0.23 <= v <= 0.46 or 0.54 <= v <= 0.77)
            rows.extend((238, 242, 255, 255) if tile else (79, 70, 229, 255 if inside else 0))
    header = struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', header) + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b'')


def repairs(root: Path = ROOT, apply: bool = False) -> dict:
    changed = {}
    counters = collections.Counter()

    def write(path: Path, data: str | bytes, kind: str):
        encoded = data.encode('utf-8') if isinstance(data, str) else data
        if path.exists() and path.read_bytes() == encoded:
            return
        changed[str(path.relative_to(root))] = kind
        if apply:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(encoded)

    for manifest in sorted((root / 'extensions').glob('*/*/manifest.json')):
        m = json.loads(manifest.read_text(encoding='utf-8'))
        original = json.dumps(m, sort_keys=True)
        package = manifest.parent
        popup = package / 'popup.js'
        if popup.exists() and popup.read_text(encoding='utf-8') == OLD_PROTOTYPE:
            write(popup, PROTOTYPE, 'honest-prototype')
            # Preserve old stored data; no broad privileges for a display-only prototype.
            m.pop('background', None)
            m['permissions'] = []
            counters['prototypes-labelled'] += 1
        if any(p in ('windows', 'commands') for p in m.get('permissions', [])):
            m['permissions'] = [p for p in m['permissions'] if p not in ('windows', 'commands')]
            counters['invalid-permissions-removed'] += 1
        if json.dumps(m, sort_keys=True) != original:
            write(manifest, json.dumps(m, ensure_ascii=False, indent=2) + '\n', 'manifest')
        images = {}
        for field, reference in manifest_resources(m):
            if ('icons.' in field or 'default_icon' in field) and reference.endswith('.png'):
                path = contained_path(package, package, reference)
                key = field.rsplit('.', 1)[-1]
                images[path] = int(key) if key in ('16', '32', '48', '128') else 128
        for path, size in images.items():
            try:
                png_size(path.read_bytes())
            except (FileNotFoundError, ValueError, zlib.error, struct.error):
                kind = 'missing-icons' if not path.exists() else 'corrupt-icons'
                write(path, fallback_png(size), kind)
                counters[kind] += 1

    # Reviewed, simple text escapers. Encode both text and quoted attributes.
    escaper = re.compile(r'((?:function\s+)?escapeHtml\((\w+)\)\s*\{)([^{}]*)(\})')
    for js in sorted((root / 'extensions').rglob('*.js')):
        source = js.read_text(encoding='utf-8')
        if source == OLD_PROTOTYPE or 'PROTOTYPE_ONLY' in source:
            continue
        old = source
        def escape(match):
            if 'innerHTML' not in match[3] and '.replace' not in match[3]:
                return match[0]
            arg = match[2]
            body = (f"\n    return String({arg} ?? '').replace(/&/g, '&amp;')"
                    ".replace(/</g, '&lt;').replace(/>/g, '&gt;')"
                    ".replace(/\"/g, '&quot;').replace(/'/g, '&#39;');\n  ")
            return match[1] + body + match[4]
        source = escaper.sub(escape, source)
        if source != old:
            counters['text-and-attribute-escapers'] += 1

        if 'onerror="' in source:
            source, count = re.subn(r'onerror="[^"]*"', 'data-fallback-icon', source)
            if count:
                source += IMAGE_HELPER
                counters['external-image-handlers'] += count

        if 'onclick="navigator.clipboard.writeText(' in source:
            number = int(js.parent.name.split('-')[0])
            if number == 232: value = "'font-family: ' + font + ';'"
            elif number == 238: value = 'item.value'
            elif number == 244: value = 'm.type'
            elif number == 251: value = 'p.regex'
            elif number == 254: value = 'e.code'
            elif 256 <= number <= 260: value = 'c.cmd'
            elif 265 <= number <= 266: value = 't.code'
            elif 261 <= number <= 276 or number == 299: value = 's.code'
            elif number == 288: value = 'item.char'
            elif number == 298: value = 'h.name'
            elif number != 291: raise ValueError(f'Unreviewed copy handler: {js}')
            def copy_control(match):
                expression = re.search(r'\$\{(\w+)\}', match[1])[1] if number == 291 else value
                return 'data-copy="${auditCopyAttribute(' + expression + ')}" role="button" tabindex="0"'
            source, count = re.subn(r'onclick="navigator\.clipboard\.writeText\((.*?)\)"', copy_control, source, flags=re.S)
            if not count:
                raise ValueError(f'Copy handler not migrated: {js}')
            source += COPY_HELPERS
            counters['external-copy-handlers'] += count

        # Only guard the defaults write, not alarm or context-menu registration.
        if js.name == 'background.js' and js.parent.parent.name == '10-experimental':
            install = re.search(r'chrome\.runtime\.onInstalled\.addListener\(\(\) => \{.*?^\}\);', source, re.S | re.M)
            if install and 'chrome.storage.local.set(' in install[0]:
                block = install[0].replace('addListener(() => {', 'addListener((details) => {', 1)
                setter = re.compile(r'^  chrome\.storage\.local\.set\([^\n]*\);|^  chrome\.storage\.local\.set\(.*?^  \}\);', re.S | re.M)
                def guard(match):
                    return "  // Updates must preserve user data; setup below still runs.\n  if (details.reason === 'install') {\n" + '\n'.join('  ' + line for line in match[0].splitlines()) + '\n  }'
                block, count = setter.subn(guard, block, count=1)
                if count != 1:
                    raise ValueError(f'Unreviewed installation block: {js}')
                source = source[:install.start()] + block + source[install.end():]
                counters['update-data-loss-guards'] += 1
        write(js, source, 'javascript')

    # Move the two blocking-page inline scripts out of HTML, preserving their UI.
    for name in ('012-website-blocker', '078-site-blocker'):
        package = root / 'extensions/01-productivity' / name
        page = package / 'blocked.html'
        source = page.read_text(encoding='utf-8')
        inline = re.search(r'<script>\s*(.*?)\s*</script>', source, re.S)
        if inline:
            script = inline[1] + '\n'
            if 'onclick="history.back()"' in source:
                source = source.replace('onclick="history.back()"', 'id="backButton"')
                script += "document.getElementById('backButton').addEventListener('click', () => history.back());\n"
            source = re.sub(r'<script>.*?</script>', '<script src="blocked.js"></script>', source, flags=re.S)
            write(package / 'blocked.js', script, 'external-blocked-script')
            write(page, source, 'external-blocked-script')
            counters['external-blocked-scripts'] += 1

    # Two reproducible syntax errors found by parsing every JavaScript source.
    path = root / 'extensions/05-education/519-phrase-builder/popup.js'
    source = path.read_text(encoding='utf-8').replace("usage: 'Polite way to say you're not feeling well'", 'usage: "Polite way to say you\'re not feeling well"')
    write(path, source, 'syntax')
    path = root / 'extensions/10-experimental/999-ultimate-toolbox/popup.js'
    source = path.read_text(encoding='utf-8')
    if source.rstrip().endswith('toolsGrid.appendChild(item);\n    });\n  });'):
        source = source.rstrip()[:-5] + '  }\n});\n'
    write(path, source, 'syntax')
    # Package-local copies: unpacked extensions cannot import from repo-level shared/.
    shared = root / 'shared/secure-random.js'
    if shared.exists():
        for package in ('03-developer-tools/222-password-generator', '10-experimental/974-password-generator'):
            write(root / 'extensions' / package / 'secure-random.js', shared.read_bytes(), 'shared-security')
    return {'apply': apply, 'counts': dict(counters), 'changed_files': len(changed), 'changes': changed}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--json', type=Path)
    args = parser.parse_args()
    result = repairs(apply=args.apply)
    if args.json:
        args.json.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({key: value for key, value in result.items() if key != 'changes'}, indent=2))

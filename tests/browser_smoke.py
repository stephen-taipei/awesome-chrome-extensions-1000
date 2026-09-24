"""Browser CSP regression tests. --native uses real unpacked extensions.

Default mode serves package pages under a strict extension-equivalent script CSP.
Only Chrome storage and clipboard transport are mocked in that mode. Neither mode
proves all advertised functionality or permission sufficiency for every package.
"""
import argparse
import hashlib
import json
import os
import tempfile
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--native', action='store_true')
parser.add_argument('--json', type=Path)
args = parser.parse_args()
copy_packages = sorted(path.parent for path in (ROOT / 'extensions/03-developer-tools').glob('*/popup.js') if 'function auditCopyAttribute' in path.read_text())
prototype = next(path.parent for path in sorted((ROOT / 'extensions').glob('*/*/popup.js')) if 'PROTOTYPE_ONLY' in path.read_text())
password = ROOT / 'extensions/03-developer-tools/222-password-generator'
quiz = ROOT / 'extensions/04-entertainment/317-math-quiz'
experimental = ROOT / 'extensions/10-experimental/974-password-generator'
refresh = ROOT / 'extensions/01-productivity/013-auto-refresh'
packages = copy_packages + [prototype, password, quiz, experimental, refresh]
results = []

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Content-Security-Policy', "script-src 'self'; object-src 'self';")
        super().end_headers()
    def log_message(self, *unused):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()

def extension_id(path):
    value = hashlib.sha256(str(path).encode()).hexdigest()[:32]
    return value.translate(str.maketrans('0123456789abcdef', 'abcdefghijklmnop'))

def url(package):
    if args.native:
        return f'chrome-extension://{extension_id(package)}/popup.html'
    return f'http://127.0.0.1:{server.server_port}/{package.relative_to(ROOT)}/popup.html'

with tempfile.TemporaryDirectory() as profile, sync_playwright() as playwright:
    options = dict(headless=True, args=['--no-sandbox'])
    if os.environ.get('BROWSER_EXECUTABLE'):
        options['executable_path'] = os.environ['BROWSER_EXECUTABLE']
    if args.native:
        paths = ','.join(str(package) for package in packages)
        options['args'] += [f'--disable-extensions-except={paths}', f'--load-extension={paths}']
        options['ignore_default_args'] = ['--disable-extensions']
    context = playwright.chromium.launch_persistent_context(profile, **options)
    if not args.native:
        context.add_init_script("""globalThis.chrome = { storage: { local: {
          get(keys, callback) { const result = typeof keys === 'object' && !Array.isArray(keys) ? keys : {}; if (callback) callback(result); return Promise.resolve(result); },
          set(value, callback) { if (callback) callback(); return Promise.resolve(); }
        } } };""")
    for package in copy_packages:
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(url(package), wait_until='domcontentloaded')
        # Keep CSP enforcement, replacing only the operating-system clipboard transport.
        page.evaluate("""payload => {
          window.copied = null;
          Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { window.copied = text; } }, configurable: true });
          window.payload = payload;
          const host = document.createElement('div');
          host.innerHTML = '<button id="audit-copy-test" data-copy="' + auditCopyAttribute(window.payload) + '">Copy test</button>';
          document.body.append(host);
        }""", "\"'` & <img src=x onerror=alert(1)>\r\nsecond line")
        page.locator('#audit-copy-test').click()
        assert page.evaluate('window.copied === window.payload'), str(package)
        assert page.locator('#audit-copy-test img').count() == 0
        page.locator('#audit-copy-test').focus()
        page.evaluate('window.copied = null')
        page.keyboard.press('Enter')
        assert page.evaluate('window.copied === window.payload')
        assert not errors, (str(package), errors)
        results.append({'package': package.name, 'case': 'CSP copy click/keyboard + hostile text round-trip', 'pass': True})
        page.close()

    page = context.new_page()
    page.goto(url(prototype))
    assert page.locator('#action-btn').is_disabled()
    assert 'functionality not implemented' in page.locator('#content').inner_text()
    assert 'Action completed' not in page.locator('body').inner_text()
    results.append({'package': prototype.name, 'case': 'prototype is visibly unavailable and not falsely successful', 'pass': True})
    page.close()

    page = context.new_page()
    page.goto(url(password))
    value = page.locator('#password').input_value()
    assert len(value) == 16
    for selector in ['#upper', '#lower', '#numbers', '#symbols']:
        page.locator(selector).uncheck()
    page.locator('#generateBtn').click()
    assert page.locator('#password').input_value() == ''
    assert page.locator('#copyBtn').is_disabled()
    assert 'Select at least one' in page.locator('#strengthText').inner_text()
    page.locator('#numbers').check()
    page.locator('#generateBtn').click()
    assert page.locator('#password').input_value().isdigit()
    results.append({'package': password.name, 'case': 'generation, invalid options, selected alphabet', 'pass': True})
    page.close()

    page = context.new_page()
    page.clock.install()
    page.goto(url(quiz))
    page.locator('#startBtn').click()
    parts = page.locator('#problem').inner_text().split()
    a, b = int(parts[0]), int(parts[2])
    answer = a + b if parts[1] == '+' else a - b if parts[1] == '-' else a * b
    page.locator('#answer').fill(str(answer))
    page.locator('#answer').dispatch_event('input')
    assert page.locator('#score').inner_text() == '1'
    page.clock.fast_forward(31000)
    assert page.locator('#answer').is_disabled()
    assert "Time's up" in page.locator('#problem').inner_text()
    results.append({'package': quiz.name, 'case': 'one score per question and deadline expiry', 'pass': True})
    page.close()

    if args.native:
        page = context.new_page()
        page.goto(url(experimental))
        page.wait_for_function("document.getElementById('password-output').value.length > 0")
        page.locator('#passphrase-btn').click()
        page.wait_for_function("document.getElementById('password-output').value.split('-').length === 16")
        results.append({'package': experimental.name, 'case': 'real MV3 worker generates 16-word passphrase', 'pass': True})
        page.close()
        # A fresh unsupported tab must not be reloadable; worker validation is also unit-tested.
        page = context.new_page()
        page.goto(url(refresh))
        assert page.locator('#startBtn').is_disabled()
        results.append({'package': refresh.name, 'case': 'unsupported tab cannot start a refresh', 'pass': True})
        page.close()
    context.close()
server.shutdown()
report = {'mode': 'native-extension' if args.native else 'hosted-CSP-with-API-mocks', 'passed': len(results), 'results': results}
if args.json:
    args.json.write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report, indent=2))

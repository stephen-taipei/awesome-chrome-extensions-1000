import hashlib
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from audit import ROOT, PageParser, audit, contained_path, manifest_resources, png_size
from repair_legacy import fallback_png, repairs

class AuditTests(unittest.TestCase):
    def test_generated_png_dimensions(self):
        for size in (16, 48, 128):
            self.assertEqual(png_size(fallback_png(size)), (size, size))

    def test_png_crc_corruption_is_detected(self):
        data = bytearray(fallback_png(16))
        data[-18] ^= 1
        with self.assertRaises(ValueError):
            png_size(bytes(data))

    def test_truncated_and_non_png_are_rejected(self):
        for data in (b'fake', fallback_png(16)[:-4]):
            with self.assertRaises(ValueError):
                png_size(data)

    def test_package_boundaries(self):
        with tempfile.TemporaryDirectory() as directory:
            package = Path(directory) / 'extension'
            package.mkdir()
            for reference in ('../../secret.js', '%2e%2e/secret.js', 'https://example.com/code.js'):
                with self.assertRaises(ValueError):
                    contained_path(package, package, reference)
            self.assertEqual(contained_path(package, package, 'popup.js'), package / 'popup.js')

    def test_csp_inline_handlers_and_scripts(self):
        page = PageParser()
        page.feed('<button onclick="run()">Go</button><script>alert(1)</script>')
        self.assertEqual(len(page.inline_handlers), 1)
        self.assertEqual(len(page.inline_scripts), 1)

    def test_json_ld_is_not_executable(self):
        page = PageParser()
        page.feed('<script type="application/ld+json">{"name":"Example"}</script>')
        self.assertEqual(page.inline_scripts, [])

    def test_manifest_entrypoint_inventory(self):
        paths = dict(manifest_resources({'action': {'default_popup': 'popup.html'}, 'background': {'service_worker': 'worker.js'}, 'content_scripts': [{'js': ['content.js']}]}))
        self.assertIn('popup.html', paths.values())
        self.assertIn('worker.js', paths.values())
        self.assertIn('content.js', paths.values())

    def test_homepage_design_is_byte_identical_to_audited_baseline(self):
        self.assertEqual(hashlib.sha256((ROOT / 'index.html').read_bytes()).hexdigest(),
                         'a64d3e114fa2276b3d1353e50411137fd9076652147cfc63261bafa4629a6fef')

    def test_migration_is_idempotent(self):
        self.assertEqual(repairs(apply=False)['changed_files'], 0)

    def test_all_extension_packages_pass_structural_gate(self):
        result = audit()
        self.assertEqual(result['counts']['manifests'], 965)
        self.assertEqual(result['errors'], [])
        self.assertEqual(result['counts']['prototypes'], 386)

if __name__ == '__main__':
    unittest.main()

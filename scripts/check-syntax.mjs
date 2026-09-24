import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import vm from 'node:vm';
const root = fileURLToPath(new URL('../extensions/', import.meta.url));
let checked = 0;
const errors = [];
async function walk(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, item.name);
    if (item.isDirectory()) await walk(path);
    else if (item.name.endsWith('.js')) {
      checked++;
      const source = await readFile(path, 'utf8');
      try { new vm.Script(source, { filename: path }); }
      catch (error) {
        try {
          if (!/^\s*(?:import\b|export\b)/m.test(source)) throw error;
          new vm.SourceTextModule(source, { identifier: path });
        } catch (failure) { errors.push({ path: path.slice(root.length), error: failure.message }); }
      }
    }
  }
}
await walk(root);
console.log(JSON.stringify({ checked, errors }, null, 2));
if (errors.length) process.exitCode = 1;

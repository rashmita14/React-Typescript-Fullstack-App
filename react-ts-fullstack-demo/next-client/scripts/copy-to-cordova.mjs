import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const exportDir = resolve(projectDir, 'next-client/out');
const cordovaWebDir = resolve(projectDir, 'mobile/cordova/www');

await mkdir(cordovaWebDir, { recursive: true });
for (const entry of await readdir(cordovaWebDir)) {
  if (entry !== '.gitkeep') {
    await rm(join(cordovaWebDir, entry), { recursive: true, force: true });
  }
}
await cp(exportDir, cordovaWebDir, { recursive: true });
console.log(`Copied static web export to ${cordovaWebDir}`);

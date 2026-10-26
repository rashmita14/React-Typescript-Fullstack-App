import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const exportDir = resolve(projectDir, 'next-client/out');
const cordovaWebDir = resolve(projectDir, 'mobile/cordova/www');

await rm(cordovaWebDir, { recursive: true, force: true });
await mkdir(cordovaWebDir, { recursive: true });
await cp(exportDir, cordovaWebDir, { recursive: true });
console.log(`Copied static web export to ${cordovaWebDir}`);

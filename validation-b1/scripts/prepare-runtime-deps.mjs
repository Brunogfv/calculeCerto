import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dest = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (!dest) {
    console.error('Uso: node scripts/prepare-runtime-deps.mjs <dest>');
    process.exit(2);
}
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const nome of ['package.json', 'package-lock.json']) {
    fs.copyFileSync(path.join(B1, nome), path.join(dest, nome));
}

const resultado = spawnSync('npm', ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'], {
    cwd: dest,
    stdio: 'inherit',
    shell: true,
    env: process.env
});
if (resultado.status !== 0) {
    console.error('Falha ao instalar dependencias de runtime.');
    process.exit(resultado.status || 1);
}

console.log(JSON.stringify({
    runtime_deps: dest,
    package: 'package.json',
    lockfile: 'package-lock.json',
    node_modules: fs.existsSync(path.join(dest, 'node_modules'))
}, null, 2));

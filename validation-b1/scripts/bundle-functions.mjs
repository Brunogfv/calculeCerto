import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] ? path.resolve(process.argv[2]) : path.join(B1, 'netlify', 'functions');
const dest = process.argv[3] ? path.resolve(process.argv[3]) : null;

if (!dest) {
    console.error('Uso: node scripts/bundle-functions.mjs <src> <dest>');
    process.exit(2);
}
if (!fs.existsSync(src)) {
    console.error(`Diretorio de Functions ausente: ${src}`);
    process.exit(2);
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

const cli = path.join(B1, 'node_modules', 'netlify-cli', 'bin', 'run.js');
if (!fs.existsSync(cli)) {
    console.error('Netlify CLI local ausente.');
    process.exit(2);
}

const resultado = spawnSync(
    process.execPath,
    [cli, 'functions:build', '--src', src, '--functions', dest],
    { cwd: B1, encoding: 'utf8' }
);

if (resultado.status !== 0) {
    console.error('Falha ao empacotar Functions.');
    console.error(resultado.stderr || resultado.stdout || 'sem detalhes');
    process.exit(resultado.status || 1);
}

const esperados = ['capture-html.zip', 'cleanup-html-capture.zip', 'collect.zip'];
for (const nome of esperados) {
    const arquivo = path.join(dest, nome);
    if (!fs.existsSync(arquivo)) {
        console.error(`Pacote de Function ausente: ${nome}`);
        process.exit(1);
    }
}
for (const entry of fs.readdirSync(dest)) {
    if (!esperados.includes(entry)) fs.rmSync(path.join(dest, entry), { force: true, recursive: true });
}

console.log(JSON.stringify({
    source: src,
    bundle_dir: dest,
    functions: esperados.map((nome) => ({
        name: nome,
        bytes: fs.statSync(path.join(dest, nome)).size
    }))
}, null, 2));

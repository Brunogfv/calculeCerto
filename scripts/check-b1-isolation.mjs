import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const B1 = path.join(ROOT, 'validation-b1');
const IGNORAR = /(^|[\\/])(node_modules|dist|\.netlify)([\\/]|$)/i;

function arquivos(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = path.join(dir, entry.name);
        if (IGNORAR.test(full)) return [];
        if (entry.isDirectory()) return arquivos(full);
        if (entry.isSymbolicLink()) return [];
        return [full];
    });
}

function snapshot() {
    const mapa = {};
    for (const arquivo of arquivos(B1)) {
        const relativo = path.relative(B1, arquivo).split(path.sep).join('/');
        mapa[relativo] = crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex');
    }
    return mapa;
}

function comparar(antes, depois) {
    const chavesAntes = Object.keys(antes).sort();
    const chavesDepois = Object.keys(depois).sort();
    const faltando = chavesAntes.filter((chave) => !chavesDepois.includes(chave));
    const extras = chavesDepois.filter((chave) => !chavesAntes.includes(chave));
    const alterados = chavesAntes.filter((chave) => chavesDepois.includes(chave) && antes[chave] !== depois[chave]);
    if (faltando.length || extras.length || alterados.length) {
        throw new Error(`Build canonico alterou B1: faltando=[${faltando.join(', ')}] extras=[${extras.join(', ')}] alterados=[${alterados.join(', ')}]`);
    }
}

function executar(args, cwd) {
    const resultado = spawnSync(process.execPath, args, {
        cwd,
        stdio: 'inherit',
        env: process.env
    });
    if (resultado.status !== 0) throw new Error(`Comando falhou: ${args.join(' ')}`);
}

const antes = snapshot();
const build = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
    shell: process.platform === 'win32'
});
if (build.status !== 0) throw new Error('npm run build falhou');
const depois = snapshot();
comparar(antes, depois);

executar([path.join(B1, 'scripts', 'build.mjs')], B1);
const depoisB1 = snapshot();
comparar(antes, depoisB1);

console.log(`B1 isolation ok: ${Object.keys(antes).length} arquivos preservados pelo build canonico e pelo build B1.`);

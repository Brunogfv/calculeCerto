import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { verifyShared } from './verify-shared.mjs';
import { validarFontesB1 } from './artifact.mjs';

const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(B1, 'public');
const DIST = path.join(B1, 'dist');

const OBRIGATORIOS = [
    'index.html',
    'validacao-encerrada.html',
    'robots.txt',
    '_headers',
    'b1-consent.js',
    'b1.css'
];

const PROIBIDOS = [
    'postgresql://',
    'DATABASE_URL',
    'CLEANUP_DATABASE_URL',
    'MIGRATION_DATABASE_URL',
    'EDGE_INGEST_SECRET',
    'RATE_LIMIT_HMAC_SECRET',
    'BEGIN PRIVATE KEY',
    'sk_live_',
    'nfp_',
    'googletagmanager',
    'google-analytics',
    'googlesyndication',
    'adsbygoogle',
    'doubleclick',
    'mercadolivre'
];

function arquivos(dir) {
    const resultado = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) resultado.push(...arquivos(full));
        else resultado.push(full);
    }
    return resultado;
}

function validarConfigsEdgeEstaticos() {
    const dir = path.join(B1, 'netlify', 'edge-functions');
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (!entry.isFile() || !/\.(?:js|mjs|ts)$/.test(entry.name)) continue;
        const arquivo = path.join(dir, entry.name);
        const fonte = fs.readFileSync(arquivo, 'utf8');
        const bloco = fonte.match(/export const config\s*=\s*({[\s\S]*?});/);
        if (!bloco) throw new Error(`config estático não encontrado em ${entry.name}`);
        if (/\bIMGS_PREFIX\b|\b(?:const|let|var)\b|\+/.test(bloco[1])) {
            throw new Error(`config de Edge contém expressão não literal em ${entry.name}`);
        }
    }
}

if (!fs.existsSync(PUBLIC)) throw new Error('public/ ausente');

const shared = verifyShared({ b1Root: B1, canonicalRoot: path.resolve(B1, '..') });
validarConfigsEdgeEstaticos();
validarFontesB1(B1);
console.log(`shared-manifest ok: ${shared.files} arquivos.`);

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(PUBLIC, DIST, { recursive: true });

for (const relativo of OBRIGATORIOS) {
    if (!fs.existsSync(path.join(DIST, relativo))) {
        throw new Error(`Arquivo obrigatório ausente no dist: ${relativo}`);
    }
}

const lista = arquivos(DIST);

for (const arquivo of lista) {
    const texto = fs.readFileSync(arquivo, 'utf8');
    for (const proibido of PROIBIDOS) {
        if (texto.includes(proibido)) {
            throw new Error(`Conteúdo proibido (${proibido}) em ${path.relative(DIST, arquivo)}`);
        }
    }
}

for (const arquivo of lista.filter((item) => item.endsWith('.html'))) {
    const texto = fs.readFileSync(arquivo, 'utf8');
    if (/(?:src|href)\s*=\s*["'](?:https?:)?\/\//i.test(texto)) {
        throw new Error(`Recurso externo encontrado em ${path.relative(DIST, arquivo)}`);
    }
    if (!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(texto)) {
        throw new Error(`Meta robots noindex ausente em ${path.relative(DIST, arquivo)}`);
    }
}

const bytes = lista.reduce((total, arquivo) => total + fs.statSync(arquivo).size, 0);
const manifest = {
    version: 1,
    published_files: lista.length,
    bytes,
    index_sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(DIST, 'index.html'))).digest('hex')
};
fs.writeFileSync(path.join(DIST, 'build-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`B1 build ok: ${manifest.published_files} arquivos publicados + build-manifest.json, ${(bytes / 1024).toFixed(1)} KiB.`);

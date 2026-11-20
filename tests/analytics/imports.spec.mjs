import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ENTRADA_EDGE = path.join(RAIZ, 'netlify', 'edge-functions', 'html-capture.js');
const ENTRADA_FUNCTION = path.join(RAIZ, 'netlify', 'functions', 'capture-html.mjs');
const PROIBIDOS_EDGE = [
    'DATABASE_URL',
    'CLEANUP_DATABASE_URL',
    'MIGRATION_DATABASE_URL',
    'RATE_LIMIT_HMAC_SECRET'
];

function importsDoArquivo(arquivo) {
    const fonte = fs.readFileSync(arquivo, 'utf8');
    const especificadores = [];
    const estaticos = /(?:^|\n)\s*import\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/g;
    const dinamicos = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
    for (const regex of [estaticos, dinamicos]) {
        let achado;
        while ((achado = regex.exec(fonte)) !== null) especificadores.push(achado[1]);
    }
    return { fonte, especificadores };
}

function resolverRelativo(origem, especificador) {
    if (!especificador.startsWith('.')) return null;
    if (!/\.(?:mjs|cjs|js)$/.test(especificador)) {
        throw new Error(`Import relativo sem extensão explícita em ${origem}: ${especificador}`);
    }
    const alvo = path.resolve(path.dirname(origem), especificador);
    if (!fs.existsSync(alvo)) throw new Error(`Import inexistente em ${origem}: ${especificador}`);
    return alvo;
}

function analisarGrafo(entrada) {
    const arquivos = new Map();
    const externos = new Set();
    const ciclos = [];
    const visitando = new Set();
    const visitados = new Set();

    function visitar(arquivo) {
        if (visitando.has(arquivo)) {
            ciclos.push(arquivo);
            return;
        }
        if (visitados.has(arquivo)) return;

        visitando.add(arquivo);
        const { fonte, especificadores } = importsDoArquivo(arquivo);
        arquivos.set(arquivo, fonte);

        for (const especificador of especificadores) {
            const alvo = resolverRelativo(arquivo, especificador);
            if (alvo) visitar(alvo);
            else externos.add(especificador);
        }

        visitando.delete(arquivo);
        visitados.add(arquivo);
    }

    visitar(entrada);
    return { arquivos, externos, ciclos };
}

test('grafo do Edge resolve todos os imports e não depende de Node/npm', () => {
    const { arquivos, externos, ciclos } = analisarGrafo(ENTRADA_EDGE);

    assert.ok(arquivos.size >= 5, `grafo pequeno: ${arquivos.size}`);
    assert.deepEqual([...externos], [], `imports externos no Edge: ${[...externos].join(', ')}`);
    assert.deepEqual(ciclos, [], 'dependência circular no Edge');

    for (const arquivo of arquivos.keys()) {
        assert.match(arquivo, /[\\/]netlify[\\/]edge-functions[\\/]/);
        assert.doesNotMatch(arquivo, /[\\/]netlify[\\/]functions[\\/]/);
    }
});

test('grafo do Edge não referencia segredos, logs ou APIs exclusivas do Node', () => {
    const { arquivos } = analisarGrafo(ENTRADA_EDGE);
    const fonte = [...arquivos.values()].join('\n');

    for (const proibido of PROIBIDOS_EDGE) {
        assert.equal(fonte.includes(proibido), false, `Edge referencia ${proibido}`);
    }
    assert.doesNotMatch(fonte, /Netlify\.env\.toObject\s*\(/);
    assert.doesNotMatch(fonte, /\bDeno\.env\b/);
    assert.doesNotMatch(fonte, /\bprocess\.env\b/);
    assert.doesNotMatch(fonte, /\bconsole\.(?:log|error|warn|debug)\b/);
    assert.doesNotMatch(fonte, /\bnode:/);
});

test('grafo da Function resolve imports compartilhados sem ciclos', () => {
    const { arquivos, externos, ciclos } = analisarGrafo(ENTRADA_FUNCTION);

    assert.ok(arquivos.size >= 5, `grafo pequeno: ${arquivos.size}`);
    assert.deepEqual(ciclos, [], 'dependência circular na Function');
    assert.ok(externos.has('node:crypto'));
    assert.ok(externos.has('pg'));
    assert.ok(externos.has('zod'));

    const compartilhados = [...arquivos.keys()].filter(arquivo => arquivo.includes(`${path.sep}edge-functions${path.sep}`));
    assert.ok(compartilhados.length >= 2, 'módulos compartilhados não foram resolvidos');
    for (const arquivo of compartilhados) {
        assert.equal(fs.existsSync(arquivo), true);
    }
});

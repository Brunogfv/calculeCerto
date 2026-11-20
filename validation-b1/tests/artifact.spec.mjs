import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
    criarPacote,
    validarPacote,
    validarFontesB1,
    STATIC_ALLOWLIST,
    FUNCTION_ALLOWLIST,
    EDGE_ALLOWLIST
} from '../scripts/artifact.mjs';

function diretorioTemporario() {
    return fs.mkdtempSync(path.join(os.tmpdir(), 'b1-artifact-test-'));
}

test('fontes B1 nao contem collect nem redirects/headers herdados', () => {
    const fontes = validarFontesB1();
    assert.deepEqual(fontes.funcoes, [...FUNCTION_ALLOWLIST].sort());
    assert.deepEqual(fontes.edge, [...EDGE_ALLOWLIST].sort());
    assert.equal(fontes.funcoes.includes('collect.mjs'), false);
    assert.equal(fontes.publico.includes('_redirects'), false);
});

test('pacote B1 contem exatamente o contrato minimo', () => {
    const destino = diretorioTemporario();
    try {
        const { dir, manifest } = criarPacote({ destino });
        assert.equal(fs.existsSync(path.join(dir, 'package-manifest.json')), true);

        const estaticos = fs.readdirSync(path.join(dir, 'dist')).sort();
        assert.deepEqual(estaticos, [...STATIC_ALLOWLIST].sort());
        assert.equal(estaticos.includes('_redirects'), false);

        const funcoes = fs.readdirSync(path.join(dir, 'netlify', 'functions')).sort();
        assert.deepEqual(funcoes, ['_lib', 'capture-html.mjs', 'cleanup-html-capture.mjs']);
        assert.equal(funcoes.includes('collect.mjs'), false);

        const edge = fs.readdirSync(path.join(dir, 'netlify', 'edge-functions')).sort();
        assert.deepEqual(edge, ['_lib', 'html-capture.js']);

        const toml = fs.readFileSync(path.join(dir, 'netlify.toml'), 'utf8');
        assert.match(toml, /publish = "dist"/);
        assert.match(toml, /directory = "netlify\/functions"/);
        assert.match(toml, /edge_functions = "netlify\/edge-functions"/);
        assert.doesNotMatch(toml, /[A-Za-z]:\\/);

        assert.equal(Object.keys(manifest.static).length, 7);
        assert.equal(Object.keys(manifest.functions).length, 9);
        assert.equal(Object.keys(manifest.edge_functions).length, 7);
        assert.equal(JSON.stringify(manifest).includes('collect.mjs'), false);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('pacote rejeita collect introduzido fora do contrato', () => {
    const destino = diretorioTemporario();
    try {
        criarPacote({ destino });
        fs.writeFileSync(path.join(destino, 'netlify', 'functions', 'collect.mjs'), 'export default () => {};\n');
        assert.throws(() => validarPacote(destino), /collect/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('pacote rejeita _redirects introduzido no diretorio publicado', () => {
    const destino = diretorioTemporario();
    try {
        criarPacote({ destino });
        fs.writeFileSync(path.join(destino, 'dist', '_redirects'), '/* /index.html 200\n');
        assert.throws(() => validarPacote(destino), /_redirects/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});


const B1_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function hash(arquivo) {
    return crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex');
}

function lerManifesto(destino) {
    return JSON.parse(fs.readFileSync(path.join(destino, 'package-manifest.json'), 'utf8'));
}

function escreverManifesto(destino, manifesto) {
    fs.writeFileSync(path.join(destino, 'package-manifest.json'), `${JSON.stringify(manifesto, null, 2)}\n`);
}

function criarPacoteTemporario() {
    const destino = diretorioTemporario();
    criarPacote({ destino });
    return destino;
}

test('rejeita manifesto com hash desatualizado', () => {
    const destino = criarPacoteTemporario();
    try {
        const manifesto = lerManifesto(destino);
        manifesto.static['index.html'] = '0'.repeat(64);
        escreverManifesto(destino, manifesto);
        assert.throws(() => validarPacote(destino), /Manifesto static|hash divergente/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('rejeita arquivo modificado mesmo mantendo o tamanho', () => {
    const destino = criarPacoteTemporario();
    try {
        const arquivo = path.join(destino, 'dist', 'robots.txt');
        const original = fs.readFileSync(arquivo);
        const alterado = Buffer.from('X'.repeat(original.length));
        fs.writeFileSync(arquivo, alterado);
        assert.throws(() => validarPacote(destino), /divergente|hash/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('rejeita manifesto regenerado com conteudo nao autorizado', () => {
    const destino = criarPacoteTemporario();
    try {
        const arquivo = path.join(destino, 'dist', 'robots.txt');
        fs.writeFileSync(arquivo, 'X'.repeat(fs.readFileSync(arquivo).length));
        const manifesto = lerManifesto(destino);
        manifesto.static['robots.txt'] = hash(arquivo);
        escreverManifesto(destino, manifesto);
        assert.throws(() => validarPacote(destino), /divergente|hash/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('rejeita arquivo extra e arquivo ausente', () => {
    const extra = criarPacoteTemporario();
    try {
        fs.writeFileSync(path.join(extra, 'dist', 'extra.txt'), 'extra\n');
        assert.throws(() => validarPacote(extra), /Static B1/);
    } finally {
        fs.rmSync(extra, { recursive: true, force: true });
    }
    const ausente = criarPacoteTemporario();
    try {
        fs.rmSync(path.join(ausente, 'dist', 'b1.css'));
        assert.throws(() => validarPacote(ausente), /Static B1/);
    } finally {
        fs.rmSync(ausente, { recursive: true, force: true });
    }
});

test('rejeita caminho absoluto e traversal no manifesto', () => {
    for (const caminho of ['C:/Windows/system.ini', '../fora.txt']) {
        const destino = criarPacoteTemporario();
        try {
            const manifesto = lerManifesto(destino);
            manifesto.functions[caminho] = '0'.repeat(64);
            escreverManifesto(destino, manifesto);
            assert.throws(() => validarPacote(destino), /caminho|traversal/);
        } finally {
            fs.rmSync(destino, { recursive: true, force: true });
        }
    }
});

test('rejeita symlink fora do diretorio autorizado', (t) => {
    const destino = criarPacoteTemporario();
    try {
        const link = path.join(destino, 'dist', 'link.html');
        try {
            fs.symlinkSync(path.join(destino, 'dist', 'index.html'), link, 'file');
        } catch {
            t.skip('symlink nao suportado neste ambiente');
            return;
        }
        assert.throws(() => validarPacote(destino), /Symlink/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('publicacao oficial exige --confirm e nao publica sem validacao', () => {
    const script = path.join(B1_ROOT, 'scripts', 'deploy-b1.mjs');
    const result = spawnSync(process.execPath, [script], {
        cwd: B1_ROOT,
        encoding: 'utf8'
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /--check|--confirm/);
});


test('rejeita chave duplicada no manifesto', () => {
    const destino = criarPacoteTemporario();
    try {
        const arquivo = path.join(destino, 'package-manifest.json');
        const texto = fs.readFileSync(arquivo, 'utf8');
        const hashRobots = JSON.parse(texto).static['robots.txt'];
        fs.writeFileSync(
            arquivo,
            texto.replace(`"robots.txt": "${hashRobots}"`, `"robots.txt": "${hashRobots}", "robots.txt": "${hashRobots}"`)
        );
        assert.throws(() => validarPacote(destino), /invalido|duplicada/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

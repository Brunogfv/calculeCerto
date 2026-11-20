import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { executarGate, parseAction, congelarPacote, liberarPacote } from '../scripts/deploy-b1.mjs';
import { criarPacote, validarPacote } from '../scripts/artifact.mjs';

const MANIFEST = {
    version: 1,
    static: {},
    functions: {},
    edge_functions: {},
    config_sha256: '0'.repeat(64)
};

function criarFalso({ destino }) {
    fs.mkdirSync(destino, { recursive: true });
    return { dir: destino, manifest: MANIFEST };
}

test('nao publica quando o build falha', async () => {
    const chamadas = [];
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => { throw new Error('build falhou'); },
        criar: criarFalso,
        validar: () => {},
        congelar: () => {},
        deploy: () => chamadas.push('deploy')
    }), /build falhou/);
    assert.deepEqual(chamadas, []);
});

test('nao publica quando o empacotamento falha', async () => {
    const chamadas = [];
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: async () => { throw new Error('pacote falhou'); },
        validar: () => {},
        congelar: () => {},
        deploy: () => chamadas.push('deploy')
    }), /pacote falhou/);
    assert.deepEqual(chamadas, []);
});

test('nao publica quando a validacao inicial falha', async () => {
    const chamadas = [];
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: () => { throw new Error('contrato invalido'); },
        congelar: () => {},
        deploy: () => chamadas.push('deploy')
    }), /contrato invalido/);
    assert.deepEqual(chamadas, []);
});

test('nao publica quando a verificacao final falha', async () => {
    const chamadas = [];
    let validacoes = 0;
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: () => {
            validacoes += 1;
            if (validacoes === 2) throw new Error('hash mudou depois da validacao');
        },
        congelar: () => {},
        deploy: () => chamadas.push('deploy')
    }), /hash mudou/);
    assert.equal(validacoes, 2);
    assert.deepEqual(chamadas, []);
});

test('publica somente o diretorio que passou pela validacao final', async () => {
    let dirValidado;
    let dirPublicado;
    const resultado = await executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: (dir) => { dirValidado = dir; },
        congelar: () => {},
        deploy: ({ dir }) => { dirPublicado = dir; }
    });
    assert.equal(dirValidado, resultado.dir);
    assert.equal(dirPublicado, resultado.dir);
});

test('--check nao chama deploy', async () => {
    const chamadas = [];
    const resultado = await executarGate({
        action: 'check',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: () => {},
        congelar: () => {},
        deploy: () => chamadas.push('deploy')
    });
    assert.equal(resultado.status, 'validated_only');
    assert.deepEqual(chamadas, []);
});

test('deploy nao e chamado sem confirmacao ou com argumento desconhecido', () => {
    assert.throws(() => parseAction([]), /--check|--confirm/);
    assert.throws(() => parseAction(['--check', '--confirm']), /--check|--confirm/);
    assert.throws(() => parseAction(['--confirm', '--dir', 'outro']), /Argumento desconhecido/);
});

test('alteracao no pacote apos a primeira validacao e detectada', async () => {
    let publicado = false;
    const destino = path.join(process.env.TEMP || process.env.TMP || '/tmp', `b1-gate-mutacao-${process.pid}-${Date.now()}`);
    try {
        const pacote = criarPacote({ destino });
        await assert.rejects(() => executarGate({
            action: 'confirm',
            sync: async () => {},
            build: async () => {},
            criar: () => pacote,
            validar: validarPacote,
            congelar: (dir) => {
                const arquivo = path.join(dir, 'dist', 'robots.txt');
                const texto = fs.readFileSync(arquivo, 'utf8');
                fs.writeFileSync(arquivo, texto.replace(/./, texto[0] === 'X' ? 'Y' : 'X'));
                congelarPacote(dir);
            },
            deploy: () => { publicado = true; }
        }), /Static|hash|contrato|Manifesto/);
        assert.equal(publicado, false);
    } finally {
        try { liberarPacote(destino); } catch {}
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

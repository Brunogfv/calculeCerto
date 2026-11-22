import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { executarGate, parseAction, congelarPacote, liberarPacote, argumentosDeploy, adquirirTrava } from '../scripts/deploy-b1.mjs';
import { criarPacote, validarPacote, digestArtefato, validarHandoff } from '../scripts/artifact.mjs';

const MANIFEST = {
    version: 1,
    static: {},
    functions: {},
    edge_functions: {},
    config_sha256: '0'.repeat(64)
};
const DIGEST = '0'.repeat(64);
const INTEGRITY = { schema_version: 1, execution_id: 'test', gate: { status: 'validated_only' } };

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

test('publica somente o diretorio e o digest que passaram pela validacao final', async () => {
    let dirValidado;
    let dirPublicado;
    let digestPublicado;
    const resultado = await executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: (dir) => { dirValidado = dir; },
        congelar: () => {},
        digerir: () => DIGEST,
        integridade: () => INTEGRITY,
        deploy: ({ dir, digest }) => { dirPublicado = dir; digestPublicado = digest; }
    });
    assert.equal(dirValidado, resultado.dir);
    assert.equal(dirPublicado, resultado.dir);
    assert.equal(digestPublicado, resultado.digest);
    assert.equal(resultado.digest, DIGEST);
    assert.equal(resultado.integrity, INTEGRITY);
});

test('aborta quando o digest muda durante a selagem', async () => {
    let chamadas = 0;
    let publicado = false;
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarFalso,
        validar: () => {},
        congelar: () => {},
        digerir: () => chamadas++ === 0 ? DIGEST : 'f'.repeat(64),
        deploy: () => { publicado = true; }
    }), /mudou durante a selagem/);
    assert.equal(publicado, false);
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
        digerir: () => DIGEST,
        integridade: () => INTEGRITY,
        deploy: () => chamadas.push('deploy')
    });
    assert.equal(resultado.status, 'validated_only');
    assert.equal(resultado.integrity, INTEGRITY);
    assert.deepEqual(chamadas, []);
});

test('recusa segundo gate concorrente antes de preparar o pacote', async () => {
    const liberar = adquirirTrava();
    let preparou = false;
    try {
        await assert.rejects(() => executarGate({
            action: 'check',
            sync: async () => {},
            build: async () => {},
            criar: () => { preparou = true; return criarFalso({ destino: process.env.TEMP }); }
        }), /Outro gate B1/);
        assert.equal(preparou, false);
    } finally {
        liberar();
    }
});

test('deploy nao e chamado sem confirmacao ou com argumento desconhecido', () => {
    assert.throws(() => parseAction([]), /--check|--confirm/);
    assert.throws(() => parseAction(['--check', '--confirm']), /--check|--confirm/);
    assert.throws(() => parseAction(['--confirm', '--dir', 'outro']), /Argumento desconhecido/);
});

test('deploy usa somente dist e functions do pacote isolado', () => {
    const dir = path.join(process.env.TEMP || process.env.TMP || '/tmp', 'b1-argumentos');
    const args = argumentosDeploy(dir);
    assert.equal(args[0], 'deploy');
    assert.equal(args[args.indexOf('--dir') + 1], path.join(dir, 'dist'));
    assert.equal(args[args.indexOf('--functions') + 1], path.join(dir, 'netlify', 'functions'));
    assert.equal(args[args.indexOf('--site') + 1], '9cd7034f-5691-46af-8030-d70f7ed52ca7');
    assert.equal(args.includes('--prod'), false);
    assert.equal(args.join(' ').includes('validation-b1'), false);
});

test('digest identifica o conteudo e rejeita alteracao antes do handoff', () => {
    const destino = path.join(process.env.TEMP || process.env.TMP || '/tmp', `b1-digest-${process.pid}-${Date.now()}`);
    try {
        const pacote = criarPacote({ destino });
        const digest = digestArtefato(destino);
        assert.match(digest, /^[a-f0-9]{64}$/);
        assert.equal(validarHandoff({ dir: destino, digest }), digest);

        fs.writeFileSync(path.join(destino, 'dist', 'robots.txt'), 'User-agent: *\nDisallow: /\n# alterado\n');
        assert.throws(() => validarHandoff({ dir: destino, digest }), /divergente|Manifesto|hash/);
    } finally {
        fs.rmSync(destino, { recursive: true, force: true });
    }
});

test('rejeita exclusao, inclusao e substituicao antes do handoff', () => {
    const mutacoes = [
        (dir) => fs.rmSync(path.join(dir, 'dist', 'robots.txt')),
        (dir) => fs.writeFileSync(path.join(dir, 'dist', 'extra.txt'), 'extra\n'),
        (dir) => fs.writeFileSync(path.join(dir, 'dist', 'index.html'), 'substituido\n'),
        (dir) => {
            const arquivo = path.join(dir, 'package-manifest.json');
            const manifesto = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
            manifesto.static['robots.txt'] = 'f'.repeat(64);
            fs.writeFileSync(arquivo, `${JSON.stringify(manifesto, null, 2)}\n`);
        }
    ];
    for (const [indice, mutar] of mutacoes.entries()) {
        const destino = path.join(
            process.env.TEMP || process.env.TMP || '/tmp',
            `b1-handoff-${process.pid}-${Date.now()}-${indice}`
        );
        try {
            criarPacote({ destino });
            const digest = digestArtefato(destino);
            mutar(destino);
            assert.throws(() => validarHandoff({ dir: destino, digest }), /divergente|Manifesto|hash|Static|Functions|Edge/);
        } finally {
            fs.rmSync(destino, { recursive: true, force: true });
        }
    }
});

test('rejeita reutilizacao de digest de outro pacote', () => {
    const destinoA = path.join(process.env.TEMP || process.env.TMP || '/tmp', `b1-digest-a-${process.pid}-${Date.now()}`);
    const destinoB = path.join(process.env.TEMP || process.env.TMP || '/tmp', `b1-digest-b-${process.pid}-${Date.now()}`);
    try {
        criarPacote({ destino: destinoA });
        criarPacote({ destino: destinoB });
        fs.appendFileSync(path.join(destinoB, 'dist', 'b1.css'), '\n');
        const digestA = digestArtefato(destinoA);
        assert.throws(() => validarHandoff({ dir: destinoB, digest: digestA }), /divergente|Manifesto|hash/);
    } finally {
        fs.rmSync(destinoA, { recursive: true, force: true });
        fs.rmSync(destinoB, { recursive: true, force: true });
    }
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

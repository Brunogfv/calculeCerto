import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    B1_TARGET,
    KNOWN_FORBIDDEN_SITE_IDS,
    ambienteDeploy,
    argumentosDeploy,
    validarArgumentosDeploy,
    validarDestinoB1,
    validarRespostaDeploy
} from '../scripts/deploy-target.mjs';
import {
    executarGate,
    montarDeploy
} from '../scripts/deploy-b1.mjs';
import {
    criarPacote,
    validarPacote,
    digestArtefato,
    criarManifestoIntegridade
} from '../scripts/artifact.mjs';
import { congelarPacote, limparStaging } from '../scripts/deploy-b1.mjs';

const SAFE_ENV = Object.freeze({ PATH: process.env.PATH || '' });

function pacoteTemporario() {
    const destino = path.join(os.tmpdir(), `b1-deploy-sim-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}`);
    const { dir } = criarPacote({ destino });
    return { destino, dir, digest: digestArtefato(dir) };
}

test('deployNetlify nao e exportado como caminho direto', async () => {
    const modulo = await import('../scripts/deploy-b1.mjs');
    assert.equal(Object.prototype.hasOwnProperty.call(modulo, 'deployNetlify'), false);
});

test('destino B1 e rejeitado para IDs, dominio ou team divergentes', () => {
    assert.equal(validarDestinoB1()?.siteId, B1_TARGET.siteId);
    for (const item of KNOWN_FORBIDDEN_SITE_IDS) {
        assert.throws(() => validarDestinoB1({ ...B1_TARGET, siteId: item.siteId }), /Site ID/);
    }
    assert.throws(() => validarDestinoB1({ ...B1_TARGET, domain: 'portaldascontas.com.br' }), /Dominio/);
    assert.throws(() => validarDestinoB1({ ...B1_TARGET, teamId: '000000000000000000000000' }), /Team/);
    assert.throws(() => validarDestinoB1({ ...B1_TARGET, name: 'outro-site' }), /Nome/);
});

test('ambiente de deploy e allowlist e rejeita endpoints e destino herdados', () => {
    const permitido = ambienteDeploy({ PATH: 'x', TEMP: 'y', NETLIFY_AUTH_TOKEN: 'token-sintetico' });
    assert.deepEqual(Object.keys(permitido).sort(), ['NETLIFY_AUTH_TOKEN', 'PATH', 'TEMP']);
    for (const nome of [
        'NETLIFY_API_URL',
        'NETLIFY_SITE_ID',
        'NETLIFY_CONFIG',
        'NETLIFY_FUNCTIONS_DIR',
        'NETLIFY_EDGE_FUNCTIONS_DIR',
        'CONTEXT',
        'NODE_OPTIONS',
        'HTTP_PROXY',
        'HTTPS_PROXY'
    ]) {
        assert.throws(() => ambienteDeploy({ ...SAFE_ENV, [nome]: 'x' }), /proibida|nao autorizada/);
    }
    assert.equal(JSON.stringify(permitido).includes('token-sintetico'), true);
});

test('argumentos do CLI sao allowlist e bloqueiam publicacao', () => {
    const dir = path.join(os.tmpdir(), 'b1-args');
    const args = argumentosDeploy(dir);
    assert.equal(validarArgumentosDeploy(args, dir), true);
    assert.equal(args.includes('--skip-functions-cache'), true);
    assert.equal(args.includes('--context'), false);
    assert.equal(args.includes('--draft'), true);
    assert.equal(args.includes('--prod'), false);

    for (const extra of ['--prod', '--prod-if-unlocked', '--remote', '--filter', '--context', '--env', '--secret-env', '--trigger', '--auth', '-p']) {
        assert.throws(() => validarArgumentosDeploy([...args, extra], dir), /nao permitido|Alias curto|duplicado/);
    }
    for (const proibido of ['--prod', '--prod-if-unlocked', '--remote']) {
        const alterado = args.filter((item) => item !== 'deploy');
        assert.throws(() => validarArgumentosDeploy([proibido, ...alterado], dir), /Comando de deploy invalido|nao permitido/);
    }

    const trocaSite = [...args];
    trocaSite[trocaSite.indexOf('--site') + 1] = '273101e3-7a01-4931-aeaf-4cee4fe74f07';
    assert.throws(() => validarArgumentosDeploy(trocaSite, dir), /Valor nao autorizado/);

    const trocaDir = [...args];
    trocaDir[trocaDir.indexOf('--dir') + 1] = path.join(dir, 'outro');
    assert.throws(() => validarArgumentosDeploy(trocaDir, dir), /Valor nao autorizado/);

    const trocaFunctions = [...args];
    trocaFunctions[trocaFunctions.indexOf('--functions') + 1] = path.join(dir, 'outro');
    assert.throws(() => validarArgumentosDeploy(trocaFunctions, dir), /Valor nao autorizado/);

    const semCache = args.filter((item) => item !== '--skip-functions-cache');
    assert.throws(() => validarArgumentosDeploy(semCache, dir), /Flag obrigatoria/);
});

test('montarDeploy prepara comando sem invocar CLI e usa o mesmo digest', () => {
    const pacote = pacoteTemporario();
    try {
        const comando = montarDeploy({ dir: pacote.dir, digest: pacote.digest, env: SAFE_ENV });
        assert.equal(comando.bin, process.execPath);
        assert.match(comando.args[0], /netlify-cli[\\/]bin[\\/]run\.js$/);
        assert.equal(comando.args[1], 'deploy');
        assert.equal(comando.cwd, pacote.dir);
        assert.equal(comando.shell, false);
        assert.equal(comando.cliArgs.includes('--prod'), false);
        assert.equal(comando.cliArgs.includes('--skip-functions-cache'), true);
        assert.equal(Object.prototype.hasOwnProperty.call(comando.env, 'NETLIFY_API_URL'), false);
        assert.equal(comando.env.NETLIFY_AUTH_TOKEN, undefined);

        assert.throws(
            () => montarDeploy({ dir: pacote.dir, digest: 'f'.repeat(64), env: SAFE_ENV }),
            /divergente|hash|Manifesto/
        );
    } finally {
        fs.rmSync(pacote.destino, { recursive: true, force: true });
    }
});

test('simulacao integral do gate usa mock e nao chama CLI real', async () => {
    const chamadas = [];
    let resposta;
    resposta = await executarGate({
            action: 'confirm',
            sync: async () => {},
            build: async () => {},
            criar: criarPacote,
            validar: validarPacote,
            congelar: congelarPacote,
            digerir: digestArtefato,
            integridade: criarManifestoIntegridade,
            deploy: ({ dir, digest, siteId }) => {
                const comando = montarDeploy({ dir, digest, env: SAFE_ENV });
                chamadas.push({ dir, digest, siteId, comando });
                const simulado = {
                    deploy_id: 'deploy-mock-b1',
                    site_id: siteId,
                    context: 'deploy-preview',
                    published_at: null,
                    url: `https://${B1_TARGET.domain}`
                };
                assert.deepEqual(validarRespostaDeploy(simulado), {
                    deployId: 'deploy-mock-b1',
                    siteId: B1_TARGET.siteId,
                    context: 'deploy-preview',
                    publishedAt: null
                });
                return simulado;
            }
        });

    assert.equal(resposta.status, 'deployed');
    assert.equal(chamadas.length, 1);
    assert.equal(chamadas[0].siteId, B1_TARGET.siteId);
    assert.equal(chamadas[0].comando.cliArgs.includes('--prod'), false);
    assert.equal(chamadas[0].comando.cliArgs.includes('--skip-functions-cache'), true);
    assert.equal(chamadas[0].dir, path.resolve(chamadas[0].dir));
    assert.equal(chamadas[0].dir, chamadas[0].comando.cwd);
});

test('falha do mock CLI nao deixa autorizacao parcial', async () => {
    let chamadas = 0;
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarPacote,
        validar: validarPacote,
        congelar: congelarPacote,
        digerir: digestArtefato,
        integridade: criarManifestoIntegridade,
        deploy: () => {
            chamadas += 1;
            throw new Error('mock CLI falhou');
        }
    }), /mock CLI falhou/);
    assert.equal(chamadas, 1);
});

test('resposta simulada sem ID, site, contexto ou URL B1 e rejeitada', () => {
    assert.throws(() => validarRespostaDeploy({ site_id: B1_TARGET.siteId }), /identificador/);
    assert.throws(() => validarRespostaDeploy({ deploy_id: 'd', site_id: '273101e3-7a01-4931-aeaf-4cee4fe74f07' }), /site B1/);
    assert.throws(() => validarRespostaDeploy({ deploy_id: 'd', site_id: B1_TARGET.siteId, context: 'production' }), /contexto/);
    assert.throws(() => validarRespostaDeploy({ deploy_id: 'd', site_id: B1_TARGET.siteId, published_at: '2026-11-20T00:00:00Z' }), /publicacao/);
    assert.throws(() => validarRespostaDeploy({ deploy_id: 'd', site_id: B1_TARGET.siteId, url: 'https://portaldascontas.com.br' }), /URL/);
});

test('gate recusa ambiente proibido antes de qualquer mock de CLI', async () => {
    let chamadas = 0;
    await assert.rejects(() => executarGate({
        action: 'confirm',
        sync: async () => {},
        build: async () => {},
        criar: criarPacote,
        validar: validarPacote,
        congelar: congelarPacote,
        digerir: digestArtefato,
        integridade: criarManifestoIntegridade,
        deploy: ({ dir, digest }) => {
            chamadas += 1;
            montarDeploy({ dir, digest, env: { ...SAFE_ENV, NETLIFY_API_URL: 'https://exemplo.invalid' } });
        }
    }), /Variavel de ambiente proibida|NETLIFY_API_URL/);
    assert.equal(chamadas, 1);
});
test('limparStaging remove somente o diretorio explicito e reporta sucesso', () => {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'b1-cleanup-'));
    const arquivo = path.join(base, 'arquivo.txt');
    fs.writeFileSync(arquivo, 'conteudo');
    const resultado = limparStaging(base);
    assert.equal(resultado.removed, true);
    assert.equal(fs.existsSync(base), false);
});
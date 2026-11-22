import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
    criarPacote,
    validarPacote,
    digestArtefato,
    validarHandoff,
    criarManifestoIntegridade
} from './artifact.mjs';
import {
    B1_TARGET,
    argumentosDeploy,
    validarArgumentosDeploy,
    validarDestinoB1,
    ambienteDeploy
} from './deploy-target.mjs';

export { argumentosDeploy } from './deploy-target.mjs';
export const SITE_ID = B1_TARGET.siteId;
export const NETLIFY_CLI_VERSION = '27.20.0';
export const GATE_LOCK_PATH = path.join(os.tmpdir(), 'portal-contas-b1-gate.lock');
const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function adquirirTrava(caminho = GATE_LOCK_PATH) {
    let descritor;
    try {
        descritor = fs.openSync(caminho, 'wx');
        fs.writeFileSync(descritor, JSON.stringify({
            pid: process.pid,
            started_at: new Date().toISOString()
        }));
    } catch (erro) {
        if (erro.code === 'EEXIST') {
            throw new Error('Outro gate B1 esta em execucao; lock de operacao ativo.');
        }
        throw erro;
    }
    return () => {
        try { fs.closeSync(descritor); } catch {}
        fs.rmSync(caminho, { force: true });
    };
}

function caminhar(pacote, visitar) {
    const entradas = fs.readdirSync(pacote, { withFileTypes: true });
    for (const entry of entradas) {
        const arquivo = path.join(pacote, entry.name);
        if (entry.isSymbolicLink()) throw new Error(`Symlink proibido no pacote: ${entry.name}`);
        if (entry.isDirectory()) {
            caminhar(arquivo, visitar);
            visitar(arquivo, true);
        } else {
            visitar(arquivo, false);
        }
    }
}

export function congelarPacote(pacote) {
    caminhar(pacote, (arquivo, diretorio) => {
        fs.chmodSync(arquivo, diretorio ? 0o555 : 0o444);
    });
    fs.chmodSync(pacote, 0o555);
}

export function liberarPacote(pacote) {
    if (!fs.existsSync(pacote)) return;
    fs.chmodSync(pacote, 0o755);
    caminhar(pacote, (arquivo, diretorio) => {
        fs.chmodSync(arquivo, diretorio ? 0o755 : 0o644);
    });
}

export function limparStaging(pacote, remover = liberarPacote) {
    if (!pacote) return { removed: true, path: null };
    let erroLiberacao = null;
    try {
        remover(pacote);
    } catch (erro) {
        erroLiberacao = erro?.code || erro?.message || 'unknown';
    }
    try {
        fs.rmSync(pacote, { recursive: true, force: true });
        return { removed: true, path: pacote, liberacao_erro: erroLiberacao };
    } catch (erro) {
        return {
            removed: false,
            path: pacote,
            error: erro?.code || erro?.message || 'unknown',
            liberacao_erro: erroLiberacao
        };
    }
}

function binarioNetlify() {
    const cli = path.join(B1, 'node_modules', 'netlify-cli', 'bin', 'run.js');
    if (!fs.existsSync(cli)) {
        throw new Error(`Netlify CLI ${NETLIFY_CLI_VERSION} nao instalado em node_modules/netlify-cli/bin/run.js.`);
    }
    const pacoteCli = path.join(B1, 'node_modules', 'netlify-cli', 'package.json');
    if (!fs.existsSync(pacoteCli)) throw new Error('Pacote netlify-cli local nao encontrado.');
    const versao = JSON.parse(fs.readFileSync(pacoteCli, 'utf8')).version;
    if (versao !== NETLIFY_CLI_VERSION) {
        throw new Error(`Netlify CLI ${versao} diverge da versao fixada ${NETLIFY_CLI_VERSION}.`);
    }
    return { bin: process.execPath, prefix: [cli] };
}

export function montarDeploy({ dir, digest, env = process.env } = {}) {
    validarDestinoB1();
    if (!dir || !path.isAbsolute(dir)) throw new Error('Diretorio de deploy deve ser absoluto.');
    const alvo = path.resolve(dir);
    const real = fs.realpathSync(alvo);
    if (real !== alvo) throw new Error('Diretorio de deploy e symlink ou caminho nao canonico.');
    for (const caminho of [path.join(alvo, 'dist'), path.join(alvo, 'netlify', 'functions')]) {
        if (!fs.existsSync(caminho)) throw new Error(`Diretorio de deploy ausente: ${caminho}`);
    }
    const args = argumentosDeploy(alvo);
    validarArgumentosDeploy(args, alvo);
    validarHandoff({ dir: alvo, digest });
    const ambiente = ambienteDeploy(env);
    const executavel = binarioNetlify();
    return {
        bin: executavel.bin,
        args: [...executavel.prefix, ...args],
        cliArgs: args,
        cwd: alvo,
        env: ambiente,
        shell: false
    };
}

function deployNetlify({ dir, digest }) {
    const comando = montarDeploy({ dir, digest });
    const resultado = spawnSync(comando.bin, comando.args, {
        cwd: comando.cwd,
        stdio: 'inherit',
        env: comando.env,
        shell: comando.shell
    });
    if (resultado.status !== 0) throw new Error('Deploy B1 falhou.');
}

function executarScript(script, args = []) {
    const resultado = spawnSync(process.execPath, [path.join(B1, 'scripts', script), ...args], {
        cwd: B1,
        stdio: 'inherit',
        env: process.env
    });
    if (resultado.status !== 0) throw new Error(`${script} falhou.`);
}

async function criarPacoteComFunctions({ destino }) {
    const runtime = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-contas-b1-runtime-'));
    try {
        executarScript('prepare-runtime-deps.mjs', [runtime]);
        return criarPacote({ destino, runtimeDeps: runtime });
    } finally {
        fs.rmSync(runtime, { recursive: true, force: true });
    }
}

function validarPacoteComFunctions(dir) {
    validarPacote(dir);
}

export async function executarGate({
    action,
    sync = () => executarScript('sync-shared.mjs'),
    build = () => executarScript('build.mjs'),
    criar = criarPacoteComFunctions,
    validar = validarPacoteComFunctions,
    congelar = congelarPacote,
    digerir = digestArtefato,
    integridade = criarManifestoIntegridade,
    deploy = deployNetlify,
    remover = liberarPacote
} = {}) {
    if (!['check', 'confirm'].includes(action)) {
        throw new Error('Use --check ou --confirm.');
    }

    const liberarTrava = adquirirTrava();
    let stage;
    let resultado;
    let falha;
    try {
        stage = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-contas-b1-deploy-'));
        await sync();
        await build();
        const { dir, manifest } = await criar({ destino: stage });

        // Primeira validaÃƒÂ§ÃƒÂ£o: conteÃƒÂºdo real x contrato independente.
        validar(dir);
        congelar(dir);
        // Verificacao final: o mesmo diretorio congelado deve continuar valido.
        validar(dir);
        const digest = digerir(dir);
        if (digerir(dir) !== digest) {
            throw new Error('Artefato mudou durante a selagem.');
        }

        let integridadeGerada;
        if (action === 'confirm') {
            deploy({ dir, siteId: SITE_ID, digest });
            integridadeGerada = integridade({
                dir,
                digest,
                siteId: SITE_ID,
                status: 'deployed'
            });
        } else {
            integridadeGerada = integridade({
                dir,
                digest,
                siteId: SITE_ID,
                status: 'validated_only'
            });
        }

        resultado = {
            status: action === 'check' ? 'validated_only' : 'deployed',
            dir,
            digest,
            integrity: integridadeGerada,
            manifest
        };
        return resultado;
    } catch (erro) {
        falha = erro;
        throw erro;
    } finally {
        const limpeza = limparStaging(stage, remover);
        try {
            liberarTrava();
        } catch (erroTrava) {
            if (falha) falha.trava = erroTrava?.code || erroTrava?.message || 'unknown';
            else console.error(`Trava B1 nao liberada: ${erroTrava?.code || erroTrava?.message || 'unknown'}`);
        }
        if (resultado) resultado.staging = limpeza;
        if (!limpeza.removed) {
            if (falha) falha.limpeza = limpeza;
            if (resultado) {
                resultado.status = action === 'confirm'
                    ? 'deployed_staging_retained'
                    : 'validated_staging_retained';
            }
            console.error(`Staging B1 retido: ${limpeza.path} (${limpeza.error})`);
        }
    }
}

export function parseAction(argv) {
    const args = argv ?? process.argv.slice(2);
    const permitidos = new Set(['--check', '--confirm']);
    const desconhecidos = args.filter((arg) => !permitidos.has(arg));
    if (desconhecidos.length) throw new Error(`Argumento desconhecido: ${desconhecidos.join(' ')}`);
    if (args.includes('--check') && args.includes('--confirm')) {
        throw new Error('Use apenas --check ou --confirm, nao ambos.');
    }
    if (args.includes('--check')) return 'check';
    if (args.includes('--confirm')) return 'confirm';
    throw new Error('Use --check para validar ou --confirm para publicar um preview B1.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    try {
        const action = parseAction();
        executarGate({ action })
            .then((resultado) => {
                const { manifest } = resultado;
                console.log(JSON.stringify({
                    status: resultado.status,
                    artifact_sha256: resultado.digest,
                    static_files: Object.keys(manifest.static).length,
                    functions: Object.keys(manifest.functions).length,
                    edge_functions: Object.keys(manifest.edge_functions).length,
                    redirects: 0,
                    integrity_manifest: resultado.integrity
                }, null, 2));
            })
            .catch((erro) => {
                console.error(`Deploy B1 bloqueado: ${erro.message}`);
                process.exitCode = 1;
            });
    } catch (erro) {
        console.error(`Deploy B1 bloqueado: ${erro.message}`);
        process.exitCode = 2;
    }
}



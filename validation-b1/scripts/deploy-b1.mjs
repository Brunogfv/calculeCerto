import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { criarPacote, validarPacote } from './artifact.mjs';

export const SITE_ID = '9cd7034f-5691-46af-8030-d70f7ed52ca7';
export const NETLIFY_CLI_VERSION = '27.20.0';
const B1 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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

function binarioNetlify() {
    const bin = path.join(B1, 'node_modules', '.bin', process.platform === 'win32' ? 'netlify.cmd' : 'netlify');
    if (!fs.existsSync(bin)) {
        throw new Error(`Netlify CLI ${NETLIFY_CLI_VERSION} nao instalado em node_modules/.bin/netlify.`);
    }
    const pacoteCli = path.join(B1, 'node_modules', 'netlify-cli', 'package.json');
    if (!fs.existsSync(pacoteCli)) throw new Error('Pacote netlify-cli local nao encontrado.');
    const versao = JSON.parse(fs.readFileSync(pacoteCli, 'utf8')).version;
    if (versao !== NETLIFY_CLI_VERSION) {
        throw new Error(`Netlify CLI ${versao} diverge da versao fixada ${NETLIFY_CLI_VERSION}.`);
    }
    return bin;
}

export function deployNetlify({ dir }) {
    const resultado = spawnSync(binarioNetlify(), [
        'deploy',
        '--dir', path.join(dir, 'dist'),
        '--site', SITE_ID,
        '--no-build',
        '--message', 'Fase 5F.24 preview B1 validado'
    ], {
        cwd: dir,
        stdio: 'inherit',
        env: process.env,
        shell: process.platform === 'win32'
    });
    if (resultado.status !== 0) throw new Error('Deploy B1 falhou.');
}

function executarScript(script) {
    const resultado = spawnSync(process.execPath, [path.join(B1, 'scripts', script)], {
        cwd: B1,
        stdio: 'inherit',
        env: process.env
    });
    if (resultado.status !== 0) throw new Error(`${script} falhou.`);
}

export async function executarGate({
    action,
    sync = () => executarScript('sync-shared.mjs'),
    build = () => executarScript('build.mjs'),
    criar = criarPacote,
    validar = validarPacote,
    congelar = congelarPacote,
    deploy = deployNetlify,
    remover = liberarPacote
} = {}) {
    if (!['check', 'confirm'].includes(action)) {
        throw new Error('Use --check ou --confirm.');
    }

    const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-contas-b1-deploy-'));
    try {
        await sync();
        await build();
        const { dir, manifest } = await criar({ destino: stage });

        // Primeira validação: conteúdo real x contrato independente.
        validar(dir);
        congelar(dir);
        // Verificação final: o mesmo diretório congelado deve continuar válido.
        validar(dir);

        if (action === 'confirm') {
            deploy({ dir, siteId: SITE_ID });
        }

        return {
            status: action === 'check' ? 'validated_only' : 'deployed',
            dir,
            manifest
        };
    } finally {
        try {
            remover(stage);
        } finally {
            fs.rmSync(stage, { recursive: true, force: true });
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
                    static_files: Object.keys(manifest.static).length,
                    functions: Object.keys(manifest.functions).length,
                    edge_functions: Object.keys(manifest.edge_functions).length,
                    redirects: 0
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

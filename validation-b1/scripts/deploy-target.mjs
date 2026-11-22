import path from 'node:path';

export const B1_TARGET = Object.freeze({
    siteId: '9cd7034f-5691-46af-8030-d70f7ed52ca7',
    name: 'portal-contas-validation-b1',
    domain: 'portal-contas-validation-b1.netlify.app',
    teamId: '697d58587a017c3396fb416e',
    teamName: 'BruMiTa'
});

export const KNOWN_FORBIDDEN_SITE_IDS = Object.freeze([
    { siteId: '273101e3-7a01-4931-aeaf-4cee4fe74f07', label: 'producao historica' },
    { siteId: '3da70f72-70f7-4883-b60b-25b430cc9270', label: 'homologacao historica' }
]);

const ALLOWED_ENV = new Set([
    'PATH', 'Path', 'PATHEXT', 'SystemRoot', 'ComSpec',
    'TEMP', 'TMP', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA',
    'HOMEDRIVE', 'HOMEPATH', 'USER', 'USERNAME',
    'LANG', 'LC_ALL', 'TERM',
    'XDG_CONFIG_HOME', 'XDG_CACHE_HOME', 'XDG_DATA_HOME',
    'NETLIFY_AUTH_TOKEN'
]);

const FORBIDDEN_ENV = new Set([
    'NETLIFY_API_URL',
    'NETLIFY_SITE_ID',
    'NETLIFY_CONFIG',
    'NETLIFY_FUNCTIONS_DIR',
    'NETLIFY_EDGE_FUNCTIONS_DIR',
    'CONTEXT',
    'NODE_OPTIONS',
    'NODE_EXTRA_CA_CERTS',
    'HTTP_PROXY',
    'HTTPS_PROXY',
    'NO_PROXY'
]);

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DEPLOY_MESSAGE = 'Fase 5F.43 preview B1 isolado';

export function validarDestinoB1(target = B1_TARGET) {
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
        throw new Error('Destino B1 ausente ou invalido.');
    }
    if (!UUID_RE.test(String(target.siteId || ''))) {
        throw new Error('Site ID B1 ausente ou invalido.');
    }
    if (target.siteId !== B1_TARGET.siteId) {
        throw new Error('Site ID nao corresponde ao B1 esperado.');
    }
    if (KNOWN_FORBIDDEN_SITE_IDS.some((item) => item.siteId === target.siteId)) {
        throw new Error('Site ID de producao/homologacao proibido para este fluxo.');
    }
    if (target.name !== B1_TARGET.name) throw new Error('Nome do site B1 invalido.');
    if (target.domain !== B1_TARGET.domain) throw new Error('Dominio do site B1 invalido.');
    if (target.teamId !== B1_TARGET.teamId) throw new Error('Team ID do site B1 invalido.');
    if (target.teamName !== B1_TARGET.teamName) throw new Error('Team nome do site B1 invalido.');
    return B1_TARGET;
}

export function ambienteDeploy(env = process.env) {
    if (!env || typeof env !== 'object') throw new Error('Ambiente de deploy ausente ou invalido.');
    for (const nome of Object.keys(env)) {
        if (FORBIDDEN_ENV.has(nome)) {
            throw new Error(`Variavel de ambiente proibida no deploy: ${nome}`);
        }
        if (nome.startsWith('NETLIFY_') && nome !== 'NETLIFY_AUTH_TOKEN') {
            throw new Error(`Variavel NETLIFY_ nao autorizada: ${nome}`);
        }
    }
    const resultado = {};
    for (const nome of ALLOWED_ENV) {
        if (Object.prototype.hasOwnProperty.call(env, nome)) resultado[nome] = env[nome];
    }
    return resultado;
}

export function argumentosDeploy(dir) {
    return [
        'deploy',
        '--dir', path.join(dir, 'dist'),
        '--functions', path.join(dir, 'netlify', 'functions'),
        '--site', B1_TARGET.siteId,
        '--no-build',
        '--draft',
        '--skip-functions-cache',
        '--message', DEPLOY_MESSAGE
    ];
}

export function validarArgumentosDeploy(args, dir) {
    if (!Array.isArray(args) || args.length === 0) throw new Error('Argumentos de deploy ausentes.');
    if (args[0] !== 'deploy') throw new Error('Comando de deploy invalido.');
    const esperados = new Map([
        ['--dir', path.join(dir, 'dist')],
        ['--functions', path.join(dir, 'netlify', 'functions')],
        ['--site', B1_TARGET.siteId],
        ['--message', DEPLOY_MESSAGE]
    ]);
    const flags = new Set(['--no-build', '--draft', '--skip-functions-cache']);
    const vistos = new Set();
    for (let i = 1; i < args.length; i += 1) {
        const arg = args[i];
        if (typeof arg !== 'string' || !arg) throw new Error('Argumento de deploy invalido.');
        if (arg.startsWith('-') && !arg.startsWith('--')) {
            throw new Error(`Alias curto nao permitido no deploy: ${arg}`);
        }
        if (flags.has(arg)) {
            if (vistos.has(arg)) throw new Error(`Argumento duplicado: ${arg}`);
            vistos.add(arg);
            continue;
        }
        if (!esperados.has(arg)) {
            throw new Error(`Argumento nao permitido no deploy: ${arg}`);
        }
        if (vistos.has(arg)) throw new Error(`Argumento duplicado: ${arg}`);
        const valor = args[i + 1];
        if (typeof valor !== 'string' || valor.startsWith('--')) {
            throw new Error(`Valor ausente para ${arg}.`);
        }
        if (valor !== esperados.get(arg)) {
            throw new Error(`Valor nao autorizado para ${arg}.`);
        }
        vistos.add(arg);
        i += 1;
    }
    for (const arg of esperados.keys()) {
        if (!vistos.has(arg)) throw new Error(`Argumento obrigatorio ausente: ${arg}`);
    }
    for (const flag of flags) {
        if (!vistos.has(flag)) throw new Error(`Flag obrigatoria ausente: ${flag}`);
    }
    return true;
}

export function validarRespostaDeploy(resposta) {
    if (!resposta || typeof resposta !== 'object' || Array.isArray(resposta)) {
        throw new Error('Resposta do deploy ausente ou invalida.');
    }
    const deployId = resposta.deploy_id || resposta.id;
    if (typeof deployId !== 'string' || !deployId.trim()) {
        throw new Error('Resposta do deploy sem identificador.');
    }
    if (resposta.site_id !== B1_TARGET.siteId) {
        throw new Error('Resposta do deploy nao identifica o site B1 esperado.');
    }
    if (resposta.context && resposta.context !== 'deploy-preview') {
        throw new Error('Resposta do deploy nao esta no contexto deploy-preview.');
    }
    if (resposta.published_at) {
        throw new Error('Resposta do deploy indica publicacao; draft esperado.');
    }
    if (resposta.url) {
        let host;
        try { host = new URL(resposta.url).hostname; } catch { throw new Error('URL do deploy invalida.'); }
        if (host !== B1_TARGET.domain && !host.endsWith(`--${B1_TARGET.domain}`)) {
            throw new Error('URL do deploy nao pertence ao B1 esperado.');
        }
    }
    return {
        deployId: String(deployId),
        siteId: B1_TARGET.siteId,
        context: 'deploy-preview',
        publishedAt: null
    };
}



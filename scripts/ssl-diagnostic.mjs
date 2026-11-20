import fs from 'node:fs';
import tls from 'node:tls';
import { pathToFileURL } from 'node:url';
import pg from 'pg';

const { Client } = pg;
const EXPECTED_DATABASE = 'validation_b1';
const EXPECTED_ROLE = 'validation_b1_cleanup';

export function parseCleanupUrl(valor = process.env.CLEANUP_DATABASE_URL, env = process.env) {
    if (!valor) throw new Error('CLEANUP_DATABASE_URL ausente; nao usar DATABASE_URL como fallback.');

    let url;
    try {
        url = new URL(valor);
    } catch {
        throw new Error('CLEANUP_DATABASE_URL nao e uma URL valida.');
    }

    if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
        throw new Error('CLEANUP_DATABASE_URL precisa ser PostgreSQL.');
    }
    if (url.searchParams.get('sslmode') !== 'verify-full') {
        throw new Error('CLEANUP_DATABASE_URL precisa usar sslmode=verify-full.');
    }
    if (url.searchParams.has('uselibpqcompat')) {
        throw new Error('CLEANUP_DATABASE_URL nao pode usar uselibpqcompat.');
    }
    if (['0', 'false', 'disable'].includes(url.searchParams.get('ssl') || '')) {
        throw new Error('CLEANUP_DATABASE_URL nao pode desativar SSL.');
    }

    const host = url.hostname.toLowerCase();
    const database = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
    const role = decodeURIComponent(url.username);
    const port = Number(url.port || 5432);
    const expectedDatabase = env.CLEANUP_EXPECTED_DATABASE || EXPECTED_DATABASE;
    const expectedRole = env.CLEANUP_EXPECTED_ROLE || EXPECTED_ROLE;
    const expectedHost = env.CLEANUP_EXPECTED_HOST?.trim().toLowerCase();

    if (!host || host.includes('-pooler') || host.includes('pooler.')) {
        throw new Error('CLEANUP_DATABASE_URL precisa apontar para conexao direta sem pooler.');
    }
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('Porta PostgreSQL invalida.');
    }
    if (database !== expectedDatabase) {
        throw new Error(`Banco da limpeza inesperado: ${database}.`);
    }
    if (role !== expectedRole) {
        throw new Error(`Role da limpeza inesperada: ${role}.`);
    }
    if (expectedHost && host !== expectedHost) {
        throw new Error(`Host da limpeza inesperado: ${host}.`);
    }

    return { host, port, database, role };
}

function opcoesTls(url, env) {
    const caminhoCa = url.searchParams.get('sslrootcert');
    return {
        host: url.hostname,
        port: Number(url.port || 5432),
        servername: url.hostname,
        rejectUnauthorized: true,
        ...(caminhoCa ? { ca: fs.readFileSync(caminhoCa) } : {}),
        ...(env.SSL_DIAGNOSTIC_TIMEOUT_MS
            ? { timeout: Number(env.SSL_DIAGNOSTIC_TIMEOUT_MS) }
            : {})
    };
}

function tlsHandshake(options) {
    return new Promise((resolve, reject) => {
        const socket = tls.connect(options, () => {
            const cert = socket.getPeerCertificate();
            const resultado = {
                authorized: socket.authorized,
                authorizationError: socket.authorizationError || null,
                protocol: socket.getProtocol(),
                servername: options.servername,
                certificate: {
                    subject: cert?.subject || null,
                    issuer: cert?.issuer || null,
                    validFrom: cert?.valid_from || null,
                    validTo: cert?.valid_to || null,
                    fingerprint256: cert?.fingerprint256 || null
                }
            };
            socket.end();
            if (!socket.authorized) {
                reject(new Error(`TLS nao autorizado: ${socket.authorizationError || 'certificado invalido'}`));
                return;
            }
            resolve(resultado);
        });
        socket.on('error', (erro) => reject(new Error(`TLS handshake falhou: ${erro.code || 'erro'}`)));
        socket.setTimeout(Number(options.timeout || 10_000), () => {
            socket.destroy();
            reject(new Error('TLS handshake excedeu o timeout.'));
        });
    });
}

export async function executarDiagnostico(env = process.env, deps = {}) {
    const raw = env.CLEANUP_DATABASE_URL;
    const seguro = parseCleanupUrl(raw, env);
    const url = new URL(raw);
    const tlsResult = await (deps.tlsHandshake || tlsHandshake)(opcoesTls(url, env));

    const client = new Client({
        host: seguro.host,
        port: seguro.port,
        database: seguro.database,
        user: seguro.role,
        password: decodeURIComponent(url.password),
        ssl: {
            rejectUnauthorized: true,
            servername: seguro.host,
            ...(url.searchParams.get('sslrootcert')
                ? { ca: fs.readFileSync(url.searchParams.get('sslrootcert')) }
                : {})
        }
    });

    await client.connect();
    try {
        const identidade = (await client.query(
            'SELECT current_database() AS database, current_user AS role_name'
        )).rows[0];
        if (identidade.database !== seguro.database) throw new Error('Banco real diverge do URL.');
        if (identidade.role_name !== seguro.role) throw new Error('Role real diverge do URL.');
        return {
            host: seguro.host,
            port: seguro.port,
            database: identidade.database,
            role: identidade.role_name,
            tls: tlsResult
        };
    } finally {
        await client.end();
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    executarDiagnostico()
        .then((resultado) => console.log(JSON.stringify(resultado, null, 2)))
        .catch((erro) => {
            console.error(`SSL diagnostic blocked: ${erro.message}`);
            process.exitCode = 1;
        });
}

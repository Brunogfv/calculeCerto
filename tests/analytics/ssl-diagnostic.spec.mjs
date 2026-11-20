import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCleanupUrl } from '../../scripts/ssl-diagnostic.mjs';

const URL_VALIDA = 'postgresql://validation_b1_cleanup:senha-ficticia@ep-direct.example.neon.tech:5432/validation_b1?sslmode=verify-full';

test('aceita URL de cleanup direta com verify-full e banco/role esperados', () => {
    const config = parseCleanupUrl(URL_VALIDA, {});
    assert.deepEqual(config, {
        host: 'ep-direct.example.neon.tech',
        port: 5432,
        database: 'validation_b1',
        role: 'validation_b1_cleanup'
    });
    assert.equal(JSON.stringify(config).includes('senha-ficticia'), false);
});

test('rejeita URL sem CLEANUP_DATABASE_URL e fallback para DATABASE_URL', () => {
    assert.throws(
        () => parseCleanupUrl('', { DATABASE_URL: URL_VALIDA }),
        /CLEANUP_DATABASE_URL ausente/
    );
});

test('rejeita sslmode permissivo, ausente ou desativado', () => {
    for (const url of [
        URL_VALIDA.replace('?sslmode=verify-full', ''),
        URL_VALIDA.replace('sslmode=verify-full', 'sslmode=require'),
        URL_VALIDA.replace('sslmode=verify-full', 'sslmode=prefer'),
        URL_VALIDA.replace('sslmode=verify-full', 'sslmode=disable'),
        `${URL_VALIDA}&ssl=0`
    ]) {
        assert.throws(() => parseCleanupUrl(url, {}), /sslmode=verify-full|desativar SSL/);
    }
});

test('rejeita uselibpqcompat e pooler', () => {
    assert.throws(
        () => parseCleanupUrl(`${URL_VALIDA}&uselibpqcompat=true`, {}),
        /uselibpqcompat/
    );
    assert.throws(
        () => parseCleanupUrl(
            'postgresql://validation_b1_cleanup:senha-ficticia@ep-direct-pooler.example.neon.tech:5432/validation_b1?sslmode=verify-full',
            {}
        ),
        /conexao direta/
    );
});

test('rejeita banco, role ou host divergentes', () => {
    assert.throws(
        () => parseCleanupUrl(URL_VALIDA.replace('/validation_b1?', '/neondb?'), {}),
        /Banco da limpeza inesperado/
    );
    assert.throws(
        () => parseCleanupUrl(URL_VALIDA.replace('validation_b1_cleanup', 'validation_b1_runtime'), {}),
        /Role da limpeza inesperada/
    );
    assert.throws(
        () => parseCleanupUrl(URL_VALIDA, { CLEANUP_EXPECTED_HOST: 'outro-host.example' }),
        /Host da limpeza inesperado/
    );
});

import { z } from 'zod';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VISITOR_RE = /^[A-Za-z0-9_-]{16,64}$/;

const CHAVES_PROIBIDAS = new Set([
    'valores', 'valor', 'resultado', 'result', 'email', 'e-mail', 'cpf', 'cnpj',
    'telefone', 'phone', 'celular', 'nome', 'name', 'endereco', 'address',
    'password', 'senha', 'token', 'mensagem', 'message'
]);

const uuid = z.string().regex(UUID_RE, 'UUID inválido');
const visitor = z.string().regex(VISITOR_RE, 'visitante inválido');
const caminho = z.string()
    .min(1)
    .max(512)
    .refine((valor) => valor.startsWith('/') && !valor.startsWith('//') && !/[?#]/.test(valor), 'caminho inválido');

const utmSchema = z.object({
    source: z.string().max(120).optional(),
    medium: z.string().max(120).optional(),
    campaign: z.string().max(160).optional(),
    term: z.string().max(160).optional(),
    content: z.string().max(160).optional()
}).strict();

const pageSchema = z.object({
    path: caminho,
    title: z.string().max(200).optional(),
    referrer: z.string().max(2048).optional(),
    utm: utmSchema.optional()
}).strict();

const contextSchema = z.object({
    language: z.string().max(20).optional(),
    screen: z.object({
        width: z.number().int().min(100).max(10000),
        height: z.number().int().min(100).max(10000)
    }).strict().optional(),
    is_test: z.boolean().optional()
}).strict();

const consentSchema = z.object({
    analytics: z.boolean(),
    version: z.string().min(1).max(32).optional()
}).strict().refine(
    (valor) => valor.analytics === false || !!valor.version,
    { message: 'versão do consentimento obrigatória' }
);

const comum = {
    event_id: uuid,
    session_id: uuid,
    visitor_id: visitor,
    ts: z.string().min(1).max(40).refine((valor) => !Number.isNaN(Date.parse(valor)), 'data inválida'),
    consent: consentSchema,
    page: pageSchema,
    context: contextSchema.optional()
};

const pageviewSchema = z.object({
    ...comum,
    event: z.literal('pageview'),
    data: z.object({}).strict().optional()
}).strict();

const sessionStartSchema = z.object({
    ...comum,
    event: z.literal('session_start'),
    data: z.object({}).strict().optional()
}).strict();

const sessionEndSchema = z.object({
    ...comum,
    event: z.literal('session_end'),
    data: z.object({
        engagement_ms: z.number().int().min(0).max(86400000).optional()
    }).strict()
}).strict();

const engagementSchema = z.object({
    ...comum,
    event: z.literal('engagement'),
    data: z.object({
        engagement_ms: z.number().int().min(0).max(86400000)
    }).strict()
}).strict();

const calculatorStartSchema = z.object({
    ...comum,
    event: z.literal('calculator_start'),
    data: z.object({
        calculator: z.string().min(1).max(120)
    }).strict()
}).strict();

const calculatorCompleteSchema = z.object({
    ...comum,
    event: z.literal('calculator_complete'),
    data: z.object({
        calculator: z.string().min(1).max(120),
        duration_ms: z.number().int().min(0).max(86400000).optional()
    }).strict()
}).strict();

const affiliateClickSchema = z.object({
    ...comum,
    event: z.literal('affiliate_click'),
    data: z.object({
        product: z.string().min(1).max(200),
        category: z.string().max(80).optional(),
        slot: z.enum(['pos-resultado', 'rail', 'home', 'other']),
        destination_host: z.string().max(120).optional()
    }).strict()
}).strict();

const payloadSchema = z.discriminatedUnion('event', [
    pageviewSchema,
    sessionStartSchema,
    sessionEndSchema,
    engagementSchema,
    calculatorStartSchema,
    calculatorCompleteSchema,
    affiliateClickSchema
]);

function encontrarChaveProibida(valor, profundidade = 0) {
    if (profundidade > 6 || !valor || typeof valor !== 'object') return null;

    for (const [chave, filho] of Object.entries(valor)) {
        if (CHAVES_PROIBIDAS.has(chave.toLowerCase())) return chave;
        const encontrada = encontrarChaveProibida(filho, profundidade + 1);
        if (encontrada) return encontrada;
    }

    return null;
}

export function parseCollectPayload(payload) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        return { ok: false, motivo: 'invalid_payload' };
    }

    if (encontrarChaveProibida(payload)) {
        return { ok: false, motivo: 'forbidden_payload' };
    }

    const resultado = payloadSchema.safeParse(payload);
    if (!resultado.success) {
        return { ok: false, motivo: 'invalid_payload' };
    }

    const dataEvento = Date.parse(resultado.data.ts);
    const agora = Date.now();
    if (dataEvento > agora + 5 * 60 * 1000 || dataEvento < agora - 24 * 60 * 60 * 1000) {
        return { ok: false, motivo: 'invalid_timestamp' };
    }

    if (!resultado.data.consent.analytics) {
        return { ok: true, consent: false, value: resultado.data };
    }

    return { ok: true, consent: true, value: resultado.data };
}

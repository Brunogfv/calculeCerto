# Fase 5F.1.2 — Auditoria independente da Edge Function

Status: **auditoria local concluída; correções aplicadas sem commit, sem deploy e sem ativação**.
Data: 2026-11-11.
Branch: `feat/portal-analytics`.
Commit durante toda a revisão: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

A Fase 5F.2 **não** foi iniciada. Nenhuma validação remota foi executada.

---

## A. Resumo executivo

**Resultado geral:** o código local está consistente e os controles principais da Fase 5F.1.1
funcionam. Foram encontrados **16 achados**: **9 corrigidos** nesta revisão e **7 pendências**
(1 crítico arquitetural, 3 médios, 2 baixos e 1 informativo).

**Correções relevantes:**

1. a assinatura HMAC passou a cobrir uma mensagem canônica com `key-id`, timestamp, nonce e corpo —
   antes o timestamp e o `key-id` não estavam assinados;
2. o Edge passou a medir o segredo em **bytes UTF-8**, igual à Function (antes usava unidades UTF-16);
3. o parser de timeout passou a rejeitar prefixos numéricos malformados como `1abc`;
4. o Edge só considera sucesso HTTP **202**, não qualquer `resposta.ok`;
5. cookies com **nome duplicado** `pca_edge_consent` passaram a invalidar o consentimento;
6. remoção de alias não utilizado que sugeria um segundo limite de corpo;
7. remoção da variável de corpo do fixture de integração;
8. testes estáticos de grafo de imports para Edge/Function;
9. teste de consistência entre a versão/nome do cookie no frontend e no Edge.

**Pendências que impedem a validação remota segura:**

- **Crítico:** em projeto privado, a chamada `fetch('/api/capture-html')` continua sem autenticação e
  não alcança a Function. Não há bypass de SSO documentado; a validação precisa de alvo público ou de
  mudança de arquitetura.
- **Médio:** não há rate limit antes do HMAC; requisições inválidas ainda invocam a Function e
  consomem web requests/compute.
- **Médio:** CPU real do Edge, `waitUntil`, `AbortSignal.timeout`, WebCrypto, bundler real e latência
  `cmh` → `sa-east-1` + cold start do Neon não foram validados.
- **Médio:** o timeout de 2000 ms continua sendo hipótese.
- **Baixos:** janela de timestamp de 60 s depende de relógios sincronizados; cookie de consentimento
  é forjável por natureza; não há rotação de chave HMAC.
- **Informativo:** a hipótese de Host header influenciar o `baseUrl` do `fetch` não foi confirmada e
  não foi alterada.

**Classificação final:** **Aprovado com pendências** (opção 2). O código local está consistente, mas
a arquitetura de comunicação na homologação privada e as validações de runtime continuam pendentes.
Não é “aprovado para execução remota”.

---

## B. Integridade do repositório

| Item | Valor |
|---|---|
| Diretório | `D:\Projetos\Site Calculadora` |
| Branch | `feat/portal-analytics` |
| Commit inicial | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| Commit final | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| Estado inicial | 254 entradas em `git status --short` (alterações das fases anteriores preservadas) |
| Estado final | 255 entradas (254 + este relatório); nenhum commit, push ou reset |

Não foi executado `git reset`, `git checkout` destrutivo, `git clean` ou equivalente. As alterações
preexistentes da Fase 4 e da Fase 5F.1.1 foram preservadas.

O build local regenerou arquivos já modificados de HTML, `asset-manifest.json`, `sitemap.xml`,
`pagefind/` e `js/analytics.min.*`. Esses arquivos já estavam modificados antes da revisão e são
saídas determinísticas do pipeline local.

### Arquivos examinados

- `netlify/edge-functions/html-capture.js`
- `netlify/edge-functions/_lib/edge-capture.mjs`
- `netlify/edge-functions/_lib/capture-policy.mjs`
- `netlify/edge-functions/_lib/capture-limits.mjs`
- `netlify/edge-functions/_lib/edge-env.mjs`
- `netlify/edge-functions/_lib/capture-signature.mjs`
- `netlify/edge-functions/_lib/classifier.mjs`
- `netlify/functions/capture-html.mjs`
- `netlify/functions/_lib/capture-handler.mjs`
- `netlify/functions/_lib/capture-validation.mjs`
- `netlify/functions/_lib/capture-config.mjs`
- `netlify/functions/_lib/db.mjs`
- `netlify/functions/_lib/http.mjs`
- `js/analytics.js`
- `tests/analytics/*.mjs`
- `tests/e2e/consent.spec.js`
- `db/migrations/003_phase4_html_capture.sql`
- `package.json`, `netlify.toml`, `.env.example`, `.gitignore`
- Documentação em `docs/analytics/` e `README.md`

### Arquivos modificados nesta revisão

- `netlify/edge-functions/_lib/capture-signature.mjs` (novo)
- `netlify/edge-functions/_lib/edge-capture.mjs`
- `netlify/edge-functions/_lib/capture-policy.mjs`
- `netlify/edge-functions/_lib/capture-limits.mjs`
- `netlify/functions/_lib/capture-handler.mjs`
- `tests/analytics/capture-hardening.spec.mjs`
- `tests/analytics/imports.spec.mjs` (novo)
- `tests/analytics/capture-edge.spec.mjs`
- `tests/analytics/capture-policy.spec.mjs`
- `tests/analytics/capture.integration.spec.mjs`
- `package.json`
- `README.md`
- `docs/analytics/fase-4-implementacao.md`
- `docs/analytics/fase-4-decisoes.md`
- `docs/analytics/fase-4-plano.md`
- `docs/analytics/fase-4-homologacao.md`
- `docs/analytics/fase-5f-1-1-investigacao.md`
- `docs/analytics/fase-5f-1-2-auditoria-independente.md` (este relatório)

---

## C. Resultados por auditoria

### C.1 Estado e integridade do repositório

- **Resultado:** conforme.
- **Evidência:** branch e commit registrados; nenhum comando destrutivo; 254 entradas de status no
  início e 255 no final, sendo a diferença apenas este relatório novo.
- **Limitação:** como os arquivos da fase anterior são não rastreados ou já modificados, não existe
  um diff Git limpo da 5F.1.1; a auditoria comparou conteúdo atual, testes e documentação.

### C.2 Allowlist de variáveis do Edge

- **Resultado:** conforme.
- **Evidência:** `html-capture.js` usa `lerEnv()` de `edge-env.mjs`; `lerEnv()` percorre apenas
  `EDGE_ENV_ALLOWLIST` com `Netlify.env.get()`. Não há `toObject()` no grafo do Edge. As variáveis
  proibidas (`DATABASE_URL`, `CLEANUP_DATABASE_URL`, `MIGRATION_DATABASE_URL`,
  `RATE_LIMIT_HMAC_SECRET`) não aparecem no grafo Edge.
- **Fail-safe:** flags ausentes ou diferentes de `true` desligam a captura; segredo ausente, vazio ou
  com menos de 32 bytes UTF-8 retorna `sem_segredo`; nenhuma chamada ao sender ocorre com flags falsas.
- **Testes:** “Edge recebe apenas variáveis da allowlist explícita”, “selecionarEnvEdge descarta
  segredos”, “lerEnv não inventa variáveis”, “segredo do Edge usa o mesmo critério de bytes UTF-8”,
  “flags falsas impedem qualquer chamada ao sender”, “mensagens de erro e configuração não expõem
  segredo”.
- **Limitação:** o valor do segredo é, por necessidade, disponibilizado ao módulo Edge; a proteção é
  limitar o conjunto de variáveis, não esconder o segredo de quem controla o código do Edge.

### C.3 Limite de payload

- **Resultado:** conforme após remoção do alias e do fixture ambíguo.
- **Evidência:** existe apenas uma definição literal de `8192` em `netlify/`:
  `CAPTURE_MAX_BODY_BYTES` em `capture-limits.mjs`. Edge e Function importam o mesmo valor. A Function
  ignora `EDGE_CAPTURE_MAX_BODY_BYTES`.
- **Aplicação:** Edge verifica o JSON serializado antes de enviar; Function verifica `Content-Length`
  declarado e depois o tamanho real em bytes UTF-8 antes de JSON.parse e antes de qualquer banco.
- **Testes:** limites 0, 1, 8191, 8192 e 8193; `é` repetido para provar bytes UTF-8; `Content-Length`
  ausente, negativo, não numérico, grande demais e menor que o corpo real.
- **Limitação:** corpo sem `Content-Length` é lido até o limite da plataforma antes da checagem real;
  o máximo de 6 MB da Function e a proteção da Netlify limitam esse consumo.

### C.4 Timeout e fail-open

- **Resultado:** conforme com pendência de runtime.
- **Evidência:** `EDGE_CAPTURE_TIMEOUT_MS` padrão 2000 ms, faixa 250–5000 ms; parser estrito rejeita
  `1abc`, vazio, negativo e não numérico; `AbortSignal.timeout()` é usado; aborto, erro de rede e
  status inesperado retornam `false` sem lançar; não há retry; `context.next()` ocorre antes do
  trabalho assíncrono; `waitUntil` é protegido.
- **Testes:** “timeout do envio é limitado e o envio falha em silêncio quando aborta”, “envio só
  considera sucesso o status 202”, “context.next é chamado primeiro”, “falha do waitUntil não altera
  a resposta”, “falha do coletor não altera a resposta”.
- **Limitações:** 2000 ms não foi medido no runtime real; CPU de 50 ms do Edge não é tempo de espera,
  mas o trabalho de HMAC/classificação/JSON ainda precisa ser medido; o limite de duração de
  `waitUntil` não está documentado com precisão; cold start do Neon e distância `cmh` → `sa-east-1`
  podem exceder o timeout.

### C.5 Consentimento

- **Resultado:** conforme com a limitação intencional de que o cookie não é prova.
- **Evidência:** `parseConsentCookie` exige versão `2026-11` e `analytics=1`; rejeita parâmetros
  duplicados e cookie com nome duplicado; DNT/GPC bloqueiam; o frontend grava a mesma versão e o mesmo
  nome de cookie (teste estático); retirada grava `analytics=0` e o Edge não captura.
- **Testes:** política, hardening, Playwright de consentimento (11/11).
- **Limitação:** o cookie é controlado pelo cliente, não é `HttpOnly` e pode ser forjado. A
  documentação continua correta ao tratá-lo como preferência declarada, não como consentimento
  verificado. Nenhuma assinatura foi adicionada.

### C.6 HMAC, nonce e replay

- **Resultado:** **problema corrigido**.
- **Achado:** a assinatura cobria apenas o corpo. O timestamp e o `key-id` iam em cabeçalhos não
  assinados. Um corpo válido poderia ser reenviado com timestamp dentro da janela sem invalidar a
  assinatura, dependendo apenas do nonce para replay. O `key-id` era validado por igualdade, mas não
  era vinculado criptograficamente.
- **Correção:** `capture-signature.mjs` define a mensagem canônica
  `edge-v1\n<key-id>\n<timestamp>\n<nonce>\n<corpo>`. Edge e Function usam a mesma função. Alterar
  qualquer campo invalida o HMAC.
- **Evidência:** assinatura verificada com `crypto.timingSafeEqual`; HMAC antes de JSON.parse e antes
  de qualquer escrita; nonce no corpo e no cabeçalho precisam coincidir; nonce é chave primária na
  tabela e é inserido na mesma transação do rate limit, contador diário e evento; timestamp antigo,
  futuro ou malformado é rejeitado.
- **Testes:** “mensagem assinada vincula…”, “adulterar timestamp ou nonce… invalida o HMAC”,
  “Handler rejeita HMAC inválido antes de acessar o banco”, “timestamp expirado ou futuro”,
  “key-id desconhecido e nonce divergente”, integração de replay (skipped sem banco).
- **Limitações:** replay concorrente e rollback transacional exigem PostgreSQL de teste e não foram
  executados nesta revisão; o teste de integração existente foi atualizado para a nova assinatura.

### C.7 Imports e compatibilidade com o bundler

- **Resultado:** conforme localmente; bundler real não validado.
- **Evidência:** teste estático percorre o grafo da Edge a partir de `html-capture.js`, resolve todos
  os imports relativos, exige extensão explícita, não encontra ciclos, imports externos, APIs
  `node:`, `process.env`, `Deno.env`, logs ou referências a segredos. O grafo da Function resolve
  `node:crypto`, `pg`, `zod` e os módulos compartilhados.
- **Documentação oficial:** o blog da Netlify sobre `zip-it-and-ship-it` descreve o rastreamento
  recursivo de `require`/`import` inclusive fora do diretório da função
  (https://www.netlify.com/blog/2021/08/12/how-to-include-files-in-netlify-serverless-functions/).
- **Limitação:** não há Netlify CLI nem `@netlify/zip-it-and-ship-it` instalado no projeto; o
  empacotamento real de Functions e Edge só pode ser confirmado no build da Netlify. `node --check`
  não valida bundling.

### C.8 waitUntil e limites do Edge

- **Resultado:** conforme por inspeção e testes locais; runtime pendente.
- **Evidência:** `context.next()` é chamado imediatamente; o trabalho é agendado em
  `context.waitUntil()`; promises são protegidas com `.catch`; não há loop, retry ou operação pesada;
  o benchmark local p95 ficou abaixo de 1 ms, mas é Node e não Edge.
- **Limitação:** o orçamento real de 50 ms de CPU, o comportamento de `waitUntil` e o custo de
  WebCrypto no Deno não podem ser comprovados localmente.

### C.9 Segurança e privacidade

- **Resultado:** conforme.
- **Evidência:** nenhum IP bruto ou User-Agent bruto é persistido; `context.ip` só alimenta HMAC de
  rate key; o payload contém família/versão de UA, client hints e metadados de navegação; não há
  valores ou resultados de calculadoras; o Edge não lê o corpo da resposta; o `fetch` interno usa
  `credentials: 'omit'` e não envia cookies; não há logs no caminho de captura; segurança permanece
  desligada; retenção e limpeza estão documentadas.
- **Limitações:** HMAC é autenticação de serviço, não de usuário. Quem tiver o segredo pode forjar
  eventos e consumir o limite diário. Requisições com HMAC inválido não tocam o banco, mas ainda
  invocam a Function. O cookie de consentimento é forjável.

---

## D. Segurança — classificação dos achados

| ID | Achado | Severidade | Situação |
|---|---|---|---|
| F1 | Edge → Function não autenticado em projeto privado; falha silenciosa | **Crítico** | Pendente (arquitetura/visibilidade) |
| F2 | Timestamp e `key-id` fora da assinatura HMAC | **Médio** | Corrigido |
| F3 | Segredo do Edge medido em unidades UTF-16, não bytes UTF-8 | **Baixo** | Corrigido |
| F4 | Timeout aceitava prefixo numérico malformado (`1abc` → 250 ms) | **Baixo** | Corrigido |
| F5 | Qualquer `resposta.ok` era tratado como sucesso, inclusive página de login 200 | **Baixo/Médio** | Corrigido defensivamente |
| F6 | Nome de cookie duplicado tinha interpretação ambígua | **Baixo** | Corrigido |
| F7 | Alias `DEFAULT_MAX_BODY_BYTES` sugeria segundo limite | **Informativo** | Corrigido |
| F8 | Fixture de integração ainda configurava `EDGE_CAPTURE_MAX_BODY_BYTES` | **Informativo** | Corrigido |
| F9 | Ausência de teste estático de grafo de imports | **Informativo** | Corrigido |
| F10 | Ausência de teste de consistência frontend/Edge para versão e cookie | **Informativo** | Corrigido |
| F11 | Sem rate limit antes do HMAC no endpoint público | **Médio** | Pendente (requer arquitetura/plataforma) |
| F12 | Timeout, latência cross-region e cold start não medidos | **Médio** | Pendente (runtime) |
| F13 | Bundler/Edge runtime não validados | **Médio** | Pendente (deploy autorizado) |
| F14 | Janela de timestamp de 60 s depende de relógios sincronizados | **Baixo** | Pendente (runtime) |
| F15 | Cookie de consentimento é forjável | **Baixo** | Aceito e documentado |
| F16 | Sem rotação de chave HMAC; hipótese de Host header não confirmada | **Informativo** | Pendente/hipótese |

**Contagem:** 16 achados; **9 corrigidos**; **7 pendentes** (1 crítico, 3 médios, 2 baixos,
1 informativo).

Não foi confirmada vulnerabilidade de SSRF por Host header. O `baseUrl` do `fetch` usa
`request.url`; a hipótese depende de a plataforma permitir Host arbitrário na construção da URL. Não
foi alterado porque a correção exigiria uma allowlist de hosts por ambiente/deploy, mudança
arquitetural que precisa de autorização.

---

## E. Testes

| Teste | Resultado | Aprovados | Falhas | Ignorados | Motivo |
|---|---|---:|---:|---:|---|
| `npm run test:analytics` | PASS | 72 | 0 | 2 suítes | `capture.integration` e `collect.integration` exigem `TEST_DATABASE_URL` e `ANALYTICS_TEST_DB`; sem banco de teste isolado, são `describe.skip` |
| `npx playwright test tests/e2e/consent.spec.js` | PASS | 11 | 0 | 0 | — |
| `npm run build:deploy` | PASS | — | 0 | — | build estático local |
| `node --check` nos arquivos alterados | PASS | 12 | 0 | 0 | sintaxe/E SM |
| Carregamento local de `html-capture.js` com `toObject()` lançando erro | PASS | 1 | 0 | 0 | resposta 200; `toObject()` não foi chamado |

Observação: o runner do Node reportou `tests 72`, `suites 2`, `skipped 0`; as duas suítes
`describe.skip` aparecem como `SKIP` no log e não geram casos de teste contados. Nenhum teste foi
conectado ao Neon remoto.

---

## F. Build

- **Comando:** `npm run build:deploy` (build local; não publica).
- **Resultado:** concluído.
- **Arquivos em `dist/`:** 671.
- **Tamanho:** 19.633.188 bytes (18,72 MB).
- **Conteúdo publicado localmente:** HTML, artigos, calculadoras, páginas, CSS/JS versionados,
  imagens, pagefind, `_headers`, `_redirects`, `sitemap.xml`, `robots.txt`, `ads.txt`, favicons.
- **Verificação de secrets:** busca por `postgresql://`, `DATABASE_URL`, `CLEANUP_DATABASE_URL`,
  `MIGRATION_DATABASE_URL`, `EDGE_INGEST_SECRET`, `RATE_LIMIT_HMAC_SECRET`, chaves privadas,
  `sk_live_` e `nfp_` em `dist/`: nenhuma ocorrência. Busca por nomes de arquivos suspeitos (`.env`,
  `secret`, `token`, `credential`, `.pem`, `.key`, `relatorio`, `fase-`, `.spec.`, `test`, `.map`):
  nenhum resultado.
- **Limitações:** o build local não empacota Functions nem Edge Functions; o `netlify.toml` não tem
  bundler explícito e não há Netlify CLI instalado. O empacotamento e a resolução de imports fora do
  diretório de Functions precisam ser confirmados no build remoto autorizado.

---

## G. Pendências para runtime real

1. Confirmar se o alvo de validação será público; em projeto privado, Edge → Function não funciona
   sem decisão arquitetural.
2. Confirmar o comportamento real do site protection (status/corpo) para requisição interna.
3. Medir CPU real do Edge (limite de 50 ms), incluindo HMAC, classificação, serialização e agendamento.
4. Confirmar suporte e comportamento de `AbortSignal.timeout()` no Deno/Netlify Edge.
5. Medir latência Function `cmh` → Neon `aws-sa-east-1`, cold start do Neon e tempo total; validar ou
   ajustar os 2000 ms.
6. Confirmar empacotamento dos imports compartilhados por `zip-it-and-ship-it` e pelo edge-bundler.
7. Executar a suíte de integração PostgreSQL em banco de teste isolado (replay, rate limit, limite
   diário, roles, retenção e rollback).
8. Medir a taxa real de falha silenciosa e o custo de requisições inválidas no endpoint público.
9. Confirmar sincronização de relógio Edge/Function para a janela de 60 s.
10. Confirmar que nenhuma variável de escopo Functions além da allowlist chega ao Edge no ambiente
    real.

---

## H. Recomendação

**Classificação: 2 — Aprovado com pendências.**

O código local está consistente, os controles de allowlist, limite, timeout, consentimento, HMAC,
nonce e imports foram auditados e reforçados. Ainda existem:

- um bloqueio arquitetural crítico para validação em projeto privado (Edge → Function sem bypass de
  SSO documentado);
- riscos médios de abuso antes do HMAC e de comportamento não validado do runtime/bundler/latência;
- pendências de integração PostgreSQL.

Não é possível classificar como “aprovado para execução remota”. Também não se justifica
“reprovado”: os problemas de código encontrados foram corrigidos e não há indicação de falha local
nos controles implementados. A próxima fase deve ser apenas de **planejamento** e precisa decidir
explicitamente entre alvo público (Alternativa B) ou arquitetura privada com Blobs/Scheduled Function
(Alternativa C), antes de qualquer deploy.

---

## Confirmação de estado

- Produção intacta.
- Homologação intacta.
- Visibilidade de ambos os sites inalterada.
- Todas as flags continuam `false`.
- Nenhum deploy, build remoto, Deploy Preview ou branch deploy executado.
- Nenhuma variável, secret ou configuração remota alterada.
- Nenhuma escrita, exclusão, migration ou role no Neon.
- Nenhum DNS alterado.
- Nenhum commit, push, PR ou merge.
- Nenhuma credencial, connection string ou segredo exibido neste relatório.

A Fase 5F.1.2 termina com a entrega deste relatório. Aguardar autorização explícita antes de
qualquer fase posterior.

# Fase 5F.51 - Build e validacao do artefato completo de homologacao B1

Status: **artefato completo construido e validado localmente; nenhum deploy, upload, alteracao
remota, migration remota, cleanup, commit ou push executado**.
Data/hora de referencia: **2026-11-20T20:36:13Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Deploy de referencia preservado: `6b007a6d6e15671b125b952e` (B1, `deploy-preview`, nao alterado).

**Classificacao: 1 - Artefato completo validado.**

O artefato local completo esta construido, congelado e validado. Ainda nao foi publicado; a
homologacao remota exige deploy, variaveis/flags e migration 007 em autorizacoes separadas.

---

## 1. Inventario real

### 1.1 Estaticos

7 arquivos, sem alteracao no contrato:

- `_headers` - `cacc628a...`;
- `b1-consent.js` - `cc8d70bf...`;
- `b1.css` - `b09bebfa...`;
- `build-manifest.json` - `8db47943...`;
- `index.html` - `d5c59888...`;
- `robots.txt` - `331ea909...`;
- `validacao-encerrada.html` - `1f6d5884...`.

### 1.2 Functions

16 arquivos: 3 entradas + 13 bibliotecas.

| Origem | Saida | Runtime | Rota/finalidade | Efeitos |
|---|---|---|---|---|
| `netlify/functions/capture-html.mjs` | Functions | nodejs24.x | `/api/capture-html`; captura HMAC | INSERT de captura quando flags/HMAC |
| `netlify/functions/cleanup-html-capture.mjs` | Functions | nodejs24.x | schedule cleanup | DELETE controlado |
| `netlify/functions/collect.mjs` | Functions | nodejs24.x | `/api/collect`; analytics first-party | INSERT de sessoes/eventos |
| `_lib/collect-handler.mjs` | Functions | nodejs24.x | handler do collect | usa UA transitorio, sem UA bruto persistido |
| `_lib/attribution.mjs` | Functions | nodejs24.x | atribuicao | sem escrita |
| `_lib/config.mjs` | Functions | nodejs24.x | config do collect | sem escrita |
| `_lib/rate-limit.mjs` | Functions | nodejs24.x | rate limit HMAC | incrementa buckets |
| `_lib/user-agent.mjs` | Functions | nodejs24.x | parser UA | retorna derivados |
| `_lib/validation.mjs` | Functions | nodejs24.x | validacao Zod | sem escrita |
| `_lib/capture-config.mjs` | Functions | nodejs24.x | config capture | sem escrita |
| `_lib/capture-handler.mjs` | Functions | nodejs24.x | handler capture | escrita de captura |
| `_lib/capture-validation.mjs` | Functions | nodejs24.x | validacao capture | sem escrita |
| `_lib/cleanup-html-capture.mjs` | Functions | nodejs24.x | wrapper cleanup | sem escrita direta |
| `_lib/cleanup-retention.mjs` | Functions | nodejs24.x | retencao | DELETE |
| `_lib/db.mjs` | Functions | nodejs24.x | pool/transacao | conexao DB |
| `_lib/http.mjs` | Functions | nodejs24.x | helpers HTTP | sem escrita |

Hashes SHA-256 dos novos arquivos:

| Caminho | Bytes | SHA-256 |
|---|---:|---|
| `collect.mjs` | 256 | `0d65acf24915f4d1ab8747a7dde9005184fc7c995c85f6c8762e0cf8f3b30617` |
| `_lib/collect-handler.mjs` | 12.309 | `493f883aa2ab84c604485cf16f7b8d845f2247dc18d2f4d940d62df8284c497b` |
| `_lib/attribution.mjs` | 2.094 | `259a54308b78cae7c0e27d6fc5e4a6d1b1d0c193f42b67232c521ff0d88f1586` |
| `_lib/config.mjs` | 1.477 | `b3287910c34f3b41e5c38436c547f8923894333b01a4b26af6b5f2ce7c4d58e9` |
| `_lib/rate-limit.mjs` | 2.013 | `4ba850f691719cb56c5266121fc4420a37a4a8ea0048d3a1a7b1881717e5736b` |
| `_lib/user-agent.mjs` | 658 | `988e598ab6883fe6893b4fa0a81742b175829596dd51d9ac187f727709acb523` |
| `_lib/validation.mjs` | 5.018 | `3d966e7e06ed047ff282886a6375b17ecb676c02c7b7b4061ab738fdf2081126` |

Os 9 arquivos existentes mantem os hashes do contrato 5F.47.

### 1.3 Edge

7 arquivos, sem alteracao:

- `html-capture.js`;
- `_lib/capture-limits.mjs`;
- `_lib/capture-policy.mjs`;
- `_lib/capture-signature.mjs`;
- `_lib/classifier.mjs`;
- `_lib/edge-capture.mjs`;
- `_lib/edge-env.mjs`.

Uma entrada Edge, rota `/*`, finalidade de captura HTML observada. Nao ha Edge adicional.

### 1.4 Dependencias

- `pg` 8.23.1 - existente;
- `zod` 4.6.7 - existente;
- `ua-parser-js` 2.0.10 - adicionado ao B1 e lockfile;
- dependencias transitivas do UA parser: `detect-europe-js`, `is-standalone-pwa`, `ua-is-frozen`;
- `netlify-cli` 27.20.0 - dev/teste, nao runtime do site.

A instalacao foi feita localmente/offline (`npm install --offline`), sem registro remoto.

---

## 2. Build e versoes

| Item | Valor |
|---|---|
| Node local | `v24.13.0` |
| Node Linux dos testes | `v22.23.5` |
| PostgreSQL local | `17.11` (container descartavel) |
| Netlify CLI | `27.20.0` |
| Build B1 | pass; 6 estaticos + build-manifest, 10.0 KiB |
| Shared manifest | 23 arquivos |
| Gate | `validated_only` |
| Deploy executado | nao |

O build canonico nao foi alterado. O gate foi executado somente com `--check`; nenhum
`netlify deploy` foi chamado.

---

## 3. Manifesto e digest

Artefato validado e preservado em:

```text
%TEMP%\opencode\b1-artifact-5f51
```

| Item | Valor |
|---|---|
| `artifact_sha256` | `6b80bea75089a28063df8bd3926772a8e59e163f7db08e1093ed9ac2168ab470` |
| `package_manifest_sha256` | `32fc940451ee59b3bcadbe58f3af17ab7093717e55d4fbb1f8661214bfc7d1ab` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Estaticos | 7 |
| Functions | 16 |
| Edge | 7 |
| Config | 1 |
| Metadata | 1 |
| Total | 32 |
| Bytes | 105.927 |

O pacote foi validado, congelado com permissao somente leitura e validado novamente. O manifesto de
integridade foi salvo em:

```text
%TEMP%\opencode\b1-5f51-integrity.json
```

O artefato **nao foi reconstruido depois da validacao**. `artifact_sha256` inclui o conteudo de
`dist`, Functions, Edge e `netlify.toml`. O `package-manifest.json` e a configuracao tambem foram
hasheados no envelope de integridade.

Nao existe digest publicado; o digest acima e local. Nao foi criado deploy novo.

---

## 4. Testes e resultados

### B1

| Suite | Resultado |
|---|---|
| Windows `npm test` | 58 testes: 57 pass, 1 skip, 0 fail |
| Linux Node 22 | 58/58 pass, 0 skip |
| `test:browser` | 2/2 pass |
| `deploy:b1 -- --check` | `validated_only`; 7/16/7/0 |
| Contrato completo | 32 arquivos, 105.927 bytes, digest 6b80... |

Skip Windows: symlink; equivalente Linux passou.

### Analytics e banco

| Suite | Resultado |
|---|---|
| PostgreSQL 17.11 | 17.11; migrations 001-007 aplicadas |
| `schema_migrations` | 7 |
| `sessions.user_agent` | 0 colunas |
| `npm run test:analytics` | 137/137 pass |
| Deduplicacao/rate/origin/consentimento/privacidade | cobertos na suite |
| Cleanup | testes locais de retencao passaram; nenhuma execucao remota |

### Canonico e isolamento

| Suite | Resultado |
|---|---|
| `npm run test:isolation` | 50 arquivos B1 preservados |
| Build canonico | 162 HTML |
| `npx playwright test` | 62/62 pass |
| `test-local` | 162/162 na referencia mais recente; nao reexecutado nesta fase |
| Configuracao canonica | nao incorporada ao B1 |

O isolamento subiu de 43 para 50 porque os 7 arquivos de collect foram adicionados ao B1. Nao e
regressao; e a ampliacao intencional do contrato.

---

## 5. Auditoria de privacidade

O handler de collect inclui:

- consentimento obrigatorio no payload;
- origem permitida via `ALLOWED_ORIGINS`;
- validacao Zod;
- limite de corpo;
- deduplicacao;
- rate limit HMAC;
- campos derivados `device_type`, `browser`, `os`, `is_test`;
- ausencia de persistencia de `sessions.user_agent`;
- ausencia de IP bruto persistido (HMAC para buckets);
- rejeicao de valores/resultados de calculadora;
- erros sem corpo sensivel.

`ua-parser-js@2.0.10` e usado apenas para derivar a classificacao. O teste B1 verifica que o handler
nao contem `user_agent`; a suite de integracao PostgreSQL valida que a coluna nao existe apos 007 e
que a string sintetica nao e persistida nem aparece nos logs.

Pontos que ainda exigem integracao remota:

- logs reais da plataforma;
- headers reais de Origin no deploy completo;
- consentimento/revogacao em navegador com cliente de coleta;
- rate limit e 429 reais com o secret B1;
- cleanup real.

---

## 6. Migration 007

Migration local:

```sql
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

Validacao local em PostgreSQL 17.11:

- banco vazio;
- 7 migrations aplicadas;
- nenhuma coluna `sessions.user_agent`;
- segunda execucao do runner ignora a 007 por `schema_migrations`;
- SQL direto repetido e idempotente (`IF EXISTS`);
- 137/137 testes de analytics;
- sem DDL/DELETE para runtime; cleanup permanece restrito.

Nao foi aplicada no Neon. A ordem prevista e codigo novo primeiro, migration 007 depois; rollback
de schema recria coluna vazia, sem recuperar dados apagados.

---

## 7. Matriz documental de variaveis e flags

Nenhum valor foi configurado nesta fase.

| Variavel | Obrigatoria | Contexto | Formato/uso | Risco ausente | Risco incorreto |
|---|---|---|---|---|---|
| `DATABASE_URL` | sim | runtime B1 | URL secreta PostgreSQL | 503/indisponivel | banco/role errados |
| `ALLOWED_ORIGINS` | sim | collect | lista de origens B1 | 403 para B1 | aceitar origem indevida |
| `RATE_LIMIT_HMAC_SECRET` | sim | collect | segredo >=32 bytes | 503 analytics_not_configured | buckets/limites errados |
| `EDGE_INGEST_SECRET` | sim | Edge/Function capture | segredo HMAC | capture indisponivel | HMAC invalido/401 |
| `ANALYTICS_INGEST_ENABLED` | sim para teste | collect | `true` somente na janela | 204 disabled | ingestao ativa fora de janela |
| `EDGE_CAPTURE_ENABLED` | teste Edge | Edge | `true` na janela | Edge nao captura | captura sem controle |
| `EDGE_ANALYTICS_ENABLED` | teste Edge | Edge | `true` na janela | sem analytics Edge | captura indevida |
| `HTML_CAPTURE_CLEANUP_ENABLED` | teste cleanup | scheduled | `true` somente na janela | cleanup nao roda | DELETE nao autorizado |
| `EDGE_ANALYTICS_SAMPLE_RATE` | opcional | Edge | taxa 0..1 | usa default | amostra divergente |
| `EDGE_INGEST_KEY_ID` | opcional | Edge/Function | ex. `v1` | default v1 | assinatura divergente |
| `CLEANUP_DATABASE_URL` | cleanup | cleanup | URL secreta role cleanup | cleanup indisponivel | role/DB errados |

`ANALYTICS_INGEST_ENABLED`, `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` nao estavam no levantamento
5F.38 e precisam ser configurados apenas no B1 antes dos testes funcionais.

---

## 8. Problemas encontrados e pendencias

1. O B1 atual ainda nao tem `/api/collect` publicado; o novo artefato local inclui.
2. `ua-parser-js` foi adicionado ao B1; o lockfile mudou localmente, sem rede.
3. `ALLOWED_ORIGINS`, `RATE_LIMIT_HMAC_SECRET` e `ANALYTICS_INGEST_ENABLED` precisam de configuracao
   remota B1.
4. Migration 007 nao foi aplicada no Neon B1.
5. `connect-src 'none'` no B1 impede um cliente de navegador de chamar `/api/collect`; a primeira
   janela deve ser server-side ou exigir ajuste de CSP/client autorizado.
6. O cleanup nao foi executado; a role e os limites precisam de janela separada.
7. Nao ha cliente frontend completo no B1 minimo; o artefato inclui o endpoint e a Edge, nao a UI
   canonica.
8. Nao foi executado deploy do novo artefato.
9. A versao final publicada e o digest remoto ainda nao existem.
10. O teste `test-local` nao foi reexecutado nesta fase; a referencia mais recente e 162/162 e o
    build canonico atual processou 162 HTML.

Nenhum desses itens e falha de integridade do artefato local.

---

## 9. Artefato, relacao e preservacao

- Manifesto do pacote: `package-manifest.json` (3.005 bytes, SHA-256 `32fc940...`);
- Config: `netlify.toml` (161 bytes, SHA-256 `7b5f627...`);
- Staging: `%TEMP%\opencode\b1-artifact-5f51` (somente leitura);
- Envelope de integridade: `%TEMP%\opencode\b1-5f51-integrity.json`;
- Digest: `6b80bea...`;
- O staging nao foi reconstruido depois da validacao;
- Nenhum deploy usou este artefato.

O artefato antigo do deploy `6b007a6...` permanece intacto e separado; nao foi substituido.

---

## 10. Confirmacao de ausencia de operacoes remotas

- Nenhum deploy/upload/publicacao.
- Nenhuma alteracao Netlify/Neon/flags/variaveis/dominios/producao.
- Nenhuma migration remota, cleanup, cron ou Scheduled Function.
- Nenhuma escrita de dados remotos.
- Nenhum commit, push ou PR.
- O PostgreSQL foi local, descartavel e isolado.
- Lock do gate e staging de deploy temporario ausentes; o artefato validado permanece apenas como
  evidencia local read-only.

---

## 11. Classificacao final

**1 - Artefato completo validado.**

O build isolado, o contrato de 32 arquivos, o manifesto, o digest, a dependencia fixada, os testes
de B1/analytics/PostgreSQL 17, a privacidade e o isolamento foram validados. Ainda nao ha deploy,
migration remota, flags B1 ou homologacao operacional; isso permanece para autorizacoes separadas.

Nao executar deploy, upload, migration remota, cleanup, commit, push ou PR sem nova autorizacao.

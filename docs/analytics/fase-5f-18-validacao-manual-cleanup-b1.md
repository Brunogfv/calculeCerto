# Fase 5F.18 — Deploy preview B1 e validação manual controlada da limpeza

Status: **deploy preview criado, flag de cleanup ativada e restaurada; Run now não executado;
nenhuma limpeza executada**.
Data: **2026-11-18**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 3 — Bloqueado.** O deploy criado não corresponde ao artefato B1 esperado:
publicou três Functions (incluindo `collect`), 252 redirect rules e 16 header rules. A conexão
direta da role de cleanup foi confirmada, mas o SSL não foi confirmado. Por segurança, o `Run now`
não foi executado, a flag foi restaurada para `false` e os dados não foram alterados.

---

## 1. Resumo executivo

- Um único deploy preview foi criado no Site ID B1: `6afd151972b2d3618033a7dd`.
- O deploy está `ready`, em `deploy-preview`, com `published_at=null`.
- `HTML_CAPTURE_CLEANUP_ENABLED` foi temporariamente ativada no contexto `deploy-preview`.
- O deploy resultou em **3 Functions** (`capture-html`, `cleanup-html-capture` e `collect`),
  **252 redirect rules** e **16 header rules**, diferente do artefato B1 mínimo esperado.
- A role de cleanup foi confirmada como `validation_b1_cleanup` e o banco como `validation_b1`.
  A conexão usada na verificação foi direta, mas `pg_stat_ssl` retornou `ssl=false`.
- O `Run now` não foi executado.
- A flag de cleanup foi restaurada para `false`; ingestão, captura e Edge Analytics permanecem
  desativadas no preview.
- Nenhuma limpeza foi executada e as contagens do banco permaneceram iguais.
- Nenhum deploy publicado, promoção, alteração de produção, criação de recurso, migration ou
  alteração de código foi realizada.

---

## 2. Autorização e escopo

Autorizado:

- um deploy preview B1;
- ativação temporária da flag de cleanup exclusivamente em `deploy-preview`;
- uma execução manual via `Run now`, se as pré-condições fossem atendidas;
- verificação no banco `validation_b1`;
- restauração da flag.

Não autorizado e não executado:

- publicação, promoção ou produção;
- segundo deploy ou segunda limpeza;
- criação de site, branch, database ou role;
- migrations, SQL remoto de escrita, alterações de dados;
- alteração de cron, HMAC, rate limits, `DATABASE_URL` ou credenciais;
- commit, push ou PR.

O deploy foi interrompido antes do `Run now` porque o artefato publicado divergiu do B1 esperado.

---

## 3. Identificação dos ambientes

| Item | Valor confirmado |
|---|---|
| Netlify Team ID | `697d58587a017c3396fb416e` |
| Netlify Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site | `portal-contas-validation-b1` |
| Deploy criado | `6afd151972b2d3618033a7dd` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| Publicado | não (`published_at=null`) |
| Neon Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Cleanup role | `validation_b1_cleanup` |
| Runtime role | `validation_b1_runtime` (não usada na limpeza) |
| `CLEANUP_DATABASE_URL` | presente, secret, preview |
| Produção | não alterada |

A conexão de verificação da role de cleanup identificou:

- `current_database() = validation_b1`;
- `current_user = validation_b1_cleanup`;
- host direto da branch, sem `-pooler`;
- `pg_stat_ssl.ssl = false`.

O valor real de `CLEANUP_DATABASE_URL` não foi impresso. Como o segredo não é legível pela API, o
SSL da URL configurada não pôde ser comprovado; a conexão direta e a role foram comprovadas.

---

## 4. Testes e build pré-deploy

Executados localmente antes do deploy:

| Verificação | Resultado |
|---|---|
| Analytics (unitários + integração PostgreSQL 17) | **135/135 pass**, 0 fail, 0 skip |
| B1 (`sync:shared` + build + test) | **19/19 pass** |
| Consentimento no navegador | **2/2 pass** |
| Build B1 | 6 arquivos publicados + `build-manifest.json`, 10,0 KiB |
| Manifesto compartilhado | 16/16 hashes canônico × B1 idênticos |
| Correções 5F.14 no código | presentes no código local/B1 |

A cópia B1 foi sincronizada e o manifesto foi gerado antes do build. Nenhum código foi alterado
para obter aprovação.

---

## 5. Verificação de isolamento

- Projeto, branch, database e role de cleanup correspondem ao esperado.
- A conexão de verificação usou `validation_b1_cleanup` e não `validation_b1_runtime`,
  `analytics_runtime`, `analytics_cleanup` ou credenciais de produção.
- `CLEANUP_DATABASE_URL` está no contexto preview; produção contém somente `DATABASE_URL` e
  `EDGE_INGEST_SECRET`.
- Ingestão, captura e Edge Analytics permaneceram desativadas.
- O deploy de produção e o site principal não foram alterados.
- Não foi possível comprovar SSL na conexão de verificação (`ssl=false`) nem ler o valor da URL
  secreta para confirmar o SSL configurado.

Devido à divergência do artefato publicado, a etapa não avançou para o banco.

---

## 6. Identificação do deploy preview

| Item | Valor |
|---|---|
| Deploy ID | `6afd151972b2d3618033a7dd` |
| URL | `https://6afd151972b2d3618033a7dd--portal-contas-validation-b1.netlify.app` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| Publicado | não |
| Functions | `capture-html`, `cleanup-html-capture`, `collect` |
| Edge Function | `html-capture` |
| Schedule | `cleanup-html-capture` com `15 3 * * *` |
| Redirect rules | 252 |
| Header rules | 16 |

O artefato esperado do B1 era mínimo, com duas Functions e uma Edge Function; o deploy publicado
incluiu também `collect` e as regras do projeto raiz. Essa divergência impediu a continuidade segura.

A primeira tentativa de comando com `--context` foi rejeitada pelo CLI antes de criar qualquer
deploy; a consulta à API confirmou que o deploy anterior ainda era o único existente. O deploy
`6afd...` foi criado uma única vez na tentativa corrigida, sem `--prod`.

---

## 7. Estado das flags

| Flag/variável | Antes da janela | Durante | Depois |
|---|---|---|---|
| `HTML_CAPTURE_CLEANUP_ENABLED` (preview) | `false` | `true` | **`false`** |
| `EDGE_CAPTURE_ENABLED` | `false` | `false` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` | `false` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` | `0.1` | `0.1` |
| `ANALYTICS_INGEST_ENABLED` | ausente/desativada | inalterada | ausente/desativada |
| `DATABASE_URL` | inalterada | inalterada | inalterada |
| `CLEANUP_DATABASE_URL` | secret preview | inalterada | secret preview |
| Produção | sem cleanup | sem cleanup | sem cleanup |

A restauração de `HTML_CAPTURE_CLEANUP_ENABLED=false` foi confirmada após o deploy.

---

## 8. Evidências da execução manual

**Não executada.**

- `Run now` não foi acionado.
- Nenhum log de execução do cleanup foi gerado.
- Nenhum DELETE foi executado.
- Nenhum `complete`, `partial`, `budget_exhausted` ou `locked` foi produzido em runtime.
- A função foi implantada e está disponível no preview, mas não foi executada.

Motivo da interrupção: o deploy `6afd...` contém `collect` e regras do projeto raiz, divergindo do
artefato B1 mínimo exigido. Como não era autorizado um segundo deploy para corrigir o alvo, o
`Run now` não foi executado.

---

## 9. Contagens anteriores e posteriores

Não houve execução da limpeza; as contagens são iguais antes e depois.

| Tabela | Antes | Depois |
|---|---:|---:|
| `visitors` | 0 | 0 |
| `sessions` | 0 | 0 |
| `pageviews` | 0 | 0 |
| `events` | 0 | 0 |
| `affiliate_clicks` | 0 | 0 |
| `ingest_events` | 0 | 0 |
| `rate_limits` | 0 | 0 |
| `html_events` | 2 | 2 |
| `html_traffic_daily` | 1 | 1 |
| `html_indicators_monthly` | 1 | 1 |
| `edge_daily_counters` | 1 | 1 |
| `edge_nonces` | 2 | 2 |
| `edge_rate_limits` | 2 | 2 |

Os 2 `html_events` existentes permanecem:

- `11111111-1111-4111-8111-111111111111`
- `ecd60ff6-c57e-416b-995c-130ade9938b7`

Registros sintéticos elegíveis identificados no preflight, mas **não excluídos**:

- `edge_nonces`: 2;
- `edge_rate_limits`: 2.

Nenhum registro artificial foi criado, nenhum timestamp foi alterado e nenhum dado foi forçado a
ficar elegível.

---

## 10. Integridade referencial

- Nenhuma exclusão foi executada.
- Nenhuma sessão, visitante, pageview, evento ou clique foi alterado.
- Não houve oportunidade de cascata ou remoção de filho recente.
- Contagens e IDs dos `html_events` permanecem idênticos.
- Não houve alteração em outros bancos ou branches.
- A role de runtime não foi usada para limpeza.

---

## 11. Resultado do orçamento e dos lotes

O orçamento de 20 s, os lotes de 5 s e a margem de 1 s permanecem apenas verificados no código
local. Não houve execução, portanto não há duração real, lotes processados, estado de lock ou
orçamento consumido para registrar.

Esse é um dos motivos da classificação 3: a execução manual não foi comprovada.

---

## 12. Resultado da restauração

- `HTML_CAPTURE_CLEANUP_ENABLED` restaurada para `false` no preview.
- `EDGE_CAPTURE_ENABLED=false`.
- `EDGE_ANALYTICS_ENABLED=false`.
- `EDGE_ANALYTICS_SAMPLE_RATE=0.1`.
- `ANALYTICS_INGEST_ENABLED` permanece ausente/desativada.
- Produção continua sem cleanup.
- Nenhum deploy adicional foi feito para restaurar.
- O deploy `6afd...` permanece como preview não publicado.

---

## 13. Créditos Netlify

| Momento | Disponível |
|---|---:|
| Antes do deploy | 139,3847429228 |
| Depois do deploy/restauração | 139,3839450168 |

Variação observada: aproximadamente **0,0008 crédito**. Não houve execução manual da Function, então
o custo do deploy/operação é desprezível nesta medição; o valor não deve ser tratado como custo
garantido de fases futuras.

---

## 14. Pendências

1. **Artefato do deploy:** o preview publicou `collect`, 252 redirects e 16 headers, em vez do
   artefato B1 mínimo com duas Functions. Não usar esse deploy para validar a limpeza.
2. **Segundo deploy:** não autorizado; o problema do artefato não foi corrigido nesta fase.
3. **Run now:** não executado; não há evidência de runtime, lock, orçamento ou exclusão efetiva.
4. **SSL:** `pg_stat_ssl=false` na conexão de verificação; o valor secreto de
   `CLEANUP_DATABASE_URL` não foi lido.
5. **Deploy publicado/cron:** não validado; não houve publicação.
6. **Rate limiting:** enforcement/429 continua pendente e está fora desta fase.
7. **Dry-run:** não executado.

---

## 15. Classificação final

**3 — Bloqueado.**

O deploy preview foi criado e a flag foi corretamente restaurada, mas o artefato publicado divergiu
do B1 mínimo esperado e a conexão não comprovou SSL. Prosseguir com `Run now` nesse estado violaria
as pré-condições de segurança e não permitiria atribuir uma eventual exclusão ao artefato correto.
A limpeza não foi executada e nenhum dado foi alterado.

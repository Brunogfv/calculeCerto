# Fase 5F.29 — Estabilização dos testes de analytics em Node.js 22

Status: **correções locais concluídas e suíte completa aprovada em Node.js 22; nenhuma operação remota ou Git foi executada**.
Data/hora: **2026-11-19T15:11:34-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 1 — Aprovado (escopo local).** A suíte completa passou em banco limpo e Node.js 22,
sem falhas, skips ou cancelamentos. CI remoto, versionamento e aceitação TOCTOU continuam fora desta
fase e dependem de autorização posterior.

---

## 1. Causas reproduzidas

### 1.1 Divergência de nome do banco

O workflow usava `portal_analytics_test`, enquanto os testes de integração fixavam
`expectedDatabase: 'validation_b1_test'` em cinco pontos de `capture.integration.spec.mjs` e no
agendamento de cleanup. Em banco limpo, os testes de cleanup falhavam com:

```text
Cleanup no banco inesperado: portal_analytics_test
```

A execução inicial reproduziu **105 pass, 13 fail, 17 cancelled**.

### 1.2 Ordem de roles e migrations

As migrations condicionais dependem de roles preexistentes:

- `003_phase4_html_capture.sql`, `004_phase4_audit_fixes.sql` e
  `006_phase2_runtime_grants.sql` concedem privilégios a `analytics_runtime`;
- `005_phase4_cleanup_role.sql` concede privilégios a `analytics_cleanup`.

O workflow executava `db:migrate:test` antes de criar as roles. Em um banco limpo, as migrations
005/006 eram registradas sem conceder os grants; quando os testes criavam as roles depois, o runner
considerava as migrations já aplicadas e não reaplicava os grants. O mesmo problema ocorria dentro da
suíte: `collect.integration.spec.mjs` migrava antes de `capture.integration.spec.mjs` criar as roles.

As migrations históricas não foram alteradas.

### 1.3 Timeout de envio no Node.js 22

`enviarEvento` usa `AbortSignal.timeout(25)` no teste de aborto. O timer interno do
`AbortSignal.timeout` não mantém o event loop vivo. O `fetchImpl` simulado ficava pendente e o test
runner do Node.js 22 encerrava o teste com:

```text
Promise resolution is still pending but the event loop has already resolved
```

Isso cancelava o restante de `capture-hardening.spec.mjs` (5 pass, 17 cancelled no teste isolado).
Não era necessário aumentar o timeout global nem o timeout do teste.

---

## 2. Configuração canônica do banco de testes

O nome canônico adotado é **`validation_b1_test`**.

Justificativa:

- é o nome usado pelos relatórios anteriores de migrations e cleanup;
- é o banco esperado pelos testes de integração do B1;
- o cleanup valida a identidade do banco contra esse nome;
- mantém uma única configuração explícita para o job de analytics.

Alterações:

- `.github/workflows/ci.yml`: `POSTGRES_DB` e `TEST_DATABASE_URL` agora usam
  `validation_b1_test`;
- `scripts/migrate.mjs`: exemplo da mensagem de erro atualizado para `validation_b1_test`;
- os testes rejeitam imediatamente uma URL cujo banco não seja `validation_b1_test`, desde que
  `ANALYTICS_TEST_DB=1`;
- a preparação de roles também rejeita banco divergente antes de abrir conexão útil.

Guard verificado com `portal_analytics_test`:

```text
Preparação de roles bloqueada: Banco de teste não autorizado; use validation_b1_test.
```

A mesma URL indevida fez `npm run test:analytics` terminar com código 1 antes de executar a suíte.

Não houve conexão com Neon, banco de homologação ou produção.

---

## 3. Ordem correta de preparação

A ordem reproduzível passou a ser:

1. criar as roles de teste;
2. aplicar as migrations 001–006;
3. executar os testes;
4. encerrar pools e processos.

Foi criado `scripts/test-db.mjs`, que:

- valida `TEST_DATABASE_URL`, `ANALYTICS_TEST_DB=1` e `NODE_ENV != production`;
- exige exatamente `validation_b1_test`;
- cria, de forma idempotente, as roles:
  - `analytics_runtime`;
  - `analytics_cleanup`;
  - `validation_b1_cleanup`;
- usa senhas sintéticas exclusivas de teste;
- mantém todas as roles sem `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION` ou `BYPASSRLS`;
- mantém `validation_b1_cleanup` com `NOINHERIT`.

O `package.json` recebeu:

```text
npm run db:roles:test
```

O workflow executa essa etapa antes de `db:migrate:test`. As duas suítes de integração também
chamam a preparação de roles antes de executar o runner de migrations, tornando a suíte
autossuficiente mesmo sem o passo explícito do CI.

Os testes usam o usuário administrativo apenas para preparação, migrations, criação de roles e
`TRUNCATE`. As verificações de runtime, cleanup e privilégios usam as roles restritas
`analytics_runtime`, `analytics_cleanup` e `validation_b1_cleanup`.

---

## 4. Correção do timeout

A correção foi restrita ao teste:

- foi adicionado um timer de referência de 1.000 ms em volta da chamada de `enviarEvento`;
- o timer é removido no `finally`;
- o timeout real do envio continua em 25 ms;
- nenhum timeout global, de suite ou de PostgreSQL foi aumentado;
- `DEFAULT_CAPTURE_TIMEOUT_MS` e `lerTimeoutCaptura` não foram alterados.

O teste de timeout passou a sobreviver ao comportamento do event loop do Node.js 22 e não deixa
temporizador pendente após o término. As conexões dos pools são encerradas nos `after` existentes.

---

## 5. Evidência em banco limpo — Node.js 22

Ambiente: container oficial `node:22-bookworm`, Node **v22.23.5**, PostgreSQL 16 em container
descartável. Nenhum banco Neon foi usado.

### Execução A — ordem do workflow

Banco novo, sem roles; executado:

```text
npm ci
npm run db:roles:test
npm run db:migrate:test
npm run test:analytics
```

Resultado:

- 6 migrations aplicadas;
- **135/135 testes pass**;
- 0 fail;
- 0 cancelled;
- 0 skipped.

### Execução B — suíte autossuficiente

Banco recriado vazio e suíte executada sem os passos explícitos de roles/migração:

```text
npm run test:analytics
```

Resultado:

- roles criadas pela preparação compartilhada da suíte;
- migrations executadas pela própria suíte;
- **135/135 testes pass**;
- 0 fail;
- 0 cancelled;
- 0 skipped.

### Execução C — banco não autorizado

Com `TEST_DATABASE_URL` apontando para `portal_analytics_test`:

- `db:roles:test` falhou com código 1 e mensagem de banco não autorizado;
- a suíte também falhou antes de executar os testes.

### Estado final do banco de teste

| Verificação | Resultado |
|---|---|
| Migrations | 6 |
| `analytics_runtime` sem atributos administrativos | sim |
| `analytics_cleanup` sem atributos administrativos | sim |
| `validation_b1_cleanup` sem atributos administrativos | sim |
| `validation_b1_cleanup` com `NOINHERIT` | sim |
| `analytics_runtime` INSERT em `html_events` | sim |
| `analytics_cleanup` DELETE em `html_events` | sim |
| `validation_b1_cleanup` DELETE em `visitors` | sim |
| `validation_b1_cleanup` CREATE no schema | não |

---

## 6. Resultados em Node.js 22 e regressão

| Verificação | Resultado |
|---|---|
| Suíte completa de analytics | **135/135 pass** |
| Integração PostgreSQL | **135/135 pass**, sem cancelamentos |
| B1 shared/b1/artifact/gate | **39/39 pass**, 0 skip |
| Consentimento B1 no Chromium | **2/2 pass** |
| SSL local | **5/5 pass** |
| Symlink Linux | passou dentro dos 39 testes B1 |
| Isolamento dos 41 arquivos | **passou** |
| Build canônico | passou; 162 HTML processados |
| Build B1 | passou; 6 arquivos + manifesto |
| `npm run deploy:b1 -- --check` | passou; `validated_only` |
| Gate | 7 estáticos, 9 Functions, 7 Edge, 0 redirects |

O B1 foi executado no mesmo container Node.js 22 com `netlify-cli@27.20.0 linux-x64`. Nenhum
deploy, login ou `--confirm` foi realizado.

O gate permaneceu sem publicação:

```json
{
  "status": "validated_only",
  "static_files": 7,
  "functions": 9,
  "edge_functions": 7,
  "redirects": 0
}
```

### Não executados

- CI remoto no GitHub Actions;
- testes de produção e Lighthouse;
- `npm test` do site raiz/Playwright;
- deploy, `--confirm`, Run now, cleanup remoto e qualquer SQL remoto.

Nenhum cancelamento foi contabilizado como aprovação.

---

## 7. Arquivos alterados

- `.github/workflows/ci.yml` — banco canônico `validation_b1_test` e etapa de roles antes das
  migrations.
- `package.json` — script `db:roles:test`.
- `scripts/migrate.mjs` — exemplo de banco canônico atualizado.
- `scripts/test-db.mjs` — novo preparador idempotente/validador de roles de teste.
- `tests/analytics/collect.integration.spec.mjs` — validação canônica e criação de roles antes das
  migrations.
- `tests/analytics/capture.integration.spec.mjs` — usa o preparador compartilhado e valida o banco.
- `tests/analytics/capture-hardening.spec.mjs` — keepalive do teste de timeout.
- `docs/analytics/fase-5f-29-estabilizacao-testes-analytics-node22.md` — este relatório.

Migrations 001–006 não foram modificadas. Nenhum código de produção foi alterado.

---

## 8. Candidatos ao Git — revisão dos 64

O conjunto de 64 arquivos da Fase 5F.28 permanece exatamente o mesmo:

- **41** arquivos B1 (`validation-b1/**`, excluindo gerados);
- **16** fontes canônicas compartilhadas em `netlify/**`;
- **7** arquivos de suporte raiz:
  - `.github/workflows/ci.yml`;
  - `package.json`;
  - `scripts/apply-analytics.js`;
  - `scripts/apply-accessibility.js`;
  - `scripts/build-assets.js`;
  - `scripts/generate-html-redirects.js`;
  - `scripts/check-b1-isolation.mjs`.

Para o job de analytics estabilizado, acrescentar **5 arquivos**:

- `scripts/test-db.mjs` (novo);
- `scripts/migrate.mjs` (modificado);
- `tests/analytics/collect.integration.spec.mjs`;
- `tests/analytics/capture.integration.spec.mjs`;
- `tests/analytics/capture-hardening.spec.mjs`.

**Total combinado: 69 arquivos candidatos.**

O job de analytics completo ainda depende de outros arquivos preexistentes de analytics
(handlers, migrations, testes e assets) que já estavam fora do recorte B1 de 64. O conjunto de 69
cobre a correção desta fase, não substitui uma revisão de todo o versionamento histórico.

### Mantidos fora

- `validation-b1/node_modules/**`;
- `validation-b1/dist/**`;
- `validation-b1/.netlify/**`;
- caches do Playwright;
- volumes e containers de teste;
- relatórios e alterações preexistentes de outras tarefas;
- arquivos gerados do raiz.

### Verificações de segurança

- nenhum `.env` nos candidatos;
- nenhum token, chave privada, credencial real ou URL de produção indevida;
- senhas de teste são fixtures sintéticas;
- nenhum dump, log ou dado pessoal;
- lockfile B1 incluído;
- nenhuma publicação automática no workflow.

---

## 9. Índice Git

Nenhum `git add` foi executado. O índice permanece sem os candidatos.

Os arquivos B1 continuam como 41 entradas não versionadas. As alterações desta fase também estão
somente no working tree. Não houve commit, push ou PR.

---

## 10. Riscos e pendências

- CI remoto ainda não executado; a execução local em Node.js 22 é a evidência disponível.
- O versionamento dos 69 candidatos e a validação em checkout limpo dependem de autorização.
- O job de analytics completo ainda precisa dos demais arquivos preexistentes de analytics.
- TOCTOU do gate B1 permanece residual e **não aceito**; esta fase não alterou o gate.
- A preparação assume execução exclusiva com `--test-concurrency=1` e banco descartável.
- O usuário administrativo do PostgreSQL é usado somente para setup/migrations; as verificações de
  permissão usam roles restritas.

---

## 11. Confirmação de ausência de operações remotas

- Nenhum acesso autenticado à Netlify ou ao Neon.
- Nenhum deploy, login, link ou `--confirm`.
- Nenhum Run now, cron ou cleanup remoto.
- Nenhum SQL remoto, role/grant remoto ou migration remota.
- Nenhuma variável ou flag remota alterada.
- Nenhum crédito Netlify consumido.
- Nenhum `git add`, commit, push ou PR.
- Nenhum CI remoto executado.
- Nenhuma alteração em produção.

A rede foi usada apenas para imagens Docker oficiais, npm e o navegador Playwright.

---

## 12. Classificação final

**1 — Aprovado (escopo local).**

As causas foram reproduzidas e corrigidas: banco canônico único, roles criadas antes das migrations,
suíte autossuficiente em banco limpo e teste de timeout compatível com Node.js 22. A suíte completa
passou 135/135 e toda a regressão solicitada foi aprovada. O CI remoto, o versionamento e a
aceitação do risco TOCTOU continuam pendentes de autorização específica.

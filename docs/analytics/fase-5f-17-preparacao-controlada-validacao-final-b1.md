# Fase 5F.17 — Preparação controlada da validação final B1

Status: **preparação local concluída; nenhuma operação remota executada; nenhum código, teste,
configuração, migration, role ou dado alterado**.
Data: **2026-11-17**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** A alternativa **A** é a próxima etapa recomendada,
mas somente em janela autorizada, com o código 5F.14 publicado no preview, dados de teste isolados e
dry-run/preflight comprovados. A validação do cron continua fora do escopo de A.

---

## 1. Resumo executivo

A Fase 5F.16 recomendou uma estratégia em etapas:

1. **C** para manter a implementação local estável;
2. **A** para validar o runtime e a limpeza manual no preview B1 com `Run now`, sem cron;
3. **B** somente se o cron real for requisito de aceitação.

Esta fase confirma que a recomendação continua tecnicamente adequada. O código canônico e a cópia
B1 estão sincronizados (16/16 hashes), a proteção de cascata e o orçamento global estão implementados,
e os testes locais registrados são abrangentes.

A execução de A ainda não pode ocorrer com DELETE real sem:

- novo deploy preview do código 5F.14;
- dry-run ou preflight que prove que somente dados de teste são elegíveis;
- janela autorizada para alterar a flag e executar `Run now`;
- confirmação de que a conexão de cleanup é a role `validation_b1_cleanup` no banco
  `validation_b1`, nunca `neondb` ou produção.

O deploy conhecido `6afb78132cdffef6e6a05696` é anterior à 5F.14. Testes e configurações locais não
são evidência de código publicado.

---

## 2. Referências consultadas

- `docs/analytics/fase-5f-16-consolidacao-tecnica-e-plano-validacao-final-b1.md`
- `docs/analytics/fase-5f-15-verificacao-memberships-e-arquitetura-cleanup-b1.md`
- `docs/analytics/fase-5f-14-correcao-orcamento-e-integridade-cleanup-b1.md`
- `docs/analytics/fase-5f-13-auditoria-independente-rate-limit-runtime-cleanup-b1.md`
- `docs/analytics/fase-5f-11-criacao-role-cleanup-b1.md`
- `netlify/functions/_lib/cleanup-retention.mjs`
- `netlify/functions/cleanup-html-capture.mjs`
- `netlify/functions/capture-html.mjs`
- `netlify/functions/collect.mjs`
- `netlify/edge-functions/html-capture.js`
- `netlify/functions/_lib/config.mjs`
- `validation-b1/`
- `db/migrations/` e `database/b1/`
- `.env.example`, `README.md`, `netlify.toml`
- testes em `tests/analytics/` e `validation-b1/tests/`

Nenhuma consulta remota foi feita nesta fase. O estado remoto citado é o documentado nas fases
anteriores.

---

## 3. Decisão técnica e justificativa

### Alternativa recomendada pela 5F.16

A 5F.16 recomendou **A** como caminho mínimo para a validação em homologação:

- preview B1;
- código 5F.14;
- flag de cleanup ativada apenas na janela;
- dados isolados;
- `Run now` manual;
- sem publicar e sem cron.

A 5F.16 reservou **B** para validar o cron real e **C** para encerrar somente a implementação local.

### Decisão desta fase

**Alternativa escolhida para a próxima etapa: A.**

Justificativa:

- o preview B1 suporta `Run now` manual e não expõe a função de limpeza por URL;
- A valida runtime, banco, role, lock, orçamento e logs sem criar novo site;
- A é o menor conjunto de ações que produz evidência de execução real da limpeza;
- B adicionaria site, branch, banco, role, deploy publicado e cron, aumentando custo e risco antes
  de A demonstrar que o código corrigido funciona;
- C não fornece evidência de runtime e não atende à necessidade de validação final;
- D não valida o comportamento real da Scheduled Function da Netlify.

### Limite da decisão

A **não valida o cron**. Se o critério de aceitação exigir execução automática agendada, será
necessário decidir por B em fase própria. A conclusão de A não autoriza promoção para produção.

### Pendências que impedem avançar imediatamente

1. O deploy atual não contém a 5F.14.
2. Dry-run ainda não está implementado; o DELETE real não deve ocorrer sem preflight confiável.
3. A flag `HTML_CAPTURE_CLEANUP_ENABLED` está desativada fora da janela.
4. A configuração remota atual não foi reconfirmada nesta fase.
5. A conexão direta/SSL e o tempo real de 20 s/30 s ainda não foram observados.
6. A criação de dados de teste remotos exigirá autorização.
7. O cron real e o enforcement de 429 continuam fora de A.

---

## 4. Pendências encontradas

### P0 — bloqueiam execução real

- Deploy preview com o código 5F.14 e hashes 16/16.
- Dry-run ou preflight equivalente que prove que somente test data é elegível.
- Confirmação read-only do banco, role, URL/contexto e ausência de `neondb`/produção.
- Definir e registrar os dados sintéticos de teste, sem reutilizar os 2 registros existentes.
- Janela autorizada para flag, `Run now` e restauração.

### P1 — necessárias para homologação

- Executar uma invocação manual com orçamento baixo.
- Confirmar status, tempo, lock, rollback, preservação de recentes e ausência de PII.
- Confirmar contagens antes/depois e que apenas test data foi afetado.
- Restaurar a flag e confirmar o estado desativado.
- Preservar logs e evidências.

### P2 — após homologação

- Decidir B para cron real, se necessário.
- Validar 429/IP interno em janela autorizada.
- Adicionar `run_id`, alertas e observabilidade.
- Somente depois avaliar produção.

---

## 5. Plano operacional da alternativa A

### 5.1 Arquivos que precisam estar no deploy B1

O deploy B1 deve incluir:

- `validation-b1/netlify.toml`;
- `validation-b1/netlify/functions/capture-html.mjs`;
- `validation-b1/netlify/functions/cleanup-html-capture.mjs`;
- `validation-b1/netlify/functions/_lib/capture-handler.mjs`;
- `validation-b1/netlify/functions/_lib/capture-config.mjs`;
- `validation-b1/netlify/functions/_lib/capture-validation.mjs`;
- `validation-b1/netlify/functions/_lib/cleanup-html-capture.mjs`;
- `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`;
- `validation-b1/netlify/functions/_lib/db.mjs`;
- `validation-b1/netlify/functions/_lib/http.mjs`;
- `validation-b1/netlify/edge-functions/html-capture.js`;
- `validation-b1/netlify/edge-functions/_lib/edge-capture.mjs`;
- `validation-b1/netlify/edge-functions/_lib/capture-policy.mjs`;
- `validation-b1/netlify/edge-functions/_lib/capture-limits.mjs`;
- `validation-b1/netlify/edge-functions/_lib/capture-signature.mjs`;
- `validation-b1/netlify/edge-functions/_lib/edge-env.mjs`;
- `validation-b1/netlify/edge-functions/_lib/classifier.mjs`;
- página pública mínima, `b1-consent.js`, `b1.css`, `_headers`, `robots.txt` e artefatos de
  `validation-b1/dist`;
- `validation-b1/shared-manifest.json`.

O B1 não publica a Function `collect` nem o endpoint `/api/collect`; `ANALYTICS_INGEST_ENABLED`
não é usado no fluxo B1 atual.

### 5.2 Sincronização e manifesto

Antes do deploy:

- comparar os 16 arquivos de `validation-b1/scripts/shared-files.mjs` com o canônico;
- exigir 16/16 hashes idênticos;
- conferir `validation-b1/shared-manifest.json` com `source_sha256` e `copied_sha256` iguais;
- executar o build B1 e confirmar 6 arquivos publicados + `build-manifest.json`;
- confirmar que `capture-html`, `cleanup-html-capture` e `html-capture` estão no artefato;
- procurar segredos em `dist`, ZIPs e artefatos.

Estado local atual: **16/16 hashes idênticos**, sem divergência.

### 5.3 Testes antes do deploy

1. `npm run test:analytics` com PostgreSQL 17 e `TEST_DATABASE_URL`/`ANALYTICS_TEST_DB=1`: exigir
   135/135, 0 fail, 0 skip.
2. `validation-b1`: `npm run test:all`: exigir 19/19, 2/2 e build B1.
3. Confirmar manifesto e hashes.
4. Confirmar que o build contém as correções 5F.14 e não contém segredos.

Os testes locais não foram reexecutados nesta fase; os números são a evidência registrada na 5F.14.

### 5.4 Variáveis e flags para a janela

Contexto esperado: **`deploy-preview` no Site ID B1**; nunca produção.

| Variável/flag | Estado pré-janela | Estado na janela | Observação |
|---|---|---|---|
| `CLEANUP_DATABASE_URL` | presente, secret, preview | inalterada | conexão direta B1, role cleanup |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` | temporariamente `true` | restaurar imediatamente |
| `CLEANUP_EXPECTED_DATABASE` | default `validation_b1` | default ou explícito | guarda antes do DELETE |
| `CLEANUP_EXPECTED_ROLE` | default `validation_b1_cleanup` | default ou explícito | guarda antes do DELETE |
| `RETENTION_TIME_BUDGET_MS` | default 20.000 | 20.000 ou menor | manter abaixo de 30 s |
| `RETENTION_BATCH_TIMEOUT_MS` | default 5.000 | 5.000 ou menor | timeout por lote |
| `RETENTION_SHUTDOWN_RESERVE_MS` | default 1.000 | 1.000 | margem de encerramento |
| `RETENTION_BATCH_SIZE` | default 1.000 | baixo na janela | test data pequeno |
| `RETENTION_MAX_BATCHES` | default 100 | baixo na janela | limitar trabalho |
| `DATABASE_URL` | presente | inalterada | role runtime; não usar no cleanup |
| `EDGE_CAPTURE_ENABLED` | `false` | `false` | não habilitar |
| `EDGE_ANALYTICS_ENABLED` | `false` | `false` | não habilitar |
| `ANALYTICS_INGEST_ENABLED` | ausente/desativada | inalterada | fora do B1 |
| `ALLOWED_ORIGINS` | ausente/não usada | inalterada | B1 não publica collect |

Não configurar `CLEANUP_DATABASE_URL` no contexto de produção para esta fase. Não reutilizar a role
`validation_b1_runtime` para limpeza.

### 5.5 Pré-condições para `Run now`

- Deploy preview correto, com o código 5F.14, estado `ready` e não publicado.
- IDs confirmados: Site ID, Project ID, branch `validation-b1`, database `validation_b1`.
- `CLEANUP_DATABASE_URL` disponível somente no preview e apontando para a role
  `validation_b1_cleanup`.
- `DATABASE_URL` e role runtime intactos.
- `HTML_CAPTURE_CLEANUP_ENABLED=false` antes da janela.
- 2 registros sintéticos existentes preservados e identificados.
- Test data isolado, com IDs/prefixos exclusivos e timestamps conhecidos.
- Preflight read-only dos candidatos antigos; nenhum registro fora do conjunto de teste pode estar
  elegível.
- Dry-run concluído com zero DELETE e com contagens correspondentes.
- Advisory lock livre; nenhuma outra execução.
- Conexão direta/SSL confirmada no runtime ou explicitamente aceita como pendência.

### 5.6 Execução manual

1. Ativar `HTML_CAPTURE_CLEANUP_ENABLED=true` somente no contexto preview e na janela.
2. Executar `Run now` da Scheduled Function `cleanup-html-capture` na UI.
3. Não usar cron, URL pública, `functions:invoke` remoto ou POST.
4. Coletar o retorno do Run now, logs da Function, deploy ID e horários.
5. Restaurar `HTML_CAPTURE_CLEANUP_ENABLED=false` imediatamente.
6. Confirmar o estado desativado por leitura posterior.

### 5.7 Critérios de sucesso

- preflight e dry-run sem DELETE inesperado;
- `Run now` retorna `complete`, ou `partial`/`budget_exhausted` com justificativa e sem violação;
- tempo abaixo de 20 s internos e abaixo de 30 s da plataforma;
- advisory lock adquirido e liberado;
- nenhum erro de rollback não previsto;
- somente test data antigo removido;
- os 2 registros sintéticos existentes continuam presentes;
- filhos recentes preservados;
- logs sem IP, UA, payload, credencial ou PII;
- flags restauradas para `false`;
- evidências arquivadas.

### 5.8 Critérios de falha/interrupção

Interromper imediatamente, sem repetir DELETE, se ocorrer:

- banco diferente de `validation_b1` ou role diferente de `validation_b1_cleanup`;
- conexão para `neondb`, produção ou homologação principal;
- flag ativa fora da janela;
- candidatos antigos fora do conjunto de teste;
- risco aos 2 registros sintéticos;
- lock ocupado ou concorrência não controlada;
- status `locked`, erro de validação, falha de conexão ou rollback inesperado;
- duração próxima de 20/30 s;
- qualquer exclusão de registro não sintético.

Em falha: restaurar a flag `false`, preservar logs, não reexecutar, não tentar “corrigir” dados e
não fazer deploy adicional sem autorização.

### 5.9 Como confirmar que apenas dados sintéticos B1 foram afetados

- Registrar IDs dos 2 registros existentes antes da janela.
- Criar test data com UUIDs/prefixos exclusivos e `received_at`/`last_seen_at` antigos conhecidos.
- Pré-calcular e registrar os candidatos elegíveis por tabela.
- Comparar contagens e IDs antes/depois do `Run now`.
- Exigir que a diferença seja exatamente o conjunto de IDs de teste.
- Exigir os 2 registros originais no pós-teste.
- Não usar filtros por PII; usar IDs técnicos.
- Se o conjunto de candidatos não for exatamente conhecido, interromper antes do DELETE real.

### 5.10 Como comprovar a restauração das flags

- Ler `HTML_CAPTURE_CLEANUP_ENABLED` no preview após a janela e confirmar `false`.
- Confirmar que produção continua sem a flag/URL de cleanup.
- Confirmar que o deploy/preview não executa cron.
- Registrar o estado no relatório da fase que executar A.
- Se a flag não puder ser restaurada, interromper e tratar como incidente operacional.

### 5.11 Preservação de evidências

Guardar, sem segredos:

- IDs de site, deploy, branch, database e role;
- hashes do manifesto e build;
- logs do `Run now` e da Function;
- contagens e IDs antes/depois;
- horários e duração;
- status/reason/budgetExhausted;
- snapshot das flags antes/depois;
- confirmação dos 2 registros;
- link do deploy preview e observações.

---

## 6. Alternativa B — especificação, sem criar recursos

B só deve ser considerada depois de A ou se o cron real for requisito de aceitação.

Especificação segura:

- site Netlify dedicado e mínimo, sem domínio de produção;
- branch Neon dedicada e database exclusivo, sem `neondb`/produção/homologação;
- role de cleanup exclusiva e senha em cofre;
- `CLEANUP_DATABASE_URL` apenas no contexto publicado do site de teste;
- `HTML_CAPTURE_CLEANUP_ENABLED=true` apenas no site de teste;
- função sem URL pública de manutenção;
- dados sintéticos com IDs exclusivos;
- cron inicial de baixa frequência ou janela manual controlada;
- logs, contagens e critérios de rollback;
- custo e créditos monitorados;
- autorização separada para criar site, branch, DB, role, deploy e cron.

B não é escolhida agora porque aumenta a superfície e o custo antes de A comprovar o runtime.

---

## 7. Alternativa C — critérios de encerramento local

C pode ser escolhida somente se o objetivo for encerrar a validação local sem runtime remoto.

Critérios:

- 135/135 analytics;
- 19/19 B1;
- 2/2 consentimento;
- build e 16/16 hashes;
- 2 registros sintéticos preservados;
- documentação de que runtime, cron, SSL/direto e enforcement não foram validados.

Limitações que permanecem: conexão Netlify→Neon, Run now, deadline real, cron, logs reais, 429 e
produção.

---

## 8. Revisão de segurança operacional

| Controle | A | B | C |
|---|---|---|---|
| Não usa banco principal de homologação | exigir `validation_b1` | exigir DB dedicado | não se aplica |
| Não usa produção | preview B1 | site/DB dedicado | não se aplica |
| Não usa role runtime para cleanup | `validation_b1_cleanup` | role dedicada | não se aplica |
| Não usa credencial de produção | só preview | só site de teste | não se aplica |
| Não habilita ingestão/captura além do necessário | flags off | flags off | flags off |
| Não permite cleanup acidental | flag false; janela | flag/cron isolado | flag false |
| Não depende de endpoint público | Run now UI | função sem URL | não se aplica |
| Não remove dados não sintéticos | test IDs + preflight | DB/test data isolado | não se aplica |
| Orçamento 20 s / limite 30 s | testar | testar | local |
| Cleanup desativado fora da janela | exigir restauração | cron controlado | sempre |

Condições não comprováveis apenas localmente: configuração remota atual, comportamento do runtime
Netlify, conexão real Netlify→Neon, SSL/direto no runtime, deadline real, cron e logs publicados.

---

## 9. Estimativa de tempo e créditos

### A

- Tempo: 1 janela de aproximadamente 30–60 minutos, incluindo deploy e preflight.
- Deploy: 1 preview; reservar até 15 créditos por prudência, embora medições anteriores tenham sido
  0.
- Execuções: 1 dry-run/preflight e 1 Run now real, com compute/requests adicionais.
- Sem novo site, branch, database ou cron.

### B

- Tempo: aproximadamente 2–4 horas para criar e validar site/branch/DB/role, deploy e cron.
- Custo: deploy publicado + cron diário; ~2,5 créditos/mês de compute em uma função de 30 s/1 GB,
  além de requests, banda e Neon. Não presumir zero.
- Saldo documentado: 139,3888263442; não consultado nesta fase.

### C

- Custo remoto: zero.
- Não valida runtime/cron.

---

## 10. Ações que exigem autorização explícita

- Implementar dry-run ou qualquer alteração local de código/teste.
- Fazer deploy preview ou deploy publicado.
- Alterar `CLEANUP_DATABASE_URL` ou flags.
- Executar `Run now`, cron ou limpeza.
- Criar/alvo B: site, branch, database ou role.
- Executar SQL/leitura remota de preflight.
- Inserir dados sintéticos de teste.
- Alterar ou remover os 2 registros sintéticos.
- Fazer commit, push ou PR.
- Promover deploy ou tocar produção/homologação.

Nenhuma dessas ações foi executada nesta fase.

---

## 11. Classificação final

**2 — Aprovado com pendências.** A alternativa A está fundamentada e é o menor caminho para validar
runtime e limpeza manual. A preparação local está concluída, mas a execução depende de dry-run,
deploy preview do código 5F.14, dados isolados e autorização de janela. Cron, B, SSL/direto em
runtime e enforcement de rate limiting continuam pendentes.

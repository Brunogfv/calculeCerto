# Fase 5F.40 - Integridade do artefato, isolamento completo e privacidade

Status: **correcoes locais implementadas e validadas; nenhuma publicacao, deploy, commit, push,
alteracao Netlify/Neon ou operacao remota executada**.
Data/hora de referencia: **2026-11-20T14:10:00Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (HEAD `665f0b3`, executado antes das alteracoes desta fase).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Ambiente local de banco: PostgreSQL 16 descartavel; nenhum banco remoto foi consultado ou alterado.

**Classificacao: 2 - Aprovado com pendencias.**
Os tres bloqueadores foram tratados localmente: handoff de artefato com digest, isolamento do pacote
B1 e remocao da persistencia do User-Agent bruto. A validacao remota pos-publicacao, a migracao
remota e a janela TOCTOU residual de filesystem ainda impedem classificar a fase como 1 e impedem
aprovar a publicacao. Nada foi publicado.

---

## 1. Resumo executivo

- O artefato B1 agora possui um **digest SHA-256 do conteudo final** (dist, Functions, Edge e
  `netlify.toml`), calculado depois da validacao e do congelamento.
- O deploy do gate recebe o diretorio e o digest; `validarHandoff` revalida o pacote e recalcula o
  digest imediatamente antes do spawn do CLI.
- Testes cobrem mutacao, exclusao, inclusao, substituicao, manifesto adulterado, reutilizacao de
  digest antigo, falha de empacotamento e diferenca de symlink entre Windows e Linux.
- O isolamento B1 foi exercitado com uma raiz contendo `collect.mjs`, `_redirects` e `_headers`
  canonicos: o pacote continuou com apenas os recursos B1.
- O comando preparado usa `cwd` no pacote, `--dir` do `dist` do pacote, `--functions` explicito,
  `--site` B1, `--no-build` e nunca `--prod`.
- `/api/collect` nao entra no pacote B1; nao ha `_redirects`, redirects ou headers canonicos no
  artefato.
- O UA bruto deixou de ser gravado em `sessions`; a migration local `007` remove a coluna. A
  classificacao derivada (`browser`, `os`, `device_type`, `is_test`) permanece.
- A migration foi aplicada em PostgreSQL 16 local: 7 migrations e zero coluna `user_agent` em
  `sessions`.
- Analytics: **137/137 pass**; B1 Windows: **44/45 + 1 skip**; B1 Linux Node 22: **45/45**;
  Playwright: **62/62**; test-local: **162/162**; SSL: **5/5**; isolamento: **41 arquivos
  preservados**; build canonico: **162 HTML**.

---

## 2. Estado inicial e final do Git

| Verificacao | Inicial | Final |
|---|---|---|
| Branch | `feat/portal-analytics` | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` | mesmo |
| Remote | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` | mesmo |
| Indice Git | vazio | vazio |
| Arquivos staged | 0 | 0 |
| Commit/push/PR | nao | nao |
| Deploy/publicacao | nao | nao |
| Alteracoes preexistentes | preservadas | preservadas |

Arquivos de conteudo alterados nesta fase:

- `netlify/functions/_lib/collect-handler.mjs`;
- `tests/analytics/collect.integration.spec.mjs`;
- `validation-b1/scripts/artifact.mjs`;
- `validation-b1/scripts/deploy-b1.mjs`;
- `validation-b1/tests/artifact.spec.mjs`;
- `validation-b1/tests/gate.spec.mjs`.

Novo:

- `db/migrations/007_remove_session_user_agent.sql`.

O working tree continua com alteracoes anteriores e relatorios nao versionados. Nao houve reset,
clean, checkout destrutivo, amend, rebase ou force push.

---

## 3. Diagnostico TOCTOU

### 3.1 Fluxo anterior

```text
sync-shared -> build -> criarPacote em diretorio temporario
-> validarPacote
-> congelarPacote (chmod)
-> validarPacote novamente
-> deployNetlify(dir) com o mesmo diretorio
```

Esse fluxo ja evitava reconstruir um segundo pacote e ja congelava permissoes, mas nao fornecia um
digest do conteudo final ao handoff. A janela residual era o intervalo entre a ultima validacao e a
leitura dos arquivos pelo CLI, inclusive contra alteracao pelo mesmo usuario.

### 3.2 Fluxo atual

```text
sync-shared -> build -> criarPacote
-> validarPacote
-> congelarPacote
-> validarPacote
-> digestArtefato(dir) duas vezes; se divergir, abortar
-> handoff: dir + digest
-> deployNetlify: validarPacote(dir) + digestArtefato(dir)
-> se digest divergir, abortar antes do spawn
-> Netlify CLI: cwd=dir, --dir=dir/dist, --functions=dir/netlify/functions
```

O digest e calculado sobre:

- todos os arquivos de `dist`;
- todos os arquivos de `netlify/functions`;
- todos os arquivos de `netlify/edge-functions`;
- o `netlify.toml` do pacote.

Cada arquivo entra como caminho relativo + hash SHA-256; a lista e ordenada e o resultado e
SHA-256. O digest nao depende de mtime, caminho absoluto ou ordem de leitura.

### 3.3 Limitacao honesta

O digest detecta qualquer alteracao **ate a ultima verificacao antes do spawn**. Depois dessa
verificacao e antes de o processo CLI abrir os arquivos, ainda existe uma janela de filesystem para
um processo concorrente com o mesmo usuario. `chmod` reduz escrita acidental, mas nao e uma
imutabilidade absoluta de Windows/Linux.

Nao foi implementada uma assinatura externa, um uploader que receba o buffer em memoria ou uma
verificacao pos-upload dos hashes remotos. Portanto:

- o handoff local e forte e testado;
- a imutabilidade absoluta nao e declarada;
- a prova final de identidade remota depende da janela de publicacao e da verificacao pos-upload;
- o TOCTOU residual permanece pendencia e a publicacao nao e aprovada nesta fase.

---

## 4. Testes de integridade TOCTOU

Testes executados em `validation-b1/tests/gate.spec.mjs` e `validation-b1/tests/artifact.spec.mjs`:

| Caso | Resultado |
|---|---|
| Arquivo modificado apos a primeira validacao | detectado; deploy nao chamado |
| Arquivo excluido | detectado por `validarHandoff` |
| Arquivo adicional | detectado por `validarHandoff` |
| Conteudo substituido | detectado por `validarHandoff` |
| Digest alterado durante a selagem | detectado; deploy nao chamado |
| Manifesto com hash adulterado | rejeitado |
| Manifesto regenerado com conteudo nao autorizado | rejeitado |
| Digest de outro pacote reutilizado | rejeitado |
| Hash entregue ao handoff diferente do validado | rejeitado |
| Interrupcao/falha de build ou empacotamento | deploy nao chamado |
| Symlink fora do diretorio autorizado | skip no Windows; pass no Linux |
| Arquivo ausente/extra no pacote | detectado |
| Chave duplicada no manifesto | rejeitada |
| Caminho absoluto/traversal | rejeitado |

O teste `deploy usa somente dist e functions do pacote isolado` verifica os argumentos explicitos
do CLI. O teste `publica somente o diretorio e o digest...` verifica que o mesmo `dir` e o mesmo
`digest` chegam ao deploy.

**Nao foi realizado deploy para validar o handoff**, pois isso nao e autorizado nesta fase.

---

## 5. Inventario de Functions B1

Origem: copias controladas pela allowlist `validation-b1/artifact-contract.json`; os arquivos
compartilhados sao conferidos pelo `shared-manifest.json` (16 origens canonicas).

| # | Caminho | Entrada/suporte | Finalidade | Dependencias B1 | Classificacao |
|---:|---|---|---|---|---|
| 1 | `capture-html.mjs` | entrada | receber captura HMAC da Edge | `_lib/capture-handler`, `_lib/db` | Necessario |
| 2 | `cleanup-html-capture.mjs` | entrada agendada | executar retencao do HTML | `_lib/db`, `_lib/cleanup-html-capture` | Necessario |
| 3 | `_lib/capture-config.mjs` | suporte | flags, limites e configuracao da captura | `edge-functions/_lib/capture-limits` | Necessario |
| 4 | `_lib/capture-handler.mjs` | suporte | validar HMAC, nonce, payload e persistir captura | `db`, `http`, `capture-validation`, `capture-config`, `capture-signature` | Necessario |
| 5 | `_lib/capture-validation.mjs` | suporte | validacao do payload de captura | `capture-policy` | Necessario |
| 6 | `_lib/cleanup-html-capture.mjs` | suporte | adapter da rotina de retencao | `cleanup-retention` | Necessario |
| 7 | `_lib/cleanup-retention.mjs` | suporte | retencao, lotes, lock e orcamento | PostgreSQL | Necessario |
| 8 | `_lib/db.mjs` | suporte | pool e transacao | `pg` | Necessario |
| 9 | `_lib/http.mjs` | suporte | respostas, corpo, cabecalhos e helpers | Web APIs | Necessario |

Nenhuma Function foi mantida apenas porque apareceu em build anterior. Todas participam do grafo
das duas entradas ou de suas dependencias; a allowlist e a fonte de verdade.

---

## 6. Inventario de Edge Functions B1

| # | Caminho | Entrada/suporte | Finalidade | Dependencias B1 | Classificacao |
|---:|---|---|---|---|---|
| 1 | `html-capture.js` | entrada Edge | interceptar HTML publico sem alterar a resposta | `edge-capture`, `edge-env` | Necessario |
| 2 | `_lib/capture-limits.mjs` | suporte | limite de corpo e timeout | Web APIs | Necessario |
| 3 | `_lib/capture-policy.mjs` | suporte | consentimento, DNT/GPC, escopo e flags | Web APIs | Necessario |
| 4 | `_lib/capture-signature.mjs` | suporte | HMAC canonico Edge -> Function | Web Crypto | Necessario |
| 5 | `_lib/classifier.mjs` | suporte | classificacao de trafego | Web APIs | Necessario |
| 6 | `_lib/edge-capture.mjs` | suporte | orquestrar captura assincrona e `waitUntil` | `classifier`, `capture-signature` | Necessario |
| 7 | `_lib/edge-env.mjs` | suporte | allowlist de ambiente do Edge | Web APIs | Necessario |

Nao ha `collect` nem Edge Function adicional. Nenhum recurso foi classificado como
**nao determinado**.

---

## 7. Configuracao Netlify B1

### 7.1 Configuracao fonte

`validation-b1/netlify.toml` define build B1, `publish=dist`, Edge, Node 22, flags de npm e Functions.
Ela nao e a configuracao do site canonico.

### 7.2 Configuracao do pacote

`criarPacote` gera um `netlify.toml` fechado:

```toml
[build]
  publish = "dist"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify/functions"
```

- sem `base`;
- sem `command`;
- sem `[[redirects]]`;
- sem `[[headers]]` extras;
- sem plugins;
- com caminhos relativos;
- hash `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`.

### 7.3 Comando preparado

`argumentosDeploy(dir)` monta:

```text
deploy
--dir <pacote>/dist
--functions <pacote>/netlify/functions
--site 9cd7034f-5691-46af-8030-d70f7ed52ca7
--no-build
--message ...
```

O `spawnSync` usa `cwd: <pacote>`. Nao existe `--prod`, `--remote` ou argumento de bypass. O Edge e
resolvido pelo `netlify.toml` do pacote; o CLI nao oferece um `--edge-functions` separado nesta
versao, mas o diretorio de projeto e o arquivo de configuracao sao do pacote.

### 7.4 Isolamento contra a raiz

Teste com fixture contendo `collect.mjs`, `_redirects` e `_headers` na raiz confirmou que o pacote:

- nao inclui `collect.mjs`;
- nao inclui `_redirects`;
- usa o `_headers` B1 (hash `cacc628a...`), nao o header raiz;
- mantem 7 estaticos, 9 Functions e 7 Edge do contrato;
- mantem 0 redirects.

O isolamento remoto ainda nao foi comprovado por um deploy atual; isso exige a janela futura.

---

## 8. Rastreamento do User-Agent

### 8.1 Cadeia antes da correcao

1. Header HTTP `User-Agent`.
2. `getUserAgent` limita a 512 caracteres e le a string.
3. `parseUserAgent` deriva `device_type`, `browser`, `os` e `isHeadless`.
4. `is_test` usa headless/flag sintetica.
5. `sessions.user_agent` recebia a string bruta.
6. A retencao de sessoes e de ate 13 meses.
7. Cleanup remove sessoes antigas, sem utilidade para a string apos a classificacao.

Tabela/campo afetado: `sessions.user_agent` (migration `001_init.sql:40`). Nao havia persistencia
do UA bruto em `pageviews`, `events`, `affiliate_clicks`, `html_events` do fluxo de sessao.

Logs e erros do `collect-handler` registram apenas `erro.code` ou `unknown`; nao registram o
payload nem o User-Agent. O teste de falha de banco com UA sintetico confirmou que a string nao
aparece no `console.error`.

### 8.2 Estrategia de minimizacao

- A string do header e usada somente durante a requisicao.
- A classificacao derivada continua sendo gravada: `device_type`, `browser`, `os`, `is_test`.
- A string bruta nao e gravada, hasheada, truncada em outro campo ou enviada a logs.
- O payload publico nao contem User-Agent; o cliente nao e fonte desse dado.
- A retencao de sessoes nao foi alterada; o dado sensivel deixou de existir.
- A migration local remove a coluna `sessions.user_agent`.

Nao foi criado campo substituto, hash ou fingerprint do UA.

---

## 9. Migration local

Arquivo: `db/migrations/007_remove_session_user_agent.sql`.

```sql
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

Teste local em PostgreSQL 16 descartavel:

- roles de teste preparadas;
- 7 migrations aplicadas, incluindo a 007;
- `information_schema.columns` retornou **0** ocorrencias de `user_agent` em `sessions`;
- analytics 137/137;
- nenhuma migration remota foi executada.

Compatibilidade:

- a migration remove dados historicos de UA bruto; nao e possivel reconstrui-los;
- a aplicacao que grava a coluna precisa ser atualizada **antes** da migration em producao; a
  aplicacao antiga nao deve continuar fazendo INSERT com `user_agent` depois do drop;
- em B1 nao existe `collect`, portanto a migration nao e necessaria para o artefato B1;
- rollback de schema pode recriar a coluna vazia (`ALTER TABLE sessions ADD COLUMN user_agent TEXT`),
  mas nao recupera os valores apagados;
- roles de runtime e cleanup continuam com grants de tabela; nao foi necessario novo grant de
  coluna.

---

## 10. Testes de privacidade

| Caso | Resultado |
|---|---|
| UA processado e classificacao derivada preservada | pass |
| UA bruto nao persistido em `sessions` | pass |
| UA bruto nao aparece nos logs/erros | pass |
| Nenhum campo alternativo com UA | pass (somente derivados) |
| Payload malformado rejeitado | pass |
| Consentimento respeitado | pass |
| Deduplicacao preservada | pass |
| Rate limit preservado | pass |
| Sessao/pageview/eventos/afiliados preservados | pass |
| Retencao de sessoes compativel | pass; 13 meses inalterados |

Testes de privacidade fazem parte da suite de analytics e da integracao PostgreSQL local; nenhum
valor real de UA foi usado nos relatorios.

---

## 11. Resultados de regressao

### 11.1 Windows, Node.js local v24.13.0

| Suite | Resultado |
|---|---|
| `npm test` B1 | 45 testes: 44 pass, 1 skip, 0 fail |
| Skip | symlink nao suportado no Windows |
| `npm run test:browser` B1 | 2/2 pass |
| `node --check` dos arquivos alterados | pass |
| `npm run deploy:b1 -- --check` | `validated_only`; 7/9/7/0 |

Skip nao contado como aprovacao; o caso equivalente passou no Linux.

### 11.2 Linux, Node.js 22 em container

| Suite | Resultado |
|---|---|
| B1 shared/b1/artifact/gate | **45/45 pass**, 0 skip |
| Node | `v22.23.5` |
| Symlink | passou |

### 11.3 Analytics e PostgreSQL local

| Suite | Resultado |
|---|---|
| `npm run test:analytics` | **137/137 pass**, 0 fail, 0 skip |
| `node --test tests/analytics/ssl-diagnostic.spec.mjs` | 5/5 pass |
| PostgreSQL | 16 descartavel |
| Migrations | 7 aplicadas |
| `sessions.user_agent` | 0 colunas |

### 11.4 Canonico e navegador

| Suite | Resultado |
|---|---|
| `npm run test:isolation` | 41 arquivos B1 preservados |
| Build canonico | 162 HTML processados |
| `npx playwright test` | 62/62 pass |
| `node scripts/test-local.js` | 162/162 pass |
| Playwright/DB | suites de integracao de banco cobertas separadamente por analytics 137/137 |

A primeira execucao de `test-local.js` excedeu o limite de 10 minutos em 150/162; a repeticao com
limite maior concluiu 162/162. O timeout foi operacional, nao uma falha de pagina.

### 11.5 CI

- CI `44733531472` no HEAD `665f0b3`: sucesso previo.
- As alteracoes locais desta fase nao foram commitadas nem executadas no CI remoto.
- Nenhum job de deploy foi criado.

---

## 12. Nao regressao canonica

- O build canonico processou 162 HTML.
- Playwright 62/62 e test-local 162/162.
- Isolamento 41 arquivos B1 preservados.
- `collect-handler` e migration sao fontes server-side, nao HTML canonico.
- Nao foram alterados scripts de build, redirects ou headers canonicos por esta fase.
- O working tree ja possuia alteracoes preexistentes; a comparacao de baseline limpo nao pode ser
  declarada sem commit autorizado.
- Nenhum arquivo de producao foi publicado.

---

## 13. Artefato final

Gate `--check`:

```text
status: validated_only
artifact_sha256: 6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339
static_files: 7
functions: 9
edge_functions: 7
redirects: 0
```

Hasheis de referencia:

| Item | SHA-256 |
|---|---|
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package-manifest.json` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `netlify.toml` (`config_sha256`) | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| `dist/index.html` | `d5c59888a9cd679c08ae3d961be7595bdd0adc18c0917a949945a3b37352f63c` |
| `dist/_headers` | `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |
| `dist/build-manifest.json` | `8db479438bb17b7475dae72d0bbb0d86487749c89c01cf1dbb5157cbe88fde29` |

O pacote temporario foi removido; o hash acima e reproduzivel por `npm run deploy:b1 -- --check`.
Nao houve publicacao remota.

---

## 14. Matriz de bloqueadores

| Bloqueador | Estado local | Evidencia | Pendencia |
|---|---|---|---|
| TOCTOU | mitigado e testado | digest, dupla validacao, handoff e teste de mutacao | janela residual antes do CLI ler; sem post-upload |
| Isolamento Netlify | resolvido no codigo | pacote fechado, cwd, `--functions`, config B1, fixture de raiz | provar em deploy B1 futuro |
| UA bruto | removido | handler sem coluna; migration 007; testes/logs | migration remota e deploy de producao |

Nao ha bypass de gate, modo permissivo ou opcao para ignorar validacao.

---

## 15. Pendencias

1. Commit autorizado das alteracoes locais.
2. Execucao de deploy B1 draft autorizado com o digest, sem producao.
3. Verificacao pos-upload: hashes, Functions, Edge, headers e redirects remotos.
4. Aceitacao formal ou mitigacao da janela TOCTOU residual.
5. Aplicacao remota da migration 007 apos o codigo que nao grava UA.
6. Teste de cleanup, rate limit, SSL e runtime B1.
7. Revisao juridica/DPO e politica de privacidade final.
8. Plano de ativacao de producao somente depois dos itens anteriores.

Nada disso foi executado nesta fase.

---

## 16. Classificacao final

- Codigo corrigido: **sim**.
- Testes locais aprovados: **sim**, com o skip de symlink Windows coberto no Linux.
- Artefato integro localmente: **sim**, com digest e handoff testados.
- Configuracao B1 isolada localmente: **sim**, com fixture de contaminacao da raiz.
- Privacidade minimizada localmente: **sim**, com migration testada em PostgreSQL local.
- Migration remota: **nao aplicada**.
- Publicacao remota: **nao realizada**.
- TOCTOU absoluto: **nao demonstrado**; residual de filesystem documentado.
- Producao: **nao alterada**.

**Classificacao: 2 - Aprovado com pendencias.**

A fase avanca a engenharia local dos tres bloqueadores, mas nao aprova publicacao, homologacao ou
producao. A proxima janela deve validar o handoff remoto e a migration em ambiente controlado.

---

## 17. Recomendacao da proxima fase

1. Autorizar commit/push e um checkout limpo do commit resultante.
2. Executar `deploy:b1 -- --confirm` somente na B1, sem `--prod`, com o digest registrado.
3. Imediatamente apos o deploy, comparar files/Functions/headers/redirects remotos com o digest e a
   allowlist; interromper em qualquer divergencia.
4. Aplicar a migration 007 em producao apenas depois do codigo que nao grava UA, com janela e
   rollback documentados.
5. Executar cleanup, rate limit, SSL e runtime em fases separadas.
6. Fazer a revisao de privacidade/DPO antes de qualquer ativacao de producao.

**A publicacao remota permanece nao realizada e nao aprovada por este relatorio.**

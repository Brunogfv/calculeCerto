# Fase 5F.43 - Endurecimento do gate e preparacao do primeiro deploy draft B1

Status: **endurecimento local concluido e simulacao integrada aprovada; nenhuma operacao remota,
deploy, upload, commit, push, migration, cleanup ou alteracao de producao executada**.
Data/hora de referencia: **2026-11-20T16:16:33Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (HEAD `665f0b3`, anterior as correcoes locais 5F.40-5F.43).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Ambiente local: Windows Node `v24.13.0`; Linux Node `v22.23.5`; PostgreSQL 16 descartavel;
Netlify CLI `27.20.0` instalada localmente.

**Classificacao: 1 - Preparado para solicitar autorizacao do primeiro deploy draft B1.**
O fluxo oficial de publicacao foi endurecido localmente, a simulacao ponta a ponta passou e a
producao esta bloqueada pelo desenho do gate. A classificacao nao autoriza deploy, upload,
migration, cleanup ou producao; a execucao remota depende de autorizacao especifica posterior.

---

## 1. Resumo executivo

- `deployNetlify` deixou de ser exportado; o caminho oficial e o gate.
- O CLI recebe apenas uma allowlist de argumentos; `--prod`, `--prod-if-unlocked`, aliases curtas,
  `--remote`, `--filter`, `--env`, `--secret-env` e argumentos desconhecidos sao rejeitados.
  `--context` so e aceito com o valor exato `deploy-preview`.
- O comando oficial usa `--dir`, `--functions`, `--site` B1, `--no-build` e
  `--skip-functions-cache`, sem `--prod`.
- O Site ID, nome, dominio e team B1 sao constantes explicitas; IDs historicos de producao e
  homologacao sao bloqueados e nao ha inferencia por diretorio ou ambiente.
- O processo filho recebe ambiente allowlist; `NETLIFY_API_URL`, `NETLIFY_SITE_ID`, `CONTEXT`,
  `NODE_OPTIONS`, proxies e outras variaveis perigosas falham antes do CLI.
- O handoff continua revalidando contrato, manifesto e digest; a trava de gate permanece.
- O teste novo de simulacao integral usa mock local, registra argumentos/ambiente/diretorio e
  verifica resposta de deploy. O CLI real nao e chamado.
- O artefato continua com 7 estaticos, 9 Functions, 7 Edge, 0 redirects e
  `artifact_sha256` `6b3cbed...` (25 arquivos no manifesto).
- Testes atuais: Analytics 137/137; B1 Windows 55 pass + 1 skip; B1 Linux 56/56; browser 2/2;
  Playwright 62/62; test-local 162/162; SSL 5/5; isolamento 43 arquivos; build canonico 162 HTML.
- Nenhuma chamada ao CLI real, deploy, upload, migration remota, cleanup ou alteracao remota.

---

## 2. Estado inicial do Git

| Verificacao | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Indice | vazio |
| Staged | 0 |
| Working tree | alteracoes preexistentes + correcoes 5F.40-5F.43 nao commitadas |
| Commit/push/PR | nao |
| Deploy/publicacao | nao |

Achados anteriores preservados:

- `collect-handler` sem escrita de UA bruto;
- migration `007_remove_session_user_agent.sql`;
- gate com lock, digest, manifesto e revalidacao;
- contrato e allowlists B1.

Esta fase alterou apenas arquivos B1 de gate/teste, `validation-b1/package.json` e o workflow de CI.
Nenhum arquivo canonico de producao foi alterado.

---

## 3. Escopo e limites

Autorizado e executado:

- inspecao de gate, CLI, ambiente, alvos, scripts e testes;
- alteracoes locais de endurecimento B1;
- simulacao com mocks locais;
- testes/builds locais;
- documentacao.

Nao executado:

- `netlify deploy` ou qualquer upload;
- `--prod`/producao;
- Netlify remoto, Neon remoto, migration remota;
- flags, cleanup, cron, funcoes remotas;
- commit, push, PR;
- uso de credenciais remotas.

---

## 4. Inventario dos caminhos alternativos

| Caminho | Arquivo/contexto | Situacao | Risco residual |
|---|---|---|---|
| `npm run deploy:b1 -- --confirm` | `validation-b1/package.json` | Rota oficial via gate | Requer autorizacao; nao executa nesta fase |
| `node scripts/deploy-b1.mjs --confirm` | `validation-b1/scripts/deploy-b1.mjs` | Mesma rota oficial | Requer autorizacao |
| `deployNetlify` importado | `validation-b1/scripts/deploy-b1.mjs` | Removida a exportacao | Nao ha import oficial; funcao privada |
| `netlify deploy` direto | CLI instalada / documentacao historica | Fora do fluxo do projeto | Nao e bloqueavel universalmente; politica operacional |
| `node netlify-cli/bin/run.js deploy` | CLI local | Fora do fluxo do projeto | Mesma limitacao operacional |
| `argumentosDeploy` | modulo de alvo | Apenas monta argumentos; nao executa | Testavel, sem spawn |
| `montarDeploy` | modulo de gate | Valida alvo, args, digest, ambiente e caminho | Nao executa CLI |
| `deploy-integration`/testes | `tests/deploy-simulation.spec.mjs` | Mock local | Nenhum CLI real |
| `.netlify` cache | `validation-b1/.netlify` | Nao copiado por `criarPacote` | CLI externo pode usar outra base |
| `NETLIFY_API_URL` | ambiente | Rejeitado pelo gate | Nenhum endpoint arbitrario via fluxo oficial |
| `NETLIFY_SITE_ID`/`CONTEXT`/`NETLIFY_CONFIG` | ambiente | Rejeitados | Falha fechada antes do CLI |

Nao ha comando de deploy ativo em `package.json` raiz, scripts, workflow de CI ou scripts B1 alem
da rota oficial `deploy:b1`. Os comandos em `docs/` sao historicos e estao classificados como
documentacao; nao sao scripts executaveis.

Nao e possivel impedir que uma pessoa com credenciais execute o binario Netlify diretamente em sua
maquina. O projeto nao oferece esse caminho como rota oficial e a janela futura exige controle
operacional.

---

## 5. Alteracoes em `deployNetlify`

- A funcao `deployNetlify` foi tornada **privada ao modulo**; nao e mais exportada.
- `montarDeploy` foi introduzido como etapa pura e testavel: valida alvo B1, diretorio absoluto,
  `realpath`, contrato/digest, argumentos e ambiente; **nao executa o CLI**.
- `deployNetlify` e o unico ponto que faz `spawnSync`, e apenas dentro do gate.
- O binario e invocado como `node .../netlify-cli/bin/run.js`, com `shell: false`, reduzindo
  injecao por shell e variacoes de `.cmd` no Windows.
- O processo recebe allowlist de ambiente e somente os argumentos validados.

Teste comprova que `deployNetlify` nao esta exportado e que a simulacao usa `montarDeploy`, sem
chamada ao CLI real.

---

## 6. Auditoria dos comandos diretos

Pesquisa no repositorio (excluindo dependencias/caches):

- nao existe `netlify deploy` ativo em `package.json`, scripts operacionais, `.github/workflows` ou
  scripts B1;
- ocorrencias em `docs/` sao historicas/documentais e nao foram removidas;
- nao ha `--prod` ativo em scripts;
- `package.json` raiz possui `db:migrate:prod`, que e migration de banco, nao deploy;
- `validation-b1/package.json` tem apenas `deploy:b1`;
- workflow CI nao contem deploy, upload ou credenciais Netlify;
- `validation-b1/.netlify` e cache de build, nao comando, e nao e copiado para o staging.

A rota oficial e deliberadamente unica; comandos externos permanecem possiveis por natureza e
devem ser proibidos na politica operacional da janela.

---

## 7. Protecao do Site ID e dominio B1

Constantes explicitas em `validation-b1/scripts/deploy-target.mjs`:

| Campo | Valor |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Nome | `portal-contas-validation-b1` |
| Dominio | `portal-contas-validation-b1.netlify.app` |
| Team ID | `697d58587a017c3396fb416e` |
| Team nome | `BruMiTa` |

`validarDestinoB1` exige igualdade de todos os campos; IDs historicos de producao e homologacao
conhecidos sao bloqueados. Nao ha inferencia por nome de diretorio, `NETLIFY_SITE_ID` ou outro
ambiente. O `--site` do CLI e gerado apenas a partir da constante B1.

O team/dominio sao referencias historicas locais; a confirmacao remota fica para a janela
autorizada. Nao foi consultada a plataforma nesta fase.

---

## 8. Controle de argumentos do CLI

Allowlist efetiva:

- `deploy`;
- `--dir <pacote>/dist`;
- `--functions <pacote>/netlify/functions`;
- `--site 9cd7034f-...`;
- `--context deploy-preview`;
- `--no-build`;
- `--skip-functions-cache`;
- `--message <mensagem fixa>`.

Rejeitados antes do CLI:

- `--prod`;
- `--prod-if-unlocked`;
- `--remote`;
- `--filter`;
- `--context` diferente de `deploy-preview`;
- `--env`;
- `--secret-env`;
- `--trigger`;
- `--auth`;
- aliases curtas (`-p`, `-d`, `-s`, etc.);
- `--dir`/`--functions`/`--site`/`--message` com valor divergente;
- argumentos duplicados ou desconhecidos.

`--skip-functions-cache` foi adicionado para impedir que cache de Functions de uma execucao
anterior seja reutilizado. O modo e sempre draft: nao ha `--prod` no conjunto permitido.

---

## 9. Auditoria de `NETLIFY_API_URL` e ambiente

O CLI local usa `process.env.NETLIFY_API_URL` para alterar endpoint, conforme o codigo instalado.
O gate agora falha antes do CLI se essa ou outras variaveis de destino estiverem presentes.

Variaveis proibidas:

- `NETLIFY_API_URL`;
- `NETLIFY_SITE_ID`;
- `NETLIFY_CONFIG`;
- `NETLIFY_FUNCTIONS_DIR`;
- `NETLIFY_EDGE_FUNCTIONS_DIR`;
- `CONTEXT`;
- `NODE_OPTIONS`;
- `NODE_EXTRA_CA_CERTS`;
- `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`.

Qualquer `NETLIFY_*` diferente de `NETLIFY_AUTH_TOKEN` tambem e rejeitada. A allowlist repassa
somente PATH/Windows basics, home/config dirs, locale e `NETLIFY_AUTH_TOKEN` quando presente. O
token nao e impresso, nao vai para o manifesto e nao e retornado pelos testes.

Cenarios testados: endpoint inesperado, variavel ausente, destino conflitante, ambiente herdado,
token presente sem exibicao. Todos os cenarios proibidos falham antes de `spawn`.

---

## 10. TOCTOU e limitacoes

Fluxo:

```text
lock -> sync -> build -> criarPacote -> validar
-> congelar -> validar -> digest A -> digest B
-> handoff dir + digest
-> montarDeploy: valida alvo, path, args, digest, ambiente
-> spawn Node + Netlify CLI
```

Protecoes:

- staging temporario exclusivo;
- contrato independente;
- `realpath` do diretorio;
- `chmod` somente leitura;
- dupla validacao;
- digest de conteudo e manifesto;
- revalidacao no handoff;
- lock cooperativo;
- ambiente allowlist;
- arguments allowlist;
- `shell: false`;
- sem `--prod`.

Risco residual comprovado:

- entre o ultimo `validarHandoff` e a leitura dos arquivos pelo CLI ainda existe uma janela para
  processo concorrente com o mesmo usuario;
- hardlinks, junctions/reparse points e substituicao de diretorio nao sao imutabilidade absoluta;
- CLI externo e `NETLIFY_API_URL` fora do fluxo nao sao universalmente bloqueaveis;
- lock orfao apos interrupcao abrupta exige remocao/diagnostico manual;
- a trava e cooperativa, nao um lock de filesystem;
- nao ha assinatura do manifesto nem verificacao pos-upload automatica.

A janela e aceitavel **somente** para uma homologacao B1 draft com sessao exclusiva, nenhum comando
externo, digest registrado e verificacao pos-upload. Nao e aceitavel como garantia isolada para
producao.

---

## 11. Manifesto e integridade

Revalidacao atual:

| Campo | Valor |
|---|---|
| `execution_id` | `40cdca12-c923-4006-b374-957d086877fd` |
| `validated_at` | `2026-11-20T16:00:39.533Z` |
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package_manifest_sha256` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Estaticos | 7 |
| Functions | 9 |
| Edge | 7 |
| Config | 1 |
| Metadata | 1 |
| Total | 25 arquivos |
| Bytes | 81.443 |
| Gate | `validated_only` |
| Node no check | `v24.13.0` |
| CLI | `27.20.0` |

Nao ha alteracao no conteudo B1 nesta fase; o hash permaneceu estavel. O manifesto de integridade
e emitido pelo gate e o pacote nao contem `collect`, `_redirects` ou recursos canonicos.

---

## 12. Inventario B1

Estaticos: `_headers`, `b1-consent.js`, `b1.css`, `build-manifest.json`, `index.html`,
`robots.txt`, `validacao-encerrada.html`.

Functions (9): `capture-html.mjs`, `cleanup-html-capture.mjs`, e `_lib/capture-config.mjs`,
`_lib/capture-handler.mjs`, `_lib/capture-validation.mjs`, `_lib/cleanup-html-capture.mjs`,
`_lib/cleanup-retention.mjs`, `_lib/db.mjs`, `_lib/http.mjs`.

Edge (7): `html-capture.js`, e `_lib/capture-limits.mjs`, `_lib/capture-policy.mjs`,
`_lib/capture-signature.mjs`, `_lib/classifier.mjs`, `_lib/edge-capture.mjs`,
`_lib/edge-env.mjs`.

Todos sao necessarios ao fluxo de captura/assinatura/classificacao/cleanup; nao ha recurso nao
determinado. O pacote tem 0 redirects e headers B1 apenas.

---

## 13. Simulacao ponta a ponta

Novo teste `validation-b1/tests/deploy-simulation.spec.mjs`:

1. cria pacote B1 real em staging temporario;
2. valida contrato e digest;
3. executa `executarGate` com mock de deploy;
4. chama `montarDeploy` e registra argumentos, diretorio, ambiente e digest;
5. simula resposta de deploy;
6. valida `validarRespostaDeploy`;
7. confirma que `deployNetlify` nao e exportado;
8. testa alvo errado, IDs proibidos, `--prod`, endpoint proibido, argumento desconhecido, digest
   divergente, falha do mock e resposta sem ID/destino/contexto/URL.

Nenhum teste executa `spawnSync` com o CLI real. O mock nao envia rede.

Cenarios cobertos: fluxo valido, site errado, site de producao, `--prod`, `NETLIFY_API_URL`,
manifesto/digest, arquivo extra/ausente, configuracao canonica, importacao direta, falha de CLI
mock e resposta incompativel. A simulacao passa; falhas bloqueiam antes do CLI real.

---

## 14. Verificacao pos-upload planejada

Depois de uma futura execucao autorizada, distinguir:

1. **Local validado:** `artifact_sha256`, manifesto e 25 arquivos.
2. **Entregue ao CLI:** `montarDeploy` retorna `cliArgs`, `cwd`, `env` allowlist e digest.
3. **Deploy criado:** ID, site ID, contexto `deploy-preview`, `published_at=null`, URL B1.
4. **Publicado:** lista de arquivos/tamanhos; download de estaticos para SHA-256; Functions/Edge
   por inventario e metadados; headers/redirects observados.

`validarRespostaDeploy` aceita apenas ID, site B1, contexto draft, sem `published_at` e URL B1
(ou subdominio `--portal-contas-validation-b1.netlify.app`). A resposta mock e testada; a resposta
real sera obtida na janela.

Limitacoes:

- API Netlify pode nao expor bytes completos de Functions/Edge;
- SHA-1 de files da API nao e SHA-256 do manifesto;
- nao se declara equivalencia byte a byte sem download/comparacao;
- hash local nao prova isoladamente o conteudo remoto.

---

## 15. Plano da futura janela de deploy draft

Nao executado.

Pre-condicoes:

- commit/push autorizados e checkout limpo;
- revisao independente desta fase;
- `npm run deploy:b1 -- --check` reproduzindo 7/9/7/0, 25 arquivos e digest;
- alvo B1 constante confirmado;
- ambiente sem `NETLIFY_API_URL` e sem `NETLIFY_*` nao autorizado;
- sessao exclusiva, sem outro gate/CLI/script concorrente;
- autorizacao escrita de uma unica execucao.

Comando futuro (sem tokens no relatorio):

```text
cd validation-b1
npm run deploy:b1 -- --check
npm run deploy:b1 -- --confirm
```

Evidencias antes: digest, manifesto, args, ambiente (nomes, sem valores), site ID, commit.
Evidencias depois: deploy ID, site ID, contexto, URL, estado, files/Functions/Edge, headers,
redirects, ausencia de `collect`, producao intocada.

Interromper se: site/dominio/team divergir; enviromento proibido; digest/args divergirem; CLI
falhar; deploy nao tiver ID; contexto nao for draft; URL nao for B1; qualquer `collect`/redirect
canonico; producao for mencionada. Recuperacao: nao promover, registrar draft, remover/cancelar
somente com autorizacao; nenhuma producao.

Nao se autoriza migration, flags, ingestao, rate limit, cleanup ou deploy de producao nesta janela.

---

## 16. Plano de migration remota B1

Somente em fase separada:

- projeto `square-mountain-69641645`;
- branch `validation-b1`;
- banco `validation_b1`;
- role owner autorizada;
- preflight 001-006, coluna `sessions.user_agent` existente, 007 ausente, producao nao acessada;
- codigo sem escrita de UA implantado antes;
- snapshot/backup autorizado quando aplicavel;
- aplicar 007 via runner owner em transacao;
- verificar 7 migrations, coluna ausente, analytics/integracao;
- registrar sem secrets;
- interromper em divergencia; rollback recria coluna vazia, sem recuperar dados apagados.

Nao aplicar no Neon nesta fase.

---

## 17. Matriz operacional

| Etapa | Pre-condicao | Evidencia | Aprovacao | Interrupcao | Recuperacao | Autorizacao |
|---|---|---|---|---|---|---|
| Gate local | Checkout/digest | 7/9/7/0; 25 arquivos; `artifact_sha256` | hashes estaveis | divergencia | revalidar | local |
| Handoff | Gate + lock | args allowlist, digest, env | mesmo conteudo | mudanca/ambiente proibido | abortar | local |
| Deploy draft B1 | Autorizacao escrita | deploy ID/site/contexto | B1 draft unico | ID/contexto/site errado | manter draft, registrar | remota |
| Pos-upload | Deploy ID | files/Functions/Edge/headers | inventario B1 | divergencia | nao promover | remota leitura |
| Migration 007 B1 | Codigo sem UA | 7 migrations; coluna ausente | schema esperado | divergencia | rollback vazio | remota |
| SSL | Role/URL | TLS/certificado | validado | nao comprovado | nao cleanup | remota |
| Ingestao | Deploy/flags | request sintetica 202 | dados esperados | erro/escrita | desligar flag | remota |
| Rate limit | Deploy | 429 no limite | bloqueio | sem bloqueio | interromper | remota |
| Consentimento | Deploy | sem/com consentimento | sem coleta indevida | coleta | desligar flag | remota |
| Privacidade | Codigo/dados | sem UA bruto | schema/logs | persistencia | bloquear | local/remota |
| Cleanup | Ingestao/roles | Run now status | escopo correto | acesso indevido | desligar flag | remota |
| Producao | Etapas anteriores | nenhuma alteracao | intocada | qualquer alteracao | interromper | fase separada |

Dependencias: nao cleanup antes de deploy/migration/SSL/ingestao/privilegios; nao migration
remota antes do codigo; nao producao sem fase propria.

---

## 18. Testes e resultados

### Windows

| Comando | Resultado |
|---|---|
| `npm test` B1 | 56 testes: 55 pass, 1 skip, 0 fail |
| `npm run test:browser` B1 | 2/2 pass |
| `npm run deploy:b1 -- --check` | `validated_only`; 7/9/7/0 |
| `node --check` novos scripts/testes | pass |

Skip: symlink no Windows; Linux passou.

### Linux Node 22

| Comando | Resultado |
|---|---|
| `node --test` B1 shared/b1/artifact/gate/deploy-simulation | **56/56 pass**, 0 skip |
| Node | `v22.23.5` |

### Analytics, banco e canonico

| Comando | Resultado |
|---|---|
| `npm run test:analytics` | **137/137 pass**, 0 skip |
| migrations locais | 7 aplicadas |
| `sessions.user_agent` | 0 colunas |
| `npm run test:isolation` | 43 arquivos B1 preservados |
| build canonico | 162 HTML |
| `npx playwright test` | 62/62 pass |
| `node scripts/test-local.js` | 162/162 pass |
| `node --test tests/analytics/ssl-diagnostic.spec.mjs` | 5/5 pass |

O isolamento subiu de 41 para 43 porque os novos `deploy-target.mjs` e
`deploy-simulation.spec.mjs` passaram a ser preservados; nao e regressao.

### Diferencas 5F.42 -> 5F.43

- B1: 47 -> 56 testes (novos testes de alvo, ambiente, args, mock e simulacao).
- B1 Windows: 46 pass -> 55 pass + 1 skip.
- B1 Linux: 47 -> 56/56.
- Isolamento: 41 -> 43 arquivos (dois novos arquivos B1).
- Analytics/Playwright/test-local/SSL mantidos.
- Nenhum CI remoto executado para o estado local.

---

## 19. Falhas, riscos e pendencias

Riscos residuais relevantes:

- janela TOCTOU entre ultima validacao e leitura do CLI;
- lock cooperativo/orfao;
- hardlinks/junctions/substituicao de diretorio nao imutaveis;
- CLI externo impossivel de bloquear universalmente;
- `executarGate` possui seam de injecao para testes; nao e rota CLI oficial;
- target/team historicos nao verificados remotamente;
- post-upload real ainda nao executado;
- `validarRespostaDeploy` testado com mock, nao com API real;
- logs da plataforma nao inspecionados;
- migration remota e dados antigos pendentes.

Correcoes locais realizadas: `deploy-target.mjs`, privacidade de `deployNetlify`, allowlist de
argumentos, `--skip-functions-cache`, ambiente controlado, target B1 e testes de simulacao.

Nenhuma pendencia impede a preparacao do **primeiro draft B1**, desde que a janela seja exclusiva,
sem flags/migration/cleanup e com verificacao pos-upload. As pendencias impedem producao.

---

## 20. Evidencias de ausencia de operacoes remotas

- Nenhum `netlify deploy`, upload, publicacao, Netlify API de escrita, Neon, migration remota,
  cleanup, cron ou flag foi executado.
- O unico teste de deploy usa `montarDeploy` e mock local; nenhum `spawn` real do CLI.
- Nenhum token/credencial foi impresso ou armazenado no relatorio.
- PostgreSQL 16 local descartavel; producao nao acessada.
- Nenhum commit, push, PR ou alteracao de historico.
- Nenhum credito remoto consumido.

---

## 21. Classificacao e decisao

**Classificacao: 1 - Preparado para solicitar autorizacao do primeiro deploy draft B1.**

Escopo da classificacao: preparacao e simulacao local. Nao autoriza deploy, upload, migration,
flags, cleanup ou producao.

Respostas objetivas:

1. **Existe uma rota oficial?** Sim: `npm run deploy:b1 -- --confirm`, via gate. `deployNetlify`
   nao e exportado; o CLI direto existe fora do projeto e nao pode ser universalmente bloqueado.
2. **O gate impede chamadas internas sem validacao?** O caminho oficial sim; `montarDeploy` valida
   alvo/dir/args/digest/ambiente e `deployNetlify` e privado. O seam de injecao de testes nao e uma
   rota CLI.
3. **O destino B1 esta protegido?** Sim, por constantes e validacao de Site ID/nome/dominio/team;
   IDs historicos de producao/homologacao sao rejeitados; a confirmacao remota ainda e pendente.
4. **O processo evita `NETLIFY_API_URL` arbitrario?** Sim; a variavel e rejeitada e o ambiente e
   allowlist.
5. **A simulacao ponta a ponta passou?** Sim, 56/56 no Linux e 55 pass + 1 skip no Windows, sem CLI
   real.
6. **Quais riscos TOCTOU permanecem?** Janela entre validacao e leitura do CLI, lock nao absoluto,
   hardlinks/junctions, CLI externo e ausencia de verificacao pos-upload automatica.
7. **E seguro solicitar um unico draft B1?** Sim, condicionado a autorizacao escrita, commit limpo,
   sessao exclusiva, sem `NETLIFY_API_URL`, sem flags/migration/cleanup, uma execucao e verificacao
   pos-upload.
8. **Condicoes da autorizacao:** site B1, Site ID acima, um draft, sem `--prod`, sem producao,
   sem migration, sem flags/ingestao/cleanup, gate obrigatorio, digest e manifesto registrados,
   interrupcao em qualquer divergencia e nenhuma promocao.

**Proxima etapa recomendada:** Fase 5F.44 somente apos revisao/autorizacao humana, limitada a um
unico deploy draft B1 e verificacao pos-upload. Nao iniciar automaticamente. Nao fazer commit,
push, deploy, upload, migration, cleanup ou alteracao de producao.

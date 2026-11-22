# Fase 5F.39 - Diagnostico e recuperacao da publicacao isolada B1

Status: **diagnostico e correcoes locais concluidos; artefato B1 validado; nenhuma publicacao,
deploy, alteracao remota, commit ou push executado**.
Data/hora de referencia: **2026-11-20T13:27:50Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (sucesso no HEAD `665f0b3`).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Relatorio anterior: `docs/analytics/fase-5f-38-pre-homologacao-controlada-b1.md`.

**Classificacao: 2 - Aprovado com pendencias.**
O artefato B1 atual esta isolado, reproduzivel e validado localmente. A causa da divergencia do
preview `6afd` foi delimitada e comprovada no nivel dos artefatos. Permanecem a janela residual
TOCTOU, a ausencia de deploy B1 publicado e as pendencias de SSL, runtime e privacidade. Esta fase
**nao aprova publicacao, homologacao nem producao**.

---

## 1. Resumo executivo

- O preview `6afd151972b2d3618033a7dd` continua sendo o unico deploy recente da B1.
- Ele esta `ready`, em `deploy-preview`, com `published_at=null`; o site continua sem
  `published_deploy` e a URL publica continua sem um deploy publicado valido.
- O preview usa a pagina B1 minima, mas publicou recursos do projeto raiz:
  - 252 redirect rules;
  - 16 header rules;
  - 3 Functions: `capture-html`, `cleanup-html-capture` e `collect`;
  - 1 Edge Function.
- O projeto raiz possui exatamente esses recursos: `_redirects` com 252 regras, `_headers` com 15
  blocos locais (16 regras processadas pelo Netlify), 3 Functions de topo e 1 Edge Function de topo.
- A B1 local possui 2 Functions de topo, 7 arquivos estaticos e 0 redirects; nao possui `collect`.
- O `Content-Security-Policy` servido pelo preview e o do `_headers` raiz (inclui
  `googletagmanager`, `google-analytics`, `doubleclick`), nao o CSP restritivo do `_headers` B1.
- A causa operacional e a resolucao de configuracao/recursos a partir da raiz do repositorio,
  enquanto o diretorio publicado apontava para o artefato estatico B1. O comando exato nao foi
  preservado nos relatorios/historico; o mecanismo esta comprovado pelos artefatos e contagens.
- O pacote atual corrige o isolamento: `dist` B1, Functions B1, Edge B1, `_headers` B1, sem
  `collect`, sem `_redirects` e com 0 redirects.
- Uma correcao local foi aplicada para tornar explicito o diretorio de Functions passado ao CLI:
  `--functions` aponta para o pacote congelado. Nenhum arquivo canonico de producao foi alterado.
- O artefato final validado tem 7 estaticos, 9 arquivos de Functions, 7 de Edge, 0 redirects e
  `config_sha256` `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`.

---

## 2. Estado inicial e final do Git

| Verificacao | Inicial | Final |
|---|---|---|
| Branch | `feat/portal-analytics` | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` | mesmo |
| Remote da branch | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` | mesmo |
| Indice Git | vazio | vazio |
| Arquivos staged | 0 | 0 |
| Commit/push/PR | nao | nao |
| Working tree | alteracoes preexistentes e relatorios nao versionados | mesmas, mais as duas correcoes locais da B1 |
| Deploy/publicacao | nao | nao |

Alteracoes de conteudo intencionais nesta fase:

- `validation-b1/scripts/deploy-b1.mjs`;
- `validation-b1/tests/gate.spec.mjs`.

O `git status` continua mostrando caminhos preexistentes alterados e relatorios nao versionados.
Nao houve `reset`, `clean`, `checkout` destrutivo, `amend`, `rebase` ou force push. O relatorio da
Fase 5F.38 e este relatorio permanecem nao versionados.

---

## 3. Reconstrucao do caminho de publicacao

### 3.1 Fluxo local atual

```text
codigo canonico do repositorio
  -> sync-shared.mjs (16 arquivos compartilhados)
  -> validation-b1/netlify/functions (9 arquivos permitidos pelo contrato)
  -> validation-b1/netlify/edge-functions (7 arquivos permitidos pelo contrato)

validation-b1/public (6 arquivos)
  -> build.mjs
  -> validation-b1/dist (6 arquivos + build-manifest.json)

validation-b1/dist
  + validation-b1/netlify/functions
  + validation-b1/netlify/edge-functions
  -> criarPacote() em diretorio temporario
  -> netlify.toml gerado (publish=dist, sem base, Functions/Edge explicitos)
  -> package-manifest.json (hashes SHA-256)
  -> validarPacote()
  -> congelarPacote()
  -> segunda validacao do mesmo diretorio
  -> Netlify CLI (somente --confirm)
       cwd = pacote temporario
       --dir = pacote/dist
       --functions = pacote/netlify/functions
```

### 3.2 Separacao de configuracoes

| Elemento | Origem/estado atual |
|---|---|
| Site/build remoto | site B1 sem build settings de repositorio; deploys sao via CLI |
| `netlify.toml` canonico da raiz | `npm run build:deploy`; publish `dist`; nao e usado pelo pacote B1 |
| `netlify.toml` B1 | publish `dist`, Functions e Edge B1; sem `base` |
| `netlify.toml` do pacote | gerado em `criarPacote`, fixo e validado |
| HTML/assets B1 | copiados de `validation-b1/public` para `dist` |
| Functions B1 | 2 entry points + 7 libs, allowlist do contrato |
| Edge B1 | 1 entry point + 6 libs, allowlist do contrato |
| Redirects | nenhum `_redirects`; contrato exige 0 |
| Headers | `_headers` B1; hash `cacc628a...` |
| Segredos | nao presentes no pacote; variaveis resolvidas pelo runtime do site |

### 3.3 Fluxo que produziu o preview divergente

```text
raiz do repositorio como base/cwd
  -> _redirects raiz (252 regras)
  -> _headers raiz (16 regras processadas)
  -> netlify/functions raiz (3 Functions de topo, incluindo collect)
  -> netlify/edge-functions raiz (1 Edge)
  + --dir apontando para o diretorio estatico B1

resultado: HTML B1 + configuracao/recursos da raiz
```

Nao se assume que a separacao de diretorios, sozinha, garante isolamento. O isolamento depende de
`cwd`, das opcoes do CLI, do `netlify.toml` usado e do diretorio efetivamente publicado.

---

## 4. Investigacao do preview `6afd`

### 4.1 Metadados remotos confirmados

| Campo | Valor |
|---|---|
| Deploy ID | `6afd151972b2d3618033a7dd` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| Branch | `null` |
| Commit | `null` (`commit_ref` e `commit_message` ausentes) |
| Origem | `deploy_source=cli` |
| `manual_deploy` | `false` |
| Titulo | `Fase 5F.18 validacao manual cleanup B1` |
| Build settings do deploy | `null` |
| Build settings do site | todos `null` no que foi consultado |
| `published_deploy` do site | `null` |
| URL publica da B1 | sem deploy publicado; a verificacao da 5F.38 retornou HTTP 404 |

Nao existe evidencia de deploy originado por Git, branch ou commit. O preview foi criado pela CLI,
sem `--prod`, e permaneceu como draft.

### 4.2 O que foi efetivamente publicado

Resumo do proprio deploy:

- 252 redirect rules processadas;
- 16 header rules processadas;
- 3 Functions: `capture-html`, `cleanup-html-capture`, `collect`;
- 1 Edge Function;
- 10 arquivos no deploy, incluindo os estaticos B1, `netlify.toml` de deploy e metadados internos
  de Edge.

Comparacao com os dois conjuntos:

| Recurso | Preview `6afd` | Raiz do repositorio | B1 esperado |
|---|---:|---:|---:|
| Redirect rules | 252 | `_redirects`: 252 regras uteis | 0 |
| Header rules | 16 | `_headers`: 15 blocos locais; 16 processadas | 1 bloco B1 |
| Functions de topo | 3 | 3 | 2 |
| `collect` | presente | presente | proibido |
| Edge de topo | 1 | 1 | 1 |
| `_redirects` no diretorio | nao | sim | proibido |

O preview contem a pagina estatica B1, mas os recursos de redirects, headers e Functions sao os da
raiz. Isso explica especificamente por que `/api/collect` apareceu: a Function `collect` esta na
raiz, nao na B1.

### 4.3 Evidencia de headers

O `Content-Security-Policy` observado no preview inclui, entre outros, `googletagmanager`,
`google-analytics`, `doubleclick` e `googlesyndication`. Esse e o CSP do `_headers` raiz.

O `_headers` B1 esperado usa `default-src 'none'`, `connect-src 'none'` e nao autoriza esses
recursos. Portanto, a resposta do preview nao aplicou o `_headers` B1; aplicou a configuracao da
raiz. O header `X-Robots-Tag` do preview tambem aparece em duplicidade, coerente com a composicao de
configuracoes.

### 4.4 Causa raiz

**Causa comprovada em nivel de artefato e resolucao de base:** o deploy usou a raiz do repositorio
como contexto de configuracao/Functions/redirects/headers, enquanto o `--dir` publicou os arquivos
estaticos do B1. O resultado e exatamente a combinacao observada.

**Limite da evidencia:** o comando shell exato nao esta preservado nos relatorios nem no historico
disponivel. Nao se afirma a string literal do comando. A afirmacao comprovada e o mecanismo de
heranca da raiz e o conjunto de recursos publicado.

A correcao ja existente no gate usa um pacote temporario com `cwd` no proprio pacote e
`netlify.toml` controlado. A correcao adicional desta fase explicita `--functions` para o diretorio
do pacote, reduzindo a dependencia de descoberta implicita do CLI.

---

## 5. Auditoria do isolamento B1

### 5.1 Conteudo local verificado

| Item | Resultado |
|---|---|
| HTML/assets B1 | 6 arquivos publicados + `build-manifest.json` |
| Functions B1 | 2 entry points + 7 libs = 9 arquivos |
| Edge B1 | 1 entry point + 6 libs = 7 arquivos |
| `collect` no B1 | ausente |
| `_redirects` no B1 | ausente |
| Redirects | 0 |
| Headers | `_headers` B1, sem `_headers` raiz |
| Segredos no pacote | nenhum literal encontrado |
| Recursos externos/GA/AdSense no HTML | ausentes |
| `netlify.toml` do pacote | sem caminho absoluto, sem `base`, publish/Functions/Edge explicitos |

### 5.2 Contrato e allowlists

O contrato continua exigindo exatamente:

- 7 estaticos, incluindo `build-manifest.json`;
- 9 Functions;
- 7 Edge Functions;
- `redirects: 0`;
- `config_sha256` do `netlify.toml` gerado.

O build e os testes rejeitam `collect`, `_redirects`, arquivos extras, arquivos ausentes, symlinks,
manifesto adulterado, hashes divergentes, caminhos absolutos e traversal. O contrato
`validated_only` nao foi enfraquecido.

---

## 6. Manifesto, hashes e integridade

Pacote final gerado a partir do `dist` atual:

| Item | Quantidade/hash |
|---|---|
| Estaticos | 7 |
| Functions | 9 |
| Edge Functions | 7 |
| Redirects | 0 |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| `package-manifest.json` SHA-256 | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `dist/index.html` SHA-256 | `d5c59888a9cd679c08ae3d961be7595bdd0adc18c0917a949945a3b37352f63c` |
| `dist/_headers` SHA-256 | `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |
| `dist/build-manifest.json` SHA-256 | `8db479438bb17b7475dae72d0bbb0d86487749c89c01cf1dbb5157cbe88fde29` |

O `package-manifest.json` contem os hashes de todos os arquivos do pacote e e comparado com o
contrato independente. O hash acima identifica o manifesto final usado nesta auditoria; o diretorio
temporario do pacote foi removido depois da verificacao.

O build tambem confirmou:

```text
shared-manifest ok: 16 arquivos.
B1 build ok: 6 arquivos publicados + build-manifest.json, 10.0 KiB.
```

---

## 7. Correcao local realizada

### Defeito/evidencia

O gate anterior ja usava `cwd` no pacote e `--dir` do pacote, mas dependia da descoberta implicita
do diretorio de Functions pelo CLI/`netlify.toml`. O preview historico demonstrou que a resolucao
implicita a partir da raiz foi capaz de incluir `collect` e os recursos raiz. A correcao torna o
alvo explicito.

### Arquivo alterado

`validation-b1/scripts/deploy-b1.mjs`

- nova funcao exportada `argumentosDeploy(dir)`;
- `--dir` aponta para `dir/dist`;
- `--functions` aponta para `dir/netlify/functions`;
- `--site` continua fixo no Site ID B1;
- `--no-build` continua obrigatorio;
- mensagem do deploy atualizada para `Fase 5F.39 preview B1 isolado`;
- verificacao de existencia de `dist` e Functions antes de chamar o CLI;
- nenhuma alteracao no codigo canonico, banco, Netlify ou Neon.

### Teste adicionado

`validation-b1/tests/gate.spec.mjs`:

- `deploy usa somente dist e functions do pacote isolado`;
- verifica `--dir`, `--functions`, `--site`;
- verifica ausencia de `--prod`;
- verifica que os argumentos nao apontam para `validation-b1`.

### Risco de regressao

Baixo e restrito ao gate B1. O CLI Netlify 27.20.0 local reconhece `--functions` (confirmado pelo
`deploy --help`). Nenhum deploy real foi executado nesta fase.

---

## 8. TOCTOU e identidade entre artefato testado e publicado

Fluxo atual:

1. `criarPacote` copia `dist`, Functions e Edge para um diretorio temporario exclusivo.
2. `validarPacote` valida contrato, manifesto, hashes e configuracao.
3. `congelarPacote` remove permissoes de escrita.
4. `validarPacote` valida novamente o mesmo diretorio.
5. O deploy recebe exatamente esse diretorio, com `--dir` e `--functions` explicitos.
6. O teste de mutacao comprova que alteracao entre a primeira e a segunda validacao e detectada.

**O artefato validado e o mesmo diretorio entregue ao deploy.** Nao ha regeneracao de um segundo
pacote depois da validacao.

Limitacao residual: `chmod` nao e imutabilidade absoluta contra o mesmo usuario; um processo
concorrente poderia restaurar permissoes e alterar o diretorio depois da segunda validacao, antes
de o CLI ler os arquivos. Nao existe assinatura externa nem verificacao pos-upload dos hashes no
destino.

Portanto:

- a identidade local e forte e testada;
- a garantia absoluta de que os bytes remotos serao identicos ainda depende de operacao exclusiva
  e verificacao pos-publicacao;
- o risco TOCTOU **nao foi aceito**.

---

## 9. Resultados dos testes

### Windows, Node.js local

| Verificacao | Resultado |
|---|---|
| `npm test` B1 | 40 testes: 39 pass, 1 skip, 0 fail |
| Skip | symlink nao suportado no Windows |
| `npm run test:browser` | 2/2 pass |
| `node scripts/build.mjs` | pass; 6 arquivos + manifesto |
| `npm run deploy:b1 -- --check` | `validated_only`; 7 estaticos, 9 Functions, 7 Edge, 0 redirects |
| Pacote | manifesto e hashes validados |
| Alteracao pos-validacao | detectada e bloqueada |
| Chave duplicada/manifesto adulterado | rejeitados |

### Linux, Node.js 22 em container

| Verificacao | Resultado |
|---|---|
| `node --test` shared/b1/artifact/gate | **40/40 pass**, 0 fail, 0 skip |
| Build B1 dentro da suite | pass |
| Symlink | passou no Linux |
| Node | `v22.23.5` no container |

O teste de navegador nao foi reexecutado no container Alpine por ausencia do Chromium Linux; ele
foi aprovado localmente no Windows e no CI de referencia.

### CI

- Workflow `44733531472`, commit `665f0b3`: sucesso em todos os jobs.
- O CI nao cobre as duas alteracoes locais desta fase, pois nao houve commit/push.
- Nenhum deploy foi executado pelo CI ou por esta fase.

---

## 10. Privacidade: bloqueador mantido

O achado da Fase 5F.37 continua valido:

- `netlify/functions/_lib/collect-handler.mjs` grava `sessions.user_agent`;
- `db/migrations/001_init.sql` define `sessions.user_agent`;
- a retencao documentada de sessoes e de ate 13 meses.

O B1 nao contem `collect` e o pacote atual nao o inclui. Isso reduz a exposicao do B1, mas **nao
corrige** o fluxo de producao nem resolve o bloqueador de privacidade. Nenhuma migration, banco ou
codigo canonico foi alterado nesta fase. A correcao de UA bruto deve ser planejada em fase propria,
com decisao de minimizacao/retencao e testes de privacidade.

---

## 11. Matriz de classificacao

| Area | Resultado | Evidencia | Pendencia |
|---|---|---|---|
| Estado Git | estavel | HEAD e remote em `665f0b3`; indice vazio; sem commit | correcoes locais nao versionadas |
| Caminho de build | isolado no codigo atual | pacote temporario; `dist`/Functions/Edge do B1 | prova final depende de deploy |
| Configuracao Netlify | site sem build settings; preview herdou raiz | site `build_settings` nulo; preview 252/16/3/1 | confirmar no deploy futuro |
| Preview `6afd` | divergente | B1 estatico + `collect` + 252 redirects + 16 headers + CSP raiz | nao reutilizar |
| Diretorio B1 | conforme contrato | 7 estaticos, 9 Functions, 7 Edge, 0 redirects | nenhuma local |
| Manifesto | valido | hashes e `config_sha256` conferem | nenhuma local |
| Integridade | forte localmente | contrato, manifesto, hashes, congelamento e dupla validacao | TOCTOU residual |
| Functions | 2 entry points + 7 libs | `capture-html`, `cleanup-html-capture`; sem `collect` | validar no deploy |
| Edge Functions | 1 entry + 6 libs | `html-capture`; config estatica B1 | validar no deploy |
| Redirects e headers | 0 redirects; `_headers` B1 | hashes `cacc...`; sem `_redirects` | verificar aplicacao remota |
| TOCTOU | mitigado, nao eliminado | freeze + dupla validacao + teste de mutacao | aceitacao/operacao exclusiva |
| Privacidade | bloqueador de producao | UA bruto em `sessions` | corrigir em fase propria |
| Testes | aprovados no escopo local | Windows 39/40 + 1 skip; Linux 40/40; browser 2/2 | CI do novo commit, se autorizado |

Separacao de estados:

- **Codigo corrigido:** sim, duas alteracoes locais B1.
- **Build local aprovado:** sim.
- **Artefato validado:** sim.
- **Configuracao remota conhecida:** sim, somente leitura.
- **Publicacao remota realizada:** nao.

---

## 12. Plano condicional para a janela de publicacao B1

**Nao executar. Proposta condicionada a autorizacao especifica, commit aprovado e decisao sobre
TOCTOU.**

| Item | Proposta |
|---|---|
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site | `portal-contas-validation-b1` |
| Commit | **pendente**: HEAD atual `665f0b3`; as correcoes locais da 5F.39 precisam de commit autorizado antes da janela |
| Artefato | pacote temporario do gate |
| Hash do manifesto | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Publish directory | `package/dist` |
| Configuracao | `netlify.toml` do pacote; sem `base`; publish `dist` |
| Functions esperadas | `capture-html`, `cleanup-html-capture` + 7 libs |
| Edge esperadas | `html-capture` + 6 libs |
| Redirects | 0 |
| Headers | `_headers` B1, SHA-256 `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |
| Variaveis necessarias | nomes apenas: `DATABASE_URL`, `EDGE_INGEST_SECRET`; `CLEANUP_DATABASE_URL` somente se o cleanup for autorizado; flags de captura/cleanup/analytics mantidas desligadas |
| Creditos | nao estimados com seguranca; a Fase 5F.18 observou cerca de 0,0008 credito em um draft, sem garantia para a proxima janela; definir teto antes |
| Riscos | TOCTOU residual; heranca da raiz se o CLI for executado fora do pacote; ausencia de prova pos-upload; SSL/cleanup/rate limit nao comprovados |
| Verificacoes pos-publicacao | URL B1 200; API de files sem `collect`/redirects; Functions 2/Edge 1; headers B1 com CSP `default-src 'none'`; hashes do pacote; schedule de cleanup presente; flags false |
| Interromper se | houver arquivo extra; `collect`; redirects > 0; header CSP da raiz; contagem de Functions/Edge divergente; hash diferente; URL nao responder; qualquer efeito em producao |
| Rollback | manter deploy draft, nao usar `--prod`; se houver publicacao B1, interromper, registrar o deploy anterior e restaurar somente com autorizacao; nenhuma acao em producao |
| Producao | proibida nesta janela |

Observacao: o plano so pode ser executado depois de uma decisao explicita sobre o risco TOCTOU e
de verificacao pos-upload. A publicacao nao esta aprovada por esta fase.

---

## 13. Operacoes que exigem autorizacao posterior

1. Commit e push das duas correcoes locais B1, se aprovadas.
2. Janela de deploy B1 com `--confirm`, sem `--prod`.
3. Verificacao pos-publicacao dos hashes e da lista de Functions/redirects/headers.
4. Aceitacao ou mitigacao formal do TOCTOU.
5. Ativacao/teste de cleanup, rate limit, SSL e runtime, em fases proprias.
6. Correcao do UA bruto em `sessions` e testes de privacidade.
7. Qualquer preparacao de producao.

Nenhuma dessas operacoes foi executada nesta fase.

---

## 14. Conclusao

- A causa do preview `6afd` esta delimitada: o deploy combinou HTML B1 com configuracao, Functions,
  Edge, redirects e headers da raiz. O `/api/collect` veio da raiz.
- O comando exato nao foi preservado; a causa foi comprovada pelos artefatos e contagens.
- O artefato B1 atual esta isolado, sem `collect`, sem `_redirects`, com 0 redirects, 7 estaticos,
  9 Functions e 7 Edge, validado e com hashes reproduziveis.
- A correcao local explicita `--functions` e adiciona teste de regressao; nenhuma alteracao
  canonica foi feita.
- O TOCTOU residual impede declarar identidade absoluta entre validacao e upload remoto.
- O UA bruto continua bloqueador de producao.
- Nenhum deploy, publicacao, commit, push, alteracao Netlify/Neon ou SQL de escrita foi executado.

**Classificacao final: 2 - Aprovado com pendencias.**
O artefato B1 esta pronto para revisao e para uma janela condicional, mas a publicacao nao esta
aprovada.

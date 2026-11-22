# Fase 5F.42 - Auditoria independente de prontidao para homologacao B1

Status: **auditoria local concluida; nenhuma operacao remota, deploy, upload, migration, alteracao
de configuracao, commit ou push executada**.
Data/hora de referencia: **2026-11-20T15:40:00Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (HEAD `665f0b3`, anterior as alteracoes locais 5F.40/5F.41).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Ambiente local: Windows Node `v24.13.0`; Linux Node `v22.23.5` em container; PostgreSQL 16
descartavel local; Netlify CLI `27.20.0` instalada localmente.

**Classificacao: 2 - Aprovado com pendencias.**
A preparacao local e consistente e os testes relevantes passaram. Ainda nao ha evidencia de
deploy/homologacao remota, a janela TOCTOU residual de filesystem nao foi eliminada e a migration
007 nao foi aplicada em banco remoto. A B1 pode receber uma autorizacao futura **limitada** de
deploy draft, mas nao uma autorizacao generica de homologacao completa, cleanup ou producao.

---

## 1. Resumo executivo

- Os relatorios 5F.37 a 5F.41 foram lidos; o estado atual corresponde ao 5F.41, com as alteracoes
  locais ainda nao versionadas.
- O gate B1 valida contrato, manifesto, hashes, configuracao, Functions e Edge; entrega ao deploy
  o mesmo diretorio e digest e revalida antes do CLI.
- O manifesto de integridade lista 25 arquivos (7 estaticos, 9 Functions, 7 Edge, config e
  metadata), com tamanhos e SHA-256 individuais, digest consolidado e versoes de ferramentas.
- O isolamento B1 foi confirmado localmente: 0 redirects, sem `collect`, sem `_redirects`, sem
  `_headers` canonico; 7/9/7 sob contrato.
- A trava de gate e um lock local por arquivo; ela impede dois gates simultaneos, mas nao impede
  um `netlify deploy` externo, nao e imutabilidade e pode ficar presa apos interrupcao abrupta.
- O TOCTOU esta **parcialmente controlado**: ha revalidacao/digest, mas permanece a janela entre a
  ultima verificacao e a leitura dos arquivos pelo CLI.
- A migration 007 remove `sessions.user_agent`; foi validada em PostgreSQL 16 local, com segunda
  execucao idempotente, SQL direto reaplicado sem erro e zero colunas `user_agent`.
- Nenhum UA bruto e gravado no codigo atual; o valor e usado apenas transitoriamente para derivar
  classificacao. Nao foi possivel provar que logs da plataforma Netlify nunca o capturem.
- Testes atuais: Analytics 137/137; B1 Windows 46 pass + 1 skip; B1 Linux Node 22 47/47;
  Playwright 62/62; test-local 162/162; SSL 5/5; isolamento 41 arquivos; 162 HTML canonicos.
- Nenhuma operacao remota foi executada ou autorizada por esta fase.

---

## 2. Estado inicial do Git

| Verificacao | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote da branch | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Indice Git | vazio |
| Staged | 0 |
| Working tree | alteracoes preexistentes + correcoes 5F.40/5F.41 nao commitadas |
| Relatorios 5F.37-5F.41 | nao versionados |
| Commit/push/PR | nao |
| Deploy/publicacao | nao |

Arquivos de conteudo relevantes ja modificados antes desta fase:

- `netlify/functions/_lib/collect-handler.mjs`;
- `tests/analytics/collect.integration.spec.mjs`;
- `validation-b1/scripts/artifact.mjs`;
- `validation-b1/scripts/deploy-b1.mjs`;
- `validation-b1/tests/artifact.spec.mjs`;
- `validation-b1/tests/gate.spec.mjs`.

Novo, ja existente antes desta fase:

- `db/migrations/007_remove_session_user_agent.sql`.

Esta fase nao alterou codigo de aplicacao; criou apenas este relatorio. Todas as alteracoes
anteriores foram preservadas.

---

## 3. Escopo, metodos e limites

### 3.1 Autorizado e executado localmente

- leitura integral dos relatorios 5F.37 a 5F.41;
- inspecao estatica do gate, manifesto, hashing, lock, CLI, migration e testes;
- execucao de builds/testes locais;
- PostgreSQL 16 local e descartavel;
- testes adversariais existentes de mutacao, deletao, inclusao, substituicao, manifesto, reuso,
  concorrencia e symlink;
- auditoria do protocolo documentado.

### 3.2 Nao executado

- deploy, upload, deploy-preview ou producao;
- chamadas Netlify de escrita ou leitura remota nesta fase;
- conexao Neon, migration remota, SQL remoto ou cleanup;
- alteracao de flags, variaveis, secrets, dominios, DNS ou producao;
- commit, push ou PR.

Toda conclusao que depender de ambiente remoto foi separada como pendencia.

---

## 4. Auditoria TOCTOU

### 4.1 Fluxo real resumido

```text
lock do gate
-> sync-shared
-> build
-> criarPacote em diretorio temporario
-> validarPacote
-> congelarPacote (chmod)
-> validarPacote
-> digestArtefato
-> segunda leitura do digest
-> handoff dir + digest
-> deployNetlify: validarPacote + digestArtefato
-> spawn do Netlify CLI
-> liberar lock e remover staging
```

### 4.2 Protecoes comprovadas

- O pacote e criado em diretorio temporario exclusivo.
- O contrato e independente e a allowlist e exata.
- O manifesto tem hashes SHA-256 por arquivo e configuracao.
- O digest e calculado sobre o conteudo real e comparado antes do handoff.
- O diretorio congelado e revalidado; mutacao entre as fases e detectada pelos testes.
- O deploy recebe o mesmo `dir` e `digest`; a chamada de `validarHandoff` ocorre antes do spawn.
- O CLI recebe `cwd` no pacote, `--dir` e `--functions` explicitos, `--site` B1, `--no-build`.
- Nao ha `--prod` no gate.
- A trava de gate impede dois gates simultaneos no mesmo arquivo de lock.

### 4.3 Achados e riscos residuais

| ID | Achado | Classificacao | Condicao de exploracao |
|---|---|---|---|
| T-01 | Janela entre a ultima validacao/digest e a leitura pelo CLI | Risco residual comprovado | Processo concorrente com o mesmo usuario e acesso ao staging |
| T-02 | Lock nao cobre CLI externo | Risco residual | Operador executa `netlify deploy` fora do gate |
| T-03 | `deployNetlify` e exportado e pode ser importado | Caminho alternativo | Script local pode chamar a funcao diretamente; ainda valida contrato/digest, mas burla o lock e o fluxo de build/sync |
| T-04 | `process.env` e herdado pelo CLI | Risco plausivel | `NETLIFY_API_URL` ou outro ambiente define destino/API inesperada |
| T-05 | `shell: true` no spawn Windows | Risco plausivel | Caminho com metacaractere em `dir`; no gate o path e temporario, mas a funcao aceita chamadas externas |
| T-06 | Interrupcao abrupta pode deixar lock e staging | Risco operacional | Kill/crash antes do `finally`; o proximo gate falha fechado ate remocao manual |
| T-07 | Hardlinks, junctions e substituicao do diretorio nao sao todos cobertos | Risco residual | Filesystem local malicioso/privilegiado; nao comprovado nesta fase |
| T-08 | Lock cross-process nao e testado com processo real | Lacuna de teste | A implementacao usa `wx`, mas o teste atual e no mesmo processo |

### 4.4 Avaliacao da protecao

**Parcial, com riscos residuais conhecidos.** Nao e insuficiente para o modelo de ameaca normal de
um operador unico, mas nao e forte o bastante para declarar imutabilidade absoluta ou eliminar a
possibilidade de contorno.

- Um processo concorrente do mesmo usuario pode alterar o staging depois da ultima verificacao.
- O lock e uma trava cooperativa; nao e um bloqueio de filesystem.
- O gate nao pode impedir `netlify deploy` externo.
- A API exportada de deploy permite caminho alternativo.
- `process.env` e outros parametros do ambiente nao sao limpos.

Para uma **homologacao B1 draft controlada**, o risco pode ser aceito somente com sessao exclusiva,
nenhum comando externo, lock, digest registrado e verificacao pos-upload. Para **producao**, nao e
suficiente.

---

## 5. Auditoria do manifesto e hashes

### 5.1 Manifesto gerado

Execucao final de `npm run deploy:b1 -- --check`:

| Campo | Valor |
|---|---|
| `execution_id` | `8c564a4d-6e01-4f20-ba8f-fc008072da63` |
| `validated_at` | `2026-11-20T15:28:40.230Z` |
| `status` | `validated_only` |
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package_manifest_sha256` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Estaticos | 7 |
| Functions | 9 |
| Edge Functions | 7 |
| Configuracao | 1 |
| Metadados | 1 |
| Total | 25 arquivos |
| Bytes | 81.443 |
| Node | `v24.13.0` |
| Netlify CLI | `27.20.0` |

O manifesto inclui todos os arquivos do pacote, caminhos relativos, bytes e SHA-256 individual. O
`package-manifest.json` interno lista os hashes de conteudo; o `integrity_manifest` e um envelope
de auditoria com execucao, tempo, ferramentas e lista.

### 5.2 Verificacoes

| Verificacao | Resultado |
|---|---|
| Lista completa de arquivos | sim, 25 |
| Arquivos extras/ausentes | rejeitados |
| Ordenacao deterministica do digest | sim; digest usa ordenacao de strings |
| Ordenacao do manifesto `files[]` | usa `localeCompare`, potencialmente dependente de locale |
| Caminho absoluto/traversal | rejeitado |
| Chave duplicada | rejeitada |
| Arquivo vazio | nao ha no pacote; hash/size seriam calculados normalmente |
| Hash consolidado reproduzivel | sim para o mesmo conteudo |
| Identidade de execucao | `execution_id` e `validated_at`; nao sao assinados |
| Reuso de manifesto antigo | conteudo identico teria o mesmo digest; o envelope antigo nao e autenticado |
| `validated_only` impede publicacao | impede `--check`, mas nao impede chamada direta de `deployNetlify`/CLI externo |
| Manifesto = artefato publicado | nao; prova apenas o pacote local |

### 5.3 Relacao entre manifestos

1. **Manifesto do pacote**: `package-manifest.json`, dentro do staging.
2. **Manifesto de integridade**: envelope `integrity_manifest` do gate.
3. **Pacote entregue**: diretorio staging + digest.
4. **Conteudo publicado**: objeto remoto; nao comprovado por hash local.

O digest local nao e assinatura e nao comprova sozinho o conteudo remoto.

---

## 6. Auditoria do isolamento B1

### 6.1 Inventario local confirmado

- 7 estaticos: `_headers`, `b1-consent.js`, `b1.css`, `build-manifest.json`, `index.html`,
  `robots.txt`, `validacao-encerrada.html`.
- 9 Functions: `capture-html.mjs`, `cleanup-html-capture.mjs`, e 7 `_lib`:
  `capture-config.mjs`, `capture-handler.mjs`, `capture-validation.mjs`,
  `cleanup-html-capture.mjs`, `cleanup-retention.mjs`, `db.mjs`, `http.mjs`.
- 7 Edge: `html-capture.js`, e 6 `_lib`: `capture-limits.mjs`, `capture-policy.mjs`,
  `capture-signature.mjs`, `classifier.mjs`, `edge-capture.mjs`, `edge-env.mjs`.
- 0 redirects; `_headers` B1 com hash `cacc628a...`; sem `_redirects`; sem `collect`.

As Functions e Edge sao necessarias ao fluxo de captura, assinatura, classificacao e cleanup; nao
ha recurso nao determinado. O inventario detalhado da 5F.40/5F.41 permanece valido.

### 6.2 Caminhos de contorno

| Caminho | Situacao |
|---|---|
| `netlify deploy` externo a partir da raiz | Possivel; nao e bloqueado pelo gate |
| `deployNetlify` importado diretamente | Possivel; valida contrato/digest, mas nao exige lock/gate |
| `netlify.toml` da raiz | Nao e lido pelo staging; pacote tem configuracao propria |
| `.netlify` cache existente na B1/raiz | Nao e copiado por `criarPacote`; staging nao contem `.netlify` |
| `NETLIFY_API_URL` | Herdado por `process.env`; pode alterar endpoint da CLI |
| `--functions` externo | `deployNetlify` usa o path do pacote, mas um CLI manual pode usar outro |
| Edge directory | Resolvido pelo `netlify.toml` do pacote; sem flag CLI separada |
| Build canonico | Nao e executado pelo gate; o gate usa `validation-b1` e staging |
| Scripts auxiliares | Podem alterar o staging se executados concorrentemente; nao ha bloqueio de filesystem |

O isolamento atual e **efetivo para execucao normal do gate**, mas **nao e universal** contra
operadores ou comandos externos.

---

## 7. Auditoria de privacidade

### 7.1 User-Agent bruto

Referencias encontradas:

| Local | Classificacao |
|---|---|
| `netlify/functions/_lib/http.mjs` `getUserAgent` | entrada transitoria |
| `netlify/functions/_lib/user-agent.mjs` `parseUserAgent` | processamento em memoria |
| `collect-handler.mjs` `uaInfo` | classificacao derivada |
| `db/migrations/001_init.sql` `sessions.user_agent` | definicao historica |
| `db/migrations/007...` | remocao persistente |
| testes de analytics | UAs sinteticos e assertions |
| documentacao | historico, sem valores reais |

Confirmado no codigo atual:

- `sessions` nao recebe `user_agent` no INSERT;
- campos derivados `device_type`, `browser`, `os`, `is_test` permanecem;
- nenhum outro campo recebe a string bruta ou hash dela;
- logs de erro do handler registram apenas `erro.code`/`unknown`;
- payload publico nao contem UA bruto.

### 7.2 Lacunas

- Logs da plataforma Netlify podem registrar cabecalhos HTTP independentemente da aplicacao; isso
  nao foi verificado remotamente.
- Dados antigos em banco remoto B1/producao permanecem ate a migration 007 ser aplicada; o B1
  remoto ainda estava em 6 migrations na 5F.38.
- A minimizacao nao foi revisada por DPO/juridico.
- Nao foi demonstrado que logs de proxy/CDN nao retem o header.
- A simples remocao da coluna nao prova ausencia de UA em logs externos.

### 7.3 Classificacao derivada

As classes `likely_human`, `likely_bot`, `automation`, `preview_or_monitoring` e `unknown` sao
heuristica documentada, nao probabilidade calibrada. O codigo calcula sem persistir a string bruta;
a classificacao derivada nao e um hash nem reconstrucao do valor.

---

## 8. Auditoria da migration 007

### 8.1 SQL

`db/migrations/007_remove_session_user_agent.sql` executa:

```sql
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

### 8.2 Validacao local

| Verificacao | Resultado |
|---|---|
| Banco vazio | 7 migrations aplicadas |
| Apos 001-006 | 007 aplicavel |
| Apos 007 | schema sem `sessions.user_agent` |
| 007 repetida pelo runner | ignorada por `schema_migrations` |
| SQL 007 direto repetido | `NOTICE ... skipping`; `ALTER TABLE` sem erro |
| `schema_migrations` | 7 entradas |
| Coluna `user_agent` | 0 |
| Analytics | 137/137 |
| Ingestao/sessao/classificacao/dedup/rate/cleanup | testes locais passaram |

### 8.3 Compatibilidade

| Estado do banco | Comportamento esperado |
|---|---|
| Antes das migrations | Cadeia normal 001-007 |
| Depois de 001-006, com coluna | 007 aplica e remove |
| Depois de 007, codigo novo | Funciona; nao referencia a coluna |
| 007 repetida pelo runner | Ignorada por checksum/registro |
| 007 direta repetida | Idempotente por `IF EXISTS` |
| Banco parcialmente migrado | Depende do estado de `schema_migrations`; pode exigir diagnostico manual |
| Coluna ausente sem registro | 007 direto e seguro; runner pode tentar migrations anteriores |

Nao ha views, indices, triggers, constraints ou funcoes de aplicacao que dependam da coluna
identificados no repositorio.

### 8.4 Risco destrutivo

A remocao apaga os valores historicos de UA bruto; nao existe rollback de dados. Recriar a coluna
vazia e possivel, mas nao recupera o conteudo. Em producao, o codigo novo deve ser implantado antes
da migration; um codigo antigo que ainda tente inserir a coluna falhara.

---

## 9. Auditoria do protocolo de publicacao

O protocolo distingue corretamente:

1. artefato local validado;
2. pacote entregue ao CLI;
3. deploy criado pelo Netlify;
4. conteudo efetivamente publicado.

Pontos fortes:

- digest e manifesto antes do deploy;
- mesmo `dir`/`digest` no handoff;
- previsao de registrar deploy ID, site ID, contexto e estado;
- previsao de verificar files, Functions, Edge, headers e redirects;
- reconhecimento de que hash local nao prova conteudo remoto.

Lacunas:

- nao ha automacao de verificacao pos-upload;
- API do Netlify pode nao expor bytes completos de Functions/Edge ou usar formato de hash diferente;
- nao ha evidencia de deploy B1 atual;
- `validated_only` nao impede comando externo;
- o protocolo nao inclui uma assinatura do manifesto;
- a verificacao de headers/redirects pode depender de comportamento do Netlify, nao apenas do
  arquivo local.

O protocolo e adequado como **procedimento de auditoria**, desde que a proxima fase registre
explicitamente as limitacoes e nao declare equivalencia byte a byte sem evidencia.

---

## 10. Plano de migration remota B1 (nao executado)

Procedimento futuro, somente apos autorizacao especifica:

1. Identificar o projeto `square-mountain-69641645`, branch `validation-b1`, banco
   `validation_b1`, role owner autorizada. Nao registrar connection string.
2. Preflight somente leitura: `schema_migrations` deve estar em 001-006, `sessions.user_agent` deve
   existir, nenhum 007 registrado, production nao acessada.
3. Confirmar deploy do codigo que nao escreve UA; se nao, interromper.
4. Criar evidencia de estado (sem dados pessoais) e, se necessario, snapshot/branch de recuperacao
   autorizado antes da alteracao.
5. Aplicar 007 via runner owner, em transacao.
6. Verificar: 7 migrations, coluna ausente, analytics/integracao em B1, sem erros.
7. Registrar comandos, saida, timestamps e hashes de evidencia; nao incluir secrets.
8. Interromper se schema divergir, se producao for tocada, se houver erro de transacao ou se a
   aplicacao antiga estiver ativa.
9. Rollback de schema: recriar coluna vazia; nao prometer recuperacao dos dados apagados.
10. Nenhuma aplicacao automatica; 5F.43 nao iniciada.

Nao aplicar 007 no Neon nesta fase.

---

## 11. Matriz operacional de homologacao B1

| Etapa | Pre-condicao | Procedimento futuro | Evidencia esperada | Interrupcao | Recuperacao | Autorizacao |
|---|---|---|---|---|---|---|
| Integridade local | Checkout/commit autorizado | `deploy:b1 --check`; comparar digests | `artifact_sha256` estavel; 7/9/7/0 | divergencia | revalidar | local |
| Handoff | Gate | lock + dir/digest + validacao | mesmo pacote no CLI | divergencia | abortar | local |
| Deploy B1 | Autorizacao de draft | CLI pelo gate, sem `--prod` | deploy ID, site ID, contexto | recurso canonico/ID errado | manter draft, registrar | remota |
| Migration 007 | Codigo novo em B1 | runner owner no banco B1 | 7 migrations, coluna ausente | schema/erro | rollback vazio documentado | remota |
| SSL | Role/URL de cleanup | diagnostico somente leitura | TLS/certificado validado | `pg_stat_ssl` inconclusivo | nao cleanup | remota |
| Ingestao | Deploy + flags controladas | requisicao sintetica | 202 e dados esperados | escrita indevida | desligar flag | remota |
| Rate limit | Deploy/flag | excesso controlado | 429 no limite | sem bloqueio | interromper | remota |
| Consentimento | Deploy | browser sem/com consentimento | sem coleta antes; coleta depois | coleta indevida | desligar flag | remota |
| Privacidade | Codigo/migration | inspecao de schema/logs | sem UA bruto | persistencia | bloquear producao | local/remota |
| Cleanup | Ingestao e privilegios comprovados | Run now em dados sinteticos | status e escopo corretos | acesso fora do escopo | desligar flag | remota |
| Producao | Todas anteriores | verificacao de nao alteracao | producao intocada | qualquer alteracao | interromper | fase separada |

Dependencias: nao executar cleanup antes de deploy, migration, SSL, ingestao e privilegios
verificados. Nao executar migration remota antes do codigo que nao grava UA. Nao executar producao
nesta sequencia.

---

## 12. Testes executados

### Windows

| Comando | Resultado |
|---|---|
| `npm test` B1 | 47 testes: 46 pass, 1 skip, 0 fail |
| `npm run test:browser` B1 | 2/2 pass |
| `npm run deploy:b1 -- --check` | `validated_only`; 7/9/7/0 |
| `node --check` | pass |

Skip: symlink nao suportado no Windows; equivalente Linux passou.

### Linux Node 22

| Comando | Resultado |
|---|---|
| `node --test` B1 shared/b1/artifact/gate | 47/47 pass, 0 skip |
| Node | `v22.23.5` |
| symlink | passou |

### Analytics e PostgreSQL local

| Comando | Resultado |
|---|---|
| roles/migrations | 7 aplicadas; repeticao ignorada |
| SQL 007 direto repetido | idempotente |
| `npm run test:analytics` | 137/137 pass, 0 fail, 0 skip |
| `sessions.user_agent` | 0 colunas |

### Canonico, navegador e SSL

| Comando | Resultado |
|---|---|
| `npm run test:isolation` | 41 arquivos B1 preservados |
| build canonico | 162 HTML |
| `npx playwright test` | 62/62 pass |
| `node scripts/test-local.js` | 162/162 pass |
| `node --test tests/analytics/ssl-diagnostic.spec.mjs` | 5/5 pass |

As suites de integracao de banco aparecem como skip no runner Playwright sem variaveis de banco;
foram executadas separadamente com PostgreSQL 16 e passaram 137/137.

### Diferencas em relacao ao 5F.41

Nenhuma regressao. O B1 passou de 47 testes com os mesmos resultados; Analytics, Playwright,
test-local, SSL e isolamento permaneceram nos mesmos totais. Nao houve novo commit/CI para o
estado local.

---

## 13. Falhas, riscos e falsos positivos

### 13.1 Riscos comprovados

- TOCTOU residual entre a ultima verificacao e o CLI.
- Lock cooperativo, nao imutabilidade.
- Lock/staging podem ficar orfaos apos interrupcao abrupta.
- `deployNetlify` exportado e CLI externo permitem caminho operacional alternativo.
- `process.env` e herdado; `NETLIFY_API_URL` pode alterar endpoint.
- `shell: true` no Windows pode ser sensivel a paths/metacaracteres.

### 13.2 Riscos plausiveis

- Hardlink/junction/reparse point e substituicao de diretorio nao testados em todos os sistemas.
- Ordenacao `localeCompare` do manifesto pode variar por locale; o digest nao usa locale.
- Logs da plataforma podem reter UA fora do controle da aplicacao.
- API Netlify pode nao permitir verificar integralmente Functions/Edge publicados.
- Configuracao cacheada em `.netlify` nao entra no pacote, mas um CLI externo pode usar outra base.

### 13.3 Limitacoes conhecidas

- Nao ha deploy B1 publicado nem runtime remoto validado.
- SSL, ingestao, rate limit, consentimento, cleanup e cron nao observados em B1.
- Migration 007 nao aplicada no Neon.
- Nao ha assinatura externa do manifesto.
- Nao ha prova byte a byte do conteudo publicado.

### 13.4 Falsos positivos

- Presenca de `user_agent` em `001_init.sql` e historico; a migration 007 remove a coluna.
- `collect` no preview `6afd` e da raiz, nao do pacote B1.
- `.netlify` existente nao e copiado para o pacote.
- Skip de symlink no Windows nao e falha de seguranca: o Linux passou o equivalente.
- Testes locais verdes nao provam deploy ou producao.

---

## 14. Correcoes locais realizadas

Nenhuma correcao de codigo foi feita nesta fase de auditoria. O objetivo era revisar, nao alterar.
As correcoes das fases 5F.40/5F.41 foram preservadas. As pendencias de hardening acima devem ser
tratadas em fase autorizada, se aprovadas:

- caminho unico de deploy/capability para `deployNetlify`;
- limpeza de ambiente e protecao contra `NETLIFY_API_URL` inesperado;
- remocao de `shell: true` ou quoting seguro;
- recuperacao/diagnostico de lock orfao;
- testes de hardlink/junction/substituicao de diretorio;
- ordenacao deterministica sem locale;
- verificacao pos-upload automatizada.

Nenhuma dessas correcoes foi executada.

---

## 15. Evidencias de ausencia de operacoes remotas

- Nenhum comando Netlify de deploy/upload/escrita foi executado nesta fase.
- Nenhuma conexao Neon ou SQL remoto foi executada.
- Nenhuma migration remota, cleanup, cron ou alteracao de flag.
- Nenhuma credencial remota foi usada ou revelada.
- Nenhum commit, push, PR ou alteracao de historico.
- O PostgreSQL usado foi local/descartavel; o servidor de test-local foi local.
- Nenhum arquivo de producao foi alterado.
- Nenhum credito remoto foi consumido.

---

## 16. Classificacao final

**2 - Aprovado com pendencias.**

Motivos:

- a preparacao local esta consistente;
- o artefato e os manifestos sao reproduziveis;
- o isolamento do pacote foi demonstrado no fluxo normal;
- a migration 007 esta validada localmente;
- os testes relevantes passaram;
- ainda existem riscos residuais de TOCTOU, caminhos alternativos de deploy e evidencia remota
  ausente.

Nao e 1 porque a janela TOCTOU nao esta eliminada, o protocolo pos-upload nao foi executado e a
migration remota nao foi aplicada. Nao e 3 porque nao ha falha critica comprovada no escopo local e
os testes passaram.

---

## 17. Respostas objetivas e proxima etapa

### 1. O B1 esta pronto para uma janela de homologacao remota controlada?

**Parcialmente.** Esta pronto para uma **autorizacao limitada de deploy draft B1**, com sessao
exclusiva, digest registrado, sem flags, sem migration, sem cleanup e com verificacao pos-upload.
Nao esta pronto para uma homologacao operacional completa nem para producao.

### 2. Quais operacoes podem ser autorizadas primeiro?

1. commit/push autorizados do conjunto local, se aprovado;
2. revisao independente do gate/manifesto;
3. um unico deploy draft B1 via gate, sem `--prod`;
4. verificacao pos-upload somente leitura;
5. diagnostico SSL somente leitura, se separado.

### 3. Quais devem permanecer bloqueadas?

- migration 007 remota;
- ativacao de flags de ingestao/Edge/cleanup;
- ingestao, rate limit e consentimento remotos;
- cleanup/Run now;
- deploy de producao;
- qualquer operacao agrupada como autorizacao generica.

### 4. Quais riscos ainda podem atingir producao?

- erro de site/ambiente no CLI ou `NETLIFY_API_URL`;
- CLI externo executado fora do gate;
- alteracao de staging por processo concorrente;
- configuracao/credencial errada no operador;
- migracao remota destrutiva no banco errado;
- logs externos de UA.

Nenhum desses riscos exige autorizacao remota para ser analisado, mas todos devem ser controlados
na janela.

### 5. Menor proxima etapa segura

**Fase 5F.43:** commit/revisao independente + uma janela B1 estritamente draft, sem producao,
sem flags e sem migration. A migration, ingestao, rate limit e cleanup ficam para fases posteriores
e autorizacoes separadas.

Nao iniciar 5F.43 automaticamente. Nao fazer commit, push, deploy, upload ou alteracao remota.

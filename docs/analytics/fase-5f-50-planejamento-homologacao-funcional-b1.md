# Fase 5F.50 - Planejamento tecnico da homologacao funcional B1

Status: **planejamento local concluido; nenhum deploy, upload, alteracao remota, migration,
cleanup, commit ou push executado**.
Data/hora de referencia: **2026-11-20T20:20:14Z**.
Deploy de referencia: `6b007a6d6e15671b125b952e`.
Site: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Digest local atual: `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`.
Artefato atual: 25 arquivos, 81.443 bytes.

**Classificacao: 2 - Plano com pendencias.**
O plano esta tecnicamente estruturado, mas depende de um novo artefato, dependencias de runtime,
variaveis/flags B1, migration 007 e uma estimativa de creditos ainda nao confirmada. Nada remoto foi
alterado.

---

## 1. Estado atual do B1

### 1.1 Artefato e deploy

| Item | Valor |
|---|---|
| Deploy | `6b007a6d6e15671b125b952e` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| `published_at` | `null` |
| `published_deploy` | `null` |
| Estaticos | 7 |
| Functions | 9 arquivos (2 entradas + 7 libs) |
| Edge | 7 arquivos (1 entrada + 6 libs) |
| Redirects | 0 |
| Functions publicadas | `capture-html`, `cleanup-html-capture` |
| Edge publicada | `html-capture` |
| `/api/collect` | ausente e intencionalmente excluido do artefato minimo |

O B1 minimo foi aprovado para HTML estatico e captura HTML, nao para o fluxo completo de analytics
de sessao. A ausencia de `/api/collect` **nao e defeito** desta fase; e uma exclusao de escopo do
artefato minimo.

### 1.2 Variaveis/contexto relevantes

Do relatorio 5F.38, no contexto `deploy-preview` estavam presentes:

- `DATABASE_URL`;
- `CLEANUP_DATABASE_URL`;
- `EDGE_CAPTURE_ENABLED=false`;
- `EDGE_ANALYTICS_ENABLED=false`;
- `EDGE_ANALYTICS_SAMPLE_RATE=0.1`;
- `EDGE_INGEST_SECRET`;
- `HTML_CAPTURE_CLEANUP_ENABLED=false`;
- `NODE_VERSION`.

Nao constavam, no levantamento daquela fase:

- `ANALYTICS_INGEST_ENABLED`;
- `ALLOWED_ORIGINS` especifico do B1;
- `RATE_LIMIT_HMAC_SECRET`.

Esses tres itens sao necessarios para o fluxo `/api/collect` e devem ser tratados em janela
autorizada, apenas no B1.

### 1.3 Banco

- B1 usa branch `validation-b1`, banco `validation_b1`;
- roles `validation_b1_runtime` e `validation_b1_cleanup`;
- o relatorio 5F.38 registrou 6 migrations aplicadas;
- a migration local `007_remove_session_user_agent.sql` remove `sessions.user_agent`;
- a migration 007 ainda nao foi aplicada no Neon B1;
- a role runtime nao tem DDL/DELETE; a cleanup tem SELECT/DELETE restrito.

---

## 2. Diferencas entre B1 minimo e homologacao funcional

| Area | B1 atual | Necessario para analytics funcional | Motivo |
|---|---|---|---|
| `/api/collect` | ausente | incluir | ingestao first-party de sessao/eventos |
| Function collect | ausente | incluir `collect.mjs` | endpoint de ingestao |
| Libs collect | ausentes | incluir handler, attribution, config, rate-limit, user-agent, validation | dependencias da Function |
| `ua-parser-js` | ausente no package B1 | adicionar `2.0.10` | derivacao de browser/OS sem UA bruto |
| Frontend de analytics | ausente; B1 so tem consentimento | avaliar harness sintetico ou cliente minimo | nao incluir JS canonico sem necessidade |
| CSP | `connect-src 'none'` | manter para testes server-side; revisar se houver browser client | browser client nao e pre-requisito da primeira janela |
| `ALLOWED_ORIGINS` | default de producao | adicionar origem B1 | origin allowlist do collect |
| `ANALYTICS_INGEST_ENABLED` | ausente | ativar apenas na janela | endpoint desligado por padrao |
| `RATE_LIMIT_HMAC_SECRET` | nao constava | provisionar segredo B1 | rate limiting do collect |
| Migrations | 6 no B1 | aplicar 007 apos codigo | remover persistencia historica de UA |
| Cleanup | funcao presente | testar somente com dados sinteticos | retencao |
| Edge flags | false | ativar apenas em teste controlado | captura Edge |
| Paginas canonicas | ausentes | nao incluir | B1 e ambiente minimo |

O B1 minimo foi desenhado para ser *minimo*. A homologacao funcional exige ampliar o contrato de
forma explicita, nao apenas "ligar" flags sobre o pacote atual.

---

## 3. Matriz de testes

### 3.1 Ingestao `/api/collect`

| ID | Caso | Pre-condicao | Resultado esperado | Falha/interrupcao |
|---|---|---|---|---|
| IN-01 | pageview valido com consentimento | ingest on, origin B1, secret | 202; sessao/pageview/evento coerentes | qualquer 5xx, escrita inesperada |
| IN-02 | consentimento negado | payload `analytics=false` | 204; nenhuma linha | qualquer escrita |
| IN-03 | payload invalido | JSON/campo invalido | 400; nenhuma escrita | aceitar payload invalido |
| IN-04 | chave/valor proibido | `values`, `resultado`, e-mail etc. | 400; nenhuma escrita | persistencia indevida |
| IN-05 | corpo acima do limite | > `ANALYTICS_MAX_BODY_BYTES` | 413; nenhuma escrita | aceitar corpo grande |
| IN-06 | Origin fora da allowlist | origem nao B1 | 403; nenhuma escrita | aceitar origem externa |
| IN-07 | metodo GET/HEAD | endpoint collect | 405; sem escrita | metodo incorreto aceito |
| IN-08 | deduplicacao | mesmo `event_id` | uma unica linha/efeito | duplicacao |
| IN-09 | rate limit | exceder janela configurada | 429 e Retry-After | ausencia de bloqueio |
| IN-10 | HMAC/nonce/replay Edge | Edge -> Function | assinatura valida; replay 409/erro seguro | aceitar replay |
| IN-11 | IP/UA | payload e headers sinteticos | IP nao bruto; UA nao persistido | persistencia |

### 3.2 Privacidade

| ID | Caso | Resultado esperado |
|---|---|---|
| PR-01 | UA sintetico no request | somente browser/OS/device/is_test derivados |
| PR-02 | valores/resultados de calculadora | 400; sem persistencia |
| PR-03 | IP sintetico | somente HMAC em bucket, sem IP bruto |
| PR-04 | consentimento negado/retirado | sem evento/linha |
| PR-05 | query de schema | `sessions.user_agent` ausente apos 007 |
| PR-06 | logs de erro | sem UA/IP/corpo sensivel |

### 3.3 Banco e roles

| ID | Caso | Resultado esperado |
|---|---|---|
| DB-01 | branch/database B1 | somente `validation_b1` |
| DB-02 | role runtime | DML permitido nas tabelas previstas; sem DDL/DELETE |
| DB-03 | role cleanup | SELECT/DELETE nas 13 tabelas; sem INSERT/UPDATE/TRUNCATE/DDL |
| DB-04 | migrations | 001-007 verificadas; nenhuma alterada |
| DB-05 | dados sinteticos | contagens conferidas; sem dados reais |
| DB-06 | integridade | FKs/IDs/dedup consistentes |

### 3.4 Edge e seguranca

| ID | Caso | Resultado esperado |
|---|---|---|
| ED-01 | GET HTML autorizado | captura candidata, sem alterar resposta |
| ED-02 | asset/API excluido | sem captura |
| ED-03 | consentimento/DNT/GPC | sem captura sem consentimento |
| ED-04 | HMAC/nonce/timestamp | assinatura/replay protegidos |
| ED-05 | corpo/tempo | limites respeitados |
| ED-06 | falha do Edge | fail-open documentado, sem quebrar HTML |
| ED-07 | UA bruto | nao persistido |

### 3.5 Cleanup

| ID | Caso | Resultado esperado |
|---|---|---|
| CL-01 | role/banco esperados | cleanup no B1, nunca producao |
| CL-02 | dados velhos sinteticos | remocao conforme retencao |
| CL-03 | filhos recentes | preservacao por integridade |
| CL-04 | budget/lock | status `complete/partial/budget_exhausted/locked` |
| CL-05 | tabela fora do escopo | nao acessada |
| CL-06 | execucao | apenas apos confirmação de privilegios/SSL e autorização |

---

## 4. Ordem, pre-condicoes e controles operacionais

Ordem recomendada para uma futura janela B1:

1. **Artefato local**: incluir collect, atualizar contrato, dependencia `ua-parser-js`, executar
   testes locais, gerar artefato com 32 arquivos e novo digest; sem deploy nesta fase.
2. **Revisao/commit**: autorização separada; checkout limpo.
3. **Deploy draft B1**: uma execução do gate; sem produção; post-upload estatico e inventario.
4. **Migration 007 B1**: somente depois do codigo sem UA; owner; B1; verificar coluna ausente.
5. **Variaveis/segredos B1**: configurar `ALLOWED_ORIGINS` B1, `RATE_LIMIT_HMAC_SECRET`,
   `ANALYTICS_INGEST_ENABLED=true` no contexto B1; sem produção.
6. **Ingestao server-side**: HTTP sintetico com Origin B1; consentimento; validos/invalidos;
   verificar banco.
7. **Edge**: ativar flags B1 apenas na janela; testar HTML/asset/consent/HMAC; depois desligar.
8. **Rate limit**: teste controlado de excesso, sem carga agressiva; 429.
9. **Cleanup**: somente com dados sinteticos, privilegios/SSL confirmados e autorização; status;
   desligar flag.
10. **Encerramento**: reverter flags/vars de teste, registrar dados e evidências; produção
    permanece intocada.

### Controles mínimos

- apenas Site ID B1 e banco `validation_b1`;
- sem dados reais de visitantes;
- secrets fora do relatorio e dos logs;
- nenhuma migration/cleanup sem autorização separada;
- nenhuma ativacao permanente de flags;
- nenhuma acao em produção;
- limite de créditos e janela definidos antes;
- evidência de cada request, status, contagem e estado;
- interrupção em qualquer divergência de site, banco, origin, schema ou resultado.

---

## 5. Artefato futuro proposto

### 5.1 Escopo

Proposta: manter os 7 estaticos e 7 Edge atuais, manter as 9 Functions atuais e adicionar 7 arquivos
de collect. Total proposto:

- 7 estaticos;
- 16 arquivos de Functions (3 entradas + 13 libs);
- 7 Edge;
- configuracao + metadata;
- 0 redirects;
- 32 entradas no manifesto futuro (contando config/metadata).

### 5.2 Novos arquivos de Function

| Origem | Bytes | SHA-256 | Finalidade |
|---|---:|---|---|
| `netlify/functions/collect.mjs` | 256 | `0d65acf24915f4d1ab8747a7dde9005184fc7c995c85f6c8762e0cf8f3b30617` | entrada `/api/collect` |
| `_lib/collect-handler.mjs` | 12.309 | `493f883aa2ab84c604485cf16f7b8d845f2247dc18d2f4d940d62df8284c497b` | handler de ingestao |
| `_lib/attribution.mjs` | 2.094 | `259a54308b78cae7c0e27d6fc5e4a6d1b1d0c193f42b67232c521ff0d88f1586` | atribuicao |
| `_lib/config.mjs` | 1.477 | `b3287910c34f3b41e5c38436c547f8923894333b01a4b26af6b5f2ce7c4d58e9` | configuracao |
| `_lib/rate-limit.mjs` | 2.013 | `4ba850f691719cb56c5266121fc4420a37a4a8ea0048d3a1a7b1881717e5736b` | rate limit |
| `_lib/user-agent.mjs` | 658 | `988e598ab6883fe6893b4fa0a81742b175829596dd51d9ac187f727709acb523` | parser transitorio |
| `_lib/validation.mjs` | 5.018 | `3d966e7e06ed047ff282886a6375b17ecb676c02c7b7b4061ab738fdf2081126` | validacao Zod |

Os 9 arquivos de Functions existentes e os 7 Edge permanecem com os hashes do relatorio 5F.47. O
manifesto de integridade final e o `artifact_sha256` **nao foram produzidos nesta fase**, pois um
novo artefato nao foi construido nem publicado. Nao se inventa o digest futuro.

### 5.3 Dependencias e configuracao

- adicionar `ua-parser-js` `2.0.10` ao `validation-b1/package.json` e lockfile;
- `zod` 4.6.7 ja existe;
- `pg` 8.23.1 ja existe;
- manter o `netlify.toml` sem base/redirects canonicos;
- atualizar `artifact-contract.json` e allowlists para o novo conjunto;
- avaliar se `collect` deve ser incluido no `shared-manifest` ou tratado como arquivo B1 proprio;
- nao incluir `js/analytics.js` canonico nem banners de producao na primeira janela server-side;
- se houver UI futura, criar harness B1 minimo e ajustar CSP com autorização propria.

---

## 6. Riscos e controles

| Risco | Controle |
|---|---|
| Ativar collect em producao | Site ID B1 fixo; env B1 apenas; sem producao |
| Origin allowlist errada | definir `ALLOWED_ORIGINS` B1; testar 403 antes de habilitar |
| Falta de secret de rate limit | provisionar `RATE_LIMIT_HMAC_SECRET` B1 antes da ingestao |
| UA/IP bruto | codigo atual sem UA bruto; testes de schema; 007 |
| Escrita fora do B1 | checar `current_database`, role e site |
| Cleanup destrutivo | dados sinteticos, role cleanup, budget, autorização separada |
| Rebuild/alteração do artefato | `--no-build`, `--draft`, digest, gate |
| CSP bloquear cliente | testar server-side; UI exige decisao separada |
| Creditos insuficientes | confirmar saldo/teto antes; sem auto-reload |
| Regressao canalica | build/test-local/Playwright; hashes 162 HTML |

---

## 7. Estimativa de creditos

Nao ha estimativa confiavel sem consultar o painel no momento da janela. Dados historicos:

- um deploy draft B1 da Fase 5F.18 registrou variacao observada de aproximadamente 0.0008 credito,
  mas nao e garantia para novas operacoes;
- requests HTTP, Functions, Edge, armazenamento e cleanup tem custos dependentes de volume/plano;
- nao se presume saldo disponivel;
- nao habilitar cobranca, upgrade ou recarga automatica;
- definir teto e confirmar saldo antes de autorizar.

Para a janela mínima, o desenho e um deploy draft + dezenas de requests + poucos testes de Function/
Edge, sem carga agressiva. O numero exato deve ser medido pelo painel; este relatorio nao inventa um
valor.

---

## 8. Operacoes que exigirao autorizacao separada

1. Alterar contrato/allowlist e dependencia B1.
2. Construir/commitar o novo artefato.
3. Deploy draft B1.
4. Aplicar migration 007 no Neon B1.
5. Alterar `ALLOWED_ORIGINS`, `RATE_LIMIT_HMAC_SECRET`, `ANALYTICS_INGEST_ENABLED`.
6. Ativar `EDGE_CAPTURE_ENABLED`/`EDGE_ANALYTICS_ENABLED` para testes Edge.
7. Executar requisicoes de ingestao/rate limit.
8. Ativar/executar cleanup.
9. Qualquer producao.

Cada item deve ser autorizado separadamente; a autorizacao de uma janela nao cobre as demais.

---

## 9. Criterios para solicitar a proxima autorizacao

- contrato e dependencia `ua-parser-js` revisados;
- artefato novo construido e validado localmente, com hashes e `artifact_sha256`;
- gate `--check` reproduzivel e `--confirm` mockado;
- plano de env/secret/flags B1 escrito, sem valores;
- migration 007 local validada; plano de rollback sem promessa de recuperar dados;
- saldo/teto de creditos conferido;
- janela B1 definida, sem producao;
- identidade B1/team/contexto confirmada;
- criterios de interrupcao e responsavel definidos;
- nenhuma dependencia de dados reais.

---

## 10. Classificacao final

**2 - Plano com pendencias.**

O plano cobre escopo, dependencias, seguranca, matriz de testes e criterios de autorizacao, mas
ainda depende de:

- construir/validar o novo artefato com `/api/collect`;
- adicionar/pinar `ua-parser-js`;
- provisionar env/segredo/origin no B1;
- aplicar migration 007 no B1;
- confirmar creditos e janela;
- decidir se havera UI/browser client nesta ou em fase posterior.

Nenhuma operacao remota foi executada. O deploy `6b007a6...` permanece intacto, draft e sem
publicacao. A proxima acao exige autorizacao explicita.

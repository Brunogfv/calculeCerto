# Fase 5F.58 - Homologacao funcional B1

Status: **BLOQUEADO apos um unico deploy draft; endpoint /api/collect falhou por dependencia ausente no pacote publicado**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 3 - Bloqueada.**

O deploy draft foi criado com o artefato congelado correto, mas a Function `/api/collect` retornou
502 porque o pacote publicado nao inclui a dependencia `pg`. Os testes de ingestao nao puderam ser
executados. Nao foi feito segundo deploy.

---

## 1. Resumo executivo

| Item | Resultado |
|---|---|
| Identidade Neon | confirmada |
| Identidade Netlify | confirmada |
| Artefato 5F.55 | hash correto `834dce3...` |
| CSP publicada | correta e restrita |
| Deploy draft | criado uma unica vez, `6b023192d0dd4ad10936a75f` |
| `published_at` | `null` |
| `published_deploy` | `null` |
| Producao | intacta |
| `/api/collect` | **502 - `Cannot find package 'pg'`** |
| Ingestao funcional | **nao executada** |
| Cleanup | nao executado |
| Dados sinteticos novos | nenhum |
| Segundo deploy | nao realizado |

O bloqueio e de empacotamento/dependencias da Function, nao de schema, migrations, privilegios,
CSP ou configuracao de origem.

---

## 2. Identidade dos ambientes

### Neon

| Item | Confirmado |
|---|---|
| Project name | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| Database owner | `neondb_owner` |
| PostgreSQL | 17.12 (`170012`) |
| Migrations | 001-007 |
| Tabelas | 14 |
| `sessions.user_agent` | ausente |

A branch `main` e o database `neondb` nao foram usados.

### Netlify

| Item | Confirmado |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Novo deploy | `6b023192d0dd4ad10936a75f` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| Draft URL | `https://6b023192d0dd4ad10936a75f--portal-contas-validation-b1.netlify.app` |
| `published_at` | `null` |
| `published_deploy` | `null` |

O deploy anterior `6b007a6d6e15671b125b952e` permaneceu como registro; o novo draft nao foi
publicado.

---

## 3. Hash e integridade do artefato

| Item | Valor |
|---|---|
| Diretorio | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f55` |
| SHA-256 integral | `834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513` |
| Arquivos | 32 |
| Bytes | 105.975 |
| Estaticos | 7 |
| Functions | 16 |
| Edge | 7 |
| Redirects | 0 |
| `_headers` SHA-256 | `b98b4793ac11cc100247dcc06d9131a81833d61a070b3654254868c96fff9f92` |
| `collect.mjs` | presente em `netlify/functions/collect.mjs` |
| `ua-parser-js` | 2.0.10 na configuracao B1 |
| Referencias a producao | nenhuma |
| Secrets no artefato | nenhum valor |

O gate oficial de verificacao retornou o mesmo digest:

```json
{
  "status": "validated_only",
  "artifact_sha256": "834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513",
  "static_files": 7,
  "functions": 16,
  "edge_functions": 7,
  "redirects": 0
}
```

O artefato congelado 5F.51 tambem permaneceu intacto.

### CSP publicada

Resposta real do draft:

```text
default-src 'none'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self' https://portal-contas-validation-b1.netlify.app; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

- origem B1 exata;
- `'self'` preservado;
- sem `*` e sem producao;
- HTML raiz com status 200 e `Cache-Control: no-store`;
- `robots.txt` com `Disallow: /`.

---

## 4. Variaveis configuradas

Configuracao feita apenas no contexto `deploy-preview` do site B1. Valores secretos nao foram
impressos.

| Variavel | Estado apos a etapa |
|---|---|
| `ALLOWED_ORIGINS` | presente somente em `deploy-preview`; valor exato `https://portal-contas-validation-b1.netlify.app` |
| `RATE_LIMIT_HMAC_SECRET` | novo secret, presente somente em `deploy-preview` |
| `ANALYTICS_INGEST_ENABLED` | `true` somente em `deploy-preview` |
| `DATABASE_URL` | atualizado apenas no valor preview, com URL operacional B1 gerada pelo Neon CLI |
| `CLEANUP_DATABASE_URL` | atualizado apenas no valor preview, com URL B1 da cleanup |
| `EDGE_INGEST_SECRET` | atualizado apenas no valor preview com secret novo |
| `EDGE_INGEST_KEY_ID` | ausente; default do artefato permanece |
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` |

`ALLOWED_ORIGINS` e `ANALYTICS_INGEST_ENABLED` nao foram configurados em producao. O
`DATABASE_URL` e o `EDGE_INGEST_SECRET` continuam existindo em outros contextos, mas apenas o
valor preview foi atualizado nesta fase.

Os valores de `DATABASE_URL`, `CLEANUP_DATABASE_URL`, `EDGE_INGEST_SECRET` e
`RATE_LIMIT_HMAC_SECRET` nao foram exibidos em terminal, relatorio, log ou mensagem.

---

## 5. Deploy draft

Executado exatamente uma vez:

```powershell
npm run deploy:b1 -- --confirm
```

- gate oficial utilizado;
- `--prod` e aliases de producao nao utilizados;
- nenhum `netlify deploy` manual;
- nenhum segundo deploy;
- artefato reportado pelo gate: `834dce3...`;
- deploy ID: `6b023192d0dd4ad10936a75f`;
- estado: `ready`;
- contexto: `deploy-preview`;
- `published_at`: `null`;
- `published_deploy`: `null`.

O staging temporario do gate foi retido por `EPERM` no Windows:

```text
C:\Users\Joanita\AppData\Local\Temp\portal-contas-b1-deploy-mQhTi3
```

O staging retido nao foi publicado em producao e nao e um novo deploy.

---

## 6. Resultado do endpoint

Foi feita uma verificacao HTTP direta ao draft:

```http
GET https://6b023192d0dd4ad10936a75f--portal-contas-validation-b1.netlify.app/api/collect
```

Resposta:

```text
HTTP 502
{"errorType":"Error","errorMessage":"Cannot find package 'pg' imported from /var/task/collect.mjs"}
```

A Function existe e foi resolvida pela rota, mas o runtime nao encontrou `pg`. O erro ocorre na
inicializacao/carregamento do modulo, antes de qualquer escrita no banco.

O HTML raiz nao chama `/api/collect` automaticamente e nao contem o cliente canonico de analytics.
A pagina B1 carregou com CSP correta.

---

## 7. Testes de consentimento

O HTML B1 publicado nao inclui o cliente `js/analytics.js`; ele carrega apenas o controle local de
consentimento (`b1-consent.js`). Portanto:

- nao ha envio automatico antes de consentimento;
- aceitar/recusar/retirar altera apenas a preferencia local;
- nenhuma chamada foi feita pela pagina durante o carregamento.

Os testes de aceite com ingestao real **nao puderam ser executados**, porque `/api/collect` retorna
502 antes do handler. Nao houve escrita no banco.

---

## 8. Ingestao, persistencia, deduplicacao e rate limit

Nao executados.

Motivo: o endpoint nao carrega a dependencia minima `pg`; todas as chamadas de ingestao falhariam
antes de validar payload, origem, consentimento ou limite.

Consequentemente:

- nenhum evento sintetico desta fase foi persistido;
- nenhuma deduplicacao remota foi testada;
- nenhum rate limit HTTP remoto foi testado;
- nenhum rollback HTTP remoto foi testado.

Os testes controlados da Fase 5F.56 continuam validos como evidencia das permissoes de banco, mas
nao substituem o teste da Function publicada.

---

## 9. Seguranca e privilegios

O erro e de empacotamento, nao de permissao de banco. A matriz de banco permanece:

- runtime sem DELETE/TRUNCATE/DDL/ownership;
- sem privilegios administrativos;
- `pageviews`, `events`, `affiliate_clicks` e `ingest_events` com INSERT e SELECT apenas de
  `event_id`;
- cleanup inalterada;
- sem `sessions.user_agent`.

Nao foi necessario conceder privilegio adicional. Nao foram encontrados secrets nas respostas ou
logs verificados.

---

## 10. Isolamento

- O deploy foi criado no site B1 correto;
- o draft nao foi publicado;
- `published_deploy=null`;
- nao houve chamada ao dominio de producao;
- nao houve escrita no Neon B1 nesta fase;
- `DATABASE_URL` do preview foi reconfigurado para uma URL B1 gerada pelo Neon CLI;
- os demais contextos nao foram alterados pelo comando de preview;
- producao e branch principal do Neon permaneceram intocadas.

O isolamento de identidade foi mantido. O isolamento funcional falhou apenas porque a Function
publicada nao encontrou `pg`.

---

## 11. Dados sinteticos e limpeza

Nenhum dado sintetico novo foi inserido por esta fase.

Nenhum cleanup foi executado.

Os dados sinteticos da Fase 5F.56 permanecem no B1 e devem ser tratados em etapa autorizada
posterior. Nao houve DELETE, TRUNCATE ou chamada a role cleanup.

---

## 12. Producao e Netlify

- nenhum `--prod`;
- nenhum deploy publicado;
- `published_deploy=null`;
- nenhuma alteracao de dominio;
- nenhuma variavel de producao alterada;
- site B1 continua com draft apenas.

---

## 13. Causa raiz e pendencias

### Causa raiz

O artefato de 32 arquivos contem as Functions, mas nao contem `package.json`, `package-lock.json`
ou `node_modules`. O deploy do Netlify carregou `collect.mjs` e suas importacoes sem instalar as
dependencias de runtime. O erro ocorre no primeiro import de `pg`.

A Fase 5F.55 validou o contrato de arquivos e o hash, mas nao testou o carregamento das
dependencias no runtime publicado. O contrato atual de 32 arquivos nao inclui a instalacao de
dependencias.

### Pendencias

1. Definir o empacotamento de dependencias das Functions (`pg`, `zod`, `ua-parser-js`).
2. Revalidar o artefato apos a correcao; nao reutilizar silenciosamente o 5F.55.
3. Autorizar um novo deploy somente depois do teste local do bundle.
4. Repetir os testes de ingestao, deduplicacao, rate limit, consentimento e seguranca.
5. Planejar o cleanup dos dados sinteticos anteriores e dos novos testes.
6. Nao alterar producao.

Nao foi feito segundo deploy para corrigir a falha, conforme a autorizacao.

---

## 14. Evidencias e comandos relevantes

```powershell
# gate oficial, uma unica vez
npm run deploy:b1 -- --confirm
```

```http
GET /api/collect
HTTP/1.1 502
Cannot find package 'pg' imported from /var/task/collect.mjs
```

```text
Deploy ID: 6b023192d0dd4ad10936a75f
Contexto: deploy-preview
Estado: ready
published_at: null
published_deploy: null
CSP: connect-src 'self' https://portal-contas-validation-b1.netlify.app
```

**Classificacao final: 3 - Bloqueada por falha de dependencia no runtime publicado.**

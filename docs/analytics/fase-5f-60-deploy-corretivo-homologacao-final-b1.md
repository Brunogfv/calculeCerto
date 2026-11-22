# Fase 5F.60 - Deploy corretivo e homologacao final B1

Status: **BLOQUEADO apos o deploy corretivo; Function nao foi exposta corretamente em /api/collect**.
Data: **2026-11-22**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 3 - Bloqueada.**

Um unico deploy draft foi realizado com o artefato 5F.59, mas o endpoint `/api/collect` nao foi
registrado no caminho esperado e a Function respondeu com erro de runtime. Nenhum segundo deploy
foi feito.

---

## 1. Identidade dos ambientes

### Neon

| Item | Confirmado |
|---|---|
| Projeto | `portal-contas-homologacao` |
| Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Branch ID | `br-misty-sound-b6pnt7iw` |
| Database | `validation_b1` |
| PostgreSQL | 17 |

### Netlify

| Item | Confirmado |
|---|---|
| Site | `portal-contas-validation-b1` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Team ID | `697d58587a017c3396fb416e` |
| Novo deploy | `6b023a59f9846285730224a0` |
| Draft URL | `https://6b023a59f9846285730224a0--portal-contas-validation-b1.netlify.app` |
| Contexto | `deploy-preview` |
| Estado | `ready` |
| `published_at` | `null` |
| `published_deploy` | `null` |

Nenhuma publicacao em producao ocorreu.

---

## 2. Artefato autorizado

| Item | Resultado |
|---|---|
| Diretorio | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f59` |
| SHA-256 inteiro | `7504d3475c1eb20d2a6b7f4c0be3b3f6215fdfd4e6ad78d909e3cd02fac1deea` |
| Arquivos | 35 |
| Staticos | 7 |
| Functions-fonte | 16 |
| Bundles | 3 |
| Edge | 7 |
| Redirects | 0 |
| Validacao local | passou |
| `pg` nos bundles | confirmado |
| CSP | B1 exata |
| Secrets | nenhum valor |

O gate reportou o mesmo digest `7504d347...` e criou o deploy com esse artefato.

---

## 3. Preflight de configuracao

| Item | Estado |
|---|---|
| `ALLOWED_ORIGINS` | somente deploy-preview; origem B1 exata |
| `RATE_LIMIT_HMAC_SECRET` | presente, secret |
| `ANALYTICS_INGEST_ENABLED` | `true` somente em deploy-preview |
| `DATABASE_URL` | presente no preview, configurado na 5F.58 para B1 |
| `CLEANUP_DATABASE_URL` | presente somente em deploy-preview |
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |

Nenhuma variavel, secret ou flag foi alterada nesta fase.

---

## 4. Deploy unico

Comando:

```powershell
npm run deploy:b1 -- --confirm
```

Resultado:

- deploy ID `6b023a59f9846285730224a0`;
- contexto `deploy-preview`;
- estado `ready`;
- `published_at=null`;
- `published_deploy=null`;
- site e team B1 corretos;
- nenhuma publicacao em producao;
- staging temporario retido por `EPERM` no Windows.

O Netlify registrou 3 Functions e 3 Edge Functions. Nao houve segundo deploy.

---

## 5. Verificacao inicial da Function

### 5.1 Rota esperada

```http
GET /api/collect
```

Resultado:

```text
HTTP 404
Page not found
```

A rota `/api/collect` nao foi registrada no deploy.

### 5.2 Rota padrao da Function

```http
GET /.netlify/functions/collect
```

Resultado:

```text
HTTP 502
error decoding lambda response: invalid character '\x00' after top-level value
```

A Function existe na rota padrao, mas falha no runtime. O erro anterior de `Cannot find package
'pg'` nao reapareceu; o bloqueio agora e de formato/registro do pacote de Function.

### 5.3 Rotas relacionadas

```text
/api/capture-html                  -> 404
/.netlify/functions/capture-html   -> 502
```

Nao foi possivel executar ingestão, consentimento real, deduplicacao, rate limit ou testes de
persistencia.

O HTML raiz e a CSP continuam sendo entregues; o problema esta nas Functions empacotadas.

---

## 6. Diferenca entre validacao local e deploy

A extracao local dos bundles comprovou:

- `collect.mjs` importa;
- `config.path='/api/collect'` existe no modulo;
- `pg`, `zod` e `ua-parser-js` resolvem dentro do zip.

O deploy, porem, nao registrou a rota `/api/collect`. A causa provavel e que o gerador
`bundle-functions.mjs` removeu o `manifest.json` produzido pelo ZISI, que carrega as rotas,
runtime e metadados de deploy. Os zips foram enviados como Functions, mas sem o manifesto de
deploy o caminho customizado nao foi aplicado; a rota padrao ainda apresentou erro de decoding.

O artefato nao deve ser considerado pronto para novo deploy antes de corrigir esse manifesto e
revalidar o pacote.

---

## 7. Testes nao executados e dados

Nao foram executados:

- testes de consentimento com ingestao real;
- pageview/session_start/session_end/engagement/calculator/affiliate;
- deduplicacao remota;
- rate limit remoto;
- rollback HTTP;
- verificacao de persistencia no Neon B1.

Nenhum dado sintetico novo foi inserido por esta fase. Nenhum cleanup foi executado.

---

## 8. Seguranca e isolamento

- Site e deploy corretos;
- contexto `deploy-preview`;
- site `published_deploy=null`;
- nenhuma requisicao destinada a producao;
- nenhuma configuracao de producao alterada;
- nenhum secret ou connection string impresso;
- flags Edge e cleanup continuam `false`;
- nenhuma migration/grant novo;
- nenhuma escrita no Neon B1 nesta fase;
- nenhum segundo deploy.

O bloqueio e funcional e de empacotamento; nao ha indicio de vazamento de dados.

---

## 9. Causa raiz e pendencias

### Causa raiz

O empacotamento ZISI gerou zips com dependencias, mas o `manifest.json` do ZISI foi descartado
pelo script de bundle. Isso removeu metadados necessarios para o Netlify registrar as rotas
customizadas e o formato de runtime esperado. A rota `/api/collect` nao apareceu, e a rota padrao
falhou no decoding da resposta Lambda.

### Pendencias

1. Preservar o `manifest.json` do ZISI (ou equivalente) no diretorio de Functions empacotadas.
2. Revalidar o novo artefato e o formato de upload do Netlify.
3. Autorizar um novo deploy somente depois de um teste de rota em ambiente local compativel.
4. Repetir a homologacao funcional completa.
5. Manter o artefato 5F.55/5F.59 como historico; nao reutilizar o artefato quebrado.
6. Nao alterar producao.

Nao foi feito segundo deploy para corrigir a falha.

---

## 10. Evidencias objetivas

```text
Deploy: 6b023a59f9846285730224a0
Contexto: deploy-preview
Estado: ready
published_at: null
published_deploy: null
SHA-256: 7504d3475c1eb20d2a6b7f4c0be3b3f6215fdfd4e6ad78d909e3cd02fac1deea

GET /api/collect -> 404
GET /.netlify/functions/collect -> 502
error decoding lambda response: invalid character '\x00' after top-level value
```

**Classificacao final: 3 - Bloqueada por falha de registro/inicializacao da Function publicada.**

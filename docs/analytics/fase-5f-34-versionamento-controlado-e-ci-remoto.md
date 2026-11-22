# Fase 5F.34 - Versionamento controlado das correcoes e CI remoto

Status: **commit e push concluidos; CI remoto executado e reprovado apenas no teste local de HTML. Nenhuma correcao foi enviada apos a falha.**
Data/hora: **2026-11-20T11:45:00Z** (referencia ao CI).
Branch: `feat/portal-analytics`.
Commit: `68759c51e706825ec290483323e52acacc9ec75e`.
Remote: `https://github.com/Brunogfv/calculeCerto.git`.

**Classificacao: 3 - Bloqueado.** O versionamento e o push foram concluidos, mas o job de
validacao estatica falhou no passo `test-local.js`; os demais jobs passaram. Uma correcao adicional
exige nova autorizacao.

---

## 1. Objetivo e autorizacao

Foram autorizados:

- revisar as alteracoes da Fase 5F.33;
- versionar apenas os arquivos necessarios;
- criar um commit;
- fazer push para `origin/feat/portal-analytics`;
- executar e acompanhar o CI de validacao;
- produzir este relatorio.

Nao foram executados deploy, publicacao, `--confirm`, operacoes Netlify/Neon, SQL remoto, cleanup,
flags, roles ou alteracoes de producao.

---

## 2. Estado inicial

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `027d7d31c29fb2a559a59abb3466909dfab54d29` |
| Remote | `https://github.com/Brunogfv/calculeCerto.git` |
| Upstream | `origin/feat/portal-analytics` |
| Indice Git inicial | vazio |
| Remoto | mesmo commit `027d7d3` antes do push |
| Working tree | alteracoes preexistentes + correcoes da Fase 5F.33 |

Nao houve reset, clean, amend, rebase ou force push.

---

## 3. Inventario analisado

Foram revisados os arquivos da Fase 5F.33 e suas dependencias:

- `.gitattributes`;
- `tests/unit/site.spec.js`;
- contrato e manifesto B1;
- 3 scripts de cleanup/SSL;
- 9 testes de analytics;
- teste E2E de consentimento;
- migrations 003-006;
- CSS e JavaScript de analytics;
- relatorio da Fase 5F.33.

Os arquivos fora desse conjunto foram deliberadamente mantidos fora do commit. `node_modules`,
`dist`, `.netlify`, caches, `relatorio-local.md` e demais alteracoes preexistentes nao foram
incluidos.

---

## 4. Lista exata incluida no commit

O commit contem **24 arquivos**:

### Novos

- `.gitattributes`
- `css/analytics.css`
- `db/migrations/003_phase4_html_capture.sql`
- `db/migrations/004_phase4_audit_fixes.sql`
- `db/migrations/005_phase4_cleanup_role.sql`
- `db/migrations/006_phase2_runtime_grants.sql`
- `docs/analytics/fase-5f-33-correcao-dependencias-e-integridade-b1.md`
- `js/analytics.js`
- `scripts/cleanup-html-capture.mjs`
- `scripts/cleanup-retention.mjs`
- `scripts/ssl-diagnostic.mjs`
- `tests/analytics/capture-edge.spec.mjs`
- `tests/analytics/capture-performance.spec.mjs`
- `tests/analytics/capture-policy.spec.mjs`
- `tests/analytics/classifier.spec.mjs`
- `tests/analytics/cleanup-manual.spec.mjs`
- `tests/analytics/cleanup-retention.spec.mjs`
- `tests/analytics/imports.spec.mjs`
- `tests/analytics/rate-limit-config.spec.mjs`
- `tests/analytics/ssl-diagnostic.spec.mjs`
- `tests/e2e/consent.spec.js`

### Modificados

- `tests/unit/site.spec.js`
- `validation-b1/artifact-contract.json`
- `validation-b1/shared-manifest.json`

Nenhum outro arquivo foi staged. O commit nao contem `.env`, secrets, bancos, dumps, caches ou
artefatos de build.

---

## 5. Testes locais antes do commit

A validacao foi executada em Node.js 22 e PostgreSQL 16 descartavel, incluindo checkout Linux limpo
com as correcoes aplicadas.

| Verificacao | Resultado |
|---|---|
| Analytics | **135/135 pass** |
| Playwright | **59/59 pass** |
| B1 shared/b1/artifact/gate | **39/39 pass** |
| Consentimento | **2/2 pass** |
| SSL local | **5/5 pass** |
| Isolamento B1 | **41/41 preservados** |
| Build canonico | passou; 162 HTML |
| Build B1 | passou; 6 arquivos + manifesto |
| `deploy:b1 -- --check` | passou; `validated_only` |

O contrato B1 final usa LF e o hash `14c57306...`; o hash antigo `228c2e45...` era do working
Windows em CRLF. O gate permaneceu em `validated_only`.

---

## 6. Auditoria do workflow

`.github/workflows/ci.yml` possui:

- gatilhos `push` em `main`, `pull_request` e `workflow_dispatch`;
- `validacao-estatica` com Node.js 22, `npm ci`, Playwright, `npm test`, build, isolamento e
  `test-local.js`;
- `teste-producao` somente leitura, executado fora de pull request;
- `analytics-backend` com PostgreSQL 16, roles, migrations e testes;
- `b1-artifact-linux` com Node.js 22, `npm ci`, contrato, testes, consentimento e gate.

Nao existe job de deploy, `netlify deploy`, `--confirm` ou alteracao de Neon. O workflow e apenas
de validacao. O `workflow_dispatch` foi usado porque o push para a feature branch nao aciona o
workflow.

---

## 7. Commit

- Hash: **`68759c51e706825ec290483323e52acacc9ec75e`**
- Mensagem: `fix(analytics): complete CI dependencies and B1 integrity`
- Arquivos: **24**
- Resumo: 2.903 insercoes e 4 remocoes.
- Branch: `feat/portal-analytics`.
- O commit anterior `027d7d3` foi preservado; nao houve amend.

---

## 8. Push

- Destino: `origin feat/portal-analytics`.
- Resultado: **sucesso**.
- `027d7d3..68759c5` enviado.
- Branch remota atualizada para o mesmo hash.
- Nenhuma outra branch foi alterada.
- Nao foi usado force push.

---

## 9. Execucao do CI

- Workflow: `Auditoria do Site`.
- Execucao: **44728510812**.
- URL: `https://github.com/Brunogfv/calculeCerto/actions/runs/44728510812`.
- Commit validado: `68759c51e706825ec290483323e52acacc9ec75e`.
- Evento: `workflow_dispatch`.
- Node.js: 22.
- Resultado final: **failure**.

---

## 10. Resultado individual dos jobs

### B1 artifact and deploy gate (Linux)

**Sucesso** (job 136261955106, 53 s).

- Node.js 22, `npm ci`, Netlify CLI e Playwright passaram.
- Build B1, testes de contrato/manifesto, symlink, consentimento e gate passaram.
- Gate: `validated_only`.
- Nenhuma publicacao.

### Analytics backend

**Sucesso** (job 136261955321, 38 s).

- PostgreSQL, roles, migrations e `npm ci` passaram.
- Testes executados sem falha.
- Container encerrado corretamente.

### Validacao estatica

**Falhou** (job 136261955327, 11 min 32 s).

- Node.js 22, `npm ci`, Playwright, `npm test` (59 testes), build e isolamento passaram.
- O passo `node scripts/test-local.js` falhou.
- O script encontrou **164 arquivos HTML**, incluindo `validation-b1/public/index.html`.
- O relatorio local registrou um link quebrado:

```text
validation-b1/public/index.html -> /validacao-encerrada.html
```

- A pagina B1 nao faz parte do site principal e nao possui a mesma arvore de URLs. O teste local
  tratou a pagina de validacao como pagina do portal.
- O artefato `relatorio-local.md` foi preservado.
- O job seguinte (`teste-producao`) foi ignorado.

### Teste do site em producao

**Ignorado** (job 136267223772), pois a validacao estatica falhou.

---

## 11. Falhas, limitacoes e pendencias

- O CI ainda nao esta verde: resta excluir `validation-b1` do walker de `scripts/test-local.js` ou
  ajustar o escopo do teste local para nao validar a pagina B1 como site principal.
- Essa correcao exige novo commit e novo CI, com autorizacao especifica.
- Nenhuma correcao foi feita apos a falha.
- Os demais jobs de validacao passaram.
- O resultado do job de producao nao foi executado.

---

## 12. Ausencia de deploy e operacoes remotas

- Nenhum deploy.
- Nenhum `netlify deploy` ou `--confirm`.
- Nenhuma publicacao.
- Nenhum acesso autenticado a Netlify ou Neon.
- Nenhum SQL remoto, role/grant, flag, variavel remota, Run now ou cleanup.
- Nenhum credito Netlify consumido.
- Nenhuma branch principal alterada.

GitHub Actions foi usado somente para validacao.

---

## 13. TOCTOU

O risco TOCTOU continua **NAO ACEITO**.

Mitigacoes existentes: contrato independente, `mkdtemp`, `chmod`, validacao dupla, gate
`--check`/`--confirm` e CLI fixado. Limitacoes: `chmod` nao e imutabilidade, o CLI rele arquivos,
nao ha lock/assinatura de filesystem e `netlify deploy` externo continua possivel.

O CI aprovado em B1 nao constitui autorizacao de publicacao nem aceitacao do risco.

---

## 14. Classificacao final

**3 - Bloqueado.**

O commit e o push foram concluidos, e analytics e B1 passaram no CI. A execucao continua vermelha
porque o teste local de HTML inclui `validation-b1` e o interpreta como pagina do site principal.
A correcao exige nova alteracao autorizada em `scripts/test-local.js` e nova execucao de CI.

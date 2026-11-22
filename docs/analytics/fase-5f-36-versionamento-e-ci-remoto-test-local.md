# Fase 5F.36 - Versionamento seletivo e CI remoto da correcao do test-local.js

Status: **commit, push e CI remoto concluidos com sucesso; nenhuma publicacao ou operacao Netlify/Neon executada**.
Data/hora: **2026-11-20T12:10:00Z** (inicio do CI).
Branch: `feat/portal-analytics`.
Commit: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Remote: `https://github.com/Brunogfv/calculeCerto.git`.

**Classificacao: 1 - Aprovado.** Os tres arquivos foram versionados seletivamente, o push foi
concluido e todos os jobs do CI remoto passaram, incluindo `test-local.js` com 162 paginas e sem
`validation-b1`.

---

## 1. Objetivo e autorizacao

Foram autorizados:

- inspecionar as alteracoes da Fase 5F.35;
- versionar apenas os tres arquivos autorizados;
- criar commit sem amend;
- push para `origin/feat/portal-analytics`;
- executar e acompanhar o CI remoto de validacao;
- criar este relatorio.

Nao foram executados deploy, publicacao, `--confirm`, operacoes Netlify/Neon, SQL remoto,
cleanup, roles, flags ou alteracoes de producao.

---

## 2. Estado inicial

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `68759c51e706825ec290483323e52acacc9ec75e` |
| Indice Git | vazio |
| Arquivos staged | 0 |
| Remote HEAD local | `68759c5` |
| Upstream | `origin/feat/portal-analytics` |
| Working tree | alteracoes preexistentes e relatorios nao versionados |

O HEAD esperado foi confirmado; nao houve divergencia de branch ou indice.

---

## 3. Auditoria dos tres arquivos

### scripts/test-local.js

Confirmado:

- `validation-b1` e um segmento excluido em `EXCLUDED_SEGMENTS`;
- `isExcludedPath` divide por `/` e `\`;
- `collectHtmlFiles` usa o helper antes de recurse/adicionar;
- paginas legitimas de raiz e subdiretorios continuam incluidas;
- links, assets, calculadoras e redirects nao mudaram;
- execucao principal protegida por `require.main === module`;
- helpers exportados para teste.

### tests/unit/test-local-scope.spec.js

Confirmado:

- cria estrutura temporaria com paginas canonicas e B1;
- valida raiz, calculadoras e paginas institucionais;
- valida exclusao total de `validation-b1`;
- testa separadores Windows e Linux;
- evita falsos positivos por nomes parecidos;
- confirma o conjunto real de 162 paginas.

### Relatorio da Fase 5F.35

- Coerente com os testes executados.
- Sem secrets, dados reais ou credenciais.
- Nenhuma conclusao alterada.

---

## 4. Testes locais

Ambiente Node.js `v22.23.5`, PostgreSQL 16 descartavel e Playwright Chromium.

| Suite | Resultado |
|---|---|
| `test-local.js` | **162/162 paginas**, 0 links quebrados, 0 erros JS, 0 problemas de calculadora |
| Playwright | **62/62 pass** |
| Analytics | **135/135 pass** |
| B1/artifact/gate | **39/39 pass** |
| Consentimento B1 | **2/2 pass** |
| SSL | **5/5 pass** |
| Isolamento | **41/41 preservados** |
| Build canonico | passou; 162 HTML |
| Build B1 | passou; 6 arquivos + manifesto |
| `deploy:b1 -- --check` | passou; `validated_only` |

A pagina B1 nao entrou no conjunto canonico. Nenhum falso positivo para
`/validacao-encerrada.html`. O gate nao foi executado com `--confirm`.

---

## 5. Auditoria do workflow

`.github/workflows/ci.yml`:

- gatilho de push apenas em `main`;
- `pull_request` e `workflow_dispatch`;
- `validacao-estatica`: Node.js 22, `npm ci`, Playwright, `npm test`, build, isolamento e
  `test-local.js`;
- `teste-producao`: leitura do site publicado, sem deploy;
- `analytics-backend`: PostgreSQL temporario e testes;
- `b1-artifact-linux`: contrato, testes, consentimento e gate `--check`.

Nenhum job publica, executa `netlify deploy`, `--confirm` ou altera Neon. O push para a feature
branch nao aciona o workflow; a execucao foi feita por `workflow_dispatch`.

---

## 6. Lista exata do commit

O commit contem somente:

- `scripts/test-local.js`
- `tests/unit/test-local-scope.spec.js`
- `docs/analytics/fase-5f-35-correcao-escopo-test-local.md`

Nenhum outro arquivo foi staged. O commit tem 294 insercoes e 8 remocoes.

---

## 7. Commit

- Hash: **`665f0b31aa00ebf4a73fc6b98a39b976f0990d72`**
- Mensagem: `fix(tests): exclude B1 from canonical HTML validation`
- Arquivos: **3**
- Branch: `feat/portal-analytics`
- Sem amend ou reescrita de historico.

---

## 8. Push

- Destino: `origin feat/portal-analytics`.
- Resultado: **sucesso**.
- Atualizacao: `68759c5..665f0b3`.
- Branch remota aponta para o mesmo commit.
- Nenhuma outra branch foi alterada.
- Nenhum force push.

---

## 9. CI remoto

- Workflow: `Auditoria do Site`.
- Execucao: **44733531472**.
- URL: `https://github.com/Brunogfv/calculeCerto/actions/runs/44733531472`.
- Commit validado: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
- Evento: `workflow_dispatch`.
- Node.js: 22.
- Resultado final: **success**.

---

## 10. Resultado individual dos jobs

### B1 artifact and deploy gate (Linux)

**Sucesso** (job 136279062580).

- `npm ci`, Netlify CLI e Playwright passaram.
- Build B1, contrato, manifesto, symlink, consentimento e gate passaram.
- Gate: `validated_only`.
- Nenhuma publicacao.

### Analytics backend

**Sucesso** (job 136279062905).

- Roles, migrations, `npm ci` e testes passaram.
- PostgreSQL temporario encerrado corretamente.

### Validacao estatica

**Sucesso** (job 136279063151).

- `npm test`: 62 testes passaram.
- Build, isolamento B1 e Playwright passaram.
- `test-local.js`: **162/162 paginas**, 0 links quebrados, 0 erros JS, 0 problemas de calculadora.
- `validation-b1` nao apareceu no conjunto validado.
- Nenhum falso positivo de `/validacao-encerrada.html`.

### Teste do site em producao

**Sucesso** (job 136284417014).

- Testes de leitura de producao e Lighthouse passaram.
- Nenhum deploy ou alteracao remota foi executado.

---

## 11. Falhas e pendencias

Nao houve falha nesta execucao.

Pendencias fora desta fase:

- O risco TOCTOU do gate B1 continua **NAO ACEITO**.
- Qualquer publicacao futura exige autorizacao separada.

---

## 12. Deploy e operacoes remotas

- Nenhum deploy.
- Nenhum `netlify deploy` ou `--confirm`.
- Nenhuma publicacao.
- Nenhuma alteracao em Netlify ou Neon.
- Nenhum SQL remoto, role/grant, flag ou variavel remota.
- Nenhum Run now, cleanup ou credito consumido.
- Nenhuma alteracao na branch principal.
- Somente push para a branch autorizada e CI de validacao.

---

## 13. TOCTOU

O risco TOCTOU continua **NAO ACEITO**.

Mitigacoes existentes: contrato independente, `mkdtemp`, `chmod`, validacao dupla, gate
`--check`/`--confirm` e CLI fixado. Limitacoes: `chmod` nao e imutabilidade, o CLI rele arquivos,
nao ha lock/assinatura de filesystem e `netlify deploy` externo continua possivel.

O CI aprovado nao autoriza publicacao nem aceitacao do risco.

---

## 14. Classificacao final

**1 - Aprovado.**

O commit seletivo, o push e o CI remoto foram concluidos. Todos os jobs passaram; `test-local.js`
validou exatamente 162 paginas canonicas, sem `validation-b1` e sem falso positivo de
`/validacao-encerrada.html`. Nenhum deploy ou operacao Netlify/Neon foi executada.

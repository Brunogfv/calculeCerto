# Fase 5F.35 - Correcao do escopo de test-local.js e regressao local

Status: **correcao local concluida; test-local, regressao e builds aprovados. Nenhum staging, commit ou operacao remota executado.**
Data/hora: **2026-11-20T11:45:00Z** (referencia).
Branch: `feat/portal-analytics`.
HEAD: `68759c51e706825ec290483323e52acacc9ec75e`.

**Classificacao: 1 - Aprovado localmente.** A descoberta canonica exclui `validation-b1`, a pagina
B1 nao gera falso positivo e toda a regressao local passou.

---

## 1. Objetivo e autorizacao

Foram autorizados apenas:

- inspecao do script e testes;
- correcao local de `scripts/test-local.js`;
- criacao de testes de regressao;
- execucao de testes, builds e validacoes locais;
- relatorio tecnico.

Nao foram executados `git add`, commit, push, fetch, CI remoto, deploy, Netlify/Neon, SQL remoto,
cleanup, flags ou alteracoes remotas.

---

## 2. Estado inicial

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `68759c51e706825ec290483323e52acacc9ec75e` |
| Indice Git | vazio |
| Arquivos staged | 0 |
| Working tree | alteracoes preexistentes, relatorios e correcoes locais |

O commit publicado da Fase 5F.34 foi preservado; nao houve reset, amend ou rebase.

---

## 3. Causa raiz do erro da Fase 5F.34

`scripts/test-local.js` possuia uma lista de diretorios ignorados em `collectHtmlFiles` que nao
incluia `validation-b1`. O walker percorria:

```text
validation-b1/public/index.html
validation-b1/public/validacao-encerrada.html
```

O primeiro arquivo contem um link para `/validacao-encerrada.html`. O link e valido dentro da raiz
publicada do B1, mas nao dentro da raiz canonica do site principal, onde nao existe
`/validacao-encerrada.html`. Resultado: 164 HTML e um falso positivo de link quebrado.

O problema era apenas de escopo de descoberta. A validacao de links, assets e o conteudo B1 estavam
corretos.

---

## 4. Arquivos inspecionados

- `scripts/test-local.js`.
- `scripts/check-b1-isolation.mjs`.
- `scripts/build-assets.js`.
- `scripts/apply-accessibility.js`.
- `tests/unit/site.spec.js`.
- `tests/unit/test-local-scope.spec.js` (novo).
- `package.json`.
- `docs/analytics/fase-5f-34-versionamento-controlado-e-ci-remoto.md`.
- Relatorio local do CI 44728510812.
- `.gitattributes` e contrato B1.

---

## 5. Arquivos alterados

- `scripts/test-local.js` - exclusao de `validation-b1` na descoberta e exportacao testavel.
- `tests/unit/test-local-scope.spec.js` - testes de regressao.
- `docs/analytics/fase-5f-35-correcao-escopo-test-local.md` - este relatorio.

Nenhum arquivo de `validation-b1`, contrato, build ou producao foi alterado.

---

## 6. Correcao aplicada

Foi introduzido um unico conjunto de segmentos excluidos:

```text
node_modules, .git, .vscode, scratch, pagefind, .github,
dist, playwright-report, test-results, docs, validation-b1
```

A funcao `isExcludedPath(relativePath)` divide o caminho por `/` ou `\` e compara segmentos exatos.
`collectHtmlFiles(dir, root)` usa esse helper antes de recurse ou de adicionar arquivos.

Alem disso, o script agora:

- exporta `collectHtmlFiles`, `extractInternalLinks` e `isExcludedPath`;
- executa o servidor/teste somente quando chamado como modulo principal
  (`require.main === module`).

Nao foram alteradas as regras de links internos, ancoras, assets, calculadoras ou redirects.

---

## 7. Testes de regressao

Novo arquivo `tests/unit/test-local-scope.spec.js`:

1. Cria uma arvore temporaria com `index.html`, `calculadoras/exemplo.html`,
   `paginas/sobre.html` e duas paginas em `validation-b1/public/`.
2. Confirma que os HTML canonicos entram normalmente.
3. Confirma que nenhum arquivo de `validation-b1` entra.
4. Confirma exclusao com caminhos `/` e `\`.
5. Confirma que nomes parecidos, como `paginas/validation-b1.html`, nao sao excluidos.
6. Confirma que o conjunto real tem **162** HTML e nao contem `validation-b1`.
7. Confirma que a pagina B1 nao pode produzir o falso positivo
   `/validacao-encerrada.html`.

---

## 8. Resultados locais

Ambiente Node.js `v22.23.5`, PostgreSQL 16 descartavel e Playwright Chromium.

| Suite | Resultado |
|---|---|
| Analytics | **135/135 pass** |
| Playwright | **62/62 pass** |
| B1/artifact/gate | **39/39 pass** |
| Consentimento B1 | **2/2 pass** |
| SSL local | **5/5 pass** |
| Isolamento B1 | **41/41 preservados** |
| Build canonico | passou; 162 HTML |
| Build B1 | passou; 6 arquivos + manifesto |
| `deploy:b1 -- --check` | passou; `validated_only` |

O novo teste de escopo adiciona 3 testes aos 59 anteriores, totalizando 62 no Playwright.

---

## 9. `test-local.js`

Execucao local:

```text
node scripts/test-local.js
```

Resultado:

- **162/162 paginas**
- **0** links internos quebrados
- **0** erros de JavaScript
- **0** problemas em calculadoras
- **SUCESSO**

`validation-b1` nao aparece no conjunto validado. Nenhum falso positivo para
`/validacao-encerrada.html`.

---

## 10. Integridade B1

- Contrato B1 nao foi alterado.
- Hash de `_lib/cleanup-retention.mjs` permanece `14c57306...`.
- `shared-manifest` continua com 16 arquivos.
- Build B1 passou.
- Gate retornou `validated_only`.
- Isolamento preservou 41 arquivos.
- Inventario: 7 estaticos, 9 Functions, 7 Edge, 0 redirects, sem `collect`.

---

## 11. Diffs relevantes

`scripts/test-local.js`:

- adiciona `EXCLUDED_SEGMENTS` com `validation-b1`;
- adiciona `isExcludedPath`;
- altera `collectHtmlFiles` para aceitar root e pular caminhos excluidos;
- exporta helpers e protege a execucao principal.

`tests/unit/test-local-scope.spec.js`:

- novo teste temporario de descoberta;
- teste de separadores Windows/Linux;
- teste do conjunto canonico real de 162 paginas.

Nenhuma alteracao funcional fora do escopo de descoberta.

---

## 12. Git e seguranca

- Indice Git vazio.
- Nenhum `git add`.
- Nenhum commit.
- Nenhum push.
- HEAD preservado em `68759c51e706825ec290483323e52acacc9ec75e`.
- Nenhum CI remoto.
- Nenhum deploy ou `--confirm`.
- Nenhum acesso a Netlify ou Neon.
- Nenhum SQL remoto, role, grant, flag ou cleanup.
- Nenhum segredo ou dado real introduzido.
- Apenas `scripts/test-local.js`, o novo teste e este relatorio foram editados.

---

## 13. Pendencias

- O commit e o CI remoto das correcoes ainda precisam de autorizacao.
- O CI da Fase 5F.34 permanece vermelho; a proxima execucao deve confirmar `test-local` com 162
  paginas.
- O risco TOCTOU do gate B1 permanece **NAO ACEITO**.

---

## 14. Classificacao final

**1 - Aprovado localmente.**

A causa raiz foi corrigida com exclusao explicita e segmentada, os testes de regressao reproduzem o
problema, o teste local passou com 162 paginas, e todas as suites, builds e o gate B1 passaram. O
indice Git permaneceu vazio e nenhuma operacao remota foi executada.

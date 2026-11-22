# Fase 5F.32 - Versionamento controlado e CI Linux real

Status: **commit e push concluidos; CI executado e reprovado em tres jobs. Nenhuma correcao foi enviada apos a falha.**
Data/hora: **2026-11-20T00:54:00Z** (execucao do CI).
Branch: `feat/portal-analytics`.
Commit: `027d7d31c29fb2a559a59abb3466909dfab54d29`.
Remote: `https://github.com/Brunogfv/calculeCerto.git`.

**Classificacao: 3 - Bloqueado.** O versionamento e o push foram concluidos, mas os jobs de
validacao estatica, analytics e B1 falharam no GitHub Actions. Novas correcoes exigem autorizacao.

---

## 1. Estado inicial do Git

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| Upstream inicial | ausente |
| HEAD inicial | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| Indice inicial | vazio |
| Alteracoes staged iniciais | 0 |
| `origin/main` | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Relacao local/remoto | 0 atras, 2 commits a frente |
| Branch remota da feature | nao existia antes do push |

Foi executado `git fetch origin --prune`. Nao houve reset, clean, checkout destrutivo ou force push.

---

## 2. Inventario dos 69 caminhos

| Categoria | Caminhos |
|---|---:|
| B1 | 41 |
| Fontes canonicas compartilhadas | 16 |
| Suporte raiz | 7 |
| Suporte de analytics | 5 |
| Total | 69 |

Dois caminhos continuaram identicos ao HEAD:

- `netlify/functions/_lib/db.mjs`;
- `netlify/functions/_lib/http.mjs`.

Os demais **67** tinham alteracao de conteudo.

---

## 3. Arquivos efetivamente alterados

Os 67 arquivos foram revisados e adicionados individualmente. A distribuicao staged foi:

- 41 arquivos B1, incluindo contrato, manifesto, package-lock, Functions, Edge Functions,
  paginas publicas, scripts e testes;
- 14 arquivos canonicos novos ou alterados (os dois identicos nao foram staged);
- 7 arquivos de suporte raiz (CI, package, walkers, isolamento);
- 5 arquivos de analytics/testes.

O commit contem **67 arquivos** e nenhum relatorio documental.

---

## 4. Revisao dos 13 arquivos corrigidos na Fase 5F.31

| Arquivo | Revisao final |
|---|---|
| `validation-b1/package.json` | BOM removido; JSON valido |
| `validation-b1/_lib/cleanup-retention.mjs` | mojibake corrigido; contrato atualizado |
| `validation-b1/scripts/deploy-b1.mjs` | BOM/mojibake corrigidos |
| `validation-b1/tests/artifact.spec.mjs` | BOM removido |
| `validation-b1/tests/gate.spec.mjs` | BOM removido |
| `netlify/functions/_lib/cleanup-retention.mjs` | mojibake corrigido |
| `package.json` | BOM removido; scripts preservados |
| `scripts/apply-analytics.js` | mojibake corrigido |
| `scripts/apply-accessibility.js` | somente `validation-b1` no regex; sem ruido textual |
| `scripts/build-assets.js` | somente `validation-b1` no regex |
| `scripts/generate-html-redirects.js` | BOM removido; somente `validation-b1` no regex |
| `scripts/check-b1-isolation.mjs` | BOM removido |
| `tests/analytics/capture.integration.spec.mjs` | mojibake corrigido; testes de banco/roles preservados |

Verificacoes adicionais:

- `git diff --cached --check`: limpo apos remover linhas em branco finais acidentais;
- nenhum BOM, `U+00C3` ou `U+FFFD` nos 67 arquivos staged;
- lockfile B1 e `netlify-cli@27.20.0` consistentes;
- workflow sem `--confirm`, deploy automatico ou credencial Netlify.

---

## 5. Verificacao de seguranca

- Nenhum `.env` ou variante.
- Nenhum token, chave privada ou credencial real.
- Nenhuma URL de banco real.
- Nenhum dump ou dado pessoal.
- Nenhum `node_modules`, `dist`, `.netlify` ou cache staged.
- Nenhum arquivo fora dos 67 caminhos alterados.
- Fixtures de teste usam senhas sinteticas e dominios/URLs de teste.

---

## 6. Testes executados antes do commit

Ambiente Node.js `v22.23.5`, PostgreSQL 16 descartavel e `netlify-cli@27.20.0`.

| Teste | Resultado |
|---|---|
| Analytics | **135/135 pass** |
| B1 shared/b1/artifact/gate | **39/39 pass** |
| Consentimento | **2/2 pass** |
| SSL local | **5/5 pass** |
| Symlink Linux | passou, 0 skip |
| Isolamento dos 41 | passou |
| Build canonico | passou; 162 HTML |
| Build B1 | passou; 6 arquivos + manifesto |
| `deploy:b1 -- --check` | passou; `validated_only` |

Falhas locais: 0. Cancelados: 0. Nao executados localmente: CI remoto, deploy, cleanup e producao.

---

## 7. Git add e staging

- Arquivos alterados identificados: **67**.
- Dois caminhos identicos nao foram adicionados.
- Nenhum `git add .` ou `git add -A`.
- `git diff --cached --name-status` apresentou **67** entradas.
- `git diff --cached --check` ficou limpo apos a remocao de linhas em branco finais acidentais.
- O commit foi criado somente apos a conferencia do conjunto.

---

## 8. Commit

- Hash: **`027d7d31c29fb2a559a59abb3466909dfab54d29`**
- Mensagem: `chore(analytics): versionar homologacao B1 e CI Linux`
- Arquivos: **67**
- Resumo: 21.783 insercoes e 17 remocoes.
- Branch: `feat/portal-analytics`.

---

## 9. Push

- Destino: `https://github.com/Brunogfv/calculeCerto.git`
- Branch: `feat/portal-analytics`
- Upstream criado: `origin/feat/portal-analytics`
- Resultado: **sucesso**
- Nao houve force push, rebase ou conflito.
- O push criou a branch remota, mas nao acionou o workflow, pois o trigger de push e restrito a
  `main`.

---

## 10. Execucao do CI

- Workflow: `Auditoria do Site`
- Evento: `workflow_dispatch`
- Ref: `feat/portal-analytics`
- Execucao: **44649473339**
- URL: `https://github.com/Brunogfv/calculeCerto/actions/runs/44649473339`
- Commit: `027d7d31c29fb2a559a59abb3466909dfab54d29`
- Resultado final: **failure**

---

## 11. Resultado dos jobs

### 11.1 Validacao de codigo (HTML, links internos, JS)

**Falhou** (job 136000446384, 29 s).

- Node.js 22, `npm ci` e instalacao do Playwright passaram.
- Build canonico passou.
- `npm test` falhou ao carregar `tests/analytics/capture.integration.spec.mjs`:

```text
Cannot find module .../scripts/cleanup-html-capture.mjs
```

- O arquivo `scripts/cleanup-html-capture.mjs` nao faz parte dos 69 caminhos autorizados e nao foi
  commitado.
- Os passos seguintes do job foram ignorados.

### 11.2 Analytics backend (PostgreSQL temporario)

**Falhou** (job 136000446781, 36 s).

- Node.js 22, `npm ci`, preparacao de roles e migrations passaram.
- Os testes falharam pelo mesmo motivo:

```text
Cannot find module .../scripts/cleanup-html-capture.mjs
```

- O teste de analytics nao chegou a executar a suite de integracao.
- O banco e o container foram encerrados normalmente.

### 11.3 B1 artifact and deploy gate (Linux)

**Falhou** (job 136000447258, 57 s).

- Node.js 22, `npm ci` B1, Netlify CLI e Playwright passaram.
- `sync:shared` passou.
- `npm run build` falhou com:

```text
Error: Function de origem divergente do contrato: _lib/cleanup-retention.mjs
```

- A causa e a diferenca de bytes entre o arquivo de trabalho Windows e o blob commitado/checkout
  Linux, especialmente a representacao de finais de linha usada para calcular o hash do contrato.
- O contrato foi calculado sobre o arquivo de trabalho local; no checkout Linux ele nao coincide.
- Os testes B1, consentimento e gate nao foram executados.

### 11.4 Teste do site em producao

**Ignorado** (job 136000680813), pois os jobs anteriores falharam.

---

## 12. Publicacao e operacoes externas

- O workflow nao possui `--confirm`, `netlify deploy` ou publicacao automatica.
- Nenhum job publicou.
- Nenhum deploy foi executado.
- Nenhum acesso autenticado a Netlify ou Neon.
- Nenhum Run now, cleanup, SQL remoto, role/grant remoto, flag ou variavel remota.
- Nenhum credito Netlify consumido.

Os logs completos foram preservados localmente em
`C:\Users\Joanita\AppData\Local\Temp\opencode\ci-5f32.log` (fora do repositorio).

---

## 13. TOCTOU

O risco TOCTOU permanece **NAO ACEITO**.

- Mitigacoes atuais: contrato independente, `mkdtemp`, `chmod`, validacao dupla, gate
  `--check`/`--confirm`, CLI fixado e workflow sem publicacao.
- Limitacoes: `chmod` nao e imutabilidade, o CLI rele os arquivos, nao ha lock/assinatura de
  filesystem e `netlify deploy` externo continua possivel.
- O CI reprovado nao autoriza deploy nem aceitacao do risco.

---

## 14. Pendencias e proxima acao

1. Incluir os arquivos preexistentes de analytics necessarios ao job raiz/analytics, ou restringir
   corretamente o escopo dos testes executados no CI.
2. Corrigir a consistencia entre `artifact-contract.json` e o blob Git de
   `validation-b1/netlify/functions/_lib/cleanup-retention.mjs` considerando os finais de linha do
   checkout Linux.
3. Criar novo commit e nova execucao de CI somente com autorizacao.
4. Manter `git add`/commit/push congelados ate a decisao.

---

## 15. Classificacao final

**3 - Bloqueado.**

O commit e o push foram concluidos e o CI real foi executado, mas tres jobs falharam. As falhas sao
reproduziveis e estao relacionadas ao escopo incompleto dos 69 caminhos para o job de analytics e a
uma divergencia de hash B1 causada pela representacao de linha final no checkout Linux. Nenhuma
correcao foi enviada apos o resultado, conforme a autorizacao desta fase.

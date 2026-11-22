# Fase 5F.30 - Versionamento controlado e CI Linux real

Status: **bloqueado na revisao individual antes de `git add`; nenhum commit, push ou CI executado**.
Data/hora: **2026-11-19T15:11:34-03:00** (auditoria ate o bloqueio).
Branch: `feat/portal-analytics`.
HEAD: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.
Remoto: `https://github.com/Brunogfv/calculeCerto.git`.

**Classificacao: 3 - Bloqueado.** A revisao individual encontrou corrupcao de codificacao em 31
dos 69 candidatos, incluindo arquivos B1, fontes canonicas, CI e testes. O conjunto nao deve ser
commitado como esta.

---

## 1. Inventario original dos 69

| Categoria | Quantidade |
|---|---:|
| Arquivos B1 | 41 |
| Fontes canonicas compartilhadas | 16 |
| Suporte raiz | 7 |
| Suporte de analytics estabilizado | 5 |
| **Total de caminhos revisados** | **69** |

### B1 - 41

Os 41 caminhos sao exatamente os listados nas Fases 5F.28/5F.29, incluindo:

- `.gitignore`, `README.md`, `artifact-contract.json`, `netlify.toml`;
- `package.json`, `package-lock.json` e `shared-manifest.json`;
- 9 arquivos de Functions;
- 7 arquivos de Edge Functions;
- 6 arquivos publicos;
- 7 scripts;
- 5 testes.

Todos existem, nenhum e symlink, e nenhum `dist`, `.netlify` ou `node_modules` foi incluido.

### Fontes canonicas - 16

- `netlify/functions/capture-html.mjs`
- `netlify/functions/cleanup-html-capture.mjs`
- `netlify/functions/_lib/capture-config.mjs`
- `netlify/functions/_lib/capture-handler.mjs`
- `netlify/functions/_lib/capture-validation.mjs`
- `netlify/functions/_lib/cleanup-html-capture.mjs`
- `netlify/functions/_lib/cleanup-retention.mjs`
- `netlify/functions/_lib/db.mjs`
- `netlify/functions/_lib/http.mjs`
- `netlify/edge-functions/html-capture.js`
- `netlify/edge-functions/_lib/capture-limits.mjs`
- `netlify/edge-functions/_lib/capture-policy.mjs`
- `netlify/edge-functions/_lib/capture-signature.mjs`
- `netlify/edge-functions/_lib/classifier.mjs`
- `netlify/edge-functions/_lib/edge-capture.mjs`
- `netlify/edge-functions/_lib/edge-env.mjs`

### Suporte raiz - 7

- `.github/workflows/ci.yml`
- `package.json`
- `scripts/apply-analytics.js`
- `scripts/apply-accessibility.js`
- `scripts/build-assets.js`
- `scripts/generate-html-redirects.js`
- `scripts/check-b1-isolation.mjs`

### Analytics - 5

- `scripts/test-db.mjs`
- `scripts/migrate.mjs`
- `tests/analytics/collect.integration.spec.mjs`
- `tests/analytics/capture.integration.spec.mjs`
- `tests/analytics/capture-hardening.spec.mjs`

### Divergencia de contagem no indice

Dos 16 canonicos, dois ja estavam versionados e estao identicos ao HEAD:

- `netlify/functions/_lib/db.mjs`;
- `netlify/functions/_lib/http.mjs`.

Assim, existem 69 caminhos autorizados, mas apenas 67 caminhos com mudanca de conteudo.
Os dois arquivos acima nao precisam de nova versao; a diferenca foi registrada antes de qualquer
`git add`.

---

## 2. Auditoria Git inicial

| Verificacao | Resultado |
|---|---|
| Indice inicialmente vazio | sim; `git diff --cached` sem arquivos |
| Branch | `feat/portal-analytics` |
| Upstream | ausente |
| HEAD | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| `origin/main` | `572457e506b35ce7fa0e423280aedd82b11c43fb` |
| Remote | `https://github.com/Brunogfv/calculeCerto.git` |
| Branch remota `feat/portal-analytics` | nao existia antes do push |
| `git fetch origin --prune` | executado; apenas refs remotas atualizadas |
| Alteracoes staged | nenhuma |

Nao foi executado `git add`, `git reset`, `git clean`, checkout destrutivo, commit, push ou PR.

---

## 3. Lista final dos arquivos adicionados

**Nenhum arquivo foi adicionado ao indice Git.**

O indice permanece vazio. A lista de arquivos efetivamente versionados nesta fase e vazia.

---

## 4. Arquivos rejeitados ou excluidos

Nenhum dos 69 foi rejeitado por pertencer a outra fase, por credencial ou por artefato gerado.
O conjunto inteiro foi retido por causa do bloqueio de codificacao descrito na secao 5.

Continuam excluidos:

- `.env` e variantes;
- credenciais, tokens e chaves;
- dumps e dados pessoais;
- `validation-b1/node_modules/`;
- `validation-b1/dist/`;
- `validation-b1/.netlify/`;
- caches do Playwright;
- artefatos temporarios;
- documentacao nao autorizada;
- alteracoes preexistentes de HTML, CSS, pagefind, sitemap e demais arquivos de outras tarefas.

A documentacao 5F.29 e este relatorio 5F.30 tambem nao foram adicionados.

---

## 5. Bloqueio - corrupcao de codificacao

Foram encontrados 31 dos 69 candidatos com BOM e/ou caracteres duplamente codificados
(mojibake), incluindo:

- B1: `README.md`, `package.json`, `capture-validation.mjs`, `cleanup-retention.mjs`, `db.mjs`,
  `b1-consent.js`, `index.html`, `validacao-encerrada.html`, `build.mjs`, `deploy-b1.mjs`,
  `verify-shared.mjs`, `artifact.spec.mjs`, `b1.spec.mjs`, `browser-consent.spec.mjs`,
  `gate.spec.mjs`, `shared-manifest.spec.mjs`;
- canonicos: `capture-validation.mjs`, `cleanup-retention.mjs`, `db.mjs`;
- raiz/analytics: `.github/workflows/ci.yml`, `package.json`, `apply-analytics.js`,
  `apply-accessibility.js`, `build-assets.js`, `generate-html-redirects.js`,
  `check-b1-isolation.mjs`, `test-db.mjs`, `migrate.mjs`, `collect.integration.spec.mjs`,
  `capture.integration.spec.mjs`, `capture-hardening.spec.mjs`.

Exemplos objetivos:

- a pagina B1 contem texto corrompido no titulo e no corpo, em vez de acentos corretos;
- o workflow contem `Valida??o de c?digo` em vez de `Validacao de codigo`;
- `scripts/migrate.mjs` contem `Migra??o` em vez de `Migracao`;
- o diff de `scripts/apply-accessibility.js` altera textos e emojis corretos para mojibake, embora
  a mudanca pretendida fosse apenas excluir `validation-b1` do walker.

Nao foi encontrado caractere de substituicao irreversivel nos candidatos; a maior parte parece ser
conversao indevida Windows-1252/UTF-8 e BOM. Ainda assim, normalizar agora alteraria:

- bytes de paginas e copias B1;
- hashes de `artifact-contract.json`;
- hashes do build B1;
- resultados de contrato/manifesto/gate;
- conteudo dos arquivos rastreados que hoje tem alteracoes nao intencionais.

Isso exige uma correcao propria, atualizacao consciente do contrato independente e nova rodada
completa de testes. Nao e seguro esconder isso no commit de versionamento.

Consequencia:

- o commit nao foi criado;
- o push nao foi executado;
- o CI nao foi acionado;
- nenhum teste desta fase foi usado para aprovar o conjunto;
- os resultados da Fase 5F.29 nao foram reaproveitados como se fossem a execucao atual.

---

## 6. Revisao de seguranca

Foram verificados os 69 caminhos:

- nenhum `.env` ou variante;
- nenhum arquivo de credencial;
- nenhum token real, chave privada ou URL de banco real;
- nenhum dump ou dado pessoal;
- nenhum symlink;
- nenhum `node_modules`, `dist` ou `.netlify`;
- lockfile B1 incluido no conjunto;
- o workflow nao possui deploy automatico, `--confirm` ou `netlify deploy`;
- fixtures de teste usam senhas sinteticas e dominio `.invalid`.

As ocorrencias de `DATABASE_URL`, `*_SECRET`, `postgresql://` e similares sao listas de bloqueio,
validacoes ou fixtures, nao credenciais reais.

A corrupcao de codificacao e um defeito de conteudo, nao um vazamento de segredo.

---

## 7. Testes antes do commit

**Nao executados nesta fase.** A revisao individual bloqueou o processo antes de `git add` e antes
da rodada final, conforme a regra de interromper diante de divergencia.

Os resultados da Fase 5F.29 permanecem validos apenas como historico daquela execucao e nao foram
reutilizados como evidencia de aprovacao deste conjunto.

| Status | Quantidade |
|---|---:|
| Testes desta fase executados | 0 |
| Aprovados | 0 |
| Falharam | 0 |
| Ignorados | 0 |
| Cancelados | 0 |
| Nao executados | toda a regressao prevista |

---

## 8. Commit

Nao houve commit.

- Hash: nenhum;
- arquivos no commit: 0;
- branch: `feat/portal-analytics`;
- HEAD permanece `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

---

## 9. Push

Nao houve push.

- Destino remoto confirmado: `Brunogfv/calculeCerto`;
- branch de destino prevista: `feat/portal-analytics`;
- nao foi usado `--force` ou `--force-with-lease`;
- nenhuma referencia remota foi criada ou alterada por push.

---

## 10. CI Linux real

Nao houve execucao de CI.

- workflow previsto: `Auditoria do Site`;
- execucao: nenhuma;
- run id: nenhum;
- jobs: nenhum;
- Node.js 22: nao executado nesta fase;
- nenhum job B1, contrato, gate, symlink ou isolamento foi executado no GitHub.

Nao foi feita alteracao de configuracao remota para forcar workflow.

---

## 11. Logs e falhas relevantes

Nao ha logs de CI desta fase.

A falha relevante e local e anterior ao commit:

- 31 candidatos com BOM/mojibake;
- alteracoes de conteudo nao intencionais em arquivos rastreados;
- contrato B1 atualmente coerente com os bytes corrompidos, nao com o texto esperado;
- dois canonicos ja versionados e sem alteracao.

---

## 12. Ausencia de publicacao automatica

O workflow revisado continua sem `--confirm`, sem `netlify deploy` e sem publicacao automatica.
Nenhum job foi executado. Nenhum deploy foi feito.

---

## 13. TOCTOU

O risco TOCTOU permanece **NAO ACEITO**.

- O CI nao foi executado, portanto nao ha aprovacao de CI que possa ser confundida com aceitacao.
- As mitigacoes existentes continuam: contrato independente, `mkdtemp`, `chmod`, validacao
  dupla, gate `--check`/`--confirm` e CLI fixado.
- As limitacoes continuam: `chmod` nao e imutabilidade, o CLI rele o pacote, nao ha lock/assinatura
  de filesystem e `netlify deploy` externo continua possivel.
- A aceitacao exige decisao explicita separada.

---

## 14. Operacoes remotas Netlify/Neon

- Nenhum acesso a Netlify.
- Nenhum acesso ao Neon.
- Nenhuma credencial remota usada.
- Nenhum deploy, `--confirm`, Run now ou cleanup.
- Nenhum SQL remoto, role/grant remoto ou migration remota.
- Nenhuma variavel, flag ou configuracao remota alterada.
- Nenhum credito Netlify consumido.

A unica operacao de rede Git foi `git fetch origin --prune` no GitHub, para verificar o remoto.

---

## 15. Classificacao final

**3 - Bloqueado.**

O versionamento e o CI nao foram executados porque a revisao individual encontrou corrupcao de
codificacao em 31 dos 69 candidatos, incluindo arquivos rastreados e paginas B1. E necessaria uma
correcao controlada de codificacao, atualizacao do contrato B1 e nova rodada de testes antes de
qualquer `git add`, commit, push ou CI. O risco TOCTOU continua nao aceito.

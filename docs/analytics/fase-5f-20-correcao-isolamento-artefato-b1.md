# Fase 5F.20 — Correção local do isolamento e do artefato mínimo B1

Status: **correção local implementada e testada; nenhuma operação remota executada**.
Data/hora: **2026-11-18T17:56:25-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O B1 agora possui um pacote de deploy isolado e
validado, com contrato fechado e testes de falha. O deploy remoto ainda não foi refeito; a causa
remota exata da herança de base e o SSL permanecem pendentes de uma fase autorizada.

---

## 1. Resumo executivo

A Fase 5F.19 mostrou que o deploy `6afd151972b2d3618033a7dd` publicou `collect`, 252 redirects e
16 headers do projeto raiz, embora o build B1 local tenha apenas sete arquivos estáticos, duas
Functions e uma Edge Function.

A correção local:

- adiciona um validador de contrato em `validation-b1/scripts/artifact.mjs`;
- faz o build B1 falhar se encontrar Functions, Edge Functions, redirects ou conteúdo proibido;
- cria um pacote de deploy auto-contido em diretório temporário, com `netlify.toml` explícito,
  `dist`, Functions e Edge Functions;
- gera um manifesto do artefato final;
- adiciona testes que rejeitam `collect`, `_redirects` e caminhos/configuração fora do contrato.

O build canônico não foi alterado. Os testes existentes de analytics, B1, consentimento e navegador
permanecem aprovados.

O novo pacote não foi enviado a nenhum ambiente; o deploy divergente da 5F.18 continua existindo
como preview não publicado.

---

## 2. Causa raiz comprovada

### 2.1 Fato comprovado localmente

O artefato B1 local está correto:

- `validation-b1/dist` contém somente os sete caminhos estáticos permitidos;
- `validation-b1/netlify/functions` contém somente `capture-html.mjs` e
  `cleanup-html-capture.mjs` e suas dependências;
- `validation-b1/netlify/edge-functions` contém somente `html-capture.js` e suas dependências;
- não existe `collect` no B1;
- não existe `_redirects` no B1;
- `_headers` do B1 é próprio e não é o `_headers` raiz;
- o build B1 não lê nem copia `collect`, redirects ou headers do projeto raiz.

Portanto, a divergência não veio do build B1 nem da sincronização canônico/B1.

### 2.2 Causa operacional delimitada

O deploy da 5F.18 usou os seguintes elementos do projeto raiz:

- a Function `collect`;
- o `_redirects` raiz com 252 regras;
- o `_headers` raiz, resultando em 16 regras.

Como os mesmos arquivos não existem no B1 local, a herança ocorreu na camada de **resolução de
base/configuração do deploy**, não no build. A evidência é compatível com o CLI/site resolver o
projeto raiz como base para configuração, Functions, redirects e headers, enquanto `--dir` apontava
para `validation-b1/dist`.

**Limite:** a causa remota exata — base do Site ID vs. descoberta do projeto raiz pelo CLI — não foi
consultada nesta fase. Não se deve tratá-la como comprovada sem uma leitura remota autorizada.

---

## 3. Hipóteses descartadas ou ainda pendentes

### Descartadas

- **Sincronização inadequada:** 16/16 hashes canônico × B1 idênticos.
- **Build B1 copiando extras:** o build recria `dist`, copia `public` e não inclui `collect` ou
  `_redirects`.
- **Código B1 contendo `collect`:** não existe no diretório B1.
- **Alteração de código na 5F.18:** o deploy reutilizou artefato local; não houve alteração.
- **Headers/redirects dentro do `dist` B1:** o B1 não possui `_redirects`; seu `_headers` é o
  mínimo próprio.

### Pendente

- **Base remota do site B1:** não lida.
- **Configuração exata usada pelo comando `netlify deploy`:** não há dry-run local que reproduza a
  resolução remota.
- **Causa exata da herança:** continua dependente de leitura de configuração remota ou de um deploy
  controlado com o novo pacote.

---

## 4. Arquivos alterados e justificativa

### Novos

- `validation-b1/scripts/artifact.mjs`
  - contrato estático, Functions, Edge, headers, redirects, paths e secrets;
  - criação de pacote auto-contido;
  - manifesto do artefato final.
- `validation-b1/scripts/package-deploy.mjs`
  - gera o pacote isolado e imprime contagens/hash do config.
- `validation-b1/tests/artifact.spec.mjs`
  - testa contrato, pacote, ausência de `collect` e falha com `_redirects`.

### Modificados

- `validation-b1/scripts/build.mjs`
  - chama `validarFontesB1(B1)` e falha cedo em conteúdo fora do contrato.
- `validation-b1/package.json`
  - adiciona `package:deploy`;
  - inclui `tests/artifact.spec.mjs` na suíte.

### Artefatos locais

- `validation-b1/dist` e `validation-b1/.netlify` foram reconstruídos localmente;
- `validation-b1/shared-manifest.json` foi regenerado;
- nenhum arquivo do código canônico, migration, banco, variável, flag ou configuração remota foi
  alterado.

---

## 5. Contrato mínimo B1 implementado

### 5.1 Estáticos permitidos

A lista fechada é:

1. `index.html`;
2. `validacao-encerrada.html`;
3. `robots.txt`;
4. `_headers`;
5. `b1-consent.js`;
6. `b1.css`;
7. `build-manifest.json`.

Não é permitido `_redirects`. O `_headers` do pacote deve ter hash idêntico ao
`validation-b1/public/_headers`.

### 5.2 Functions permitidas

- `capture-html.mjs`;
- `cleanup-html-capture.mjs`;
- `_lib/capture-config.mjs`;
- `_lib/capture-handler.mjs`;
- `_lib/capture-validation.mjs`;
- `_lib/cleanup-html-capture.mjs`;
- `_lib/cleanup-retention.mjs`;
- `_lib/db.mjs`;
- `_lib/http.mjs`.

`collect.mjs` é proibido.

### 5.3 Edge Functions permitidas

- `html-capture.js`;
- `_lib/capture-limits.mjs`;
- `_lib/capture-policy.mjs`;
- `_lib/capture-signature.mjs`;
- `_lib/classifier.mjs`;
- `_lib/edge-capture.mjs`;
- `_lib/edge-env.mjs`.

### 5.4 Configuração

O pacote contém um `netlify.toml` próprio:

```toml
[build]
  publish = "dist"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify/functions"
```

O validador rejeita caminho absoluto, `base` e configuração fora desse contrato.

### 5.5 Detecção e falha

O build/pacote falha quando:

- um arquivo estático extra aparece;
- `_redirects` aparece;
- `collect.mjs` aparece;
- uma Function/Edge fora da lista aparece;
- `_headers` difere do B1;
- `netlify.toml` contém caminho absoluto ou base;
- um segredo literal aparece nos arquivos publicados.

---

## 6. Manifesto do artefato final

O pacote gerado em diretório temporário contém:

| Item | Quantidade |
|---|---:|
| Arquivos estáticos | 7 |
| Functions (incluindo libs) | 9 |
| Edge Functions (incluindo libs) | 7 |
| Redirects | 0 |
| `collect` | ausente |
| Config hash | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |

O `package-manifest.json` registra SHA-256 de cada arquivo estático, Function, Edge e do
`netlify.toml`. O `_headers` do pacote tem hash
`cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839`.

O caminho temporário absoluto do pacote não é publicado no site e foi removido após a verificação.

---

## 7. Resultados dos testes

| Verificação | Resultado |
|---|---|
| Analytics (unitários + integração PostgreSQL 17) | **135/135 pass**, 0 fail, 0 skip |
| B1 (`sync:shared` + build + tests) | **23/23 pass** |
| Consentimento no navegador | **2/2 pass** |
| Build B1 | 6 arquivos publicados + `build-manifest.json`, 10,0 KiB |
| Pacote B1 | 7 estáticos, 9 Functions, 7 Edge, 0 redirects |
| Teste de ausência de `collect` | passou |
| Teste de ausência de `_redirects` | passou |
| Teste de falha com `collect` | passou; pacote rejeitado |
| Teste de falha com `_redirects` | passou; pacote rejeitado |
| Manifesto final | gerado e validado |

Os testes de falha usaram diretórios temporários fora do workspace; nenhum arquivo temporário
permaneceu. Nenhum código foi reduzido de cobertura.

---

## 8. Comparação com o artefato divergente da Fase 5F.18

| Item | Deploy 5F.18 | Pacote B1 5F.20 |
|---|---|---|
| Estáticos | B1 + configuração raiz | 7 arquivos B1 fechados |
| Functions | 3, incluindo `collect` | 2 Functions + libs |
| Edge | 1 | 1 |
| Redirects | 252 | 0 |
| Headers | 16 do conjunto raiz | `_headers` B1 com hash |
| Config | raiz herdada | `netlify.toml` próprio do pacote |
| `collect` | presente | ausente |
| Origem do build | resolução de base externa | pacote isolado fora do repo |

O novo pacote remove exatamente os três componentes que causaram o bloqueio na 5F.18: `collect`,
252 redirects e headers raiz.

---

## 9. Riscos residuais

- O deploy remoto ainda aponta para o artefato divergente `6afd...` não publicado; nenhuma remoção
  ou correção remota foi feita.
- A causa remota exata da base ainda não foi confirmada.
- Se um operador executar `netlify deploy` diretamente no B1, poderá repetir a herança; o caminho
  correto é usar o pacote gerado e executar o CLI de dentro do pacote isolado.
- O pacote usa diretório temporário; o operador deve preservar seu caminho até o deploy e removê-lo
  depois.
- SSL e `CLEANUP_DATABASE_URL` continuam fora do escopo desta fase.
- O pacote não inclui `collect`, mas o site B1 remoto atual ainda contém a Function divergente do
  deploy anterior.

---

## 10. Dependências remotas ainda pendentes

- Um novo deploy preview usando o pacote isolado; não autorizado nesta fase.
- Confirmar que a base remota do site B1 não voltará a herdar o projeto raiz.
- Confirmar na API/lista de arquivos que o deploy final tem somente o contrato.
- Manter a flag de cleanup desativada até a validação manual autorizada.
- A validação SSL continua pendente e não foi iniciada.
- A validação de Run now/cron/produção não foi iniciada.

---

## 11. Classificação final

**2 — Aprovado com pendências.**

A correção local está implementada, o artefato B1 está isolado e os testes demonstram ausência de
`collect`, redirects e headers herdados. A pendência é a validação remota do novo pacote e a
confirmação da causa da base; nenhum deploy, publicação ou execução remota foi feito nesta fase.

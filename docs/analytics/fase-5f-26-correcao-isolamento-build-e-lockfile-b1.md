# Fase 5F.26 — Correção do isolamento do build e reprodutibilidade B1

Status: **correções locais implementadas e testadas; nenhuma publicação ou operação remota executada**.
Data/hora: **2026-11-19T15:20:00-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O build canônico está isolado de
`validation-b1`, o lockfile B1 registra `netlify-cli@27.20.0` e o CI usa `npm ci`. O CI remoto
continua não executado, a instalação/validação do CLI fixado continua pendente e a janela TOCTOU
do deploy permanece residual.

---

## 1. Causa comprovada da alteração dos arquivos B1

### Fato observado

A execução de `npm run build` no raiz modificou:

- `validation-b1/public/index.html`;
- `validation-b1/public/validacao-encerrada.html`.

Os arquivos passaram a ter:

- bloco de analytics injetado;
- skip link;
- `main` com `id` e `tabindex`.

### Causa

Os walkers canônicos:

- `scripts/apply-analytics.js`;
- `scripts/apply-accessibility.js`;
- `scripts/build-assets.js`;
- `scripts/generate-html-redirects.js`;

não excluíam `validation-b1` nas respectivas expressões `IGNORAR`/`IGNORAR_HTML`. O walker partia
de `ROOT` e tratava a árvore B1 como HTML canônico. `apply-analytics` e `apply-accessibility`
escreviam nesses arquivos; `build-assets` podia reescrever referências; `generate-html-redirects`
também considerava páginas B1.

Isso foi confirmado pelo contador anterior (`164 HTML`) e pelo gate falhando com
`Conteudo de origem divergente do contrato: index.html`.

---

## 2. Correção aplicada

Foi adicionado `validation-b1` às exclusões dos quatro walkers canônicos. O build canônico agora
não visita essa árvore para analytics, acessibilidade, referências de assets ou redirects.

Também foi adicionado `scripts/check-b1-isolation.mjs` e o comando:

```text
npm run test:isolation
```

O teste:

1. calcula SHA-256 de 41 arquivos relevantes de `validation-b1` (sem `dist`, `.netlify` e
   `node_modules`);
2. executa `npm run build` no raiz;
3. recalcula os hashes;
4. falha se qualquer arquivo for alterado, removido ou adicionado;
5. executa o build B1;
6. confirma que o build B1 também preserva as fontes.

Resultado local:

```text
B1 isolation ok: 41 arquivos preservados pelo build canonico e pelo build B1.
```

O build canônico agora processa 162 HTML (antes 164) e não modifica B1.

---

## 3. Evidências de integridade antes/depois

- Antes da correção, o build canônico alterou os dois HTML B1 e o gate bloqueou.
- Após a correção, `npm run test:isolation` comparou 41 hashes antes/depois e passou.
- Os hashes dos dois arquivos restaurados permanecem:
  - `index.html`: `d5c59888a9cd679c08ae3d961be7595bdd0adc18c0917a949945a3b37352f63c`;
  - `validacao-encerrada.html`: `1f6d5884b1a2f4a74f0dfad6ccf82a72a7db949883fbd23a873e524f0ddf964f`.
- `npm run deploy:b1 -- --check` validou o pacote após o build canônico, sem publicar.

---

## 4. Estrutura de dependências e lockfiles

| Item | Situação |
|---|---|
| Lockfile raiz | `package-lock.json` existente; CI raiz agora usa `npm ci` |
| Lockfile B1 | `validation-b1/package-lock.json` existente e atualizado |
| Workspaces npm | não |
| Dependência compartilhada | não há workspace; B1 tem dependências próprias |
| Netlify CLI no B1 | `netlify-cli: 27.20.0` no package.json e no lockfile |
| Instalação global | não usada pelo gate |

O lockfile B1 passou a registrar:

- `netlify-cli@27.20.0`;
- resolução `https://registry.npmjs.org/netlify-cli/-/netlify-cli-27.20.0.tgz`;
- dependências transitivas do CLI.

O lockfile cresceu para aproximadamente 505.941 bytes. Não foi criado outro lockfile.

---

## 5. Netlify CLI

- `package.json` do B1: `netlify-cli: "27.20.0"` exato.
- `package-lock.json` do B1: `node_modules/netlify-cli` com `27.20.0`.
- Gate: usa `node_modules/.bin/netlify` e lê `node_modules/netlify-cli/package.json`.
- O gate rejeita versão diferente de 27.20.0.
- Nenhuma instalação global é usada.
- Nenhuma execução do CLI foi feita nesta fase.
- A compatibilidade de argumentos com o binário real não foi executada; permanece pendente de CI.

A validação `npm ci --dry-run --ignore-scripts --no-audit --no-fund` no B1 passou a resolver a árvore
a partir do lockfile sem instalar/excutar o CLI. A saída listou os pacotes, mas nada foi instalado.

---

## 6. Alterações no CI

`.github/workflows/ci.yml`:

- jobs raiz agora usam `npm ci`;
- job B1 usa `npm ci --no-audit --no-fund`;
- job `b1-artifact-linux` mantém Node.js 22, Playwright, build B1, testes TAP com falha em
  `# SKIP`, consentimento e `deploy:b1 -- --check`;
- job raiz `validacao-estatica` ganhou `npm run test:isolation`;
- nenhum job usa `--confirm`;
- nenhum job publica;
- nenhuma credencial Netlify/Neon foi adicionada.

O workflow não foi executado no GitHub nesta fase. A sintaxe foi inspecionada localmente, mas não
há garantia de execução remota bem-sucedida até um push/disparo autorizado.

---

## 7. Resultado de `npm ci`

- Root `npm ci --dry-run --ignore-scripts --no-audit --no-fund`: passou.
- B1 `npm ci --dry-run --ignore-scripts --no-audit --no-fund`: passou.
- Nenhuma instalação real foi feita.
- Netlify CLI não foi instalado nem executado.
- O `npm ci` real deverá ser executado no CI ou em ambiente isolado autorizado.

---

## 8. TOCTOU

O mecanismo atual:

- pacote em `mkdtemp` exclusivo;
- validação independente;
- `chmod` recursivo;
- validação final;
- deploy pelo mesmo `dir`.

Ainda existe janela TOCTOU entre a validação final e a abertura dos arquivos pelo CLI. `chmod` não
é imutabilidade absoluta para o mesmo usuário; outro processo pode restaurar permissões ou substituir
arquivos/diretórios. Não foi adicionada complexidade de assinatura/lock de filesystem.

Mitigação recomendada: janela exclusiva de publicação, sem outros processos do mesmo usuário, e
validação do deploy após a publicação. Risco residual documentado.

---

## 9. Testes e resultados

| Suíte | Resultado |
|---|---|
| Build canônico + isolamento B1 | **passou**; 41 arquivos preservados |
| Build B1 isolado | **passou** |
| `deploy:b1 -- --check` | **passou**, sem rede/publicação |
| Analytics + PostgreSQL 17 | **135/135 pass** |
| B1 Windows | **38 pass, 1 skip**, 39 testes |
| B1 Linux (artifact/gate) | **20/20 pass**, incluindo symlink de arquivo |
| Consentimento no navegador | **2/2 pass** |
| SSL local | **5/5 pass** |
| Contrato/manifesto/hashes | **passou** |
| Gate/mocks adversariais | **passou** |
| `npm ci --dry-run` raiz | **passou** |
| `npm ci --dry-run` B1 | **passou** |

O skip do Windows é apenas o symlink; o Linux o executou e passou. Nenhum teste foi desclassificado
como aprovado por omissão.

---

## 10. Arquivos modificados

Novos:

- `scripts/check-b1-isolation.mjs`;
- `docs/analytics/fase-5f-26-correcao-isolamento-build-e-lockfile-b1.md`.

Modificados:

- `scripts/apply-analytics.js` — exclui `validation-b1`;
- `scripts/apply-accessibility.js` — exclui `validation-b1`;
- `scripts/build-assets.js` — exclui `validation-b1`;
- `scripts/generate-html-redirects.js` — exclui `validation-b1`;
- `package.json` raiz — adiciona `test:isolation`;
- `validation-b1/package-lock.json` — registra `netlify-cli@27.20.0`;
- `.github/workflows/ci.yml` — `npm ci` e isolamento.

Não alterados:

- código canônico de produção;
- migrations;
- banco/roles/grants;
- variáveis/flags remotas;
- deploys existentes.

---

## 11. Riscos e pendências

- TOCTOU entre validação e publicação.
- Contrato local sem assinatura externa.
- CLI 27.20.0 registrado no lock, mas ainda não instalado/executado.
- CI remoto não executado.
- `npm ci` real não executado (apenas dry-run).
- `netlify deploy` externo continua possível.
- Symlink de diretório não foi separado do teste de arquivo.

---

## 12. Confirmação de ausência de operações remotas

- Nenhum acesso a Netlify ou Neon.
- Nenhum `netlify deploy`, `deploy:b1 -- --confirm`, Run now ou cleanup.
- Nenhum SQL remoto, role/grant/migration alterado.
- Nenhuma flag/variável remota alterada.
- Nenhum crédito Netlify consumido.
- Nenhum commit, push, PR ou workflow remoto.

---

## 13. Classificação final

**2 — Aprovado com pendências.**

A causa da contaminação foi corrigida e comprovada por snapshot de 41 arquivos; o lockfile B1 agora
inclui o CLI fixado e o CI foi preparado para `npm ci`. A publicação ainda não deve ser autorizada
até executar o CI Linux, instalar/validar o CLI e aceitar explicitamente o risco TOCTOU residual.

# Fase 5F.45 - Correcao local da compatibilidade Netlify CLI e recuperacao do staging

Status: **correcao local concluida; staging da tentativa anterior identificado e removido com
seguranca; nenhum deploy, upload, commit, push, migration ou operacao remota executado**.
Data/hora de referencia: **2026-11-20T16:43:36Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CLI fixada: `netlify-cli/27.20.0` (`win32-x64`, Node `v24.13.0` local).

**Classificacao: 1 - Corrigido e pronto para solicitar nova autorizacao.**

---

## 1. Causa tecnica confirmada

A Fase 5F.44 falhou com:

```text
Error: --context flag is only available when using the --build flag
```

A causa e direta:

- `--context` no Netlify CLI e uma opcao de **ambiente de build**;
- o gate usa `--no-build` para publicar o artefato ja construido e validado;
- o CLI 27.20.0 rejeita a combinacao `--context` + `--no-build` antes de criar o deploy;
- a tentativa nao gerou deploy na B1.

O preflight da 5F.44 havia passado porque `--check` nao monta o comando do CLI; os testes da 5F.43
validavam `montarDeploy`/args, mas nao executavam a semantica real do CLI. A simulacao local nao
cobria essa incompatibilidade.

---

## 2. Versao e comportamento do CLI

Fonte local inspecionada:

- `validation-b1/node_modules/netlify-cli/package.json`: versao `27.20.0`;
- `dist/commands/deploy/index.js`:
  - `--context` e descrito como contexto de variaveis lidas **durante o build**;
  - existe a validacao `if (options.context && !options.build) return logAndThrowError(...)`;
- `dist/commands/deploy/deploy.js`:
  - `deployToProduction = !options.draft && (options.prod || (options.prodIfUnlocked && ...))`;
  - `draft = options.draft || (!deployToProduction && !alias)`;
  - sem `--prod`, sem alias, o deploy e draft;
  - a opcao `--draft` existe no CLI (oculta no help), e conflita com `--prod` e
    `--prod-if-unlocked`.

O comportamento foi confirmado sem deploy real, por leitura da versao instalada e pelo erro
efetivamente observado na tentativa anterior.

---

## 3. Alternativas avaliadas

| Alternativa | Resultado |
|---|---|
| Manter `--context` e remover `--no-build` | Rejeitada: o CLI executaria build e poderia reconstruir o artefato; viola a identidade validada |
| Manter `--context` e usar `--build` | Rejeitada pelo mesmo motivo; build silencioso |
| Remover `--context` e confiar apenas no padrao | Funciona, mas deixa o draft implicito |
| Remover `--context` e adicionar `--draft` | **Escolhida**: draft explicito, sem build, suportado pelo CLI fixado |
| Usar `--prod-if-unlocked` ou `--prod` | Proibido; conflita com o escopo |
| Alterar o site/configuracao remota para outro contexto | Proibido e desnecessario |

A opcao escolhida preserva:

- artefato preconstruido (`--no-build`);
- draft explicito (`--draft`);
- Site ID B1 fixo;
- `--functions`/`--dir` explicitos;
- `--skip-functions-cache`;
- nenhuma heranca canonica;
- nenhum rebuild.

O unico comportamento que muda em relacao ao comando anterior e a remocao de `--context`, que era
incompativel e nao era necessaria para o draft.

---

## 4. Alteracoes locais realizadas

- `validation-b1/scripts/deploy-target.mjs`:
  - removeu `--context` do comando;
  - adicionou `--draft` a allowlist obrigatoria;
  - manteve `--no-build`, `--skip-functions-cache`, `--dir`, `--functions`, `--site` e mensagem fixa;
  - `--prod` e `--context` continuam rejeitados.
- `validation-b1/scripts/deploy-b1.mjs`:
  - `limparStaging` passou a reportar `removed`, caminho e erro de liberacao;
  - o gate nao mascara mais falha de staging como deploy bem-sucedido;
  - se a limpeza falhar apos sucesso, o status retornado e
    `deployed_staging_retained`/`validated_staging_retained` e o staging e registrado;
  - falha principal e falha de limpeza ficam associadas, sem segunda tentativa automatica.
- `validation-b1/tests/deploy-simulation.spec.mjs`:
  - verifica ausencia de `--context`, presenca de `--draft`, `--prod` bloqueado, args invalidos,
    allowlist de ambiente, target, digest e simulacao ponta a ponta;
  - adiciona teste de limpeza segura do staging.
- `validation-b1/package.json` e `.github/workflows/ci.yml` ja incluem o teste de simulacao.

Nenhuma alteracao de producao, Neon, flags, secrets ou historico Git.

---

## 5. Comando para uma futura tentativa

Nao executado nesta fase:

```powershell
cd validation-b1
npm run deploy:b1 -- --check
npm run deploy:b1 -- --confirm
```

Argumentos efetivos esperados do CLI:

```text
deploy
--dir <pacote>/dist
--functions <pacote>/netlify/functions
--site 9cd7034f-5691-46af-8030-d70f7ed52ca7
--no-build
--draft
--skip-functions-cache
--message "Fase 5F.43 preview B1 isolado"
```

Nao ha `--context`, `--prod`, `--prod-if-unlocked`, `--remote`, `--filter`, `--env`, aliases
curtas ou argumentos desconhecidos. O `--draft` e explicito e compativel com `--no-build` na versao
fixada.

---

## 6. Demonstracao de que nao houve tentativa real

- Nenhum `netlify deploy` foi executado nesta fase.
- Nenhum `--confirm` foi executado.
- O CLI foi consultado apenas para versao/help local e leitura do codigo instalado.
- Nenhuma API Netlify de escrita foi chamada.
- Nenhuma conexao Neon, migration, cleanup ou alteracao remota.
- O staging da tentativa anterior foi manipulado apenas no filesystem local apos validacao de
  identidade.

---

## 7. Staging temporario da Fase 5F.44

Diretorio:

```text
%TEMP%\portal-contas-b1-deploy-sHosAj
```

Antes da limpeza:

- existia;
- continha 25 arquivos do pacote;
- `package-manifest.json` SHA-256:
  `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac`;
- `validarPacote` passou;
- `digestArtefato` era
  `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`;
- portanto, era o artefato da tentativa interrompida, nao um diretorio desconhecido.

A limpeza foi feita por `limparStaging` no caminho exato, apos a validacao, e retornou:

```json
{"removed":true,"path":"C:\\Users\\Joanita\\AppData\\Local\\Temp\\portal-contas-b1-deploy-sHosAj","liberacao_erro":null}
```

O diretorio agora nao existe. O lock do gate tambem esta ausente. Nao foi usada exclusao
indiscriminada de `%TEMP%`; apenas o staging identificado.

---

## 8. Testes e resultados

### Windows

| Set | Resultado |
|---|---|
| `npm test` B1 | 57 testes: 56 pass, 1 skip, 0 fail |
| `npm run test:browser` B1 | 2/2 pass |
| `npm run deploy:b1 -- --check` | `validated_only`; 7/9/7/0 |
| `node --check` scripts/testes | pass |

Skip: symlink no Windows; equivalente Linux passou.

### Linux Node 22

| Set | Resultado |
|---|---|
| `node --test` B1 shared/b1/artifact/gate/deploy-simulation | **57/57 pass**, 0 skip |
| Node | `v22.23.5` |

### Regressao correlata

| Set | Resultado |
|---|---|
| Analytics | 137/137 pass |
| Playwright | 62/62 pass |
| test-local | 162/162 pass |
| SSL | 5/5 pass |
| Isolamento | 43 arquivos preservados |
| Build canonico | 162 HTML |

A mudanca e restrita a argumentos de deploy, staging e testes B1; nao alterou paginas canonicas.

---

## 9. Riscos residuais

- A janela TOCTOU entre a ultima validacao e a leitura do CLI continua; o digest e a revalidacao
  reduzem, mas nao eliminam a corrida de filesystem.
- O CLI externo ainda pode ser executado fora do gate; a politica operacional deve proibir.
- O lock e cooperativo e pode ficar orfao apos interrupcao abrupta.
- Hardlinks/junctions e substituicao de diretorio nao sao imutabilidade absoluta.
- O `--draft` e uma opcao oculta do CLI 27.20.0; a versao esta fixada, mas deve ser revalidada se o
  CLI for atualizado.
- Nao houve deploy real nesta fase; a verificacao pos-upload sera necessaria na proxima janela.
- O staging foi limpo, mas falhas futuras de limpeza serao reportadas e nao serao confundidas com
  sucesso.

---

## 10. Classificacao final

**1 - Corrigido e pronto para solicitar nova autorizacao.**

A incompatibilidade foi removida sem rebuild, sem perder o draft explicito, o alvo B1, a allowlist
de argumentos, a allowlist de ambiente, o manifesto, o digest ou a trava. O staging residual foi
validado e removido; os testes Windows/Linux passaram. A autorizacao anterior terminou na 5F.44 e
nao e reutilizada por esta fase.

Nao houve deploy, upload, commit, push, PR, migration, cleanup ou alteracao de producao.

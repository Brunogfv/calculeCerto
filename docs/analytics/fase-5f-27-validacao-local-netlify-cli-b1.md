# Fase 5F.27 — Instalação e validação local do Netlify CLI B1

Status: **instalação real e validação local concluídas; nenhuma publicação, operação autenticada ou alteração na Netlify/Neon foi executada**.
Data/hora: **2026-11-19T14:42:50-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O lockfile B1 instalou e executou localmente
`netlify-cli@27.20.0`, sem CLI global. O CI remoto continua não executado e o risco TOCTOU do gate
permanece residual e **não aceito**.

---

## 1. Leitura e estrutura verificadas

Foram inspecionados:

- `docs/analytics/fase-5f-26-correcao-isolamento-build-e-lockfile-b1.md`;
- `validation-b1/package.json`;
- `validation-b1/package-lock.json`;
- `validation-b1/scripts/deploy-b1.mjs`;
- `.github/workflows/ci.yml`.

Estrutura confirmada:

| Item | Situação |
|---|---|
| Workspaces npm | não |
| Dependências B1 | próprias, em `validation-b1/node_modules` |
| Lockfile B1 | `validation-b1/package-lock.json`, 505.941 bytes |
| Hash SHA-256 do lockfile | `5640303029B537769810ADD41C38106E0B924C493A6105C6339F4C0F911AA0AE` |
| `netlify-cli` declarado | `27.20.0`, exato, em `devDependencies` |
| `netlify-cli` no lockfile | `node_modules/netlify-cli`, versão `27.20.0` |
| Instalação global | ausente |
| Binário usado pelo gate | `validation-b1/node_modules/.bin/netlify[.cmd]` |

O diretório B1 é independente do raiz; não há workspace compartilhando a árvore de dependências.

---

## 2. Instalação real

Executado em `validation-b1`:

```text
npm ci --no-audit --no-fund
```

Resultado:

```text
added 946 packages in 20s
```

- `npm ci` concluiu com código 0.
- A instalação foi feita a partir do lockfile, sem `npm install`.
- Nenhuma versão foi alterada e nenhuma dependência foi atualizada.
- O lockfile permaneceu com 505.941 bytes e o hash acima após a instalação.
- Houve apenas avisos de depreciação transitivos (`@opentelemetry/sdk-trace-node`,
  `@opentelemetry/sdk-trace-base`, `node-domexception`), sem falha de instalação.
- O acesso permitido foi somente ao registro npm; nenhuma credencial ou API da Netlify foi usada.
- `node_modules` é ignorado pelo Git e não deve ser versionado.

---

## 3. Validação do CLI

Comando executado somente para consulta local de versão:

```text
validation-b1\node_modules\.bin\netlify.cmd --version
```

Saída efetiva:

```text
netlify-cli/27.20.0 win32-x64 node-v24.13.0
```

Confirmações:

- versão instalada: **27.20.0**, exatamente a fixada;
- executável local Windows: `D:\Projetos\Site Calculadora\validation-b1\node_modules\.bin\netlify.cmd`;
- pacote local: `D:\Projetos\Site Calculadora\validation-b1\node_modules\netlify-cli\package.json`;
- `npm ls netlify-cli --depth=0` retornou `netlify-cli@27.20.0`;
- `Get-Command netlify` não encontrou CLI global;
- nenhuma dependência de instalação global foi usada.

Compatibilidade com o gate: `deploy-b1.mjs` mantém `NETLIFY_CLI_VERSION = '27.20.0'`, resolve o
binário em `node_modules/.bin` e compara a versão de `node_modules/netlify-cli/package.json`. A
verificação local reproduziu essa checagem e passou com `27.20.0`.

Nenhum comando de deploy, login, status, link, build remoto ou acesso à conta foi executado.

---

## 4. Gate e regressão

| Verificação | Resultado |
|---|---|
| B1 Windows: `npm run test:all` | **38 pass, 1 skip**, 39 testes |
| B1 browser/consentimento | **2/2 pass** |
| B1 Linux: artifact + gate | **20/20 pass** |
| Isolamento B1 no build canônico | **41 arquivos preservados** |
| Analytics + PostgreSQL 17 local | **135/135 pass** |
| SSL local | **5/5 pass** |
| `npm run deploy:b1 -- --check` | **passou**; `validated_only` |

Resultado do gate:

```json
{
  "status": "validated_only",
  "static_files": 7,
  "functions": 9,
  "edge_functions": 7,
  "redirects": 0
}
```

O skip do Windows é somente o teste de symlink; ele foi executado no Linux e passou. O `--check`
não chama `deployNetlify`: o teste adversarial do gate confirma que o deploy permanece inalterado e
que `--confirm` não é necessário para a validação.

---

## 5. Situação do workflow

`.github/workflows/ci.yml` foi revisado:

- jobs raiz usam `npm ci`;
- job `b1-artifact-linux` instala dependências B1 com `npm ci --no-audit --no-fund`;
- o job instala o navegador de consentimento, executa build, testes TAP, consentimento e
  `deploy:b1 -- --check`;
- o job B1 falha se houver `# SKIP`;
- não existe `--confirm`, `netlify deploy` ou publicação automática no workflow;
- nenhuma credencial Netlify/Neon foi adicionada;
- o job `teste-producao` continua sendo somente leitura sobre o site de produção, não publicação.

O encoding do workflow (BOM/mojibake herdado) foi normalizado para UTF-8 sem BOM; não houve mudança
funcional nesta fase. O YAML foi analisado localmente com parser e os quatro jobs foram reconhecidos.

A execução local ocorreu no Node.js `v24.13.0`; o CI usa Node.js 22. A compatibilidade do CLI no
Node.js 22 do CI ainda não foi executada e permanece pendente.

O CI remoto **não foi executado**. Para uma futura execução autorizada, os arquivos hoje não
versionados precisam estar no mesmo commit, especialmente `validation-b1/package.json`,
`validation-b1/package-lock.json`, `scripts/check-b1-isolation.mjs` e os scripts de build
modificados. Sem isso, o job B1 não terá lockfile/script para executar.

Procedimento futuro, somente após autorização explícita:

1. revisar e commitar os arquivos locais da fase;
2. fazer push da branch ou abrir PR;
3. executar o workflow `Auditoria do Site` por `workflow_dispatch` ou aguardar o evento autorizado;
4. observar o job `b1-artifact-linux`;
5. não promover deploy nem executar `--confirm`.

Não houve commit, push, PR, disparo de workflow ou acesso ao GitHub Actions.

---

## 6. TOCTOU — declaração objetiva

### Risco residual

Entre a validação final do pacote congelado e a abertura dos arquivos pelo Netlify CLI existe uma
janela em que outro processo com o mesmo usuário pode alterar, substituir ou recriar arquivos e
diretórios. `chmod` não é imutabilidade absoluta.

### Possível consequência

O CLI pode publicar um conteúdo diferente do contrato validado, incluindo HTML, Functions ou Edge
Functions não revisados. O impacto fica restrito ao preview B1 se o gate for o único caminho, mas
ainda pode gerar um preview incorreto ou expor conteúdo não autorizado.

### Mitigações existentes

- pacote criado em `mkdtemp` exclusivo;
- contrato independente com SHA-256 e lista fechada de arquivos;
- validação antes e depois do congelamento;
- `chmod` recursivo em arquivos e diretórios;
- deploy do mesmo `dir` que passou pela validação final;
- gate sem ação padrão e com `--check`/`--confirm` obrigatórios;
- CLI local fixado em `27.20.0`;
- workflow sem publicação automática.

### Limitações das mitigações

- outro processo do mesmo usuário pode restaurar permissões;
- o CLI relê os arquivos depois da última validação;
- não há lock de filesystem, assinatura criptográfica do pacote ou isolamento de usuário;
- `netlify deploy` externo continua possível e não passa pelo gate;
- a mitigação não prova que o upload remoto corresponde ao hash local;
- a aceitação do risco não foi dada e não deve ser inferida deste relatório.

**Aceitação do risco TOCTOU: pendente de decisão explícita posterior.**

---

## 7. Arquivos modificados

- `docs/analytics/fase-5f-27-validacao-local-netlify-cli-b1.md` — novo relatório.
- `.github/workflows/ci.yml` — normalização de encoding/BOM, sem mudança funcional nesta fase.

A instalação criou `validation-b1/node_modules` (ignorado pelo Git), mas não alterou
`validation-b1/package.json`, o lockfile ou dependências. Nenhum arquivo de produção foi alterado.

---

## 8. Confirmação de ausência de operações remotas

- Nenhuma operação autenticada, consulta de conta, deploy ou alteração na Netlify/Neon.
- Nenhum `netlify deploy`, login, link ou `deploy:b1 -- --confirm`.
- Nenhum Run now, cron ou cleanup.
- Nenhum SQL remoto, role, grant ou migration.
- Nenhuma flag ou variável remota alterada.
- Nenhum crédito Netlify consumido.
- Nenhum commit, push, PR ou execução de CI remoto.
- Nenhuma alteração em produção.

A instalação usou o registro npm, expressamente permitido. Não houve login, consulta de conta,
publicação ou chamada deliberada à API da Netlify.

---

## 9. Classificação final

**2 — Aprovado com pendências.**

A instalação real e a execução local do CLI fixado foram comprovadas. Permanecem pendentes a
execução autorizada do CI remoto em Node.js 22, a inclusão dos arquivos não versionados no commit
futuro e a aceitação explícita do risco TOCTOU antes de qualquer publicação.

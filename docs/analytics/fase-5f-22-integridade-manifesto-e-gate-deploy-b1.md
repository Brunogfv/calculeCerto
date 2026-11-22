# Fase 5F.22 — Integridade do manifesto e bloqueio de publicação B1 sem validação

Status: **correções locais implementadas e testadas; nenhuma operação remota executada**.
Data/hora: **2026-11-18T18:42:00-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O manifesto adulterado agora é rejeitado e existe um
comando oficial de publicação que valida o pacote antes de chamar o deploy. Ainda não é possível
bloquear tecnicamente um comando externo `netlify deploy --dir`; a limitação está documentada.

---

## 1. Resumo executivo

A auditoria 5F.21 encontrou duas falhas:

1. `validarPacote` não validava `package-manifest.json`; um manifesto com hash adulterado era aceito.
2. O diretório `dist` podia ser publicado diretamente, fora do fluxo de pacote/validação.

Correções implementadas:

- contrato autorizado independente em `validation-b1/artifact-contract.json`, com lista fechada e
  hashes SHA-256 dos arquivos do B1;
- validação de schema/versão do contrato e do manifesto;
- comparação entre contrato, manifesto e bytes reais;
- rejeição de arquivos ausentes/extras, hashes divergentes, conteúdo alterado com mesmo tamanho,
  caminhos absolutos/traversal, symlinks e chaves duplicadas;
- `package-manifest.json` deixou de ter `package_root` e é gerado após a criação do pacote;
- comando oficial `npm run deploy:b1` com `--check` (somente validação) ou `--confirm` (publicação);
- publicação feita a partir do pacote temporário isolado, com validação imediatamente antes do
  comando de deploy;
- testes adversariais e de regressão ampliados.

Resultado: o manifesto adulterado foi rejeitado; 30/31 testes B1 passaram, com 1 skip de symlink por
limitação do Windows; analytics 135/135; SSL local 5/5; `deploy:b1 --check` validou 7 estáticos,
9 arquivos de Function, 7 de Edge e 0 redirects.

Nenhum deploy, publicação, Run now, limpeza, SQL remoto ou alteração remota foi executado.

---

## 2. Causa raiz do manifesto adulterado aceito

### 2.1 Código anterior

`validarPacote` validava:

- nomes de arquivos contra allowlists;
- conteúdo proibido;
- hash do `_headers` contra a origem;
- configuração do `netlify.toml`.

Mas não lia `package-manifest.json`. O manifesto era gerado **depois** da validação, com hashes
calculados pelo próprio empacotador. Nenhuma comparação independente era feita.

Consequências:

- alterar um hash do manifesto não era detectado;
- remover o manifesto não era detectado pelo validador;
- um manifesto regenerado com conteúdo adulterado poderia descrever o próprio conteúdo;
- o manifesto funcionava como evidência, não como autorização independente.

### 2.2 Correção

- A autorização passou para `artifact-contract.json`, versionado e separado do pacote.
- O manifesto não pode se autorizar: ele precisa corresponder ao contrato e aos bytes reais.
- O contrato contém os hashes autorizados; o packager não o escreve.
- O manifesto é lido, tem schema/version validados e é comparado ao contrato e ao artefato.
- A comparação usa SHA-256 dos bytes reais, não tamanho/nome.

O teste deliberado agora retorna **`stale_manifest_rejected=true`**.

---

## 3. Correções implementadas

### 3.1 Contrato independente

Novo `validation-b1/artifact-contract.json`:

- `version: 1`;
- 7 estáticos com hashes;
- 9 arquivos de Function com hashes;
- 7 arquivos de Edge com hashes;
- `config_sha256`;
- `redirects: 0`.

O contrato é a fonte de autorização. Ele não é copiado para o pacote nem reescrito por
`package-deploy.mjs`.

### 3.2 Validação do manifesto

`validarPacote` agora:

1. exige `package-manifest.json`;
2. detecta chaves JSON duplicadas;
3. exige exatamente `version`, `static`, `functions`, `edge_functions`, `config_sha256`;
4. exige `version=1`;
5. exige caminhos relativos, sem `..`, sem `C:`, sem `\`;
6. rejeita symlinks na árvore;
7. compara as listas do contrato, do manifesto e do diretório real;
8. recalcula SHA-256 dos bytes reais;
9. compara hashes do manifesto ao contrato e ao real;
10. compara o hash do `netlify.toml`;
11. rejeita `_redirects` e `collect`;
12. valida headers contra o contrato.

### 3.3 Manifesto final

`criarPacote` agora:

- copia o conteúdo;
- gera o manifesto **sem** `package_root`;
- grava `package-manifest.json`;
- chama `validarPacote` depois da gravação;
- retorna o pacote apenas se a validação passar.

O `package-manifest.json` contém:

- `version`;
- `static` com SHA-256;
- `functions` com SHA-256;
- `edge_functions` com SHA-256;
- `config_sha256`.

### 3.4 Comando oficial

`validation-b1/scripts/deploy-b1.mjs`:

- exige `--check` ou `--confirm`;
- executa `sync-shared` e `build`;
- cria pacote temporário;
- valida pacote/manifesto/hashes;
- em `--check`, encerra sem rede;
- em `--confirm`, executa `npx netlify-cli deploy` a partir do pacote isolado, com `--no-build`;
- nunca usa `--prod`;
- remove o pacote temporário no `finally`.

Adicionado ao `package.json` como `deploy:b1`.

---

## 4. Fonte independente de autorização

`validation-b1/artifact-contract.json` é a fonte independente. Ele não é gerado automaticamente pelo
empacotador. Qualquer mudança de conteúdo aprovado exige atualização deliberada desse arquivo e nova
revisão. O manifesto gerado não pode alterar o contrato.

Limitação de confiança: o contrato é um arquivo local versionável, não assinado digitalmente. Um
operador com acesso de escrita ao workspace pode alterar contrato e pacote juntos. Para defesa contra
esse cenário seria necessário assinatura externa/CI confiável, fora do escopo local.

---

## 5. Verificação de hashes

- Hashes calculados com `SHA-256` sobre os bytes reais (`fs.readFileSync`).
- Nome e tamanho não são usados como prova de conteúdo.
- Arquivo alterado com mesmo tamanho falha pela diferença de hash.
- Manifesto regenerado com hash do conteúdo malicioso falha contra o contrato.
- Manifesto desatualizado falha porque seus hashes não coincidem com os bytes reais.
- `_headers` continua comparado ao contrato e ao conteúdo real.
- `netlify.toml` é comparado ao contrato e ao manifesto.

---

## 6. Proteção contra caminhos alternativos de deploy

### Coberto pelo fluxo oficial

- `npm run deploy:b1 -- --confirm` exige `--confirm`;
- executa build, pacote, validação independente e deploy a partir do pacote;
- o comando de deploy recebe `--no-build` e não usa `--prod`;
- falha em qualquer etapa impede o deploy;
- `deploy:b1` sem argumentos sai com status 2 antes de qualquer rede;
- `--check` valida sem publicar.

### Limitação inevitável

Não é possível impedir tecnicamente que um operador execute diretamente:

```text
netlify deploy --dir validation-b1/dist ...
```

ou qualquer comando externo equivalente. O workspace não controla o processo externo. A mitigação é:

- usar exclusivamente `npm run deploy:b1 -- --confirm`;
- proibir `netlify deploy` direto no procedimento operacional;
- validar a lista de arquivos/functions do deploy após qualquer publicação;
- não reutilizar `dist` diretamente.

O build agora valida as fontes contra o contrato, mas um `dist` antigo ou editado fora do build ainda
pode ser enviado por comando externo. Essa é uma limitação residual documentada, não uma garantia
técnica.

---

## 7. Inventário dos comandos oficiais

| Comando | Efeito |
|---|---|
| `npm run test:all` | sync, build, testes B1 e navegador |
| `npm run package:deploy` | sync, build e pacote validado |
| `npm run deploy:b1 -- --check` | build, pacote, validação; sem rede |
| `npm run deploy:b1 -- --confirm` | valida e publica preview B1 pelo pacote |
| `npm run deploy:b1` | bloqueado, status 2 |
| `netlify deploy` direto | **não oficial; não usar** |

O comando `--confirm` não foi executado nesta fase.

---

## 8. Testes adversariais e resultados

| Cenário | Resultado |
|---|---|
| Manifesto adulterado (`hash` errado) | rejeitado |
| Hash incorreto no contrato/manifesto | rejeitado |
| Arquivo extra | rejeitado |
| Arquivo ausente | rejeitado |
| Arquivo modificado mantendo tamanho | rejeitado |
| Chave duplicada no manifesto | rejeitado |
| Caminho absoluto | rejeitado |
| Path traversal `../` | rejeitado |
| Symlink fora do diretório | teste presente; **skip no Windows** por falta de permissão de symlink |
| Manifesto desatualizado | rejeitado |
| Manifesto regenerado com conteúdo não autorizado | rejeitado |
| Artifact antigo/arquivo ausente | rejeitado |
| `dist` direto sem validação | não é tecnicamente bloqueável; fluxo oficial documentado |
| Tentar publicar sem `--confirm` | status 2; bloqueado |
| Publicação após falha | o comando lança erro antes do deploy |

O skip de symlink é uma limitação de privilégio do Windows no ambiente de teste, não uma aprovação
silenciosa. O código rejeita symlinks quando o sistema permite criá-los.

---

## 9. Testes de regressão

| Suíte | Resultado |
|---|---|
| Analytics + integração PostgreSQL 17 | **135/135 pass** |
| B1 (sync + build + shared/b1/artifact) | **30 pass, 1 skip**; 31 testes |
| Consentimento no navegador | **2/2 pass** |
| Pacote | 7 estáticos, 9 arquivos de Function, 7 de Edge, 0 redirects |
| `deploy:b1 --check` | passou; não publicou |
| SSL local | **5/5 pass** |
| Build canônico | preservado; analytics passou |

O skip é o symlink, documentado acima. Nenhum teste foi desativado para obter aprovação.

---

## 10. Riscos residuais

- `netlify deploy` direto ainda pode contornar o comando oficial.
- O contrato local não é assinado; um operador com escrita pode alterá-lo.
- O deploy remoto anterior `6afd...` permanece como preview divergente não publicado.
- O SSL real continua sem validação remota.
- O symlink não pôde ser exercitado neste Windows; a lógica de rejeição está implementada.
- O `package-manifest.json` ainda pode ser removido após a validação antes de um comando externo;
  o fluxo oficial recria e valida o pacote imediatamente antes do deploy.

---

## 11. Critérios para futura autorização de deploy

- Contrato revisado e versionado.
- `npm run deploy:b1 -- --check` aprovado.
- Manifesto e hashes revalidados.
- Deploy feito **somente** por `npm run deploy:b1 -- --confirm`.
- Lista de arquivos/functions do deploy igual ao contrato.
- `collect` ausente e redirects 0.
- Base remota do B1 confirmada.
- SSL validado separadamente antes de qualquer limpeza.
- Nova autorização explícita para o preview e outra para Run now.

---

## 12. Classificação final

**2 — Aprovado com pendências.**

O manifesto adulterado agora é rejeitado e o fluxo oficial bloqueia publicação sem validação. O
workflow local está coberto por testes adversariais e regressão. Permanecem a limitação de comando
externo `netlify deploy` direto, o skip de symlink no Windows e a validação remota/SSL ainda não
executada.

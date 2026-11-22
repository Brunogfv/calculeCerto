# Fase 5F.23 — Auditoria independente do gate de publicação B1

Status: **auditoria local concluída; nenhuma publicação ou operação remota executada**.
Data/hora: **2026-11-18T19:20:00-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O contrato independente, a comparação de hashes e o
gate local funcionam para os cenários testados. Permanecem lacunas de autenticidade, de congelamento
do pacote entre validação e publicação, de teste com mock da função de publicação e de CI Linux
específico para o gate B1.

---

## 1. Escopo e arquivos examinados

Auditados:

- `validation-b1/artifact-contract.json`
- `validation-b1/scripts/artifact.mjs`
- `validation-b1/scripts/package-deploy.mjs`
- `validation-b1/scripts/build.mjs`
- `validation-b1/scripts/deploy-b1.mjs`
- `validation-b1/package.json`
- `validation-b1/tests/artifact.spec.mjs`
- `validation-b1/shared-manifest.json`
- `validation-b1/netlify.toml`
- `.github/workflows/ci.yml`
- `scripts/ssl-diagnostic.mjs`
- `tests/analytics/ssl-diagnostic.spec.mjs`
- relatórios 5F.20, 5F.21 e 5F.22

Não houve acesso a Netlify ou Neon, não houve deploy, `Run now`, limpeza, SQL remoto, alteração de
flags, variáveis, roles, grants ou migrations.

O único ambiente adicional foi um container local Linux `node:22-alpine`, usado somente para
executar o teste de symlink que é ignorado no Windows. Nenhum serviço remoto da aplicação foi
chamado.

---

## 2. Auditoria do contrato

### 2.1 Fatos comprovados

- `artifact-contract.json` tem `version: 1`.
- O contrato contém listas e hashes SHA-256 de:
  - 7 estáticos;
  - 9 arquivos de Function;
  - 7 arquivos de Edge;
  - `config_sha256`;
  - `redirects: 0`.
- `carregarContrato` exige exatamente as chaves conhecidas e falha em campos ausentes/desconhecidos.
- `carregarManifesto` exige exatamente `version`, `static`, `functions`, `edge_functions` e
  `config_sha256`; `package_root` não é mais aceito no manifesto.
- O packager não escreve `artifact-contract.json`.
- `validarPacote` compara:
  - contrato × arquivos reais;
  - manifesto × arquivos reais;
  - contrato × manifesto;
  - hash do `netlify.toml`.
- Os hashes são calculados sobre os bytes reais, com SHA-256.
- Caminhos absolutos, traversal, nomes inválidos e symlinks são rejeitados.
- Chaves JSON duplicadas são detectadas antes do `JSON.parse`.
- Um manifesto regenerado com o hash do conteúdo adulterado falha porque o contrato continua sendo
  a fonte de autorização.

### 2.2 Integridade × autenticidade

O contrato está no mesmo repositório e não é assinado. Ele protege contra erros, artefatos antigos e
alterações do manifesto, mas não contra um operador com escrita que altere contrato, código e pacote
em conjunto. Para um modelo de ameaça mais rigoroso seria necessária uma raiz de confiança externa
(assinatura/CI protegido), que não foi criada nesta fase.

**Conclusão:** a integridade local é comprovada; a autenticidade externa não é.

---

## 3. Auditoria do fluxo de publicação

### 3.1 Caminho oficial

`npm run deploy:b1` executa:

1. exigência de `--check` ou `--confirm`;
2. `sync-shared.mjs`;
3. `build.mjs`;
4. `criarPacote` em diretório temporário;
5. `validarPacote` após a gravação do manifesto;
6. em `--check`, encerra sem rede;
7. em `--confirm`, chama `npx netlify-cli deploy` com `--dir <pacote>/dist`, `--site` constante,
   `--no-build`, sem `--prod`;
8. remove o pacote temporário no `finally`.

### 3.2 Pontos corretos

- Build e empacotamento ocorrem antes da publicação.
- A validação independente ocorre antes de `spawnSync` do deploy.
- O diretório passado ao CLI é o `dist` do pacote validado.
- O comando sem `--confirm` retorna status 2.
- `--check` não chamou rede nem publicou.
- O site alvo é constante no script (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
- Não há `--prod`, promoção ou publicação de produção.
- Uma falha em `sync`, `build`, `criarPacote` ou `validarPacote` lança erro antes do `spawnSync`.

### 3.3 Lacunas comprovadas

1. **Sem congelamento entre validação e publicação:** o pacote é um diretório temporário gravável.
   Outro processo poderia alterá-lo depois de `validarPacote` e antes/durante o deploy. Não há
   snapshot imutável, hash recalculado imediatamente antes do upload ou lock de filesystem.
2. **Sem teste com mock da chamada de publicação:** o teste existente comprova ausência de
   `--confirm`; não injeta falha em build/validação e comprova que o deploy mock não foi chamado.
   A leitura estática indica que o `spawnSync` está depois das validações, mas não há teste
   comportamental com injeção de dependências.
3. **Argumentos desconhecidos não são rejeitados:** `--confirm --dir outro` continua usando o pacote
   interno; isso não contorna o gate, mas argumentos ignorados podem confundir o operador.
4. **`npx --yes netlify-cli` não tem versão fixa:** o comando pode resolver uma versão diferente em
   cada execução; é um risco de supply chain/reprodutibilidade.
5. **`netlify deploy` externo continua possível:** o gate não consegue impedir um comando executado
   fora do script oficial; a limitação já era documentada na 5F.22.

---

## 4. Testes adversariais

Executados localmente:

| Cenário | Resultado |
|---|---|
| Manifesto adulterado/hash incorreto | rejeitado |
| Contrato/versão incompatível | rejeitado pela validação de schema |
| Arquivo extra | rejeitado |
| Arquivo ausente | rejeitado |
| Arquivo alterado com mesmo tamanho | rejeitado por SHA-256 |
| Chave duplicada no manifesto | rejeitada |
| Caminho absoluto | rejeitado |
| Path traversal | rejeitado |
| Manifesto regenerado com conteúdo não autorizado | rejeitado |
| Artefato antigo/ausente | rejeitado |
| Publicação sem `--confirm` | status 2; bloqueado |
| `deploy:b1 --check` | validou sem rede/publicação |
| Diretório de publicação diferente | o script usa o `dist` do pacote; argumento externo não é encaminhado |
| Artefato alterado após validação | **não comprovado/testado**; risco residual |
| Mock de falha impedindo deploy | **não implementado** |
| Publicação após falha de etapa | não testada com mock; fluxo estático interrompe antes do `spawnSync` |

O Linux test foi executado em container local:

```text
node:22-alpine
node --test --test-concurrency=1 tests/artifact.spec.mjs
12/12 pass
```

O teste de symlink para arquivo passou em Linux. Um symlink para diretório não foi adicionado; a
rejeição de `Dirent.isSymbolicLink()` cobre links de arquivo/diretório quando o sistema permite
criá-los, mas o caso diretório não foi exercitado.

---

## 5. Regressão

| Suíte | Resultado |
|---|---|
| Analytics + integração PostgreSQL 17 | **135/135 pass** |
| B1 (sync + build + shared/b1/artifact) no Windows | **30 pass, 1 skip**; 31 testes |
| B1 artifact no Linux | **12/12 pass** |
| Consentimento no navegador | **2/2 pass** |
| Pacote | 7 estáticos, 9 arquivos de Function, 7 de Edge, 0 redirects |
| `deploy:b1 --check` | passou; não publicou |
| SSL local | **5/5 pass** |
| Build canônico | preservado; analytics passou |

O skip no Windows é o symlink; o teste Linux foi executado separadamente e passou. Não foi
considerado aprovado por omissão.

---

## 6. CI e symlink em Linux

O workflow existente `.github/workflows/ci.yml`:

- executa `npm test` no projeto raiz;
- executa testes de analytics com PostgreSQL;
- **não executa** `validation-b1/tests/artifact.spec.mjs`, `validation-b1/npm test` nem o gate
  `deploy:b1 -- --check`.

Portanto, o symlink Linux foi comprovado apenas pela execução local em Docker; não há cobertura
automatizada no CI atual. Proposta mínima: adicionar um job Linux que rode
`cd validation-b1 && npm test` (ou apenas o artifact spec) e `npm run deploy:b1 -- --check`, sem
credenciais. Não foi adicionado nesta fase.

---

## 7. Riscos residuais

- O pacote pode ser alterado entre `validarPacote` e o `spawnSync` do deploy.
- Não há teste com mock que prove que o deploy não é chamado após uma falha de validação.
- O contrato local não é uma raiz de confiança externa; é apenas uma autorização versionada.
- `npx --yes netlify-cli` não está fixado por versão.
- Um operador pode executar `netlify deploy` diretamente, fora do gate.
- O CI não executa os testes B1/gate.
- O symlink de diretório não foi exercitado separadamente.
- O deploy remoto e o SSL continuam não validados nesta fase.

---

## 8. Evidências de ausência de operação remota

- Nenhuma requisição a Netlify ou Neon.
- Nenhum `netlify deploy` real.
- Nenhum `Run now`.
- Nenhuma limpeza, SQL remoto, migration ou alteração de role/grant.
- Nenhuma alteração de flags/variáveis.
- Nenhum uso de créditos Netlify.
- O `deploy:b1 --check` executou somente build, pacote e validação local.

---

## 9. Classificação final

**2 — Aprovado com pendências.**

O contrato independente, a verificação de hashes e o gate local estão funcionando nos cenários
testados; o manifesto adulterado é rejeitado e `--check` não publica. Ainda faltam: congelamento
imutável entre validação e publicação, teste com mock da função de deploy em falhas, versão fixa do
CLI e cobertura B1 no CI Linux. A autenticidade externa do contrato continua fora do escopo.

---

## 10. Próxima ação recomendada

1. Adicionar um job Linux ao CI para `validation-b1/npm test` e `deploy:b1 -- --check`.
2. Refatorar/injetar a função de deploy para testar que falhas de build/validação nunca chamam o
   deploy, com mock, sem rede.
3. Tornar o pacote imutável durante a publicação ou recalcular/validar o hash imediatamente antes do
   upload e após a conclusão.
4. Fixar a versão do Netlify CLI usada pelo gate.
5. Manter `netlify deploy` externo proibido no procedimento operacional.
6. Somente depois autorizar um preview e, separadamente, a validação SSL/Run now.

Nenhuma dessas ações foi executada.

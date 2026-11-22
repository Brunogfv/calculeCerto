# Fase 5F.24 — Endurecimento final do gate de publicação B1

Status: **correções locais implementadas e testadas; nenhuma publicação ou operação remota executada**.
Data/hora: **2026-11-18T20:35:00-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O pacote é validado, congelado com a melhor proteção
local possível e o deploy só é chamado após a verificação final. Permanecem a limitação de
imutabilidade local contra o mesmo usuário, a ausência de autenticidade externa e a impossibilidade
de impedir um comando `netlify deploy` externo.

---

## 1. Pendências da Fase 5F.23 e situação

| Pendência 5F.23 | Situação em 5F.24 |
|---|---|
| Congelamento entre validação e publicação | Parcialmente resolvido: chmod recursivo, validação final e uso do mesmo diretório; race local residual |
| Teste com mock da publicação | Resolvido: testes comprovam que deploy não é chamado em falhas |
| Netlify CLI flutuante | Resolvido no código/config: versão exata 27.20.0 e binário local verificado |
| CI Linux B1 | Job Linux adicionado ao workflow; não executado remotamente |
| `netlify deploy` externo | Limitação documentada; bloqueio universal não é possível |
| Autenticidade do contrato | Continua local/não assinada; fora do escopo |
| Symlink Linux | Testado em container local Linux; 20/20 testes passaram |
| Argumentos inesperados | Rejeitados pelo gate |
| Pacote alterado entre validação e deploy | Teste com mutação antes da validação final detecta e bloqueia |

---

## 2. Estratégia de congelamento do artefato

O gate agora executa:

1. `sync-shared.mjs`;
2. `build.mjs`;
3. `criarPacote` em diretório temporário exclusivo;
4. primeira validação independente do contrato/manifesto/hashes;
5. congelamento recursivo com remoção de permissão de escrita;
6. segunda validação do mesmo diretório congelado;
7. chamada de `deploy` somente em `--confirm`;
8. liberação de permissões e remoção do diretório no `finally`.

O diretório passado ao deploy é exatamente o `dist` do pacote que passou pela segunda validação.

### Limitação

`chmod` não é uma barreira absoluta contra o mesmo usuário: ele pode restaurar permissões. O gate
reduz a janela de alteração e detecta mudanças antes da publicação, mas não impede corrida entre a
última validação e o upload. Essa limitação é residual e não foi obscurecida.

---

## 3. Evidências de integridade antes da publicação

- Contrato versionado e separado do manifesto.
- Hashes SHA-256 calculados sobre bytes reais.
- Manifesto final sem `package_root`.
- `validarPacote` compara contrato, manifesto e diretório real.
- A validação final ocorre depois do congelamento e imediatamente antes do deploy.
- O teste de mutação após a primeira validação é detectado pela validação final.
- O deploy recebe o mesmo `dir` que passou pela validação final; teste com mock compara os dois.

---

## 4. Testes com mock do deploy

Foram adicionados `validation-b1/tests/gate.spec.mjs`:

| Cenário | Resultado |
|---|---|
| Falha de build | deploy não chamado |
| Falha de empacotamento | deploy não chamado |
| Falha na validação inicial | deploy não chamado |
| Falha na verificação final | deploy não chamado |
| Sem `--confirm` | bloqueado, status 2 |
| Argumento desconhecido | bloqueado |
| `--check` | não chama deploy |
| Deploy com sucesso | recebe exatamente o diretório validado |
| Alteração do pacote após a primeira validação | detectada; deploy não chamado |

Os testes usam funções injetadas/mocks e não fazem rede.

---

## 5. Versão fixada do Netlify CLI

- Versão fixada: **`27.20.0`**.
- Adicionada em `validation-b1/package.json` como devDependency exata.
- O gate resolve o binário local `validation-b1/node_modules/.bin/netlify`.
- O gate lê `node_modules/netlify-cli/package.json` e falha se a versão não for exatamente
  `27.20.0`.
- Não há uso de `npx netlify-cli` flutuante no fluxo oficial.
- O pacote não foi instalado nesta fase; a execução de deploy real continua pendente de
  `npm install`/CI.

---

## 6. CI Linux

Foi adicionado ao `.github/workflows/ci.yml` o job `b1-artifact-linux`:

- Node.js 22;
- `npm install` em `validation-b1`;
- Playwright Chromium para consentimento;
- build B1;
- testes B1, contrato, adversariais e gate com TAP;
- falha se aparecer `# SKIP`;
- consentimento no navegador;
- `npm run deploy:b1 -- --check`, sem publicação.

O job não contém `--confirm`, não usa credenciais e não publica. Ele não foi executado remotamente
nesta fase; foi validado localmente em Linux via container `node:22-alpine` (20/20 testes de
artifact/gate).

---

## 7. Limitações do bloqueio de deploy externo

O gate não consegue impedir universalmente um operador com credenciais de executar:

```text
netlify deploy --dir validation-b1/dist ...
```

ou outro comando fora do repositório. A política operacional deve ser:

- publicar exclusivamente com `npm run deploy:b1 -- --confirm`;
- proibir `netlify deploy` direto;
- exigir autorização específica para qualquer publicação;
- manter o CI sem deploy automático;
- verificar a lista de files/functions do deploy depois de qualquer publicação autorizada.

Não foram removidas credenciais nem alteradas permissões/configurações remotas.

---

## 8. Testes e resultados

| Suíte | Resultado |
|---|---|
| Analytics + integração PostgreSQL 17 | **135/135 pass** |
| B1 Windows (shared + b1 + artifact + gate) | **38 pass, 1 skip**, 39 testes |
| B1 artifact/gate Linux (container local) | **20/20 pass** |
| Consentimento no navegador | **2/2 pass** |
| SSL local | **5/5 pass** |
| `deploy:b1 -- --check` | passou; não publicou |
| `deploy:b1` sem confirmação | status 2 |
| Contrato/versão incompatível | rejeitado |
| Manifesto adulterado | rejeitado |
| Pacote alterado após validação | detectado |
| Falha de build/empacotamento/validação | deploy mock não chamado |

O skip do Windows é o symlink; o Linux executou o mesmo teste e passou. O skip não foi contado como
aprovação.

---

## 9. Arquivos alterados

Novos:

- `validation-b1/tests/gate.spec.mjs`.

Modificados:

- `validation-b1/scripts/deploy-b1.mjs` — congelamento, validação final, injeção para mock,
  argumentos estritos e CLI local fixada.
- `validation-b1/package.json` — `netlify-cli@27.20.0` e gate test.
- `.github/workflows/ci.yml` — job Linux B1 sem publicação.

Não alterados:

- código canônico de produção;
- migrations;
- roles, grants e banco;
- variáveis/flags remotas;
- deploys existentes.

Arquivos locais de build (`dist`, `.netlify`, `shared-manifest.json`) foram regenerados pelos testes.

---

## 10. Riscos residuais

- Alteração por outro processo com o mesmo usuário entre a validação final e o upload.
- Contrato local sem assinatura externa; não é raiz de confiança contra operador malicioso.
- CLI Netlify fixado no package.json, mas ainda não instalado/validado neste ambiente.
- `netlify deploy` externo continua possível.
- CI Linux foi escrito, mas ainda não executado no GitHub.
- Symlink de diretório não foi separado do teste de arquivo; o teste Linux de symlink passou.
- O deploy real e o SSL continuam fora desta fase.

---

## 11. Classificação final

**2 — Aprovado com pendências.**

O gate agora falha fechado em build, empacotamento, validação, mutação e falta de confirmação; o
deploy mock não é chamado nesses casos. O pacote é congelado e revalidado antes do uso. A
imutabilidade absoluta contra o mesmo usuário, a autenticidade externa do contrato, a execução do
CI e o bloqueio de um comando externo continuam pendentes.

---

## 12. Próxima ação recomendada

1. Executar o novo job Linux no CI e confirmar ausência de skips.
2. Instalar a versão fixada do Netlify CLI e validar `deploy:b1 -- --check` no ambiente real do CI.
3. Adicionar um teste de symlink para diretório em Linux.
4. Revisar o contrato com assinatura/CI protegido se o modelo de ameaça incluir operador local
   malicioso.
5. Manter `netlify deploy` externo proibido e exigir autorização específica para o preview e para
   Run now.

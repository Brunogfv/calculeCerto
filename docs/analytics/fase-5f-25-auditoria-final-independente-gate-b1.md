# Fase 5F.25 — Auditoria final independente do gate B1

Status: **auditoria independente concluída; nenhum deploy ou operação remota executado**.
Data/hora: **2026-11-19T14:10:00-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O gate falha fechado e os mocks comprovam os
controles principais. Foram encontradas duas pendências que impedem autorizar o próximo deploy:
o build canônico ainda modifica arquivos em `validation-b1/public`, e o `package-lock.json` do B1
não registra o `netlify-cli@27.20.0`.

---

## 1. Escopo auditado

Arquivos e evidências examinados:

- `validation-b1/scripts/deploy-b1.mjs`
- `validation-b1/scripts/artifact.mjs`
- `validation-b1/scripts/package-deploy.mjs`
- `validation-b1/package.json`
- `validation-b1/package-lock.json`
- `validation-b1/tests/gate.spec.mjs`
- `validation-b1/tests/artifact.spec.mjs`
- `validation-b1/artifact-contract.json`
- `validation-b1/netlify.toml`
- `.github/workflows/ci.yml`
- `scripts/apply-analytics.js`
- `scripts/apply-accessibility.js`
- relatórios 5F.22, 5F.23 e 5F.24

Não houve acesso a Netlify, Neon, GitHub Actions remoto ou banco. Nenhum deploy, `--confirm`,
Run now, limpeza, SQL remoto, alteração de flags/roles/grants ou crédito foi usado.

---

## 2. Congelamento e TOCTOU

### Implementação atual

`executarGate`:

1. executa sync e build;
2. cria um pacote novo em `mkdtemp` exclusivo;
3. valida o pacote contra o contrato;
4. aplica `chmod` recursivo (arquivos 0444, diretórios 0555, raiz 0555);
5. valida novamente o mesmo diretório;
6. chama `deploy` apenas em `--confirm`;
7. restaura permissões e remove o diretório no `finally`.

O caminho entregue ao deploy é o mesmo diretório que passou pela segunda validação. O teste de
diretório usa mock e confirma essa igualdade.

### O que o `chmod` protege

- reduz escrita acidental durante o fluxo;
- impede escrita por processos que respeitem as permissões;
- detecta conteúdo alterado antes da validação final;
- não elimina a janela entre a validação final e a abertura dos arquivos pelo CLI.

### Limitações comprovadas

- **TOCTOU permanece:** um processo com o mesmo usuário pode restaurar permissões, substituir
  arquivos/diretórios ou trocar o caminho entre a última validação e o upload.
- **Substituição de diretório:** o gate valida o caminho, mas não mantém um handle/lock imutável do
  diretório até o fim do upload.
- **Pacote reutilizado:** o gate não reutiliza pacotes, cria um `mkdtemp` novo; isso reduz risco de
  artefato antigo, mas não prova que o processo externo de deploy não leia um caminho antigo.
- **Windows/Linux:** `chmod` é a melhor proteção local razoável, mas não é imutabilidade absoluta.
- **Symlink:** a validação rejeita symlinks no pacote; o congelamento também falha em symlink.
- **Hard links/substituição atômica:** não há proteção específica contra hard links ou troca de
  arquivo por outro inode com o mesmo conteúdo/hash aprovado; a validação detecta conteúdo, não
  proveniência.

O risco residual é aceitável apenas com controle operacional (janela exclusiva, sem outros processos
do mesmo usuário, CI sem concorrência) ou com atestação externa/assinatura.

---

## 3. Auditoria dos mocks

Foram auditados os oito testes de `gate.spec.mjs`:

| Cenário | Evidência | Resultado |
|---|---|---|
| Build falha | `build` mock lança; deploy mock vazio | deploy não chamado |
| Empacotamento falha | `criar` mock lança | deploy não chamado |
| Validação inicial falha | `validar` mock lança | deploy não chamado |
| Verificação final falha | segunda chamada de `validar` lança | deploy não chamado |
| Sem `--confirm` | `parseAction([])` lança | bloqueado |
| Argumento desconhecido | `parseAction(['--confirm','--dir','outro'])` lança | bloqueado |
| `--check` | `executarGate({action:'check'})` | deploy mock vazio |
| Diretório publicado | `validar` e `deploy` registram o mesmo `dir` | iguais |
| Mutação após primeira validação | `congelar` altera `robots.txt`; validação final real detecta | deploy não chamado |

Os mocks interceptam a função `deploy` injetada em `executarGate`; o caminho de produção usa
`deployNetlify` como default. Não foi encontrado caminho alternativo que chame o CLI dentro do gate.

Limitação: os testes não chamam o CLI real (proibido), portanto não provam a compatibilidade de
args/binário; provam o controle de fluxo do gate.

---

## 4. Netlify CLI

| Item | Situação |
|---|---|
| `package.json` | `netlify-cli: 27.20.0` exato |
| `package-lock.json` | **não contém `node_modules/netlify-cli`** |
| Comando oficial | usa binário local `node_modules/.bin/netlify` |
| Verificação de versão | lê `node_modules/netlify-cli/package.json` e exige 27.20.0 |
| CLI global | não é usada pelo fluxo oficial |
| Argumentos | `--dir` é sempre o `dist` do pacote; args extras do usuário são rejeitados |
| Sintaxe/versão | não executada nem instalada nesta fase; compatibilidade não comprovada |

O lockfile está desatualizado. `npm install` no CI pode atualizar o lock e instalar a versão, mas
`npm ci` falharia ou não é usado. Isso reduz a reprodutibilidade e impede afirmar que o CI usa
exatamente o lock pretendido.

---

## 5. CI Linux

O job `b1-artifact-linux` foi adicionado em `.github/workflows/ci.yml`:

- Node.js 22;
- `npm install` em `validation-b1`;
- Playwright Chromium;
- build B1;
- testes shared/b1/artifact/gate com TAP;
- falha se houver `# SKIP`;
- consentimento;
- `deploy:b1 -- --check` sem publicação.

Achados:

- **YAML:** inspeção estática mostra o job integrado ao workflow principal; não foi executado no
  GitHub nesta fase.
- **Determinismo:** usa `npm install`, não `npm ci`; não há entrada de `netlify-cli` no lockfile.
- **Skip:** o passo falha diante de `# SKIP`; o teste Linux local passou sem skip.
- **Sem publicação:** nenhum `--confirm`, nenhuma credencial Netlify, nenhum deploy automático.
- **Build canônico:** o job B1 não executa o build raiz; o job principal existente executa `npm test`
  no raiz, mas seus efeitos sobre B1 são um problema separado (abaixo).

Não foi validado por GitHub Actions remoto.

---

## 6. Isolamento do build canônico — achado novo

Durante a auditoria, a execução de `npm run build` no projeto raiz modificou:

- `validation-b1/public/index.html`;
- `validation-b1/public/validacao-encerrada.html`.

Os scripts raiz `scripts/apply-analytics.js` e `scripts/apply-accessibility.js` percorrem a árvore
raiz e não excluem `validation-b1/public`. Consequências observadas:

- analytics e skip links foram inseridos no HTML B1;
- o contrato B1 deixou de coincidir com as fontes;
- `npm run deploy:b1 -- --check` falhou corretamente com
  `Conteudo de origem divergente do contrato: index.html`.

Os dois arquivos foram restaurados byte a byte a partir de `validation-b1/dist`, que correspondia
aos hashes do contrato:

- `index.html`: `d5c59888a9cd679c08ae3d961be7595bdd0adc18c0917a949945a3b37352f63c`;
- `validacao-encerrada.html`: `1f6d5884b1a2f4a74f0dfad6ccf82a72a7db949883fbd23a873e524f0ddf964f`.

Após a restauração, `npm run deploy:b1 -- --check` voltou a passar.

**Achado:** o build canônico não está isolado de `validation-b1/public`. O gate falha fechado, mas
qualquer desenvolvedor que rode o build raiz antes do B1 contamina o artefato fonte e precisa
restaurar os arquivos. O CI B1 em job separado provavelmente parte de checkout limpo, mas a
reprodutibilidade local e a separação de escopos estão comprometidas.

Isso é uma pendência alta, não uma aprovação.

---

## 7. Testes e resultados

| Suíte | Resultado |
|---|---|
| Analytics + integração PostgreSQL 17 | **135/135 pass** |
| B1 Windows (shared + b1 + artifact + gate) | **38 pass, 1 skip**, 39 testes |
| B1 artifact/gate Linux (container local) | **20/20 pass**, symlink de arquivo aprovado |
| Consentimento no navegador | **2/2 pass** |
| SSL local | **5/5 pass** |
| `deploy:b1 -- --check` | passou sem rede/publicação, após restaurar B1 |
| `deploy:b1` sem confirmação | status 2 |
| Build canônico | executou; modificou B1; restaurado ao contrato |
| Build B1 isolado | passou após restauração |
| Contrato/manifesto/hashes | testes aprovados |
| Mutações e falhas do gate | testes com mock aprovados |

O skip é apenas o symlink no Windows; o Linux cobriu o symlink. Nenhum teste foi ignorado como
aprovação.

---

## 8. Riscos residuais

- TOCTOU entre a validação final e a leitura do pacote pelo CLI.
- `chmod` não é imutabilidade absoluta no mesmo usuário.
- `package-lock.json` sem `netlify-cli`; CI não determinístico.
- CLI 27.20.0 não instalado/validado localmente.
- Build canônico modifica `validation-b1/public`; contaminação de escopo comprovada.
- `netlify deploy` externo continua possível.
- CI Linux não executado no GitHub.
- Contrato local sem assinatura externa.
- Symlink de diretório não foi testado separadamente.

---

## 9. Pendências que impedem publicação

1. Excluir `validation-b1` do walker dos scripts canônicos ou isolar o build B1 do raiz.
2. Atualizar `validation-b1/package-lock.json` para conter `netlify-cli@27.20.0` e usar `npm ci`.
3. Instalar e validar o CLI fixado em ambiente controlado; testar `--check` e compatibilidade de
   argumentos.
4. Executar o job Linux no CI e confirmar zero skips.
5. Definir controle operacional para a janela TOCTOU (execução exclusiva, sem processos concorrentes)
   ou atestação externa.

---

## 10. Recomendação sobre o próximo deploy

**Não autorizar ainda um único deploy B1.**

O gate bloqueia corretamente os cenários testados e falhou fechado após o build canônico contaminar
o B1. Porém, a contaminação do build canônico e o lockfile sem o CLI fixado precisam ser corrigidos
antes de uma publicação. Após essas correções, uma autorização específica para um único preview e
uma autorização separada para Run now devem ser emitidas.

---

## 11. Classificação final

**2 — Aprovado com pendências.**

O congelamento local é a melhor proteção proporcional disponível e o gate tem bons testes de falha,
mas a imutabilidade absoluta/TOCTOU não é garantida, o build canônico contamina o B1, o lockfile não
registra o CLI e o CI ainda não foi executado. A publicação não deve ser autorizada nesta condição.

---

## 12. Próxima ação recomendada

1. Corrigir os walkers canônicos para ignorar `validation-b1` ou separar o build B1.
2. Atualizar o lockfile com `netlify-cli@27.20.0` e trocar CI para `npm ci`.
3. Executar CI Linux, incluindo symlink e gate.
4. Repetir a auditoria independente após as correções.
5. Só então avaliar autorização de um preview e, separadamente, Run now/SSL.

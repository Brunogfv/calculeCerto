# Fase 5F.19 — Investigação dos bloqueios do deploy B1 e da conexão SSL

Status: **investigação local e somente de leitura concluída; nenhuma nova operação remota**.
Data: **2026-11-18**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** As evidências locais explicam o artefato divergente
e delimitam o problema de SSL, mas a causa exata da resolução de base do deploy e o TLS efetivamente
negociado ainda exigem comprovação controlada.

---

## 1. Resumo executivo

A Fase 5F.18 criou o deploy preview `6afd151972b2d3618033a7dd`. O deploy está `ready`, em
`deploy-preview`, não publicado. Ele publicou **três Functions** (`capture-html`,
`cleanup-html-capture` e `collect`), **252 redirect rules** e **16 header rules**. O artefato B1
local, porém, contém apenas os seis arquivos estáticos do B1, duas Functions e uma Edge Function.

A investigação local mostra que o diretório estático enviado era o B1, mas a configuração,
as Functions e os redirects/headers herdaram o **projeto raiz**. A causa exata da resolução de base
não é demonstrável somente com os artefatos locais; a hipótese principal é que o CLI resolveu o
projeto raiz como base para configuração/functions/redirects, enquanto `--dir` apontava para
`validation-b1/dist`. Não foi a sincronização canônico/B1, que está correta em 16/16 hashes.

No SSL, a conexão de verificação com a role `validation_b1_cleanup` identificou o banco
`validation_b1` e a role correta no host direto, mas `pg_stat_ssl.ssl` retornou `false`. Isso não
prova ausência de TLS: em Neon o TLS pode terminar no proxy e o backend pode reportar `false`.
Também não foi possível ler o valor secreto de `CLEANUP_DATABASE_URL` para confirmar `sslmode`,
host e certificado. A evidência de transporte continua incompleta.

O `Run now` não foi executado na 5F.18; a flag foi restaurada e os dados permaneceram intactos.

---

## 2. Evidências da Fase 5F.18

| Item | Evidência |
|---|---|
| Deploy | `6afd151972b2d3618033a7dd` |
| Contexto/estado | `deploy-preview` / `ready` |
| Publicado | não (`published_at=null`) |
| Site | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Functions publicadas | `capture-html`, `cleanup-html-capture`, **`collect`** |
| Edge Function | `html-capture` |
| Schedule | `cleanup-html-capture`, `15 3 * * *` |
| Redirects | **252** |
| Headers | **16** |
| Run now | não executado |
| Limpeza | não executada |
| Flag final | `HTML_CAPTURE_CLEANUP_ENABLED=false` |
| Dados | contagens inalteradas |
| SSL | `pg_stat_ssl=false` na conexão de verificação |
| Role | `validation_b1_cleanup` |
| Banco | `validation_b1` |
| Host | direto da branch, sem `-pooler` |

O deploy anterior conhecido era `6afb78132cdffef6e6a05696`; o novo deploy foi a única operação de
deploy da fase anterior e não foi publicado.

---

## 3. Investigação do artefato

### 3.1 Artefato B1 local esperado

O build B1 produz:

- `b1-consent.js`;
- `b1.css`;
- `build-manifest.json`;
- `index.html`;
- `robots.txt`;
- `validacao-encerrada.html`;
- `_headers`.

Total: **6 arquivos publicados + build-manifest**, conforme o build registrado.

A configuração local `validation-b1/netlify.toml` define:

- publish: `dir`/`dist` do B1;
- functions: `validation-b1/netlify/functions`;
- edge functions: `validation-b1/netlify/edge-functions`;
- build command: `node scripts/build.mjs`.

O `.netlify/netlify.toml` gerado localmente no B1 também aponta functions, edge e publish para
`validation-b1`.

### 3.2 Componentes locais do B1

`validation-b1/dist` contém exatamente os seis arquivos acima e o manifest. Não contém `collect`,
`_redirects` nem `_headers` do projeto raiz.

`validation-b1/.netlify/functions` contém somente:

- `capture-html.zip`;
- `cleanup-html-capture.zip`.

A Edge local é `html-capture`. Não há `collect` no B1.

### 3.3 O que o deploy publicou

O deploy `6afd...` publicou:

- `capture-html`;
- `cleanup-html-capture`;
- `collect`;
- 252 redirect rules;
- 16 header rules.

O resumo do deploy ainda informou “All files already uploaded by a previous deploy with the same
commits”. A API confirmou que o deploy é preview e não publicado.

### 3.4 Artefatos do projeto raiz que explicam o conteúdo extra

O projeto raiz contém:

- `netlify/functions/collect.mjs`;
- `_redirects` com 252 regras (o arquivo raiz é a origem evidente das 252 redirects);
- `_headers` com regras de segurança/cache do site canônico;
- `netlify/functions/capture-html.mjs` e `cleanup-html-capture.mjs`;
- configuração global diferente da configuração B1.

O B1 não contém `_redirects`; portanto, as 252 redirects não podem ter vindo do `validation-b1/dist`
local. As headers publicadas também coincidem com o conjunto do projeto raiz. O `collect` existe
somente na árvore `netlify/functions` raiz.

### 3.5 Conclusão do artefato

A evidência local é consistente com:

- estáticos enviados de `validation-b1/dist` (os arquivos B1 apareceram);
- configuração, Functions, redirects e headers resolvidos a partir do **projeto raiz**.

Não foi a cópia B1: os 16 arquivos compartilhados estão idênticos ao canônico. Não foi o build B1:
o `dist` local não contém `collect` nem `_redirects`. Não foi uma alteração de código; nenhum
arquivo foi alterado na fase anterior.

A causa exata da seleção do projeto raiz é uma **hipótese de resolução de base/CLI**, não um fato
comprovado apenas pelos artefatos locais. O site pode ter base configurada remotamente como raiz, ou
o CLI pode ter descoberto o `netlify.toml`/Git root ao executar o deploy. A leitura remota foi
proibida nesta fase, portanto não se pode distinguir entre essas hipóteses sem uma verificação
específica futura.

---

## 4. Causa raiz ou hipóteses da divergência

### Hipótese principal — base do projeto resolvida como raiz

O CLI recebeu `--dir dist` com cwd em `validation-b1`, mas pode ter usado o projeto raiz para
configuração, functions, headers e redirects. Isso explica exatamente a combinação observada:

- estáticos B1;
- Functions raiz + B1 (o raiz tem as mesmas duas Functions mais `collect`);
- `_redirects` raiz;
- `_headers` raiz;
- nenhuma cópia B1 divergente.

**Estado:** hipótese forte, não comprovada sem inspecionar a configuração de build remota ou o log
detalhado do CLI.

### Hipótese secundária — configuração remota do site B1 com base raiz

O Site ID B1 pode ter `base`/publish/functions apontando para a raiz, enquanto o deploy local
enviou o `--dir` B1. Nesse cenário, o comportamento é coerente, mas a causa é configuração de site.

**Estado:** não comprovada nesta fase; consulta remota proibida.

### Hipótese descartada — sincronização B1

Os 16 arquivos compartilhados estão com hashes idênticos e o build B1 não inclui `collect` nem
`_redirects`. A sincronização não explica a divergência.

### Hipótese descartada — build B1 gerando extras

O build B1 apaga `dist`, copia `public` e gera somente os seis arquivos + manifest. Não há
`collect`, redirects raiz ou headers raiz no diretório B1.

### Hipótese descartada — alteração de código na 5F.18

Não houve alteração de código, testes, configurações ou migrations. O deploy reutilizou o artefato
local existente.

---

## 5. Contrato do artefato mínimo B1

### 5.1 Permitido

**Páginas e recursos estáticos:**

- `/index.html`;
- `/validacao-encerrada.html`;
- `/robots.txt`;
- `/_headers` do B1;
- `/b1-consent.js`;
- `/b1.css`;
- `/build-manifest.json`.

**Functions:**

- `capture-html`;
- `cleanup-html-capture`.

**Edge Functions:**

- `html-capture`.

**Redirects:**

- nenhum redirect do projeto raiz;
- qualquer redirect B1 só pode existir se aprovado e documentado; o B1 atual não possui
  `_redirects`.

**Headers:**

- somente o `_headers` do B1;
- o conteúdo deve ser idêntico ao `validation-b1/public/_headers`, não ao `_headers` raiz.

**Configuração:**

- `validation-b1/netlify.toml` e/ou configuração de site que aponte base/functions/edge/publish
  explicitamente para `validation-b1`;
- nenhuma herança de base/functions/redirects do projeto raiz.

### 5.2 Proibido no pacote B1

- `collect` e o endpoint `/api/collect`;
- `_redirects` raiz e suas 252 regras;
- `_headers` raiz;
- Functions do projeto raiz fora de `capture-html` e `cleanup-html-capture`;
- `netlify.toml` raiz ou configuração gerada a partir dele;
- conteúdo de `dist/` canônico;
- assets, páginas ou builds do site principal;
- secrets/arquivos `.env`;
- qualquer artefato que não conste do manifesto B1.

### 5.3 Detecção de herança indevida

Após um deploy preview, verificar:

1. lista de arquivos do deploy: exatamente os sete caminhos estáticos permitidos;
2. `available_functions`: exatamente `capture-html` e `cleanup-html-capture`;
3. `function_schedules`: somente `cleanup-html-capture`;
4. Edge: `html-capture`;
5. summary de redirects: **0** redirect rules;
6. summary de headers: apenas as regras esperadas do `_headers` B1;
7. hash do `_headers` publicado igual ao B1;
8. ausência de `collect` e `_redirects` na lista publicada;
9. hash dos arquivos estáticos igual ao `validation-b1/dist`.

Nenhum deploy deve ser executado apenas para “ver se saiu certo”; a verificação deve ser feita
depois de um deploy explicitamente autorizado.

### 5.4 Como impedir herança

- Configurar o alvo B1 com base/publish/functions/edge explícitos em `validation-b1`.
- Não executar o deploy a partir de um contexto que permita ao CLI descobrir o projeto raiz.
- Usar um diretório de projeto B1 isolado, sem `netlify.toml`, `_redirects` ou `_headers` do raiz.
- Alternativa: deploy por API com manifesto explícito dos arquivos permitidos.
- Validar o artefato e o manifesto antes e depois do deploy.
- Não reutilizar caches de Functions/redirects do projeto raiz.

A correção exata depende de confirmar se a base remota ou o CLI está escolhendo a raiz.

---

## 6. Investigação da conexão SSL

### 6.1 Código atual

A rotina usa:

- `CLEANUP_DATABASE_URL` exclusivamente;
- `new Pool({ connectionString, max: 1 })` via `createPool`;
- nenhuma opção `ssl` explícita;
- nenhuma validação local de `sslmode`, `verify-full`, host ou CA;
- role e banco validados por consultas depois da conexão.

A URL secreta não é lida pelo agente. Portanto, não se sabe se o valor real contém
`sslmode=require`, `verify-full`, `disable` ou nenhum parâmetro.

### 6.2 Comportamento do driver instalado

O `pg-connection-string` instalado tem comportamento de transição:

- `sslmode=disable` desativa SSL;
- `sslmode=prefer/require/verify-ca/verify-full` são tratados com aviso;
- no comportamento atual, `prefer`, `require` e `verify-ca` são equivalentes a `verify-full`
  (salvo `uselibpqcompat=true`);
- `no-verify` desativa a validação de certificado;
- `sslmode=verify-full` é o modo explícito recomendado.

Isso significa que `sslmode=require` **não deve ser interpretado isoladamente** como prova de
validação de certificado, especialmente se a URL usar `uselibpqcompat`, `no-verify` ou um cliente
diferente.

### 6.3 Evidência obtida na verificação

A conexão de verificação:

- identificou `current_database()=validation_b1`;
- identificou `current_user=validation_b1_cleanup`;
- usou host direto, sem `-pooler`;
- retornou `pg_stat_ssl.ssl=false`.

A conexão adicional com `sslmode=require`/configuração explícita também retornou `ssl=false`. Isso
pode ocorrer porque, em Neon, o TLS é terminado no proxy e a visão `pg_stat_ssl` do backend não
reflete o transporte cliente→proxy. Portanto, **`pg_stat_ssl=false` não é, sozinho, prova de que o
cliente não usou TLS**.

### 6.4 Cinco dimensões separadas

1. **SSL exigido pelo cliente:** não comprovado; o código não exige e a URL secreta não foi lida.
2. **TLS efetivamente negociado:** não comprovado pelo `pg_stat_ssl`; precisa de inspeção
   cliente/`tls` ou evidência do provedor.
3. **Certificado validado:** não comprovado; depende de `sslmode`/CA/rejectUnauthorized.
4. **Host e banco:** `validation_b1` e host direto confirmados na conexão de verificação; o valor
   da URL de produção do Netlify não foi lido.
5. **Role:** `validation_b1_cleanup` confirmada; `validation_b1_runtime` não usada.

---

## 7. Evidências necessárias para comprovar SSL

Em uma fase futura, com autorização específica e sem imprimir segredos:

1. Ler `CLEANUP_DATABASE_URL` apenas em processo transitório e verificar, sem exibir:
   - host direto, sem `-pooler`;
   - database `validation_b1`;
   - role `validation_b1_cleanup`;
   - `sslmode=verify-full` ou configuração `ssl` equivalente.
2. Abrir uma conexão TLS controlada ao host/porta com CA confiável e `rejectUnauthorized:true`.
3. Registrar, sem dados sensíveis:
   - `authorized`;
   - `authorizationError`;
   - protocolo TLS;
   - SAN/host verificado;
   - emissor e validade do certificado;
   - fingerprint do certificado.
4. Na mesma conexão TLS, executar somente leitura:
   - `current_database()`;
   - `current_user`;
   - confirmação de role/atributos.
5. Repetir com uma configuração sem validação para demonstrar que a validação é efetiva, sem expor
   credenciais.
6. Testar que um host/role/banco divergente falha antes de qualquer DELETE.
7. Registrar que `pg_stat_ssl` pode ser `false` atrás do proxy Neon e não substitui a inspeção
   cliente-side.

O `sslmode=verify-full` deve ser o alvo explícito. `sslmode=require` sozinho não deve ser aceito
como prova de certificado validado; o comportamento do driver atual e o proxy precisam ser
considerados.

---

## 8. Plano de correção

### Bloqueio A — artefato B1 divergente

- **Causa raiz:** hipótese de base/configuração do projeto raiz; não comprovada sem leitura remota.
- **Arquivos envolvidos:** `validation-b1/netlify.toml`, `.netlify/netlify.toml`, raiz
  `netlify.toml`, raiz `_redirects`, raiz `_headers`, `netlify/functions/collect.mjs`.
- **Correção mínima:** garantir que o deploy use explicitamente a base B1 e um manifesto fechado:
  - configuração/base do site B1 apontando para `validation-b1`;
  - ou deploy por API com lista explícita de arquivos;
  - ou projeto isolado que não herde raiz.
- **Testes locais:** build B1; 6 arquivos + manifest; lista de functions 2; edge 1; zero redirects;
  hash do `_headers` B1; ausência de `collect`/`_redirects`.
- **Evidência necessária:** deploy preview com lista de arquivos/functions igual ao contrato.
- **Risco:** publicar root redirects/collect novamente; cache de Functions; rotas inesperadas.
- **Dependência remota:** base/build settings ou mecanismo de deploy autorizado.

### Bloqueio B — SSL não comprovado

- **Causa raiz:** não comprovada; URL secreta não lida + `pg_stat_ssl` não confiável no proxy.
- **Arquivos envolvidos:** `netlify/functions/_lib/db.mjs`, `cleanup-html-capture.mjs`,
  `scripts/cleanup-retention.mjs`, configuração de `CLEANUP_DATABASE_URL`.
- **Correção mínima proposta:** aceitar apenas URL direta com `sslmode=verify-full`; validar
  host/banco/role; configurar `ssl` explicitamente; falhar antes de conectar se SSL não estiver
  exigido; manter `DATABASE_URL` separado.
- **Testes locais:** parse de URL com `ssl=disable/require/verify-full`; `verify-full` aceito;
  `disable` rejeitado; CA/hostname; role/banco divergentes; nenhuma conexão em configuração
  inválida.
- **Evidência necessária:** inspeção TLS cliente-side + query identity; `sslmode=verify-full`
  comprovado; sem impressão de segredo.
- **Risco:** bloquear conexão válida se o CA/hostname estiver incorreto; quebrar runtime legado;
  não usar `sslmode=require` como garantia.
- **Dependência remota:** rotação/ajuste de `CLEANUP_DATABASE_URL` (somente após autorização).

---

## 9. Plano de retomada

1. Confirmar e documentar a causa da base do deploy (config local/remota ou CLI).
2. Corrigir localmente o mecanismo de deploy, sem novo deploy automático.
3. Rodar testes locais e gerar um manifesto B1 fechado.
4. Verificar que `collect`, `_redirects` raiz e `_headers` raiz não entram no pacote.
5. Implementar validação SSL local (URL, host, role, CA e `verify-full`).
6. Executar auditoria independente do artefato e do SSL.
7. Autorizar um único deploy preview somente depois de 1–6.
8. Autorizar `Run now` somente depois do deploy preview validado e do SSL comprovado.

A autorização da Fase 5F.18 **não** autoriza novo deploy nem Run now. Nenhum desses passos foi
executado nesta fase.

---

## 10. Riscos e ações que exigem nova autorização

Riscos:

- repetir a publicação de `collect`/redirects raiz no B1;
- confundir `sslmode=require` com certificado validado;
- assumir `pg_stat_ssl=false` como ausência de TLS;
- executar limpeza sem artefato B1 correto;
- ler ou expor `CLEANUP_DATABASE_URL`.

Exigem autorização:

- alterar base, variáveis, flags ou deploy;
- fazer novo deploy preview ou publicado;
- executar Run now ou limpeza;
- executar SQL remoto;
- alterar código/testes/configurações;
- criar/alterar recursos;
- rodar auditoria TLS/Neon.

---

## 11. Classificação final

**2 — Aprovado com pendências.**

A investigação local delimitou os dois bloqueios: o pacote B1 recebeu componentes do projeto raiz,
e o SSL não foi comprovado; `pg_stat_ssl=false` não é evidência conclusiva. A causa exata da base e
o TLS real ainda exigem verificação controlada, correção local e nova autorização.

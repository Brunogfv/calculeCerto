# Fase 5F.21 — Auditoria independente do artefato B1 e preparação da validação SSL

Status: **auditoria local concluída; nenhuma operação remota executada**.
Data/hora: **2026-11-18T17:56:25-03:00**.
Branch: `feat/portal-analytics`.
Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O pacote B1 está isolado e contém exatamente o
contrato de arquivos/Functions/headers, sem `collect` ou `_redirects`. Há duas lacunas de garantia:
o manifesto do pacote não é revalidado contra o conteúdo, e o build isolado ainda pode ser
contornado por um deploy direto de `dist`. A validação SSL também continua apenas preparada.

---

## 1. Resumo executivo

- O B1 local contém 2 Function entrypoints e 1 Edge Function entrypoint.
- O pacote contém **9 arquivos de Function** (2 entrypoints + 7 bibliotecas) e **7 arquivos de Edge**
  (1 entrypoint + 6 bibliotecas). Portanto, “9 Functions” e “7 Edge Functions” no relatório anterior
  são contagens de arquivos, não de funções executáveis.
- O pacote final contém 7 estáticos, 0 redirects e não contém `collect`.
- O `netlify.toml` do pacote é explícito, sem base e sem caminho absoluto.
- O `_headers` do pacote coincide com o `_headers` do B1.
- O build B1 e os testes de contrato passam.
- Foi encontrada uma lacuna: `validarPacote` **não valida** o `package-manifest.json`; um manifesto
  adulterado ou desatualizado é aceito. O teste local confirmou `stale_manifest_accepted=true`.
- O build B1 + `package:deploy` valida o pacote, mas um deploy direto de `dist` sem o pacote pode
  contornar parte da validação. O `build.mjs` não exige que o diretório final `dist` seja exatamente
  o allowlist estático; a checagem completa ocorre no pacote.
- O código atual de cleanup não exige TLS explicitamente; depende da URL secreta e do parser do
  driver. `CLEANUP_DATABASE_URL` pode conectar sem TLS se não tiver `sslmode` adequado.
- Foi criado `scripts/ssl-diagnostic.mjs`, que exige `sslmode=verify-full`, conexão direta sem
  pooler, banco/role esperados, TLS validado e hostname/CA. Seus testes locais passaram (5/5).
- Nenhuma conexão SSL remota foi executada nesta fase.
- Nenhum deploy, publicação, Run now, limpeza, SQL remoto ou alteração remota foi realizada.

---

## 2. Referências examinadas

- `docs/analytics/fase-5f-20-correcao-isolamento-artefato-b1.md`
- `docs/analytics/fase-5f-19-investigacao-bloqueios-b1-ssl.md`
- `docs/analytics/fase-5f-18-validacao-manual-cleanup-b1.md`
- `docs/analytics/fase-5f-17-preparacao-controlada-validacao-final-b1.md`
- `validation-b1/scripts/artifact.mjs`
- `validation-b1/scripts/package-deploy.mjs`
- `validation-b1/scripts/build.mjs`
- `validation-b1/scripts/sync-shared.mjs`
- `validation-b1/scripts/shared-files.mjs`
- `validation-b1/package.json`
- `validation-b1/tests/artifact.spec.mjs`
- `validation-b1/tests/b1.spec.mjs`
- `validation-b1/shared-manifest.json`
- `netlify/functions/` e `netlify/edge-functions/`
- `netlify.toml`, `validation-b1/netlify.toml`
- `scripts/cleanup-retention.mjs`
- `netlify/functions/_lib/db.mjs`
- `netlify/functions/_lib/cleanup-retention.mjs`
- `tests/analytics/`
- `package.json` e `node_modules/pg*`

---

## 3. Auditoria do isolamento

### 3.1 Diretório de publicação

O pacote é criado em diretório temporário fora do repositório:

```text
<pacote>/
  netlify.toml
  dist/
  netlify/functions/
  netlify/edge-functions/
  package-manifest.json
```

`dist` contém somente os sete caminhos estáticos permitidos. O `netlify.toml` é gerado pela própria
ferramenta, não herdado do raiz.

### 3.2 Configuração explícita

O `netlify.toml` do pacote contém:

```toml
[build]
  publish = "dist"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "22"

[functions]
  directory = "netlify/functions"
```

O validador rejeita `base`, caminho absoluto e configuração sem esses campos.

### 3.3 Sincronização e empacotamento

- `sync-shared.mjs` copia apenas os 16 arquivos do manifesto compartilhado.
- `artifact.mjs` exige exatamente os 16 arquivos de Function/Edge permitidos.
- `criarPacote` copia `dist`, Functions e Edge para um diretório novo e valida o resultado.
- `package-manifest.json` é gerado após a validação e inclui hashes dos arquivos do pacote.
- O pacote não inclui `_redirects`, `collect`, root `_headers`, root `netlify.toml` nem `dist` raiz.

### 3.4 Dependência do projeto raiz

A correção remove a dependência operacional do raiz ao empacotar em diretório temporário isolado.
Ainda não foi provado qual mecanismo remoto fazia o deploy da 5F.18 usar a base raiz; a correção
evita esse caminho, mas a causa remota exata continua pendente.

### 3.5 Lacunas de garantia encontradas

1. **Manifesto não revalidado:** `validarPacote` verifica arquivos e headers, mas não lê
   `package-manifest.json` nem recalcula seus hashes. Um manifesto alterado/desatualizado passa.
2. **Build direto:** `build.mjs` valida fontes e conteúdo, mas não exige que `dist` tenha exatamente
   o allowlist. A validação completa está no pacote. Um deploy direto de `dist` pode pular a
   verificação final.
3. **Public extra:** `validarFontesB1` rejeita `_redirects` em `public`, mas não rejeita qualquer
   outro arquivo estático extra em `public`; o `fs.cpSync` copiaria esse extra para `dist`. O
   pacote rejeitaria, mas o build isolado não.

Nenhuma dessas lacunas foi corrigida nesta fase, conforme a restrição de auditoria.

---

## 4. Inventário dos 9 arquivos de Function

| # | Caminho | Finalidade | Dependências | Env | Banco/rede | Justificativa e risco |
|---:|---|---|---|---|---|---|
| 1 | `netlify/functions/capture-html.mjs` | Entrypoint HTTP `/api/capture-html` | `capture-handler`, `db` | `DATABASE_URL` via shared pool | DB | Captura Edge → persistência; risco restrito ao B1 e flags |
| 2 | `netlify/functions/cleanup-html-capture.mjs` | Scheduled Function; cron e Run now | `cleanup-html-capture`, `db` | `HTML_CAPTURE_CLEANUP_ENABLED`, `CLEANUP_DATABASE_URL`, `CLEANUP_EXPECTED_*`, `RETENTION_*` | DB cleanup | Necessária à validação; risco de DELETE se flag ativa |
| 3 | `netlify/functions/_lib/capture-config.mjs` | Config de captura | nenhuma | `EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`, `EDGE_INGEST_SECRET`, `EDGE_INGEST_KEY_ID`, limites | nenhum | Biblioteca do entrypoint; sem acesso próprio |
| 4 | `netlify/functions/_lib/capture-handler.mjs` | Handler de captura e escrita | `db`, `http`, `capture-validation` | config de captura | DB | Necessária; escreve somente tabelas de captura |
| 5 | `netlify/functions/_lib/capture-validation.mjs` | Validação do payload | nenhuma | nenhuma | nenhum | Necessária; parser puro |
| 6 | `netlify/functions/_lib/cleanup-html-capture.mjs` | Delegador da retenção | `cleanup-retention` | via opções | DB via pool recebido | Necessária; não abre conexão sozinho |
| 7 | `netlify/functions/_lib/cleanup-retention.mjs` | Rotina de retenção | `pg` via client do pool | `RETENTION_*`, `CLEANUP_EXPECTED_*` | DB SELECT/DELETE | Necessária; alto risco se executada indevidamente |
| 8 | `netlify/functions/_lib/db.mjs` | Pool PostgreSQL | `pg` | URL de conexão injetada | DB | Necessária; sem validação TLS própria |
| 9 | `netlify/functions/_lib/http.mjs` | Utilitários HTTP | nenhuma | nenhuma | nenhum | Necessária; não abre conexão externa |

**Entrypoints executáveis:** 2 (`capture-html`, `cleanup-html-capture`). Os outros 7 são bibliotecas.
Nenhum arquivo `collect.mjs` está no B1.

---

## 5. Inventário dos 7 arquivos de Edge

| # | Caminho | Finalidade | Dependências | Env | Banco/rede | Justificativa e risco |
|---:|---|---|---|---|---|---|
| 1 | `netlify/edge-functions/html-capture.js` | Entrypoint Edge `/*` | `edge-capture`, `edge-env` | allowlist Edge | fetch interno para Function | Necessária; captura apenas com flags e consentimento |
| 2 | `netlify/edge-functions/_lib/edge-capture.mjs` | Cria evento, assina, envia | `capture-policy`, `signature`, `classifier`, `limits`, `edge-env` | `EDGE_INGEST_*`, `EDGE_ANALYTICS_*` | fetch interno `/api/capture-html` | Necessária; sem acesso direto a DB |
| 3 | `netlify/edge-functions/_lib/edge-env.mjs` | Allowlist de env Edge | nenhuma | `EDGE_*` | nenhum | Necessária; reduz exposição de env |
| 4 | `netlify/edge-functions/_lib/capture-policy.mjs` | Consentimento/escopo | nenhuma | `EDGE_*` flags | nenhum | Necessária; política pura |
| 5 | `netlify/edge-functions/_lib/capture-signature.mjs` | Mensagem HMAC canônica | nenhuma | nenhuma | nenhum | Necessária; criptografia local |
| 6 | `netlify/edge-functions/_lib/capture-limits.mjs` | Limite de corpo | nenhuma | nenhuma | nenhum | Necessária; constante local |
| 7 | `netlify/edge-functions/_lib/classifier.mjs` | Classificação de tráfego | nenhuma | nenhuma | nenhum | Necessária; heurística pura |

**Entrypoints executáveis de Edge:** 1 (`html-capture`). Os outros 6 são bibliotecas. Nenhuma edge
acessa banco diretamente; o envio é para o endpoint interno da Function.

---

## 6. Auditoria do manifesto e do pacote

O pacote gerado localmente contém:

| Item | Quantidade |
|---|---:|
| Arquivos estáticos | 7 |
| Arquivos de Function | 9 |
| Arquivos de Edge | 7 |
| Redirects | 0 |
| `collect` | ausente |
| Config hash | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| `_headers` hash | `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |

O `package-manifest.json` registra os hashes, mas a auditoria confirmou que ele não é validado por
`validarPacote`. O teste deliberado com `index.html` marcado como hash inválido foi aceito:

```text
stale_manifest_accepted=true
```

Isso não alterou o pacote em si, mas significa que a evidência do manifesto não é autoverificável.

---

## 7. Resultado dos testes

| Suíte | Resultado |
|---|---|
| Analytics + integração PostgreSQL 17 | **135/135 pass** |
| B1 (sync + build + shared/b1/artifact) | **23/23 pass** |
| Consentimento no navegador | **2/2 pass** |
| Pacote B1 | 7 estáticos, 9 arquivos de Function, 7 de Edge, 0 redirects |
| Teste de falha com `collect` | passou |
| Teste de falha com `_redirects` | passou |
| Manifesto adulterado | **aceito** — lacuna encontrada |
| SSL diagnostic (unitário local) | **5/5 pass** |

O build B1 e o build canônico não foram alterados por esta auditoria. O teste SSL não abriu conexão
remota.

---

## 8. Auditoria da conexão PostgreSQL

- Driver: `pg` **8.23.1**; parser `pg-connection-string` **2.14.1**.
- `db.mjs` usa `Pool({ connectionString, max, timeouts })` sem `ssl` explícito.
- `cleanup-html-capture.mjs` usa `CLEANUP_DATABASE_URL`; `scripts/cleanup-retention.mjs` também.
- Nenhum fallback para `DATABASE_URL` no cleanup.
- A URL secreta não foi lida; não se sabe se contém `sslmode`, CA ou opções conflitantes.
- Se a URL não tiver `sslmode`, o driver pode conectar sem TLS; não há fail-fast.
- `sslmode=require` não é prova de validação de certificado; o comportamento depende do parser e de
  `uselibpqcompat`.
- O `pg-connection-string` 2.14.1 trata `prefer/require/verify-ca` como equivalentes a
  `verify-full` no comportamento atual, com aviso, salvo compatibilidade libpq. Ainda assim, o valor
  real da URL não é conhecido.
- `pg_stat_ssl=false` pode ocorrer atrás do proxy Neon e não prova ausência de TLS.
- Não há teste automatizado atual que valide `sslmode`, CA, hostname ou role de conexão.

**Limitação principal:** a configuração efetiva de `CLEANUP_DATABASE_URL` não é legível pela API e
não foi consultada. A conexão real permanece não comprovada.

---

## 9. Procedimento de validação SSL preparado

Foi criado `scripts/ssl-diagnostic.mjs`, sem credenciais embutidas:

- lê exclusivamente `CLEANUP_DATABASE_URL`;
- rejeita ausência de URL, `sslmode` diferente de `verify-full`, `uselibpqcompat`, `ssl=0`,
  host pooler, banco/role fora de `validation_b1`/`validation_b1_cleanup`;
- permite `CLEANUP_EXPECTED_DATABASE`, `CLEANUP_EXPECTED_ROLE` e `CLEANUP_EXPECTED_HOST` para
  verificação adicional;
- abre TLS com `rejectUnauthorized:true` e `servername`, validando a cadeia e o hostname;
- registra `authorized`, `authorizationError`, protocolo TLS, validade e fingerprint do certificado;
- conecta com `pg` usando `ssl.rejectUnauthorized=true` e consulta somente
  `current_database()`/`current_user`;
- encerra a conexão;
- nunca imprime a URL, senha ou token.

O teste unitário criado em `tests/analytics/ssl-diagnostic.spec.mjs` cobre 5 cenários de parsing e
rejeição, sem conexão remota.

Para executar no futuro, em janela autorizada:

```text
CLEANUP_DATABASE_URL=<lido de fonte segura> \
CLEANUP_EXPECTED_DATABASE=validation_b1 \
CLEANUP_EXPECTED_ROLE=validation_b1_cleanup \
node scripts/ssl-diagnostic.mjs
```

A saída deve comprovar `database=validation_b1`, `role=validation_b1_cleanup`, `tls.authorized=true`,
host/port esperados e certificado válido. Falha de TLS, CA, hostname, banco ou role deve abortar.

Ainda não foi executado contra Neon.

---

## 10. Limitações técnicas

- A causa remota exata da herança de base do deploy continua desconhecida.
- O pacote evita o caminho de deploy que herdava o raiz, mas a configuração remota do site B1 ainda
  precisa ser validada.
- O `package-manifest.json` não é revalidado.
- Um deploy direto de `dist` pode ignorar o pacote.
- O SSL real depende do valor secreto de `CLEANUP_DATABASE_URL`.
- O script SSL não foi executado remotamente; a negociação real e o certificado permanecem
  pendentes.
- `pg_stat_ssl` pode ser inconclusivo atrás do proxy Neon.

---

## 11. Pendências e riscos

### Pendências

1. Validar o manifesto do pacote contra o conteúdo (hash/tamanho/listas).
2. Fazer `build.mjs` validar o `dist` final ou exigir o pacote no deploy.
3. Confirmar a base remota do site B1 e o mecanismo de deploy.
4. Executar o diagnóstico SSL somente de leitura em janela autorizada.
5. Revalidar o deploy preview com o pacote isolado.
6. Manter cleanup desativado, sem `collect`, sem cron e sem produção.

### Riscos

- **Alto:** deploy direto de `dist` sem pacote pode reintroduzir conteúdo extra.
- **Médio:** manifesto desatualizado aceito pode dar falsa confiança à evidência.
- **Médio:** URL sem `sslmode` pode conectar sem TLS; código não falha.
- **Médio:** `sslmode=require` pode ser interpretado de forma diferente do esperado.
- **Médio:** deploy ainda não foi refeito com o pacote isolado.
- **Baixo:** os 9/7 arquivos são bibliotecas + entrypoints; a nomenclatura “9 Functions/7 Edge
  Functions” deve ser corrigida em relatórios futuros.

---

## 12. Critérios para autorizar a próxima etapa

O artefato só deve ser aprovado para deploy se:

- os hashes do pacote forem revalidados;
- o `dist` final for exatamente o allowlist;
- o deploy for feito exclusivamente a partir do pacote isolado;
- a base remota for confirmada;
- `collect`, `_redirects` raiz e `_headers` raiz estiverem ausentes;
- o manifest de Function/Edge corresponder ao conteúdo.

O SSL só deve ser aprovado se:

- `CLEANUP_DATABASE_URL` tiver `sslmode=verify-full`;
- o host for direto, sem pooler;
- banco/role forem `validation_b1`/`validation_b1_cleanup`;
- a cadeia e o hostname forem validados;
- uma falha de TLS/CA/hostname abortar a conexão;
- o script de diagnóstico for executado em janela autorizada e somente leitura.

Nenhum deploy ou chamada remota deve ocorrer nesta fase.

---

## 13. Classificação final

**2 — Aprovado com pendências.**

O pacote B1 está isolado e os testes comprovam ausência de `collect` e `_redirects`, com 2 entrypoints
de Function e 1 de Edge. Permanecem pendentes a autovalidação do manifesto, a proibição de deploy
direto de `dist` e a comprovação remota de TLS/certificado/hostname. O script SSL foi preparado e
testado localmente, mas não executado contra Neon.

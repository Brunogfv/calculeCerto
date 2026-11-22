# Fase 5F.55 - Novo artefato funcional B1

Status: **artefato completo gerado, congelado e validado localmente; nenhuma operacao remota**.
Data: **2026-11-21**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.

**Classificacao: 1 - Aprovado.**

O novo pacote incorpora o CSP corrigido na Fase 5F.54, mantem o contrato funcional da Fase 5F.51
e foi congelado em diretorio exclusivo. O artefato 5F.51 permaneceu intacto.

---

## 1. Identificacao do novo artefato

| Item | Valor |
|---|---|
| Diretorio congelado | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f55` |
| Manifesto de integridade externo | `C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f55-integrity.json` |
| SHA-256 do artefato | `834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513` |
| SHA-256 do `package-manifest.json` | `dcba286b956750908715ad3accc43cb4d2cfedd63009348522e55bf9c3a0570d` |
| SHA-256 do `netlify.toml` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| SHA-256 da integridade externa | `f868b1321e2c1a19d2325161c2c13b259589133325e51a3e3320171e350b68cb` |
| Arquivos | 32 |
| Bytes | 105.975 |
| Estaticos | 7 |
| Netlify Functions | 16 |
| Edge Functions | 7 |
| Redirects | 0 |
| Modo do diretorio | `d-r---` (somente leitura) |
| Status do gate | `validated_only` |

Comando exato de geracao, executado em `validation-b1`:

```powershell
node scripts/freeze-artifact.mjs `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f55" `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f55-integrity.json"
```

O script novo `validation-b1/scripts/freeze-artifact.mjs`:

1. recusa destino ja existente;
2. cria o pacote pelo contrato B1;
3. valida antes e depois do congelamento;
4. calcula o digest;
5. grava a integridade fora do pacote;
6. aplica modo somente leitura.

O artefato da Fase 5F.51 permanece em:

```text
C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f51
```

com digest historico:

```text
6b80bea75089a28063df8bd3926772a8e59e163f7db08e1093ed9ac2168ab470
```

Nao foi sobrescrito, recriado ou modificado.

---

## 2. Conteudo e inventario

### 2.1 Estaticos

```text
dist/_headers
dist/b1-consent.js
dist/b1.css
dist/build-manifest.json
dist/index.html
dist/robots.txt
dist/validacao-encerrada.html
```

### 2.2 Functions

```text
netlify/functions/capture-html.mjs
netlify/functions/cleanup-html-capture.mjs
netlify/functions/collect.mjs
netlify/functions/_lib/attribution.mjs
netlify/functions/_lib/capture-config.mjs
netlify/functions/_lib/capture-handler.mjs
netlify/functions/_lib/capture-validation.mjs
netlify/functions/_lib/cleanup-html-capture.mjs
netlify/functions/_lib/cleanup-retention.mjs
netlify/functions/_lib/collect-handler.mjs
netlify/functions/_lib/config.mjs
netlify/functions/_lib/db.mjs
netlify/functions/_lib/http.mjs
netlify/functions/_lib/rate-limit.mjs
netlify/functions/_lib/user-agent.mjs
netlify/functions/_lib/validation.mjs
```

### 2.3 Edge Functions

```text
netlify/edge-functions/html-capture.js
netlify/edge-functions/_lib/capture-limits.mjs
netlify/edge-functions/_lib/capture-policy.mjs
netlify/edge-functions/_lib/capture-signature.mjs
netlify/edge-functions/_lib/classifier.mjs
netlify/edge-functions/_lib/edge-capture.mjs
netlify/edge-functions/_lib/edge-env.mjs
```

### 2.4 Configuracao e metadados

```text
netlify.toml
package-manifest.json
```

O `package-manifest.json` contem os hashes SHA-256 dos 30 arquivos de conteudo mais o hash da
configuracao. O manifesto externo de integridade contem os 32 arquivos, categorias, tamanhos e
SHA-256 individuais.

O endpoint `/api/collect` esta presente em `netlify/functions/collect.mjs` com
`config.path = '/api/collect'`. `ua-parser-js@2.0.10` permanece a dependencia usada por
`_lib/user-agent.mjs`.

---

## 3. Verificacao da CSP no pacote efetivo

Arquivo efetivamente entregue ao deploy:

```text
dist/_headers
```

Conteudo relevante:

```text
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; img-src 'none'; connect-src 'self' https://portal-contas-validation-b1.netlify.app; base-uri 'none'; form-action 'none'; frame-ancestors 'none'
```

Confirmacoes:

- a origem B1 esta no `_headers` que o pacote publica, nao apenas na fonte ou em configuracao
  local;
- `'self'` foi preservado;
- nao existe `*`, `*.netlify.app` ou `https:` generico em `connect-src`;
- a origem de producao `portaldascontas.com.br` nao foi liberada;
- `script-src`, `style-src`, `img-src`, `base-uri`, `form-action` e `frame-ancestors` nao foram
  alterados;
- nao existe `_redirects` no pacote;
- o novo `_headers` tem SHA-256
  `b98b4793ac11cc100247dcc06d9131a81833d61a070b3654254868c96fff9f92`;
- o novo `build-manifest.json` tem SHA-256
  `b1f900bd853a8d20c4ef3d53b37d3a477bc35db18145a24f24b327099b832fae`.

A CSP nao antecipa coleta. O envio do cliente continua condicionado ao consentimento local.

---

## 4. Integridade e isolamento

- Pacote gerado em diretorio temporario exclusivo `b1-artifact-5f55`.
- Diretorio de staging antigo nao foi reutilizado.
- Pacote e arquivos marcados somente leitura apos a validacao.
- `validarPacote` passou antes e depois do congelamento.
- Digest recalculado e estavel.
- 32 arquivos exatos; nenhum arquivo extra.
- 0 redirects; `_redirects` ausente.
- Nenhum arquivo de producao ou pagina canonica do site.
- Nenhuma variavel de ambiente com valor real incorporada.
- Nenhuma connection string, senha, token, chave ou secret nos arquivos.
- Verificacao de segredos encontrou apenas nomes de variaveis de ambiente em codigo de Function
  (por exemplo `CLEANUP_DATABASE_URL`), sem valores.
- Endpoint `/api/collect` incluido.
- `ua-parser-js@2.0.10` mantido no fluxo de classificacao, sem persistir UA bruto.
- Contrato de 7 estaticos, 16 Functions, 7 Edge e 0 redirects preservado.

O `validarPacote` do novo artefato retornou:

```json
{
  "static": 7,
  "functions": 16,
  "edge": 7
}
```

O digest novo foi confirmado novamente apos o congelamento:

```text
834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513
```

---

## 5. Comparacao com a Fase 5F.51

| Item | 5F.51 | 5F.55 |
|---|---|---|
| Arquivos | 32 | 32 |
| Bytes | 105.927 | 105.975 |
| Estaticos | 7 | 7 |
| Functions | 16 | 16 |
| Edge | 7 | 7 |
| Redirects | 0 | 0 |
| Digest | `6b80bea...` | `834dce3...` |
| `_headers` | `cacc628a...` | `b98b4793...` |
| `build-manifest.json` | `8db4794...` | `b1f900b...` |
| `package-manifest.json` | `32fc940...` | `dcba286b...` |

Diferencas de arquivos:

- adicionados: nenhum;
- removidos: nenhum;
- modificados: exatamente 3:
  - `dist/_headers` - CSP corrigida;
  - `dist/build-manifest.json` - novo tamanho/hash da CSP;
  - `package-manifest.json` - novos hashes dos dois estaticos alterados.

Nao houve alteracao em:

- Functions;
- Edge Functions;
- `netlify.toml`;
- `dist/index.html`;
- `dist/b1-consent.js`;
- `dist/b1.css`;
- `dist/robots.txt`;
- `dist/validacao-encerrada.html`.

Nenhuma alteracao funcional nao relacionada foi autorizada ou observada. Os unicos bytes
adicionais sao os 48 bytes da origem B1 acrescentada ao `_headers`.

Dependencias relevantes, sem mudanca:

```text
pg 8.23.1
ua-parser-js 2.0.10
zod 4.6.7
```

---

## 6. Evidencias de testes

### 6.1 B1

| Suite | Resultado |
|---|---|
| B1 Windows `npm test` | 57 pass, 1 skip (symlink Windows), 0 fail |
| B1 Linux Node 22 | 58 pass, 0 fail |
| B1 browser consent | 2/2 |
| Build B1 | 6 estaticos + manifest, 10.0 KiB |
| Artefato completo | 32 arquivos, validacao final verde |

O skip Windows e o teste de symlink, nao suportado no ambiente; a suite equivalente no Linux
passou 58/58.

### 6.2 Analytics e site

| Suite | Resultado |
|---|---|
| `npm run test:analytics` | 137/137 |
| Playwright canonico | 62/62 |
| `npm run test:isolation` | 51 arquivos preservados |
| Build canonico (via isolation) | 162 HTML, 159 URLs |

O isolamento subiu de 50 para 51 porque o novo script `freeze-artifact.mjs` passou a integrar o
diretorio B1; nenhum arquivo do artefato ou do site canonico foi adicionado.

### 6.3 Consentimento e CSP

- Sem consentimento: nenhuma chamada para `/api/collect` nos testes de site.
- Consentimento recusado: nenhuma chamada e nenhum ID criado.
- Aceite analitico: pageview permitido, sem valores de calculadora.
- Retirada: coleta interrompida e IDs removidos.
- Ads: independente de analytics no painel de preferencias.
- DNT/GPC: analytics e ads personalizados desativados.
- Calculadora/afiliado: somente metadados; sem valores ou URL completa.
- B1 browser: sem chamada antes/depois de aceitar/recusar/retirar.
- CSP: diretiva B1 exata, `'self'` preservado, sem wildcard e sem producao.
- CSP canonico: Playwright sem violacoes.
- Endpoint de origem nao autorizada: continua rejeitado pelo handler (403).

Nao houve deploy nem requisicao remota real de coleta nesses testes.

---

## 7. Procedimento de verificacao antes de deploy futuro

O comando abaixo valida o artefato congelado contra o contrato e recalcula o digest, sem publicar:

```powershell
$env:B1_ARTIFACT_DIR = "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-artifact-5f55"
node --input-type=module -e "import { validarPacote, digestArtefato } from './validation-b1/scripts/artifact.mjs'; const d=process.env.B1_ARTIFACT_DIR; const hash=digestArtefato(d); if (hash !== '834dce3dc8a1e7f88d77bc365da0226af5ba64911c5da9ac8450ee3ca30be513') throw new Error('digest divergente'); const r=validarPacote(d); console.log(JSON.stringify({hash, static:r.estaticos.length, functions:r.funcoes.length, edge:r.edge.length}));"
```

Verificacao adicional da integridade externa:

```powershell
(Get-FileHash `
  "C:\Users\Joanita\AppData\Local\Temp\opencode\b1-5f55-integrity.json" `
  -Algorithm SHA256).Hash.ToLowerInvariant()
```

Esperado:

```text
f868b1321e2c1a19d2325161c2c13b259589133325e51a3e3320171e350b68cb
```

Antes de qualquer deploy:

1. confirmar o digest `834dce3...`;
2. confirmar 32 arquivos, 7/16/7 e 0 redirects;
3. confirmar a CSP no `dist/_headers` do artefato;
4. confirmar o site/destino B1 e a autorizacao especifica;
5. interromper se qualquer hash divergir.

---

## 8. Pendencias remanescentes

1. Autorizar a aplicacao remota da migration 007 e dos grants 009 no Neon B1.
2. Configurar `ALLOWED_ORIGINS` e `RATE_LIMIT_HMAC_SECRET` no preview.
3. Ativar `ANALYTICS_INGEST_ENABLED` somente na janela autorizada.
4. Autorizar o deploy do novo artefato `834dce3...`; nao reutilizar o artefato 5F.51.
5. Executar smoke tests pos-deploy e comparar o conteudo publicado.
6. Testar escrita/rate limit/cleanup em autorizacoes separadas.
7. Reverter flags de teste e registrar evidencias.

O artefato 5F.51 continua intacto e nao deve ser publicado para a janela browser, pois carrega o
CSP antigo.

---

## 9. Confirmacao de ausencia de operacao remota

- Nenhum Neon remoto acessado ou alterado.
- Nenhuma migration, GRANT ou REVOKE remoto.
- Nenhum role remota alterada.
- Nenhum deploy, upload ou publicacao.
- Nenhuma variavel, secret ou flag Netlify alterada.
- Nenhum cleanup remoto.
- Nenhuma producao alterada.
- Nenhum commit, push ou PR.

Toda geracao, congelamento e validacao ocorreu localmente. Nenhuma connection string, senha ou
secret foi incluida neste relatorio.

**Classificacao final: 1 - Aprovado.**

# Fase 5F.12 — Integração operacional da retenção e validação de deploy B1

Status: **CLEANUP_DATABASE_URL configurada no B1; um deploy preview validado com Scheduled Function
reconhecida e desativada; limpeza não executada**.
Data/hora: **2026-11-16T18:40:24-03:00**.
Branch: `feat/portal-analytics`.
Commit: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** O deploy, a config e a Scheduled Function foram
validados; o enforcement real de rate limiting e o runtime de cleanup permanecem não comprovados
porque a limpeza não foi executada e não há método autorizado de teste de carga.

---

## 1. IDs confirmados

| Item | Valor |
|---|---|
| Team ID | `697d58587a017c3396fb416e` |
| Site ID B1 | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Site | `portal-contas-validation-b1` |
| Domínio | `https://portal-contas-validation-b1.netlify.app` |
| Neon Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` |
| Database | `validation_b1` |
| Runtime | `validation_b1_runtime` |
| Cleanup | `validation_b1_cleanup` |

---

## 2. Créditos

| Momento | Disponível | Usado | Total |
|---|---:|---:|---:|
| Antes do deploy | 139,6982 | 160,3018 | 300 |
| Depois do deploy | 139,6982 | 160,3018 | 300 |

- **Custo medido do deploy preview:** 0 crédito.
- Estimativa conservadora: até 15 créditos para um preview.
- Saldo permanece acima de 100 créditos.
- Nenhum add-on, cartão ou auto top-up.

---

## 3. Configuração da CLEANUP_DATABASE_URL

- Configurada exclusivamente no Site ID `9cd7034f-5691-46af-8030-d70f7ed52ca7`.
- Nome: `CLEANUP_DATABASE_URL`.
- Site-specific.
- Marcada como secret.
- Contexto: `deploy-preview`.
- Escopos: `builds`, `functions`, `runtime`.
- Usuário: `validation_b1_cleanup`.
- Database: `validation_b1`.
- Branch: `validation-b1`.
- Host direto da branch, não pooled.
- SSL obrigatório.
- Senha recuperada do Windows Credential Manager e nunca exibida.
- URL completa e senha não foram impressas, gravadas no repositório ou em `.env`.
- `DATABASE_URL` e `EDGE_INGEST_SECRET` não foram alterados.

A conexão aponta para `validation_b1`/`validation_b1_cleanup`; não usa `neondb` nem fallback para
`DATABASE_URL`.

---

## 4. Auditoria das variáveis/flags

| Variável | Estado |
|---|---|
| `CLEANUP_DATABASE_URL` | presente, secreta, site-specific |
| `DATABASE_URL` | presente, secreta, inalterada |
| `ANALYTICS_INGEST_ENABLED` | ausente (desativada) |
| `EDGE_CAPTURE_ENABLED` | `false` |
| `EDGE_ANALYTICS_ENABLED` | `false` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| `EDGE_ANALYTICS_SAMPLE_RATE` | `0.1` |
| `EDGE_INGEST_KEY_ID` | ausente; default seguro `v1` |
| `EDGE_INGEST_SECRET` | presente, secreta, inalterada |
| `ALLOWED_ORIGINS` | ausente; não é usada pelo fluxo B1 atual |

Nenhuma flag foi alterada.

---

## 5. Rate limiting

Configuração no código/build B1:

| Camada | Configuração |
|---|---|
| Edge `/*` | `windowLimit=120`, `windowSize=60`, `aggregateBy=['ip','domain']` |
| Function `/api/capture-html` | `windowLimit=60`, `windowSize=60`, `aggregateBy=['ip','domain']` |

Confirmado:

- sintaxe code-based oficialmente suportada;
- Free admite 2 regras por projeto;
- regras no build;
- sem regra duplicada/contraditória;
- sem segredo nos parâmetros.

**Pendente:** o deploy metadata não permite comprovar enforcement real das regras; não foi gerada
carga e não há teste autorizado de 429/IP interno. A presença no build não é prova de aplicação
pela plataforma.

---

## 6. Testes locais

| Suíte | Resultado |
|---|---|
| Analytics | **88/88 pass** |
| B1 | **19/19 pass** |
| Consentimento | **2/2 pass** |
| Integração PostgreSQL 17 | **32/32 pass** |
| Build B1 | passou |

- Sync compartilhado: 16 arquivos.
- Manifesto/hashes conferidos.
- Build: 6 arquivos publicados + manifest.
- Functions empacotadas: `capture-html` e `cleanup-html-capture`.
- Edge: `html-capture`.
- Nenhum segredo no `dist`/artefatos.
- A execução padrão sem `TEST_DATABASE_URL` mostra 2 suítes skip; a execução local com PG17 passou
  32/32. Não foram contadas como aprovadas sem execução.

---

## 7. Deploy preview

| Item | Valor |
|---|---|
| Deploy ID | `6afb78132cdffef6e6a05696` |
| URL | `https://6afb78132cdffef6e6a05696--portal-contas-validation-b1.netlify.app` |
| Estado | `ready` |
| Contexto | `deploy-preview` |
| Publicado como produção | não (`published_at=null`) |
| Site principal | inalterado (`published_deploy=null`) |
| Functions | `capture-html`, `cleanup-html-capture` |
| Edge | presente |
| Deploy count nesta fase | 1 |

Nenhum segundo deploy foi executado.

---

## 8. Scheduled Function

| Verificação | Resultado |
|---|---|
| `cleanup-html-capture` no deploy | sim |
| Cron reconhecido | `15 3 * * *` |
| `HTML_CAPTURE_CLEANUP_ENABLED` | `false` |
| Rotina executada | não |
| Execução manual | não |
| Cron em preview | não executado/não suportado |
| Logs de sucesso/falha | não gerados; função não invocada |

A função está ativa apenas como código publicado no preview, mas permanece desligada pela flag.
A validação de retenção deve ocorrer em janela autorizada, por invocação manual controlada; o cron
de preview não deve ser usado como teste.

---

## 9. Neon e dados

| Verificação | Resultado |
|---|---|
| Migrations | 6 |
| Tabelas | 13 + `schema_migrations` |
| `html_events` | 2 |
| `edge_nonces` | 2 |
| `edge_rate_limits` | 2 |
| `edge_daily_counters` | 1 |
| `html_traffic_daily` | 1 |
| `html_indicators_monthly` | 1 |
| Role cleanup | presente, `NOINHERIT`, sem atributos administrativos |
| Role runtime | inalterada, sem DELETE/TRUNCATE/DDL |
| Limpeza | não executada |
| DELETE/INSERT/UPDATE/TRUNCATE | nenhum |
| Dados sintéticos | preservados |

---

## 10. Isolamento e ambientes

- Produção: deploy `6af0feebef830ebab5cd25dd`, pública, inalterada.
- Homologação principal: deploy `6af47527818a48a5dbbef2c4`, privada, inalterada.
- B1: deploy preview `6afb78132cdffef6e6a05696`, público, sem promoção.
- `DATABASE_URL`, `EDGE_INGEST_SECRET` e demais variáveis existentes não foram alteradas.
- Nenhuma variável compartilhada.
- Nenhuma alteração em `neondb`, main, migrations, roles, grants ou dados.

---

## 11. Operações não executadas

- Nenhuma limpeza, DELETE, TRUNCATE, INSERT ou UPDATE.
- Nenhuma Scheduled Function invocada.
- Nenhum POST remoto ou teste de captura.
- Nenhuma alteração de flag para ativar coleta/cleanup.
- Nenhum segundo deploy, promoção ou deploy de produção.
- Nenhum commit/push/PR.

---

## 12. Pendências

1. Validar enforcement real de rate limiting e IP interno Edge→Function em janela autorizada.
2. Validar cleanup manual com flag controlada e sem apagar os 2 registros existentes.
3. Confirmar que a função não acessa banco com flag falsa em runtime real.
4. Definir orçamento total/max batches para execução agendada.
5. Avaliar cron em alvo publicado; preview não executa.
6. Não limpar dados sintéticos sem autorização.

---

## 13. Classificação final

**2 — Aprovado com pendências.** A variável secreta exclusiva foi configurada, o deploy preview
foi validado com a Scheduled Function reconhecida e desativada, os dados e ambientes foram
preservados. O enforcement real de rate limiting e o runtime de cleanup não foram comprovados nesta
fase.

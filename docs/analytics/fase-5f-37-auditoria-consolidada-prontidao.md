# Fase 5F.37 - Auditoria consolidada de prontidao para homologacao e producao

Status: **auditoria local e historica concluida; nenhuma alteracao de codigo, configuracao ou ambiente remoto executada**.
Data/hora: **2026-11-20T12:30:00Z** (referencia).
Branch: `feat/portal-analytics`.
HEAD analisado: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (sucesso em todos os jobs).

**Classificacao da auditoria: 2 - Aprovado com pendencias.** O codigo, os testes locais e o CI da
branch estao consistentes. A conclusao sobre homologacao e producao depende de validacoes remotas
que nao foram autorizadas nesta fase. O risco TOCTOU continua nao aceito.

---

## 1. Resumo executivo

O Portal das Contas tem uma implementacao de analytics propria, testada localmente e em CI, com:

- consentimento de analytics e publicidade;
- Consent Mode v2;
- Edge Capture sanitizado;
- HMAC, nonce, anti-replay, rate limit de codigo e limite diario;
- persistencia PostgreSQL com roles separadas;
- retencao e cleanup com advisory lock, lotes e orcamento;
- artefato B1 minimo com contrato independente e gate;
- CI Linux verde no commit `665f0b3`.

O que **nao** esta comprovado:

- execucao real do cron/cleanup no ambiente publicado B1;
- enforcement de rate limiting no runtime;
- SSL efetivo da conexao de cleanup;
- consentimento/Edge/ingestao em deploy B1 valido e atual;
- configuracao ativa de producao e Google;
- aprovacao de privacidade/DPO para ativacao;
- aceitacao do risco TOCTOU.

O projeto esta proximo de concluir a **engenharia local**. Nao esta pronto para producao.

---

## 2. Estado atual do Git e do CI

| Item | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote da branch | `665f0b3` |
| Indice Git | vazio |
| Codigo testado | commit `665f0b3` |
| CI 44733531472 | sucesso |
| Node.js do CI | 22 |
| B1 artifact/gate | sucesso |
| Analytics | sucesso |
| Playwright | sucesso |
| Producao | apenas testes de leitura |

Working tree possui alteracoes preexistentes e relatorios nao versionados; nao foram usados para
alterar o commit sob auditoria. Nenhuma correcao foi aplicada nesta fase.

---

## 3. Historico consolidado

| Fase | Problema tratado | Evidencia principal | Estado atual | Pendencia residual |
|---|---|---|---|---|
| Fase 2 | Backend de coleta e schema | `fase-2.md`, migrations 001-002, testes locais | Implementado e testado localmente | Runtime e producao nao ativados |
| Fase 3 | Consentimento, Consent Mode e frontend | `fase-3.md`, Playwright, `js/analytics.js` | Implementado e testado local/browser | Runtime/legal/configuracao de producao |
| Fase 4 | Edge, classificacao, retencao e plano de homologacao | `fase-4-implementacao.md`, `fase-4-homologacao.md`, `fase-4-lia.md` | Codigo local e testes | Homologacao real nao executada |
| 5F.1.1-1.4 | Abuso, rate limit e runtime | `fase-5f-1-*` | Projeto e testes locais | Enforcement real nao observado |
| 5F.6-14 | Cleanup, roles, orcamento e retencao | `fase-5f-6` a `fase-5f-14` | 135 testes locais; roles locais | Cron/Run now em ambiente publicado nao executado |
| 5F.15-19 | Memberships, preview B1 e SSL | `fase-5f-15` a `fase-5f-19` | Exception de membership provada; preview divergente antigo | Deploy B1 valido e SSL real pendentes |
| 5F.20-29 | Contrato, gate, CLI e Node 22 | `fase-5f-20` a `fase-5f-29` | Contrato/gate/testes locais e CI | Deploy remoto e aceitacao TOCTOU |
| 5F.30-36 | Versionamento, encoding, dependencias, test-local | `fase-5f-30` a `fase-5f-36` | CI remoto verde; 162 paginas canonicas | Nada de codigo local impede a proxima etapa |

Itens nao reabertos: isolamento do build, lockfile, CLI fixado, artefato B1 minimo, contrato LF,
analytics em Node 22, test-local e CI de validacao.

---

## 4. Arquitetura atual

```text
Navegador
  -> banner de consentimento
  -> localStorage pca_consent_v1
  -> cookie pca_edge_consent
  -> Consent Mode v2 (GA4)
  -> /api/collect (analytics de sessao)
  -> Edge html-capture (GET HTML publico)
       -> /api/capture-html (HMAC Edge -> Function)
       -> Neon PostgreSQL
  -> cleanup-html-capture (Scheduled Function)
       -> role validation_b1_cleanup
```

Separacao de finalidades:

- Analytics: consentimento e finalidade propria.
- Seguranca: desativada; nao e usada para contornar analytics.
- Cleanup: role restrita, conexao dedicada e allowlist de tabelas.
- B1: site publico de validacao, artefato minimo e gate independente.

O codigo de producao e o codigo da branch nao sao a mesma coisa. A branch foi validada em CI, mas
ainda nao foi publicada em producao nesta auditoria.

---

## 5. Auditoria de analytics

### 5.1 Comprovado por codigo e testes

| Requisito | Evidencia | Estado |
|---|---|---|
| Consentimento antes de analytics | `js/analytics.js`; testes de consentimento | Comprovado localmente |
| Recusa/retirada param coleta | `aplicarConsentimento`, `pararColeta`; Playwright 2/2 | Comprovado localmente |
| DNT/GPC | `capture-policy.mjs`; testes | Comprovado localmente |
| Cookie Edge sem IDs | `pca_edge_consent`; testes | Comprovado localmente |
| Consent Mode v2 | frontend e testes E2E | Comprovado localmente |
| Nenhum valor/resultado de calculadora | validacao `zod`, chaves proibidas; testes | Comprovado localmente |
| HMAC Edge -> Function | `capture-handler.mjs`; testes | Comprovado localmente |
| Timestamp, nonce e replay | validacao e integracao; testes | Comprovado localmente |
| Rate limit por IP/visitor/sessao | codigo e testes de concorrencia | Comprovado localmente |
| IP bruto nao persistido | HMAC; schema; testes | Comprovado localmente |
| Falha silenciosa | `onError: bypass`; testes | Comprovado localmente |
| Flags desligadas nao gravam | testes de integracao | Comprovado localmente |

### 5.2 Nao comprovado no runtime

- GA4/AdSense reais e Consent Mode no navegador de producao.
- Edge -> Function em deploy B1 atual e valido.
- Rate limit de plataforma, 429 real e efeito do atraso de 10 s.
- Consumo de CPU/tempo do Edge em runtime.
- Comportamento sob rede lenta e indisponibilidade real.
- Dados reais de producao; nao foram consultados.

### 5.3 Achado de privacidade

A tabela `sessions` possui a coluna `user_agent` e o handler grava o UA de request truncado em
`sessions.user_agent`. A retencao de sessoes e de ate 13 meses no cleanup documentado.

Isso conflita com a decisao de minimizacao que recomenda nao armazenar UA bruto por padrao e, se
necessario, limitado a 7 dias. O dado e pseudonimizavel, mas aumenta superficie de reidentificacao.
Nao e um problema do Edge B1, que armazena apenas familia/versao; e um problema do fluxo de
analytics de sessao (`/api/collect`).

**Acao necessaria antes de producao:** remover/normalizar o UA bruto ou justificar e limitar sua
retencao com aprovacao de privacidade. Nao foi alterado nesta auditoria.

---

## 6. Auditoria do Edge Capture

| Item | Estado |
|---|---|
| `context.next()` primeiro | comprovado por teste |
| Nao altera resposta/status | comprovado por teste |
| Escopo de caminhos HTML | comprovado por testes |
| Amostragem deterministica | comprovada por teste |
| HMAC, nonce, timestamp | comprovados localmente |
| Limitacao de corpo | comprovada localmente |
| Bypass em erro | comprovado localmente |
| Classificacao de trafego | implementada e testada |

Categorias: `likely_human`, `likely_bot`, `automation`, `preview_or_monitoring`, `unknown`.

- Exigem pelo menos dois sinais independentes para classe diferente de `unknown`.
- A confianca e nivel de evidencia, nao probabilidade calibrada.
- Conflito forte permanece `unknown`.
- Pais nao e sinal de classe.
- A classificacao nao bloqueia nem altera a pagina.

O classificador e uma heuristica. Nao foi validado contra trafego real nem apresentado em dashboard.
Nao deve ser vendido como verdade absoluta.

---

## 7. Rate limiting e abuso

### 7.1 Implementacao

- Edge `/*`: 120/60 s, agregacao por IP e dominio.
- Function `/api/capture-html`: 60/60 s, agregacao por IP e dominio.
- `/api/collect`: rate limit de aplicacao no PostgreSQL (IP HMAC, visitante, sessao), sem regra de
  plataforma dedicada.
- HMAC de IP, timestamp, nonce, tamanho de payload e timeout.
- Free plan: duas regras code-based por projeto; a implementacao usa exatamente duas regras.

### 7.2 Evidencias e limites

O deploy B1 antigo `6afb...` teve as duas regras reconhecidas pela plataforma, conforme a Fase 5F.13.
Isso prova configuracao no deploy, nao enforcement observado.

Nao ha evidencia runtime de:

- resposta 429 da plataforma;
- atraso documentado de ate 10 s;
- efeito do IP da chamada Edge -> Function;
- comportamento com IPs distribuidos;
- semantica de `excludedPath` para a regra Edge;
- rate limit do `/api/collect` sob abuso real.

O rate limit local do PostgreSQL e testado, mas nao substitui a plataforma para ataques volumosos.

**Nao declarar protecao efetiva contra abuso apenas pela presenca de limites no codigo.**

---

## 8. Cleanup e retencao

Implementacao local:

- Scheduled Function `cleanup-html-capture`, cron `15 3 * * *`.
- `HTML_CAPTURE_CLEANUP_ENABLED=false` por padrao e no preview.
- Orcamento padrao de 20 s, maximo 25 s; plataforma limita a 30 s.
- Lotes de 1.000 (maximo 5.000), no maximo 100 lotes.
- Advisory lock `871238`.
- Transacao por lote, rollback do lote com erro.
- Ordem de tabelas respeitando FKs.
- Status `complete`, `partial`, `budget_exhausted`, `locked`.
- Role `validation_b1_cleanup`: SELECT/DELETE nas 13 tabelas, sem INSERT/UPDATE/TRUNCATE/DDL e sem
  acesso a `schema_migrations`.
- Exception: `neondb_owner` e membro de `validation_b1_cleanup`, grantor `cloud_admin`, admin true,
  inherit/set false. A role de cleanup nao recebe memberships e nao herda privilegios.

Retencao documentada:

| Dado | Prazo |
|---|---|
| HTML bruto | 7 dias |
| Sessoes | 13 meses |
| Pageviews/eventos/afiliados | 90 dias |
| Agregados diarios | 90 dias |
| Indicadores mensais | 13 meses |
| Nonces/rate limits | 24 h |

Nao comprovado:

- execucao real pelo cron;
- execucao manual Run now no deploy B1 valido;
- status real `complete/partial/budget_exhausted/locked`;
- remocao com volume real;
- TLS efetivamente negociado;
- leitura do secret `CLEANUP_DATABASE_URL`;
- monitoramento/alerta de falha.

O preview B1 antigo nao e deploy publicado e nao dispara cron. A funcao existe, mas **cron
operacional nao esta comprovado**.

---

## 9. B1 e TOCTOU

Seguranca atual do artefato:

- contrato independente `validation-b1/artifact-contract.json`;
- allowlist de 7 estaticos, 9 Functions e 7 Edge Functions;
- hashes SHA-256;
- rejeicao de arquivo extra/ausente, manifesto adulterado, caminho absoluto/traversal e symlink;
- build isolado;
- gate `--check`/`--confirm`;
- CLI local `27.20.0`;
- CI Linux e Windows;
- contrato normalizado com LF.

O B1 remoto valido nao esta publicado. O preview `6afd151972b2d3618033a7dd` e antigo, divergente:
3 Functions, 252 redirects e 16 headers. Nao deve ser usado como ambiente de homologacao.

### TOCTOU

Risco: entre a validacao final e o momento em que o Netlify CLI abre os arquivos, outro processo do
mesmo usuario pode alterar/substituir o pacote. `chmod` reduz escrita acidental, mas nao e
imutabilidade.

- Impacto: alto para o conteudo do preview B1.
- Probabilidade: baixa a media; exige processo concorrente com acesso ao mesmo diretorio.
- Detectabilidade: baixa apos o upload, se nao houver verificacao pos-publicacao.
- Exposicao: B1 preview; nao afeta analytics de producao por si so.

Mitigacoes atuais: `mkdtemp`, contrato independente, `chmod`, validacao dupla, mesmo `dir`, gate
explicito, CLI fixada e workflow sem deploy.

Limitacoes: sem lock de filesystem, sem assinatura, CLI externo e uma janela inevitavel entre
validacao e leitura.

Menor solucao adequada (nao implementada): execucao exclusiva de deploy, pacote imutavel/assinado e
verificacao de hashes no destino apos o upload, alem de proibir deploys concorrentes.

O risco permanece **NAO ACEITO**.

---

## 10. Privacidade

Implementado no codigo:

- consentimento separado para analytics e publicidade;
- retirada de consentimento remove IDs locais e para coleta;
- DNT/GPC bloqueiam analytics;
- sem valores ou resultados de calculadoras no payload;
- sem IP completo persistido;
- referrer e atribuicao limitados pelo contrato;
- Edge sem UA bruto;
- politica de privacidade descreve analytics, anuncios, consentimento e direitos;
- GA4/AdSense existentes com Consent Mode padrao negado.

Pendencias:

- revisao juridica/DPO da LIA de seguranca e da base de analytics;
- decisao sobre GA4/AdSense e transferencias internacionais;
- UA bruto em `sessions` (achado acima);
- processo operacional de acesso/correcao/exclusao de dados;
- definicao de retencao final e monitoramento;
- validacao de que o HTML publicado e a configuracao remota aplicam exatamente o codigo da branch.

Nao foi emitida conclusao juridica.

---

## 11. Ambientes

| Ambiente | Estado | Evidencia | Pendencia |
|---|---|---|---|
| Desenvolvimento local | pronto para testes | CI e execucao local Node 22 | Nenhuma para codigo |
| Neon homologacao/B1 | schema e roles existentes | Fases 5F.11/5F.15 | Cron, SSL, dados sinteticos e runtime nao confirmados |
| B1 Netlify | preview antigo divergente | Fase 5F.18 | Deploy B1 valido nao publicado |
| Producao Netlify | nao confirmado | Sem consulta remota nesta fase | Configuracao/codigo ativo precisam de verificacao |
| Google producao | nao confirmado | Tags locais; testes locais | Configuracao real, consentimento e AdSense precisam de verificacao |

Nenhum estado remoto foi assumido como igual ao ultimo relatorio.

---

## 12. Matriz consolidada de pendencias

### A. Bloqueadores de homologacao

| ID | Descricao | Evidencia | Risco/impacto | Criterio de resolucao | Esforco |
|---|---|---|---|---|---|
| A-01 | Nao existe deploy B1 valido e atual | 5F.18/5F.36; preview `6afd` divergente | Alto; nao testa o artefato real | Deploy B1 do contrato validado, sem collect/redirects extras | Medio |
| A-02 | Cleanup nao executado no runtime | 5F.18/5F.19; flag false; Run now nao executado | Alto; retencao pode nao funcionar | Um Run now autorizado em B1 valido, com dados sinteticos e status verificado | Medio |
| A-03 | Enforcement de rate limit nao observado | 5F.13; sem carga/429 | Medio/alto; abuso pode passar | Teste controlado de limite e 429, registrando comportamento | Medio |
| A-04 | SSL da conexao de cleanup nao comprovado | `pg_stat_ssl=false`; secret nao lido | Medio; transporte/privacidade | Verificar host direto, sslmode/tls e certificado sem expor secret | Baixo/medio |
| A-05 | Edge/consent/ingestao nao validados no deploy atual | Apenas testes locais e preview antigo | Alto; fluxo remoto nao comprovado | Deploy B1 valido + testes de consentimento/ingestao/edge | Medio |
| A-06 | Private SSO impede Edge -> Function em alvo privado | 5F.1.1, 5F.4 | Medio; caminho pode falhar silenciosamente | Usar alvo publico autorizado ou arquitetura alternativa documentada | Medio |

### B. Bloqueadores de producao

| ID | Descricao | Evidencia | Risco/impacto | Criterio de resolucao | Esforco |
|---|---|---|---|---|---|
| B-01 | UA bruto em `sessions` por ate 13 meses | `collect-handler` + schema + cleanup | Privacidade/reidentificacao | Remover/hashear/normalizar ou aprovar retencao minima | Medio |
| B-02 | Revisao juridica/DPO pendente | `fase-4-lia.md`; politica local | Alto; ativacao sem base validada | Parecer/registro de aprovacao e politica final | Medio |
| B-03 | Producao nao migrada/ativada | Flags false; nenhum deploy de analytics | Alto; nao ha runtime de producao | Migracoes owner, roles, secrets, flags e deploy autorizado | Alto |
| B-04 | Cron/monitoramento de cleanup nao operacional | A-02; sem published deploy/monitor | Alto; retencao pode falhar silenciosamente | Execucao publicada + alertas + evidencia de run | Medio |
| B-05 | Protecao de abuso em producao nao comprovada | A-03; regras Free limitadas | Alto; plataforma/Custo/abuso | Teste de carga controlado e decidir modo de protecao | Medio |
| B-06 | TOCTOU nao aceito | Gate/5F.25/5F.36 | Alto no preview B1 | Operacao exclusiva + verificacao pos-upload ou aceitacao formal | Baixo/medio |
| B-07 | Rollout/rollback de producao nao definido | Nenhum plano operacional atual | Alto; falha sem reversao | Plano com flags reversiveis, janela e monitoramento | Medio |

### C. Melhorias recomendadas

| ID | Item | Justificativa | Esforco |
|---|---|---|---|
| C-01 | Dashboard/consultas agregadas | Hoje ha dados, nao produto de analytics | Medio |
| C-02 | Teste de symlink de diretorio e hard links | Arquivo coberto; diretorio nao | Baixo |
| C-03 | Rotacao de chave HMAC | Reduz exposicao de segredo | Medio |
| C-04 | Medicao de CPU/TTFB e p95 reais | Validar limites Edge/Function | Baixo |
| C-05 | Alertas de cleanup/erros | Falhas silenciosas sao dificeis de detectar | Baixo |
| C-06 | Documento de operacao e resposta a incidentes | Necessario antes de producao | Baixo |

### D. Resolvido e comprovado

- Build canonico isolado de B1: 41 arquivos preservados.
- B1 artifact minimo: 7 estaticos, 9 Functions, 7 Edge, 0 redirects, sem collect.
- Contrato B1 independente, hashes LF e gate `validated_only`.
- Lockfile B1, Netlify CLI `27.20.0` e instalacao local.
- Analytics 135/135, Playwright 62/62, B1 39/39, consentimento 2/2, SSL 5/5.
- test-local com 162 paginas e sem `validation-b1`.
- CI remoto 44733531472 verde, sem deploy.
- Dependencias do CI e lockfile completos.

Nao reabrir esses itens sem nova evidencia de regressao.

---

## 13. Plano minimo de conclusao

### Marco 1 - Pronto para homologacao

Entrada: CI verde; contrato B1 valido; decisao sobre UA bruto (ou aceitacao documentada para teste
sintetico); ambiente B1 isolado identificado.

Saida: deploy B1 valido, sem collect/redirects extras; testes de consentimento, Edge, HMAC, rate
limit, insercao e cleanup concluidos; dados sinteticos; logs; rollback das flags.

### Marco 2 - Homologacao aprovada

Entrada: Marco 1 concluido.

Saida: Run now do cleanup com status observado; SSL/role diretos confirmados; rate limit 429
observado; nenhuma discrepancia de dados; relatorio de homologacao aprovado; risco TOCTOU com
decisao operacional explicita.

### Marco 3 - Pronto para producao

Entrada: Marco 2 aprovado; revisao juridica/DPO; politica final; producao migrada e configurada;
plano de ativacao reversivel.

Saida: deploy de producao autorizado, flags ativadas em janela controlada, monitoramento, verificacao
de dados e rollback testado.

O menor caminho tem **tres marcos** e **duas janelas remotas de alteracao** (B1 e producao), com
uma verificacao pos-deploy somente de leitura. Nao e necessario repetir a auditoria local completa.

---

## 14. Estimativa relativa e autorizacoes

| Etapa | Esforco | Autorizacao remota |
|---|---|---|
| Corrigir/revisar UA bruto e privacidade | Medio | Nao para codigo; sim para politica final |
| Deploy B1 valido + testes runtime | Medio | Sim |
| Run now/cleanup B1 + SSL | Baixo/medio | Sim |
| Rate limit/429 em B1 | Medio | Sim |
| Producao: schema/roles/migracoes | Alto | Sim |
| Producao: deploy/flags/rollback | Medio/alto | Sim |
| Dashboard/monitoramento | Baixo/medio | Parcial |

Nao foram estimadas horas/dias.

---

## 15. O que precisa de autorizacao

- Deploy B1 e execucao Run now.
- Teste controlado de rate limit/429 no B1.
- Leitura/verificacao segura da conexao SSL de cleanup.
- Migracoes/roles/configuracao de producao.
- Deploy de producao, flags e rollback.
- Revisao juridica/DPO e atualizacao final da politica.

Nenhuma dessas operacoes foi executada.

---

## 16. Conclusao e classificacao

- **Estamos perto de terminar?** Sim para engenharia local e CI. Nao para producao.
- **O que falta exatamente?** Validar o artefato B1 em deploy atual, executar cleanup e rate limit
  reais, confirmar SSL, resolver UA bruto/privacidade e preparar a ativacao de producao.
- **Quantas etapas?** Tres marcos de conclusao, com duas janelas remotas de alteracao.
- **O que impede homologar?** A-01 a A-06.
- **O que impede producao?** B-01 a B-07.
- **O que pode ser adiado?** C-01 a C-06.
- **Qual a proxima fase?** Uma unica execucao controlada de homologacao B1, apos autorizacao,
  cobrindo deploy valido, consentimento/Edge/ingestao, rate limit 429, cleanup Run now, SSL e
  evidencia de dados. Nao repetir auditorias ja concluidas.

**Classificacao da auditoria: 2 - Aprovado com pendencias.**

O codigo e o CI estao consistentes e nenhuma correcao local e necessaria para iniciar a
homologacao. A conclusao final depende de operacoes remotas autorizadas e da revisao de privacidade.
A auditoria nao aprova homologacao nem producao.

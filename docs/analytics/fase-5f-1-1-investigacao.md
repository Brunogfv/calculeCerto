# Fase 5F.1.1 — Investigação e redução de riscos da Edge Function

Status: **investigação e correções locais concluídas; nada publicado ou ativado**.
Data: 2026-11-11.

> Revisão independente posterior: a Fase 5F.1.2 manteve o limite único, a allowlist e o timeout,
> e endureceu a assinatura para cobrir `key-id`, timestamp, nonce e corpo, além de exigir HTTP `202`
> como sucesso. Ver [`fase-5f-1-2-auditoria-independente.md`](fase-5f-1-2-auditoria-independente.md).
Branch: `feat/portal-analytics`.
Saldo informado: **141,9 créditos Netlify**.

Todas as flags permanecem `false`:
`EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`, `EDGE_SECURITY_ENABLED`,
`HTML_CAPTURE_CLEANUP_ENABLED`, `ANALYTICS_INGEST_ENABLED`.

Não houve deploy, build remoto, alteração de variáveis/secrets, alteração de visibilidade,
POST remoto, execução remota de Edge/Scheduled Function, escrita no Neon, migration, criação de role,
commit, push ou PR.

---

## 1. Fontes oficiais consultadas

| Tema | Fonte |
|---|---|
| API de Edge Functions, `context.next()`, `context.waitUntil`, `context.user`, `Netlify.env` | https://docs.netlify.com/build/edge-functions/api/ |
| Limites de Edge Functions (CPU 50 ms, timeout de cabeçalho 40 s) | https://docs.netlify.com/build/edge-functions/limits/ |
| Variáveis de ambiente no Edge (`get`, `toObject`, escopo Functions) | https://docs.netlify.com/build/edge-functions/environment-variables/ |
| Visibilidade do projeto (privado não é alcançável por requisição não autenticada) | https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/ |
| Password Protection, team login e SSO, `context.user` | https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/ |
| Configuração de Functions (região padrão `cmh`, limite síncrono de 60 s) | https://docs.netlify.com/build/functions/configuration/ |
| Billing de Functions | https://docs.netlify.com/build/functions/usage-and-billing/ |
| Créditos (deploy, compute, web requests, Edge) | https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/ |
| Planos credit-based (Free: 300 créditos/mês, limite rígido) | https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans |
| Regiões Neon (`aws-sa-east-1` São Paulo) | https://neon.com/docs/introduction/regions |
| Pooling Neon (PgBouncer, modo transação, string `-pooler`) | https://neon.com/docs/connect/connection-pooling |
| Latência e scale-to-zero no Neon | https://neon.com/docs/connect/connection-latency |

Consulta read-only adicional: `neon projects list` confirmou o projeto
`square-mountain-69641645` (`portal-contas-homologacao`) na região
**`aws-sa-east-1` (AWS South America, São Paulo)**. Nenhum dado de conexão ou credencial foi impresso.

---

## 2. Conclusão sobre comunicação interna e SSO

**Não existe mecanismo documentado da Netlify que faça uma Edge Function chamar uma Function do mesmo
projeto privado ignorando a proteção de login/SSO.**

O que a documentação oficial estabelece:

1. Um projeto privado é protegido por login da equipe Netlify. A documentação de visibilidade diz
   explicitamente que **“a private project isn't reachable by unauthenticated requests”**.
2. `fetch()` para a mesma origem **inicia uma nova cadeia de requisição**; não é uma chamada interna
   privilegiada. `context.next()` é o mecanismo para continuar a cadeia no mesmo caminho, não para
   chamar outro caminho.
3. `context.user` identifica o usuário Netlify que fez a requisição de entrada. Ele **não é propagado
   automaticamente** para um `fetch()` novo. A Edge teria que repassar credenciais, o que não é
   documentado como autenticação serviço-a-serviço.
4. `context.waitUntil()` apenas estende a execução após a resposta; não altera autenticação.
5. O código atual usa `credentials: 'omit'`, portanto a requisição interna vai sem cookie de proteção.
   Em projeto privado, ela não chega à Function: recebe a resposta de login/proteção do site
   (tipicamente 401/HTML), `resposta.ok` é falso e a captura é descartada em silêncio.

Consequência prática:

- **Homologação privada:** o caminho Edge → `/api/capture-html` **não funciona** como está, e a falha
  será silenciosa por projeto. Não é seguro presumir bypass interno.
- **Produção pública:** como o portal de produção é público, uma requisição não autenticada alcança a
  Function; a proteção real passa a ser o HMAC, timestamp, nonce, rate limit, limite diário e limite
  de corpo.

Isso não foi validado em deploy real nesta fase; a conclusão é baseada na documentação oficial e no
comportamento documentado de nova cadeia de requisição.

---

## 3. Comparação das arquiteturas

### Alternativa A — Manter o endpoint protegido e usar autenticação interna documentada

- **Segurança:** alta, se existisse autenticação serviço-a-serviço documentada.
- **Complexidade:** média/alta; exigiria um mecanismo de credencial de serviço, rotação e escopo.
- **Impacto no código:** médio; a Edge precisaria obter e apresentar uma credencial privilegeada, hoje
  inexistente.
- **Créditos:** sem custo adicional relevante além de deploy e requests já contabilizados.
- **Riscos:** **não há mecanismo documentado** para projeto privado. Repassar o cookie de login do
  usuário é possível tecnicamente, mas não é autenticação de serviço documentada, expõe sessão de SSO
  (expira em 1 h) e cria dependência de comportamento não garantido.
- **Plano Free:** não oferece opção documentada; a alternativa não é viável com segurança.

**Conclusão: não recomendada.** Viola a premissa de não presumir bypass de SSO.

### Alternativa B — Endpoint de ingestão separado, público e restrito por HMAC

- **Segurança:** média/alta. O endpoint é público, mas exige HMAC-SHA256 de uma mensagem canônica
  com `key-id`, timestamp, nonce e corpo, timestamp curto, nonce sem replay, rate limit por chave
  HMAC, limite diário e corpo máximo. Não usa cookie, IP bruto ou UA bruto. Requisições inválidas
  ainda consomem web request e uma fração de compute da Function, mas falham cedo.
- **Complexidade:** baixa/média; é essencialmente o desenho atual, com a exposição consciente do
  endpoint em projeto público.
- **Impacto no código:** baixo; manter `/api/capture-html`, HMAC e limites. Não requer novo segredo
  além do `EDGE_INGEST_SECRET`.
- **Créditos:** muito baixos no volume de teste; cada captura gera 1 web request adicional da Function
  (2 créditos/10 mil requests) e compute de Function (10 créditos/GB-hora). Edge não entra em compute;
  entra em web requests.
- **Riscos:** endpoint público pode ser varrido/abusado; mitigação por HMAC, rate limit e limite
  diário, e opcionalmente WAF/rate limiting da Netlify. Não há mTLS. Em projeto privado, a
  alternativa exige tornar o projeto público (ou usar um projeto público dedicado).
- **Plano Free:** compatível. Projeto público é o padrão; HMAC e limites não dependem de plano pago.
  Password Protection/visibilidade por rota não está disponível no Free.

**Conclusão: melhor relação segurança/simplicidade para produção e para um site de validação público.**

### Alternativa C — Edge grava em Netlify Blobs e uma Scheduled Function drena para o Neon

- **Segurança:** alta; não há ingresso HTTP público. O Edge escreve em Blobs do próprio site e a
  Scheduled Function lê e grava no banco. Mantém o projeto privado.
- **Complexidade:** alta; exige formato de registro, idempotência, retry, deduplicação, limpeza de
  Blobs, monitoramento e uma segunda etapa de persistência.
- **Impacto no código:** alto; novo escritor no Edge, novo consumidor agendado, novos testes e nova
  operação.
- **Créditos:** Blobs (armazenamento/operações), compute da Scheduled Function e web requests comuns;
  sem web request de ingestão.
- **Riscos:** atraso entre captura e banco; duplicatas/reordenação; mais superfície operacional;
  validação mais difícil; CPU de 50 ms do Edge para escrever o Blob.
- **Plano Free:** tecnicamente possível, mas adiciona dependência e custo operacional que não se
  justificam antes de medir o volume real.

**Conclusão: reserva para o caso de o projeto precisar permanecer privado em tempo integral.**

### Alternativas descartadas nesta fase

- **Repassar o cookie de login/SSO no `fetch()`:** não documentado como autenticação interna, expõe
  sessão e quebra quando o token expira. Não recomendado.
- **Edge acessar o Neon diretamente por driver HTTP:** colocaria `DATABASE_URL` no Edge, contrariando
  a redução de segredos, e concentraria validação/transação em um runtime com 50 ms de CPU. Descartado.

---

## 4. Problemas encontrados no código

| ID | Problema | Severidade |
|---|---|---|
| P1 | `fetch('/api/capture-html')` em projeto privado é não autenticado e não alcança a Function; falha silenciosa | Crítica |
| P2 | `Netlify.env.toObject()` materializava **todas** as variáveis de escopo Functions no módulo Edge, incluindo `DATABASE_URL`, `CLEANUP_DATABASE_URL`, `MIGRATION_DATABASE_URL`, `RATE_LIMIT_HMAC_SECRET` | Alta |
| P3 | Divergência de limite de corpo: Function aceitava `EDGE_CAPTURE_MAX_BODY_BYTES` entre 1024 e 16384; Edge usava 8192 fixo | Média |
| P4 | Timeout de 750 ms fixo, potencialmente curto para Function `cmh` + Neon `sa-east-1` + cold start | Média |
| P5 | Cookie `pca_edge_consent` é controlado pelo cliente e não comprova consentimento no servidor; documentação não deixava a limitação explícita | Média (privacidade) |
| P6 | Parâmetros duplicados no cookie (`v`, `analytics`, `ads`) eram ambíguos | Baixa |
| P7 | Região da Function `cmh` (Ohio) difere da região do Neon `aws-sa-east-1` (São Paulo) | Média (latência) |
| P8 | Custo da chamada interna não estava explícito no plano: 1 web request adicional + compute de Function por captura | Baixa |
| P9 | CPU real do Edge (50 ms) não pode ser comprovado por testes Node; o benchmark local é apenas indicativo | Média (validação) |
| P10 | Não havia instrumentação de diagnóstico sem PII | Baixa |
| P11 | Configuração de região de Function é recurso Pro/Enterprise; no Free não é possível mover para `gru` | Média (limitação) |
| P12 | `EDGE_CAPTURE_MAX_BODY_BYTES` continuava documentado como configurável, apesar de não haver caminho seguro para divergência | Baixa |

---

## 5. Correções locais realizadas

1. **Allowlist explícita de ambiente no Edge** (`netlify/edge-functions/_lib/edge-env.mjs`).
   O Edge passa a ler somente:
   `EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`, `EDGE_INGEST_SECRET`,
   `EDGE_INGEST_KEY_ID`, `EDGE_ANALYTICS_SAMPLE_RATE`, `EDGE_CAPTURE_TIMEOUT_MS`.
   `Netlify.env.toObject()` não é mais usado. A Function continua lendo suas próprias variáveis por
   `process.env` normalmente.
2. **Limite único de corpo** (`netlify/edge-functions/_lib/capture-limits.mjs`):
   `CAPTURE_MAX_BODY_BYTES = 8192`, compartilhado por Edge e Function. A Function não aceita mais
   sobrescrever o limite por variável de ambiente.
3. **Timeout configurável e mais realista**: padrão **2000 ms**, faixa 250–5000 ms via
   `EDGE_CAPTURE_TIMEOUT_MS`. O valor continua sem validação no runtime real; é uma hipótese a medir.
4. **Parser de consentimento mais estrito**: parâmetros duplicados de `v`, `analytics` ou `ads`
   invalidam o cookie, evitando ambiguidade.
5. **Testes locais** para allowlist, segredos proibidos, limite único, timeout/abort, HMAC, timestamp,
   key-id, nonce divergente, content-type, corpo grande, flags desligadas e cookie adulterado.
6. **Documentação atualizada** neste arquivo, no `README.md`, em `fase-4-implementacao.md`,
   `fase-4-decisoes.md` e `fase-4-homologacao.md`.

Nenhuma flag foi alterada.

### 5.1 Cookie de consentimento — auditoria e recomendação

**O que o cookie comprova:** apenas que o navegador apresentou
`pca_edge_consent=v=2026-11&analytics=1&ads=0` naquela requisição. Ele **não** comprova que o
titular clicou, quando clicou, em qual site/dispositivo, nem que o consentimento não foi revogado
depois. É uma preferência declarada pelo cliente.

**Como pode ser alterado:** o cookie não é `HttpOnly` (precisa ser escrito pela Fase 3) e pode ser
criado, editado, apagado ou duplicado por DevTools, extensão, outro script da mesma origem ou
ferramenta HTTP. Qualquer cliente pode enviar `analytics=1` sem ter consentido, ou `analytics=0`
para suprimir a captura. O Edge não tem como distinguir o cookie legítimo do forjado.

**Riscos de interpretar `analytics=1` como prova:**

- superestimar a base legal e descrever o cookie como “consentimento verificado”;
- gerar eventos de analytics para alguém que não consentiu (fraude ou compartilhamento de
  dispositivo);
- manter a captura por até 180 dias sem novo contato, se a preferência local for perdida ou alterada;
- dificultar a demonstração de retirada, porque não existe registro server-side da ação.

**Recomendação técnica e de privacidade:** manter o cookie como **sinal de preferência**, não como
prova. A política de privacidade deve dizer que a captura HTML depende da preferência salva no
navegador e pode ser desativada a qualquer momento, sem prometer verificação server-side. Não usar a
flag `ads` para analytics. Não implementar assinatura agora: um cookie HMAC assinado apenas prova que
o servidor emitiu o valor; não prova a ação do titular sem um endpoint de consentimento e um registro
server-side, que adicionariam dado pessoal e retenção sem necessidade demonstrada. Se no futuro o
jurídico/DPO exigir consentimento verificável, a alternativa mínima é um endpoint de consentimento
separado que grava um recibo assinado com timestamp e versão, com retirada fácil e fail-closed; a
mera assinatura do cookie atual não resolve o problema.

### 5.2 Timeout, regiões e limites

- `AbortSignal.timeout()` foi alterado de 750 ms fixos para **2000 ms padrão**, configurável entre
  250 e 5000 ms. Esperar pela rede não consome CPU do Edge, mas mantém a Function viva e pode
  aumentar o compute faturado em caso de lentidão.
- A Function tem limite síncrono de **60 s**; o `waitUntil` do Edge continua sujeito ao limite de
  **50 ms de CPU** por requisição (o tempo de espera de rede não entra nesse CPU).
- A Function usa a região padrão **`cmh` (Ohio)**. O Neon de homologação está em
  **`aws-sa-east-1` (São Paulo)**. A seleção de região de Function é recurso **Pro/Enterprise**;
  no plano Free não é possível mover para `gru` (São Paulo).
- O pooling do Neon é PgBouncer em modo transação, adequado a Functions, mas o cold start do compute
  pode levar algumas centenas de milissegundos e se soma à distância física.
- Testes Node podem validar apenas a lógica pura (HMAC, timeout/abort, limites). **Não** comprovam
  CPU do Deno, comportamento de `waitUntil`, DNS/TLS, cold start, regiões ou o tempo real de uma
  chamada autenticada.
- Instrumentação proposta: contadores agregados por motivo de descarte e status HTTP, sem IP, UA
  bruto, cookie, `Referer`, query string ou caminho com dados pessoais.

---

## 6. Arquivos modificados nesta fase

- `netlify/edge-functions/html-capture.js`
- `netlify/edge-functions/_lib/edge-capture.mjs`
- `netlify/edge-functions/_lib/capture-policy.mjs`
- `netlify/edge-functions/_lib/capture-limits.mjs` (novo)
- `netlify/edge-functions/_lib/edge-env.mjs` (novo)
- `netlify/functions/_lib/capture-config.mjs`
- `.env.example`
- `package.json`
- `tests/analytics/capture-hardening.spec.mjs` (novo)
- `docs/analytics/fase-5f-1-1-investigacao.md` (novo)
- `docs/analytics/fase-4-implementacao.md`
- `docs/analytics/fase-4-decisoes.md`
- `docs/analytics/fase-4-homologacao.md`
- `README.md`

---

## 7. Testes executados e resultados

Comando:

```bash
npm run test:analytics
```

Resultado: **58 testes aprovados, 0 falhas**. As duas suítes de integração com PostgreSQL foram
**skipped** por ausência de `TEST_DATABASE_URL`/`ANALYTICS_TEST_DB`, como esperado. O benchmark local
de processamento puro reportou `p95=0.72ms`; isso **não** comprova o comportamento do Edge Runtime.

Também foram executados:

- `npm run build`: concluído; 162 HTML processados, 26 JS e 39 CSS versionados, sitemap com 159 URLs,
  Pagefind com 159 páginas.
- `npx playwright test tests/e2e/consent.spec.js`: **11/11 aprovados** (primeiro acesso, cookie antigo,
  aceitar, recusar, personalizar, retirar, DNT, GPC, Consent Mode, calculadora/afiliado, endpoint
  indisponível e mobile).
- Carregamento local do módulo `netlify/edge-functions/html-capture.js` com `Netlify.env.get` e
  `toObject()` lançando erro: respondeu `200` normalmente, confirmando que o handler não usa
  `toObject()`.

Cobertura nova relevante:

- allowlist impede `DATABASE_URL`, `CLEANUP_DATABASE_URL`, `MIGRATION_DATABASE_URL`,
  `RATE_LIMIT_HMAC_SECRET`, `EDGE_SECURITY_ENABLED` e variáveis desconhecidas;
- `toObject()` não é chamado;
- limite 8192 é único e não muda com `EDGE_CAPTURE_MAX_BODY_BYTES`;
- corpo de 8192 bytes passa, 8193 falha;
- timeout aborta o envio e retorna `false` sem lançar;
- HMAC inválido, timestamp passado/futuro/malformado, key-id desconhecido e nonce divergente são
  rejeitados antes de acessar o banco;
- flags desligadas respondem 204 sem banco;
- cookie com valores duplicados ou tipos inesperados não autoriza analytics.

Testes de integração reais (replay concorrente, rate limit concorrente, limite diário, roles,
persistência e limpeza) continuam existindo, mas exigem PostgreSQL de teste e não foram executados
nesta fase.

---

## 8. Riscos restantes

1. **P1 não pode ser removido sem mudar a arquitetura ou a visibilidade do site.** Em homologação
   privada, o caminho Edge → Function continuará falhando. Isso deve ser tratado na Fase 5F.2.
2. **Runtime real do Edge não validado:** CPU de 50 ms, comportamento de `waitUntil`, HMAC WebCrypto,
   `AbortSignal.timeout()` e classificação no Deno só podem ser confirmados em deploy.
3. **Latência `cmh` → `sa-east-1` + cold start do Neon:** o timeout de 2000 ms é hipótese. Funções
   novas e compute suspenso podem exceder esse valor. A configuração de região de Function é
   Pro/Enterprise; no Free, não é possível usar `gru`.
4. **Endpoint público (Alternativa B):** HMAC e limites reduzem abuso, mas não eliminam varredura,
   custo de web requests e tentativas inválidas. Rate limit e limite diário precisam estar corretos.
5. **Cookie de consentimento:** continua forjável e não é prova server-side. A escolha é aceitável
   para analytics de baixo risco, desde que a política de privacidade não o descreva como registro
   verificável.
6. **Segredos:** a allowlist reduz a exposição no Edge, mas `EDGE_INGEST_SECRET` continua disponível
   ao Edge por necessidade. Qualquer variável de escopo Functions configurada no site ainda fica
   disponível à Function; a minimização de escopo precisa ser operacional.
7. **Sem instrumentação real:** não há métrica de sucesso/falha da captura. A instrumentação proposta
   abaixo precisa ser temporária e sem PII.
8. **Imports compartilhados entre diretórios:** a Function importa
   `netlify/edge-functions/_lib/capture-limits.mjs` e `capture-policy.mjs`; esse padrão já existia antes
   desta fase, mas o empacotamento real de Functions/Edge não foi validado em deploy. Confirmar no
   primeiro deploy autorizado que os módulos compartilhados foram incluídos.

---

## 9. Recomendação arquitetural

**Recomendação: Alternativa B, com endpoint de ingestão público protegido por HMAC, em um alvo de
validação público; manter a homologação privada para os testes que não dependem de ingresso HTTP.**

Motivos:

- não depende de bypass de SSO nem de comportamento não documentado;
- preserva o isolamento das páginas de homologação quando o teste de ingresso é feito em um site
  público dedicado ou no projeto público de produção;
- usa o desenho e os controles já implementados (HMAC, timestamp, nonce, rate limit, limite diário,
  corpo máximo);
- é compatível com o plano Free;
- custo marginal é baixo no volume de validação.

Se for requisito absoluto manter **todo** teste em projeto privado, a única alternativa documentada
que não expõe endpoint público é a **Alternativa C (Blobs + Scheduled Function)**, com custo de
complexidade e operação maior. Ela não deve ser escolhida antes de medir a necessidade.

Alternativa A não deve ser usada: não há autenticação interna documentada para projeto privado.

### Instrumentação temporária proposta (não implementada)

Se autorizada na Fase 5F.2, registrar somente agregados sem PII, por exemplo:

- contador por motivo de descarte (`sem_consentimento`, `dnt_gpc`, `fora_da_amostra`,
  `payload_grande`, `erro_captura`, `envio_falhou`);
- contador de sucesso/falha do envio;
- tempo de parede do envio (sem URL/IP/UA/cookie);
- status HTTP da Function.

Não registrar IP, UA bruto, cookie, `Referer`, query string, caminho completo com dados ou qualquer
identificador de visitante. A instrumentação deve ser desligável e temporária.

---

## 10. Plano financeiro e operacional mínimo

### Custos oficiais usados

- Deploy de produção: **15 créditos** por deploy.
- Deploy Preview/branch deploy: **0 créditos**.
- Web requests: **2 créditos por 10.000** requests, incluindo Edge Functions e chamadas de Function.
- Compute de Function: **10 créditos por GB-hora** (1 GB padrão).
- Edge Functions **não** entram no compute; entram em web requests.
- Plano Free: **300 créditos/mês**, limite rígido.

### Cenário mínimo recomendado

1. **Fase 5F.2 local:** custo **0**.
2. **Validação em alvo público isolado** (site público de teste ou branch deploy público):
   - 1 deploy de produção do site de teste: **15 créditos** (ou 0 se branch deploy público).
   - Volume de teste: 50–200 requisições HTML + até 20 capturas reais.
   - Web requests: < 0,05 crédito.
   - Compute de Function: < 0,5 crédito.
   - Bandwidth: < 0,5 crédito.
   - Total estimado: **15–17 créditos**.
3. **Desligamento:** alteração de variável exige novo deploy. Se for feito em deploy de produção do
   site de teste: +15 créditos. Se for em branch deploy: 0.
4. **Pior caso planejado com margem:** **32 créditos** (2 deploys de produção + folga de 2).
5. **Limite de segurança:** não iniciar se o saldo disponível for menor que **110 créditos**; parar
   imediatamente se o consumo acumulado da fase chegar a **40 créditos**. Com 141,9, isso preserva
   mais de 100 créditos.

### Variáveis necessárias

- Site de validação público: `EDGE_CAPTURE_ENABLED`, `EDGE_ANALYTICS_ENABLED`,
  `EDGE_INGEST_SECRET` (32+ bytes), `EDGE_INGEST_KEY_ID`, `EDGE_ANALYTICS_SAMPLE_RATE`,
  `EDGE_CAPTURE_TIMEOUT_MS`, `EDGE_CAPTURE_MAX_EVENTS_DAY`, `EDGE_RATE_MAX`,
  `EDGE_RATE_WINDOW_SECONDS`, `EDGE_CAPTURE_TIMESTAMP_WINDOW_SECONDS`,
  `EDGE_CAPTURE_NONCE_TTL_SECONDS`.
- Function: `DATABASE_URL` (role `analytics_runtime`), `EDGE_INGEST_SECRET`,
  `EDGE_INGEST_KEY_ID` e limites acima. Corpo máximo é fixo em 8192.
- Homologação privada: manter as flags de captura em `false`; não usar esse site para o teste de
  ingresso HTTP.

### Sequência de habilitação e desligamento

1. Confirmar saldo e que produção/homologação não serão tocadas.
2. Preparar o alvo público de validação e o banco Neon de teste, com roles e migrations aplicadas.
3. Configurar as variáveis com as flags ainda `false`; publicar o código no alvo público.
4. Confirmar que a página entrega normalmente e que nenhuma captura ocorre.
5. Em um segundo deploy, definir as flags de captura como `true` e validar o fluxo.
6. Medir créditos, erros, latência, timeout e taxa de captura.
7. Definir as flags como `false` e publicar o desligamento.
8. Confirmar que nenhuma escrita nova ocorre e que a página continua estática.

### Estratégia para manter a homologação privada

- Não alterar a visibilidade do site de homologação.
- Fazer o teste de Edge → Function no alvo público; a homologação privada fica restrita a testes de
  entrega de página, consentimento, flags e comportamento de falha silenciosa.
- Se o teste precisar ocorrer obrigatoriamente em projeto privado, usar a Alternativa C (Blobs +
  Scheduled Function) ou aceitar que o caminho atual não será validado ponta a ponta. Não usar bypass
  de SSO.

### Critério para não ultrapassar o saldo

- Saldo mínimo para iniciar: **110 créditos**.
- Teto de consumo da fase: **40 créditos**.
- Máximo de **2 deploys de produção** no alvo de teste (ou 0 se branch deploy público).
- Nenhum deploy no site de produção real do portal e nenhuma alteração no site de homologação além
  do que for explicitamente autorizado.
- Verificar Usage & billing antes e depois de cada deploy.

---

## 11. Confirmação de que produção e homologação não foram alteradas

- Nenhum deploy foi executado.
- Nenhum build remoto foi executado.
- Nenhuma variável, secret, flag ou visibilidade foi alterada.
- Nenhum POST remoto ou execução remota de Edge/Scheduled Function foi feito.
- Nenhuma escrita, migration ou criação de role no Neon foi feita.
- Nenhum commit, push, PR ou merge foi feito.
- A alteração no Neon foi apenas leitura de metadados (`projects list`) para confirmar a região.
- Todas as mudanças são locais e estão listadas na seção 6.

A Fase 5F.2 **não** foi iniciada. Aguardar nova autorização.

# Portal das Contas Analytics - Plano da Fase 4

Status: **implementação local concluída; aguardando validação**. Sem push, PR, deploy, migração de produção ou ativação. A entrega está em [`fase-4-implementacao.md`](fase-4-implementacao.md); as decisões aprovadas em [`fase-4-decisoes.md`](fase-4-decisoes.md) e a LIA preliminar em [`fase-4-lia.md`](fase-4-lia.md).

## 1. Objetivo e princípios

Capturar requisições de documentos HTML públicos no edge, identificar automações e classificar tráfego em níveis de evidência, sem bloquear visitantes e sem alterar o HTML entregue.

Princípios:

- finalidade explícita e separada para analytics e segurança;
- coleta mínima e proporcional;
- nenhuma utilização da finalidade de segurança para contornar a recusa de analytics;
- nenhuma decisão automática de bloqueio, cobrança, acesso ou moderação;
- classificação como evidência, nunca como certeza;
- transparência, retenção curta e direitos do titular;
- nenhum segredo no navegador;
- nenhum impacto na entrega da página.

Fora do escopo: bloquear bots, CAPTCHA, desafios JavaScript, fingerprinting de dispositivo, compra de reputação de IP, alteração de GA4/AdSense, criação de perfis de visitantes, publicidade e Fase 5.

## 2. Duas finalidades separadas

### 2.1 Analytics

**Finalidade:** medir volume e comportamento agregado de visitantes e tráfego, respeitando as preferências da Fase 3.

- Só pode existir com sinal positivo de consentimento de analytics.
- O edge não lê `localStorage`; será necessário um sinal first-party legível no request, conforme a seção 3.
- Sem consentimento válido, não há evento, classificação ou agregado de analytics.
- DNT/GPC prevalecem sobre qualquer preferência salva.
- Não pode ser usado para publicidade, perfilamento individual ou decisões sobre pessoas.
- Dados de analytics não podem ser derivados de registros de segurança.

### 2.2 Segurança

**Finalidade:** prevenir abuso, automações maliciosas e proteger a infraestrutura, com coleta mínima e finalidade própria.

- A hipótese inicial é **legítimo interesse** (LGPD, art. 7º, IX), condicionada a avaliação de necessidade, proporcionalidade, salvaguardas e teste de legítimo interesse (art. 10). Não é um cheque em branco.
- A coleta de segurança só será ativada depois de avaliação jurídica/DPO e documentação da necessidade.
- O escopo inicial é limitado a eventos de alta confiança de automação/abuso; tráfego humano normal não gera registro bruto de segurança.
- Não pode ser usado para medir audiência, comportamento, funil, páginas mais vistas ou retenção.
- Não pode ser combinado com analytics para reconstruir a jornada do visitante.
- Não pode ser usado para publicidade ou treinamento de perfil.
- Não autoriza bloqueio automático; achados de segurança exigem revisão humana.
- Se o legítimo interesse não for aprovado, a finalidade de segurança não será implementada ou precisará de outra base legal específica.

### 2.3 Vedação de contorno

Para impedir que segurança vire analytics por outro nome:

- registros terão `purpose` obrigatório; na implementação local/atual apenas `analytics` é persistido, e `security` é bloqueado no banco;
- tabelas, permissões, consultas e retenção serão separadas por finalidade;
- não haverá junção entre eventos de segurança e eventos de analytics;
- dashboards de analytics não poderão consultar a tabela de segurança;
- dados de segurança serão usados apenas para detecção/investigação de abuso e proteção da infraestrutura;
- acessos serão auditados; consultas de segurança não poderão gerar métricas de audiência;
- se uma requisição gerar as duas finalidades, serão dois registros independentes, com bases e retenções próprias;
- recusar analytics não reduz a proteção da infraestrutura, mas também não cria permissão para medir o visitante.

## 3. Consentimento e LGPD

### 3.1 Base legal, necessidade e transparência

| Finalidade | Base legal considerada | Necessidade | Transparência | Limitações |
|---|---|---|---|---|
| Analytics | Consentimento (LGPD, art. 7º, I), conforme Fase 3 | Medir tráfego e comportamento agregado; somente após escolha positiva | Banner da Fase 3, Política de Privacidade e link de preferências | Sem consentimento não coleta; retirada interrompe o futuro; não usar para segurança nem publicidade |
| Segurança | Hipótese de legítimo interesse (LGPD, art. 7º, IX), sujeita ao art. 10 e à avaliação jurídica | Detectar abuso/automação maliciosa e proteger infraestrutura; mínimo necessário | Aviso específico na Política de Privacidade, finalidade, campos, retenção e direitos | Não é coleta irrestrita; não mede audiência; não bloqueia automaticamente; revisão humana |

A análise de legítimo interesse deverá registrar: necessidade da coleta, alternativas menos invasivas, expectativa do titular, salvaguardas, retenção, acesso e direitos. Até essa análise ser aprovada, a captura de segurança permanece desligada.

A Política de Privacidade, o aviso de segurança e o banner deverão ser atualizados antes de qualquer ativação. O titular deve conseguir entender o que é coletado, por quê, por quanto tempo e como exercer seus direitos.

### 3.2 Sinal de consentimento no edge

O edge não consegue ler o `localStorage` da Fase 3. Para que analytics no edge respeite a escolha:

- a Fase 3 deverá gravar um cookie first-party mínimo, por exemplo `pca_edge_consent`, contendo somente versão e a flag de analytics;
- o cookie não será um identificador de visitante, não conterá IDs, e-mail ou preferência de publicidade;
- atributos propostos: `Secure`, `SameSite=Lax`, `Path=/`, validade curta/média definida na revisão;
- o edge tratará cookie ausente, inválido ou versão desconhecida como **sem consentimento**;
- a retirada de analytics deverá apagar/atualizar o cookie;
- DNT/GPC sempre prevalecem e impedem analytics;
- o cookie é um sinal de escolha, não um mecanismo de rastreamento.

Essa ponte de consentimento é uma **decisão pendente** e exige alteração posterior na Fase 3. Enquanto não for aprovada e implementada, não haverá captura de analytics no edge.

Alternativa: se a ponte não for aprovada, a Fase 4 poderá ser somente de segurança, se o legítimo interesse for validado; nesse caso não haverá classificação de audiência nem métricas de visitantes.

### 3.3 DNT/GPC

- Analytics: não capturar, mesmo com cookie positivo.
- Segurança: DNT/GPC não serão usados para autorizar analytics. A eventual manutenção de registro mínimo de abuso será decidida na avaliação jurídica e limitada à finalidade de segurança.
- Nenhuma preferência será inferida a partir da localização, do User-Agent ou do tipo de navegador.

## 4. Retenção inicial

Limites iniciais propostos, sujeitos à aprovação:

| Dado | Retenção inicial |
|---|---|
| Requisições HTML brutas | **7 dias** |
| User-Agent bruto | **até 7 dias**, somente se necessário para auditoria/classificação |
| IP completo | **não persistir** |
| Hash temporário do IP | **até 24 horas** |
| Classificações agregadas | **90 dias** |
| Indicadores agregados | **13 meses** |

Regras:

- O hash do IP será usado somente em controle de frequência/abuso, em tabela separada, sem vínculo com o evento bruto; expira em 24 horas.
- O IP completo pode existir apenas na memória do edge durante a requisição; não pode ir para logs, payload, banco ou métricas.
- O UA bruto, se armazenado, será truncado, terá acesso restrito e será apagado em até 7 dias; fora isso, somente hash/família normalizada.
- Eventos brutos de analytics e segurança seguem o limite de 7 dias.
- Classificações agregadas por classe/família/página ficam limitadas a 90 dias.
- Indicadores agregados de longo prazo ficam limitados a 13 meses e não conterão UA, IP, hash, cookie ou identificador.
- Qualquer prazo diferente exige justificativa técnica, análise de necessidade, aprovação e atualização da Política de Privacidade antes da mudança.
- Limpeza será automatizada, testada e monitorada.

## 5. Escopo de captura

A captura inicial considera somente **documentos HTML públicos**:

- `/`, calculadoras, artigos e páginas institucionais públicas;
- URLs canônicas limpas e variantes `.html` equivalentes;
- resposta final `200` ou `304` com `Content-Type: text/html`;
- método `GET`; `HEAD` fica fora da v1;
- sem leitura do corpo da requisição ou da resposta.

Excluir explicitamente:

- CSS, JavaScript, imagens, fontes, ícones e source maps;
- PDFs e outros downloads;
- APIs, `/.netlify/*`, endpoints internos e administrativos;
- `sitemap.xml`, `robots.txt`, `ads.txt`, manifestos e arquivos de configuração;
- `/_*`, `pagefind`, assets versionados e arquivos com extensão estática;
- `busca`, `meus-calculos`, `obrigado`, páginas `noindex` e `404`, por minimização e por não serem conteúdo editorial;
- redirecionamentos e respostas que não sejam HTML documento;
- qualquer requisição com método diferente de `GET`.

A Edge Function deve aplicar allowlist de caminhos e validação de resposta; a lista de exclusão não pode depender apenas do `Accept`, pois automações podem omiti-lo.

## 6. Arquitetura e fluxo de dados

```text
GET HTML público
  -> Edge Function
       1. chama context.next() imediatamente
       2. lê apenas headers/contexto/metadados
       3. verifica escopo, DNT/GPC, consentimento de analytics e amostragem
       4. classifica localmente só o necessário para decidir a finalidade
       5. agenda envio sanitizado via context.waitUntil()
       6. devolve a resposta original sem alterar corpo/status/headers
  -> Function interna de ingestão
       -> valida HMAC, timestamp, nonce, tamanho e frequência
       -> normaliza e classifica com regras auditáveis
       -> grava registro bruto por finalidade (7 dias)
       -> atualiza agregados (90 dias) e indicadores (13 meses)
  -> Administração separada para consultas de segurança/analytics
```

### 6.1 Edge Function

- Arquivo futuro: `netlify/edge-functions/html-capture.ts` (Deno/TypeScript).
- `path: "/*"` com exclusões explícitas e verificação em runtime.
- `context.next()` é chamado antes de qualquer trabalho de rede ou banco; a resposta original é devolvida.
- Nenhum body de HTML é lido ou transformado; nenhum header é adicionado ao visitante.
- `context.waitUntil()` envia o evento depois da resposta.
- `context.ip` é usado apenas para HMAC de frequência em memória/curta duração.
- `context.geo.country.code` pode ser usado como sinal fraco/agregado; cidade, CEP, latitude e longitude não serão armazenados.
- `context.requestId` serve para idempotência/correlação.
- `onError: "bypass"` garante que falhas da função não impeçam a entrega estática.
- Limite de CPU da plataforma: 50 ms; orçamento interno proposto: até 20 ms p95.
- Nenhuma chamada síncrona ao backend no caminho crítico.
- Feature flags: `EDGE_CAPTURE_ENABLED=false`, `EDGE_ANALYTICS_ENABLED=false`, `EDGE_SECURITY_ENABLED=false`.
- A função pode ser publicada desligada; sem flags, não envia eventos.

### 6.2 Ingestão

- Nova função interna, separada de `/api/collect`, por exemplo `capture-html`.
- Não é endpoint público de leitura; não aceita CORS de navegador.
- Valida HMAC, timestamp, nonce, tamanho, finalidade e rate limit antes de gravar.
- Idempotência por `request_id`/nonce; replay não duplica.
- Falha do coletor é silenciosa para o visitante: timeout curto, uma tentativa, log sanitizado e descarte.
- Feature flags e amostragem também são verificadas no backend, não só no edge.
- Administração separada da ingestão, com autenticação própria e permissões de leitura distintas.

## 7. Dados e modelo proposto

Campos mínimos, por finalidade:

- `purpose` (`analytics`; `security` reservado e bloqueado na implementação local);
- `request_id`, `captured_at`, `method`, `path`, `status_code`;
- `country_code` (somente país, quando aprovado);
- o caminho detalhado só será usado em analytics com consentimento; segurança usará grupo de rota (`home`, `calculadora`, `artigo`, `institucional`), sem slug sensível;
- `accept_language` normalizado, `referrer_host` sem caminho/query;
- `ua_hash`, `ua_family`, `ua_version`; `ua_raw` opcional, truncado, 7 dias;
- `client_hints` e `fetch_metadata` normalizados;
- `traffic_class`, `bot_family`, `confidence`, `signals`, `classifier_version`;
- `is_bot`, `is_automation`, `is_preview`, `is_claimed_bot`.

Não capturar ou persistir:

- corpo de requisição/resposta;
- valores de calculadoras, resultados, formulários ou histórico local;
- query string completa, cookies (exceto o sinal de consentimento lido no edge), `Authorization`;
- e-mail, CPF, telefone ou qualquer identificador direto;
- IP completo, fingerprint TLS/dispositivo, coordenadas, cidade/CEP;
- `visitor_id`, `session_id` ou correlação com a Fase 3.

Schema futuro proposto, somente após aprovação:

- `html_events` para eventos brutos sanitizados, com `purpose` e retenção de 7 dias;
- `html_traffic_daily` para agregados de 90 dias;
- `html_indicators_monthly` para indicadores de 13 meses;
- `edge_rate_limits` para HMAC de IP/janela, 24 horas;
- índices por `captured_at`, `purpose`, `traffic_class`, `bot_family` e `path`;
- migrations `003_phase4_html_capture.sql`, `004_phase4_audit_fixes.sql` e `005_phase4_cleanup_role.sql` apenas em ambiente de teste até autorização;
- role de runtime separada, sem DDL e sem acesso a `schema_migrations`.

## 8. Segurança Edge -> backend

- HMAC-SHA256 sobre uma mensagem canônica versionada que inclui `key-id`, timestamp, nonce e os bytes exatos do corpo.
- Headers propostos: `x-pca-edge-timestamp`, `x-pca-edge-nonce`, `x-pca-edge-key-id`, `x-pca-edge-signature`.
- Janela de timestamp curta (por exemplo, ±60 segundos); nonce/request_id com TTL e registro de replay.
- Segredo exclusivo de produção `EDGE_INGEST_SECRET`, com pelo menos 32 bytes, separado de `RATE_LIMIT_HMAC_SECRET` e de segredos de preview.
- Rotação de segredo com `key-id`; segredo somente em variáveis de ambiente do edge/Function, nunca no navegador, no HTML ou no repositório.
- Backend valida antes de desserializar/processar: método, content-type, tamanho máximo, HMAC em tempo constante, timestamp, nonce, finalidade e rate limit.
- Limite de corpo proposto: 8 KB; uma tentativa; timeout de 750 ms; sem retry automático que possa amplificar carga.
- Limites de frequência por chave/edge e por HMAC de IP; excesso retorna `429`, payload inválido retorna `400/413`, autenticação inválida `401/403`.
- Ingestão pública e administração separadas: a ingestão não tem leitura pública; o painel administrativo usa autenticação e autorização próprias.
- O endpoint de ingestão não é divulgado como API pública e não usa CORS aberto.
- Nenhum segredo será exposto ao cliente; o cookie de consentimento contém apenas a escolha, não assinatura secreta.

## 9. Classificação de tráfego

Cinco classes mantidas:

- `likely_human`
- `likely_bot`
- `automation`
- `preview_or_monitoring`
- `unknown`

A classificação usa múltiplos sinais, com `confidence` e `signals`:

1. assinaturas explícitas de automação/headless no UA/cliente;
2. UA declarado de crawler conhecido, marcado como declarado e não verificado;
3. previews e monitores conhecidos;
4. inconsistências de `Accept`, `Sec-Fetch-*`, `Sec-CH-UA`, idioma, método e cliente;
5. sinais coerentes de navegação (`Accept` HTML, `Sec-Fetch-Mode: navigate`, `Sec-Fetch-Dest: document`, client hints).

Regras:

- localização e User-Agent isolados **não** definem a classe;
- `country_code` é sinal fraco e apenas agregado, nunca prova de automação;
- UA ausente ou genérico não é automaticamente bot;
- bots declarados não são verificados por IP/reverse DNS nesta fase;
- resultados representam níveis de evidência, não certeza;
- não há bloqueio, desafio, CAPTCHA, alteração de conteúdo ou decisão automática;
- `automation` de alta confiança pode gerar evento de segurança, mas ainda sem bloqueio;
- amostras serão revisadas manualmente para medir falsos positivos/negativos;
- versão do classificador e códigos de sinais serão auditáveis.

Limitações: `navigator.webdriver` não existe no request HTTP; Chromium headless pode se disfarçar; privacidade pode omitir headers; sem reputação de IP/TLS a detecção é limitada.

## 10. Performance, volume, armazenamento e custo

### Execução

- `context.next()` primeiro; nenhuma espera de rede antes da resposta.
- Nenhuma leitura de body; extração de headers/contexto apenas.
- `context.waitUntil()` para envio; falha do coletor não impede a página.
- Orçamento de CPU: até 20 ms p95 no edge, dentro do limite de 50 ms da plataforma.
- Payload máximo: 8 KB; timeout de ingestão: 750 ms; uma tentativa.
- Meta: nenhum aumento perceptível de TTFB; p95 adicional ≤20 ms e variação de TTFB ≤5%; CLS/LCP sem regressão.
- `onError: "bypass"` e captura de exceções garantem entrega estática mesmo com coletor indisponível.

### Amostragem inicial

- Analytics: **10%** determinístico das requisições HTML elegíveis, por hash de `request_id` + dia, somente com consentimento.
- Segurança: **100% dos eventos de alta confiança de automação/abuso**, com limite diário; tráfego humano normal não gera registro bruto de segurança.
- Edge é invocado para 100% dos HTML elegíveis; a amostragem reduz ingestão/armazenamento, não a invocação. O custo de invocação será medido antes de ampliar.
- Prefixos/flags: `EDGE_ANALYTICS_SAMPLE_RATE=0.10`, `EDGE_SECURITY_ENABLED=false` até aprovação legal.

### Limites iniciais propostos

- Até **25.000 eventos de analytics/dia**.
- Até **5.000 eventos de segurança/dia**.
- Até **250 MB** de dados brutos/índices no Neon; alertas em 70% e 85%.
- Ao atingir o limite: parar ingestão de analytics primeiro, manter a página intacta e registrar contador; nenhuma alteração de disponibilidade.
- Eventos brutos: 7 dias; agregados: 90 dias; indicadores: 13 meses; rate limit: 24 horas.
- Custos serão medidos em execução de sombra na preview por 7 dias: invocações edge, requisições de ingestão, bytes no banco, p95 de TTFB e erros. Expansão só com aprovação e dentro do plano gratuito atual; sem upgrade automático.

## 11. Plano de testes

- Classificador:
  - cinco classes e `confidence`;
  - Chrome/Safari/Firefox/Android/iOS;
  - Googlebot, Bingbot, SEO, social preview, monitor, AI crawlers;
  - HeadlessChrome, Playwright, Puppeteer, Selenium, curl, python-requests, node-fetch;
  - headers ausentes/inconsistentes;
  - garantia de que UA ou país isolados não determinam classe.
- Consentimento/LGPD:
  - sem cookie de analytics: nenhum evento de analytics;
  - cookie positivo: evento apenas com amostragem;
  - retirada: novos eventos param;
  - DNT/GPC: analytics bloqueado;
  - registros de segurança não aparecem em consultas/agregados de analytics;
  - nenhuma junção entre finalidades.
- Retenção:
  - IP completo ausente de payload/log/banco;
  - hash de IP expira em 24 horas;
  - bruto e UA bruto expiram em 7 dias;
  - agregados em 90 dias; indicadores em 13 meses;
  - limpeza idempotente e testada.
- Segurança:
  - HMAC válido/inválido, corpo alterado, timestamp expirado, replay, nonce repetido, key-id inválido;
  - limites de tamanho, content-type, método e frequência;
  - separação ingestão/administração;
  - ausência de segredo no bundle/navegador/repositório.
- Edge local (`netlify dev`):
  - HTML, status, headers e cache inalterados;
  - assets, PDFs, APIs, sitemap, robots e páginas excluídas ignoradas;
  - `context.next()` funciona com coletor indisponível;
  - `onError: bypass`;
  - overhead de TTFB dentro do orçamento.
- Performance/volume:
  - execução de sombra na preview;
  - p95, CPU, erros e volume;
  - projeção de armazenamento e custo.
- Validação manual:
  - amostra de classificações;
  - falsos positivos/negativos;
  - nenhuma ação de bloqueio.

## 12. Rollout e reversão

1. Aprovar base legal/LIA, ponte de consentimento, retenção, escopo, amostragem e orçamento.
2. Definir contrato de dados, schemas `003` a `005`, flags e ingestão; somente teste local.
3. Implementar classificador e testes unitários, atrás de flags desligadas.
4. Implementar Edge Function e validar em `netlify dev`, sem deploy de produção.
5. Publicar em preview com flags desligadas e depois com amostra mínima e banco de teste; executar sombra de 7 dias.
6. Revisar privacidade, custo, latência e qualidade; somente após aprovação ativar produção em modo observação.
7. Expandir a amostra gradualmente; nunca bloquear automaticamente.

Reversão:

- desligar `EDGE_CAPTURE_ENABLED`/flags de finalidade;
- remover a declaração da Edge Function em um deploy posterior, se necessário;
- manter a ingestão desligada e aguardar expiração da retenção;
- limpar dados brutos e agregados conforme política;
- reverter migration apenas em ambiente de teste;
- documentar incidente e impacto; nenhuma alteração no HTML público.

## 13. Decisões finais propostas

As decisões operacionais finais para aprovação estão documentadas em [`fase-4-decisoes.md`](fase-4-decisoes.md), incluindo cookie de consentimento, LIA, DNT/GPC, User-Agent, amostragem, confiança da classificação e performance. A avaliação preliminar de segurança está em [`fase-4-lia.md`](fase-4-lia.md).

A implementação continua não autorizada até a aprovação dessas decisões; a coleta de segurança permanece condicionada à validação jurídica.

Nenhuma implementação da Fase 4 foi iniciada.

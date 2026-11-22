# Portal das Contas Analytics - Fase 3

Status: consentimento, Consent Mode v2, coletor no navegador, privacidade e testes implementados **localmente**. Sem push, PR, deploy, migração de produção ou ativação de `ANALYTICS_INGEST_ENABLED`.

## Escopo

- Banner de consentimento com categorias independentes: **Analytics** e **Publicidade**.
- Google Consent Mode v2 com os quatro sinais inicialmente negados.
- Coletor próprio para pageview, sessão, engajamento, calculadora e clique afiliado.
- DNT/GPC, reabertura de preferências e retirada de consentimento.
- Atualização da Política de Privacidade e injeção no build.

Fora do escopo: Fase 4, painel, relatórios, ativação em produção, rastreamento de cliques/impressões do AdSense e mudanças nos links de afiliado.

## Arquivos

- `js/analytics.js`: consentimento, banner, IDs, Consent Mode update, eventos e envio para `/api/collect`.
- `css/analytics.css`: banner, painel e link de preferências.
- `scripts/apply-analytics.js`: injeção idempotente do bloco de consentimento, CSS e JS em todos os HTMLs.
- `paginas/privacidade.html`: seção de analytics, publicidade, Consent Mode, DNT/GPC, escolhas e retenção.
- `tests/e2e/consent.spec.js`: 10 testes de consentimento e coleta.
- `package.json`: `analytics:apply` e inclusão do passo antes de `build:assets`.

## Consentimento

- Chave versionada: `pca_consent_v1`, versão `2026-11`.
- Formato: `analytics` booleano, `ads` booleano, `version`, `updatedAt`.
- O banner oferece **Aceitar tudo**, **Recusar opções não essenciais** e **Personalizar**.
- Analytics e publicidade são escolhas separadas. Aceitar analytics não libera anúncios personalizados.
- O link **Preferências de privacidade** é inserido no rodapé e reabre o banner.
- Retirar analytics remove `pca_vid` (localStorage), `pca_sid` (sessionStorage) e a sessão ativa.
- DNT ou GPC desativam analytics e publicidade personalizada, limpam IDs locais e mostram aviso sem opções de aceite.
- As caixas do modo Personalizar nunca começam pré-marcadas sem escolha salva.
- O banner não bloqueia a navegação, usa posição fixa, tem `role="dialog"`, título associado, foco devolvido ao gatilho/footer e não cria deslocamento de layout.

## Consent Mode v2

O build injeta, antes da primeira tag Google e antes do GA4/AdSense quando existem:

```js
gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
});
```

Depois da escolha, `js/analytics.js` envia `consent.update`:

- `analytics_storage`: escolha de Analytics.
- `ad_storage`, `ad_user_data`, `ad_personalization`: escolha de Publicidade.

O Consent Mode avançado pode enviar sinais sem cookies antes da escolha, sem identificar o usuário. O coletor próprio só envia eventos depois do consentimento de analytics.

## GA4, AdSense e eventos

- Nenhuma tag GA4 ou AdSense nova é criada pelo coletor.
- Páginas que já têm GA4 continuam com uma única tag; o bloco de consentimento fica antes dela.
- Páginas que já têm AdSense mantêm a tag existente; com publicidade negada, o Google recebe os sinais negados e anúncios limitados/contextuais podem aparecer.
- Eventos próprios aceitos: `pageview`, `session_start`, `session_end`, `engagement`, `calculator_start`, `calculator_complete` e `affiliate_click`.
- `calculator_start` envia apenas o nome da calculadora; `calculator_complete` usa apenas `args[0]` do `window.salvarCalculo`.
- Valores digitados e resultados nunca são enviados.
- `affiliate_click` envia produto, categoria, slot e host de destino; não envia URL completa e não altera `href`, `rel` ou `target`.
- Nenhum evento de clique/impressão do AdSense é adicionado.

## Build

O `npm run build` executa `scripts/apply-analytics.js` depois de limpar `dist/`/`pagefind` e antes de `build:assets`.

O bloco é removido e reinserido de forma idempotente. O build-assets versiona `js/analytics.js` e `css/analytics.css` e reescreve as referências com hash. O bloco é inserido antes da primeira tag Google (ou antes de `</head>` quando não há tags).

Estado atual do coletor: **3070 bytes gzip** no arquivo minificado (inclui a ponte de consentimento `pca_edge_consent` da Fase 4).

## Testes

```bash
npm test
npx playwright test tests/e2e/consent.spec.js
npm run test:analytics
```

Cobertura da Fase 3:

- Primeiro acesso nega os quatro sinais, não cria IDs e não envia eventos.
- Aceitar tudo libera analytics/publicidade, atualiza o Consent Mode, cria IDs e envia pageview sem valores.
- Recusar mantém tudo negado e sem envios.
- Personalizar separa as categorias e a retirada de analytics limpa os IDs e não gera novos eventos após inputs/cliques.
- DNT e GPC separados.
- Consent Mode antes do GA4 e sem duplicação de tags.
- Calculadora e afiliado sem valores, resultados ou URL completa.
- Endpoint indisponível não quebra a página.
- Banner em viewport móvel sem overflow horizontal.

Resultados locais: 10/10 testes de consentimento, 48/48 testes existentes e 28/28 testes de analytics do backend.

## Lighthouse local

Execução móvel local contra `dist/` (Chromium 1248, 9 de novembro de 2026):

- Performance: 84
- Acessibilidade: 96
- Boas práticas: 77
- SEO: 100
- LCP: 2,1 s
- CLS: 0
- TBT: 510 ms

As falhas restantes de acessibilidade são de links/trechos existentes do rodapé e de conteúdo, não do banner; o link de preferências foi ajustado para contraste. Boas práticas é impactado por cookies de terceiros/AdSense já existentes e por avisos do inspetor do Chromium. Nenhuma tag de terceiros nova foi adicionada.

## Privacidade e retenção

A Política de Privacidade foi atualizada para explicar:

- analytics próprio pseudônimo e sem valores/resultados;
- IP completo não armazenado no analytics próprio; HMAC temporário no rate limit;
- GA4/AdSense e Consent Mode;
- categorias independentes, DNT/GPC, reabertura e retirada;
- retirada interrompe a coleta futura e apaga IDs locais, sem apagar automaticamente eventos anteriores;
- canal para exercer acesso, correção ou exclusão, com prazo de resposta;
- IDs locais e armazenamento da escolha;
- retenção pelo período necessário, dados agregados e retenção curta do rate limit;
- processamento por Netlify Functions e PostgreSQL na Neon.

## Rollout

- `ANALYTICS_INGEST_ENABLED=false` permanece.
- Não executar migração de produção, deploy, push ou PR nesta fase.
- A ativação do endpoint, a auditoria de produção e o Lighthouse de produção ficam para a validação/autorização seguinte.
- Não iniciar a Fase 4.

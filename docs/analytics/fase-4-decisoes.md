# Decisões finais propostas - Fase 4

Status: **decisões aprovadas e implementação local concluída**. Segurança continua desligada e não há produção. A entrega local está documentada em [`fase-4-implementacao.md`](fase-4-implementacao.md).

## 1. Ponte de consentimento

Cookie first-party proposto:

- Nome: `pca_edge_consent`.
- Conteúdo mínimo, sem identificador: `v=2026-11&analytics=1&ads=0` (URL-encoded).
- O edge lê apenas a flag `analytics`; a flag `ads` fica registrada como preferência, mas não é usada pela Fase 4.
- Sem cookie, cookie inválido, versão desconhecida ou `analytics=0`: **nenhum evento de analytics**.
- Criado/atualizado somente após escolha explícita na Fase 3.
- Atributos: `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=15552000` (180 dias), sem `Domain` (host-only).
- Não será `HttpOnly`, pois é escrito pelo JavaScript da Fase 3; não contém segredo, sessão, ID ou token de autenticação.
- Em recusa ou retirada: flags zeradas ou cookie removido; DNT/GPC prevalecem e bloqueiam analytics.
- O edge nunca cria o cookie, não o usa para segurança e trata qualquer adulteração como escolha do próprio usuário, não como credencial.
- O cookie é **declarado pelo cliente** e pode ser forjado. Ele sinaliza a preferência para a captura, mas **não comprova consentimento no servidor**. A validade jurídica continua dependendo do registro local da Fase 3 e da política de privacidade; não há assinatura server-side nesta fase porque a necessidade não foi demonstrada. Parâmetros duplicados invalidam o cookie.
- A implementação da Fase 3 só será alterada depois da aprovação deste modelo, em etapa separada.

## 2. LIA e segurança

- A LIA preliminar está em `docs/analytics/fase-4-lia.md`.
- Conclusão: legítimo interesse é hipótese plausível, mas a coleta persistente de segurança permanece desligada até validação jurídica/DPO, documentação de lacuna nos controles existentes e atualização da política.
- `EDGE_SECURITY_ENABLED=false` até aprovação jurídica.
- Segurança nunca poderá ser usada para analytics, audiência, publicidade, perfil ou para contornar recusa de analytics.
- Dados de segurança, se autorizados, serão de alta confiança, com grupo de rota em vez de caminho detalhado, sem UA bruto, sem IP completo, sem cookies/IDs e sem junção com analytics.
- Se a necessidade não for demonstrada ou o jurídico não validar, não haverá coleta de segurança na Fase 4.

## 3. DNT/GPC

- Analytics: DNT (`DNT: 1`) e GPC (`Sec-GPC: 1`) sempre bloqueiam, mesmo com cookie positivo.
- Segurança: finalidade independente, condicionada à LIA e à validação jurídica; não autoriza analytics e não contorna a recusa.
- Se o jurídico determinar que DNT/GPC também impedem a coleta de segurança, `EDGE_SECURITY_ENABLED` será efetivamente desligado para esses sinais.
- A política de privacidade explicará a distinção e o canal de direitos.

## 4. User-Agent

- Prioridade para campos normalizados: família, versão, hash, client hints e metadados de navegação.
- **Não armazenar User-Agent bruto por padrão.**
- Se for tecnicamente indispensável para investigar falso positivo/negativo, será necessária justificativa prévia, aprovação e tratamento restrito, com truncamento e retenção máxima de 7 dias.
- UA bruto não será usado na coleta de segurança por padrão.

## 5. Amostragem e relatórios

- Analytics: **10%** inicial, determinístico por hash de `request_id` + dia UTC.
- Todo registro guardará `sample_rate=0.10`, `sampling_method` e `is_estimate`.
- Relatórios separarão:
  - **observado:** requisições efetivamente capturadas;
  - **estimado:** observado dividido pela taxa, marcado como estimativa.
- Não apresentar requisições HTML como visitantes únicos, sessões ou pessoas. Não há `visitor_id`/`session_id`.
- Segurança, se autorizada, registrará 100% dos eventos de alta confiança, com `sample_rate=1.0` e limite diário; não haverá extrapolação de segurança. Amostrar segurança reduziria a capacidade de detectar abuso e exigiria aprovação específica.
- A amostragem de analytics é a taxa inicial de teste; expansão somente após avaliação de custo, volume e qualidade, com nova aprovação.

## 6. Classificação e confiança

Cinco classes mantidas:

- `likely_human`
- `likely_bot`
- `automation`
- `preview_or_monitoring`
- `unknown`

Critérios testáveis:

### Ordem de prioridade

Quando mais de uma classe tiver evidência mínima, a prioridade é:

1. `automation`
2. `preview_or_monitoring`
3. `likely_bot`
4. `likely_human`
5. `unknown`

`unknown` vence quando nenhuma classe atinge a evidência mínima, quando os sinais são insuficientes ou quando há conflito forte entre bot declarado e navegação humana. País não entra como sinal de classe; no máximo indicador agregado.

### Contribuição dos sinais

Famílias independentes: `ua`, `accept`, `fetch`, `client_hints` e `language`. Sinais da mesma família não contam como duas evidências independentes.

| Código | Família | Força | Favorece |
|---|---|---|---|
| `ua_automation` | UA | forte | `automation` |
| `ua_preview` | UA | forte | `preview_or_monitoring` |
| `ua_declared_bot` | UA | forte | `likely_bot` |
| `ua_browser` | UA | média | `likely_human` |
| `ua_unknown_client` | UA | média | bot/unknown |
| `ua_absent` | UA | média | bot/unknown |
| `accept_html` | Accept | média | `likely_human` |
| `accept_non_html` | Accept | média | bot/automation |
| `fetch_navigate` | Fetch | forte | `likely_human` |
| `fetch_document` | Fetch | média | `likely_human` |
| `fetch_site_present` | Fetch | fraca | `likely_human` |
| `missing_fetch` | Fetch | média | bot/automation |
| `client_hints` | Client hints | média | `likely_human` |
| `missing_client_hints` | Client hints | fraca | bot/unknown |
| `language_present` | Language | fraca | `likely_human` |
| `conflict_claimed_bot_human` | especial | conflito | `unknown` |

### Evidência mínima

| Classe | Evidência mínima | Faixa de confiança |
|---|---|---|
| `automation` | `ua_automation` + ao menos um sinal corroborante de outra família | 80-95 |
| `preview_or_monitoring` | `ua_preview` + ao menos um sinal corroborante de outra família | 80-95 |
| `likely_bot` | `ua_declared_bot` + ao menos um sinal corroborante de outra família; não verificado por IP | 60-84 |
| `likely_human` | `ua_browser` + ao menos um sinal independente de navegação (`accept_html`, `fetch_*`, `client_hints` ou `language_present`) | 55-80 |
| `unknown` | Evidência insuficiente, sinal isolado ou conflito | 0-54 |

- Para classe diferente de `unknown`, são exigidos **ao menos dois sinais independentes**; um único sinal forte isolado permanece `unknown`.
- `ua_declared_bot` + navegação humana forte (`fetch_navigate` e `accept_html`, por exemplo) gera `conflict_claimed_bot_human` e classe `unknown`; não se presume que o UA declarado seja verdadeiro.
- `automation` e `preview_or_monitoring` têm prioridade sobre classes menos específicas; `unknown` é o padrão.
- `ua_unknown_client` nunca é convertido em `ua_browser`; `SomeClient/1.0` com `Accept: text/html` permanece `unknown`.

### Cálculo da confiança

`confidence` é nível de evidência, não probabilidade estatística calibrada. Ele é calculado pela quantidade de **famílias independentes** que sustentam a classe:

- `automation`/`preview_or_monitoring`: 2 famílias = 80; 3 = 85; 4 = 90; 5 = 95.
- `likely_bot`: 2 = 60; 3 = 70; 4 = 80; 5 = 84.
- `likely_human`: 2 = 55; 3 = 65; 4 = 72; 5 = 80.
- `unknown`: sem sinal = 0; sinal isolado/insuficiente = 35; conflito = 25; nunca acima de 54.

Esses valores e fixtures são versionados com `classifier_version`; qualquer mudança exige testes. Evento de segurança de alta confiança exige classe `automation`, `likely_bot` ou `preview_or_monitoring`, confiança ≥80 e ao menos dois sinais; ainda sem bloqueio, desafio ou decisão automatizada.

Cada registro guardará `confidence`, `signals` e `classifier_version`. Nenhuma classe bloqueia, desafia ou altera a página; segurança exige revisão humana.

## 7. Performance e falha

- `context.next()` é chamado imediatamente, antes de qualquer rede, HMAC ou banco.
- A assinatura HMAC cobre uma mensagem canônica versionada com `key-id`, `timestamp`, `nonce` e corpo exato; alterar qualquer um desses campos invalida a assinatura. O Edge só considera sucesso HTTP `202` da Function.
- A resposta original é devolvida sem leitura/alteração do corpo.
- O envio usa `context.waitUntil()`; a falha do coletor é capturada e silenciosa.
- `onError: "bypass"` garante a entrega estática se a função falhar.
- Orçamento: até 20 ms p95 de overhead no edge, dentro do limite de 50 ms da plataforma; payload máximo único de 8 KB (8192 bytes), compartilhado por Edge e Function; timeout de ingestão padrão de 2000 ms, configurável entre 250 e 5000 ms por `EDGE_CAPTURE_TIMEOUT_MS`; uma tentativa, sem retry que amplifique carga. O timeout de 2000 ms é hipótese para a distância `cmh` → `sa-east-1` e cold start do Neon, a validar no runtime real.
- A indisponibilidade da coleta nunca impede `context.next()` nem a entrega da página.

## 8. Aprovação

A aprovação deste pacote autoriza apenas:

- planejar e, depois de nova confirmação, implementar localmente;
- criar protótipo/testes locais;
- manter flags desligadas por padrão.

Continuam proibidos sem autorização expressa:

- push ou PR;
- deploy;
- migração em produção;
- ativação de coleta em produção;
- alterações fora do escopo aprovado.

A implementação da segurança continua condicionada à LIA/validação jurídica. A implementação de analytics continua condicionada ao cookie de consentimento aprovado.

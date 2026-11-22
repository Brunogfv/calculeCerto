# LIA preliminar - finalidade de segurança da Fase 4

Status: **avaliação técnica preliminar para validação jurídica/DPO**. Não é parecer jurídico e não autoriza ativação. A coleta persistente de segurança permanece desligada.

## 1. Contexto

- Controlador: Portal das Contas.
- Operadores envolvidos: Netlify (edge/functions/hospedagem) e Neon (PostgreSQL).
- Titulares: visitantes de páginas HTML públicas.
- Finalidade: prevenir abuso, automação maliciosa e incidentes que afetem disponibilidade, integridade e segurança da infraestrutura.
- Finalidade excluída: analytics, audiência, publicidade, perfilamento, decisões de acesso e bloqueio automático.

Esta LIA avalia apenas a hipótese de **legítimo interesse** (LGPD, Lei 13.709/2018, art. 7º, IX), observado o art. 10. Qualquer outra base legal ou finalidade exige nova avaliação.

## 2. Dados considerados

Para a finalidade de segurança, a proposta é registrar somente eventos de **alta confiança** de automação/abuso, com o mínimo necessário:

- data/hora, método, status HTTP e grupo de rota (`home`, `calculadora`, `artigo`, `institucional`);
- família/versão normalizada do User-Agent e hash;
- `client_hints` e `fetch_metadata` normalizados;
- classificação, confiança, códigos de sinais e versão do classificador;
- hash HMAC do IP somente em controle de frequência, por até 24 horas, em tabela separada e sem vínculo com o evento;
- HMAC de IP para rate limit, sem IP completo.

Não registrar:

- IP completo, cidade, CEP, latitude/longitude;
- User-Agent bruto por padrão;
- URL completa, query string, caminho detalhado de artigos/calculadoras, referrer completo, cookies, `Authorization`;
- corpo de requisição/resposta, valores ou resultados de calculadoras;
- identificador de visitante/sessão, e-mail, CPF, telefone ou qualquer identificador direto;
- dados de analytics, publicidade ou perfil comportamental.

O caminho detalhado é excluído da segurança porque páginas de saúde e finanças podem revelar interesses sensíveis. O grupo de rota permite investigar abuso sem reconstruir a jornada do visitante.

## 3. Necessidade e alternativas

A necessidade deve ser demonstrada antes da ativação:

- verificar se logs da Netlify, WAF, rate limits, métricas de disponibilidade e alertas de infraestrutura já cobrem o risco;
- verificar se o volume de automação maliciosa justifica um classificador próprio;
- comparar com alternativas menos invasivas: bloqueio de taxa, limites de origem, regras de UA, desafios apenas em abuso comprovado e monitoramento agregado;
- se as alternativas existentes forem suficientes, **não implementar** a captura de segurança da Fase 4.

A coleta proposta é limitada a eventos de alta confiança; tráfego humano normal não gera registro bruto de segurança. Não há coleta irrestrita de todas as requisições para “ter dados”.

## 4. Teste de legítimo interesse

| Elemento | Avaliação preliminar |
|---|---|
| Interesse | Proteger disponibilidade, integridade e segurança da infraestrutura; interesse legítimo e concreto |
| Necessidade | Somente se houver lacuna documentada nos controles atuais; dados mínimos, alta confiança, retenção curta |
| Proporcionalidade | Sem IP completo, sem UA bruto, sem caminho detalhado, sem cookies/IDs, sem perfil, sem bloqueio automático |
| Expectativa do titular | Visitantes esperam proteção contra abuso; a coleta é limitada, transparente e não os transforma em perfis |
| Salvaguardas | HMAC de IP por 24h, acesso restrito, finalidade separada, sem junção com analytics, retenção curta, auditoria, direitos |
| Riscos | Reidentificação por UA/client hints; inferência de interesse por página; falsos positivos de automação |
| Mitigações | UA normalizado/hash, sem UA bruto por padrão, grupo de rota em vez de caminho, sem IP completo, sem ID, retenção curta, revisão humana, sem ação automática |
| Risco residual | Moderado enquanto houver UA/client hints e HMAC; aceitável somente se a necessidade for comprovada e o jurídico validar |

A localização e o User-Agent isolados não serão usados para classificar pessoas. A classificação será evidência, não certeza, e não produzirá decisão automatizada.

## 5. DNT/GPC

- Analytics: DNT/GPC sempre bloqueiam, mesmo com consentimento.
- Segurança: DNT/GPC não autorizam analytics e não serão usados para contornar a recusa. A manutenção de registro mínimo de segurança, se estritamente necessária, será decidida pelo jurídico e limitada à finalidade de segurança.
- Se a validação jurídica concluir que DNT/GPC devem impedir também a coleta de segurança, a coleta de segurança será desativada para esses sinais.
- A Política de Privacidade explicará a distinção e o canal de direitos.

## 6. Transparência e direitos

Antes de qualquer ativação:

- atualizar a Política de Privacidade com finalidade de segurança, campos, retenção, base legal, operadores, transferência internacional e direitos;
- disponibilizar aviso claro e acessível sobre a distinção entre analytics e segurança;
- manter canal de contato em `/paginas/contato` e prazo de resposta;
- garantir acesso, correção, exclusão e informação sobre compartilhamento;
- documentar a LIA, a revisão jurídica e a aprovação interna.

## 7. Retenção e segurança

- Eventos brutos de segurança: até 7 dias.
- UA bruto: não armazenar por padrão; se indispensável, justificativa prévia, truncamento, acesso restrito e até 7 dias.
- IP completo: não persistir.
- Hash HMAC do IP: até 24 horas, em rate limit separado.
- Classificações agregadas: 90 dias.
- Indicadores agregados: 13 meses.
- Sem junção com analytics; acesso separado; sem uso para publicidade, medição de audiência ou treinamento de perfil.
- Segredos e credenciais fora do navegador; HMAC, rate limit, auditoria e revisão humana.

## 8. Conclusão preliminar

A hipótese de legítimo interesse é **plausível em tese**, mas a necessidade só se confirma se houver lacuna documentada nos controles de segurança existentes. A recomendação é:

- manter `EDGE_SECURITY_ENABLED=false`;
- não implementar coleta persistente de segurança antes da validação jurídica/DPO e da atualização da política;
- se validada, limitar a eventos de alta confiança, com os campos e retenções acima;
- se não validada, não coletar segurança nesta fase.

Esta conclusão não substitui parecer jurídico nem autoriza tratamento em produção.

## 9. Revisão

Revisar esta LIA anualmente, antes de ampliar campos/volume, após incidente relevante ou mudança de fornecedor/finalidade. Nova finalidade exige nova avaliação.

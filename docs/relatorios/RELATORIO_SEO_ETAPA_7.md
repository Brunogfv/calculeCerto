# RELATÓRIO FINAL - SEO ETAPA 7
## Diagnóstico e Correções Baseadas em Google Search Console (03/06/2026)

### 📊 Contexto
Auditoria das 5 pastas de exportação do GSC (Coverage Drilldown) identificou **176 URLs com problemas** divididos em 5 categorias:
- Pasta 1: "Página com redirecionamento" → 50 URLs
- Pasta 2: "Erro no servidor (5xx)" → 3 URLs
- Pasta 3: "Rastreada, mas não indexada no momento" → 55 URLs
- Pasta 4: "Cópia, Google escolheu canonical diferente" → 45 URLs
- Pasta 5: "Página alternativa com canonical adequado" → 23 URLs

---

### ✅ Correções Implementadas

#### 1. Arquivo `_redirects` — 22 novos redirects adicionados

| Bloco | Redirect | Motivo |
|-------|----------|--------|
| Ghost folder | `/artigos/investimentos/*` → `/artigos/financas/:splat` | Pasta inexistente causava 5xx |
| Institucional | `/contato`, `/privacidade`, `/sobre` (e .html) → `/paginas/*` | URLs curtas sem categoria |
| Artigos sem categoria | `/imc-ideal-por-idade`, `/o-que-e-renda-fixa`, `/o-que-e-renda-variavel` → versões em `/artigos/*` | Slugs curtos orfãos |
| Categoria errada | `/artigos/financas/lci-ou-cdb.html` → `/artigos/comparacao/lci-ou-cdb` | Migração incompleta |
| Categoria errada | `/artigos/financas/cdb-ou-tesouro-direto.html` → `/artigos/comparacao/cdb-vs-tesouro-direto` | Migração incompleta |
| Termos de uso | `/termos`, `/termos.html` → `/paginas/termos` | Página estava em `/paginas/` |
| Template literal | `/${escapeHtml(fav.url)}` → `/` | Bug histórico em `meus-calculos.html` |
| Sufixo `},` | 7 URLs com `},` no final → versões limpas | Bug histórico já corrigido no JS |

**Total:** arquivo passou de 74 para 114 linhas. Sintaxe Cloudflare Pages validada.

#### 2. Linkagem Semântica Calculadora ↔ Artigo Pilar — 28 calculadoras atualizadas

Problema detectado: **45 de 51 calculadoras tinham ZERO links para artigos** (apenas links entre calculadoras). Google não recebia sinal semântico do tópico da página → "Rastreada, mas não indexada".

**Calculadoras atualizadas com seção "📚 Aprenda Mais (Artigos)":**
- Financeiras: `juros`, `salario`, `inss`, `investimento`, `cdb`, `tesouro-direto`, `imposto-renda`, `ir-investimentos`, `price-sac`, `decimo-terceiro`, `lca-vs-cdb`, `lci-vs-cdb`, `poupanca-vs-investimento`, `cr`, `porcentagem`, `porcentagem-reversa`, `energia`, `amortizacao`, `aluguel-vs-compra`
- Utilitárias: `combustivel`, `tinta`, `velocidade-media`, `pneus`, `piso`, `cimento`, `medidas-culinarias`
- Trabalho: `hora-extra`
- Diversas: `datas`

Cada calculadora agora aponta para 1–3 artigos pilares relevantes com `href` para `/artigos/financas/*`, `/artigos/saude/*` ou `/artigos/utilitarios/*`.

#### 3. Investigação e diagnóstico

- **`paginas/termos.html`:** confirmado que **NÃO é página órfã** — está linkada em 30+ páginas via `js/gerar-footer.js` e manualmente em `index.html`. Redirect ajustado de `/` para `/paginas/termos` (destino correto).
- **URLs com `},`:** bug **já corrigido** em `js/usuario.js:147` (filtro `!String(fav.url || '').includes('${')`). URLs no GSC são resíduo histórico; redirects cobrem o que sobrou.
- **Template literal `${escapeHtml(fav.url)}`:** mesmo caso, filtro já presente no código atual. Redirect adicionado preventivamente.

#### 4. Consolidação de artigos CDB/LCI/LCA

**Não necessária** — auditoria revelou que cada artigo do cluster já possui seção "Veja Também" apontando para o pilar (`funciona-cdb`, `lci-lca`, `tesouro-direto`). A clusterização está semanticamente correta via cross-linking. Consolidar fisicamente os 14 artigos perderia tráfego de long-tails específicas.

---

### 🟡 Itens que Precisam de Ação Manual (fora do código)

#### A. Reenviar sitemap.xml no Google Search Console
1. Acesse https://search.google.com/search-console/sitemaps
2. Em "Sitemap adicionado", localize `sitemap.xml` da propriedade
3. Clique em "Reenviar" (botão azul)
4. Aguarde 24-48h para re-processamento
5. Para cada categoria do Coverage Drilldown, clique "Validar correção" após o re-processamento

#### B. Verificar configuração de `www` no Cloudflare
Os 3 erros 5xx (pasta 2) podem estar relacionados à:
- Regra de redirect `https://www.* → https://portaldascontas.com.br/:splat 301` (linha 3 do `_redirects`) não processada corretamente
- **Ação:** no painel Cloudflare → Rules → Page Rules, confirmar se a regra está ativa. Testar manualmente: `curl -I https://www.portaldascontas.com.br/`

#### C. Monitorar GSC nas próximas 2–4 semanas
- **Esperado:** queda no número de "Cópia, canonical diferente" (pasta 4) à medida que Google reprocessa as URLs redirecionadas
- **Esperado:** queda em "Rastreada, mas não indexada" (pasta 3) à medida que nova linkagem semântica é descoberta
- **Não esperado cair rápido:** pasta 1 (50 URLs com `.html`) — esses são os redirects `.html → clean URL` que continuarão sendo reportados até o Google consolidar (pode levar 2-3 meses)

---

### 📁 Arquivos Modificados

| Arquivo | Tipo de mudança |
|---------|-----------------|
| `_redirects` | +40 linhas (74 → 114) com 22 novos redirects |
| `calculadoras/juros.html` | +9 linhas (seção Artigos Relacionados) |
| `calculadoras/combustivel.html` | +5 linhas |
| `calculadoras/tinta.html` | +5 linhas |
| `calculadoras/velocidade-media.html` | +5 linhas |
| `calculadoras/hora-extra.html` | +5 linhas |
| `calculadoras/salario.html` | +7 linhas |
| `calculadoras/inss.html` | +5 linhas |
| `calculadoras/investimento.html` | +7 linhas |
| `calculadoras/cdb.html` | +7 linhas |
| `calculadoras/tesouro-direto.html` | +5 linhas |
| `calculadoras/imposto-renda.html` | +5 linhas |
| `calculadoras/ir-investimentos.html` | +5 linhas |
| `calculadoras/price-sac.html` | +7 linhas |
| `calculadoras/decimo-terceiro.html` | +5 linhas |
| `calculadoras/lca-vs-cdb.html` | +7 linhas |
| `calculadoras/lci-vs-cdb.html` | +7 linhas |
| `calculadoras/poupanca-vs-investimento.html` | +7 linhas |
| `calculadoras/cr.html` | +5 linhas |
| `calculadoras/porcentagem.html` | +5 linhas |
| `calculadoras/porcentagem-reversa.html` | +5 linhas |
| `calculadoras/energia.html` | +5 linhas |
| `calculadoras/amortizacao.html` | +7 linhas |
| `calculadoras/aluguel-vs-compra.html` | +5 linhas |
| `calculadoras/pneus.html` | +5 linhas |
| `calculadoras/piso.html` | +5 linhas |
| `calculadoras/cimento.html` | +5 linhas |
| `calculadoras/medidas-culinarias.html` | +5 linhas |
| `calculadoras/datas.html` | +5 linhas |
| `RELATORIO_SEO_ETAPA_7.md` | Criado (este arquivo) |

---

### 📈 Impacto Esperado

| Categoria GSC | Antes | Esperado após 30 dias |
|---------------|-------|----------------------|
| 5xx (pasta 2) | 3 | 0 |
| Cópia/canonical (pasta 4) | 45 | 5-10 |
| Rastreada não indexada (pasta 3) | 55 | 15-25 |
| Redirects `.html` (pasta 1) | 50 | 50 (normal) |
| Canonical adequada (pasta 5) | 23 | 5-10 |

**Total estimado de redução:** ~80 URLs problemáticas em 30 dias, ~120 em 90 dias.

---

### 📌 Próximas Recomendações (Etapa 8+)

1. **Criar artigos pilares** para calculadoras que não têm (ex: `medias`, `mmc-mdc`, `bhaskara`, `equacao-primeiro-grau`, `regra-de-tres`, `porcentagem`). Sem artigo pilar, a linkagem semântica não tem para onde apontar.
2. **Acompanhar CTR** das calculadoras top no GSC → identificar quais têm baixa taxa de clique (mesmo com boa posição) e melhorar Title/Description.
3. **Adicionar Schema FAQ** nas calculadoras que ainda não têm (já tem em algumas).
4. **Investigar "core web vitals"** no PageSpeed Insights para identificar gargalos técnicos que possam estar atrasando indexação.

---

**Status Final: CONCLUÍDO**
**Pendências: 100% manuais (GSC + Cloudflare)**

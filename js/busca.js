/**
 * Lógica da Página de Busca - Portal das Contas
 * Carrega o Pagefind e exibe os resultados baseados no parâmetro ?q=
 */

// Função para extrair parâmetros da URL
function getQuery() {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

async function carregarResultados() {
    const query = getQuery();
    const titleEl = document.getElementById('search-title');
    const listEl = document.getElementById('results-list');
    const countEl = document.getElementById('search-count');
    const noResultsEl = document.getElementById('no-results');

    if (!query) {
        titleEl.textContent = 'O que você está procurando?';
        listEl.innerHTML = '';
        noResultsEl.style.display = 'block';
        return;
    }

    titleEl.textContent = `Resultados para: "${query}"`;

    try {
        const siteBasePath = (() => {
            try {
                const url = new URL(import.meta.url);
                // `.../js/busca.js` -> `.../`
                return url.pathname.replace(/\/js\/busca\.js$/, '/');
            } catch {
                return '/';
            }
        })();

        const resolveSiteUrl = (url) => {
            if (!url) return '';
            if (url.startsWith('http://') || url.startsWith('https://')) return url;
            const normalizedBase = siteBasePath.endsWith('/') ? siteBasePath : `${siteBasePath}/`;
            if (url.startsWith('/')) {
                if (normalizedBase !== '/' && !url.startsWith(normalizedBase)) {
                    return normalizedBase.replace(/\/$/, '') + url;
                }
                return url;
            }
            return normalizedBase + url;
        };

        const pagefindUrl = new URL('../pagefind/pagefind.js', import.meta.url);
        const pagefind = await import(pagefindUrl.href);
        
        // Executar a busca
        const search = await pagefind.search(query);
        const results = search.results;

        listEl.innerHTML = '';

        if (results.length === 0) {
            noResultsEl.style.display = 'block';
            countEl.textContent = 'Nenhum resultado encontrado.';
            return;
        }

        countEl.textContent = `${results.length} ${results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`;

        // Renderizar cada resultado
        for (const result of results) {
            const data = await result.data();
            
            const card = document.createElement('a');
            card.className = 'search-result-item';
            card.href = resolveSiteUrl(data.url);
            
            // Tenta identificar a categoria pela URL
            let categoria = 'Geral';
            if (data.url.includes('/calculadoras/')) categoria = 'Calculadora';
            if (data.url.includes('/artigos/')) categoria = 'Artigo';

            card.innerHTML = `
                <div class="result-meta">
                    <span class="result-category">${categoria}</span>
                </div>
                <h3>${data.meta.title || 'Sem título'}</h3>
                <p>${data.excerpt || 'Clique para ver mais informações sobre este conteúdo.'}</p>
            `;
            
            listEl.appendChild(card);
        }

    } catch (e) {
        console.error('Erro ao processar busca:', e);
        listEl.innerHTML = '<p>Ocorreu um erro ao carregar os resultados. Por favor, tente novamente.</p>';
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarResultados);

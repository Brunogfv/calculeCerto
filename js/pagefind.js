// --- LÓGICA DA BUSCA (PAGEFIND) ---
const searchInput = document.getElementById('site-search');
const searchResultsBox = document.getElementById('search-results-list');

const siteBasePath = (() => {
    try {
        const url = new URL(import.meta.url);
        // `.../js/pagefind.js` -> `.../`
        return url.pathname.replace(/\/js\/pagefind\.js$/, '/');
    } catch {
        return '/';
    }
})();

const pagefindModuleUrl = new URL('../pagefind/pagefind.js', import.meta.url).href;
let pagefindModulePromise;

function resolveSiteUrl(url) {
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
}

async function getPagefind() {
    if (!pagefindModulePromise) {
        pagefindModulePromise = import(pagefindModuleUrl);
    }
    return pagefindModulePromise;
}

async function performSearch(query) {
    if (!searchResultsBox) return;

    searchResultsBox.innerHTML = '';

    if (!query || query.length < 1) {
        searchResultsBox.classList.remove('active');
        return;
    }

    try {
        const pagefind = await getPagefind();
        const results = await pagefind.search(query);

        if (results.results.length > 0) {
            for (const result of results.results) {
                const data = await result.data();
                let url = data.url || result.url;

                if (!url) continue;

                url = resolveSiteUrl(url);

                const div = document.createElement('a');
                div.className = 'search-item';
                div.href = url;

                let title = "Página sem título";
                if (data.meta && data.meta.title) {
                    title = data.meta.title;
                } else {
                    const urlParts = url.split('/');
                    let fileName = urlParts[urlParts.length - 1] || "Home";
                    fileName = fileName.replace('.html', '').replace(/-/g, ' ');
                    title = fileName.charAt(0).toUpperCase() + fileName.slice(1);
                }

                const excerpt = data.excerpt || "Clique para acessar esta página.";

                div.innerHTML = `
                    <span class="search-category">Resultado</span>
                    <h4>${title}</h4>
                    <p>${excerpt}</p>
                `;
                searchResultsBox.appendChild(div);
            }
            searchResultsBox.classList.add('active');
        } else {
            searchResultsBox.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
            searchResultsBox.classList.add('active');
        }
    } catch (error) {
        console.error("Erro na busca:", error);
        if (searchResultsBox) {
            searchResultsBox.innerHTML = '<div class="no-results">Erro ao buscar.</div>';
            searchResultsBox.classList.add('active');
        }
    }
}

// --- EVENTOS GLOBAIS (Só rodam se os elementos existirem) ---
window.addEventListener('DOMContentLoaded', () => {

    // Configura Busca
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', function (e) {
            clearTimeout(debounceTimer);
            const term = e.target.value;
            debounceTimer = setTimeout(() => {
                performSearch(term);
            }, 300);
        });
    }

    // Fechar busca ao clicar fora
    document.addEventListener('click', function (e) {
        if (searchInput && searchResultsBox &&
            !searchInput.contains(e.target) && !searchResultsBox.contains(e.target)) {
            searchResultsBox.classList.remove('active');
        }
    });

});

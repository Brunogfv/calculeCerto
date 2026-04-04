/**
 * Portal das Contas - SEO Helper Script
 * Gerencia a canonicalização dinâmica e o controle de indexação (robots).
 */

(function () {
    const PREFERRED_DOMAIN = "portaldascontas.com.br";
    const PROTOCOL = "https://";

    function updateCanonical() {
        // Remove barras duplicadas, 'www.', query strings e fragmentos
        let path = window.location.pathname;

        // Garante que o path termina em .html se não for a raiz
        if (path !== "/" && !path.endsWith(".html")) {
            // Se o path termina em barra, remove e tenta ver se é diretório ou arquivo
            path = path.replace(/\/$/, "");
            if (path && !path.endsWith(".html")) {
                path += ".html";
            }
        }

        // Se for a home (/index.html), canonicaliza para /
        if (path === "/index.html") {
            path = "/";
        }

        const canonicalUrl = `${PROTOCOL}${PREFERRED_DOMAIN}${path}`;

        // Verifica se já existe a tag canonical
        let canonicalTag = document.querySelector('link[rel="canonical"]');
        if (!canonicalTag) {
            canonicalTag = document.createElement('link');
            canonicalTag.rel = 'canonical';
            document.head.appendChild(canonicalTag);
        }
        canonicalTag.href = canonicalUrl;
    }

    function updateRobots() {
        const isSearchPage = window.location.pathname.includes('busca.html');
        const hasSearchParams = window.location.search.includes('?q=') || window.location.search.includes('&q=');

        if (isSearchPage || hasSearchParams) {
            let robotsTag = document.querySelector('meta[name="robots"]');
            if (!robotsTag) {
                robotsTag = document.createElement('meta');
                robotsTag.name = 'robots';
                document.head.appendChild(robotsTag);
            }
            robotsTag.content = 'noindex, follow';
        }
    }

    // Executa as melhorias assim que o script carregar
    updateCanonical();
    updateRobots();
    
    // Opcional: Redirecionamento de WWW para Não-WWW (Segurança extra caso o Cloudflare não esteja configurado)
    if (window.location.hostname.startsWith('www.')) {
        const newUrl = window.location.href.replace('www.', '');
        window.location.replace(newUrl);
    }
})();

/**
 * Portal das Contas - SEO helper
 * Mantem canonical e robots coerentes mesmo quando uma URL legada e acessada.
 */

(function () {
    const DOMAIN = "https://portaldascontas.com.br";

    function cleanPath(pathname) {
        let path = pathname || "/";

        path = path.replace(/\/{2,}/g, "/");
        path = path.replace(/[},]+$/g, "");
        path = path.replace(/\/calculadoras\/calculadoras\//g, "/calculadoras/");
        path = path.replace(/^\/artigos\/[^/]+\/calculadoras\/([^/]+?)(?:\.html)?$/, "/calculadoras/$1");
        path = path.replace(/^\/calculadoras\/calc-juros$/i, "/calculadoras/juros");
        path = path.replace(/^\/calc-juros$/i, "/calculadoras/juros");

        if (path === "/index.html") return "/";
        if (path.endsWith("/index.html")) path = path.slice(0, -11) || "/";
        if (path.endsWith(".html")) path = path.slice(0, -5) || "/";
        if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);

        return path || "/";
    }

    function ensureCanonical() {
        const canonicalUrl = `${DOMAIN}${cleanPath(window.location.pathname)}`;
        let tag = document.querySelector('link[rel="canonical"]');
        if (!tag) {
            tag = document.createElement("link");
            tag.rel = "canonical";
            document.head.appendChild(tag);
        }
        tag.href = canonicalUrl;
    }

    function ensureRobots() {
        const clean = cleanPath(window.location.pathname);
        const isSearchPage = clean === "/busca" || clean === "/busca.html";
        const isInternalPage = clean === "/meus-calculos" || clean === "/meus-calculos.html";
        const hasSearchParams = new URLSearchParams(window.location.search).has("q");
        const content = isSearchPage || isInternalPage || hasSearchParams ? "noindex, follow" : "index, follow";

        let tag = document.querySelector('meta[name="robots"]');
        if (!tag) {
            tag = document.createElement("meta");
            tag.name = "robots";
            document.head.appendChild(tag);
        }
        tag.content = content;
    }

    ensureCanonical();
    ensureRobots();

    if (window.location.hostname.startsWith("www.")) {
        window.location.replace(window.location.href.replace("://www.", "://"));
    }
})();

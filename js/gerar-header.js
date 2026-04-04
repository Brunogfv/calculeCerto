// gerar-header.js (ESM)
// Injeta o header (e overlay do menu mobile) em todas as paginas.
// Nao depende de caminhos absolutos: resolve tudo a partir do proprio script.

const SITE_BASE_URL = new URL('../', import.meta.url); // .../<base>/
const SITE_BASE_PATH = SITE_BASE_URL.pathname; // .../<base>/

function sitePath(relPath) {
    const clean = String(relPath || '').replace(/^\/+/, '');
    // Mantem o site funcionando quando hospedado em subpasta (ex: GitHub Pages).
    return SITE_BASE_PATH + clean;
}

function siteUrl(relPath) {
    const clean = String(relPath || '').replace(/^\/+/, '');
    return new URL(clean, SITE_BASE_URL).toString();
}

function ensureOverlay() {
    let overlay = document.querySelector('.overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'overlay';
        document.body.prepend(overlay);
    }

    // Garante que clicar fora fecha o menu. Prevê disparos duplos se houver onclick no HTML.
    overlay.onclick = () => {
        if (typeof window.toggleMenu === 'function') window.toggleMenu();
    };

    return overlay;
}

function buildHeaderHTML() {
    const href = sitePath;

    // Evita problemas de encoding usando HTML entities nos acentos/simbolos.
    return `
<header class="header topo">
    <div class="header-container">
        <div class="logo">
            <a href="${href('index.html')}">
                <svg style="width:24px;height:24px;margin-right:8px;fill:currentColor" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
                </svg>
                Portal das Contas
            </a>
        </div>

        <button class="mobile-menu-btn" onclick="toggleMenu()" aria-label="Abrir menu">&#9776;</button>

        <nav class="menu" id="nav-menu">
            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Finan&ccedil;as &amp; Trabalho</a>
                <div class="dropdown-menu columns-2">
                    <a href="${href('calculadoras/juros.html')}" onclick="toggleMenu()">Juros &amp; Investimentos</a>
                    <a href="${href('calculadoras/calc-investimento.html')}" onclick="toggleMenu()">Simulador de Investimentos</a>
                    <a href="${href('calculadoras/calc-inflacao.html')}" onclick="toggleMenu()">Infla&ccedil;&atilde;o (IPCA/IGP-M)</a>
                    <a href="${href('calculadoras/calc-poupanca-vs-investimento.html')}" onclick="toggleMenu()">Poupan&ccedil;a vs Investimentos</a>
                    <a href="${href('calculadoras/inss.html')}" onclick="toggleMenu()">INSS</a>
                    <a href="${href('calculadoras/salario.html')}" onclick="toggleMenu()">Sal&aacute;rio L&iacute;quido</a>
                    <a href="${href('calculadoras/decimo-terceiro.html')}" onclick="toggleMenu()">13&ordm; Sal&aacute;rio</a>
                    <a href="${href('calculadoras/pj-vs-clt.html')}" onclick="toggleMenu()">PJ vs CLT (Qual é Melhor?)</a>
                    <a href="${href('calculadoras/hora-extra.html')}" onclick="toggleMenu()">Hora Extra</a>
                    <a href="${href('calculadoras/porcentagem.html')}" onclick="toggleMenu()">Porcentagem</a>
                    <a href="${href('calculadoras/porcentagem-reversa.html')}" onclick="toggleMenu()">Porcentagem Reversa</a>
                    <a href="${href('calculadoras/calc-cdb.html')}" onclick="toggleMenu()">CDB &amp; Renda Fixa</a>
                    <a href="${href('calculadoras/calc-lca-vs-cdb.html')}" onclick="toggleMenu()">LCA vs CDB</a>
                    <a href="${href('calculadoras/calc-lci-vs-cdb.html')}" onclick="toggleMenu()">LCI vs CDB</a>
                    <a href="${href('calculadoras/calc-ir-investimentos.html')}" onclick="toggleMenu()">IR Investimentos</a>
                    <a href="${href('calculadoras/calc-tesouro-direto.html')}" onclick="toggleMenu()">Tesouro Direto</a>
                    <a href="${href('calculadoras/calc-price-sac.html')}" onclick="toggleMenu()">Price e SAC</a>
                    <a href="${href('calculadoras/calc-imposto-renda.html')}" onclick="toggleMenu()">Imposto de Renda</a>
                    <a href="${href('calculadoras/dividendos.html')}" onclick="toggleMenu()">Dividendos (FIIs)</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Sa&uacute;de &amp; Pets</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/imc.html')}" onclick="toggleMenu()">IMC (Peso Ideal)</a>
                    <a href="${href('calculadoras/tmb.html')}" onclick="toggleMenu()">Metabolismo (TMB)</a>
                    <a href="${href('calculadoras/tdee.html')}" onclick="toggleMenu()">Gasto Cal&oacute;rico (TDEE)</a>
                    <a href="${href('calculadoras/gasto-calorico.html')}" onclick="toggleMenu()">Queima de Exerc&iacute;cios</a>
                    <a href="${href('calculadoras/agua.html')}" onclick="toggleMenu()">&Aacute;gua Di&aacute;ria</a>
                    <a href="${href('calculadoras/pet-idade.html')}" onclick="toggleMenu()">Idade Pet (Nova!)</a>
                    <a href="${href('calculadoras/parto.html')}" onclick="toggleMenu()">Data de Parto</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Im&oacute;veis &amp; Reforma</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/tinta.html')}" onclick="toggleMenu()">Pintura (Tinta)</a>
                    <a href="${href('calculadoras/piso.html')}" onclick="toggleMenu()">Piso &amp; Azulejo</a>
                    <a href="${href('calculadoras/cimento.html')}" onclick="toggleMenu()">Cimento &amp; Obra</a>
                    <a href="${href('calculadoras/aluguel-vs-compra.html')}" onclick="toggleMenu()">Aluguel vs Compra (Novo!)</a>
                    <a href="${href('calculadoras/amortizacao.html')}" onclick="toggleMenu()">Amortiza&ccedil;&atilde;o (Novo!)</a>
                    <a href="${href('calculadoras/energia.html')}" onclick="toggleMenu()">Consumo de Energia</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Educa&ccedil;&atilde;o &amp; Ci&ecirc;ncia</a>
                <div class="dropdown-menu columns-2">
                    <a href="${href('calculadoras/medias.html')}" onclick="toggleMenu()">M&eacute;dias Escolares</a>
                    <a href="${href('calculadoras/media-final.html')}" onclick="toggleMenu()">Nota para Passar (M&eacute;dia)</a>
                    <a href="${href('calculadoras/cr.html')}" onclick="toggleMenu()">Coeficiente (CR)</a>
                    <a href="${href('calculadoras/regra-de-tres.html')}" onclick="toggleMenu()">Regra de Tr&ecirc;s</a>
                    <a href="${href('calculadoras/bhaskara.html')}" onclick="toggleMenu()">Bhaskara &amp; Fun&ccedil;&otilde;es</a>
                    <a href="${href('calculadoras/equacao-primeiro-grau.html')}" onclick="toggleMenu()">Equa&ccedil;&atilde;o 1&ordm; Grau</a>
                    <a href="${href('calculadoras/mmc-mdc.html')}" onclick="toggleMenu()">MMC e MDC</a>
                    <a href="${href('calculadoras/conversor-unidades.html')}" onclick="toggleMenu()">Conversor de Medidas</a>
                    <a href="${href('calculadoras/velocidade-media.html')}" onclick="toggleMenu()">Velocidade M&eacute;dia</a>
                    <a href="${href('calculadoras/forca.html')}" onclick="toggleMenu()">For&ccedil;a (F=ma)</a>
                    <a href="${href('calculadoras/kmh-ms.html')}" onclick="toggleMenu()">km/h para m/s</a>
                    <a href="${href('calculadoras/temperatura.html')}" onclick="toggleMenu()">Temperaturas</a>
                    <a href="${href('calculadoras/datas.html')}" onclick="toggleMenu()">Diferen&ccedil;a de Datas</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Estilo de Vida</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/combustivel.html')}" onclick="toggleMenu()">Combust&iacute;vel</a>
                    <a href="${href('calculadoras/pneus.html')}" onclick="toggleMenu()">Pneus &amp; Aro</a>
                    <a href="${href('calculadoras/churrasco.html')}" onclick="toggleMenu()">Calculador de Churrasco</a>
                    <a href="${href('calculadoras/festa.html')}" onclick="toggleMenu()">C&aacute;lculo de Festa</a>
                    <a href="${href('calculadoras/pizza.html')}" onclick="toggleMenu()">Comparador de Pizza</a>
                    <a href="${href('calculadoras/medidas-culinarias.html')}" onclick="toggleMenu()">Cozinha (Medidas)</a>
                </div>
            </div>

            <a href="${href('artigos/index.html')}" onclick="toggleMenu()">Aprenda</a>

            <a href="${href('paginas/sobre.html')}" onclick="toggleMenu()">Sobre</a>
            <a href="${href('paginas/contato.html')}" onclick="toggleMenu()">Contato</a>
            <a href="${href('meus-calculos.html')}" onclick="toggleMenu()" style="display:flex;align-items:center;gap:4px">&#128203; Meus C&aacute;lculos</a>
        </nav>

        <div class="search-wrapper">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" class="search-input" id="site-search" placeholder="Busque..." autocomplete="off">
            <div class="search-results" id="search-results-list"></div>
        </div>

        <button class="toggle-theme" onclick="alternarTema()" aria-label="Alternar tema">
            <span id="theme-icon">&#127769;</span>
        </button>
    </div>
</header>
`.trim();
}

function injectGlobalScripts() {
    const sc = document.createElement('script');
    sc.src = siteUrl('js/utils-calculadoras.js');
    document.head.appendChild(sc);

    // Carrega o sistema de usuário (histórico e favoritos)
    const scUsuario = document.createElement('script');
    scUsuario.src = siteUrl('js/usuario.js');
    document.head.appendChild(scUsuario);

    // Carrega o inicializador automático de favoritos
    const scAutoFav = document.createElement('script');
    scAutoFav.src = siteUrl('js/favoritos-auto.js');
    document.head.appendChild(scAutoFav);

    // [SEO] Carrega o auxiliar de SEO (Canonical, Robots, etc)
    const scSeo = document.createElement('script');
    scSeo.src = siteUrl('js/seo-helper.js');
    document.head.appendChild(scSeo);
}

function injectHeader() {
    injectGlobalScripts();
    const headerHTML = buildHeaderHTML();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = headerHTML;
    const newHeader = wrapper.firstElementChild;
    if (!newHeader) return;

    const placeholder = document.getElementById('header-container');
    const existing = document.querySelector('header.header.topo');

    if (existing) {
        existing.replaceWith(newHeader);
        return;
    }

    if (placeholder) {
        placeholder.replaceWith(newHeader);
        return;
    }

    // Fallback: injeta no topo do body, depois do overlay se existir.
    const first = document.body.firstElementChild;
    if (first && first.classList.contains('overlay')) {
        document.body.insertBefore(newHeader, first.nextSibling);
    } else {
        document.body.prepend(newHeader);
    }
}

// --- MENU MOBILE ---
window.toggleMenu = function () {
    const menu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.overlay');

    if (menu) menu.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
};

// --- DROPDOWN MOBILE ---
window.toggleMobileDropdown = function (element) {
    if (window.innerWidth <= 1250) {
        const menu = element && element.nextElementSibling;
        if (menu) menu.classList.toggle('mobile-open');
    }
};

// --- TEMA ---
function inicializarTema() {
    const icon = document.getElementById('theme-icon');
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        if (icon) icon.textContent = '\u2600\uFE0F';
    } else {
        body.setAttribute('data-theme', 'light');
        if (icon) icon.textContent = '\uD83C\uDF19';
    }
}

window.alternarTema = function () {
    const body = document.body;
    const icon = document.getElementById('theme-icon');
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    if (icon) icon.textContent = newTheme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F';
};

// --- BUSCA (PAGEFIND) ---
let pagefindSearch = null;

function resolveResultUrl(rawUrl) {
    if (!rawUrl) return null;
    const url = String(rawUrl);

    if (/^https?:\/\//i.test(url)) return url;

    // Pagefind costuma devolver caminhos com / no inicio; em hospedagem em subpasta isso quebra.
    const clean = url.replace(/^\/+/, '');
    return siteUrl(clean);
}

async function carregarEIniciarBusca() {
    const searchInput = document.getElementById('site-search');
    const resultsList = document.getElementById('search-results-list');

    if (!searchInput || !resultsList) return;

    try {
        const pagefind = await import(siteUrl('pagefind/pagefind.js'));
        pagefindSearch = pagefind.search;
        ativarBusca(searchInput, resultsList);
    } catch (error) {
        console.error('Falha ao carregar Pagefind:', error);
        searchInput.placeholder = 'Busca indisponivel';
    }
}

function configurarRedirecionamento() {
    const input = document.getElementById('site-search');
    if (!input) {
        console.warn('Input de busca nao encontrado para configurar redirecionamento');
        return;
    }

    console.log('Configurando redirecionamento de busca...');
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const query = input.value.trim();
            console.log('Enter pressionado. Busca:', query);
            if (query) {
                const target = sitePath(`busca.html?q=${encodeURIComponent(query)}`);
                console.log('Redirecionando para:', target);
                window.location.href = target;
            }
        }
    });
}

function ativarBusca(input, container) {
    let debounceTimer;

    input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const query = e.target.value.trim();

        debounceTimer = setTimeout(async () => {
            container.innerHTML = '';

            if (!query || query.length < 1) {
                container.classList.remove('active');
                return;
            }

            try {
                const results = await pagefindSearch(query);

                if (results.results.length > 0) {
                    for (const result of results.results) {
                        const data = await result.data();
                        const resolvedUrl = resolveResultUrl(data.url || result.url);
                        if (!resolvedUrl) continue;

                        const title = (data.meta && data.meta.title) ? data.meta.title : 'Resultado';
                        const excerpt = data.excerpt || 'Clique para acessar esta pagina.';

                        const link = document.createElement('a');
                        link.className = 'search-item';
                        link.href = resolvedUrl;
                        link.innerHTML = `
<span class="search-category">Resultado</span>
<h4>${title}</h4>
<p>${excerpt}</p>
`.trim();
                        container.appendChild(link);
                    }
                    container.classList.add('active');
                } else {
                    container.innerHTML = '<div class="no-results">Nenhum resultado encontrado.</div>';
                    container.classList.add('active');
                }
            } catch (error) {
                console.error('Erro na busca Pagefind:', error);
                container.innerHTML = '<div class="no-results">Erro ao buscar.</div>';
                container.classList.add('active');
            }
        }, 300);
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !container.contains(e.target)) {
            container.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    ensureOverlay();
    injectHeader();
    inicializarTema();
    configurarRedirecionamento();
    carregarEIniciarBusca();
});

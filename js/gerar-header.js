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

    // Garante que clicar fora fecha o menu.
    overlay.addEventListener('click', () => {
        if (typeof window.toggleMenu === 'function') window.toggleMenu();
    });

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
            <a href="${href('index.html')}" onclick="toggleMenu()">In&iacute;cio</a>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Finan&ccedil;as</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/juros.html')}" onclick="toggleMenu()">Juros</a>
                    <a href="${href('calculadoras/inss.html')}" onclick="toggleMenu()">INSS</a>
                    <a href="${href('calculadoras/decimo-terceiro.html')}" onclick="toggleMenu()">13&ordm; Sal&aacute;rio</a>
                    <a href="${href('calculadoras/porcentagem.html')}" onclick="toggleMenu()">Porcentagem</a>
                    <a href="${href('calculadoras/porcentagem-reversa.html')}" onclick="toggleMenu()">Porcentagem Reversa</a>
                    <a href="${href('calculadoras/salario.html')}" onclick="toggleMenu()">Conversor de Sal&aacute;rio</a>
                    <a href="${href('calculadoras/hora-extra.html')}" onclick="toggleMenu()">Hora Extra</a>
                    <a href="${href('calculadoras/calc-investimento.html')}" onclick="toggleMenu()">Investimentos</a>
                    <a href="${href('calculadoras/dividendos.html')}" onclick="toggleMenu()">Dividendos</a>
                    <a href="${href('calculadoras/calc-inflacao.html')}" onclick="toggleMenu()">Infla&ccedil;&atilde;o</a>
                    <a href="${href('calculadoras/calc-cdb.html')}" onclick="toggleMenu()">CDB</a>
                    <a href="${href('calculadoras/calc-ir-investimentos.html')}" onclick="toggleMenu()">IR Investimentos</a>
                    <a href="${href('calculadoras/calc-tesouro-direto.html')}" onclick="toggleMenu()">Tesouro Direto</a>
                    <a href="${href('calculadoras/calc-price-sac.html')}" onclick="toggleMenu()">Price e SAC</a>
                    <a href="${href('calculadoras/calc-poupanca-vs-investimento.html')}" onclick="toggleMenu()">Poupan&ccedil;a vs. Outros</a>
                    <a href="${href('calculadoras/calc-imposto-renda.html')}" onclick="toggleMenu()">Imposto de Renda</a>
                    <a href="${href('calculadoras/calc-lca-vs-cdb.html')}" onclick="toggleMenu()">LCA vs CDB</a>
                    <a href="${href('calculadoras/calc-lci-vs-cdb.html')}" onclick="toggleMenu()">LCI vs CDB</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Sa&uacute;de</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/imc.html')}" onclick="toggleMenu()">IMC</a>
                    <a href="${href('calculadoras/tmb.html')}" onclick="toggleMenu()">TMB</a>
                    <a href="${href('calculadoras/agua.html')}" onclick="toggleMenu()">&Aacute;gua</a>
                    <a href="${href('calculadoras/gasto-calorico.html')}" onclick="toggleMenu()">Gasto Cal&oacute;rico</a>
                    <a href="${href('calculadoras/tdee.html')}" onclick="toggleMenu()">TDEE</a>
                    <a href="${href('calculadoras/parto.html')}" onclick="toggleMenu()">Data de Parto</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Auto</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/combustivel.html')}" onclick="toggleMenu()">Combust&iacute;vel</a>
                    <a href="${href('calculadoras/pneus.html')}" onclick="toggleMenu()">Troca de Pneus/Aro</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Educa&ccedil;&atilde;o</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/medias.html')}" onclick="toggleMenu()">M&eacute;dia Escolar</a>
                    <a href="${href('calculadoras/media-final.html')}" onclick="toggleMenu()">Nota para Passar</a>
                    <a href="${href('calculadoras/cr.html')}" onclick="toggleMenu()">CR Universit&aacute;rio</a>
                    <a href="${href('calculadoras/mmc-mdc.html')}" onclick="toggleMenu()">MMC e MDC</a>
                    <a href="${href('calculadoras/equacao-primeiro-grau.html')}" onclick="toggleMenu()">Equa&ccedil;&atilde;o 1&ordm; Grau</a>
                    <a href="${href('calculadoras/bhaskara.html')}" onclick="toggleMenu()">Bhaskara (2&ordm; Grau)</a>
                    <a href="${href('calculadoras/forca.html')}" onclick="toggleMenu()">For&ccedil;a (F&iacute;sica)</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Casa &amp; Reforma</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/tinta.html')}" onclick="toggleMenu()">Calculadora de Tinta</a>
                    <a href="${href('calculadoras/piso.html')}" onclick="toggleMenu()">Calculadora de Piso</a>
                    <a href="${href('calculadoras/cimento.html')}" onclick="toggleMenu()">Calculadora de Cimento</a>
                    <a href="${href('calculadoras/medidas-culinarias.html')}" onclick="toggleMenu()">Medidas Culin&aacute;rias</a>
                    <a href="${href('calculadoras/churrasco.html')}" onclick="toggleMenu()">Churrasco</a>
                    <a href="${href('calculadoras/pizza.html')}" onclick="toggleMenu()">Comparador de Pizza</a>
                    <a href="${href('calculadoras/energia.html')}" onclick="toggleMenu()">Consumo de Energia</a>
                    <a href="${href('calculadoras/festa.html')}" onclick="toggleMenu()">Calculadora de Festa</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="javascript:void(0)" onclick="toggleMobileDropdown(this)">Utilit&aacute;rios</a>
                <div class="dropdown-menu">
                    <a href="${href('calculadoras/datas.html')}" onclick="toggleMenu()">Diferen&ccedil;a de Datas</a>
                    <a href="${href('calculadoras/temperatura.html')}" onclick="toggleMenu()">Conversor de Temperatura</a>
                    <a href="${href('calculadoras/conversor-unidades.html')}" onclick="toggleMenu()">Conversor de Unidades</a>
                    <a href="${href('calculadoras/velocidade-media.html')}" onclick="toggleMenu()">Velocidade M&eacute;dia</a>
                    <a href="${href('calculadoras/kmh-ms.html')}" onclick="toggleMenu()">km/h para m/s</a>
                </div>
            </div>

            <div class="menu-item">
                <a href="${href('artigos/index.html')}" onclick="toggleMenu()">Aprenda</a>
            </div>

            <a href="${href('paginas/sobre.html')}" onclick="toggleMenu()">Sobre</a>
            <a href="${href('paginas/contato.html')}" onclick="toggleMenu()">Contato</a>
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

function injectHeader() {
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
    if (window.innerWidth <= 768) {
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
    carregarEIniciarBusca();
});

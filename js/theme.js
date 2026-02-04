// function alternarTema () {
//     const body = document.body;
//     const temaAtual = body.getAttribute("data-theme");

//     const novoTema = temaAtual === "dark" ? "light" : "dark";

//     // if (temaAtual === "dark") {
//     //     body.setAttribute("data-theme", "light");
//     // }else{
//     //     body.setAttribute("data-theme", "dark");
//     // }
//     body.setAttribute("data-theme", novoTema);
//     localStorage.setItem("tema", novoTema);
// }

// document.addEventListener("DOMContentLoaded", () => {
//     const temaSalvo = localStorage.getItem("tema");

//     if (temaSalvo) {
//         document.body.setAttribute("data-theme", temaSalvo);
//     }
// });

function alternarTema() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    const currentTheme = body.getAttribute('data-theme');

    if (currentTheme === 'light') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '☀️'; // Ícone Sol
        localStorage.setItem('theme', 'dark');
    } else {
        body.setAttribute('data-theme', 'light');
        themeIcon.textContent = '🌙'; // Ícone Lua
        localStorage.setItem('theme', 'light');
    }
}

// Carregar tema salvo ao iniciar
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-icon').textContent = savedTheme === 'light' ? '🌙' : '☀️';
}

// --- LÓGICA DO MENU MOBILE ---
function toggleMenu() {
    const menu = document.getElementById('nav-menu');
    const overlay = document.querySelector('.overlay');

    // Alterna a classe 'active'
    menu.classList.toggle('active');
    overlay.classList.toggle('active');
}
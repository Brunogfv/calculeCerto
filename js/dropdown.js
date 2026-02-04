// --- FUNÇÃO PARA DROPDOWN MOBILE ---
function toggleMobileDropdown(element) {
    // Se estiver em tela pequena (mobile)
    if (window.innerWidth <= 768) {
        const menu = element.nextElementSibling; // O .dropdown-menu
        menu.classList.toggle('mobile-open');
    }
}
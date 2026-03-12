document.addEventListener("DOMContentLoaded", function () {

    const footerHTML = `
<footer style="background: #0f172a; border-top: 1px solid #e2e8f0; padding: 50px 20px; color: #cbd5f5; font-size: 0.9rem; margin-top: 60px;">

<div style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 30px; text-align: center;">

<div style="max-width: 600px; margin: 0 auto;">
<h3 style="color: #cbd5f5; margin-bottom: 10px;">Sobre o Portal das Contas</h3>

<p style="margin-bottom: 20px;">
Somos um projeto dedicado a simplificar a matemática do cotidiano dos brasileiros.
Nosso objetivo é fornecer ferramentas digitais gratuitas para ajudar na organização financeira,
planejamento de saúde e execução de reformas.
</p>

<div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; font-weight: 600;">

<a href="/paginas/sobre.html" style="color: var(--cor-primaria); text-decoration: none;">
Quem Somos
</a>

<a href="/paginas/contato.html" style="color: var(--cor-primaria); text-decoration: none;">
Fale Conosco
</a>

<a href="/paginas/privacidade.html" style="color: var(--cor-primaria); text-decoration: none;">
Política de Privacidade
</a>

<a href="/paginas/termos.html" style="color: var(--cor-primaria); text-decoration: none;">
Termos de Uso
</a>

</div>
</div>

<div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 30px;">

<p>© 2026 Portal das Contas. Todos os direitos reservados.</p>

<p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.7;">
Este site é apenas para fins informativos. Consulte sempre um profissional
para decisões financeiras ou médicas.
</p>

</div>

</div>
</footer>
`;

    const container = document.getElementById("footer-container");
    if (container) {
        container.outerHTML = footerHTML;
    }

});

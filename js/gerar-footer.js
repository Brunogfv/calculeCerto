document.addEventListener("DOMContentLoaded", function () {

    const footerHTML = `
<footer
        style="background: #0f172a; border-top: 1px solid #e2e8f0; padding: 50px 20px; color: #cbd5f5; font-size: 0.9rem; margin-top: 60px;">

        <div
            style="max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr; gap: 30px; text-align: center;">

            <div style="max-width: 700px; margin: 0 auto;">
                <h3 style="color: #cbd5f5; margin-bottom: 15px;">Sobre o Portal das Contas</h3>

                <p style="margin-bottom: 16px; line-height: 1.75;">
                    O <strong style="color: #e2e8f0;">Portal das Contas</strong> nasceu da necessidade real de milhões
                    de brasileiros que precisam fazer contas do dia a dia — seja para entender o desconto no holerite,
                    calcular quantas latas de tinta comprar, ou descobrir se estão no peso saudável — sem ter de depender
                    de planilhas complexas ou contratar um profissional. Somos um projeto 100% gratuito, desenvolvido
                    com o propósito de democratizar o acesso à informação financeira, de saúde e de planejamento
                    doméstico para todos os cidadãos brasileiros, independentemente de escolaridade ou renda.
                </p>

                <p style="margin-bottom: 16px; line-height: 1.75;">
                    Nossa equipe acompanha de perto as mudanças na legislação previdenciária, trabalhista e tributária
                    do Brasil para manter todas as calculadoras sempre atualizadas. Cada ferramenta é validada com base
                    em fontes oficiais — como o Diário Oficial da União, portarias do Ministério da Previdência Social
                    e publicações da Receita Federal — antes de ser disponibilizada ao público. Acreditamos que a
                    confiabilidade dos dados é tão importante quanto a facilidade de uso: de nada adianta uma
                    calculadora bonita se o resultado estiver errado.
                </p>

                <p style="margin-bottom: 20px; line-height: 1.75;">
                    Valorizamos profundamente a privacidade dos nossos usuários. Por isso, nenhum dado inserido nas
                    calculadoras é coletado, armazenado ou compartilhado com terceiros — tudo é processado localmente
                    no seu próprio navegador. Se você tiver sugestões de novas ferramentas, encontrar algum erro em
                    um cálculo ou simplesmente quiser entrar em contato, ficaremos muito felizes em ouvir você.
                    O Portal das Contas é feito por brasileiros, para brasileiros, e cresce graças à participação
                    ativa de quem o usa.
                </p>

                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; font-weight: 600;">
                    <a href="/paginas/sobre" style="color: var(--cor-primaria); text-decoration: none;">Quem
                        Somos</a>
                    <a href="/paginas/contato" style="color: var(--cor-primaria); text-decoration: none;">Fale
                        Conosco</a>
                    <a href="/paginas/privacidade"
                        style="color: var(--cor-primaria); text-decoration: none;">Política de Privacidade</a>
                    <a href="/paginas/termos" style="color: var(--cor-primaria); text-decoration: none;">Termos de
                        Uso</a>
                </div>
            </div>

            <div style="border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 30px;">
                <p>© 2026 Portal das Contas. Todos os direitos reservados.</p>
                <p style="font-size: 0.8rem; margin-top: 5px; opacity: 0.7;">
                    Este site é apenas para fins informativos. Consulte sempre um profissional para decisões financeiras
                    ou médicas.
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

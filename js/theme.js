function alternarTema () {
    const body = document.body;
    const temaAtual = body.getAttribute("data-theme");

    const novoTema = temaAtual === "dark" ? "light" : "dark";

    // if (temaAtual === "dark") {
    //     body.setAttribute("data-theme", "light");
    // }else{
    //     body.setAttribute("data-theme", "dark");
    // }
    body.setAttribute("data-theme", novoTema);
    localStorage.setItem("tema", novoTema);
}

document.addEventListener("DOMContentLoaded", () => {
    const temaSalvo = localStorage.getItem("tema");

    if (temaSalvo) {
        document.body.setAttribute("data-theme", temaSalvo);
    }
});
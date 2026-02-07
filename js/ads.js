// ARQUIVO: js/ads.js

// 1. SEU "BANCO DE DADOS" DE PRODUTOS
const bancoDeAnuncios = {

    // Categoria: Temperatura
    temperatura: [
        {
            titulo: "Termômetro Digital Culinário com Display",
            etiqueta: "🔥 Dica do Chef",
            descricao: "Nunca mais sirva carne crua ou ressecada. Descubra o momento exato de tirar do fogo em segundos.",
            link: "https://www.amazon.com.br/Term%C3%B4metro-Culin%C3%A1rio-Digital-Leitura-Frituras/dp/B0FGCNM8RZ?crid=237203XDG5K5K&dib=eyJ2IjoiMSJ9.G9wvAHXRhNXzl9FrXnks74Jqmx5jB1OEXLc_dI7TNM-dGN3hcc6GY6I0zLWV0LcgWqxu5dY4PvNwF9jgL5rp7hxXIKFllyNGOVWSdfEySCIk_wn0UUVgVvMILLN4Y8fBpUE9Aubn9eKcA19icJjBc4mFBZfK9l1b2Zzx2hcWzdvlaChmmoEBCcLatdOilV2hHgu7FLRXYEdPjKJSbwgBsMEWdUN08iVQ9UGZZTNanLHH90MT-irgZOQ1lNJZZ7z-nKlz3iZhIqPnwY747YcNz4v4hjZXmgrsvAE9Kp4pR4E.3fGNpt65qIce9cVW_MuU3Z8VIZlS_SCIBl5Xg_2nlWE&dib_tag=se&keywords=termometro+culinario&qid=1770223964&sprefix=termo%2Caps%2C334&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=f047090ba40d41bbcc1c849dee24886e&ref_=as_li_ss_tl",
            imagem: "/imgs/termometro_culinario.jpg"
        },
        {
            titulo: "Termômetro Digital Culinário com Display",
            etiqueta: "🔥 Dica do Chef",
            descricao: "Nunca mais sirva carne crua ou ressecada. Descubra o momento exato de tirar do fogo em segundos.",
            link: "https://mercadolivre.com/sec/34hBgZA",
            imagem: "/imgs/termometro_culinario.jpg"
        },
        {
            titulo: "Balança Digital",
            etiqueta: "🔥 Balança de Cozinha",
            descricao: "Balança de Cozinha Digital para Alimentos Com Base Antiderrapante e Visor de Alta Resistente a Água Definição Pessagem até 10kg Fit Premium",
            link: "https://mercadolivre.com/sec/1KoxJVC",
            imagem: "/imgs/balanca_cozinha001.jpg"
        },
        {
            titulo: "Balança Digital",
            etiqueta: "🔥 Balança de Cozinha",
            descricao: "Balança de Cozinha Digital para Alimentos Com Base Antiderrapante e Visor de Alta Resistente a Água Definição Pessagem até 10kg Fit Premium",
            link: "https://www.amazon.com.br/Alimentos-Antiderrapante-Resistente-Defini%C3%A7%C3%A3o-Pessagem/dp/B0FC987YXM?pd_rd_w=DxRgf&content-id=amzn1.sym.ebf6c53b-8563-45af-833e-25b1308ef797&pf_rd_p=ebf6c53b-8563-45af-833e-25b1308ef797&pf_rd_r=BV8P034P5NT6NDKTCKTM&pd_rd_wg=SsCxL&pd_rd_r=0a4b4438-43f1-471f-ad95-b305c37c5cd6&pd_rd_i=B0FC987YXM&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=a330700d9f12fcb079aa9f1da5e3f11d&ref_=as_li_ss_tl",
            imagem: "/imgs/balanca_cozinha.jpg"
        },
        {
            titulo: "Termômetro Infravermelho (Sem Contato)",
            etiqueta: "⚡ Tecnologia Moderna",
            descricao: "Meça a temperatura de óleo quente, superfícies ou motores sem encostar. Seguro e preciso.",
            link: "https://www.amazon.com.br/Term%C3%B4metro-Infravermelho-Precis%C3%A3o-L%C3%ADquidos-Alimentos/dp/B0F8R6VN11?crid=1SOXNMXGUZWDM&dib=eyJ2IjoiMSJ9.cIUs2TXjSejthITL0DNdU5ImJtVDlPvZCTyUoxAGTFeMarDnVOy0mksVM6v_2QkIgh6nxkzpnk4sP1ot9qztrDzhlzLD08GaCjv5jjBAra6PZIJL1nBrSZNBdqiOuXDATirSXdqQ5lNG0Xyv802xcK7DDHeyskcT1mDjxUl8mxQnC21tMMScyiQ7NyVjqt8i77e1M5iNPrmmuDAl0kVx06KejqqHHjFZq4m_dPpuKKarvzcsixrMIokpUPKdNEwdONx2UdeM3WBOcwMtwEE_QJwZJdGphKj7W-lGQUk-3MA.beOxctDSW2go7OC5LSR6_yntJ371A96gocVN__IjuTk&dib_tag=se&keywords=termometro+infravermelho&qid=1770241236&sprefix=termometro+infra%2Caps%2C261&sr=8-7&linkCode=ll2&tag=portaldascont-20&linkId=d0d122464a551f3c92835103aea2b4f8&ref_=as_li_ss_tl",
            imagem: "/imgs/termometro_infra.jpg"
        },
        {
            titulo: "Termômetro Infravermelho (Sem Contato)",
            etiqueta: "⚡ Tecnologia Moderna",
            descricao: "Meça a temperatura de óleo quente, superfícies ou motores sem encostar. Seguro e preciso.",
            link: "https://mercadolivre.com/sec/1hMo15R",
            imagem: "/imgs/termometro_infra.jpg"
        },
        {
            titulo: "Fritadeira Elétrica Air Fryer",
            etiqueta: "🍟 Saúde e Sabor",
            descricao: "A conversão de temperatura é a chave aqui. Frituras crocantes com 90% menos gordura.",
            link: "https://www.amazon.com.br/Fritadeira-Sem-%C3%93leo-Oster-127V/dp/B0B72QZXCC?crid=1UNN9Z8EOSK00&dib=eyJ2IjoiMSJ9.m92TAyGLLlnM7_QIWzy83qmYGzumj8BbEIhyQ4goyEim-Xgt0TUGe6MoSkGeNYJYyRFbTeypA2-CfKstb0oshNSmdjtcoyxFXR4b31HkmqszdI-7_NSh4mBMOs5eaXpAyOOSbC1O4CWb_bm8vUqsgKNWeLa6Kh7hWFecm92EDR4SMNcnlKuYFr83ZRc1vy8YvY63nRrNlyffgMsCzWhjntoo0m41Ptoan2UcxQY0xkCezzDmdIEm7jR5JHIl1vG3EYWqs8-zDr4EBmWvRxM5iD6W8UiW9oQ_rg7GkoexJ68.VHhoslC1lSGzRvyeWeoo3eqn_D_YBgdwhHGSV3KuBXs&dib_tag=se&keywords=air%2Bfryer&qid=1770241473&sprefix=air%2Caps%2C254&sr=8-11&ufe=app_do%3Aamzn1.fos.fcd6d665-32ba-4479-9f21-b774e276a678&th=1&linkCode=ll2&tag=portaldascont-20&linkId=2abdb4ebcbe302f39abcd1aaf5fe8511&ref_=as_li_ss_tl",
            imagem: "/imgs/airfryer_oster.jpg"
        },
        {
            titulo: "Fritadeira Elétrica Air Fryer",
            etiqueta: "🍟 Saúde e Sabor",
            descricao: "A conversão de temperatura é a chave aqui. Frituras crocantes com 90% menos gordura.",
            link: "https://mercadolivre.com/sec/1AshQ9g",
            imagem: "/imgs/airfryer_oster001.jpg"
        },
        {
            titulo: "Termômetro para Doces",
            etiqueta: "🍬 Confeitaria Pro",
            descricao: "O segredo para acertar o 'ponto de bala' ou 'ponto fio'. Precisão cirúrgica para suas caldas.",
            link: "https://www.amazon.com.br/Craft911-Term%C3%B4metro-Digital-Instant%C3%A2nea-Cozinhar/dp/B0DMM9HMD2?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=191HVL4DK3J5E&dib=eyJ2IjoiMSJ9.f3hgb36wSXwwbbb76uuWgeWfKc6QBtvjNX6KWBtx7DamO-AnU8O-pG3NGPwSqGRb1_fwSe8y2-JtisNMpvqaDmd0S70OvmePL40zVPyNPWSFivYXJ1n0tEHtfrsVqNqvC7mWtIIOgBcZj0VNWwZz5JdS2walc-KqOW-Ebf75v6ANrEf9a4UOTz3pLbMQWio6w7qnckbzg_9VoVPVStceQ6fZWP-QUUuZQdZ5SHij_3AMvdXKvg0m70jhDomr7qARKQPWgkYjHUEYaIk5rlhI8sgaYOaTLLw50jnN60wmLsA.h5xsXqUas9DepwvP8WYCodIKsN68knLfi2s8Mw1ruLM&dib_tag=se&keywords=termometro+para+doces&qid=1770242272&sprefix=termometro+para+doces%2Caps%2C255&sr=8-35&ufe=app_do%3Aamzn1.fos.fcd6d665-32ba-4479-9f21-b774e276a678&linkCode=ll2&tag=portaldascont-20&linkId=15ac62200e950a9413a70d4d4822b357&ref_=as_li_ss_tl",
            imagem: "/imgs/termometro_doces.jpg"
        },
        {
            titulo: "Estação Meteorológica Digital",
            etiqueta: "☀️ Clima em Casa",
            descricao: "Monitore a temperatura e umidade sem sair do sofá. Saiba exatamente como está lá fora.",
            link: "https://www.amazon.com.br/Meteorol%C3%B3gicas-Temperatura-Retroilumina%C3%A7%C3%A3o-Term%C3%B4metro-Meteorol%C3%B3gico/dp/B0DN5TFT6B?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1XZ5RVMYIPVM3&dib=eyJ2IjoiMSJ9.MFjRVOby__bNVFTpnKYq7Ha5YV8W7aB_K3aRBMxrLhj4nN5rrgR4SRKVT9isPEy1Vd10vkxPzm6xp8SompzUgrId-A2gXFrRMZjyW8AXJCKXBtzNPWk8-S-ZmXdYmXmsLLL1G2lSu7ysmjkV_T0t2sGVvdm698oDgrx9EPoUpR5TQQ6rhLb3qzN-I5EH5Mi6jAfMtOSD57y_UXvI0BmD6ZjOpePLzb4MBhXoYhRFWnJKxzgD3Xo6pO5Kduojgt9rPopRZxleWRW5HNVgnQi-ijrTJkbvGoSwplSz5Fmv7AI.qMzMufygewU5igaYB9nzlBq5L2W8aVo7oH23J5SIP0E&dib_tag=se&keywords=esta%C3%A7%C3%A3o+meteorol%C3%B3gica+digital&qid=1770242490&sprefix=esta%C3%A7%C3%A3o+meteorol%C3%B3gica+digita%2Caps%2C267&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.db68964d-7c0e-4bb2-a95c-e5cb9e32eb12&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=5c33ccfb9ea578a81096f85819da212b&ref_=as_li_ss_tl",
            imagem: "/imgs/estacao_meteorologica.jpg"
        },
        {
            titulo: "Sous Vide (Cozimento a Vácuo)",
            etiqueta: "🥩 Chef Profissional",
            descricao: "Cozinhe em temperaturas precisas por horas. O segredo dos restaurantes agora na sua cozinha.",
            link: "https://www.amazon.com.br/Sous-Vide-Manual-Coc%C3%A7%C3%A3o-Temperatura/dp/6586493641?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=NBLIR38CFTJA&dib=eyJ2IjoiMSJ9.Lq0m9_gGazaEgblogoG0l-adf1bpa_dJvFHrHtsC-eUsgrhUO8B8VNen-WHNRbPqAfgfTmqI47AofHVo1RZcXnq4ZWaeO4thCl71qOlaH61dfS6FE3KdT_qA8KTq6nlMoPSmhe0p4ZJxnb_le6l7x6VlTv0FY9gnh_26-UYi-WoK84lygdc3wjrJSg9z0en0JBr_VBDAu2b1OsuZpwO0NXCiszwG9IpGWz4U2rR21waEjaZZOavmkaTr1aK4FNyjfWkwrfQI5lSKlfCIzovatNGeCr-4ACOZAj0oypKPhrc.pJJRayDE21xxqRRuKLRjBZU0gvNxNJ5eQDn7nVHNjKg&dib_tag=se&keywords=sous+vide&qid=1770242712&sprefix=sous+vide%2Caps%2C287&sr=8-8&linkCode=ll2&tag=portaldascont-20&linkId=472d928a75a59c69f64cc0bacffb9eaf&ref_=as_li_ss_tl",
            imagem: "/imgs/sous_vide.jpg"
        },
        {
            titulo: " Chaleira Elétrica com Controle de Temperatura",
            etiqueta: "☕ O Chá Perfeito",
            descricao: "Cada tipo de chá exige uma temperatura. Aqueça a água no grau exato para extrair todo o sabor.",
            link: "https://www.amazon.com.br/DECKER-Chaleira-El%C3%A9trica-Controle-Temperatura/dp/B0851GH9TH?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3FVTHNNVUNZ18&dib=eyJ2IjoiMSJ9.EfSMDLB_bb55FaLh7FI8tSySGa6CmLGADr2sxWFRrpSh9lyHthqvU8mYy6ZpxhSjdroDl7PDNOc3cH3RuOpZI-GWa8hy_hlj_sqB8rvOcsvJkhyCZA7yBy8eQ-H2xASXvC-q6JI-HaShxjak_y35YIXIUxPCEcLpj3jonzqokOlvp_hDRTu7Z2-04b0H_Jl2xU-orUsGpkLRuDv7Y75uycpvdWeY8qYIKIcZemrtDvEIQtI97AG4YI-aE6tVn3PCh27sVsQAfRvxdIU0Wrqsg8P0A824RFH6nIMXTzu6CAs.jM8psA0B2VVsYMak9fEIv-hQdpQ8OcvOP0AUY9-16gg&dib_tag=se&keywords=chaleira+eletrica+com+controle+de+temperatura&qid=1770243075&sprefix=chaleira+el%C3%A9trica+com+controle+de+temperatura%2Caps%2C253&sr=8-5&ufe=app_do%3Aamzn1.fos.6a09f7ec-d911-4889-ad70-de8dd83c8a74&linkCode=ll2&tag=portaldascont-20&linkId=4045d900b74e66532b8ca5d98f7cfe67&ref_=as_li_ss_tl",
            imagem: "/imgs/chaleira_eletrica.jpg"
        },
        {
            titulo: " Chaleira Elétrica com Aquecimento Rápido",
            etiqueta: "☕ O Chá Perfeito",
            descricao: "Cada tipo de chá exige uma temperatura. Aqueça a água no grau exato para extrair todo o sabor.",
            link: "https://mercadolivre.com/sec/1ai8QzK",
            imagem: "/imgs/chaleira_eletrica001.jpg"
        },
        {
            titulo: "Frigobar (Geladeira Portátil)",
            etiqueta: "🍺 Bebidas Geladas",
            descricao: "Mantenha suas bebidas na temperatura ideal. Pequeno, eficiente e perfeito para qualquer espaço.",
            link: "https://www.amazon.com.br/Frigobar-Philco-PFG95B-Branco-127V/dp/B09H3CWVLS?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3HJC7R6HC5DY2&dib=eyJ2IjoiMSJ9.xWxt4THq36XFWIo5syNg69B5JU42R88giT9FxVAjmUU3ZpImtrIFwJH7A2q28-ADHrA1pzftdZemscE-WO51bxT4vH40nQtpVfPqZFK1C216LXc1_0t7afd04iQTSybT2g7cHeVmVgtdhg-SOM54aftvJXlTpKR9jQTErGl9PpWIP8VDw14Y3n5gKv-lU0tPqnndy_JUWO8qHUGgPmg7fSxMXTulr3ztvA7t_Ww4tHNaMQ1DxucePATTPoME6I06lLUWW3UQe_NCxJU7nV4Gys_Je2oPfo13Mi7B00lrjM0.LwlT3uhb9GtGoe3Qulwz1H_UseyFITR8OpUBzHx58SQ&dib_tag=se&keywords=mini+frigobar&qid=1770243257&sprefix=mini+frigobar%2Caps%2C261&sr=8-4-spons&ufe=app_do%3Aamzn1.fos.25548f35-0de7-44b3-b28e-0f56f3f96147&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=41e7baff2a7c3a26c576b642eeb4b216&ref_=as_li_ss_tl",
            imagem: "/imgs/frigobar001.jpg"
        },
        {
            titulo: "Frigobar (Geladeira Portátil)",
            etiqueta: "🍺 Bebidas Geladas",
            descricao: "Mantenha suas bebidas na temperatura ideal. Pequeno, eficiente e perfeito para qualquer espaço.",
            link: "https://mercadolivre.com/sec/1NkGXGS",
            imagem: "/imgs/frigobar002.jpg"
        }
    ],

    // Categoria: Tinta (Exemplo futuro)
    tinta: [
        {
            titulo: "Balde de Tinta Acrílica 18L (Branco)",
            etiqueta: "🎨 O Essencial",
            descricao: "A base da sua reforma. Cobertura alta, secagem rápida e acabamento fosco perfeito para paredes internas.",
            link: "https://www.amazon.com.br/CORALAR-L%C3%81TEX-MAIS-ECON%C3%94MICO-BRANCO/dp/B08L71HHFR?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=251Z3O8TM0OVT&dib=eyJ2IjoiMSJ9.PirWTWPQ40zD4l3q4WU2suQt6KgdKQCKPil_y2tWXb6f2Nq1xVysb6vLK_aEQemJqve4dufhCunnFsS6jkyAN0-YkD4-8Z8ttWrtlcaeyQvjn_BGpJawN7bGeexWxfuj2iSiPPvpzOJ77Bwb3anG10DKMtqEnMTPf0VLGW1EN1gclOQYg36cd4dK5eSatWsdlniv_hpqTlgayPSEdJuN30kNvJ-d0zkfORIRzrDmVIEt64yIyPHQ8d1B_Wp3kZ1G1oE43tKV98sfTnKKgWvjkpvsm4S4cW-jTtX9M78IB8s.i2-nd5746HQMVTNGiPB_wCBO2X3isk7NXwy347dYEto&dib_tag=se&keywords=tinta+acrilica+branco+18+litros&qid=1770245169&sprefix=tinta+acrilica+branco18+litros%2Caps%2C239&sr=8-1&linkCode=ll2&tag=portaldascont-20&linkId=75ed78c272503f961b0d72adaad4e150&ref_=as_li_ss_tl",
            imagem: "/imgs/tinta001.jpg"
        },
        {
            titulo: "Balde de Tinta Acrílica 18L (Branco)",
            etiqueta: "🎨 O Essencial",
            descricao: "A base da sua reforma. Cobertura alta, secagem rápida e acabamento fosco perfeito para paredes internas.",
            link: "https://mercadolivre.com/sec/1wvu43h",
            imagem: "/imgs/tinta002.webp"
        },
        {
            titulo: "Tinta Acrílica Anti Mofo 18L",
            etiqueta: "🎨 Segurança",
            descricao: "Ideal para quem busca qualidade e durabilidade em projetos de pintura. É lavável e resiste à umidade, oferece excelente cobertura e secagem rápida, permitindo que você complete seu projeto com maior eficiência",
            link: "https://mercadolivre.com/sec/2ZyNygE",
            imagem: "/imgs/tinta003.webp"
        },
        {
            titulo: "Verniz Acrílico para Madeira",
            etiqueta: "🪵 Proteção Total",
            descricao: "Vai pintar portas e batentes? Não se esqueça do protetor. À base de água, inodoro e de alta durabilidade.",
            link: "https://www.amazon.com.br/Verniz-Madeira-Premium-Godmix-Imbuia/dp/B0FDYNBFSZ?crid=14FR4LMXOU95N&dib=eyJ2IjoiMSJ9._It7BMKBwyz-ZMKTXO8IvQ8a2Em8m8hkd-CJR4YXGt6IoL-I7Y3pdIyznEd4rmcmXw5wEGce74q05t-qkiSBwlQ7EMTUbjUf-bicMHoxshxb8zkLUdOUo3iOczbfaShxQGPj62FUO-8ZzW_K-L1ANUJU5Pxk0vVNKJzqQoB-nDuOq_r1GIzqnpjKlKy4QlCL5vkOcbEK283dmEriWdJjyvm_BHNsfsP9yj_d4Qz_r9cv7z-S8ABghD4C7tkFVcc4al2q7rL79b4qoA0dEmYahX7gQcTYJGwxfPmpxaViNFU.wwktbAY0hgXsze3fr8Rf_s2JA51Rb3LOOZD2A81scf0&dib_tag=se&keywords=verniz%2Bacrilico%2Bpara%2Bmadeira&qid=1770305807&sprefix=verniz%2Bacrilico%2Bpara%2Bmad%2Caps%2C248&sr=8-7&ufe=app_do%3Aamzn1.fos.6d798eae-cadf-45de-946a-f477d47705b9&th=1&linkCode=ll2&tag=portaldascont-20&linkId=8165766e831f7a7b6555e8a4e1965bb5&ref_=as_li_ss_tl",
            imagem: "/imgs/verniz001.jpg"
        },
        {
            titulo: "Verniz Acrílico",
            etiqueta: "🪵 Proteção Total",
            descricao: "Vai pintar portas e batentes? Não se esqueça do protetor. À base de água, inodoro e de alta durabilidade",
            link: "https://mercadolivre.com/sec/1q4ZFti",
            imagem: "/imgs/verniz002.webp"
        },
        {
            titulo: "Fundo Branco Selador",
            etiqueta: "🧱 Fixação",
            descricao: "Pintar diretamente na parede nova é erro. Use o selador para uniformizar e garantir que a tinta não absorva de forma irregular",
            link: "https://www.amazon.com.br/Coral-5202615-Selador-Acr%C3%ADlico-Branco/dp/B07G5KWRWW?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=54EW7EIM0XX9&dib=eyJ2IjoiMSJ9.dLb0ml0uaiNsSWamKwI7S0VpwBbbuEp4K5Eo-3zx0SMWLo8DimUPRiHmx2wYstrhiv-dd9ADdJR6ELcobZ3vgGIiFOuX9qTwnFA4XMywr4Te_AqIT3j7TC4h76nm_p5qyn93yKgr3kau5XpBxlmaH3cAnW2LDZPKG_RT2S6LWJFm0jY1uwAqILokCidByuJl6OP3AuyF3aBsBE6rzNd09JeEWlhLLXmkrP6tLXL09JlWVSGngM2K-gjq_NgzE4brubGotF3td7w352jVLeOBa639CUuKXUrfSVv9ZRCLW_w.N5h7I7tcPxHp90P4DQLIHaSIqKUu9RnPQZ3V7SRQ4Aw&dib_tag=se&keywords=selador+branco&qid=1770306125&sprefix=selador+branco%2Caps%2C256&sr=8-1&linkCode=ll2&tag=portaldascont-20&linkId=14e804ca32661b76d480f61602b04d1f&ref_=as_li_ss_tl",
            imagem: "/imgs/selador001.jpg"
        },
        {
            titulo: "Kit Rolo de Pintura Profissional",
            etiqueta: "🌊 Acabamento Liso",
            descricao: "Esqueça as marcas de rolo. Este kit de alta absorção garante uma camada uniforme em menos tempo.",
            link: "https://www.amazon.com.br/Pintura-Pinceis-Tigre-Respingo-Multiuso/dp/B0C6BM63XQ?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3UAALWKC4IHUI&dib=eyJ2IjoiMSJ9.WIikZa2-hlvBJb5JYZUC5rlkO-_rbJ97RdYXK9NUvovPzkmvDn3Bm-_fCYrv2oLiCnvBgq9WJnbNp7rBetlRnM_KJKeUZ0NFsS7c3H7M8VqVWJhX9ImULz9IgYLMbu415HfuZ3_6PgHQ59VrjjdBUSynJJWTOHjyeLd6Pld9qAmuyDCOC3KqsI-EEOEVOThHLyZQqgioA32_1a9ICc41fp7cq72xkZtFNwoVcHBgThJyZiLypaQ8v_MR-R71nBb35IDyV67dNWJrDSJ4VboZTMiRhUwLF67VDbTUANpy558.ZdnRz8pnEpYDFWWsZvvvHNEcWpxJjYDZyc89dVGZUoA&dib_tag=se&keywords=Kit+Rolo+de+Pintura+Profissional&qid=1770306298&sprefix=kit+rolo+de+pintura+profissional%2Caps%2C412&sr=8-7&linkCode=ll2&tag=portaldascont-20&linkId=56bd7217032be6f520e3afd7645c5470&ref_=as_li_ss_tl",
            imagem: "/imgs/kit_pintura001.jpg"
        },
        {
            titulo: "Kit Rolo de Pintura Profissional",
            etiqueta: "🌊 Acabamento Liso",
            descricao: "Esqueça as marcas de rolo. Este kit de alta absorção garante uma camada uniforme em menos tempo.",
            link: "https://www.amazon.com.br/pintura-parede-profissional-completo-respingo/dp/B0D9QZ7WNF?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=3UAALWKC4IHUI&dib=eyJ2IjoiMSJ9.WIikZa2-hlvBJb5JYZUC5rlkO-_rbJ97RdYXK9NUvovPzkmvDn3Bm-_fCYrv2oLiCnvBgq9WJnbNp7rBetlRnM_KJKeUZ0NFsS7c3H7M8VqVWJhX9ImULz9IgYLMbu415HfuZ3_6PgHQ59VrjjdBUSynJJWTOHjyeLd6Pld9qAmuyDCOC3KqsI-EEOEVOThHLyZQqgioA32_1a9ICc41fp7cq72xkZtFNwoVcHBgThJyZiLypaQ8v_MR-R71nBb35IDyV67dNWJrDSJ4VboZTMiRhUwLF67VDbTUANpy558.ZdnRz8pnEpYDFWWsZvvvHNEcWpxJjYDZyc89dVGZUoA&dib_tag=se&keywords=Kit+Rolo+de+Pintura+Profissional&qid=1770306298&sprefix=kit+rolo+de+pintura+profissional%2Caps%2C412&sr=8-1-spons&ufe=app_do%3Aamzn1.fos.6d798eae-cadf-45de-946a-f477d47705b9&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=367fa0ba47a3033d4243b98d2d11b798&ref_=as_li_ss_tl",
            imagem: "/imgs/kit_pintura002.jpg"
        },
        {
            titulo: "Pincel (Angulado) 2 polegadas",
            etiqueta: "🖌️ Para Detalhes",
            descricao: "O rolo não chega nos cantos. Este pincel é essencial para emolduras, rodapés e acabamentos precisos.",
            link: "https://www.amazon.com.br/Pincel-Trincha-Tamanho-Angulada-Curto/dp/B0FS7V5QXG?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1B4DR5MVC2RC7&dib=eyJ2IjoiMSJ9.1bH7G8cSUQ6EPkvjKOKhhBqC77Ht1HtxJWrQk8de6YB1dRkWEY6IjvxapksbGvw2PxLtnaNbQ2hSmeu7d3zMRiBxp8bM2b6M0besCdGqjwlWgD36u1H62bEl2-7xNj8VdxRnUE_475Cy-gmFLJbXnm1ZIohpFI4V3TcMdKzUKE8rUN1OuhotGfhbZfDSH58xvL3MkVXajzpz8pWF-Ef7ejMihbi6YLxcDk282wh_GtzYjJW431gvrJ7lpj1dsaWxvB_3v_b09IQaqjY8cey44PMfv4_J_JdphY8P_QvVL4w.iI5KGyQA4BiGq4N1v8fENa833yBCbS5KwUYWq0fZ49c&dib_tag=se&keywords=Pincel+Cotovelo+%28Angulado%29+2+polegadas&qid=1770307950&sprefix=pincel+cotovelo+angulado+2+polegadas%2Caps%2C229&sr=8-6&ufe=app_do%3Aamzn1.fos.6d798eae-cadf-45de-946a-f477d47705b9&linkCode=ll2&tag=portaldascont-20&linkId=f68cef63e88829202d46833f4eb75141&ref_=as_li_ss_tl",
            imagem: "/imgs/trincha_angulada001.jpg"
        },
        {
            titulo: "Extensão para Rolo",
            etiqueta: "🚀 Sem Escada",
            descricao: "Pinte o teto e paredes altas com segurança. Ajuste o comprimento e pinte confortavelmente com os dois pés no chão.",
            link: "https://www.amazon.com.br/Extensor-Cabo-Para-Rolo-Pintura/dp/B0FNDP1PW6?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2CEZ7HKO79IZK&dib=eyJ2IjoiMSJ9.S6MPFzzZARbK-TNvDujq77cQLSvs99ZcJTbeOuslbc515w4IR1uUi_Tnn8QK0nF71rLjrCelskZx56kLkVQ7ZqJgb3O2pkW6QF60uQ1M5p8W7QpASJWXzPZEuGei0IEiZ4brk7HSqGzGrxfrszQXCBw1IFYnegwyN3_pykCkyP3BHiKEax249vlha7t0f5fMimPtORwom_hqw7q4_PVNiWcGqZey_n90zkfueN5F9NR0AfRgB3sXFBE1P4Cg-7SC3-2m0to5k0f-JYQlGVeqjdq1FPUGB1oR3aK1MuEWpFI.bONsyMjPXaJnlk39GyMxzVwP00NdN1X6mB8nCzOLz2Q&dib_tag=se&keywords=Extens%C3%A3o+para+Rolo+%28Telesc%C3%B3pica%29&qid=1770308133&sprefix=extens%C3%A3o+para+rolo+telesc%C3%B3pica+%2Caps%2C241&sr=8-2&ufe=app_do%3Aamzn1.fos.6d798eae-cadf-45de-946a-f477d47705b9&linkCode=ll2&tag=portaldascont-20&linkId=fd172fbc9fa3cc029a086e30c18274d0&ref_=as_li_ss_tl",
            imagem: "/imgs/extenso_deCabo001.jpg"
        },
        {
            titulo: "Pistola de Tinta Elétrica (Spray)",
            etiqueta: "💨 Velocidade Extrema",
            descricao: "Para quem quer terminar rápido. Pinta grandes superfícies em minutos, com uniformidade perfeita e sem fadiga.",
            link: "https://www.amazon.com.br/Pistola-Pintura-El%C3%A9trica-Baterias-Viscosidade/dp/B0FSL52XMX?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2ECXTL68SQ4ZT&dib=eyJ2IjoiMSJ9.Z38x57x4wFxY3msliXJlh0r7HxAs6qMPfEfY_EmJDPCc01aUBf8T8W8PM8eR5JxHZWbrg6e-P4MC4gGUSrbKdeWbhM4bMdc7tN11T2sERPHXvrkS-jer4CiL-7nq-7_UXz_zyDVG9du-wQELnDnmLPpIlAqpdvXfjcoQVpvF9IOzzHOvHqgFM8AzAl2MjWxec4x3OswcebsYVsjCUnnxEEcVAGrLAcg5H0IPw1mt2UE4t_QwfpxAhgDQYAIWa8NbveBK65MuN69KxbOKHqQwcY8SM_i3do5w83w0Pl7ZKfI.BWFeZV3ajEseL9F2VYThozcYaewhSURxrJz5CtFCuWA&dib_tag=se&keywords=Pistola%2Bde%2BTinta%2BEl%C3%A9trica%2B%28Spray%29&qid=1770308386&sprefix=pistola%2Bde%2Btinta%2Bel%C3%A9trica%2Bspray%2B%2Caps%2C282&sr=8-7&ufe=app_do%3Aamzn1.fos.fcd6d665-32ba-4479-9f21-b774e276a678&th=1&linkCode=ll2&tag=portaldascont-20&linkId=938c2097329fd079bfcfb5eb7837d627&ref_=as_li_ss_tl",
            imagem: "/imgs/pistola_pintura001.jpg"
        },
        {
            titulo: "Kit de Fitas Crepe",
            etiqueta: "📏 Cortes Perfeitos",
            descricao: "O segredo dos pintores profissionais. Protege rodapés e tomadas, garantindo linhas retas sem tinta passando.",
            link: "https://www.amazon.com.br/Adelbras-615000005-Crepe-Multicolor-Pacote/dp/B077HYW7Q8?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=35O3B49UMQQA0&dib=eyJ2IjoiMSJ9.IV40TfWz9j3WGA4z0ajRQ3Az0v13IzwjCcs4llECZfh7vLMPnx8ymTc9B5IwEE7-Erez0hfv-hU1_0FN-b2rAOaN9wm5evrRxwjNxrR9-oTBgVqL_s-wyq9Rdr11PTLGxgZK9fZsSz_MvcNpo9aTUf_Au0AbxpY7eib_3NeSJ_hmzdke57rFHb8kVr9l7gFxNikNezLYhz0ZfOy-hjrsf6l7xtyxAQT3Am6tX213_yYA2aOd70nmj5ZOV8zPp5dP6X8CPCGN8U63aFRUPldR3YnGkZBKBND20MOt5REfC_o.3uenzxEVQAY0YQbMf0LOi-DMowNuJOU0KE0KLlX-wm8&dib_tag=se&keywords=kit+de+fita+crepe&qid=1770308888&sprefix=kit+de+fita+crepe%2Caps%2C227&sr=8-6&linkCode=ll2&tag=portaldascont-20&linkId=ab91047235db51f0c74ae03887f5105f&ref_=as_li_ss_tl",
            imagem: "/imgs/fita_crepe001.jpg"
        },
        {
            titulo: "Kit de Fitas Crepe",
            etiqueta: "📏 Cortes Perfeitos",
            descricao: "O segredo dos pintores profissionais. Protege rodapés e tomadas, garantindo linhas retas sem tinta passando.",
            link: "https://mercadolivre.com/sec/2z9wXQ4",
            imagem: "/imgs/fita_crepe002.jpg"
        },
        {
            titulo: "Lona de Proteção (Plano)",
            etiqueta: "🛡️ Chão Salvo",
            descricao: "Plástico rasga fácil e escorrega. A lona canvas é antiderrapante, absorve respingos e pode ser reutilizada.",
            link: "https://www.amazon.com.br/dp/B0F5TZG3VL?psc=1&pd_rd_i=B0F5TZG3VL&pd_rd_w=lv7Ht&content-id=amzn1.sym.b0d855ab-21fd-49b1-ae3e-5a01e562f959&pf_rd_p=b0d855ab-21fd-49b1-ae3e-5a01e562f959&pf_rd_r=6VYD8A45512NBGT2MMYZ&pd_rd_wg=d2n3W&pd_rd_r=86511135-c94c-4d44-bf06-373dfc397102&sp_csd=d2lkZ2V0TmFtZT1zcF9kZXRhaWwy&linkCode=ll2&tag=portaldascont-20&linkId=92632062ab7175c924734a49d38226c3&ref_=as_li_ss_tl",
            imagem: "/imgs/lona_plastica001.jpg"
        },
        {
            titulo: "Lona de Proteção (Plano)",
            etiqueta: "🛡️ Chão Salvo",
            descricao: "Plástico rasga fácil e escorrega. A lona canvas é antiderrapante, absorve respingos e pode ser reutilizada.",
            link: "https://mercadolivre.com/sec/2Fg7MUR",
            imagem: "/imgs/lona_plastica002.jpg"
        },
        {
            titulo: "Kit de Lixas",
            etiqueta: "🧽 Suavidade",
            descricao: "Tinta não corrige buracos. Lixe a parede antes para remover imperfeições e garantir uma nova lisa e perfeita.",
            link: "https://www.amazon.com.br/Folhas-Ideal-Massa-Madeira-Reboco/dp/B0GFY8RZ12?crid=JGGPCN5K1NW4&dib=eyJ2IjoiMSJ9.NBwXzD96hCqiOKR-qhVc_eHAXH5L9by2CShAnWnyod4Y46GS_e9-ETR7pgmnsyPgQxjm7YncolY1rX60RIdcyIckA_Q-Jbx4IT2QOsAO9c69cvwXrmZvEPiyn6Un_b39P6LRQGRzrJnkUl33WWnW7SxSnWw6b_ZSxvCgupR4UgYWOEfck3A6AyG2pZHk9PwyYQQn9IJ1DjeSiLtTmmAJvls5XyIORqBf-ncHpnAhMI_3HSWoM6qrpOFs0yTOaiSJ1DBaQ6p5T46RWh1THCqeOyC4UILprye-GJXabztR1es.TzebLzYu0YiJCtxpZkNMC1zt9L7xyg9I5XNJu2ZS70g&dib_tag=se&keywords=lixa%2Bde%2Bparede&qid=1770309547&sprefix=lixas%2B%2Caps%2C295&sr=8-9&th=1&linkCode=ll2&tag=portaldascont-20&linkId=f89da1ddb4705391975ddc5dfb4e938d&ref_=as_li_ss_tl",
            imagem: "/imgs/lixa001.jpg"
        },
        {
            titulo: "Kit de Lixas",
            etiqueta: "🧽 Suavidade",
            descricao: "Tinta não corrige buracos. Lixe a parede antes para remover imperfeições e garantir uma nova lisa e perfeita.",
            link: "https://mercadolivre.com/sec/13Lc2im",
            imagem: "/imgs/lixa002.webp"
        },
        {
            titulo: "Bandeja de Plástico para Tinta",
            etiqueta: "🪣 Praticidade",
            descricao: "A parceira do seu rolo. Design cômodo para não cansar o braço e bordas para escorrer o excesso.",
            link: "https://www.amazon.com.br/Bandeja-Pl%C3%A1stico-Pinc%C3%A9is-Atlas-1523P/dp/B076MG5FYF?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=2UTTLDYW59YJB&dib=eyJ2IjoiMSJ9.yv98AleNE-YbauQV2aZkVPcyyNMzebkLnvFXCYg_Etn9toLOAvBOy0041zUExFGCSBroZ1Ty1c7-33v07ss05vMNc5jc6tWsI3oLV1rWVj-YxQN--4I5s8BON1jZAZVsBwHefechfQQ5kJKPjJG2pUa-T-sd1b64peWrVHwVgkx63hlFIULd7btZKec2TZKs35IiYRtk66zcxEQBBba-vtlnl_9d3o9p_u35yngNt_T0LroMzQ95zDbRrsgeAhRQZ3Tu27NWyfRENemPLJjMdZf1ppD8bXm-WacMVd7leN0.tgvDx1QsUe94PEseUjiamBuxyQLdDZExTcZxisPgPU4&dib_tag=se&keywords=bandeja%2Bde%2Bplastico%2Bpara%2Btinta&qid=1770309964&sprefix=bandeja%2Bde%2Bpl%C3%A1stico%2Bpara%2Btinta%2Caps%2C270&sr=8-4&th=1&linkCode=ll2&tag=portaldascont-20&linkId=f0c0a13619b1fc035182614dc9b52554&ref_=as_li_ss_tl",
            imagem: "/imgs/bandeja001.jpg"
        },
        {
            titulo: "Bandeja de Plástico para Tinta",
            etiqueta: "🪣 Praticidade",
            descricao: "A parceira do seu rolo. Design cômodo para não cansar o braço e bordas para escorrer o excesso.",
            link: "https://mercadolivre.com/sec/2nYN1pY",
            imagem: "/imgs/bandeja002.webp"
        },
        {
            titulo: "Batedor de Tinta para Furadeira",
            etiqueta: "🌪️ Sem Esforço",
            descricao: "Mexer 18 litros de tinta no braço é exaustivo. Use este acessório na furadeira para uma mistura perfeita em segundos.",
            link: "https://www.amazon.com.br/Misturador-Tintas-Gesso-Encaixe-Mtx/dp/B07SRTZ7NS?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1CNHVA5IDVVO6&dib=eyJ2IjoiMSJ9.WPYorRtilNI_jtoeHIRSt3__0W5sJcQ5HZ1p5Qqj5ddNH4FMaWlZcof2RTwfFE7W8n3MjKJQCiiutmbs00R8kMI9Zsw4XFDYjJFSzQF7SaByaPSY_R9VAFIUVtDVeAu7bgsDVVi85FPwYJGUIXvSVx1DGfnoN2yjXh_ixw6n7S3fsIyOctDF2EOCzbcgBKs8oQLbHseSDIKnqA6dqvRjuhbzO-wEqtM_Mnb4YAUhUhXgNVVWhX_eoF_vtSfQiFN1RiOuT5_xxNiVxJAujbIUZv_0w8qq3vMAWB5xGBLWOQQ.IUvQm-9zSC46mMKVcK5bqeKoJrzXTsK4We8qfaIYzYU&dib_tag=se&keywords=Batedor%2Bde%2BTinta%2Bpara%2BFuradeira&qid=1770310290&sprefix=batedor%2Bde%2Btinta%2Bpara%2Bfuradeira%2Caps%2C269&sr=8-2&th=1&linkCode=ll2&tag=portaldascont-20&linkId=bd6fe89f7ce807dd3ee5759a77c75c6c&ref_=as_li_ss_tl",
            imagem: "/imgs/misturador_tinta001.jpg"
        },
        {
            titulo: "Batedor de Tinta para Furadeira",
            etiqueta: "🌪️ Sem Esforço",
            descricao: "Mexer 18 litros de tinta no braço é exaustivo. Use este acessório na furadeira para uma mistura perfeita em segundos.",
            link: "https://mercadolivre.com/sec/2dsnjPH",
            imagem: "/imgs/misturador_tinta002.webp"
        }
    ],

    // Categoria: Média Escolar
    media_escolar: [
        {
            titulo: "Calculadora Científica FX-82",
            etiqueta: "📐 Essencial",
            descricao: "Não perca pontos em prova por erro de conta. A ferramenta obrigatória para matemática e ciências.",
            link: "https://www.amazon.com.br/Calculadora-Cient%C3%ADfica-Casio-FX-82MS-2-Edi%C3%A7%C3%A3o/dp/B00AXHBBXU?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=E58LDS5GUW7N&dib=eyJ2IjoiMSJ9.QDBJVjvaeqJhu4JlqYWW0lhKISsORLWsL2j6gLAnzci8MXB9toMSbCBbYvzzQP-mPlXzCPm1Drjw8ResIg8JgCSxc0UO069tMPl69GR-MN_Arx4ZwKu7F2qAxPI7izMqSc8xQxoiD_CyOy2UAgQzcaAPQI5r0JBMBeg-r2ixWS_QJf6Vx8qYHp4KCuJ0d_nHl_Ez_RtDOxGIx7NYY-cqcZXYux4LHcNo3Eo9lIxEKs_rZGdFrSKvOGv6SOorn1R6_PM6HoMQ8fUNUTPcxAAtmbbrAwhl-rkhha74ndB3vfc.kwUywNn6yMap5c93uvTIdPWGgYRxGK_QrPKqrxl-dLM&dib_tag=se&keywords=calculadora+cientifica+fx-82&qid=1770311627&sprefix=calculadora+cient%C3%ADfica+fx-82%2Caps%2C269&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=1b418497a406496387e2aa6163ba9af3&ref_=as_li_ss_tl",
            imagem: "/imgs/calculadora001.jpg"
        },
        {
            titulo: "Calculadora Científica FX-82",
            etiqueta: "📐 Essencial",
            descricao: "Não perca pontos em prova por erro de conta. A ferramenta obrigatória para matemática e ciências.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "/imgs/calculadora002.webp"
        },
        {
            titulo: "Agenda Anual com Planner 2026",
            etiqueta: "🗓️ Organização",
            descricao: "Anotar as notas é o primeiro passo para controlá-las. Planeje suas provas e mantenha a média em dia.",
            link: "https://mercadolivre.com/sec/1PbHYTL",
            imagem: "/imgs/agenda001.webp"
        },
        {
            titulo: "AGENDA 2026",
            etiqueta: "🗓️ Organização",
            descricao: "Anotar as notas é o primeiro passo para controlá-las. Planeje suas provas e mantenha a média em dia.",
            link: "https://www.amazon.com.br/DFENSE-AGENDA-2025-PRETA-ESPIRAL/dp/B0DG3HJ3FN?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=BIXSSKEXFJV3&dib=eyJ2IjoiMSJ9.3aN9x0QEXs43E_IiI38Y5gzOF_InCRLb9UiuM6lYlKRbqqQdaJW7Rp4464XRrE0n0T-Iiufrx9E-Z6ukwYhcHKn-O9tZxNJsi8w6TjpuSphkUTmsTE4b5wQnu7BpbZu0kk0zgdIZ8EkXFnGBp1sSUtS9H_QiJjsW0mDqcJ9lWoWTnZlF15Ahvft44NOIc8D_Q8_fAbwCY8cAjR5GnzuRRsNz57OEw1yBrlrmzR08WClrlhke37nw18ihpQKHr5pqvD0Ho5OrrjCY0rneFfVmnfjDYgYVttE1X662MWPKsCk.gHdOV4TUwfUepOa98Hot96ukRrWGWSNuv2e3kL62HrI&dib_tag=se&keywords=Agenda+Acad%C3%AAmica+2026&qid=1770311918&sprefix=agenda+acad%C3%AAmica+2026%2Caps%2C251&sr=8-2&linkCode=ll2&tag=portaldascont-20&linkId=86e2676be77451a84c92685a6f7071df&ref_=as_li_ss_tl",
            imagem: "/imgs/"
        },
        {
            titulo: "Kit Marcadores de Texto",
            etiqueta: "🎨 Memorização",
            descricao: "Estudos mostram que cores ajudam o cérebro a reter informações. Destaque o importante e aprenda mais rápido.",
            link: "https://www.amazon.com.br/STAEDTLER-Marca-Texto-Textsurfer-Durabilidade/dp/B084DYJXQK?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=1O0LAE2DLO1M6&dib=eyJ2IjoiMSJ9.V91G9E-gS8jSLkEiKfg9WJTVDJOpXSCP_DRxDrKv6fJymFUw9RoR8XMzo60niaFmyuXug1CqIym0vtYeWoG8Qd5WXBIgWgfEyUCYHSKsxjwecGER9Y88HZLkjtEooW9JTiYImPcBJQh0zFvf5yEH2HUcgocfwzHwFSE4b8qi_NRvJl9D1_OccJWPSJLyxHPq_010tcQJrHBUQYTv01khF__EDxMMCg3dE2HVzUG2KXVOqbEOYkuFBCyBZwvVI0lRT7BUr-QgmPRCUX_UVaPQmA7T0o2J_IZPxcsp0a4zxig.hmimy3ADAnV3ueb-HXn9zbObKeqM14W9fM7LJrDmKp8&dib_tag=se&keywords=kit+marcador+texto&qid=1770312293&sprefix=kit+marcadores+texto%2Caps%2C238&sr=8-3-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=45f065e892a631ef18dddbece090ef1d&ref_=as_li_ss_tl",
            imagem: "/imgs/marcatexto001.jpg"
        },
        {
            titulo: "Kit Marcadores de Texto",
            etiqueta: "🎨 Memorização",
            descricao: "Estudos mostram que cores ajudam o cérebro a reter informações. Destaque o importante e aprenda mais rápido.",
            link: "https://mercadolivre.com/sec/2GUJxtA",
            imagem: "/imgs/marcatexto002.webp"
        },
        {
            titulo: "Cronômetro Pomodoro",
            etiqueta: "⏳ Foco Total",
            descricao: "A técnica de 25 minutos focados muda o jogo. Otimize seu tempo de estudo e descanse o cérebro direito.",
            link: "https://mercadolivre.com/sec/2JV16H9",
            imagem: "/imgs/cronometro001.webp"
        },
        {
            titulo: "Cronômetro Pomodoro",
            etiqueta: "⏳ Foco Total",
            descricao: "A técnica de 25 minutos focados muda o jogo. Otimize seu tempo de estudo e descanse o cérebro direito.",
            link: "https://www.amazon.com.br/Temporizador-Cube-Pomodoro-produtividade-personalizada/dp/B0D1KMKQ23?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=G7VAMP3QY795&dib=eyJ2IjoiMSJ9.-umlgGuLfNbbF0kUKAANQydQ9FuYYDXWURo5M9zsu6Xq5Tukof_nirb_6BXbp37vrcaemVF3gnzFIHxRY3-t4ArjzXw7ClFajZDIS2SW0wlZIgzuj-Ps4kTTKIG_At_aWoImkV4-3EHeR-j9KflH2qkgnqfX97tbbnYVHlbK89mlTDIeebJ33lzZlLItmyFpmtYilTHSLDnrg5MNXxMXcDJQ7m9eo6IOJefT_NlLQOt4jq2Ajdz1YHS3BEvy0zQLbt7mvozgEuOD45UHZ3adjVis2sGTcv7Wn2D5nzTedqo.M-7sIi2PJ4X1_MJjE5mcyNpx-Ko7xaW0dkCCX0dVths&dib_tag=se&keywords=cronometro%2Bpomodoro&qid=1770312696&sprefix=cron%C3%B4metro%2Bpomodoro%2Caps%2C241&sr=8-5&ufe=app_do%3Aamzn1.fos.6d798eae-cadf-45de-946a-f477d47705b9&th=1&linkCode=ll2&tag=portaldascont-20&linkId=e5b247f1751bc7eeaaaa32740da1c2b1&ref_=as_li_ss_tl",
            imagem: "/imgs/cronometro002.jpg"
        },
        {
            titulo: "Luminária de Mesa LED com USB",
            etiqueta: "💡 Luz Ideal",
            descricao: "Estudar à luz fraca cansa a vista. Ilumine sua escrivaninha e evite dores de cabeça nas madrugadas.",
            link: "https://mercadolivre.com/sec/2bVZrbc",
            imagem: "/imgs/luminaria001.webp"
        },
        {
            titulo: "Luminária de Mesa",
            etiqueta: "💡 Luz Ideal",
            descricao: "Estudar à luz fraca cansa a vista. Ilumine sua escrivaninha e evite dores de cabeça nas madrugadas.",
            link: "https://www.amazon.com.br/Gen%C3%A9rico-Lumin%C3%A1ria-Articul%C3%A1vel-Articulada-Interruptor/dp/B0DPVXCDXQ?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&content-id=amzn1.sym.791fcb20-57e9-42fb-b3a2-cf81ce97946b%3Aamzn1.sym.791fcb20-57e9-42fb-b3a2-cf81ce97946b&crid=7HFKLNKA7U9D&cv_ct_cx=luminaria%2Bde%2Bmesa%2Bled%2Bcom%2Busb&keywords=luminaria%2Bde%2Bmesa%2Bled%2Bcom%2Busb&pd_rd_i=B0DPVXCDXQ&pd_rd_r=183602ed-98ad-4f36-afee-fb4d06464bd2&pd_rd_w=wwb6c&pd_rd_wg=fu65f&pf_rd_p=791fcb20-57e9-42fb-b3a2-cf81ce97946b&pf_rd_r=B3TCCCFZX6TWX2ZP8H0A&qid=1770312818&sbo=huHOFq4ZWZr%2Fiy99y1naGA%3D%3D&sprefix=lumin%C3%A1ria%2Bde%2Bmesa%2Bled%2Bcom%2Busb%2Caps%2C241&sr=1-1-fc613efb-89a5-4ecc-a266-4feb7aba5db9-spons&aref=rhdpWolUwv&sp_csd=d2lkZ2V0TmFtZT1zcF9zZWFyY2hfdGhlbWF0aWM&th=1&linkCode=ll2&tag=portaldascont-20&linkId=d5a4acd205cd78f2ba43d848db636848&ref_=as_li_ss_tl",
            imagem: "/imgs/luminaria002.jpg"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Melhore sua postura ao estudar no computador. Eleve a tela e proteja sua coluna cervical.",
            link: "https://www.amazon.com.br/Notebook-Ergon%C3%B4mico-Ajust%C3%A1vel-Regul%C3%A1vel-Universal/dp/B0F1C2GCK4?dib=eyJ2IjoiMSJ9.TTLhiJIQ_k7k-dwtL2Ady56lCpdGmHa_nrqvTZYIvg52xPClzyXQCKqUTqVA0ko_fxCLtz_NTu40TZ13ESqbnkBwPiraD4_tckSe2ziWOiXSRHICrzHM3PDlOF5WKHpzQPBjyFGQV7n0jd8rHj72mY6wI9Ug0aJfEVEn4zEjS5XriZGkra3RWcNL1ed7L1zUKfJ72Bt0_zrGADOcrQ5YL_-B7oE2hqq-KZN14doOCAz2ED978WwBH0CYuPGAkD9fEAXhihI73VV3fx83E5eIY7GfEYcQ4nCjfzVeiq15AUk.TpycuB63BUrN7suPtSLMADiKmrLZOky9sHR3ChwZLQ4&dib_tag=se&keywords=suporte+ajustavel+para+notebook&qid=1770313183&sr=8-6&linkCode=ll2&tag=portaldascont-20&linkId=4c45a3407c685cb4c21a173580556823&ref_=as_li_ss_tl",
            imagem: "/imgs/suporte_notebook001.jpg"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Melhore sua postura ao estudar no computador. Eleve a tela e proteja sua coluna cervical.",
            link: "https://mercadolivre.com/sec/1VfqVwZ",
            imagem: "/imgs/suporte_notebook002.webp"
        },
        {
            titulo: "Cadeira Giratória Ergonômica",
            etiqueta: "🦴 Postura",
            descricao: "Você passa horas sentado. Invista em uma cadeira que não doa as costas e mantenha o foco na matéria, não no desconforto.",
            link: "https://www.amazon.com.br/escrit%C3%B3rio-ergon%C3%B4mico-independente-respir%C3%A1vel-ajust%C3%A1vel%EF%BC%88Preto/dp/B0CG8J3N2H?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=OW6SC0PSVUOK&dib=eyJ2IjoiMSJ9.-_h8YOe-GMqatuoLhl-QRLcvtHnasizShYQqGpJCzs5NqQc6kQubDXvg9UoOKY-QCJt1VkAIV0ncyEToXcjzaYNETtiOVCOKRf8KP9LGfadE1ElyAf7Z258mHh33bS_jmha8_sFALj8cZjWOXv2XY3X4lKTAjqseoKNSy7TYduH_TsHVmwCeK_MJPf6r1TE5UZjKOHykkzjLFUyHzdQxuEh_zX_wx8TrTCDRgLqqk1cbN2mKyMK9AZ6COzGGLZEwZUcKsuAqsZOTj48UIOGgcMBLxKyYir7nfRVEANBfH6M.UrdnLTBPgUBIpSXFnqMsiBzQTbxHu9KfEnKvKrTHW_w&dib_tag=se&keywords=Cadeira%2BGirat%C3%B3ria%2BErgon%C3%B4mica&qid=1770313393&sprefix=cadeira%2Bgirat%C3%B3ria%2Bergon%C3%B4mica%2Caps%2C269&sr=8-5&ufe=app_do%3Aamzn1.fos.e05b01e0-91a7-477e-a514-15a32325a6d6&th=1&linkCode=ll2&tag=portaldascont-20&linkId=970bcc9ea929fa545af4c16fc8d0eef2&ref_=as_li_ss_tl",
            imagem: "/imgs/cadeira_gira001.jpg"
        },
        {
            titulo: "Cadeira Giratória Ergonômica",
            etiqueta: "🦴 Postura",
            descricao: "Você passa horas sentado. Invista em uma cadeira que não doa as costas e mantenha o foco na matéria, não no desconforto.",
            link: "https://mercadolivre.com/sec/2FnjZ8S",
            imagem: "/imgs/cadeira_gira002.webp"
        },
        {
            titulo: "Mochila Escolar com Compartimento Laptop",
            etiqueta: "🧳 Tudo em Ordem",
            descricao: "Leve seus livros, calculadora e notebook com segurança. Compartimentos para manter cada coisa no seu lugar.",
            link: "https://www.amazon.com.br/Expansivel-Masculina-Executiva-Imperme%C3%A1vel-Refor%C3%A7ada/dp/B0DWMZ9PPQ?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=29HY350QKKO0W&dib=eyJ2IjoiMSJ9.1FHD2CoiWrPCtHjnwX04vHFhN4VW8zQWQJtB7NUFwVXMrLBOPRDO3FfPZNxis7soUpwVS9M5_ZG3NP1K9iG8MkW5l6PkNXbiyFwYey7Ej6X3Btb4pAISi9fZJcb3SMJqDQHgAfjW1G-j9GBsSxp8iPbRYn3Vq_e7kT8uUka-jANkbbyI7MN2q6TpTH-AG-paTw4B9b3AJEr1p24DalzZo-UBwBc3N-xNIMOIRkCV5zvLSOUs4VlzPmoy1ip3_TReQBggOPMenh9anyF5vtZn-mSeNR_5wzA9Pb6t0ZV0sgI.XZmZ46uHm6TAC4jQXC1MzUfl80Syp-4ahP9HHTLSkYE&dib_tag=se&keywords=Mochila%2BEscolar%2Bcom%2BCompartimento%2BLaptop&qid=1770313617&sprefix=mochila%2Bescolar%2Bcom%2Bcompartimento%2Blaptop%2Caps%2C258&sr=8-6&ufe=app_do%3Aamzn1.fos.6121c6c4-c969-43ae-92f7-cc248fc6181d&th=1&linkCode=ll2&tag=portaldascont-20&linkId=f27ecfeb00619023dd2a049e72f3e271&ref_=as_li_ss_tl",
            imagem: "/imgs/mochila001.jpg"
        },
        {
            titulo: "Mochila Escolar com Compartimento Laptop",
            etiqueta: "🧳 Tudo em Ordem",
            descricao: "Leve seus livros, calculadora e notebook com segurança. Compartimentos para manter cada coisa no seu lugar.",
            link: "https://mercadolivre.com/sec/1vQdpr1",
            imagem: "/imgs/mochila002.webp"
        },
        {
            titulo: "Fone de Ouvido com Cancelamento de Ruído",
            etiqueta: "🤫 Silêncio",
            descricao: "Casa barulhenta? Bloqueie o mundo externo e crie seu próprio bunker de concentração para estudar.",
            link: "https://www.amazon.com.br/soundcore-Cancelamento-Poderosos-Reprodu%C3%A7%C3%A3o-Bluetooth/dp/B0CRTYZG5C?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=303FZI935EB3Y&dib=eyJ2IjoiMSJ9.uXc4CoDczaGqN6a_x8XD7zQukBJHx-JtpVkhXk9TDWD1cdTjY61S9_s1ZwNq7s7_edz1Y2BX4sEtBJtsUz2An4vPuMWaUhslepCzo66nT1ESf_VW3mHTsUGmBhXNHQgAc1oDiXbvvcBOmGltSEYTC7PKjn2IYPml-50wrxDgt5JxEW97DsXNwvxlefXGgu40SG0-XJJhOcuz5M2xOFjLhKGteuJwFhScWyfsFJ55NINsi-Wc-QSsxDJwCUvkO3zG76HHL5FK_7d-vDXr8ONZZs7jisQpmVW6VVyfA2TheHs.X9W1tzdU_lpwHB0mov1l9_GrPnl0DJH32aBwYJSOdDo&dib_tag=se&keywords=Fone%2Bde%2BOuvido%2Bcom%2BCancelamento%2Bde%2BRu%C3%ADdo&qid=1770313812&sprefix=fone%2Bde%2Bouvido%2Bcom%2Bcancelamento%2Bde%2Bru%C3%ADdo%2Caps%2C265&sr=8-3-spons&ufe=app_do%3Aamzn1.fos.fcd6d665-32ba-4479-9f21-b774e276a678&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=portaldascont-20&linkId=0e9454917b75817b4b32dc306d08a479&ref_=as_li_ss_tl",
            imagem: "/imgs/fone_ouvido001.jpg"
        },
        {
            titulo: "Fone de Ouvido com Cancelamento de Ruído",
            etiqueta: "🤫 Silêncio",
            descricao: "Casa barulhenta? Bloqueie o mundo externo e crie seu próprio bunker de concentração para estudar.",
            link: "https://mercadolivre.com/sec/1rubznZ",
            imagem: "/imgs/fone_ouvido002.webp"
        }
    ],

    // Categoria: Piso
    piso: [
        {
            titulo: "Box de Porcelanato Polido",
            etiqueta: "🏠 Elegância",
            descricao: "O acabamento que valoriza o imóvel. Durabilidade extrema e fácil limpeza para áreas de alto tráfego.",
            link: "https://amzn.to/45OwxAU",
            imagem: "/imgs/box_nicho.jpg"
        },
        {
            titulo: "Box de Porcelanato Polido",
            etiqueta: "🏠 Elegância",
            descricao: "O acabamento que valoriza o imóvel. Durabilidade extrema e fácil limpeza para áreas de alto tráfego.",
            link: "https://mercadolivre.com/sec/1k2TzFS",
            imagem: "/imgs/box_nicho002.webp"
        },
        {
            titulo: "Piso Laminado Madeira Natural",
            etiqueta: "🪚 Instalação Fácil",
            descricao: "Quer o visual de madeira sem o trabalho de porcelanato? Sistema de encaixe que dispensa cola.",
            link: "https://amzn.to/4rxJPKm",
            imagem: "/imgs/piso_laminado001.jpg"
        },
        {
            titulo: "Piso Laminado Madeira Natural",
            etiqueta: "🪚 Instalação Fácil",
            descricao: "Quer o visual de madeira sem o trabalho de porcelanato? Sistema de encaixe que dispensa cola.",
            link: "https://mercadolivre.com/sec/1rnk1HS",
            imagem: "/imgs/piso_laminado002.webp"
        },
        {
            titulo: "Manta Asfáltica",
            etiqueta: "🛡️ Impermeabilização",
            descricao: "Calculou o piso do banheiro ou cozinha? Não esqueça da manta. Impede infiltração e protege sua obra.",
            link: "https://amzn.to/4ahcFaW",
            imagem: "/imgs/manta_asfaltica001.jpg"
        },
        {
            titulo: "Manta Asfáltica",
            etiqueta: "🛡️ Impermeabilização",
            descricao: "Calculou o piso do banheiro ou cozinha? Não esqueça da manta. Impede infiltração e protege sua obra.",
            link: "https://mercadolivre.com/sec/2znRbQw",
            imagem: "/imgs/manta_asfaltica002.webp"
        },
        {
            titulo: "Desempenadeira Denteada 8mm",
            etiqueta: "🔧 Ferramenta Chave",
            descricao: "A argamassa precisa ser aplicada de forma correta. O dente de 8mm garante a cola certa para porcelanatos.",
            link: "https://mercadolivre.com/sec/21VSk3D",
            imagem: "/imgs/desempenadeira001.webp"
        },
        {
            titulo: "Desempenadeira Denteada 8mm",
            etiqueta: "🔧 Ferramenta Chave",
            descricao: "A argamassa precisa ser aplicada de forma correta. O dente de 8mm garante a cola certa para porcelanatos.",
            link: "https://amzn.to/4qX7mEF",
            imagem: "/imgs/desempenadeira002.jpg"
        },
        {
            titulo: "Cruzetas para Porcelanato",
            etiqueta: "📐 Alinhamento Perfeito",
            descricao: "O segredo dos junções retas. Garante o espaçamento idêntico entre todas as peças.",
            link: "https://mercadolivre.com/sec/1zquMqF",
            imagem: "/imgs/cruzeta001.webp"
        },
        {
            titulo: "Cruzetas para Porcelanato",
            etiqueta: "📐 Alinhamento Perfeito",
            descricao: "O segredo dos junções retas. Garante o espaçamento idêntico entre todas as peças.",
            link: "https://mercadolivre.com/sec/2EbP4P7",
            imagem: "/imgs/cruzeta002.webp"
        },
        {
            titulo: "Cortador de Cerâmica Manual",
            etiqueta: "✂️ Precisão",
            descricao: "Evite quebras desnecessárias. Faça cortes limpos e precisos com esta ferramenta indispensável.",
            link: "https://amzn.to/4khvaR8",
            imagem: "/imgs/cortador_piso001.jpg"
        },
        {
            titulo: "Cortador de Cerâmica Manual",
            etiqueta: "✂️ Precisão",
            descricao: "Evite quebras desnecessárias. Faça cortes limpos e precisos com esta ferramenta indispensável.",
            link: "https://mercadolivre.com/sec/2QBE3eS",
            imagem: "/imgs/cortador_piso002.webp"
        },
        {
            titulo: "Kit Niveladores de Piso",
            etiqueta: "📏 Nível Zero",
            descricao: "Não arrisque deixar 'pernas de pau'. Este sistema elimina as diferenças de altura entre as peças instantaneamente.",
            link: "https://amzn.to/4a0qRWX",
            imagem: "/imgs/niveladores001.jpg"
        },
        {
            titulo: "Kit Niveladores de Piso",
            etiqueta: "📏 Nível Zero",
            descricao: "Não arrisque deixar 'pernas de pau'. Este sistema elimina as diferenças de altura entre as peças instantaneamente.",
            link: "https://mercadolivre.com/sec/1i9acVP",
            imagem: "/imgs/niveladores002.webp"
        },
        {
            titulo: "Rejunte Epoxy Flexível",
            etiqueta: "🎨 O Toque Final",
            descricao: "A diferença entre um piso amador e um profissional está no rejunte. Resistente a manchas e umidade.",
            link: "https://amzn.to/3MdHwx2",
            imagem: "/imgs/rejunte001.jpg"
        },
        {
            titulo: "Rejunte Epoxy Flexível",
            etiqueta: "🎨 O Toque Final",
            descricao: "A diferença entre um piso amador e um profissional está no rejunte. Resistente a manchas e umidade.",
            link: "https://mercadolivre.com/sec/1pNpN9z",
            imagem: "/imgs/rejunte002.webp"
        },
        {
            titulo: "Serra Mármores Elétrica Profissional",
            etiqueta: "⚡ Para Profissionais",
            descricao: "Se o projeto é grande, o cortador manual não aguenta. Cortes a úmido sem poeira e com precisão cirúrgica.",
            link: "https://mercadolivre.com/sec/1W4JJ7d",
            imagem: "/imgs/serra_marmore001.webp"
        },
        {
            titulo: "Serra Mármores Elétrica Profissional",
            etiqueta: "⚡ Para Profissionais",
            descricao: "Se o projeto é grande, o cortador manual não aguenta. Cortes a úmido sem poeira e com precisão cirúrgica.",
            link: "https://amzn.to/3NXcydf",
            imagem: "/imgs/serra_marmore002.jpg"
        },
        {
            titulo: "Joelheiras Profissionais de Trabalho",
            etiqueta: "🦿 Proteção",
            descricao: "Assentar piso é trabalho duro. Proteja seus joelhos e trabalhe por mais tempo sem dor.",
            link: "https://mercadolivre.com/sec/24GRFxc",
            imagem: "/imgs/joelheiras001.webp"
        },
        {
            titulo: "Joelheiras Profissionais de Trabalho",
            etiqueta: "🦿 Proteção",
            descricao: "Assentar piso é trabalho duro. Proteja seus joelhos e trabalhe por mais tempo sem dor.",
            link: "https://amzn.to/46bHcpF",
            imagem: "/imgs/joelheiras002.jpg"
        },
    ],

    // Categoria: Cimento
    cimento: [
        {
            titulo: "Betoneira 150L Profissional",
            etiqueta: "⚡ Potência e Rapidez",
            descricao: "Misturar cimento na pá é um trabalho pesado. Economize tempo e garanta uma massa homogênea com esta betoneira.",
            link: "https://mercadolivre.com/sec/2Ec4eui",
            imagem: "/imgs/betoneira001.webp"
        },
        {
            titulo: "Betoneira 120L Profissional",
            etiqueta: "⚡ Potência e Rapidez",
            descricao: "Misturar cimento na pá é um trabalho pesado. Economize tempo e garanta uma massa homogênea com esta betoneira.",
            link: "https://amzn.to/4qDLhdD",
            imagem: "/imgs/betoneira002.jpg"
        },
        {
            titulo: "Desempenadeira de Cimento",
            etiqueta: "🔧 O Acabamento",
            descricao: "O segredo de um piso liso está na ferramenta. Aço inox de qualidade para um acabamento profissional.",
            link: "https://amzn.to/4tqb77w",
            imagem: "/imgs/desempenadeira003.jpg"
        },
        {
            titulo: "Desempenadeira de Cimento",
            etiqueta: "🔧 O Acabamento",
            descricao: "O segredo de um piso liso está na ferramenta. Aço inox de qualidade para um acabamento profissional.",
            link: "https://mercadolivre.com/sec/1rKZFAc",
            imagem: "/imgs/desempenadeira004.webp"
        },
        {
            titulo: "Carrinho de Mão com Pneu",
            etiqueta: "🛒 Transporte Fácil",
            descricao: "Não carregue sacos de cimento nas costas. Mova areia, brita e massa sem esforço e sem se machucar.",
            link: "https://amzn.to/4a0FYzL",
            imagem: "/imgs/carrinho_mao001.jpg"
        },
        {
            titulo: "Carrinho de Mão com Pneu",
            etiqueta: "🛒 Transporte Fácil",
            descricao: "Não carregue sacos de cimento nas costas. Mova areia, brita e massa sem esforço e sem se machucar.",
            link: "https://mercadolivre.com/sec/15d8Ccq",
            imagem: "/imgs/carrinho_mao002.webp"
        },
        {
            titulo: "Enxada de Corte Alça Longa",
            etiqueta: "⛏️ Preparo do Solo",
            descricao: "Cimento não cola na terra solta. Prepare o terreno e misture a massa com a enxada certa para o serviço",
            link: "https://mercadolivre.com/sec/1RgBq8G",
            imagem: "/imgs/enxada002.webp"
        },
        {
            titulo: "Enxada Alça Longa",
            etiqueta: "⛏️ Preparo do Solo",
            descricao: "Cimento não cola na terra solta. Prepare o terreno e misture a massa com a enxada certa para o serviço",
            link: "https://amzn.to/4rFpIKx",
            imagem: "/imgs/enxada001.jpg"
        },
        {
            titulo: "Vibrador de Imersão para Concreto",
            etiqueta: "🚀 Concreto Resistente",
            descricao: "Elimine bolhas de ar da sua massa. Use o vibrador e garanta que sua laje ou pilar fique sólido e sem falhas.",
            link: "https://amzn.to/4r5m0tM",
            imagem: "/imgs/vibrador_concreto001.jpg"
        },
        {
            titulo: "Vibrador de Imersão para Concreto",
            etiqueta: "🚀 Concreto Resistente",
            descricao: "Elimine bolhas de ar da sua massa. Use o vibrador e garanta que sua laje ou pilar fique sólido e sem falhas.",
            link: "https://mercadolivre.com/sec/1y69QiS",
            imagem: "/imgs/vibrador_concreto002.webp"
        },
        {
            titulo: "Luvas de Proteção",
            etiqueta: "🧤 Mãos Seguras",
            descricao: "Cimento queima a pele e causa irritações severas. Use luvas anatômicas que proporcionam liberdade de movimento, essencial para tarefas precisas durante todo o manuseio.",
            link: "https://amzn.to/4rdGiB6",
            imagem: "/imgs/luvas001.jpg"
        },
        {
            titulo: "Luvas de Proteção Impermeáveis",
            etiqueta: "🧤 Mãos Seguras",
            descricao: "Cimento queima a pele e causa irritações severas. Use luvas anatômicas que proporcionam liberdade de movimento, essencial para tarefas precisas durante todo o manuseio.",
            link: "https://mercadolivre.com/sec/12AHyDm",
            imagem: "/imgs/luvas002.webp"
        },
        {
            titulo: "Máscara Respiratória PFF2",
            etiqueta: "😷 Proteja seus Pulmões",
            descricao: "A poeira de cimento é silicato e causa doenças graves a longo prazo. Nunca misture cimento sem proteção respiratória.",
            link: "https://amzn.to/4km3gU1",
            imagem: "/imgs/mascara001.jpg"
        },
        {
            titulo: "Máscara Respiratória PFF2",
            etiqueta: "😷 Proteja seus Pulmões",
            descricao: "A poeira de cimento é silicato e causa doenças graves a longo prazo. Nunca misture cimento sem proteção respiratória.",
            link: "https://mercadolivre.com/sec/1rVaojZ",
            imagem: "/imgs/mascara002.webp"
        },
        {
            titulo: "Óculos de Segurança",
            etiqueta: "👓 Visão Protegida",
            descricao: "Fragmentos de concreto ou respingos de cal podem causar cegueira. Segurança em primeiro lugar.",
            link: "https://amzn.to/4r6qa4D",
            imagem: "/imgs/oculos001.jpg"
        },
        {
            titulo: "Óculos de Segurança",
            etiqueta: "👓 Visão Protegida",
            descricao: "Fragmentos de concreto ou respingos de cal podem causar cegueira. Segurança em primeiro lugar.",
            link: "https://mercadolivre.com/sec/1a7pdrC",
            imagem: "/imgs/oculos002.webp"
        }
    ],

    // Categoria: IMC
    imc: [
        {
            titulo: "Balança Digital Inteligente",
            etiqueta: "📊 Monitoramento",
            descricao: "O peso muda, mas a composição corporal conta mais. Esta balança conecta ao seu celular para medir gordura e músculos.",
            link: "https://mercadolivre.com/sec/1feZ8CS",
            imagem: "/imgs/balanca001.webp"
        },
        {
            titulo: "Balança Digital Inteligente",
            etiqueta: "📊 Monitoramento",
            descricao: "O peso muda, mas a composição corporal conta mais. Esta balança conecta ao seu celular para medir gordura e músculos.",
            link: "https://amzn.to/4bED1pR",
            imagem: "/imgs/balanca002.jpg"
        },
        {
            titulo: "Fita Métrica Corporal",
            etiqueta: "📉 Mede o Progresso",
            descricao: "Às vezes o peso não desce, mas o corpo diminui. A fita métrica é a melhor ferramenta para acompanhar a queima de gordura.",
            link: "https://mercadolivre.com/sec/2aGDMbE",
            imagem: "/imgs/fita_metrica001.webp"
        },
        {
            titulo: "Fita Métrica Corporal",
            etiqueta: "📉 Mede o Progresso",
            descricao: "Às vezes o peso não desce, mas o corpo diminui. A fita métrica é a melhor ferramenta para acompanhar a queima de gordura.",
            link: "https://amzn.to/3NZCogK",
            imagem: "/imgs/fita_metrica002.jpg"
        },
        {
            titulo: "Kit Elásticos para Treino",
            etiqueta: "💪 Casa Academia",
            descricao: "Monte sua academia em casa. Treine todo o corpo sem precisar de equipamentos caros ou ocupar muito espaço.",
            link: "https://amzn.to/46ATojD",
            imagem: "/imgs/elasticos001.jpg"
        },
        {
            titulo: "Kit Elásticos para Treino",
            etiqueta: "💪 Casa Academia",
            descricao: "Monte sua academia em casa. Treine todo o corpo sem precisar de equipamentos caros ou ocupar muito espaço.",
            link: "https://mercadolivre.com/sec/1kYPBTz",
            imagem: "/imgs/elasticos002.webp"
        },
        {
            titulo: "Tapete de Yoga Antiderrapante",
            etiqueta: "🧘 Conforto",
            descricao: "Seus pés merecem respeito. Inicie seus exercícios com um tapete de alta densidade que protege suas articulações.",
            link: "https://amzn.to/3Zmp8Fs",
            imagem: "/imgs/tapete_yoga001.jpg"
        },
        {
            titulo: "Tapete de Yoga Antiderrapante",
            etiqueta: "🧘 Conforto",
            descricao: "Seus pés merecem respeito. Inicie seus exercícios com um tapete de alta densidade que protege suas articulações.",
            link: "https://mercadolivre.com/sec/2YAGpxY",
            imagem: "/imgs/tapete_yoga002.webp"
        },
        {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Precisão na Dieta",
            descricao: "Advinhar a porção é o erro número 1. Pese seus alimentos para controlar calorias com exatidão.",
            link: "https://amzn.to/4rA8E8u",
            imagem: "/imgs/balanca_cozinha002.jpg"
        },
        {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Precisão na Dieta",
            descricao: "Advinhar a porção é o erro número 1. Pese seus alimentos para controlar calorias com exatidão.",
            link: "https://mercadolivre.com/sec/2Xa4389",
            imagem: "/imgs/balanca_cozinha003.webp"
        },
        {
            titulo: "Smartwatch com Contador de Passos",
            etiqueta: "🏃 Atividade Diária",
            descricao: "O corpo em movimento queima calorias. Monitore seus passos, batimentos cardíacos e calorias gastas no dia a dia.",
            link: "https://amzn.to/4qi2JUB",
            imagem: "/imgs/smartwatch001.jpg"
        },
        {
            titulo: "Smartwatch com Contador de Passos",
            etiqueta: "🏃 Atividade Diária",
            descricao: "O corpo em movimento queima calorias. Monitore seus passos, batimentos cardíacos e calorias gastas no dia a dia.",
            link: "https://mercadolivre.com/sec/137zfrk",
            imagem: "/imgs/smartwatch002.webp"
        },
        {
            titulo: "Kit Coqueleteira e copo",
            etiqueta: "🥤 Pós-Treino",
            descricao: "Organização é a chave. Leve seu shake proteico ou lanche saudável para onde for com este kit prático.",
            link: "https://amzn.to/4ajQwZN",
            imagem: "/imgs/coqueleteira001.jpg"
        },
        {
            titulo: "Kit Coqueleteira e copo",
            etiqueta: "🥤 Pós-Treino",
            descricao: "Organização é a chave. Leve seu shake proteico ou lanche saudável para onde for com este kit prático.",
            link: "https://mercadolivre.com/sec/1wSK47S",
            imagem: "/imgs/coqueleteira002.webp"
        },
        {
            titulo: "Garrafa Térmica 1 Litro",
            etiqueta: "💧 Hidratação",
            descricao: "Beber água acelera o metabolismo. Mantenha sua água gelada por horas com esta garrafa de alta durabilidade.",
            link: "https://amzn.to/3Oqw9m6",
            imagem: "/imgs/garrafa_termica001.jpg"
        },
        {
            titulo: "Garrafa Térmica 1 Litro",
            etiqueta: "💧 Hidratação",
            descricao: "Beber água acelera o metabolismo. Mantenha sua água gelada por horas com esta garrafa de alta durabilidade.",
            link: "https://mercadolivre.com/sec/2anQwMr",
            imagem: "/imgs/garrafa_termica002.webp"
        }
        ,
        {
            titulo: "Jump (Pula Pula) Ergométrico",
            etiqueta: "🔥 Cardio Intenso",
            descricao: "Queime calorias rapidamente em casa. O jump é um dos equipamentos mais eficientes para treino cardiovascular de alto impacto.",
            link: "https://amzn.to/46lbPsA",
            imagem: "/imgs/jump001.jpg"
        },
        {
            titulo: "Jump (Pula Pula) Ergométrico",
            etiqueta: "🔥 Cardio Intenso",
            descricao: "Queime calorias rapidamente em casa. O jump é um dos equipamentos mais eficientes para treino cardiovascular de alto impacto.",
            link: "https://mercadolivre.com/sec/2jE8HZu",
            imagem: "/imgs/jump002.webp"
        }
        ,
        {
            titulo: "Halteres Ajustáveis (Par)",
            etiqueta: "🏋️ Força",
            descricao: "Aumente a carga aos poucos. Este par de halteres ocupa pouco espaço e evolui junto com sua força.",
            link: "https://amzn.to/4kpCESi",
            imagem: "/imgs/halteres001.jpg"
        },
        {
            titulo: "Halteres Ajustáveis (Par)",
            etiqueta: "🏋️ Força",
            descricao: "Aumente a carga aos poucos. Este par de halteres ocupa pouco espaço e evolui junto com sua força.",
            link: "https://mercadolivre.com/sec/1MXiRgi",
            imagem: "/imgs/halteres002.webp"
        }
    ],

    // Categoria: TMB
    tmb: [
        {
            titulo: "Balança Bioimpedância Smart",
            etiqueta: "📊 Monitoramento",
            descricao: "O peso muda, mas a composição corporal conta mais. Esta balança conecta ao seu celular para medir gordura e músculos.",
            link: "https://mercadolivre.com/sec/1feZ8CS",
            imagem: "/imgs/balanca001.webp"
        }, {
            titulo: "Balança Bioimpedância Smart",
            etiqueta: "📊 Monitoramento",
            descricao: "O peso muda, mas a composição corporal conta mais. Esta balança conecta ao seu celular para medir gordura e músculos.",
            link: "https://amzn.to/4bED1pR",
            imagem: "/imgs/balanca002.jpg"
        }, {
            titulo: "Adipômetro (Prega Cutânea)",
            etiqueta: "📏 Precisão Profissional",
            descricao: "A forma mais barata e precisa de medir gordura corporal. Cientificamente mais confiável que balanças comuns.",
            link: "https://amzn.to/4kmlZPv",
            imagem: "/imgs/adipometro001.jpg"
        }, {
            titulo: "Adipômetro (Prega Cutânea)",
            etiqueta: "📏 Precisão Profissional",
            descricao: "A forma mais barata e precisa de medir gordura corporal. Cientificamente mais confiável que balanças comuns.",
            link: "https://mercadolivre.com/sec/1FDETH3",
            imagem: "/imgs/adipometro002.webpsssss"
        }, {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Precisão na Dieta",
            descricao: "Advinhar a porção é o erro número 1. Pese seus alimentos para controlar calorias com exatidão.",
            link: "https://amzn.to/4rA8E8u",
            imagem: "/imgs/balanca_cozinha002.jpg"
        }, {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Precisão na Dieta",
            descricao: "Advinhar a porção é o erro número 1. Pese seus alimentos para controlar calorias com exatidão.",
            link: "https://mercadolivre.com/sec/2Xa4389",
            imagem: "/imgs/balanca_cozinha003.webp"
        }, {
            titulo: "Air Fryer 4L",
            etiqueta: "🍟 Comida Saudável",
            descricao: "Reduza calorias drasticamente sem abrir mão da crosta e sabor frito. O segredo da manutenção de peso.",
            link: "https://amzn.to/4raDZ24",
            imagem: "/imgs/airfryer_mondial001.jpg"
        }, {
            titulo: "Air Fryer 4L",
            etiqueta: "🍟 Comida Saudável",
            descricao: "Reduza calorias drasticamente sem abrir mão da crosta e sabor frito. O segredo da manutenção de peso.",
            link: "https://mercadolivre.com/sec/1yKxTuC",
            imagem: "/imgs/airfryer_mondial002.webp"
        }, {
            titulo: "Liquidificador Turbo",
            etiqueta: "🥤 Dieta Líquida",
            descricao: "Prepare vitaminas, sopas e smoothies saudáveis em segundos. Uma forma fácil de ingerir vegetais.",
            link: "https://mercadolivre.com/sec/1aXwfLi",
            imagem: "/imgs/liquidificador001.webp"
        }, {
            titulo: "Liquidificador Turbo",
            etiqueta: "🥤 Dieta Líquida",
            descricao: "Prepare vitaminas, sopas e smoothies saudáveis em segundos. Uma forma fácil de ingerir vegetais.",
            link: "https://amzn.to/4kjHOz3",
            imagem: "/imgs/liquidificador002.jpg"
        }, {
            titulo: "Potes Marmita herméticos (Kit)",
            etiqueta: "🍱 Organização",
            descricao: "Marmitar é a garantia de comer o que você calculou. Organize sua semana com este kit prático.",
            link: "https://amzn.to/4rBnlID",
            imagem: "/imgs/kit_pote_vidro001.jpg"
        }, {
            titulo: "Potes Marmita herméticos (Kit)",
            etiqueta: "🍱 Organização",
            descricao: "Marmitar é a garantia de comer o que você calculou. Organize sua semana com este kit prático.",
            link: "https://mercadolivre.com/sec/2kUfRgh",
            imagem: "/imgs/kit_pote_vidro002.webp"
        }, {
            titulo: "Descascador de vegetais",
            etiqueta: "🥗 Mais Legumes",
            descricao: "Se comer bem é chato, facilita o processo. Corte vegetais em segundos para aumentar o consumo de fibras.",
            link: "https://mercadolivre.com/sec/2PmUr1v",
            imagem: "/imgs/descascador001.webp"
        }, {
            titulo: "Descascador de vegetais",
            etiqueta: "🥗 Mais Legumes",
            descricao: "Se comer bem é chato, facilita o processo. Corte vegetais em segundos para aumentar o consumo de fibras.",
            link: "https://amzn.to/3ZUntHf",
            imagem: "/imgs/descascador002.jpg"
        }, {
            titulo: "Garrafa Térmica 1.5L",
            etiqueta: "💧 Hidratação",
            descricao: "Beber água acelera o metabolismo. Tenha água gelada o dia todo com esta garrafa de alta capacidade.",
            link: "https://mercadolivre.com/sec/1wY3CHK",
            imagem: "/imgs/garrafa_termica003.webp"
        }, {
            titulo: "Garrafa Térmica 800ml",
            etiqueta: "💧 Hidratação",
            descricao: "Beber água acelera o metabolismo. Tenha água gelada o dia todo com esta garrafa de alta capacidade.",
            link: "https://amzn.to/4ceCCdQ",
            imagem: "/imgs/garrafa_termica004.jpg"
        }, {
            titulo: "Monitor Cardíaco",
            etiqueta: "❤️ Zona de Queima",
            descricao: "Para queimar gordura efetivamente, seu coração deve bater em uma zona específica. Monitore com precisão.",
            link: "https://amzn.to/3ObKyT7",
            imagem: "/imgs/monitor_cardiaco001.jpg"
        }, {
            titulo: "Monitor Cardíaco",
            etiqueta: "❤️ Zona de Queima",
            descricao: "Para queimar gordura efetivamente, seu coração deve bater em uma zona específica. Monitore com precisão.",
            link: "https://mercadolivre.com/sec/2cR4dKY",
            imagem: "/imgs/monitor_cardiaco002.webp"
        }, {
            titulo: "Panela a Vapor Elétrica",
            etiqueta: "🥦 Cozimento Saudável",
            descricao: "Cozinhar a vapor preserva até 90% dos nutrientes dos alimentos. Essencial para dietas restritivas.",
            link: "https://amzn.to/4r4yBxi",
            imagem: "/imgs/panela_vapor001.jpg"
        }, {
            titulo: "Panela a Vapor Elétrica",
            etiqueta: "🥦 Cozimento Saudável",
            descricao: "Cozinhar a vapor preserva até 90% dos nutrientes dos alimentos. Essencial para dietas restritivas.",
            link: "https://mercadolivre.com/sec/1Gx1XQ9",
            imagem: "/imgs/panela_vapor002.webp"
        }
    ],

    // Categoria: Parto
    parto: [
        {
            titulo: "Almofada de Gravidez em U",
            etiqueta: "🌙 Noites Melhores",
            descricao: "Dormir com a barriga grande é difícil. Esta almofada adapta-se ao seu corpo, aliviando dores nas costas e permitindo um sono reparador.",
            link: "https://amzn.to/4qoA3td",
            imagem: "/imgs/travesseiro001.jpg"
        }, {
            titulo: "Almofada de Gravidez em U",
            etiqueta: "🌙 Noites Melhores",
            descricao: "Dormir com a barriga grande é difícil. Esta almofada adapta-se ao seu corpo, aliviando dores nas costas e permitindo um sono reparador.",
            link: "https://mercadolivre.com/sec/2mhBK2Y",
            imagem: "/imgs/travesseiro002.webp"
        }, {
            titulo: "Cinta Gestacional Modeladora",
            etiqueta: "👗 Suporte e Conforto",
            descricao: "Alivia a pressão lombar e distribui o peso da barriga. Essencial para o terceiro trimestre ou para quem trabalha em pé.",
            link: "https://mercadolivre.com/sec/1VrgCSn",
            imagem: "/imgs/cinta001.webp"
        }, {
            titulo: "Cinta Gestacional Modeladora",
            etiqueta: "👗 Suporte e Conforto",
            descricao: "Alivia a pressão lombar e distribui o peso da barriga. Essencial para o terceiro trimestre ou para quem trabalha em pé.",
            link: "https://amzn.to/4cglGDH",
            imagem: "/imgs/cinta002.jpg"
        }, {
            titulo: "Doppler Fetal Portátil",
            etiqueta: "❤️ Escute o Bebê",
            descricao: "Acalme o coração ouvindo os batimentos do seu bebê em casa. Seguro e fácil de usar para criar laços afetivos.",
            link: "https://mercadolivre.com/sec/2u95bvw",
            imagem: "/imgs/doopler001.webp"
        }, {
            titulo: "Doppler Fetal Portátil",
            etiqueta: "❤️ Escute o Bebê",
            descricao: "Acalme o coração ouvindo os batimentos do seu bebê em casa. Seguro e fácil de usar para criar laços afetivos.",
            link: "https://mercadolivre.com/sec/1yzDMe2",
            imagem: "/imgs/doopler002.webp"
        }, {
            titulo: "Mala de Maternidade",
            etiqueta: "🧳 Pronta para o Hospital",
            descricao: "Não deixe para a última hora. Kit organizado com tudo o que mamãe e bebê precisam para a grande chegada.",
            link: "https://amzn.to/4ruwhzk",
            imagem: "/imgs/mala_maternidade001.jpg"
        }, {
            titulo: "Mala de Maternidade Completa",
            etiqueta: "🧳 Pronta para o Hospital",
            descricao: "Não deixe para a última hora. Kit organizado com tudo o que mamãe e bebê precisam para a grande chegada.",
            link: "https://mercadolivre.com/sec/27gsej1",
            imagem: "/imgs/mala_maternidade002.webp"
        }, {
            titulo: "Bomba de Leite Elétrica",
            etiqueta: "🤱 Amamentação Prática",
            descricao: "Extraia e armazene leite com conforto. Ideal para mamães que voltarão ao trabalho ou precisam aliviar o peito.",
            link: "https://amzn.to/4tdmZJI",
            imagem: "/imgs/bomba_leite001.jpg"
        }, {
            titulo: "Bomba de Leite Elétrica",
            etiqueta: "🤱 Amamentação Prática",
            descricao: "Extraia e armazene leite com conforto. Ideal para mamães que voltarão ao trabalho ou precisam aliviar o peito.",
            link: "https://mercadolivre.com/sec/25DKXfd",
            imagem: "/imgs/bomba_leite002.webp"
        }, {
            titulo: "Tensiômetro Digital de Braço",
            etiqueta: "🩺 Monitoramento",
            descricao: "A pressão arterial na gravidez deve ser monitorada. Tenha este aparelho em casa para melhor acompanhamento durante a gestação.",
            link: "https://amzn.to/4ak6Sl9",
            imagem: "/imgs/monitor_pressao001.jpg"
        }, {
            titulo: "Tensiômetro Digital de Braço",
            etiqueta: "🩺 Monitoramento",
            descricao: "A pressão arterial na gravidez deve ser monitorada. Tenha este aparelho em casa para melhor acompanhamento durante a gestação.",
            link: "https://mercadolivre.com/sec/1njzFDS",
            imagem: "/imgs/monitor_pressao002.webp"
        }, {
            titulo: "Lixeira Higiênica de Fraldas",
            etiqueta: "👽 Sem Cheiro",
            descricao: "O segredo para um quarto de bebê cheiroso. Sistema de selamento que evita o mau cheiro das fraldas usadas.",
            link: "https://amzn.to/3OqMSFU",
            imagem: "/imgs/lixeira001.jpg"
        }, {
            titulo: "Lixeira Higiênica de Fraldas",
            etiqueta: "👽 Sem Cheiro",
            descricao: "O segredo para um quarto de bebê cheiroso. Sistema de selamento que evita o mau cheiro das fraldas usadas.",
            link: "https://mercadolivre.com/sec/34aJzrz",
            imagem: "/imgs/lixeira002.webp"
        }, {
            titulo: "Monitor de Bebê com Vídeo",
            etiqueta: "👀 Olhos no Bebê",
            descricao: "Durma tranquila sabendo que seu bebê está bem. Visualização noturna e áudio bidirecional para acalmar o pequeno.",
            link: "https://amzn.to/4tikE0l",
            imagem: "/imgs/camera_bebe001.jpg"
        }, {
            titulo: "Monitor de Bebê com Vídeo",
            etiqueta: "👀 Olhos no Bebê",
            descricao: "Durma tranquila sabendo que seu bebê está bem. Visualização noturna e áudio bidirecional para acalmar o pequeno.",
            link: "https://mercadolivre.com/sec/29v6mbR",
            imagem: "/imgs/camera_bebe002.webp"
        }, {
            titulo: "Almofada de Amamentação",
            etiqueta: "🍼 Pega Correta",
            descricao: "Evite dores nos ombros e braços durante a amamentação. Dá o suporte necessário para o bebê mamar confortavelmente.",
            link: "https://amzn.to/4a3pw1D",
            imagem: "/imgs/almofada001.jpg"
        }, {
            titulo: "Almofada de Amamentação",
            etiqueta: "🍼 Pega Correta",
            descricao: "Evite dores nos ombros e braços durante a amamentação. Dá o suporte necessário para o bebê mamar confortavelmente.",
            link: "https://mercadolivre.com/sec/2E4J6Rt",
            imagem: "/imgs/almofada002.webp"
        }, {
            titulo: "Lençol de Berço",
            etiqueta: "🛏️ Enxoval Fofo",
            descricao: "Conforto e segurança para o sono do recém-nascido. Tecido 100% algodão, hipoalergênico e macio.",
            link: "https://amzn.to/4r1qgKy",
            imagem: "/imgs/lencol001.jpg"
        }, {
            titulo: "Jogo de Lençol de Berço",
            etiqueta: "🛏️ Enxoval Fofo",
            descricao: "Conforto e segurança para o sono do recém-nascido. Tecido 100% algodão, hipoalergênico e macio.",
            link: "https://amzn.to/4aAGu7H",
            imagem: "/imgs/lencol002.jpg"
        },
    ],

    // Categoria: Água
    agua: [
        {
            titulo: "Garrafa Térmica 1L",
            etiqueta: "❄️ Gelada por Horas",
            descricao: "Beba água gelada o dia todo. Este modelo mantém a temperatura por até 24 horas e é perfeito para o escritório.",
            link: "https://amzn.to/3MvgJMX",
            imagem: "/imgs/garrafa_termica005.jpg"
        },
        {
            titulo: "Garrafa Térmica 1.5L",
            etiqueta: "❄️ Gelada por Horas",
            descricao: "Beba água gelada o dia todo. Este modelo mantém a temperatura por até 24 horas e é perfeito para o escritório.",
            link: "https://mercadolivre.com/sec/1XvUJCc",
            imagem: "/imgs/garrafa_termica006.webp"
        },
        {
            titulo: "Garrafa com Marcador de Tempo",
            etiqueta: "⏰ Meta Diária",
            descricao: "Perca a conta de quanto bebeu? A garrafa tem horários marcados para te lembrar de beber ao longo do dia.",
            link: "https://mercadolivre.com/sec/1yQbU2Y",
            imagem: "/imgs/garrafa_tempo.webp"
        },
        {
            titulo: "Garrafa com Marcador de Tempo",
            etiqueta: "⏰ Meta Diária",
            descricao: "Perca a conta de quanto bebeu? A garrafa tem horários marcados para te lembrar de beber ao longo do dia.",
            link: "https://amzn.to/4ahbicj",
            imagem: "/imgs/garrafa_tempo002.jpg"
        },
        {
            titulo: "Jarra com Filtro Purificador",
            etiqueta: "🚰 Água Pura",
            descricao: "Melhore o sabor e a qualidade da água da torneira. Filtro remove cloro e impurezas de forma prática.",
            link: "https://amzn.to/4tFmZCL",
            imagem: "/imgs/jarro_filtro001.jpg"
        },
        {
            titulo: "Jarra com Filtro Purificador",
            etiqueta: "🚰 Água Pura",
            descricao: "Melhore o sabor e a qualidade da água da torneira. Filtro remove cloro e impurezas de forma prática.",
            link: "https://amzn.to/4rn58yV",
            imagem: "/imgs/jarro_filtro002.jpg"
        },
        {
            titulo: "Jarra com Filtro Purificador",
            etiqueta: "🚰 Água Pura",
            descricao: "Melhore o sabor e a qualidade da água da torneira. Filtro remove cloro e impurezas de forma prática.",
            link: "https://mercadolivre.com/sec/2abFqL1",
            imagem: "/imgs/jarro_filtro003.webp"
        },
        {
            titulo: "Jarra com Filtro Purificador",
            etiqueta: "🚰 Água Pura",
            descricao: "Melhore o sabor e a qualidade da água da torneira. Filtro remove cloro e impurezas de forma prática.",
            link: "https://mercadolivre.com/sec/1kBiZUQ",
            imagem: "/imgs/jarro_filtro004.webp"
        },
        {
            titulo: "Garrafa Infusora de Frutas",
            etiqueta: "🍋 Sabor Natural",
            descricao: "Cansado da água sem gosto? Adicione limão, hortelã ou frutas no compartimento central e beba água saborosa.",
            link: "https://amzn.to/3Mvio59",
            imagem: "/imgs/garrafa_infusor001.jpg"
        },
        {
            titulo: "Garrafa Infusora de Frutas",
            etiqueta: "🍋 Sabor Natural",
            descricao: "Cansado da água sem gosto? Adicione limão, hortelã ou frutas no compartimento central e beba água saborosa.",
            link: "https://mercadolivre.com/sec/227QDvb",
            imagem: "/imgs/garrafa_infusor002.webp"
        },
        {
            titulo: "Eletrolitos em Pó",
            etiqueta: "⚡ Reposição Rápida",
            descricao: "Após o treino intenso ou dias muito quentes, repor minerais é tão importante quanto a água.",
            link: "8D5F6Y-8A2T",
            imagem: "/imgs/eletrolitos001.webp"
        },
        {
            titulo: "Eletrolitos em Pó",
            etiqueta: "⚡ Reposição Rápida",
            descricao: "Após o treino intenso ou dias muito quentes, repor minerais é tão importante quanto a água.",
            link: "https://amzn.to/3ZnNZIQ",
            imagem: "/imgs/eletrolitos002.jpg"
        },
        {
            titulo: "Garrafa de Vidro com Tampa de bambu",
            etiqueta: "♻️ Sustentável",
            descricao: "Sem gosto de plástico e ecológica. Design moderno e resistente, ideal para deixar sobre a mesa.",
            link: "https://amzn.to/3OrwPHU",
            imagem: "/imgs/garrafa_vidro001.jpg"
        },
        {
            titulo: "Garrafa de Vidro",
            etiqueta: "♻️ Sustentável",
            descricao: "Sem gosto de plástico e ecológica. Design moderno e resistente, ideal para deixar sobre a mesa.",
            link: "https://mercadolivre.com/sec/2LNRkKy",
            imagem: "/imgs/garrafa_vidro002.webp"
        },
        {
            titulo: "Garrafa Colapsável (Dobrável)",
            etiqueta: "🎒 Para Viajar",
            descricao: "Economize espaço na mochila quando a garrafa estiver vazia. Perfeita para trilhas e viagens.",
            link: "https://amzn.to/4kw6vso",
            imagem: "/imgs/garrafa_dobravel001.jpg"
        },
        {
            titulo: "Garrafa Colapsável (Dobrável)",
            etiqueta: "🎒 Para Viajar",
            descricao: "Economize espaço na mochila quando a garrafa estiver vazia. Perfeita para trilhas e viagens.",
            link: "https://mercadolivre.com/sec/1QETFFe",
            imagem: "/imgs/garrafa_dobravel002.webp"
        },
        {
            titulo: "Copo Térmico com Canudo de Aço",
            etiqueta: "🥤 Estilo e Saúde",
            descricao: "Evite os descartáveis. Mantenha seu suco ou água gelada com este canudo sustentável e durável.",
            link: "https://amzn.to/4ah6Rye",
            imagem: "/imgs/copo_termico001.jpg"
        },
        {
            titulo: "Copo Térmico com Canudo de Aço",
            etiqueta: "🥤 Estilo e Saúde",
            descricao: "Evite os descartáveis. Mantenha seu suco ou água gelada com este canudo sustentável e durável.",
            link: "https://mercadolivre.com/sec/1WwNSvL",
            imagem: "/imgs/copo_termico002.webp"
        },
        {
            titulo: "Bomba de Gravidade para Galão 20L",
            etiqueta: "🏢 Praticidade",
            descricao: "Dispense água do galão sem esforço e sem levantar o peso. Ideal para casa ou escritório.",
            link: "https://amzn.to/46oHCJ8",
            imagem: "/imgs/bomba_agua001.jpg"
        },
        {
            titulo: "Bomba de Gravidade para Galão 20L",
            etiqueta: "🏢 Praticidade",
            descricao: "Dispense água do galão sem esforço e sem levantar o peso. Ideal para casa ou escritório.",
            link: "https://amzn.to/3M05PPc",
            imagem: "/imgs/bomba_agua002.jpg"
        },
        {
            titulo: "Bomba de Gravidade para Galão 20L",
            etiqueta: "🏢 Praticidade",
            descricao: "Dispense água do galão sem esforço e sem levantar o peso. Ideal para casa ou escritório.",
            link: "https://amzn.to/3LUyepS",
            imagem: "/imgs/bomba_agua003.jpg"
        },
        {
            titulo: "Bomba de Gravidade para Galão 20L",
            etiqueta: "🏢 Praticidade",
            descricao: "Dispense água do galão sem esforço e sem levantar o peso. Ideal para casa ou escritório.",
            link: "https://mercadolivre.com/sec/27maSxw",
            imagem: "/imgs/bomba_agua004.webp"
        }
    ],

    // Categoria: Geral
    geral: [
        {
            titulo: "Echo Dot 5ª Geração",
            etiqueta: "🎤 Tecnologia",
            descricao: "O assistente inteligente para sua casa. Toque música, pergunte coisas e controle sua rotina por voz",
            link: "https://amzn.to/4kkNcSA",
            imagem: "/imgs/echo_dot001.jpg"
        },
        {
            titulo: "Echo Dot 5ª Geração",
            etiqueta: "🎤 Tecnologia",
            descricao: "O assistente inteligente para sua casa. Toque música, pergunte coisas e controle sua rotina por voz",
            link: "https://mercadolivre.com/sec/1mhLMex",
            imagem: "/imgs/echo_dot002.webp"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Trabalhe ou estude com conforto. Melhore sua postura e evite dores nas costas e pescoço.",
            link: "https://amzn.to/4qjsVOF",
            imagem: "/imgs/suporte_notebook003.jpg"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Trabalhe ou estude com conforto. Melhore sua postura e evite dores nas costas e pescoço.",
            link: "https://mercadolivre.com/sec/1VfqVwZ",
            imagem: "/imgs/suporte_notebook004.webp"
        },
        {
            titulo: "Power Bank 20000mAh",
            etiqueta: "🔋 Energia",
            descricao: "Nunca fique sem bateria no celular. Carga rápida para múltiplos dispositivos durante o dia.",
            link: "https://amzn.to/4rfuBtG",
            imagem: "/imgs/powerbank001.jpg"
        },
        {
            titulo: "Power Bank 20000mAh",
            etiqueta: "🔋 Energia",
            descricao: "Nunca fique sem bateria no celular. Carga rápida para múltiplos dispositivos durante o dia.",
            link: "https://mercadolivre.com/sec/2mEU8M1",
            imagem: "/imgs/powerbank002.webp"
        },
        {
            titulo: "Luminária de Mesa LED",
            etiqueta: "💡 Luz",
            descricao: "Iluminação ideal para leitura ou home office. 3 cores de temperatura e proteção para a vista.",
            link: "https://amzn.to/4kHfze9",
            imagem: "/imgs/luminaria003.jpg"
        },
        {
            titulo: "Luminária de Mesa LED",
            etiqueta: "💡 Luz",
            descricao: "Iluminação ideal para leitura ou home office. 3 cores de temperatura e proteção para a vista.",
            link: "https://mercadolivre.com/sec/1a3r8fm",
            imagem: "/imgs/luminaria004.webp"
        },
        {
            titulo: "Headset com Cancelamento de Ruído",
            etiqueta: "🎧 Foco",
            descricao: "Estude ou trabalhe em silêncio total. Confortável para uso prolongado e som imersivo.",
            link: "https://amzn.to/4kkOnkW",
            imagem: "/imgs/fone_ouvido003.jpg"
        },
        {
            titulo: "Headset Gamer",
            etiqueta: "🎧 Foco",
            descricao: "Estude ou jogue em silêncio total. Confortável para uso prolongado e som imersivo.",
            link: "https://amzn.to/3M8hmMl",
            imagem: "/imgs/fone_ouvido004.jpg"
        },
        {
            titulo: "Headset Gamer",
            etiqueta: "🎧 Foco",
            descricao: "Estude ou jogue em silêncio total. Confortável para uso prolongado e som imersivo.",
            link: "https://amzn.to/4rx4KNK",
            imagem: "/imgs/fone_ouvido005.jpg"
        },
        {
            titulo: "Headset com fio USB",
            etiqueta: "🎧 Foco",
            descricao: "Estude ou trabalhe em silêncio total. Confortável para uso prolongado e som imersivo.",
            link: "https://mercadolivre.com/sec/2xfDMPb",
            imagem: "/imgs/fone_ouvido006.webp"
        },
        {
            titulo: "Headset Adaptativo",
            etiqueta: "🎧 Foco",
            descricao: "Estude ou trabalhe em silêncio total. Confortável para uso prolongado e som imersivo.",
            link: "https://mercadolivre.com/sec/1VQstM5",
            imagem: "/imgs/fone_ouvido007.webp"
        },
        {
            titulo: "Organizador de Mesa (Multiuso)",
            etiqueta: "📦 Ordem",
            descricao: "Mantenha sua mesa limpa. Compartimentos para celular, canetas, notas e acessórios.",
            link: "https://amzn.to/4rzMYJH",
            imagem: "/imgs/organizador001.jpg"
        },
        {
            titulo: "Organizador de Mesa (Multiuso)",
            etiqueta: "📦 Ordem",
            descricao: "Mantenha sua mesa limpa. Compartimentos para celular, canetas, notas e acessórios.",
            link: "https://amzn.to/4aCQayw",
            imagem: "/imgs/organizador002.jpg"
        },
        {
            titulo: "Organizador de Mesa (Multiuso)",
            etiqueta: "📦 Ordem",
            descricao: "Mantenha sua mesa limpa. Compartimentos para celular, canetas, notas e acessórios.",
            link: "https://mercadolivre.com/sec/2Hp8bLe",
            imagem: "/imgs/organizador003.webp"
        },
        {
            titulo: "Câmera de Segurança Wi-Fi",
            etiqueta: "📹 Segurança",
            descricao: "Monitore sua casa pelo celular. Visão noturna e fácil instalação para proteger sua família.",
            link: "https://mercadolivre.com/sec/31vFnov",
            imagem: "/imgs/camera_wifi001.webp"
        },
        {
            titulo: "Câmera de Segurança Wi-Fi",
            etiqueta: "📹 Segurança",
            descricao: "Monitore sua casa pelo celular. Visão noturna e fácil instalação para proteger sua família.",
            link: "https://mercadolivre.com/sec/1dX69D4",
            imagem: "/imgs/camera_wifi002.webp"
        },
        {
            titulo: "Câmera de Segurança Wi-Fi",
            etiqueta: "📹 Segurança",
            descricao: "Monitore sua casa pelo celular. Visão noturna e fácil instalação para proteger sua família.",
            link: "https://amzn.to/4toUokC",
            imagem: "/imgs/camera_wifi003.jpg"
        },
        {
            titulo: "Câmera de Segurança Wi-Fi",
            etiqueta: "📹 Segurança",
            descricao: "Monitore sua casa pelo celular. Visão noturna e fácil instalação para proteger sua família.",
            link: "https://amzn.to/4aHg5nR",
            imagem: "/imgs/camera_wifi004.jpg"
        },
        {
            titulo: "Kindle Paperwhite",
            etiqueta: "📚 Leitura",
            descricao: "Leve milhares de livros no bolso. Tela como papel e luz embutida para ler à luz.",
            link: "https://amzn.to/4bHPbOC",
            imagem: "/imgs/kindle001.jpg"
        },
        {
            titulo: "Kindle Paperwhite",
            etiqueta: "📚 Leitura",
            descricao: "Leve milhares de livros no bolso. Tela como papel e luz embutida para ler à luz.",
            link: "https://amzn.to/4rEfRVf",
            imagem: "/imgs/kindle002.jpg"
        }
    ],

    // Categoria: Juros
    juros: [
        {
            titulo: "",
            etiqueta: "",
            descricao: "",
            link: "",
            imagem: ""
        }
    ]
};

// 2. A FUNÇÃO CORRIGIDA
// 2. A FUNÇÃO DE CARGA DE ANÚNCIOS COM RASTREAMENTO
function carregarAnuncio(categoria) {
    if (!bancoDeAnuncios[categoria]) return;

    const lista = bancoDeAnuncios[categoria];
    const produto = lista[Math.floor(Math.random() * lista.length)];

    // DESIGN COM IMAGEM PADRONIZADA
    const html = `
        <div style="font-family: 'Inter', sans-serif; text-align: left;">
            
            <!-- Etiqueta / Tag -->
            <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; margin-bottom: 10px;">
                ${produto.etiqueta}
            </span>

            <!-- Título -->
            <h4 style="margin: 0 0 8px 0; color: #1e293b; font-size: 1.1rem; line-height: 1.3;">
                ${produto.titulo}
            </h4>

            <!-- Link Imagem -->
            <a href="${produto.link}" target="_blank" rel="nofollow noopener" style="text-decoration: none; display: block; margin-bottom: 12px;">
                
                <!-- MOLDURA FIXA -->
                <div style="width: 100%; max-width: 300px; height: 230px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.2s; transition: border-color 0.2s;" onmouseover="this.style.transform='scale(1.02)'; this.style.borderColor='#f59e0b'" onmouseout="this.style.transform='scale(1)'; this.style.borderColor='#e2e8f0'">
                    
                    <!-- IMAGEM DENTRO DA MOLDURA -->
                    <img src="${produto.imagem}" alt="${produto.titulo}" style="max-width: 100%; max-height: 100%; object-fit: contain; display: block;">

                </div>
            </a>

            <!-- Texto de Gancho (Copywriting) -->
            <p style="margin: 0 0 15px 0; color: #475569; font-size: 0.9rem; line-height: 1.5;">
                ${produto.descricao}
            </p>
            
            <!-- Botão CTA -->
            <a href="${produto.link}" target="_blank" rel="nofollow noopener" style="display: block; width: 100%; text-align: center; background: #f59e0b; color: white; padding: 10px 0; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 0.95rem; transition: background 0.2s; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                Ver Detalhes
            </a>
            
        </div>
    `;

    const container = document.getElementById('anuncio-dinamico');
    if (container) {
        container.innerHTML = html;

        // --- INÍCIO DO RASTREAMENTO (Google Analytics) ---

        // Seleciona TODOS os links dentro do anúncio (Imagem e Botão)
        const linksAnuncio = container.querySelectorAll('a');

        linksAnuncio.forEach(link => {
            link.addEventListener('click', function (e) {
                // Envia o evento para o Google Analytics
                gtag('event', 'clique_anuncio_afiliado', {
                    'categoria_pagina': categoria,  // Ex: 'tinta', 'imc'
                    'produto_titulo': produto.titulo, // Ex: 'Balde de Tinta'
                    'url_destino': produto.link      // O link da Amazon
                });
            });
        });

        // --- FIM DO RASTREAMENTO ---
    }
}
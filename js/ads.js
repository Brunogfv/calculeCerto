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
            titulo: "Pai Rico, Pai Pobre",
            etiqueta: "📚 Clássico",
            descricao: "O livro que mudou a mentalidade de milhões de pessoas sobre dinheiro. Aprenda a diferenciar ativos de passivos.",
            link: "https://amzn.to/45REzJj",
            imagem: "/imgs/pai_rico_pobre.jpg"
        },
        {
            titulo: "O Investidor Inteligente",
            etiqueta: "📈 Estratégia",
            descricao: "A bíblia do investimento em valor. Aprenda como construir riqueza a longo prazo com segurança.",
            link: "https://amzn.to/4ce3ZEO",
            imagem: "/imgs/investidor_inteligente.jpg"
        },
        {
            titulo: "Agenda de Controles Financeiros",
            etiqueta: "📝 Organização",
            descricao: "Saiba para onde vai cada centavo. Esta agenda ajuda a planejar gastos, economizar e atingir metas.",
            link: "https://amzn.to/4qqLWiq",
            imagem: "/imgs/agenda003.jpg"
        },
        {
            titulo: "Do Mil ao Milhão",
            etiqueta: "🚀 Motivação",
            descricao: "Como Thiago Nigro saiu da dívida e se tornou investidor. Um guia prático para iniciantes.",
            link: "https://amzn.to/4rCSyev",
            imagem: "/imgs/mil_milhao.jpg"
        },
        {
            titulo: "Calculadora Financeira HP12C",
            etiqueta: "🔢 Profissional",
            descricao: "A ferramenta indispensável para profissionais de finanças. Faça cálculos complexos de juros e amortização.",
            link: "https://amzn.to/4r10CFR",
            imagem: "/imgs/calculadora003.jpg"
        },
        {
            titulo: "O Jeito Peter Lynch",
            etiqueta: "🏆 Ações",
            descricao: "Aprenda a investir na bolsa escolhendo empresas do seu dia a dia. Simples e direto ao ponto.",
            link: "https://mercadolivre.com/sec/2Yj1gr1",
            imagem: "/imgs/peterLynch.webp"
        },
        {
            titulo: "Organizador de Documentos",
            etiqueta: "📂 Ordem",
            descricao: "Mantenha seus contratos, notas fiscais e extratos organizados. Essencial para o controle financeiro.",
            link: "https://mercadolivre.com/sec/19CZjGe",
            imagem: "/imgs/organizador004.webp"
        },
        {
            titulo: "Kit Organizador de Documentos",
            etiqueta: "📂 Ordem",
            descricao: "Mantenha seus contratos, notas fiscais e extratos organizados. Essencial para o controle financeiro.",
            link: "https://amzn.to/3O9CpP5",
            imagem: "/imgs/organizador005.jpg"
        },
        {
            titulo: "Os Segredos da Mente Milionária",
            etiqueta: "🧠 Psicologia",
            descricao: "Identifique e modifique seus modelos de dinheiro que estão te impedindo de enriquecer.",
            link: "https://amzn.to/4rxhOTi",
            imagem: "/imgs/segredos.jpg"
        },
        // {
        //     titulo: "Viva Sempre com Dinheiro",
        //     etiqueta: "⭐ Melhor Avaliado",
        //     descricao: "A mentoria com a mais alta aprovação (4.9⭐). Saia do caos financeiro, limpe o nome e aprenda a viver com dinheiro de forma definitiva.",
        //     link: "",
        //     imagem: "../imgs/curso_viva_sempre.jpg"
        // }
    ],

    // Categoria: Combustível
    combustivel: [
        {
            titulo: "Aditivo de Combustível Lubrificante",
            etiqueta: "🛡️ Proteção do Motor",
            descricao: "A gasolina brasileira tem má qualidade. Use este aditivo para limpar os bicos injetores e proteger o motor, economizando no longo prazo.",
            link: "https://amzn.to/3ZuN3m2",
            imagem: "../imgs/aditivo_combustivel001.jpg"
        },
        {
            titulo: "Aditivo de Combustível Lubrificante",
            etiqueta: "🛡️ Proteção do Motor",
            descricao: "A gasolina brasileira tem má qualidade. Use este aditivo para limpar os bicos injetores e proteger o motor, economizando no longo prazo.",
            link: "https://mercadolivre.com/sec/2GJKu7s",
            imagem: "../imgs/aditivo_combustivel002.webp"
        },
        {
            titulo: "Aditivo de Combustível Lubrificante",
            etiqueta: "🛡️ Proteção do Motor",
            descricao: "A gasolina brasileira tem má qualidade. Use este aditivo para limpar os bicos injetores e proteger o motor, economizando no longo prazo.",
            link: "https://mercadolivre.com/sec/2yUydd6",
            imagem: "../imgs/aditivo_combustivel003.webp"
        },
        {
            titulo: "Aditivo de Combustível Lubrificante",
            etiqueta: "🛡️ Proteção do Motor",
            descricao: "A gasolina brasileira tem má qualidade. Use este aditivo para limpar os bicos injetores e proteger o motor, economizando no longo prazo.",
            link: "https://mercadolivre.com/sec/11Bks8g",
            imagem: "../imgs/aditivo_combustivel004.webp"
        },
        {
            titulo: "Aditivo de Combustível Lubrificante",
            etiqueta: "🛡️ Proteção do Motor",
            descricao: "A gasolina brasileira tem má qualidade. Use este aditivo para limpar os bicos injetores e proteger o motor, economizando no longo prazo.",
            link: "https://mercadolivre.com/sec/2dicptZ",
            imagem: "../imgs/aditivo_combustivel005.webp"
        },
        {
            titulo: "Manômetro Digital de Pneus",
            etiqueta: "🎯 Eficiência",
            descricao: "Você sabia que pneus murchos aumentam o consumo? Mantenha a calibragem correta com precisão e economize no posto.",
            link: "https://amzn.to/3O3EfBc",
            imagem: "../imgs/manometro_pneus001.jpg"
        },
        {
            titulo: "Manômetro Digital de Pneus",
            etiqueta: "🎯 Eficiência",
            descricao: "Você sabia que pneus murchos aumentam o consumo? Mantenha a calibragem correta com precisão e economize no posto.",
            link: "https://mercadolivre.com/sec/2znwtzg",
            imagem: "../imgs/manometro_pneus002.webp"
        },
        {
            titulo: "Tampa de Tanque com Chave",
            etiqueta: "🔒 Segurança",
            descricao: "Evite o furto de combustível ('caixa d'água'). Tampa reforçada com fechadura universal que se adapta à maioria dos carros.",
            link: "https://mercadolivre.com/sec/14yMpZW",
            imagem: "../imgs/tampa_tanque_seguranca001.webp"
        },
        {
            titulo: "Tampa de Tanque com Chave",
            etiqueta: "🔒 Segurança",
            descricao: "Evite o furto de combustível ('caixa d'água'). Tampa reforçada com fechadura universal que se adapta à maioria dos carros.",
            link: "https://mercadolivre.com/sec/2XvY2rn",
            imagem: "../imgs/tampa_tanque_seguranca002.webp"
        },
        {
            titulo: "Tampa de Tanque com Chave",
            etiqueta: "🔒 Segurança",
            descricao: "Evite o furto de combustível ('caixa d'água'). Tampa reforçada com fechadura universal que se adapta à maioria dos carros.",
            link: "https://mercadolivre.com/sec/1VkFekD",
            imagem: "../imgs/tampa_tanque_seguranca003.webp"
        },
        {
            titulo: "Óleo Sintético 5W30",
            etiqueta: "🧹 Manutenção",
            descricao: "Um motor limpo e bem lubrificado consome menos. Melhore o desempenho e o consumo com troca de óleo de qualidade.",
            link: "https://amzn.to/4qm6JDt",
            imagem: "../imgs/oleo_sintetico001.jpg"
        },
        {
            titulo: "Óleo Sintético 5W30",
            etiqueta: "🧹 Manutenção",
            descricao: "Um motor limpo e bem lubrificado consome menos. Melhore o desempenho e o consumo com troca de óleo de qualidade.",
            link: "https://mercadolivre.com/sec/2zYFwQX",
            imagem: "../imgs/oleo_sintetico002.webp"
        },
        {
            titulo: "Óleo Sintético 5W30",
            etiqueta: "🧹 Manutenção",
            descricao: "Um motor limpo e bem lubrificado consome menos. Melhore o desempenho e o consumo com troca de óleo de qualidade.",
            link: "https://mercadolivre.com/sec/1PRi1uk",
            imagem: "../imgs/oleo_sintetico003.webp"
        },
        {
            titulo: "Óleo Sintético 5W30",
            etiqueta: "🧹 Manutenção",
            descricao: "Um motor limpo e bem lubrificado consome menos. Melhore o desempenho e o consumo com troca de óleo de qualidade.",
            link: "https://mercadolivre.com/sec/2NmSUX2",
            imagem: "../imgs/oleo_sintetico004.webp"
        },
        {
            titulo: "Óleo Sintético 5W30",
            etiqueta: "🧹 Manutenção",
            descricao: "Um motor limpo e bem lubrificado consome menos. Melhore o desempenho e o consumo com troca de óleo de qualidade.",
            link: "https://mercadolivre.com/sec/25sAuYt",
            imagem: "../imgs/oleo_sintetico005.webp"
        },
        {
            titulo: "Scanner OBD2 Bluetooth",
            etiqueta: "📱 Diagnóstico",
            descricao: "Seu carro está bebendo muito? Conecte este scanner ao celular, veja erros do motor e ajuste o consumo.",
            link: "https://mercadolivre.com/sec/16pJRLL",
            imagem: "../imgs/scanner_obd2001.webp"
        },
        {
            titulo: "Scanner OBD2 Bluetooth",
            etiqueta: "📱 Diagnóstico",
            descricao: "Seu carro está bebendo muito? Conecte este scanner ao celular, veja erros do motor e ajuste o consumo.",
            link: "https://mercadolivre.com/sec/1uTqJ4X",
            imagem: "../imgs/scanner_obd2002.webp"
        },
        {
            titulo: "Scanner OBD2 Bluetooth",
            etiqueta: "📱 Diagnóstico",
            descricao: "Seu carro está bebendo muito? Conecte este scanner ao celular, veja erros do motor e ajuste o consumo.",
            link: "https://mercadolivre.com/sec/1aqX3L9",
            imagem: "../imgs/scanner_obd2003.webp"
        },
        {
            titulo: "Scanner OBD2 Bluetooth",
            etiqueta: "📱 Diagnóstico",
            descricao: "Seu carro está bebendo muito? Conecte este scanner ao celular, veja erros do motor e ajuste o consumo.",
            link: "https://mercadolivre.com/sec/2EX4ALe",
            imagem: "../imgs/scanner_obd2004.webp"
        },
        {
            titulo: "Scanner OBD2 Bluetooth",
            etiqueta: "📱 Diagnóstico",
            descricao: "Seu carro está bebendo muito? Conecte este scanner ao celular, veja erros do motor e ajuste o consumo.",
            link: "https://mercadolivre.com/sec/23A4Q79",
            imagem: "../imgs/scanner_obd2005.webp"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS Seguro",
            descricao: "Dirija olhando a estrada. Use o Waze ou GPS sem usar as mãos e encontre o posto mais barato no caminho.",
            link: "https://amzn.to/3O3HDMq",
            imagem: "../imgs/suporte_celular_carro001.jpg"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS Seguro",
            descricao: "Dirija olhando a estrada. Use o Waze ou GPS sem usar as mãos e encontre o posto mais barato no caminho.",
            link: "https://mercadolivre.com/sec/26dGe63",
            imagem: "../imgs/suporte_celular_carro002.webp"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS Seguro",
            descricao: "Dirija olhando a estrada. Use o Waze ou GPS sem usar as mãos e encontre o posto mais barato no caminho.",
            link: "https://mercadolivre.com/sec/1ScMqBv",
            imagem: "../imgs/suporte_celular_carro003.webp"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS Seguro",
            descricao: "Dirija olhando a estrada. Use o Waze ou GPS sem usar as mãos e encontre o posto mais barato no caminho.",
            link: "https://mercadolivre.com/sec/2DyjdRG",
            imagem: "../imgs/suporte_celular_carro004.webp"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS Seguro",
            descricao: "Dirija olhando a estrada. Use o Waze ou GPS sem usar as mãos e encontre o posto mais barato no caminho.",
            link: "https://mercadolivre.com/sec/1pi3EGW",
            imagem: "../imgs/suporte_celular_carro005.webp"
        },
        {
            titulo: "Cabos Elétricos para Bateria",
            etiqueta: "🔌 Emergência",
            descricao: "Não fique parado na estrada por causa de uma bateria descarregada. Cabos reforçados para dar partida rápida.",
            link: "https://amzn.to/4bKK3JB",
            imagem: "../imgs/cabos_bateria001.jpg"
        },
        {
            titulo: "Cabos Elétricos para Bateria",
            etiqueta: "🔌 Emergência",
            descricao: "Não fique parado na estrada por causa de uma bateria descarregada. Cabos reforçados para dar partida rápida.",
            link: "https://mercadolivre.com/sec/1vLfYXA",
            imagem: "../imgs/cabos_bateria002.webp"
        },
        {
            titulo: "Filtro de Ar Esportivo",
            etiqueta: "💨 Respiração",
            descricao: "Melhora a entrada de ar, otimizando a combustão. Peça simples que ajuda a manter o desempenho do veículo.",
            link: "https://mercadolivre.com/sec/14mXisx",
            imagem: "../imgs/filtro_ar_esportivo001.webp"
        },
        {
            titulo: "Filtro de Ar Esportivo",
            etiqueta: "💨 Respiração",
            descricao: "Melhora a entrada de ar, otimizando a combustão. Peça simples que ajuda a manter o desempenho do veículo.",
            link: "https://mercadolivre.com/sec/1cXRPpK",
            imagem: "../imgs/filtro_ar_esportivo002.webp"
        },
        {
            titulo: "Patinete Elétrico Dobrável",
            etiqueta: "🛴 Economia Urbana",
            descricao: "Para deslocamentos curtos (trabalho/mercado), o patinete é imbatível. Economize combustível para viagens longas.",
            link: "https://mercadolivre.com/sec/1t4W1fP",
            imagem: "../imgs/patinete_eletrico001.webp"
        },
        {
            titulo: "Patinete Elétrico Dobrável",
            etiqueta: "🛴 Economia Urbana",
            descricao: "Para deslocamentos curtos (trabalho/mercado), o patinete é imbatível. Economize combustível para viagens longas.",
            link: "https://mercadolivre.com/sec/2fBPD72",
            imagem: "../imgs/patinete_eletrico002.webp"
        },
        {
            titulo: "Patinete Elétrico Dobrável",
            etiqueta: "🛴 Economia Urbana",
            descricao: "Para deslocamentos curtos (trabalho/mercado), o patinete é imbatível. Economize combustível para viagens longas.",
            link: "https://mercadolivre.com/sec/1sY3xWX",
            imagem: "../imgs/patinete_eletrico003.webp"
        },
        {
            titulo: "Scooter Elétrica Bivolt",
            etiqueta: "🛴 Economia Urbana",
            descricao: "Para deslocamentos curtos (trabalho/mercado), a scooter é imbatível. Economize combustível para viagens longas.",
            link: "https://mercadolivre.com/sec/2opATdm",
            imagem: "../imgs/patinete_eletrico004.webp"
        }
    ],

    // Categoria: Datas
    datas: [
        {
            titulo: "Agenda 2026 de Bolso",
            etiqueta: "📅 Organização",
            descricao: "Não confie apenas na memória do celular. Anote seus prazos, metas e compromissos em uma agenda física prática.",
            link: "https://mercadolivre.com/sec/235EUYn",
            imagem: "../imgs/agenda_2026001.webp"
        },
        {
            titulo: "Agenda 2026 de Bolso",
            etiqueta: "📅 Organização",
            descricao: "Não confie apenas na memória do celular. Anote seus prazos, metas e compromissos em uma agenda física prática.",
            link: "https://amzn.to/4amHOdg",
            imagem: "../imgs/agenda_2026002.jpg"
        },
        {
            titulo: "Calendário de Parede Grande",
            etiqueta: "🗓️ Visão Completa",
            descricao: "Tenha o ano inteiro na sua parede. Essencial para planejar projetos longos e visualizar datas de entrega.",
            link: "https://amzn.to/4rJCxna",
            imagem: "../imgs/calendario_parede001.jpg"
        },
        {
            titulo: "Calendário de Parede Grande",
            etiqueta: "🗓️ Visão Completa",
            descricao: "Tenha o ano inteiro na sua parede. Essencial para planejar projetos longos e visualizar datas de entrega.",
            link: "https://mercadolivre.com/sec/1SnaJW5",
            imagem: "../imgs/calendario_parede002.webp"
        },
        {
            titulo: "Trabalhe 4 horas por semana",
            etiqueta: "🚀 Gestão do Tempo",
            descricao: "O best-seller de Timothy Ferriss. Aprenda a eliminar o inútil e focar no que realmente importa para liberdade.",
            link: "https://amzn.to/4qs9Qd8",
            imagem: "../imgs/livro_4_horas001.jpg"
        },
        {
            titulo: "Trabalhe 4 horas por semana",
            etiqueta: "🚀 Gestão do Tempo",
            descricao: "O best-seller de Timothy Ferriss. Aprenda a eliminar o inútil e focar no que realmente importa para liberdade.",
            link: "https://mercadolivre.com/sec/1ezUNgQ",
            imagem: "../imgs/livro_4_horas002.webp"
        },
        {
            titulo: "Quadro Branco (Lousa)",
            etiqueta: "🖊️ Brainstorming",
            descricao: "Organize datas e ideias visualmente. Perfeito para planejar semanas ou meses na parede do escritório ou cozinha.",
            link: "https://amzn.to/3ZrnFxv",
            imagem: "../imgs/quadro_branco001.jpg"
        },
        {
            titulo: "Quadro Branco (Lousa)",
            etiqueta: "🖊️ Brainstorming",
            descricao: "Organize datas e ideias visualmente. Perfeito para planejar semanas ou meses na parede do escritório ou cozinha.",
            link: "https://mercadolivre.com/sec/1JnawwQ",
            imagem: "../imgs/quadro_branco002.webp"
        },
        {
            titulo: "Quadro Branco (Lousa)",
            etiqueta: "🖊️ Brainstorming",
            descricao: "Organize datas e ideias visualmente. Perfeito para planejar semanas ou meses na parede do escritório ou cozinha.",
            link: "https://mercadolivre.com/sec/1Txui2H",
            imagem: "../imgs/quadro_branco003.webp"
        },
        {
            titulo: "Timer Pomodoro Digital",
            etiqueta: "🍅 Foco",
            descricao: "Gerencie seu tempo em blocos. A técnica Pomodoro é a melhor forma de cumprir prazos sem estresse.",
            link: "https://amzn.to/3My1Lpq",
            imagem: "../imgs/timer_digital001.jpg"
        },
        {
            titulo: "Timer Pomodoro Digital",
            etiqueta: "🍅 Foco",
            descricao: "Gerencie seu tempo em blocos. A técnica Pomodoro é a melhor forma de cumprir prazos sem estresse.",
            link: "https://mercadolivre.com/sec/2JV16H9",
            imagem: "../imgs/timer_digital002.webp"
        },
        {
            titulo: "O Poder do Hábito",
            etiqueta: "📖 Rotina",
            descricao: "Pequenas mudanças, grandes resultados. Aprenda a usar o tempo a seu favor criando hábitos duradouros.",
            link: "https://amzn.to/4r5XjNA",
            imagem: "../imgs/livro_habito001.jpg"
        },
        {
            titulo: "O Poder do Hábito",
            etiqueta: "📖 Rotina",
            descricao: "Pequenas mudanças, grandes resultados. Aprenda a usar o tempo a seu favor criando hábitos duradouros.",
            link: "https://mercadolivre.com/sec/2g6HpL3",
            imagem: "../imgs/livro_habito002.webp"
        },
        {
            titulo: "Marcadores de Página Coloridos",
            etiqueta: "🔖 Estudo",
            descricao: "Organize livros e documentos por data ou prioridade. Ferramenta simples para não perder prazos importantes.",
            link: "https://mercadolivre.com/sec/1GYXtXR",
            imagem: "../imgs/marcadores_pagina001.webp"
        },
        {
            titulo: "Marcadores de Página Coloridos",
            etiqueta: "🔖 Estudo",
            descricao: "Organize livros e documentos por data ou prioridade. Ferramenta simples para não perder prazos importantes.",
            link: "https://amzn.to/4arAihe",
            imagem: "../imgs/marcadores_pagina002.jpg"
        },
        {
            titulo: "Relógio Digital de Mesa",
            etiqueta: "⏰ Tempo Real",
            descricao: "Mantenha o controle do tempo durante o trabalho ou estudo. Visor grande e fácil de ler.",
            link: "https://amzn.to/4knCKK6",
            imagem: "../imgs/relogio_mesa001.jpg"
        },
        {
            titulo: "Relógio Digital de Mesa",
            etiqueta: "⏰ Tempo Real",
            descricao: "Mantenha o controle do tempo durante o trabalho ou estudo. Visor grande e fácil de ler.",
            link: "https://mercadolivre.com/sec/27ApvvZ",
            imagem: "../imgs/relogio_mesa002.webp"
        },
        {
            titulo: "Relógio Digital de Mesa",
            etiqueta: "⏰ Tempo Real",
            descricao: "Mantenha o controle do tempo durante o trabalho ou estudo. Visor grande e fácil de ler.",
            link: "https://mercadolivre.com/sec/12mvqPu",
            imagem: "../imgs/relogio_mesa003.webp"
        },
        {
            titulo: "Relógio Digital de Mesa",
            etiqueta: "⏰ Tempo Real",
            descricao: "Mantenha o controle do tempo durante o trabalho ou estudo. Visor grande e fácil de ler.",
            link: "https://mercadolivre.com/sec/1yN3z8V",
            imagem: "../imgs/relogio_mesa004.webp"
        },
        {
            titulo: "Bloco de Notas Adesivas",
            etiqueta: "📝 Lembretes",
            descricao: "Para datas e lembretes rápidos que não podem ser esquecidos. A forma mais clássica de gestão de tempo.",
            link: "https://amzn.to/3Zn67mh",
            imagem: "../imgs/post_it001.jpg"
        },
        {
            titulo: "Bloco de Notas Adesivas",
            etiqueta: "📝 Lembretes",
            descricao: "Para datas e lembretes rápidos que não podem ser esquecidos. A forma mais clássica de gestão de tempo.",
            link: "https://amzn.to/46sEX12",
            imagem: "../imgs/post_it002.jpg"
        },
        {
            titulo: "Bloco de Notas Adesivas",
            etiqueta: "📝 Lembretes",
            descricao: "Para datas e lembretes rápidos que não podem ser esquecidos. A forma mais clássica de gestão de tempo.",
            link: "https://mercadolivre.com/sec/1kGNS2F",
            imagem: "../imgs/post_it003.webp"
        },
        {
            titulo: "Bloco de Notas Adesivas",
            etiqueta: "📝 Lembretes",
            descricao: "Para datas e lembretes rápidos que não podem ser esquecidos. A forma mais clássica de gestão de tempo.",
            link: "https://mercadolivre.com/sec/2RRxxg8",
            imagem: "../imgs/post_it003.webp"
        }
    ],

    // Categoria: Décimo Terceiro
    decimo_terceiro: [
        {
            titulo: "CLT Consolidada (Edição Atualizada)",
            etiqueta: "📚 Direitos do Trabalho",
            descricao: "O guia oficial para conferir seus direitos. Saiba exatamente o que a empresa deve pagar no seu 13º e férias.",
            link: "https://amzn.to/3MfoB5e",
            imagem: "../imgs/livro_clt.jpg"
        },
        {
            titulo: "TV Smart 50 polegadas 4K",
            etiqueta: "📺 Presente de Fim de Ano",
            descricao: "O clássico presente de fim de ano. Use uma parte do 13º para atualizar a sala de casa com uma nova TV.",
            link: "https://mercadolivre.com/sec/2GYc3tT",
            imagem: "../imgs/tv_smart001.webp"
        },
        {
            titulo: "TV Smart 50 polegadas 4K",
            etiqueta: "📺 Presente de Fim de Ano",
            descricao: "O clássico presente de fim de ano. Use uma parte do 13º para atualizar a sala de casa com uma nova TV.",
            link: "https://amzn.to/45VXSkG",
            imagem: "../imgs/tv_smart002.jpg"
        },
        {
            titulo: "Do Mil ao Milhão",
            etiqueta: "🚀 Motivação",
            descricao: "Como Thiago Nigro saiu da dívida e se tornou investidor. Um guia prático para iniciantes.",
            link: "https://amzn.to/4rCSyev",
            imagem: "/imgs/mil_milhao.jpg"
        },
        {
            titulo: "Mala para Viagem",
            etiqueta: "✈️ Férias",
            descricao: "Está viajando com o 13º? Uma mala boa e resistente é essencial para transportar roupas e presentes sem preocupações.",
            link: "https://amzn.to/405jebP",
            imagem: "../imgs/mala_grande001.jpg"
        },
        {
            titulo: "Mala para Viagem",
            etiqueta: "✈️ Férias",
            descricao: "Está viajando com o 13º? Uma mala boa e resistente é essencial para transportar roupas e presentes sem preocupações.",
            link: "https://mercadolivre.com/sec/1Mp9S5X",
            imagem: "../imgs/mala_grande002.webp"
        },
        {
            titulo: "Notebook Gamer ou de Trabalho",
            etiqueta: "💻 Upgrade",
            descricao: "Invista no seu trabalho ou lazer. Um computador novo é um investimento que se paga ao longo do ano.",
            link: "https://amzn.to/4bH1pXT",
            imagem: "../imgs/notebook001.jpg"
        },
        {
            titulo: "Notebook Gamer ou de Trabalho",
            etiqueta: "💻 Upgrade",
            descricao: "Invista no seu trabalho ou lazer. Um computador novo é um investimento que se paga ao longo do ano.",
            link: "https://mercadolivre.com/sec/2zoD7D2",
            imagem: "../imgs/notebook002.webp"
        },
        {
            titulo: "Cofre de Segurança Digital",
            etiqueta: "🔒 Proteção",
            descricao: "Guarde o que sobrar do 13º em segurança. Cofre digital com senhas para armazenar dinheiro e joias em casa.",
            link: "https://mercadolivre.com/sec/14B3gPT",
            imagem: "../imgs/cofre_seguranca.webp"
        },
        {
            titulo: "Câmera Digital de Viagem",
            etiqueta: "📸 Memórias",
            descricao: "Registre as férias em alta qualidade. Câmera compacta para capturar os melhores momentos da família.",
            link: "https://mercadolivre.com/sec/1ViX6Gu",
            imagem: "../imgs/camera_fotos.webp"
        },
        {
            titulo: "Celular Smartphone Atual",
            etiqueta: "📱 Comunicação",
            descricao: "Chegou a hora de trocar de aparelho? Use o 13º para abater no valor do novo smartphone.",
            link: "https://mercadolivre.com/sec/1XpdwjA",
            imagem: "../imgs/smartphone001.webp"
        },
        {
            titulo: "Celular Smartphone Atual",
            etiqueta: "📱 Comunicação",
            descricao: "Chegou a hora de trocar de aparelho? Use o 13º para abater no valor do novo smartphone.",
            link: "https://mercadolivre.com/sec/138U5TL",
            imagem: "../imgs/smartphone002.webp"
        },
        {
            titulo: "E-book: O Jeito Peter Lynch",
            etiqueta: "📈 Bolsa de Valores",
            descricao: "Use o restante do dinheiro para investir na bolsa. Aprenda a escolher boas empresas para longo prazo.",
            link: "https://mercadolivre.com/sec/2Yj1gr1",
            imagem: "/imgs/peterLynch.webp"
        },
        {
            titulo: "Passaporte Porta Documentos",
            etiqueta: "🛂 Viagens Internacionais",
            descricao: "Se o destino é internacional, proteja seu passaporte e documentos em um porta-documentos elegante de alta qualidade.",
            link: "https://mercadolivre.com/sec/1AeRDvB",
            imagem: "../imgs/passaporte_viagem001.webp"
        },
        {
            titulo: "Passaporte Porta Documentos",
            etiqueta: "🛂 Viagens Internacionais",
            descricao: "Se o destino é internacional, proteja seu passaporte e documentos em um porta-documentos elegante de alta qualidade.",
            link: "https://mercadolivre.com/sec/1GmC6XL",
            imagem: "../imgs/passaporte_viagem002.webp"
        },
        {
            titulo: "Passaporte Porta Documentos",
            etiqueta: "🛂 Viagens Internacionais",
            descricao: "Se o destino é internacional, proteja seu passaporte e documentos em um porta-documentos elegante de alta qualidade.",
            link: "https://mercadolivre.com/sec/2kJVrVH",
            imagem: "../imgs/passaporte_viagem003.webp"
        }
    ],

    // Categoria: Hora Extra
    hora_extra: [
        {
            titulo: "Headset com Cancelamento de Ruído",
            etiqueta: "🎧 Foco Absoluto",
            descricao: "Trabalhe em silêncio mesmo em ambientes barulhentos. Essencial para manter a produtividade nas horas extras.",
            link: "https://www.amazon.com.br/soundcore-Cancelamento-Poderosos-Reprodu%C3%A7%C3%A3o-Bluetooth/dp/B0CRTYZG5C?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=303FZI935EB3Y&dib=eyJ2IjoiMSJ9.uXc4CoDczaGqN6a_x8XD7zQukBJHx-JtpVkhXk9TDWD1cdTjY61S9_s1ZwNq7s7_edz1Y2BX4sEtBJtsUz2An4vPuMWaUhslepCzo66nT1ESf_VW3mHTsUGmBhXNHQgAc1oDiXbvvcBOmGltSEYTC7PKjn2IYPml-50wrxDgt5JxEW97DsXNwvxlefXGgu40SG0-XJJhOcuz5M2xOFjLhKGteuJwFhScWyfsFJ55NINsi-Wc-QSsxDJwCUvkO3zG76HHL5FK_7d-vDXr8ONZZs7jisQpmVW6VVyfA2TheHs.X9W1tzdU_lpwHB0mov1l9_GrPnl0DJH32aBwYJSOdDo&dib_tag=se&keywords=Fone%2Bde%2BOuvido%2Bcom%2BCancelamento%2Bde%2BRu%C3%ADdo&qid=1770313812&sprefix=fone%2Bde%2Bouvido%2Bcom%2Bcancelamento%2Bde%2Bru%C3%ADdo%2Caps%2C265&sr=8-3-spons&ufe=app_do%3Aamzn1.fos.fcd6d665-32ba-4479-9f21-b774e276a678&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&th=1&linkCode=ll2&tag=portaldascont-20&linkId=0e9454917b75817b4b32dc306d08a479&ref_=as_li_ss_tl",
            imagem: "/imgs/fone_ouvido001.jpg"
        },
        {
            titulo: "Headset com Cancelamento de Ruído",
            etiqueta: "🎧 Foco Absoluto",
            descricao: "Trabalhe em silêncio mesmo em ambientes barulhentos. Essencial para manter a produtividade nas horas extras.",
            link: "https://mercadolivre.com/sec/1rubznZ",
            imagem: "/imgs/fone_ouvido002.webp"
        },
        {
            titulo: "Luminária de Mesa LED Dimmer",
            etiqueta: "💡 Luz Adequada",
            descricao: "Boa iluminação evita cansaço visual. Regule a intensidade da luz para aguentar mais tempo sentado.",
            link: "https://mercadolivre.com/sec/2Sv5cEf",
            imagem: "../imgs/luminaria_mesa_dimmer001.webp"
        },
        {
            titulo: "Luminária de Mesa LED Dimmer",
            etiqueta: "💡 Luz Adequada",
            descricao: "Boa iluminação evita cansaço visual. Regule a intensidade da luz para aguentar mais tempo sentado.",
            link: "https://amzn.to/4ttmvPE",
            imagem: "../imgs/luminaria_mesa_dimmer002.jpg"
        },
        {
            titulo: "Teclado Mecânico RGB",
            etiqueta: "⌨️ Digitação Rápida",
            descricao: "Aumente sua velocidade e conforto durante a digitação. Menos esforço nos dedos para trabalhar mais horas.",
            link: "https://amzn.to/4rgnYHW",
            imagem: "../imgs/teclado_mecanico001.jpg"
        },
        {
            titulo: "Teclado Mecânico RGB",
            etiqueta: "⌨️ Digitação Rápida",
            descricao: "Aumente sua velocidade e conforto durante a digitação. Menos esforço nos dedos para trabalhar mais horas.",
            link: "https://mercadolivre.com/sec/1a8aeY6",
            imagem: "../imgs/teclado_mecanico002.webp"
        },
        {
            titulo: "Máquina de Café Expresso",
            etiqueta: "☕ Energia Extra",
            descricao: "Para aguentar a madrugada trabalhando, nada melhor que um café fresco e rápido direto na sua mesa.",
            link: "https://amzn.to/46FQ2vI",
            imagem: "../imgs/maquina_cafe001.jpg"
        },
        {
            titulo: "Máquina de Café Expresso",
            etiqueta: "☕ Energia Extra",
            descricao: "Para aguentar a madrugada trabalhando, nada melhor que um café fresco e rápido direto na sua mesa.",
            link: "https://mercadolivre.com/sec/28uYSWH",
            imagem: "../imgs/maquina_cafe002.webp"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Eleve a tela do notebook para alinhar a altura dos olhos. Evite dores nas costas e pescoço em sessões longas.",
            link: "https://www.amazon.com.br/Notebook-Ergon%C3%B4mico-Ajust%C3%A1vel-Regul%C3%A1vel-Universal/dp/B0F1C2GCK4?dib=eyJ2IjoiMSJ9.TTLhiJIQ_k7k-dwtL2Ady56lCpdGmHa_nrqvTZYIvg52xPClzyXQCKqUTqVA0ko_fxCLtz_NTu40TZ13ESqbnkBwPiraD4_tckSe2ziWOiXSRHICrzHM3PDlOF5WKHpzQPBjyFGQV7n0jd8rHj72mY6wI9Ug0aJfEVEn4zEjS5XriZGkra3RWcNL1ed7L1zUKfJ72Bt0_zrGADOcrQ5YL_-B7oE2hqq-KZN14doOCAz2ED978WwBH0CYuPGAkD9fEAXhihI73VV3fx83E5eIY7GfEYcQ4nCjfzVeiq15AUk.TpycuB63BUrN7suPtSLMADiKmrLZOky9sHR3ChwZLQ4&dib_tag=se&keywords=suporte+ajustavel+para+notebook&qid=1770313183&sr=8-6&linkCode=ll2&tag=portaldascont-20&linkId=4c45a3407c685cb4c21a173580556823&ref_=as_li_ss_tl",
            imagem: "/imgs/suporte_notebook001.jpg"
        },
        {
            titulo: "Suporte Ajustável para Notebook",
            etiqueta: "💻 Ergonomia",
            descricao: "Eleve a tela do notebook para alinhar a altura dos olhos. Evite dores nas costas e pescoço em sessões longas.",
            link: "https://mercadolivre.com/sec/1VfqVwZ",
            imagem: "/imgs/suporte_notebook002.webp"
        },
        {
            titulo: "Power Bank de Alta Capacidade",
            etiqueta: "🔋 Bateria Sempre Cheia",
            descricao: "O celular não pode morrer no meio de uma hora extra. Mantenha seus dispositivos carregados com um Power Bank de 20.000mAh.",
            link: "https://amzn.to/4rfuBtG",
            imagem: "/imgs/powerbank001.jpg"
        },
        {
            titulo: "Power Bank de Alta Capacidade",
            etiqueta: "🔋 Bateria Sempre Cheia",
            descricao: "O celular não pode morrer no meio de uma hora extra. Mantenha seus dispositivos carregados com um Power Bank de 20.000mAh.",
            link: "https://mercadolivre.com/sec/2mEU8M1",
            imagem: "/imgs/powerbank002.webp"
        },
        {
            titulo: "Cadeira Ergonômica",
            etiqueta: "🪑 Conforto",
            descricao: "Sentar por horas seguidas é difícil. Uma cadeira com bom suporte lombar é essencial para a sua saúde.",
            link: "https://mercadolivre.com/sec/2FnjZ8S",
            imagem: "../imgs/cadeira_ergonomica001.webp"
        },
        {
            titulo: "Cadeira Ergonômica",
            etiqueta: "🪑 Conforto",
            descricao: "Sentar por horas seguidas é difícil. Uma cadeira com bom suporte lombar é essencial para a sua saúde.",
            link: "https://amzn.to/3OzcTCY",
            imagem: "../imgs/cadeira_ergonomica002.jpg"
        },
        {
            titulo: "Mouse Vertical Ergonômico",
            etiqueta: "🖱️ Prevenção",
            descricao: "O formato vertical evita a Síndrome do Túnel do Carpo. Clique confortavelmente por horas a fio.",
            link: "https://amzn.to/3MzcXSH",
            imagem: "../imgs/mouse_vertical001.jpg"
        },
        {
            titulo: "Mouse Vertical Ergonômico",
            etiqueta: "🖱️ Prevenção",
            descricao: "O formato vertical evita a Síndrome do Túnel do Carpo. Clique confortavelmente por horas a fio.",
            link: "https://mercadolivre.com/sec/2WKu2TP",
            imagem: "../imgs/mouse_vertical002.webp"
        },
        {
            titulo: "Mesa Conversora em Pé",
            etiqueta: "📏 Alternância",
            descricao: "Alterne entre sentado e em pé. Melhora a circulação e o foco, ajudando a encarar o trabalho extra.",
            link: "https://amzn.to/4qlOFcF",
            imagem: "../imgs/mesa_pe001.jpg"
        }
    ],

    // Categoria: INSS
    inss: [
        {
            titulo: "CLT Consolidada (Edição Atualizada)",
            etiqueta: "📚 Direitos Garantidos",
            descricao: "O guia oficial da legislação trabalhista. Entenda exatamente seus direitos ao INSS, férias e rescisão.",
            link: "https://amzn.to/3MfoB5e",
            imagem: "../imgs/livro_clt.jpg"
        },
        {
            titulo: "Adeus Aposentadoria",
            etiqueta: "🕒 Planejamento",
            descricao: "Não espere a hora chegar sem se preparar. Este livro ensina a como garantir o seu futuro sem depender dos outros.",
            link: "https://amzn.to/402nnNM",
            imagem: "../imgs/livro_aposentadoria.jpg"
        },
        {
            titulo: "Organizador Financeiro",
            etiqueta: "📂 Ordem",
            descricao: "Mantenha contracheques, extratos de INSS e documentos seguros em um arquivo organizador portátil.",
            link: "https://amzn.to/3O9CpP5",
            imagem: "/imgs/organizador005.jpg"
        },
        {
            titulo: "Calculadora Científica Financeira",
            etiqueta: "🔢 Profissional",
            descricao: "Para conferir os cálculos de juros e amortização com precisão, tenha uma calculadora financeira à mão.",
            link: "https://amzn.to/4r10CFR",
            imagem: "/imgs/calculadora003.jpg"
        },
        {
            titulo: "Lupa com Luz LED",
            etiqueta: "🔍 Leitura Fácil",
            descricao: "Muitas vezes os contracheques têm letras pequenas. Uma lupa com iluminação ajuda a conferir os descontos.",
            link: "https://amzn.to/4kt7Yj6",
            imagem: "../imgs/lupa_led.jpg"
        },
        {
            titulo: "Cofre para Documentos",
            etiqueta: "🔒 Proteção",
            descricao: "Seus documentos de previdência são vitais. Guarde-os em um cofre resistente a incêndio e invasão.",
            link: "https://mercadolivre.com/sec/14B3gPT",
            imagem: "../imgs/cofre_seguranca.webp"
        },
        {
            titulo: "Os Segredos da Mente Milionária",
            etiqueta: "🧠 Psicologia Financeira",
            descricao: "Descubra os modelos mentais que limitam seu crescimento financeiro e como quebrá-los.",
            link: "https://amzn.to/462oCjE",
            imagem: "../imgs/livro_segredos_mente.jpg"
        },
        {
            titulo: "Agenda de Controle Financeiro",
            etiqueta: "📝 Diário de Gastos",
            descricao: "Registrar o que entra e sai é o primeiro passo. Uma agenda específica para finanças ajuda a organizar o orçamento.",
            link: "https://amzn.to/46ruGCk",
            imagem: "../imgs/agenda_controle.jpg"
        },
        {
            titulo: "Banco de Energia Nobreak",
            etiqueta: "🔌 Energia",
            descricao: "Para quem trabalha em casa, garantir que o computador não desliga em queda de luz é proteger seu trabalho.",
            link: "https://amzn.to/4raIRUT",
            imagem: "../imgs/nobreak_pequeno.jpg"
        }
    ],

    // Categoria: Porcentagem
    porcentagem: [
        {
            titulo: "Calculadora Financeira HP12C",
            etiqueta: "🔢 Profissional",
            descricao: "A ferramenta indispensável para lidar com juros e porcentagens no dia a dia financeiro.",
            link: "https://amzn.to/4r10CFR",
            imagem: "/imgs/calculadora003.jpg"
        },
        {
            titulo: "Matemática Financeira para Leigos",
            etiqueta: "📚 Guia Prático",
            descricao: "Entenda como o dinheiro funciona e pare de se perder em porcentagens, juros e amortização.",
            link: "https://amzn.to/4qwJ57F",
            imagem: "../imgs/livro_financa_leigo.jpg"
        },
        {
            titulo: "Calculadora Científica Escolar",
            etiqueta: "🎓 Estudos",
            descricao: "Essencial para quem está aprendendo matemática. Resolva operações de porcentagem com facilidade.",
            link: "https://amzn.to/3MzKzjm",
            imagem: "../imgs/calculadora_cientifica_escolar001.jpg"
        },
        {
            titulo: "Calculadora Científica Escolar",
            etiqueta: "🎓 Estudos",
            descricao: "Essencial para quem está aprendendo matemática. Resolva operações de porcentagem com facilidade.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_cientifica_escolar002.webp"
        },
        {
            titulo: "Lupa de Bolso com Iluminação",
            etiqueta: "🔍 Leitura de Contratos",
            descricao: "Não assine nada sem ler as letras miúdas. Uma lupa ajuda a ver as porcentagens de juros ocultas.",
            link: "https://amzn.to/3MdmXkx",
            imagem: "../imgs/lupa_bolso001.jpg"
        },
        {
            titulo: "Lupa de Bolso com Iluminação",
            etiqueta: "🔍 Leitura de Contratos",
            descricao: "Não assine nada sem ler as letras miúdas. Uma lupa ajuda a ver as porcentagens de juros ocultas.",
            link: "https://mercadolivre.com/sec/2uioxN6",
            imagem: "../imgs/lupa_bolso002.webp"
        },
        {
            titulo: "Livro de Matemática Básica",
            etiqueta: "📐 Reforço Escolar",
            descricao: "Revise os fundamentos da matemática: frações, porcentagens e regra de três.",
            link: "https://amzn.to/4r5CfXz",
            imagem: "../imgs/livro_matematica001.jpg"
        },
        {
            titulo: "Agenda de Controle de Vendas",
            etiqueta: "📝 Negócios",
            descricao: "Para comerciantes: anote o lucro percentual diário e acompanhe a saúde financeira do seu comércio.",
            link: "https://mercadolivre.com/sec/33fWZBJ",
            imagem: "../imgs/agenda_vendas002.webp"
        },
        {
            titulo: "Agenda de Controle de Vendas",
            etiqueta: "📝 Negócios",
            descricao: "Para comerciantes: anote o lucro percentual diário e acompanhe a saúde financeira do seu comércio.",
            link: "https://amzn.to/46ruGCk",
            imagem: "../imgs/agenda_controle.jpg"
        },
        {
            titulo: "Balança de Precisão",
            etiqueta: "⚖️ Ingredientes",
            descricao: "Para cozinheiros: calcule a porcentagem de ingredientes ou desperdício em sua receita com precisão.",
            link: "https://amzn.to/4rA8E8u",
            imagem: "/imgs/balanca_cozinha002.jpg"
        },
        {
            titulo: "Fita Métrica de Costura",
            etiqueta: "📏 Moda e Tecidos",
            descricao: "Calcule a porcentagem de tecido necessário para uma peça e evite erros de corte caros.",
            link: "https://amzn.to/4r7Jpum",
            imagem: "../imgs/fita_metrica003.jpg"
        },
        {
            titulo: "Powerbank 10000mAh",
            etiqueta: "🔋 Bateria Extra",
            descricao: "Ofereça 5% a mais de bateria ao seu celular. Never more fique desconectado em uma reunião.",
            link: "https://amzn.to/4tu8uBi",
            imagem: "../imgs/powerbank_10k001.jpg"
        },
        {
            titulo: "Powerbank 10000mAh",
            etiqueta: "🔋 Bateria Extra",
            descricao: "Ofereça 5% a mais de bateria ao seu celular. Never more fique desconectado em uma reunião.",
            link: "https://mercadolivre.com/sec/1GKq1KG",
            imagem: "../imgs/powerbank_10k002.webp"
        },
        {
            titulo: "Termômetro Infravermelho",
            etiqueta: "🌡️ Temperatura",
            descricao: "Saiba a porcentagem de carga da sua bateria ou a temperatura precisa de processadores eletrônicos.",
            link: "https://amzn.to/4aGbVNU",
            imagem: "../imgs/termometro_infrared001.jpg"
        },
        {
            titulo: "Termômetro Infravermelho",
            etiqueta: "🌡️ Temperatura",
            descricao: "Saiba a porcentagem de carga da sua bateria ou a temperatura precisa de processadores eletrônicos.",
            link: "https://mercadolivre.com/sec/32kkqFF",
            imagem: "../imgs/termometro_infrared002.webp"
        },
        {
            titulo: "Termômetro Infravermelho",
            etiqueta: "🌡️ Temperatura",
            descricao: "Saiba a porcentagem de carga da sua bateria ou a temperatura precisa de processadores eletrônicos.",
            link: "https://mercadolivre.com/sec/2CowHQK",
            imagem: "../imgs/termometro_infrared003.webp"
        }
    ],

    // Categoria: Salário
    salario: [
        {
            titulo: "CLT Consolidada (Edição Atualizada)",
            etiqueta: "📚 Direitos Trabalhistas",
            descricao: "Conheça seus direitos sobre hora extra, férias e 13º salário. O livro que todo trabalhador deve ter.",
            link: "https://amzn.to/3MfoB5e",
            imagem: "../imgs/livro_clt.jpg"
        },
        {
            titulo: "Cronômetro Digital de Mesa",
            etiqueta: "⏱️ Controle de Tempo",
            descricao: "Registre exatamente suas horas trabalhadas para garantir que o pagamento esteja correto.",
            link: "https://amzn.to/3OaOEek",
            imagem: "../imgs/cronometro_mesa.jpg"
        },
        {
            titulo: "Trabalhe 4 horas por dia",
            etiqueta: "🚀 Produtividade",
            descricao: "Trabalhe menos e ganhe mais. O clássico sobre redefinição de riqueza e qualidade de vida.",
            link: "https://amzn.to/4qs9Qd8",
            imagem: "../imgs/livro_4_horas001.jpg"
        },
        {
            titulo: "Organizador de Documentos",
            etiqueta: "📂 Profissional",
            label: "Organização",
            descricao: "Mantenha contracheques, holerites e comprovantes de renda organizados para o seu controle financeiro.",
            link: "https://amzn.to/3O9CpP5",
            imagem: "/imgs/organizador005.jpg"
        },
        {
            titulo: "Relógio de Ponto Digital",
            etiqueta: "🕐 Registro",
            descricao: "Para home office: registre seus horários de entrada e saída automaticamente para conferir o salário.",
            link: "https://amzn.to/4rLV7Lq",
            imagem: "../imgs/relogio_ponto001.jpg"
        },
        {
            titulo: "Relógio de Ponto Digital",
            etiqueta: "🕐 Registro",
            descricao: "Para home office: registre seus horários de entrada e saída automaticamente para conferir o salário.",
            link: "https://mercadolivre.com/sec/2F63sYm",
            imagem: "../imgs/relogio_ponto002.webp"
        },
        {
            titulo: "Cadeira Escritório Presidente",
            etiqueta: "🪑 Conforto no Trabalho",
            descricao: "Você ganha seu salário sentado. Invista em uma cadeira ergonômica para cuidar da sua saúde.",
            link: "https://amzn.to/46Fz00M",
            imagem: "../imgs/cadeira_presidente001.jpg"
        },
        {
            titulo: "Cadeira Escritório Presidente",
            etiqueta: "🪑 Conforto no Trabalho",
            descricao: "Você ganha seu salário sentado. Invista em uma cadeira ergonômica para cuidar da sua saúde.",
            link: "https://mercadolivre.com/sec/2YcEsD5",
            imagem: "../imgs/cadeira_presidente002.webp"
        },
        {
            titulo: "Mochila Executiva Impermeável",
            etiqueta: "💼 Profissionalismo",
            descricao: "Leve seus documentos de trabalho e computador com segurança e estilo para o escritório.",
            link: "https://amzn.to/4rIhZLE",
            imagem: "../imgs/mochila_executiva001.jpg"
        },
        {
            titulo: "Mochila Executiva Impermeável",
            etiqueta: "💼 Profissionalismo",
            descricao: "Leve seus documentos de trabalho e computador com segurança e estilo para o escritório.",
            link: "https://mercadolivre.com/sec/1r5VFHz",
            imagem: "../imgs/mochila_executiva002.webp"
        },
        {
            titulo: "Calculadora Impressora Fiscal",
            etiqueta: "🖨️ Controle",
            descricao: "Imprima recibos e orçamentos com agilidade e profissionalismo.",
            link: "https://amzn.to/4ab1aTO",
            imagem: "../imgs/calculadora_impressora001.jpg"
        },
        {
            titulo: "Calculadora Impressora Fiscal",
            etiqueta: "🖨️ Controle",
            descricao: "Imprima recibos e orçamentos com agilidade e profissionalismo.",
            link: "",
            imagem: "../imgs/calculadora_impressora002.webp"
        },
        {
            titulo: "Kit Canetas Azul e Preta",
            etiqueta: "✒️ Assinatura",
            descricao: "Tenha sempre uma caneta à mão para checar pagamentos e assinar documentos. O clássico indispensável.",
            link: "https://amzn.to/4kwoVcz",
            imagem: "../imgs/canetas_bic001.jpg"
        },
        {
            titulo: "Kit de Canetas Esferográficas",
            etiqueta: "✒️ Assinatura",
            descricao: "Tenha sempre uma caneta à mão para checar pagamentos e assinar documentos. O clássico indispensável.",
            link: "https://mercadolivre.com/sec/2A2zGfo",
            imagem: "../imgs/canetas_bic002.webp"
        }
    ],

    // Categoria: Bhaskara
    bhaskara: [
        {
            titulo: "Calculadora Científica FX-82MS-2-S4-DH Casio",
            etiqueta: "🧮 Essencial Matemática",
            descricao: "Resolve equações polinomiais e faz cálculos complexos. Ideal para verificar seus resultados da Bhaskara.",
            link: "https://amzn.to/4cBuAfe",
            imagem: "../imgs/calculadora_cientifica001.jpg"
        },
        {
            titulo: "Calculadora Científica FX-82MS-2-S4-DH Casio",
            etiqueta: "🧮 Essencial Matemática",
            descricao: "Resolve equações polinomiais e faz cálculos complexos. Ideal para verificar seus resultados da Bhaskara.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_cientifica002.webp"
        },
        {
            titulo: "Livro: Matemática Básica para Concursos",
            etiqueta: "📚 Estudo",
            descricao: "Domine as fórmulas de segunda grau e funções quadráticas com este guia prático.",
            link: "https://amzn.to/4qJjBnk",
            imagem: "../imgs/livro_mat_basica001.jpg"
        },
        {
            titulo: "Livro: Matemática Básica para Concursos",
            etiqueta: "📚 Estudo",
            descricao: "Domine as fórmulas de segunda grau e funções quadráticas com este guia prático.",
            link: "https://amzn.to/4rqq0VR",
            imagem: "../imgs/livro_mat_basica002.jpg"
        },
        {
            titulo: "Livro: Matemática Básica para Concursos",
            etiqueta: "📚 Estudo",
            descricao: "Domine as fórmulas de segunda grau e funções quadráticas com este guia prático.",
            link: "https://amzn.to/46g3Kpf",
            imagem: "../imgs/livro_mat_basica003.jpg"
        },
        {
            titulo: "Livro: Matemática Básica para Concursos",
            etiqueta: "📚 Estudo",
            descricao: "Domine as fórmulas de segunda grau e funções quadráticas com este guia prático.",
            link: "https://amzn.to/4tKWCuO",
            imagem: "../imgs/livro_mat_basica003.jpg"
        },
        {
            titulo: "Kit Régua e Esquadro",
            etiqueta: "📐 Geometria",
            descricao: "Para traçar parábolas e compreender o lado gráfico da equação de Bhaskara no papel.",
            link: "https://amzn.to/3OPay76",
            imagem: "../imgs/kit_regua001.jpg"
        },
        {
            titulo: "Kit Régua e Esquadro",
            etiqueta: "📐 Geometria",
            descricao: "Para traçar parábolas e compreender o lado gráfico da equação de Bhaskara no papel.",
            link: "https://mercadolivre.com/sec/1U1i1nX",
            imagem: "../imgs/kit_regua002.webp"
        }
    ],

    // Categoria: Churrasco
    churrasco: [
        {
            titulo: "Faca Trinchante Profissional",
            etiqueta: "🔪 Corte Perfeito",
            descricao: "Corte a carne com precisão após calcular o consumo por pessoa. A lâmina perfeita para churrasco.",
            link: "https://mercadolivre.com/sec/1baCM8A",
            imagem: "../imgs/faca_trinchante001.webp"
        },
        {
            titulo: "Faca Trinchante Profissional",
            etiqueta: "🔪 Corte Perfeito",
            descricao: "Corte a carne com precisão após calcular o consumo por pessoa. A lâmina perfeita para churrasco.",
            link: "https://amzn.to/3ORcdJi",
            imagem: "../imgs/faca_trinchante002.jpg"
        },
        {
            titulo: "Espetos de Aço Inox 12 Peças",
            etiqueta: "🍢 Preparo",
            descricao: "Organize os espetinhos calculando a quantidade certa para cada convidado.",
            link: "https://amzn.to/4kPcokE",
            imagem: "../imgs/espetos_inox001.jpg"
        },
        {
            titulo: "Espetos de Aço Inox 12 Peças",
            etiqueta: "🍢 Preparo",
            descricao: "Organize os espetinhos calculando a quantidade certa para cada convidado.",
            link: "https://mercadolivre.com/sec/2xMD7g6",
            imagem: "../imgs/espetos_inox002.webp"
        },
        {
            titulo: "Tábua de Corte para Carne",
            etiqueta: "🥩 Utilidade",
            descricao: "Superfície higiênica e resistente para manipular a carne no preparo.",
            link: "https://amzn.to/4rWl2jn",
            imagem: "../imgs/tabua_corte001.jpg"
        },
        {
            titulo: "Tábua de Corte para Carne",
            etiqueta: "🥩 Utilidade",
            descricao: "Superfície higiênica e resistente para manipular a carne no preparo.",
            link: "https://mercadolivre.com/sec/11duitR",
            imagem: "../imgs/tabua_corte002.webp"
        },
        {
            titulo: "Termômetro Digital para Alimentos",
            etiqueta: "🌡️ Controle",
            descricao: "Saiba o ponto exato da carne. Não confie apenas no olho, use a ciência.",
            link: "https://www.amazon.com.br/Term%C3%B4metro-Culin%C3%A1rio-Digital-Leitura-Frituras/dp/B0FGCNM8RZ?crid=237203XDG5K5K&dib=eyJ2IjoiMSJ9.G9wvAHXRhNXzl9FrXnks74Jqmx5jB1OEXLc_dI7TNM-dGN3hcc6GY6I0zLWV0LcgWqxu5dY4PvNwF9jgL5rp7hxXIKFllyNGOVWSdfEySCIk_wn0UUVgVvMILLN4Y8fBpUE9Aubn9eKcA19icJjBc4mFBZfK9l1b2Zzx2hcWzdvlaChmmoEBCcLatdOilV2hHgu7FLRXYEdPjKJSbwgBsMEWdUN08iVQ9UGZZTNanLHH90MT-irgZOQ1lNJZZ7z-nKlz3iZhIqPnwY747YcNz4v4hjZXmgrsvAE9Kp4pR4E.3fGNpt65qIce9cVW_MuU3Z8VIZlS_SCIBl5Xg_2nlWE&dib_tag=se&keywords=termometro+culinario&qid=1770223964&sprefix=termo%2Caps%2C334&sr=8-1-spons&sp_csd=d2lkZ2V0TmFtZT1zcF9hdGY&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=f047090ba40d41bbcc1c849dee24886e&ref_=as_li_ss_tl",
            imagem: "/imgs/termometro_culinario.jpg"
        },
        {
            titulo: "Termômetro Digital para Alimentos",
            etiqueta: "🌡️ Controle",
            descricao: "Saiba o ponto exato da carne. Não confie apenas no olho, use a ciência.",
            link: "https://mercadolivre.com/sec/34hBgZA",
            imagem: "/imgs/termometro_culinario.jpg"
        }
    ],

    // Categoria: Conversor de Unidades
    conversor_unidades: [
        {
            titulo: "Trena Digital a Laser 40m",
            etiqueta: "📏 Precisão",
            descricao: "Converta metros em centímetros ou polegadas instantaneamente na prática.",
            link: "https://amzn.to/3OkIAjD",
            imagem: "../imgs/trena_laser001.jpg"
        },
        {
            titulo: "Trena Digital a Laser 40m",
            etiqueta: "📏 Precisão",
            descricao: "Converta metros em centímetros ou polegadas instantaneamente na prática.",
            link: "https://amzn.to/3MvytIb",
            imagem: "../imgs/trena_laser002.jpg"
        },
        {
            titulo: "Trena Digital a Laser 40m",
            etiqueta: "📏 Precisão",
            descricao: "Converta metros em centímetros ou polegadas instantaneamente na prática.",
            link: "https://mercadolivre.com/sec/2erYg3q",
            imagem: "../imgs/trena_laser003.webp"
        },
        {
            titulo: "Trena Digital a Laser 40m",
            etiqueta: "📏 Precisão",
            descricao: "Converta metros em centímetros ou polegadas instantaneamente na prática.",
            link: "https://mercadolivre.com/sec/13SsLKo",
            imagem: "../imgs/trena_laser004.webp"
        },
        {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Medição",
            descricao: "Essencial para converter receitas entre xícaras, gramas e mililitros.",
            link: "https://mercadolivre.com/sec/1KoxJVC",
            imagem: "/imgs/balanca_cozinha001.jpg"
        },
        {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Medição",
            descricao: "Essencial para converter receitas entre xícaras, gramas e mililitros.",
            link: "https://www.amazon.com.br/Alimentos-Antiderrapante-Resistente-Defini%C3%A7%C3%A3o-Pessagem/dp/B0FC987YXM?pd_rd_w=DxRgf&content-id=amzn1.sym.ebf6c53b-8563-45af-833e-25b1308ef797&pf_rd_p=ebf6c53b-8563-45af-833e-25b1308ef797&pf_rd_r=BV8P034P5NT6NDKTCKTM&pd_rd_wg=SsCxL&pd_rd_r=0a4b4438-43f1-471f-ad95-b305c37c5cd6&pd_rd_i=B0FC987YXM&psc=1&linkCode=ll2&tag=portaldascont-20&linkId=a330700d9f12fcb079aa9f1da5e3f11d&ref_=as_li_ss_tl",
            imagem: "/imgs/balanca_cozinha.jpg"
        },
        {
            titulo: "Fita Métrica de Costura",
            etiqueta: "📏 Flexível",
            descricao: "Para medidas de tecido ou corpo, convertendo fácil entre cm e polegadas.",
            link: "https://amzn.to/4qLeqDs",
            imagem: "../imgs/fita_metrica004.jpg"
        },
        {
            titulo: "Fita Métrica de Costura",
            etiqueta: "📏 Flexível",
            descricao: "Para medidas de tecido ou corpo, convertendo fácil entre cm e polegadas.",
            link: "https://mercadolivre.com/sec/2rFLqgm",
            imagem: "../imgs/fita_metrica005.webp"
        }
    ],

    // Categoria: Coeficiente de Rendimento Universitário (CR)
    coeficiente_rendimento: [
        {
            titulo: "Canetas Esferográficas 12 Cores",
            etiqueta: "✒️ Estudos",
            descricao: "Organize suas anotações de aula por cor para maximizar seu rendimento nos estudos.",
            link: "https://mercadolivre.com/sec/1f18Aj1",
            imagem: "../imgs/canetas_coloridas001.webp"
        },
        {
            titulo: "Canetas Esferográficas 10 Cores",
            etiqueta: "✒️ Estudos",
            descricao: "Organize suas anotações de aula por cor para maximizar seu rendimento nos estudos.",
            link: "https://mercadolivre.com/sec/1J72tfx",
            imagem: "../imgs/canetas_coloridas002.webp"
        },
        {
            titulo: "Canetas Esferográficas 24 Cores",
            etiqueta: "✒️ Estudos",
            descricao: "Organize suas anotações de aula por cor para maximizar seu rendimento nos estudos.",
            link: "https://mercadolivre.com/sec/2F4Hf9h",
            imagem: "../imgs/canetas_coloridas003.webp"
        },
        {
            titulo: "Canetas Esferográficas 24 Cores",
            etiqueta: "✒️ Estudos",
            descricao: "Organize suas anotações de aula por cor para maximizar seu rendimento nos estudos.",
            link: "https://mercadolivre.com/sec/2gyvGPK",
            imagem: "../imgs/canetas_coloridas004.webp"
        },
        {
            titulo: "Organizador de Mesa Giratório",
            etiqueta: "🗂️ Organização",
            descricao: "Mantenha seus materiais de estudo à mão e otimize seu tempo de estudo.",
            link: "https://mercadolivre.com/sec/2x5T2GR",
            imagem: "../imgs/organizador_mesa001.webp"
        },
        {
            titulo: "Organizador de Mesa Giratório",
            etiqueta: "🗂️ Organização",
            descricao: "Mantenha seus materiais de estudo à mão e otimize seu tempo de estudo.",
            link: "https://amzn.to/4qGhoZX",
            imagem: "../imgs/organizador_mesa002.jpg"
        },
        {
            titulo: "Luminária de Mesa LED",
            etiqueta: "💡 Foco",
            descricao: "Estude à noite sem cansar a vista. A iluminação correta ajuda na concentração.",
            link: "https://amzn.to/4tILhLN",
            imagem: "../imgs/luminaria_led001.jpg"
        },
        {
            titulo: "Luminária de Mesa LED",
            etiqueta: "💡 Foco",
            descricao: "Estude à noite sem cansar a vista. A iluminação correta ajuda na concentração.",
            link: "https://mercadolivre.com/sec/2WzksFB",
            imagem: "../imgs/luminaria_led002.webp"
        }
    ],

    // Categorias: Energia
    energia: [
        {
            titulo: "Medidor de Consumo de Energia",
            etiqueta: "⚡ Controle",
            descricao: "Descubra quais aparelhos consomem mais e calcule sua conta de luz com precisão.",
            link: "https://amzn.to/4aEUUTf",
            imagem: "../imgs/medidor_energia001.jpg"
        },
        {
            titulo: "Medidor de Consumo de Energia",
            etiqueta: "⚡ Controle",
            descricao: "Descubra quais aparelhos consomem mais e calcule sua conta de luz com precisão.",
            link: "https://mercadolivre.com/sec/2J1MVQv",
            imagem: "../imgs/medidor_energia002.webp"
        },
        {
            titulo: "Kit 6 Lâmpadas LED 10W",
            etiqueta: "💡 Economia",
            descricao: "Reduza seu consumo energético trocando as lâmpadas antigas por LED.",
            link: "https://amzn.to/4tFOVGB",
            imagem: "../imgs/lampadas_led001.jpg"
        },
        {
            titulo: "Kit 6 Lâmpadas LED 10W",
            etiqueta: "💡 Economia",
            descricao: "Reduza seu consumo energético trocando as lâmpadas antigas por LED.",
            link: "https://mercadolivre.com/sec/1TAktRB",
            imagem: "../imgs/lampadas_led002.webp"
        },
        {
            titulo: "Kit 6 Lâmpadas LED 10W Smart",
            etiqueta: "💡 Economia",
            descricao: "Reduza seu consumo energético trocando as lâmpadas antigas por LED.",
            link: "https://mercadolivre.com/sec/2JYWYhq",
            imagem: "../imgs/lampadas_led003.webp"
        },
        {
            titulo: "Multímetro Digital",
            etiqueta: "🔧 Ferramenta",
            descricao: "Meça tensão, corrente e resistência. O básico para entender circuitos elétricos.",
            link: "https://amzn.to/3MREPSb",
            imagem: "../imgs/multimetro001.jpg"
        },
        {
            titulo: "Multímetro Digital",
            etiqueta: "🔧 Ferramenta",
            descricao: "Meça tensão, corrente e resistência. O básico para entender circuitos elétricos.",
            link: "https://mercadolivre.com/sec/1vvAU5d",
            imagem: "../imgs/multimetro002.webp"
        },
        {
            titulo: "Multímetro Digital",
            etiqueta: "🔧 Ferramenta",
            descricao: "Meça tensão, corrente e resistência. O básico para entender circuitos elétricos.",
            link: "https://mercadolivre.com/sec/2Quuyhh",
            imagem: "../imgs/multimetro003.webp"
        },
        {
            titulo: "Multímetro Digital",
            etiqueta: "🔧 Ferramenta",
            descricao: "Meça tensão, corrente e resistência. O básico para entender circuitos elétricos.",
            link: "https://mercadolivre.com/sec/2cTq3rh",
            imagem: "../imgs/multimetro004.webp"
        }
    ],

    // Categoria: Equação do Primeiro Grau
    equacao_primeiro_grau: [
        {
            titulo: "Calculadora Escolar 12 Dígitos",
            etiqueta: "🧮 Básica",
            descricao: "Perfeita para operações fundamentais e resolução de equações lineares simples.",
            link: "https://mercadolivre.com/sec/1S1x7zy",
            imagem: "../imgs/calculadora_escolar001.webp"
        },
        {
            titulo: "Calculadora Escolar 12 Dígitos",
            etiqueta: "🧮 Básica",
            descricao: "Perfeita para operações fundamentais e resolução de equações lineares simples.",
            link: "https://amzn.to/40krpkK",
            imagem: "../imgs/calculadora_escolar002.jpg"
        },
        {
            titulo: "Livro: Matemática Básica - Equações",
            etiqueta: "📚 Aprendizado",
            descricao: "Um guia didático para entender isolamento de variáveis e fundamentos.",
            link: "https://amzn.to/3Ol9rfr",
            imagem: "../imgs/livro_equacoes001.jpg"
        },
        {
            titulo: "Livro: Matemática Básica - Equações",
            etiqueta: "📚 Aprendizado",
            descricao: "Um guia didático para entender isolamento de variáveis e fundamentos.",
            link: "https://amzn.to/4rZWlCP",
            imagem: "../imgs/livro_equacoes002.jpg"
        },
        {
            titulo: "Quadro Branco de Mesa",
            etiqueta: "🖊️ Prática",
            descricao: "Resolva suas equações quantas vezes quiser sem gastar papel.",
            link: "https://mercadolivre.com/sec/1eVTfcL",
            imagem: "../imgs/quadro_branco_pequeno001.webp"
        }
    ],

    // Categoria: Festa
    festas_variadas: [
        {
            titulo: "Kit Balões Coloridos Metalizados 50 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://mercadolivre.com/sec/2JzNK9v",
            imagem: "../imgs/baloes_kit001.webp"
        },
        {
            titulo: "Kit Balões Coloridos 50 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://mercadolivre.com/sec/1ozYWqS",
            imagem: "../imgs/baloes_kit002.webp"
        },
        {
            titulo: "Kit Balões Coloridos Metalizados 50 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://mercadolivre.com/sec/1U5cr7W",
            imagem: "../imgs/baloes_kit003.webp"
        },
        {
            titulo: "Kit Balões Coloridos 100 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://amzn.to/4aH2pcj",
            imagem: "../imgs/baloes_kit004.jpg"
        },
        {
            titulo: "Kit Balões Lilás e Roxo 100 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://amzn.to/3MSQeRN",
            imagem: "../imgs/baloes_kit005.jpg"
        },
        {
            titulo: "Kit Balões Rosa Claro e Metalizado 100 Unidades",
            etiqueta: "🎈 Decoração",
            descricao: "Essenciais para qualquer festa. Calcule a quantidade para encher o ambiente.",
            link: "https://amzn.to/4kPEhsQ",
            imagem: "../imgs/baloes_kit006.jpg"
        },
        {
            titulo: "Bomba de Encher Balões Elétrica",
            etiqueta: "💨 Agilidade",
            descricao: "Encha dezenas de balões em minutos. Economize fôlego para a festa.",
            link: "https://mercadolivre.com/sec/1mZ6Acm",
            imagem: "../imgs/bomba_baloes001.webp"
        },
        {
            titulo: "Bomba de Encher Balões Elétrica",
            etiqueta: "💨 Agilidade",
            descricao: "Encha dezenas de balões em minutos. Economize fôlego para a festa.",
            link: "https://mercadolivre.com/sec/32NuEJP",
            imagem: "../imgs/bomba_baloes002.webp"
        },
        {
            titulo: "Bomba de Encher Balões Elétrica",
            etiqueta: "💨 Agilidade",
            descricao: "Encha dezenas de balões em minutos. Economize fôlego para a festa.",
            link: "https://amzn.to/4rK90u1",
            imagem: "../imgs/bomba_baloes003.jpg"
        },
        {
            titulo: "Guirlanda LED 10 Metros",
            etiqueta: "✨ Luz",
            descricao: "Ilumine o ambiente festivo com baixo consumo de energia.",
            link: "https://amzn.to/4apbQ1c",
            imagem: "../imgs/guirlanda_led001.jpg"
        },
        {
            titulo: "Guirlanda LED 10 Metros",
            etiqueta: "✨ Luz",
            descricao: "Ilumine o ambiente festivo com baixo consumo de energia.",
            link: "https://mercadolivre.com/sec/2JWwgje",
            imagem: "../imgs/guirlanda_led002.webp"
        }
    ],

    // Categoria: Força
    forca: [
        {
            titulo: "Dinamômetro Escolar 10N",
            etiqueta: "🍎 Laboratório",
            descricao: "Meça forças em Newtons na prática. O objeto perfeito para visualizar a 2ª Lei de Newton.",
            link: "https://mercadolivre.com/sec/1oCGUY7",
            imagem: "../imgs/dinamometro001.webp"
        },
        {
            titulo: "Dinamômetro Escolar 10N",
            etiqueta: "🍎 Laboratório",
            descricao: "Meça forças em Newtons na prática. O objeto perfeito para visualizar a 2ª Lei de Newton.",
            link: "https://amzn.to/4arsT2L",
            imagem: "../imgs/dinamometro002.jpg"
        },
        {
            titulo: "Kit Física Experimental - Mecânica",
            etiqueta: "⚙️ Experimentos",
            descricao: "Poliadas, roldanas e pesos para montar experimentos de força e atrito.",
            link: "https://mercadolivre.com/sec/2scHNgo",
            imagem: "../imgs/kit_fisica_mecanica001.webp"
        },
        {
            titulo: "Kit Física Experimental - Mecânica",
            etiqueta: "⚙️ Experimentos",
            descricao: "Poliadas, roldanas e pesos para montar experimentos de força e atrito.",
            link: "https://mercadolivre.com/sec/2hjh1Po",
            imagem: "../imgs/kit_fisica_mecanica002.webp"
        },
        {
            titulo: "Livro: Física Básica - Mecânica",
            etiqueta: "📚 Teoria",
            descricao: "Curso de Física Básica: Mecânica (Volume 1). A bíblia para entender força e movimento.",
            link: "https://amzn.to/3ZL4xux",
            imagem: "../imgs/livro_fisica_mecanica001.jpg"
        },
        {
            titulo: "Livro: Física Básica - Mecânica",
            etiqueta: "📚 Teoria",
            descricao: "Física Básica - Mecânica. O melhor livro sobre física básica já publicado no Brasil.",
            link: "https://amzn.to/4bZ6Pxx",
            imagem: "../imgs/livro_fisica_mecanica002.jpg"
        }
    ],

    // Categoria: Gasto Calórico
    gasto_calorico: [
        {
            titulo: "Smartwatch Monitor Cardíaco",
            etiqueta: "⌚ Tecnologia",
            descricao: "Monitore seus batimentos e calcule as calorias queimadas em tempo real durante o exercício.",
            link: "https://amzn.to/46JwBCo",
            imagem: "../imgs/smartwatch003.jpg"
        },
        {
            titulo: "Smartwatch Monitor Cardíaco",
            etiqueta: "⌚ Tecnologia",
            descricao: "Monitore seus batimentos e calcule as calorias queimadas em tempo real durante o exercício.",
            link: "https://mercadolivre.com/sec/137zfrk",
            imagem: "../imgs/smartwatch004.webp"
        },
        {
            titulo: "Balança de Bioimpedância",
            etiqueta: "⚖️ Saúde",
            descricao: "Além do peso, veja sua massa gorda e taxa metabólica basal.",
            link: "https://amzn.to/4bED1pR",
            imagem: "/imgs/balanca002.jpg"
        },
        {
            titulo: "Balança de Bioimpedância",
            etiqueta: "⚖️ Saúde",
            descricao: "Além do peso, veja sua massa gorda e taxa metabólica basal.",
            link: "https://mercadolivre.com/sec/1feZ8CS",
            imagem: "/imgs/balanca001.webp"
        },
        {
            titulo: "Balança de Bioimpedância",
            etiqueta: "⚖️ Saúde",
            descricao: "Além do peso, veja sua massa gorda e taxa metabólica basal.",
            link: "https://mercadolivre.com/sec/2LbGHG6",
            imagem: "/imgs/balanca003.webp"
        },
        {
            titulo: "Corda de Pular para Exercícios",
            etiqueta: "🏃 Cardio",
            descricao: "Uma das melhores formas de queimar calorias em pouco espaço.",
            link: "https://amzn.to/3MTV0yp",
            imagem: "../imgs/corda_pular001.jpg"
        },
        {
            titulo: "Corda de Pular para Exercícios",
            etiqueta: "🏃 Cardio",
            descricao: "Uma das melhores formas de queimar calorias em pouco espaço.",
            link: "https://mercadolivre.com/sec/16SusGU",
            imagem: "../imgs/corda_pular002.webp"
        },
        {
            titulo: "Corda de Pular para Exercícios",
            etiqueta: "🏃 Cardio",
            descricao: "Uma das melhores formas de queimar calorias em pouco espaço.",
            link: "https://mercadolivre.com/sec/1Eabbxo",
            imagem: "../imgs/corda_pular003.webp"
        },
        {
            titulo: "Corda de Pular para Exercícios",
            etiqueta: "🏃 Cardio",
            descricao: "Uma das melhores formas de queimar calorias em pouco espaço.",
            link: "https://mercadolivre.com/sec/2SVBAZD",
            imagem: "../imgs/corda_pular004.webp"
        }
    ],

    // Categoria: km/h para m/s (Física/Cinemática)
    kmh_ms: [
        {
            titulo: "Calculadora de Engenharia",
            etiqueta: "🧮 Profissional",
            descricao: "Para conversões rápidas de unidades de velocidade no trabalho ou faculdade.",
            link: "https://amzn.to/3MTgA66",
            imagem: "../imgs/calculadora_engenharia001.jpg"
        },
        {
            titulo: "Calculadora de Engenharia",
            etiqueta: "🧮 Profissional",
            descricao: "Para conversões rápidas de unidades de velocidade no trabalho ou faculdade.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_engenharia002.webp"
        },
        {
            titulo: "Velocímetro Digital para Bicicleta",
            etiqueta: "🚴 Ciclismo",
            descricao: "Veja sua velocidade em km/h e faça as conversões mentais para m/s durante o pedal.",
            link: "https://mercadolivre.com/sec/2m7BqyY",
            imagem: "../imgs/velocimetro_bike001.webp"
        },
        {
            titulo: "Velocímetro Digital para Bicicleta",
            etiqueta: "🚴 Ciclismo",
            descricao: "Veja sua velocidade em km/h e faça as conversões mentais para m/s durante o pedal.",
            link: "https://mercadolivre.com/sec/1AHk8K1",
            imagem: "../imgs/velocimetro_bike002.webp"
        }
    ],

    // Categoria: Média Final
    media_final: [
        {
            titulo: "Calculadora Financeira HP12C",
            etiqueta: "🧮 Avançada",
            descricao: "Não apenas para finanças, mas excelente para cálculos rápidos de médias ponderadas.",
            link: "https://amzn.to/3MhboZK",
            imagem: "../imgs/hp12c001.jpg"
        },
        {
            titulo: "Calculadora Financeira HP12C",
            etiqueta: "🧮 Avançada",
            descricao: "Não apenas para finanças, mas excelente para cálculos rápidos de médias ponderadas.",
            link: "https://mercadolivre.com/sec/2uZH9ix",
            imagem: "../imgs/hp12c002.webp"
        },
        {
            titulo: "Caderno Universitário 10 Matérias",
            etiqueta: "📓 Anotações",
            descricao: "Separe suas notas por matéria para calcular a média final com facilidade no fim do semestre.",
            link: "https://amzn.to/3MTWQzj",
            imagem: "../imgs/caderno_10_materias001.jpg"
        },
        {
            titulo: "Caderno Universitário 10 Matérias",
            etiqueta: "📓 Anotações",
            descricao: "Separe suas notas por matéria para calcular a média final com facilidade no fim do semestre.",
            link: "https://mercadolivre.com/sec/2yBCTqM",
            imagem: "../imgs/caderno_10_materias002.webp"
        }
    ],

    // Categoria: Medidas Culinárias
    medidas_culinarias: [
        {
            titulo: "Conjunto de Medidores (Colheres e Copos)",
            etiqueta: "🥣 Precisão",
            descricao: "O kit indispensável: Xícara, colher de sopa, chá e café. Nunca erre uma receita.",
            link: "https://amzn.to/4rqAEMd",
            imagem: "../imgs/kit_medidores001.jpg"
        },
        {
            titulo: "Conjunto de Medidores (Colheres e Copos)",
            etiqueta: "🥣 Precisão",
            descricao: "O kit indispensável: Xícara, colher de sopa, chá e café. Nunca erre uma receita.",
            link: "https://mercadolivre.com/sec/2uWcZ2D",
            imagem: "../imgs/kit_medidores002.webp"
        },
        {
            titulo: "Jarra Plástica com Escala",
            etiqueta: "🥗 Volume",
            descricao: "Para medir grandes quantidades de líquidos ou misturas em litros e mililitros.",
            link: "https://amzn.to/4c4lpno",
            imagem: "../imgs/bacia_escala001.jpg"
        },
        {
            titulo: "Jarra Plástica com Escala",
            etiqueta: "🥗 Volume",
            descricao: "Para medir grandes quantidades de líquidos ou misturas em litros e mililitros.",
            link: "https://mercadolivre.com/sec/2rLtxN5",
            imagem: "../imgs/bacia_escala002.webp"
        },
        {
            titulo: "Balança de Cozinha de Precisão",
            etiqueta: "⚖️ Gramas",
            descricao: "A forma mais precisa de cozinhar, especialmente para confeitaria e dietas.",
            link: "https://amzn.to/4rA8E8u",
            imagem: "/imgs/balanca_cozinha002.jpg"
        },
        {
            titulo: "Balança de Cozinha de Precisão",
            etiqueta: "⚖️ Gramas",
            descricao: "A forma mais precisa de cozinhar, especialmente para confeitaria e dietas.",
            link: "https://mercadolivre.com/sec/2Xa4389",
            imagem: "/imgs/balanca_cozinha003.webp"
        }
    ],

    // Categoria: MMC e MDC
    mmc_mdc: [
        {
            titulo: "Calculadora Científica FX82MS",
            etiqueta: "🧮 Escolar",
            descricao: "Modelo clássico e confiável que ajuda a verificar cálculos de MDC e MMC rapidamente.",
            link: "https://amzn.to/3MTgA66",
            imagem: "../imgs/calculadora_engenharia001.jpg"
        },
        {
            titulo: "Calculadora Científica FX82MS",
            etiqueta: "🧮 Escolar",
            descricao: "Modelo clássico e confiável que ajuda a verificar cálculos de MDC e MMC rapidamente.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_engenharia002.webp"
        },
        {
            titulo: "Tabuada de Multiplicar Plastificada",
            etiqueta: "🧠 Memória",
            descricao: "Excelente para consultas rápidas, o Resumão explica cada uma das quatro operações. Ótimo para ajudar as crianças a memorizar as tabuadas antes das provas.",
            link: "https://amzn.to/4rt0EH1",
            imagem: "../imgs/tabuada_plastificada001.jpg"
        },
        {
            titulo: "Tabuada de Multiplicar Plastificada",
            etiqueta: "🧠 Memória",
            descricao: "Ajude as crianças a visualizar os múltiplos para entender o MMC.",
            link: "https://mercadolivre.com/sec/29wF2X3",
            imagem: "../imgs/tabuada_plastificada002.webp"
        },
        {
            titulo: "Kit Blocos Lógicos Matemáticos",
            etiqueta: "🔢 Educativo",
            descricao: "Ensina divisibilidade e frações de forma visual e prática.",
            link: "https://amzn.to/3Oshbfy",
            imagem: "../imgs/blocos_logicos001.jpg"
        },
        {
            titulo: "Kit Blocos Lógicos Matemáticos",
            etiqueta: "🔢 Educativo",
            descricao: "Ensina divisibilidade e frações de forma visual e prática.",
            link: "https://mercadolivre.com/sec/2d3K5UL",
            imagem: "../imgs/blocos_logicos002.webp"
        }
    ],

    // Categoria: Pizza
    pizza: [
        {
            titulo: "Cortador de Pizza Roda Inox",
            etiqueta: "🍕 Fatias",
            descricao: "Corte fatias perfeitas sem arrastar o queijo ou quebrar a massa.",
            link: "https://amzn.to/4tQln9k",
            imagem: "../imgs/cortador_pizza_roda001.jpg"
        },
        {
            titulo: "Cortador de Pizza Roda Inox",
            etiqueta: "🍕 Fatias",
            descricao: "Corte fatias perfeitas sem arrastar o queijo ou quebrar a massa.",
            link: "https://mercadolivre.com/sec/2uAFdSw",
            imagem: "../imgs/cortador_pizza_roda002.webp"
        },
        {
            titulo: "Cortador de Pizza Roda Inox",
            etiqueta: "🍕 Fatias",
            descricao: "Corte fatias perfeitas sem arrastar o queijo ou quebrar a massa.",
            link: "https://mercadolivre.com/sec/11GREujw",
            imagem: "../imgs/cortador_pizza_roda003.webp"
        },
        {
            titulo: "Pedra para Pizza Forno",
            etiqueta: "🔥 Crocância",
            descricao: "Deixe a pizza igual da pizzaria com massa crocante e bem assada.",
            link: "https://amzn.to/4cCok6Y",
            imagem: "../imgs/pedra_pizza001.jpg"
        },
        {
            titulo: "Pedra para Pizza Forno",
            etiqueta: "🔥 Crocância",
            descricao: "Deixe a pizza igual da pizzaria com massa crocante e bem assada.",
            link: "https://mercadolivre.com/sec/2pqMw65",
            imagem: "../imgs/pedra_pizza002.webp"
        },
        {
            titulo: "Pá de Pizza com Cabo Longo",
            etiqueta: "🥖 Forno",
            descricao: "Manuseie a pizza com segurança dentro do forno a lenha ou elétrico.",
            link: "https://mercadolivre.com/sec/1xkcuNa",
            imagem: "../imgs/pa_pizza001.webp"
        },
        {
            titulo: "Pá de Pizza com Cabo Longo",
            etiqueta: "🥖 Forno",
            descricao: "Manuseie a pizza com segurança dentro do forno a lenha ou elétrico.",
            link: "https://amzn.to/4kL5Va3",
            imagem: "../imgs/pa_pizza002.jpg"
        }
    ],

    // Categoria: Pneus
    pneus: [
        {
            titulo: "Manômetro para Pneus Digital",
            etiqueta: "🚗 Pressão",
            descricao: "Calibre seus pneus na medida certa para economizar combustível e garantir segurança.",
            link: "https://amzn.to/3O3EfBc",
            imagem: "../imgs/manometro_pneus001.jpg"
        },
        {
            titulo: "Manômetro para Pneus Digital",
            etiqueta: "🚗 Pressão",
            descricao: "Calibre seus pneus na medida certa para economizar combustível e garantir segurança.",
            link: "https://mercadolivre.com/sec/2znwtzg",
            imagem: "../imgs/manometro_pneus002.webp"
        },
        {
            titulo: "Compressor Portátil 12V",
            etiqueta: "🔧 Emergência",
            descricao: "Encha o pneu a qualquer hora, no asfalto ou na estrada, usando o acendedor do carro.",
            link: "https://amzn.to/4tLQDG8",
            imagem: "../imgs/compressor_portatil001.jpg"
        },
        {
            titulo: "Compressor Portátil 12V",
            etiqueta: "🔧 Emergência",
            descricao: "Encha o pneu a qualquer hora, no asfalto ou na estrada, usando o acendedor do carro.",
            link: "https://mercadolivre.com/sec/2QLqvjr",
            imagem: "../imgs/compressor_portatil002.webp"
        },
        {
            titulo: "Compressor Portátil 12V",
            etiqueta: "🔧 Emergência",
            descricao: "Encha o pneu a qualquer hora, no asfalto ou na estrada, usando o acendedor do carro.",
            link: "https://amzn.to/4s5BhuJ",
            imagem: "../imgs/compressor_portatil003.jpg"
        },
        {
            titulo: "Kit Vedação",
            etiqueta: "🛞 Manutenção",
            descricao: "Kit Reparo Remendo Pneu Sem Câmara Carro Moto.",
            link: "https://amzn.to/4u2R5Aj",
            imagem: "../imgs/kit_valvulas001.jpg"
        }
    ],

    // Categoria: Porcentagem Reversa
    porcentagem_reversa: [
        {
            titulo: "Calculadora de Porcentagem",
            etiqueta: "🧮 Foco",
            descricao: "Teclas dedicadas para cálculos de margem, markup e desconto reverso.",
            link: "https://amzn.to/3MTgA66",
            imagem: "../imgs/calculadora_engenharia001.jpg"
        },
        {
            titulo: "Calculadora de Porcentagem",
            etiqueta: "🧮 Foco",
            descricao: "Teclas dedicadas para cálculos de margem, markup e desconto reverso.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_engenharia002.webp"
        },
        {
            titulo: "Livro: Matemática Financeira Descomplicada",
            etiqueta: "📚 Negócios",
            descricao: "Aprenda a calcular margens de lucro e juros para não perder dinheiro.",
            link: "https://amzn.to/4aEfBP5",
            imagem: "../imgs/livro_mat_fin001.jpg"
        },
        {
            titulo: "Livro: Matemática Financeira Descomplicada",
            etiqueta: "📚 Negócios",
            descricao: "Aprenda a calcular margens de lucro e juros para não perder dinheiro.",
            link: "https://amzn.to/4asppgp",
            imagem: "../imgs/livro_mat_fin001.jpg"
        },
        {
            titulo: "Livro: Matemática Financeira Descomplicada",
            etiqueta: "📚 Negócios",
            descricao: "Aprenda a calcular margens de lucro e juros para não perder dinheiro.",
            link: "https://amzn.to/4aKXuHq",
            imagem: "../imgs/livro_mat_fin002.jpg"
        }
    ],

    // Categoria: Regra de Três
    regra_tres: [
        {
            titulo: "Calculadora Científica Básica",
            etiqueta: "🧮 Auxílio",
            descricao: "Facilita as divisões e multiplicações da regra de três composta ou simples.",
            link: "https://amzn.to/3MzKzjm",
            imagem: "../imgs/calculadora_cientifica_escolar001.jpg"
        },
        {
            titulo: "Calculadora Científica Básica",
            etiqueta: "🧮 Auxílio",
            descricao: "Facilita as divisões e multiplicações da regra de três composta ou simples.",
            link: "https://mercadolivre.com/sec/1p9i6Y3",
            imagem: "../imgs/calculadora_cientifica_escolar002.webp"
        },
        {
            titulo: "Livro: Matemática para o Ensino Médio",
            etiqueta: "📚 Reforço",
            descricao: "Capítulo completo sobre grandezas proporcionais e regra de três.",
            link: "https://amzn.to/4ruMV2i",
            imagem: "../imgs/livro_medio_mat001.jpg"
        },
        {
            titulo: "Livro: Matemática para o Ensino Médio",
            etiqueta: "📚 Reforço",
            descricao: "Capítulo completo sobre grandezas proporcionais e regra de três.",
            link: "https://amzn.to/4s5Djel",
            imagem: "../imgs/livro_medio_mat002.jpg"
        }

    ],

    // Categoria: Velocidade Média
    velocidade_media: [
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS",
            descricao: "Use o GPS para medir o tempo exato e calcular sua velocidade média real em viagens.",
            link: "https://amzn.to/40jqKQB",
            imagem: "../imgs/suporte_celular_carro006.jpg"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS",
            descricao: "Use o GPS para medir o tempo exato e calcular sua velocidade média real em viagens.",
            link: "https://amzn.to/40lomJ2",
            imagem: "../imgs/suporte_celular_carro007.jpg"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS",
            descricao: "Use o GPS para medir o tempo exato e calcular sua velocidade média real em viagens.",
            link: "https://mercadolivre.com/sec/26dGe63",
            imagem: "../imgs/suporte_celular_carro008.webp"
        },
        {
            titulo: "Suporte de Celular para Carro",
            etiqueta: "📱 GPS",
            descricao: "Use o GPS para medir o tempo exato e calcular sua velocidade média real em viagens.",
            link: "https://mercadolivre.com/sec/2DyjdRG",
            imagem: "../imgs/suporte_celular_carro009.webp"
        },
        {
            titulo: "Cronômetro Digital de Bolso",
            etiqueta: "⏱️ Tempo",
            descricao: "Marque o tempo de chegada e partida com precisão manual.",
            link: "https://amzn.to/4kK3hBF",
            imagem: "../imgs/cronometro_bolso001.jpg"
        },
        {
            titulo: "Cronômetro Digital de Bolso",
            etiqueta: "⏱️ Tempo",
            descricao: "Marque o tempo de chegada e partida com precisão manual.",
            link: "https://mercadolivre.com/sec/26MEVwA",
            imagem: "../imgs/cronometro_bolso002.webp"
        },
        {
            titulo: "Radar Detector (Aviso)",
            etiqueta: "🚨 Segurança",
            descricao: "Mantenha-se dentro da velocidade permitida evitando multas por excesso.",
            link: "https://mercadolivre.com/sec/26NmP5Y",
            imagem: "../imgs/radar_aviso001.webp"
        }
    ],

    // Fallback para categorias sem anúncios específicos - usam 'geral'
    cdb: [
        {
            titulo: "Calculadora Financeira",
            etiqueta: "💰 Renda Fixa",
            descricao: "Calcule investimentos em CDB, LCI e LCA com precisão. Compare retornos.",
            link: "https://www.amazon.com.br/HP12C-Calculadora-Financeira-Profissional-Portugu%C3%AAs/dp/B00KHBQTZY?linkCode=ll2&tag=portaldascont-20&linkId=1a2b3c4d5e6f7g8h&ref_=as_li_ss_tl",
            imagem: "../imgs/hp12c001.jpg"
        },
        {
            titulo: "Livro: Investimentos Inteligentes",
            etiqueta: "📚 Educação",
            descricao: "Guia completo sobre CDB, LCI, LCA e outras aplicações de renda fixa.",
            link: "https://www.amazon.com.br/Investidor-Inteligente-Benjamin-Graham/dp/8595080313?linkCode=ll2&tag=portaldascont-20&linkId=2b3c4d5e6f7g8h9i&ref_=as_li_ss_tl",
            imagem: "../imgs/investidor_inteligente.jpg"
        }
    ],
    "lca-cdb": [
        {
            titulo: "Calculadora Financeira Premium",
            etiqueta: "🧮 Investimentos",
            descricao: "Comparar LCA vs CDB nunca foi tão fácil. Simule diferentes cenários.",
            link: "https://www.amazon.com.br/HP12C-Calculadora-Financeira/dp/B00KHBQTZY?linkCode=ll2&tag=portaldascont-20&linkId=3c4d5e6f7g8h9i0j&ref_=as_li_ss_tl",
            imagem: "../imgs/hp12c002.webp"
        },
        {
            titulo: "Pai Rico, Pai Pobre",
            etiqueta: "📖 Clássico",
            descricao: "Educação financeira essencial. Entenda como investir e poupar melhor.",
            link: "https://www.amazon.com.br/Pai-Rico-Pobre-Robert-Kiyosaki/dp/857232406X?linkCode=ll2&tag=portaldascont-20&linkId=4d5e6f7g8h9i0j1k&ref_=as_li_ss_tl",
            imagem: "../imgs/pai_rico_pobre.jpg"
        }
    ],
    "lci-cdb": [
        {
            titulo: "Calculadora HP 12C",
            etiqueta: "🧮 Premium",
            descricao: "A calculadora financeira mais confiável. Perfeita para LCI, CDB e Tesouro.",
            link: "https://www.amazon.com.br/HP-Calculadora-Financeira-Prova-Agua/dp/B00KHBQTZY?linkCode=ll2&tag=portaldascont-20&linkId=5e6f7g8h9i0j1k2l&ref_=as_li_ss_tl",
            imagem: "../imgs/hp12c001.jpg"
        }
    ],
    investimentos: [
        {
            titulo: "Livro: Investidor Inteligente",
            etiqueta: "📚 Referência",
            descricao: "Benjamin Graham mostra como escolher bons investimentos e evitar armadilhas.",
            link: "https://www.amazon.com.br/Investidor-Inteligente-Benjamin-Graham/dp/8595080313?linkCode=ll2&tag=portaldascont-20&linkId=6f7g8h9i0j1k2l3m&ref_=as_li_ss_tl",
            imagem: "../imgs/investidor_inteligente.jpg"
        }
    ],
    "imposto-renda": [
        {
            titulo: "Guia Completo IR para Investimentos",
            etiqueta: "📋 Fiscal",
            descricao: "Saiba como declarar seus investimentos corretamente e evite problemas com Receita.",
            link: "https://www.amazon.com.br/Guia-Completo-Imposto-Renda-Investimentos/dp/B09Y2W4K0Z?linkCode=ll2&tag=portaldascont-20&linkId=7g8h9i0j1k2l3m4n&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_clt.jpg"
        }
    ],
    inflacao: [
        {
            titulo: "Tesouro Direto: Guia Completo",
            etiqueta: "🇧🇷 Proteção",
            descricao: "Invista em Tesouro IPCA+ para proteger seu dinheiro da inflação.",
            link: "https://www.amazon.com.br/Tesouro-Direto-Simplificado-Portuguese-Iniciantes/dp/B0BVZZ4K2Q?linkCode=ll2&tag=portaldascont-20&linkId=8h9i0j1k2l3m4n5o&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_aposentadoria.jpg"
        }
    ],
    "ir-investimentos": [
        {
            titulo: "Planejamento Fiscal para Investidores",
            etiqueta: "💼 Profissional",
            descricao: "Minimize impostos nos seus investimentos. Estratégias legais para otimizar retorno.",
            link: "https://www.amazon.com.br/Planejamento-Tributario-Pessoas-Fisicas-Profissionais/dp/B0C1KQMX5D?linkCode=ll2&tag=portaldascont-20&linkId=9i0j1k2l3m4n5o6p&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_financa_leigo.jpg"
        }
    ],
    "poupanca-vs-investimentos": [
        {
            titulo: "Por Que Poupança Não Rende?",
            etiqueta: "📊 Análise",
            descricao: "Entenda porque poupança perde para inflação e qual é a melhor alternativa.",
            link: "https://www.amazon.com.br/Poupanca-N%C3%A3o-Rende-Voc%C3%AA-Deveria/dp/B0BZ8Q3R4K?linkCode=ll2&tag=portaldascont-20&linkId=0j1k2l3m4n5o6p7q&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_mat_fin001.jpg"
        }
    ],
    "price-sac": [
        {
            titulo: "Financiamento Imobiliário: Price vs SAC",
            etiqueta: "🏠 Imóvel",
            descricao: "Compare os dois sistemas. Descubra qual economiza mais na hora de financiar.",
            link: "https://www.amazon.com.br/Financiamento-Imobiliario-Sistema-Price-Brasileiros/dp/B0BZ9KL3R2?linkCode=ll2&tag=portaldascont-20&linkId=1k2l3m4n5o6p7q8r&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_mat_fin002.jpg"
        }
    ],
    "tesouro-direto": [
        {
            titulo: "Tesouro Direto: Guia Prático",
            etiqueta: "🇧🇷 Brasil",
            descricao: "Invista em títulos do governo com segurança e rentabilidade garantida.",
            link: "https://www.amazon.com.br/Tesouro-Direto-Guia-Completo-Iniciantes/dp/B0C2KPQR7T?linkCode=ll2&tag=portaldascont-20&linkId=2l3m4n5o6p7q8r9s&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_aposentadoria.jpg"
        }
    ],
    dividendos: [
        {
            titulo: "Ações e Dividendos para Iniciantes",
            etiqueta: "📈 Renda",
            descricao: "Crie uma carteira que gera renda passiva. Selecione as melhores ações.",
            link: "https://www.amazon.com.br/A%C3%A7%C3%B5es-Dividendos-Iniciantes-Renda-Passiva/dp/B0BVZ2K3R4?linkCode=ll2&tag=portaldascont-20&linkId=3m4n5o6p7q8r9s0t&ref_=as_li_ss_tl",
            imagem: "../imgs/pai_rico_pobre.jpg"
        }
    ],
    equacao_primeiro_grau: [
        {
            titulo: "Matemática Básica Simplificada",
            etiqueta: "📙 Educação",
            descricao: "Domine equações do 1º grau com exemplos práticos e exercícios passo a passo.",
            link: "https://www.amazon.com.br/Matematica-Basica-Simplificada-Equacoes-Primeiro/dp/B0BR2KQ3T5?linkCode=ll2&tag=portaldascont-20&linkId=4n5o6p7q8r9s0t1u&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_equacoes001.jpg"
        }
    ],
    forca: [
        {
            titulo: "Dinamômetro de Mão Digital",
            etiqueta: "💪 Fitness",
            descricao: "Meça sua força e acompanhe progresso em treinos com precisão.",
            link: "https://mercadolivre.com/sec/1HvKc9X",
            imagem: "../imgs/dinamometro001.webp"
        },
        {
            titulo: "Kit Halteres Ajustáveis",
            etiqueta: "💪 Musculação",
            descricao: "Treinos de força em casa. Ajustáveis e compactos.",
            link: "https://www.amazon.com.br/Halteres-Ajustaveis-Fitness-Musculacao-Treino/dp/B0CZ5KL2M8?linkCode=ll2&tag=portaldascont-20&linkId=5o6p7q8r9s0t1u2v&ref_=as_li_ss_tl",
            imagem: "../imgs/halteres001.jpg"
        }
    ],
    gasto_calorico: [
        {
            titulo: "Smartwatch com Monitor de Calorias",
            etiqueta: "⌚ Fitness",
            descricao: "Acompanhe seu gasto calórico em tempo real durante exercícios.",
            link: "https://www.amazon.com.br/Smartwatch-Monitor-Cardiaco-Oxigenio-Sangue/dp/B0C1Z3K4S8?linkCode=ll2&tag=portaldascont-20&linkId=6p7q8r9s0t1u2v3w&ref_=as_li_ss_tl",
            imagem: "../imgs/smartwatch001.jpg"
        }
    ],
    energy: [
        {
            titulo: "Medidor de Consumo Elétrico",
            etiqueta: "⚡ Economia",
            descricao: "Veja o consumo real dos seus aparelhos. Economize na conta de luz.",
            link: "https://www.amazon.com.br/Medidor-Consumo-Energia-Eletrica-Digital/dp/B0BZQK3R5T?linkCode=ll2&tag=portaldascont-20&linkId=7q8r9s0t1u2v3w4x&ref_=as_li_ss_tl",
            imagem: "../imgs/medidor_energia001.jpg"
        }
    ],
    energia: [
        {
            titulo: "Medidor de Energia Eletroeletrônico",
            etiqueta: "⚡ Economia",
            descricao: "Monitore consumo e economia de eletricidade do seu imóvel com precisão.",
            link: "https://www.amazon.com.br/Medidor-Energia-Eletroeletronico-Economia-Residencial/dp/B0BZ1K5R3Q?linkCode=ll2&tag=portaldascont-20&linkId=8r9s0t1u2v3w4x5y&ref_=as_li_ss_tl",
            imagem: "../imgs/medidor_energia002.webp"
        }
    ],
    kmh_ms: [
        {
            titulo: "Scanner OBD2 Automotivo",
            etiqueta: "🚗 Diagnóstico",
            descricao: "Escaneie erros do carro e monitore velocidade real com precisão GPS.",
            link: "https://www.amazon.com.br/Scanner-OBD2-Automotivo-Diagnostico-Bluetooth/dp/B0C2Q4R6T9?linkCode=ll2&tag=portaldascont-20&linkId=9s0t1u2v3w4x5y6z&ref_=as_li_ss_tl",
            imagem: "../imgs/scanner_obd2001.webp"
        }
    ],
    coeficiente_rendimento: [
        {
            titulo: "Aplicativo de Gestão Acadêmica",
            etiqueta: "🎓 Notas",
            descricao: "Monitore suas notas, calcule CR e GPA com facilidade.",
            link: "https://www.amazon.com.br/Aplicativo-Gestao-Academica-Calculo-Notas/dp/B0C1M2K3R7?linkCode=ll2&tag=portaldascont-20&linkId=0t1u2v3w4x5y6z7a&ref_=as_li_ss_tl",
            imagem: "../imgs/calculadora_cientifica001.jpg"
        }
    ],
    conversor_unidades: [
        {
            titulo: "Tabela de Conversão de Bolso",
            etiqueta: "📐 Utilitário",
            descricao: "Conversão de unidades na palma da mão. Metros, litros, kg, Celsius.",
            link: "https://www.amazon.com.br/Tabela-Conversao-Medidas-Bolso-Completa/dp/B0BZQM2S5K?linkCode=ll2&tag=portaldascont-20&linkId=1u2v3w4x5y6z7a8b&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_matematica001.jpg"
        }
    ],
    media_escolar: [
        {
            titulo: "Calculadora Científica para Alunos",
            etiqueta: "🧮 Escolar",
            descricao: "Calcule médias, notas finais e GPA com a calculadora certa.",
            link: "https://www.amazon.com.br/Calculadora-Cientifica-Escolar-Alunos-Engenheiros/dp/B0BVZ1K4T6?linkCode=ll2&tag=portaldascont-20&linkId=2v3w4x5y6z7a8b9c&ref_=as_li_ss_tl",
            imagem: "../imgs/calculadora_cientifica_escolar001.jpg"
        }
    ],
    media_final: [
        {
            titulo: "Registro Acadêmico Inteligente",
            etiqueta: "📔 Notas",
            descricao: "Organize suas notas e simule a média final antes do resultado.",
            link: "https://www.amazon.com.br/Caderno-Inteligente-Registro-Academico-Notas/dp/B0C2L3Q5T8?linkCode=ll2&tag=portaldascont-20&linkId=3w4x5y6z7a8b9c0d&ref_=as_li_ss_tl",
            imagem: "../imgs/caderno_10_materias001.jpg"
        }
    ],
    medidas_culinarias: [
        {
            titulo: "Balança de Cozinha Digital",
            etiqueta: "⚖️ Precisão",
            descricao: "Converta medidas com exatidão: xícaras em gramas, colheres em ml.",
            link: "https://www.amazon.com.br/Balanca-Cozinha-Digital-Precisao-Alimentos/dp/B0BZ3K2R4T?linkCode=ll2&tag=portaldascont-20&linkId=4x5y6z7a8b9c0d1e&ref_=as_li_ss_tl",
            imagem: "../imgs/balanca_cozinha002.jpg"
        }
    ],
    mmc_mdc: [
        {
            titulo: "Libro de Matemática: MMC e MDC",
            etiqueta: "📚 Educação",
            descricao: "Aprenda MMC e MDC com exemplos práticos e exercícios passo a passo.",
            link: "https://www.amazon.com.br/Matematica-Basica-MMC-MDC-Explicado/dp/B0C1N3S6U9?linkCode=ll2&tag=portaldascont-20&linkId=5y6z7a8b9c0d1e2f&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_mat_basica002.jpg"
        }
    ],
    decimo_terceiro: [
        {
            titulo: "Guia de Direitos Trabalhistas",
            etiqueta: "📋 Trabalho",
            descricao: "Entenda como calcular 13º, férias e todos os direitos de trabalhista.",
            link: "https://www.amazon.com.br/Guia-Direitos-Trabalhistas-Calculo-13_Salario/dp/B0C1P5T7V2?linkCode=ll2&tag=portaldascont-20&linkId=6z7a8b9c0d1e2f3g&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_clt.jpg"
        }
    ],
    hora_extra: [
        {
            titulo: "Planilha Automática de Hora Extra",
            etiqueta: "📊 RH",
            descricao: "Calcule horas extras automaticamente e receba o que é devido.",
            link: "https://www.amazon.com.br/Planilha-Controle-Hora-Extra-Automatica/dp/B0C2R1U3K5?linkCode=ll2&tag=portaldascont-20&linkId=7a8b9c0d1e2f3g4h&ref_=as_li_ss_tl",
            imagem: "../imgs/agenda_vendas002.webp"
        }
    ],
    porcentagem_reversa: [
        {
            titulo: "Calculadora de Margem e Desconto",
            etiqueta: "💹 Vendas",
            descricao: "Calcule descontos, acréscimos, margens de lucro com facilidade.",
            link: "https://www.amazon.com.br/Calculadora-Desconto-Margem-Lucro-Vendas/dp/B0C1T2V5W6?linkCode=ll2&tag=portaldascont-20&linkId=8b9c0d1e2f3g4h5i&ref_=as_li_ss_tl",
            imagem: "../imgs/calculadora_impressora001.jpg"
        }
    ],
    regra_tres: [
        {
            titulo: "Matemática Prática para Proporções",
            etiqueta: "📙 Educação",
            descricao: "Domine regra de três com exemplos do dia a dia. Passo a passo.",
            link: "https://www.amazon.com.br/Regra-Tres-Matematica-Proporcoes-Explicado/dp/B0BZ9M4R2S?linkCode=ll2&tag=portaldascont-20&linkId=9c0d1e2f3g4h5i6j&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_med_mat002.jpg"
        }
    ],
    tdee: [
        {
            titulo: "Rastreador de Nutrição e Calorias",
            etiqueta: "💪 Fitness",
            descricao: "Calcule seu TDEE e acompanhe nutrição para atingir suas metas.",
            link: "https://www.amazon.com.br/Rastreador-Nutricao-Calorias-Aplicativo-Fitness/dp/B0C3L1R4T7?linkCode=ll2&tag=portaldascont-20&linkId=0d1e2f3g4h5i6j7k&ref_=as_li_ss_tl",
            imagem: "../imgs/livro_habito001.jpg"
        }
    ],
    festas_variadas: [
        {
            titulo: "Planejador de Eventos Completo",
            etiqueta: "🎉 Evento",
            descricao: "Checklist total para sua festa. Comida, bebida, decoração, timing.",
            link: "https://www.amazon.com.br/Planejador-Eventos-Festa-Completo-Checklist/dp/B0C2N2U5K8?linkCode=ll2&tag=portaldascont-20&linkId=1e2f3g4h5i6j7k8l&ref_=as_li_ss_tl",
            imagem: "../imgs/agenda001.webp"
        }
    ],
    tinta: [
        {
            titulo: "Balde de Tinta Acrílica 18L Branco",
            etiqueta: "🎨 Reforma",
            descricao: "A base da sua reforma. Cobertura alta, secagem rápida e acabamento perfeito.",
            link: "https://www.amazon.com.br/Tinta-Acrila-Branco-18L-Coralar/dp/B08L71HHFR?linkCode=ll2&tag=portaldascont-20&linkId=2f3g4h5i6j7k8l9m&ref_=as_li_ss_tl",
            imagem: "../imgs/tinta001.jpg"
        },
        {
            titulo: "Kit Pincéis e Trinchas para Pintura",
            etiqueta: "🖌️ Ferramentas",
            descricao: "Pincéis profissionais para uma acabamento impecável na sua reforma.",
            link: "https://www.amazon.com.br/Kit-Pinceis-Trinchas-Pintura-Reforma/dp/B08M4PQXST?linkCode=ll2&tag=portaldascont-20&linkId=3g4h5i6j7k8l9m0n&ref_=as_li_ss_tl",
            imagem: "../imgs/kit_pintura001.jpg"
        },
        {
            titulo: "Verniz Acrílico para Madeira",
            etiqueta: "🪵 Madeira",
            descricao: "Protege portas, batentes e móveis. À base de água, inodoro e durável.",
            link: "https://www.amazon.com.br/Verniz-Acrilico-Madeira-Premium-Transparente/dp/B0FDYNBFSZ?linkCode=ll2&tag=portaldascont-20&linkId=4h5i6j7k8l9m0n1o&ref_=as_li_ss_tl",
            imagem: "../imgs/verniz001.jpg"
        }
    ]
};

// 2. A FUNÇÃO CORRIGIDA
// 2. A FUNÇÃO DE CARGA DE ANÚNCIOS COM RASTREAMENTO
function carregarAnuncio(categoria) {
    // Fallback: se categoria não existir, usa 'geral'
    if (!bancoDeAnuncios[categoria]) {
        categoria = 'geral';
    }
    
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
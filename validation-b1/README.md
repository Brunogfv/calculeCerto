# B1 — ambiente público mínimo de validação

Este diretório é um ambiente local isolado para a futura validação remota da captura HTML.
**Ele não é o site de produção nem a homologação privada.** Nenhuma operação remota é executada
por estes scripts.

## Estrutura

- `public/`: página mínima, consentimento, diagnóstico, `robots.txt` e headers.
- `netlify/edge-functions/`: cópia controlada da Edge Function e das bibliotecas compartilhadas.
- `netlify/functions/`: cópia controlada da Function de captura e helpers.
- `scripts/shared-files.mjs`: lista explícita dos 13 arquivos compartilhados.
- `scripts/sync-shared.mjs`: sincroniza as cópias com o código canônico do repositório.
- `scripts/verify-shared.mjs`: valida manifesto, hashes canônicos e cópias; o build falha em divergência.
- `scripts/build.mjs`: build independente para `dist/`, com checagem de segredos, configs estáticas e recursos externos.
- `tests/`: testes locais do B1 e do shared-manifest.

## Comandos locais

```bash
npm ci --ignore-scripts
# se o Chromium ainda não estiver instalado:
# npx playwright install chromium
npm run sync:shared
npm run build
npm test
npm run test:browser
npm run test:all
```

O deploy B1 usa `NPM_FLAGS=--omit=dev --ignore-scripts`; Playwright é apenas devDependency local.

`test:all` sincroniza, faz o build e executa os testes. Nenhum comando acessa serviços remotos.
O build verifica o `shared-manifest.json` antes de publicar e falha se o canônico ou a cópia B1
estiverem divergentes; a sincronização é sempre uma etapa explícita (`sync:shared`). A verificação
lê o canônico no diretório pai, então o build exige o checkout completo do repositório e o canônico
corrigido no mesmo commit.
`test:browser` usa Playwright (devDependency) instalado localmente; o site B1 não o usa em runtime.
O lockfile `package-lock.json` fixa as dependências de build/teste.

## Antes de um deploy futuro

1. Confirmar que `shared-manifest.json` está atualizado (`npm run sync:shared`).
2. Confirmar que o build local passou (`npm run test:all`).
3. Confirmar que o site público de validação tem ID, nome, domínio e visibilidade aprovados.
4. Configurar variáveis próprias do B1, nunca copiadas de produção/homologação.
5. Manter as flags de captura `false` até a janela autorizada.
6. Confirmar o saldo e o teto de créditos antes de qualquer deploy.

O site B1 é público por definição durante a janela de teste; `robots.txt` e `noindex` não são
controle de acesso. O conteúdo deve permanecer sintético e sem dados reais.

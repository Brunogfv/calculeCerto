# Fase 5F.31 - Correcao controlada de codificacao e regressao integral

Status: **correcoes concluidas e regressao integral aprovada localmente; indice Git vazio e nenhuma operacao remota executada**.
Data/hora: **2026-11-19T15:11:34-03:00** (inicio da fase).
Branch: `feat/portal-analytics`.
HEAD: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.
Remoto: `https://github.com/Brunogfv/calculeCerto.git`.

**Classificacao: 1 - Aprovado (escopo local).** As correcoes de codificacao foram limitadas,
justificadas e validadas. Contrato, build B1, isolamento, gate e regressao passaram. O risco TOCTOU
continua nao aceito e nenhuma operacao Git remota foi feita.

---

## 1. Estado inicial do Git

| Verificacao | Resultado |
|---|---|
| Branch | `feat/portal-analytics` |
| Upstream | ausente |
| HEAD | `8d455fc4f01f7944f2a015681dd5c81c0704d786` |
| Indice Git | vazio |
| Arquivos staged | 0 |
| Remote | `https://github.com/Brunogfv/calculeCerto.git` |
| `git fetch` anterior | apenas refs remotas; nenhum worktree alterado |
| Candidatos | 69 caminhos |

Foi criado um backup local dos 69 arquivos em
`C:\Users\Joanita\AppData\Local\Temp\opencode\fase5f31-initial`, com hashes, status Git e diff dos
arquivos rastreados. Nenhum arquivo foi apagado ou descartado.

---

## 2. Os 31 arquivos analisados

Foram analisados individualmente:

1. `validation-b1/README.md`
2. `validation-b1/package.json`
3. `validation-b1/netlify/functions/_lib/capture-validation.mjs`
4. `validation-b1/netlify/functions/_lib/cleanup-retention.mjs`
5. `validation-b1/netlify/functions/_lib/db.mjs`
6. `validation-b1/public/b1-consent.js`
7. `validation-b1/public/index.html`
8. `validation-b1/public/validacao-encerrada.html`
9. `validation-b1/scripts/build.mjs`
10. `validation-b1/scripts/deploy-b1.mjs`
11. `validation-b1/scripts/verify-shared.mjs`
12. `validation-b1/tests/artifact.spec.mjs`
13. `validation-b1/tests/b1.spec.mjs`
14. `validation-b1/tests/browser-consent.spec.mjs`
15. `validation-b1/tests/gate.spec.mjs`
16. `validation-b1/tests/shared-manifest.spec.mjs`
17. `netlify/functions/_lib/capture-validation.mjs`
18. `netlify/functions/_lib/cleanup-retention.mjs`
19. `netlify/functions/_lib/db.mjs`
20. `.github/workflows/ci.yml`
21. `package.json`
22. `scripts/apply-analytics.js`
23. `scripts/apply-accessibility.js`
24. `scripts/build-assets.js`
25. `scripts/generate-html-redirects.js`
26. `scripts/check-b1-isolation.mjs`
27. `scripts/test-db.mjs`
28. `scripts/migrate.mjs`
29. `tests/analytics/collect.integration.spec.mjs`
30. `tests/analytics/capture.integration.spec.mjs`
31. `tests/analytics/capture-hardening.spec.mjs`

A verificacao inicial por PowerShell teve falsos positivos porque comparava caracteres acentuados
legitimos com a sequencia de mojibake. A classificacao final usou leitura UTF-8 estrita e inspecao
de code points. Dos 31, **13 exigiram correcao** e **18 eram UTF-8 valido ou texto legitimo**.

---

## 3. Diagnostico individual

### 3.1 Corrigidos - 13 arquivos

| Arquivo | Diagnostico | Correcao |
|---|---|---|
| `validation-b1/package.json` | BOM UTF-8 desnecessario | BOM removido |
| alidation-b1/netlify/functions/_lib/cleanup-retention.mjs | BOM + mojibake U+00C3 U+00A7/U+00C3 U+00A3 | BOM removido; sequencias recuperadas |
| `validation-b1/scripts/deploy-b1.mjs` | BOM + mojibake | BOM removido; sequencias recuperadas |
| `validation-b1/tests/artifact.spec.mjs` | BOM UTF-8 | BOM removido |
| `validation-b1/tests/gate.spec.mjs` | BOM UTF-8 | BOM removido |
| `netlify/functions/_lib/cleanup-retention.mjs` | BOM + mojibake | BOM removido; sequencias recuperadas |
| `package.json` | BOM UTF-8 | BOM removido |
| `scripts/apply-analytics.js` | BOM + mojibake | BOM removido; sequencias recuperadas |
| `scripts/apply-accessibility.js` | BOM + mojibake | BOM removido; texto/emoji restaurados |
| `scripts/build-assets.js` | BOM + mojibake | BOM removido; textos restaurados |
| `scripts/generate-html-redirects.js` | BOM UTF-8 | BOM removido |
| `scripts/check-b1-isolation.mjs` | BOM UTF-8 | BOM removido |
| `tests/analytics/capture.integration.spec.mjs` | BOM + mojibake | BOM removido; textos restaurados |

As substituicoes de mojibake foram pontuais, limitadas a sequencias recuperadas com seguranca:
As substituicoes de mojibake foram pontuais, limitadas a sequencias recuperadas com seguranca: U+00C3 U+00A1, U+00C3 U+00A2, U+00C3 U+00A3, U+00C3 U+00A9, U+00C3 U+00AA, U+00C3 U+00AD, U+00C3 U+00B3, U+00C3 U+00B4, U+00C3 U+00B5, U+00C3 U+00BA, U+00C3 U+00A7, U+00F0 U+0178 U+201C U+2039, U+00E2 U+2013 U+00BE, U+00E2 U+02DC U+00B0.
Nao houve conversao global de CP1252 nem alteracao de caracteres acentuados legitimos.

### 3.2 Nao modificados - 18 arquivos

| Arquivo | Classificacao |
|---|---|
| `validation-b1/README.md` | UTF-8 valido; acentos legitimos |
| `validation-b1/netlify/functions/_lib/capture-validation.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/netlify/functions/_lib/db.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/public/b1-consent.js` | UTF-8 valido; acentos legitimos |
| `validation-b1/public/index.html` | UTF-8 valido; acentos legitimos |
| `validation-b1/public/validacao-encerrada.html` | UTF-8 valido; acentos legitimos |
| `validation-b1/scripts/build.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/scripts/verify-shared.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/tests/b1.spec.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/tests/browser-consent.spec.mjs` | UTF-8 valido; acentos legitimos |
| `validation-b1/tests/shared-manifest.spec.mjs` | UTF-8 valido; acentos legitimos |
| `netlify/functions/_lib/capture-validation.mjs` | UTF-8 valido; acentos legitimos |
| `netlify/functions/_lib/db.mjs` | UTF-8 valido; acentos legitimos |
| `.github/workflows/ci.yml` | UTF-8 valido; alteracoes sao da fase 5F.29 |
| `scripts/test-db.mjs` | UTF-8 valido; acentos legitimos |
| `scripts/migrate.mjs` | UTF-8 valido; alteracao semantica e apenas o exemplo de banco |
| `tests/analytics/collect.integration.spec.mjs` | UTF-8 valido; alteracoes sao da fase 5F.29 |
| `tests/analytics/capture-hardening.spec.mjs` | UTF-8 valido; alteracao e o keepalive da fase 5F.29 |

Nenhum arquivo inconclusivo foi alterado.

---

## 4. Correcoes e justificativa

- BOM foi removido dos 13 arquivos que o possuiam.
- Mojibake foi recuperado apenas nas sequencias cuja origem foi confirmada.
- `scripts/apply-accessibility.js` voltou a ter apenas a inclusao de `validation-b1` no regex; os
  textos e emojis corretos foram restaurados.
- Nenhuma logica funcional foi alterada.
- Nenhum final de linha foi convertido em massa.
- Nenhum arquivo fora dos 69 candidatos teve alteracao manual.

O diff rastreado ficou limitado a:

- `ci.yml`: mudancas funcionais da fase 5F.29;
- `package.json`: scripts das fases 5F.26/5F.29;
- walkers: somente `validation-b1` nas exclusoes;
- `migrate.mjs`: somente o exemplo `validation_b1_test`;
- `collect.integration.spec.mjs`: somente a preparacao de roles/validacao da fase 5F.29.

---

## 5. Contrato e hashes B1

O contrato foi atualizado apenas no hash de conteudo que mudou legitimamente:

| Chave | Hash anterior | Hash novo |
|---|---|---|
| `functions/_lib/cleanup-retention.mjs` | `95ea162f8472b4b5f054bc2bcde94a0f4cfc874203314757719ddb70377f4518` | `a20d9d140929f40687bb2b2abe752e4eaf868b7bcb6056399dac9c3ee9c5f67a` |

Os demais hashes de static, functions e edge_functions permaneceram. `config_sha256` permaneceu
`7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586`.
`build-manifest.json` permaneceu com o hash anterior, pois o build final gerou o mesmo manifesto.

O contrato continua com a lista fechada de arquivos, `redirects: 0`, version 1, sem `collect`, e
sem aceitar automaticamente qualquer novo artefato.

`shared-manifest.json` foi regenerado pelo sync; ele agora reflete os 16 arquivos canonicos
corrigidos.

---

## 6. Hashes dos arquivos alterados

| Arquivo | SHA-256 anterior | SHA-256 novo |
|---|---|---|
| `validation-b1/package.json` | `9824E6A4372D314A0D85B071F510790CBE981FB6EFE4BFD991A23AD56D247E50` | `F0E7A15D5E622F18D81E7B720289B5843C3E240FE473921B00B0898E41D32406` |
| `validation-b1/cleanup-retention.mjs` | `95EA162F8472B4B5F054BC2BCDE94A0F4CFC874203314757719DDB70377F4518` | `A20D9D140929F40687BB2B2ABE752E4EAF868B7BCB6056399DAC9C3EE9C5F67A` |
| `validation-b1/deploy-b1.mjs` | `9197B43883D01DD550CCF01E4E65597A5E2B94FF1FB5E8D9A0A06D00C34CA6B7` | `F4DB8B081C943FE6578E2C4A9D7EDD82F529455115A68119869D0BEF8BBC6331` |
| `validation-b1/tests/artifact.spec.mjs` | `EE851634A080C53EE90B345A2C4616B7863C24E8188AAB2333E1DDAA921126AE` | `730536891FCB923DAB690F3458896384080C2723A6B65DA36451A50904F007A6` |
| `validation-b1/tests/gate.spec.mjs` | `8E14996BF5DB54FB48497864804ECA396409E38B29F56F48885F76E6F0ACA591` | `37D4DBE3D72F56EF6C99C56EDFAC1C4BB7E3682A2B3EE304D4694DD035E4E55B` |
| `netlify/functions/_lib/cleanup-retention.mjs` | `95EA162F8472B4B5F054BC2BCDE94A0F4CFC874203314757719DDB70377F4518` | `A20D9D140929F40687BB2B2ABE752E4EAF868B7BCB6056399DAC9C3EE9C5F67A` |
| `package.json` | `67DDE48B64349083DA24C05037210E8700E047E6B5B8A24E405C4C973CF64C4C` | `C9D67C256C125408AB2B9D956975AAED2CE1722A4F8DEFBF8D4EF3C06D472D48` |
| `scripts/apply-analytics.js` | `A33D15B644920FA4A620A726E4509E26FD0C7468B4E60C5C4DCA78533812A409` | `6E80BEC99E62BCE80004902296DBF39F1132F90922D349D694796A7DEEE83A42` |
| `scripts/apply-accessibility.js` | `5FCFCCD774F57E8EF970D99A55981684D14F29ED6C422B3A8BAF2680B33E0F97` | `64BDCB738C6ED326F8F8563E7927F483D4CCA81CD50E3DF3FAAC82B6FE313D2D` |
| `scripts/build-assets.js` | `0E9773B78360C1EA084C447DEDBCA209726F4E188137A56C84BBFBCC2FE63770` | `0066D1062251AE5CEE2D235DA37E5CE04078177D44B21CF774961976437C97BE` |
| `scripts/generate-html-redirects.js` | `C3E5C5836EE91C38E50A6D795449074581594395153390ABD37F448BBA0FA9C2` | `C4F2B883E0F5E88A2A7F1B28AC4585F783F1171E5E962B0189ADF49271B6AB87` |
| `scripts/check-b1-isolation.mjs` | `379E35C65F0E207C0F38CEFCF6541B0609F62490B68092595A5739A11CA0CEF0` | `B65D41D97FC093C40EEC2C01598D46F8DB88CDB17CD515346861E8AA9BE217E1` |
| `tests/analytics/capture.integration.spec.mjs` | `68FDD1423FC85B994654F1F4F9B1F84C6FBE0ADB9AE91CFC8DE3A4CCBD91AF35` | `D0B63C4D06FFE62ECFB189EAF05C7E22EC65D03A1BD36EB44CEE1741574B06D0` |
| `validation-b1/artifact-contract.json` | `DCDF219969041DB578C3123B279EB6318A12DE71109BD247BE3F18D81E468C85` | `C1A122E4BB14E90E0023623ADE276221DD7E43C6BC621ECB0BA97F7BA49CED7F` |
| `validation-b1/shared-manifest.json` | `824FA206F696AB8D2720607A9474B67FF0E5A73E990E89E3BA3A268930533DAB` | `FEC363382AE1D204F83FB9A1EC33B63E6AC88A72BB93269031C9D7DCF02D20EE` |

---

## 7. Evidencia de preservacao semantica

- Diff de `scripts/apply-accessibility.js`: apenas `validation-b1` no regex.
- Diff de `scripts/build-assets.js`: apenas `validation-b1` no regex.
- Diff de `scripts/generate-html-redirects.js`: apenas `validation-b1` no regex.
- Diff de `migrate.mjs`: apenas o exemplo de banco.
- Nenhuma alteracao em condicoes, imports, fluxo, contratos de funcao, schemas ou testes de logica
  por causa da codificacao.
- A leitura UTF-8 estrita nao encontrou BOM, `U+00C3` ou `U+FFFD` em nenhum dos 69 candidatos.

---

## 8. Build canonico e isolamento

- `npm run build` no raiz: passou.
- HTML processados: 162.
- Pagefind: 159 paginas.
- `test:isolation`: passou.
- Arquivos B1 preservados: **41**.
- Build canonico nao alterou `validation-b1`.

---

## 9. Build e contrato B1

- `npm run build` B1: passou.
- `shared-manifest`: 16 arquivos.
- `build-manifest`: consistente.
- `deploy:b1 -- --check`: passou.
- Inventario final:
  - 7 arquivos estaticos;
  - 9 Functions;
  - 7 Edge Functions;
  - 0 redirects;
  - sem `collect`.

```json
{
  "status": "validated_only",
  "static_files": 7,
  "functions": 9,
  "edge_functions": 7,
  "redirects": 0
}
```

---

## 10. Regressao integral em Node.js 22

Ambiente: `node:22-bookworm`, Node `v22.23.5`, PostgreSQL 16 descartavel, `netlify-cli@27.20.0`.

| Teste | Resultado |
|---|---|
| Analytics | **135/135 pass** |
| B1 shared/b1/artifact/gate | **39/39 pass** |
| Consentimento | **2/2 pass** |
| SSL local | **5/5 pass** |
| Symlink Linux | passou, 0 skip |
| Contrato/manifesto | passou |
| Gate com mocks | passou |
| Isolamento dos 41 | passou |
| Build canonico | passou |
| Build B1 | passou |
| `deploy:b1 -- --check` | passou |

Falhas: 0. Ignorados: 0. Cancelados: 0.
Nao executados: CI remoto, deploy real, Run now, cleanup, SQL remoto e testes de producao.

---

## 11. Diff e verificacoes

- `git diff --check` nos caminhos candidatos: sem erros de whitespace.
- `git diff --cached`: vazio.
- Nenhum `git add`.
- Nenhum commit.
- Nenhum push.
- Nenhum CI remoto.
- Nenhum deploy.
- Nenhuma operacao Netlify ou Neon.
- Nenhum credito consumido.
- Nenhum arquivo fora dos 69 foi alterado manualmente; builds regeneraram apenas artefatos ja
  preexistentes.

---

## 12. Seguranca

- Nenhum `.env` ou credencial real.
- Nenhum token ou chave privada.
- Nenhum dump ou dado pessoal.
- Nenhuma URL de producao indevida no conjunto.
- Fixtures usam senhas sinteticas e dominios de teste.
- `node_modules`, `dist`, `.netlify` e caches continuam fora do conjunto.

---

## 13. TOCTOU

O risco TOCTOU permanece **NAO ACEITO**.

As mitigacoes existentes continuam: contrato independente, `mkdtemp`, `chmod`, validacao dupla,
gate `--check`/`--confirm` e CLI fixado. As limitacoes continuam: `chmod` nao e imutabilidade, o CLI
rele o pacote, nao ha lock/assinatura de filesystem e `netlify deploy` externo continua possivel.

O sucesso desta regressao nao constitui aceitacao do risco.

---

## 14. Pendencias e riscos residuais

- O versionamento dos 69 candidatos continua pendente de autorizacao.
- O CI remoto continua pendente de autorizacao.
- O job de analytics completo ainda depende dos demais arquivos preexistentes de analytics.
- TOCTOU permanece nao aceito.
- A validacao foi local, em containers descartaveis.

---

## 15. Classificacao final

**1 - Aprovado (escopo local).**

As 31 suspeitas foram diagnosticadas; 13 arquivos exigiram correcao real de BOM/mojibake e 18 eram
texto UTF-8 legitimo. O contrato foi atualizado apenas para o hash realmente alterado. Build
canonico, isolamento, build B1, gate e toda a regressao em Node.js 22 passaram. O indice Git
permanece vazio e nenhuma operacao remota, deploy ou publicacao foi realizada.

# Fase 5F.44 - Execucao de um unico deploy draft B1

Status: **tentativa unica executada e bloqueada antes da criacao do deploy; nenhum deploy foi
publicado, nenhuma segunda tentativa foi feita e nenhuma operacao remota de escrita ocorreu**.
Data/hora de referencia: **2026-11-20T16:32:39Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
Site autorizado: `portal-contas-validation-b1`
(`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
CI de referencia: `44733531472` (HEAD `665f0b3`, anterior as correcoes locais 5F.40-5F.43).

**Classificacao: 3 - Bloqueado ou inconclusivo.**
O comando oficial foi executado uma unica vez, mas o CLI recusou a combinacao de argumentos antes
de criar o deploy. A API read-only confirma que nao houve novo deploy na B1. Nao foi feita segunda
tentativa.

---

## 1. Autorizacao recebida e escopo

Autorizado:

- uma unica execucao de `npm run deploy:b1 -- --confirm`;
- somente o Site B1 `portal-contas-validation-b1`;
- contexto `deploy-preview`;
- verificacao pos-upload somente leitura.

Nao autorizado e nao executado:

- `netlify deploy` direto;
- segundo deploy ou retry;
- `--prod` ou equivalente;
- migration/Neon/cleanup/flags/variaveis remotas;
- commit, push ou PR;
- qualquer alteracao em producao.

---

## 2. Estado inicial do repositorio

| Verificacao | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote | mesmo HEAD |
| Indice Git | vazio |
| Staged | 0 |
| Working tree | alteracoes locais aprovadas da 5F.40-5F.43, nao commitadas |
| Lock do gate | ausente imediatamente antes da execucao |
| Node | `v24.13.0` |
| Netlify CLI | `27.20.0` |
| `NETLIFY_API_URL` e variaveis proibidas | ausentes no ambiente no preflight |

Arquivos locais relevantes ja existentes:

- `validation-b1/scripts/deploy-target.mjs`;
- `validation-b1/scripts/deploy-b1.mjs`;
- `validation-b1/tests/deploy-simulation.spec.mjs`;
- `validation-b1/package.json`;
- `.github/workflows/ci.yml`;
- correcoes anteriores de privacidade e migration 007.

Nenhum arquivo foi commitado ou staged.

---

## 3. Verificacoes pre-deploy

Executado antes da tentativa unica:

```powershell
cd validation-b1
npm run deploy:b1 -- --check
```

Resultado:

- `shared-manifest`: 16 arquivos;
- build B1: 6 arquivos + `build-manifest.json`, 10,0 KiB;
- `status`: `validated_only`;
- `artifact_sha256`: `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`;
- estaticos: 7;
- Functions: 9;
- Edge: 7;
- redirects: 0;
- 25 arquivos no manifesto;
- 81.443 bytes;
- `execution_id`: `34cad4e4-5c51-4988-ba22-b9cc6085395f`;
- `validated_at`: `2026-11-20T16:31:55.268Z`;
- site no manifesto: B1 correto.

O preflight confirmou o alvo B1 e o artefato aprovado. Nao foi usado `--prod`, migration, flag ou
cleanup.

---

## 4. Hash e manifesto do artefato

| Item | Valor |
|---|---|
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package_manifest_sha256` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Total | 25 arquivos, 81.443 bytes |
| Categories | 7 static, 9 functions, 7 edge, config, metadata |

O artefato nao contem `collect`, `_redirects` ou recursos canonicos. O staging era temporario e nao
foi publicado.

---

## 5. Comando efetivamente executado

Executado uma unica vez:

```powershell
cd validation-b1
npm run deploy:b1 -- --confirm
```

Nao foram adicionados argumentos, nao houve retry e nenhum outro comando de publicacao foi
executado.

Saida relevante:

```text
shared-manifest ok: 16 arquivos.
B1 build ok: 6 arquivos publicados + build-manifest.json, 10.0 KiB.
 »   Error: --context flag is only available when using the --build flag
Deploy B1 bloqueado: EPERM, Permission denied:
\\?\C:\Users\Joanita\AppData\Local\Temp\portal-contas-b1-deploy-sHosAj
```

O erro de `--context` foi emitido pelo Netlify CLI antes da criacao do deploy. A falha de limpeza
local do staging ocorreu depois, em `EPERM`; ela nao criou deploy remoto.

---

## 6. Resultado do deploy

| Campo | Resultado |
|---|---|
| Deploy criado | **nao** |
| Deploy ID novo | **nenhum** |
| URL draft nova | **nenhuma** |
| Estado do site B1 | `current` |
| `published_deploy` | `null` |
| `deploy_id` | vazio |
| `updated_at` do site | `2026-11-18T03:02:04.786Z` |
| Ultimo deploy existente | `6afd151972b2d3618033a7dd` (11/18/2026) |
| Contexto do ultimo | `deploy-preview` |
| `published_at` do ultimo | `null` |

A API read-only consultada depois da tentativa nao mostra deploy novo e o site continua sem
publicacao. Portanto, o deploy draft autorizado **nao foi criado**.

---

## 7. Verificacao pos-upload

Executada apenas leitura:

- site ID/nome conferidos: B1 correto;
- `published_deploy` continua `null`;
- `deploy_id` continua vazio;
- lista de deploys continua com `6afd...` como mais recente;
- `updated_at` do site nao mudou;
- nao ha novo ID/URL/estado para validar;
- nao ha arquivos publicados pela tentativa;
- nao houve confirmacao de Functions/Edge/headers/redirects para um deploy novo.

Como nao houve deploy, nao existe artefato publicado a comparar. Classificacao do resultado:
**inconclusivo/bloqueado**.

---

## 8. Divergencias e causas

### 8.1 `--context` incompativel com `--no-build`

A Fase 5F.43 adicionou `--context deploy-preview` ao allowlist. O Netlify CLI instalado (27.20.0)
recusa esse argumento quando `--no-build` esta presente:

```text
Error: --context flag is only available when using the --build flag
```

A simulacao da 5F.43 validou os argumentos pelo modulo e por mock, mas nao executou o CLI real;
por isso a incompatibilidade semantica com `--no-build` nao foi detectada. Nao foi feita correcao
nem retry nesta fase.

### 8.2 Limpeza local do staging

Apos a falha do CLI, o `finally` do gate tentou liberar/remover o staging congelado e recebeu
`EPERM` no Windows. O staging local permaneceu em:

```text
%TEMP%\portal-contas-b1-deploy-sHosAj
```

Isso e um residuo local, nao remoto, e nao foi removido durante a execucao para preservar a
evidencia. Nao afetou a API ou o site.

### 8.3 Nenhum deploy antes do erro

O erro de opcao ocorreu antes da criacao do deploy; a API read-only confirma a ausencia de novo
deploy e de alteracao de `updated_at`.

---

## 9. Ausencia de operacoes adicionais

- Nenhum segundo deploy ou retry.
- Nenhum `netlify deploy` direto.
- Nenhum `--prod`.
- Nenhuma migration, consulta de escrita ou alteracao Neon.
- Nenhum cleanup, cron, flag ou variavel remota.
- Nenhum commit, push ou PR.
- Nenhuma alteracao em producao.
- O unico comando de publicacao foi a unica tentativa `npm run deploy:b1 -- --confirm`.

---

## 10. Classificacao final

**3 - Bloqueado ou inconclusivo.**

Motivo: a unica tentativa autorizada falhou antes de criar o deploy. Nao ha deploy draft B1 novo,
nao ha ID/URL para validar e a validacao pos-upload nao pode ser concluida. A ausencia de segundo
deploy foi respeitada.

Nao e classificacao 1: nao houve deploy validado.
Nao e classificacao 2: nao houve deploy realizado para uma validacao incompleta.

---

## 11. Proxima etapa recomendada

Nao executar nova publicacao automaticamente. A proxima autorizacao deve ser precedida por:

1. correcao local da incompatibilidade `--context`/`--no-build` (por exemplo, remover
   `--context` do comando draft ou usar o modo compativel com o CLI fixado);
2. limpeza controlada do staging local remanescente;
3. teste local que execute a validacao de argumentos contra a semantica documentada do CLI, sem
   deploy real;
4. nova autorizacao explicita, com nova tentativa unica, novo digest e nova janela.

A autorizacao desta fase terminou apos a unica tentativa e sua verificacao. Nenhuma acao remota
posterior foi iniciada.

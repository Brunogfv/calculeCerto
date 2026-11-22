# Fase 5F.48 - Auditoria da cadeia de integridade e proveniencia do deploy B1

Status: **auditoria local concluida; nenhum deploy, upload, alteracao remota, migration, cleanup,
commit ou push executado**.
Data/hora de referencia: **2026-11-20T20:05:00Z**.
Deploy auditado: `6b007a6d6e15671b125b952e`.
Site: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
URL draft: `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app`.
Digest local aprovado: `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`.

**Classificacao: 2 - Cadeia parcialmente comprovada.**
A cadeia entre o artefato local, os estaticos publicados, o destino e o deploy e forte. A ligacao
direta entre o staging historico e o bundle executavel remoto de Functions/Edge nao esta provada
por um registro imutavel ou comparacao byte a byte.

---

## 1. Evidencias recuperadas

### 1.1 Relatorios locais

- `docs/analytics/fase-5f-43-endurecimento-gate-preparacao-deploy-draft-b1.md`;
- `docs/analytics/fase-5f-45-correcao-local-contexto-netlify-cli.md`;
- `docs/analytics/fase-5f-46-segunda-tentativa-deploy-draft-b1.md`;
- `docs/analytics/fase-5f-47-auditoria-integridade-pos-deploy-b1.md`.

### 1.2 Registros da execucao 5F.46

| Evidencia | Valor |
|---|---|
| Comando | `npm run deploy:b1 -- --confirm` |
| Preflight | `32e0e892-2d4f-4965-b03f-9b02a1836340`, `validated_only`, 16:50:32 |
| Manifesto do deploy | `8ed9448f-da39-42ea-83a5-4706c54ca70c`, `deployed`, 16:51:09 |
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package_manifest_sha256` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Contagem | 7 estaticos, 9 Functions, 7 Edge, 0 redirects |
| Staging reportado pelo CLI | `%TEMP%\portal-contas-b1-deploy-eq2EIc` |
| Deploy ID | `6b007a6d6e15671b125b952e` |
| URL | `https://6b007a6d6e15671b125b952e--portal-contas-validation-b1.netlify.app` |
| Site `updated_at` | `2026-11-20T16:51:07.392Z` |

### 1.3 Evidencias do deploy

Da Fase 5F.47, consultas somente leitura:

- deploy `ready`, contexto `deploy-preview`, `published_at=null`;
- site sem `published_deploy`;
- 2 Functions: `capture-html`, `cleanup-html-capture`;
- 1 Edge Function;
- 0 redirects;
- 1 header rule;
- `/api/collect` 404;
- SHA-1 de 6 estaticos igual ao `dist` local;
- HTML de resposta normalizado pelo Netlify, mas SHA-1 do arquivo de deploy igual ao local.

### 1.4 Staging atual

O staging `sHosAj` da tentativa 5F.44 foi validado e removido na 5F.45. O staging `eq2EIc` da
execucao 5F.46 nao esta mais presente. Nao ha copia historica do staging bem-sucedido.

---

## 2. Cadeia de proveniencia reconstruida

| Etapa | Evidencia concreta | Confiabilidade |
|---|---|---|
| 1. Artefato local aprovado | Manifesto 5F.45/5F.46; 25 arquivos; digest `6b3cbed...` | Comprovado localmente |
| 2. Validacao no gate | Codigo do gate; `--check` 16:50:32; `validarHandoff` | Fortemente sustentado |
| 3. Staging criado | CLI reportou `eq2EIc`; gate usa `mkdtemp` e `criarPacote` | Fortemente sustentado |
| 4. Digest calculado antes do CLI | `executarGate` calcula digest apos congelar e revalidar; `montarDeploy` revalida | Fortemente sustentado; sem log imutavel do valor no instante do spawn |
| 5. Args entregues ao CLI | Codigo `argumentosDeploy`; relatorio 5F.46; CLI reconheceu `--dir`, Functions, config e `--skip-functions-cache` | Fortemente sustentado; sem argv bruto salvo |
| 6. Site ID B1 | Constante de alvo, relatorio, API do site/deploy | Comprovado |
| 7. Contexto draft | API `deploy-preview`, `published_at=null` | Comprovado |
| 8. Deploy ID | CLI output e API `/deploys/{id}` | Comprovado |
| 9. Estaticos publicados | API SHA-1 6/6 igual ao local | Comprovado |
| 10. Functions/Edge | manifest local + API names/counts/IDs/`d` | Parcial |
| 11. Ausencia de reconstrucao entre validacao/upload | Codigo e sequencia; staging removido apos uso; sem log imutavel | Fortemente sustentado, nao provado diretamente |
| 12. Mesmo processo para Functions/Edge | Pacote unico enviado pelo mesmo CLI; manifest inclui arquivos; API recebeu 2 Functions + 1 Edge | Fortemente sustentado |
| 13. Conteudo executavel remoto | Sem recuperacao integral de bundle pela API | Nao comprovado |

### 2.1 O que a cadeia prova

- O deploy auditado existe, e draft, no Site B1 correto.
- O `artifact_sha256` aprovado e o manifesto de 25 arquivos foram registrados antes do deploy.
- O CLI recebeu um staging com `dist`, `netlify/functions` e `netlify.toml`; o output do CLI mostra
  esses paths.
- Os estaticos publicados correspondem byte a byte, por SHA-1, ao `dist` local.
- Functions/Edge foram reconhecidas pela API e nao ha `collect`.

### 2.2 O que a cadeia nao prova

- Que os bytes exatos do staging `eq2EIc` eram identicos ao staging validado no instante do upload;
  nao ha snapshot/log imutavel do staging historico.
- Que Functions/Edge publicadas sao byte a byte o bundle produzido do artefato local; a API nao
  fornece esses bytes.
- Que nenhum processo alterou o staging na janela entre digest e leitura pelo CLI; a protecao
  TOCTOU continua residual.

---

## 3. Functions e Edge Function

### 3.1 capture-html

| Item | Evidencia |
|---|---|
| Entrada local | `netlify/functions/capture-html.mjs` |
| SHA-256 local | `669c39813063e968ffb2f4c0fff6cc946b57d657928e4d06f396e240ee77c999` |
| Manifesto | incluida nos 9 arquivos de Functions |
| API nome | `capture-html` |
| API `d` | `5076ad20c9c2316d554cec38c4e004538d5ca586616fefefbd024a8274c72943` |
| API ID | `f09be74e...` |
| Runtime/regiao | `nodejs24.x`, `us-east-2` |
| Rota | `/api/capture-html` |
| Rate limit | 60/60s, IP e dominio |
| Comparacao de bytes | nao disponivel |

Conclusao: presenca, nome, rota, runtime e registro no manifesto comprovados; bundle remoto
associado por metadados, nao por SHA-256 comparavel.

### 3.2 cleanup-html-capture

| Item | Evidencia |
|---|---|
| Entrada local | `netlify/functions/cleanup-html-capture.mjs` |
| SHA-256 local | `c9f7dd040042c575644b89268dea897652760019a7113a08290e801a7e193a3a` |
| API nome | `cleanup-html-capture` |
| API `d` | `c731a5876b10d1c93816b2d31d9ed7069bac6a0f5f0635f39a96cfe5e7786595` |
| API ID | `dc8f3b09...` |
| Schedule | `15 3 * * *` |
| Comparacao de bytes | nao disponivel |

Conclusao: presenca, nome e schedule comprovados; bundle remoto nao comparado byte a byte. A
Schedule Function nao foi executada.

### 3.3 Edge html-capture

| Item | Evidencia |
|---|---|
| Entrada local | `netlify/edge-functions/html-capture.js` |
| SHA-256 local | `655a1bb9c52f204e822e24a96d6edb58217766649f266d3fa332ed2c6a5d9e86` |
| Dependencias locais | 6 arquivos `_lib` |
| API | `edge_functions_present=true`; 1 Edge Function |
| Bundle/hash remoto | nao recuperavel pela API oficial instalada |
| Comparacao de bytes | nao disponivel |

Conclusao: presenca e inventario local comprovados; conteudo executavel remoto nao comparado.

---

## 4. Evidencias comprovadas e nao comprovadas

### Comprovadas

- Site ID, nome e team B1;
- deploy ID `6b007a6d6e15671b125b952e`;
- contexto `deploy-preview`;
- `published_at=null` e `published_deploy=null`;
- 0 redirects, 1 header rule, CSP B1;
- ausencia de `/api/collect`;
- 2 Functions e 1 Edge no inventario;
- SHA-1 dos 6 arquivos estaticos igual ao `dist` local;
- manifesto local de 25 arquivos e digest.

### Fortemente sustentadas

- o staging foi criado do artefato aprovado pelo mesmo gate;
- o digest foi calculado sobre o staging e revalidado no handoff;
- o CLI recebeu o `dir`/Functions reportados;
- o deploy ID veio do mesmo processo;
- Functions/Edge foram empacotadas pelo mesmo CLI e registradas no manifesto.

### Nao comprovadas

- igualdade byte a byte de Functions e Edge entre origem/bundle local e bundle remoto;
- snapshot imutavel do staging `eq2EIc`;
- ausencia absoluta de alteracao TOCTOU entre a ultima validacao e o upload;
- hash remoto SHA-256 de `netlify.toml`/headers.

### Contradicoes

Nenhuma contradicao de destino, draft ou estaticos. Diferencas observadas tem explicacao:

- CLI contou 3 Edge Functions no upload; API/summary conta 1 entrada Edge;
- HTML servido normalizado; arquivo de deploy SHA-1 identico ao local.

---

## 5. Limitacoes da API do Netlify

- Nao ha GET documentado de conteudo de Function por deploy; o endpoint de Functions e PUT.
- Nao ha GET documentado do bundle de Edge Function; a API informa presenca/contagem, nao bytes.
- A listagem de arquivos do deploy nao expoe Functions/Edge executaveis.
- O `d` de Functions e digest de bundle, sem correspondencia direta com SHA-256 de fonte local.
- A API nao oferece um recibo assinado do upload com o digest local do staging.
- O HTML servido pode ser transformado pelo processamento do Netlify; o SHA-1 da API foi usado
  para distinguir arquivo publicado de resposta transformada.

---

## 6. Melhorias recomendadas para o gate

Nao implementadas nesta fase:

1. gravar um **registro de proveniencia** persistente fora do staging, com:
   - execucao, commit, data/hora;
   - `artifact_sha256`, `package_manifest_sha256`, `config_sha256`;
   - lista completa de arquivos;
   - `dir`, args efetivos e nomes de variaveis permitidas (sem valores);
   - Site ID, contexto, CLI e resultado;
2. salvar o **stdout/stderr bruto** do CLI em arquivo de evidencia;
3. manter um snapshot imutavel/arquivo selado do staging ate a verificacao, ou pelo menos um
   recibo do digest do staging imediatamente antes do spawn;
4. registrar o deploy ID e fazer a consulta pos-upload no mesmo recibo;
5. incluir SHA-1/SHA-256 dos estaticos recuperados e o resultado da comparacao;
6. registrar hashes de bundles locais de Functions/Edge e o `d` remoto, deixando claro que nao sao
   comparaveis quando o formato difere;
7. fazer a limpeza do staging somente depois de gravar o recibo;
8. manter o TOCTOU como risco documentado, nao como resolvido.

---

## 7. Confirmacao de ausencia de operacoes

- Nenhum deploy, upload, retry ou promocao nesta fase.
- Nenhuma alteracao Netlify, Neon, flags, variaveis, dominios ou producao.
- Nenhuma migration, cleanup, cron ou Scheduled Function.
- Nenhuma escrita em API remota.
- Nenhum commit, push ou PR.
- Staging e lock locais ausentes no encerramento.

---

## 8. Classificacao final

**2 - Cadeia parcialmente comprovada.**

Ha evidencia forte e consistente para o destino, o modo draft, o deploy ID, os estaticos e o
inventario de Functions/Edge. Faltam a comparacao byte a byte dos bundles executaveis e um registro
imutavel do staging/args no instante do upload. Nao ha contradicao ou divergencia comprovada que
justifique classificar como 3.

A cadeia nao autoriza promocao, novo deploy, migration, cleanup ou producao.

# Fase 5F.41 - Preparacao controlada da homologacao operacional B1

Status: **preparacao local, integridade e migration 007 validada; nenhuma operacao remota,
deploy, upload, commit, push, migracao remota ou alteracao de producao executada**.
Data/hora de referencia: **2026-11-20T15:30:00Z**.
Branch: `feat/portal-analytics`.
HEAD local e remoto: `665f0b31aa00ebf4a73fc6b98a39b976f0990d72`.
CI de referencia: `44733531472` (HEAD `665f0b3`, anterior as alteracoes locais desta fase).
Site B1: `portal-contas-validation-b1` (`9cd7034f-5691-46af-8030-d70f7ed52ca7`).
Banco de teste: PostgreSQL 16 descartavel, local, com dados sinteticos.

**Classificacao: 2 - Aprovado com pendencias.**
A preparacao local esta consistente, os testes passaram e o artefato tem manifesto e digest. Ainda
nao e possivel classificar como 1 porque a janela TOCTOU residual de filesystem existe, a
integridade do conteudo publicado no Netlify ainda nao foi observada e a migration 007 nao foi
aplicada em banco remoto. Nada foi publicado.

---

## 1. Resumo executivo

- O relatorio 5F.40 foi lido integralmente; o estado atual corresponde ao descrito, com as
  alteracoes locais ainda nao versionadas.
- O gate agora emite um **manifesto de integridade** com execucao, data, site, versoes, estado do
  gate, lista de arquivos, tamanhos, SHA-256 individual, SHA-256 consolidado, contagens e bytes.
- O artefato final continua com `artifact_sha256`
  `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339`, 7 estaticos, 9 Functions,
  7 Edge, 0 redirects e 25 arquivos no manifesto (incluindo configuracao e metadados).
- O gate ganhou uma trava de operacao exclusiva em diretorio temporario, impedindo dois processos
  do gate B1 simultaneos. A trava nao protege contra um `netlify deploy` externo nem contra um
  processo com o mesmo usuario que ignore a trava.
- O handoff continua revalidando o pacote e o digest imediatamente antes do spawn do CLI.
- O TOCTOU foi reduzido, mas nao eliminado: permanece a janela entre a ultima verificacao e a
  leitura dos arquivos pelo processo CLI. A solucao absoluta exigiria imutabilidade de filesystem,
  isolamento por conta/container ou upload por um canal que receba bytes selados.
- A migration `007_remove_session_user_agent.sql` foi revalidada em PostgreSQL 16 local: 7
  migrations aplicadas, segunda execucao idempotente, SQL 007 reaplicado sem erro e zero colunas
  `user_agent` em `sessions`.
- Analytics 137/137, B1 Windows 46 pass + 1 skip (47 testes), B1 Linux Node 22 47/47,
  Playwright 62/62, test-local 162/162, SSL 5/5, isolamento 41 arquivos, build canonico 162 HTML.
- Nenhuma operacao remota foi executada ou autorizada por esta fase.

---

## 2. Diagnostico inicial e estado do Git

### 2.1 Estado inicial

| Item | Valor |
|---|---|
| Branch | `feat/portal-analytics` |
| HEAD | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Remote da branch | `665f0b31aa00ebf4a73fc6b98a39b976f0990d72` |
| Indice Git | vazio |
| Staged | 0 |
| Working tree | alteracoes preexistentes + correcoes nao commitadas das fases 5F.40/5F.41 |
| Relatorios 5F.37-5F.40 | nao versionados |
| Deploy/publicacao | nao |

O estado corresponde ao relatorio 5F.40: `collect-handler` sem escrita de UA, migration 007
presente, gate B1 com digest/handoff e testes locais verdes. Nao foi feito `reset`, `clean`,
`checkout` destrutivo, `amend`, `rebase` ou force push.

### 2.2 Divergencias esperadas

| Diferenca | Justificativa |
|---|---|
| B1 tinha 45 testes; agora tem 47 | novo teste do manifesto de integridade e teste da trava do gate |
| Manifesto antes era apenas resumo do gate; agora inclui lista completa | requisito de integridade da Fase 5F.41 |
| Gate antes nao tinha trava de concorrencia | protecao adicional contra dois gates simultaneos |
| Estado continua com arquivos nao versionados | commit nao foi autorizado |

Nenhuma divergencia de codigo do 5F.40 foi sobrescrita ou removida.

---

## 3. Diagnostico da implementacao 5F.40

O fluxo herdado do 5F.40 era:

```text
sync-shared -> build -> criarPacote (temporario)
-> validarPacote
-> congelarPacote (chmod)
-> validarPacote
-> digestArtefato (duas leituras)
-> handoff dir + digest
-> deployNetlify: validarPacote + digestArtefato
-> Netlify CLI
```

O gate nao reconstruia um segundo pacote e entregava o mesmo diretorio ao CLI. O ponto residual era
a janela entre a ultima verificacao e o momento em que o CLI abria os arquivos, alem da
possibilidade de um comando externo ignorar o gate.

---

## 4. Auditoria TOCTOU

### 4.1 Onde o conteudo pode mudar

1. Durante a sincronizacao dos arquivos compartilhados.
2. Durante o build do `dist`.
3. Durante a copia para o diretorio de staging.
4. Durante a geracao ou alteracao do manifesto.
5. Entre a primeira e a segunda validacao.
6. Entre a ultima validacao/digest e o spawn do CLI.
7. Durante o upload, no processo externo/Netlify.
8. Depois do upload, no conteudo efetivamente publicado.

Os passos 1-5 sao cobertos por sync/build/allowlist/validador/digest. Os passos 6-8 nao podem ser
eliminados apenas com hashes locais.

### 4.2 Protecoes atuais

- pacote em diretorio temporario exclusivo;
- contrato independente e allowlist exata;
- manifesto com SHA-256 por arquivo;
- SHA-256 consolidado do conteudo;
- `chmod` recursivo (somente leitura) antes da verificacao final;
- segunda validacao depois do congelamento;
- duas leituras do digest antes do handoff;
- revalidacao do pacote e do digest dentro de `deployNetlify`;
- mesmo `dir` entregue ao CLI;
- `cwd` no pacote, `--dir` e `--functions` explicitos;
- trava de gate exclusiva;
- nenhum `--prod`, `--remote` ou bypass;
- falha fechada em qualquer divergencia.

### 4.3 Ameaca residual

Um processo concorrente com o mesmo usuario pode restaurar permissoes e alterar o diretorio depois
da ultima verificacao e antes da leitura pelo CLI. A trava do gate impede apenas outro gate; nao
impede:

- `netlify deploy` executado manualmente fora do gate;
- outro processo do mesmo usuario que ignore a trava;
- alteracao depois da ultima leitura do digest e antes do upload;
- substituicao do conteudo no destino remoto.

`chmod` no Windows nao e uma barreira absoluta; no Linux um processo com o mesmo usuario tambem
pode reverter permissoes. Nao foi declarada imutabilidade do sistema operacional.

### 4.4 Risco residual aceitavel?

- Para uma **homologacao B1 controlada**: pode ser aceito somente com sessao exclusiva, nenhum
  comando externo, digest registrado, deploy draft e verificacao pos-upload.
- Para **publicacao de producao**: nao e aceitavel como garantia isolada; exige um mecanismo de
  upload imutavel/assinado ou verificacao remota completa.
- Esta fase nao aceita o risco em nome do operador; a decisao deve ser explicita na autorizacao da
  janela.

### 4.5 Protecoes adicionais recomendadas

- executar o gate em conta/container separado, com o staging montado somente leitura para o CLI;
- usar upload por API que receba os bytes selados em memoria/arquivo unico;
- assinar o manifesto ou registrar o digest em evidencia externa;
- verificar os hashes/arquivos depois do upload;
- impedir operadores concorrentes na mesma maquina/diretorio durante a janela.

---

## 5. Solucoes implementadas

### 5.1 Manifesto de integridade

`validation-b1/scripts/artifact.mjs` agora exporta `criarManifestoIntegridade` e o gate o emite em
`integrity_manifest`.

Campos:

- `schema_version`;
- `execution_id`;
- `validated_at`;
- `scope`;
- `site.id` e `site.name`;
- `package.contract_version`;
- `package.artifact_sha256`;
- `package.package_manifest_sha256`;
- `package.config_sha256`;
- `package.counts`;
- `package.total_files`;
- `package.total_bytes`;
- `package.files[]` com categoria, caminho relativo, bytes e SHA-256;
- `tooling.node`, `tooling.netlify_cli`, `tooling.platform`;
- `gate.status`;
- limitacoes declaradas.

O manifesto nao contem caminhos absolutos, secrets, tokens ou connection strings.

### 5.2 Trava de gate

`validation-b1/scripts/deploy-b1.mjs` agora usa `adquirirTrava` com um arquivo de lock em
`os.tmpdir()`. O lock:

- impede dois gates B1 simultaneos;
- e liberado no `finally`;
- falha antes de preparar o pacote quando ja existe outro gate;
- nao e um mecanismo de imutabilidade do artefato;
- nao impede um CLI externo.

### 5.3 Handoff

`deployNetlify` recebe `dir` e `digest`, Executa `validarHandoff` (contrato + digest) e so entao
chama o CLI. A chamada usa o mesmo diretorio que foi validado e congelado.

---

## 6. Manifesto de integridade gerado

Execucao de referencia do gate `--check`:

| Campo | Valor |
|---|---|
| `execution_id` | `8c564a4d-6e01-4f20-ba8f-fc008072da63` |
| `validated_at` | `2026-11-20T15:28:40.230Z` |
| `status` | `validated_only` |
| Site ID | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| `artifact_sha256` | `6b3cbedacd405f648fd8e785da889583d655b1700958295261743b66118dc339` |
| `package_manifest_sha256` | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |
| `config_sha256` | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| Estaticos | 7 |
| Functions | 9 |
| Edge Functions | 7 |
| Configuracao | 1 |
| Metadados | 1 |
| Total | 25 arquivos |
| Total de bytes | 81.443 |
| Node | `v24.13.0` |
| Netlify CLI | `27.20.0` |
| Plataforma | `win32` |

Arquivos estaticos e hashes:

| Caminho | Bytes | SHA-256 |
|---|---:|---|
| `dist/_headers` | 426 | `cacc628a492bc6a3f232ccf9664133735de4394e739bb78d9ced8a64ebbc7839` |
| `dist/b1-consent.js` | 5.302 | `cc8d70bfa7f647fe4ccf8c8540cebce6f609515d164a03fc0fab7693d3096236` |
| `dist/b1.css` | 975 | `b09bebfa6bdec67cf3c79da7f18087930cbb5e8d0095c5e03711200ff8e0f8b1` |
| `dist/build-manifest.json` | 147 | `8db479438bb17b7475dae72d0bbb0d86487749c89c01cf1dbb5157cbe88fde29` |
| `dist/index.html` | 2.761 | `d5c59888a9cd679c08ae3d961be7595bdd0adc18c0917a949945a3b37352f63c` |
| `dist/robots.txt` | 26 | `331ea9090db0c9f6f597bd9840fd5b171830f6e0b3ba1cb24dfa91f0c95aedc1` |
| `dist/validacao-encerrada.html` | 705 | `1f6d5884b1a2f4a74f0dfad6ccf82a72a7db949883fbd23a873e524f0ddf964f` |

Configuracao:

| Caminho | Bytes | SHA-256 |
|---|---:|---|
| `netlify.toml` | 161 | `7b5f627a3b5870ade57f4890bd0a7860df00dfeb7e1edb84e6767fc4f78ca586` |
| `package-manifest.json` | 2.346 | `4cbb24300322db9d8dd1ed8701c23bd4214e3a1eaf527320ff5512179608aeac` |

Functions e Edge possuem os hashes individuais no `integrity_manifest` emitido pelo gate. O pacote
nao contem `/api/collect`, `_redirects` ou recursos canonicos.

O `execution_id` e a data mudam a cada execucao; os hashes de conteudo foram estaveis nesta fase.
O manifesto completo e reproduzivel com:

```text
cd validation-b1
npm run deploy:b1 -- --check
```

Nao foi gerado um arquivo versionado com timestamp; a saida do gate e a evidencia local. Uma janela
futura deve copiar essa saida para evidencia operacional imutavel propria.

---

## 7. Protocolo de integridade e verificacao pos-upload

### 7.1 Antes do upload

1. Executar `npm run deploy:b1 -- --check` em checkout limpo e sessao exclusiva.
2. Salvar a saida do gate, incluindo `execution_id`, `validated_at`, `artifact_sha256`,
   `package_manifest_sha256` e lista de arquivos.
3. Confirmar 7/9/7/0, ausencia de `collect`, `_redirects` e recursos canonicos.
4. Confirmar `artifact_sha256` estavel em duas execucoes; a data/ID podem variar.
5. Confirmar que o commit usado pelo gate e o commit autorizado.

### 7.2 No handoff

1. O gate entrega ao deploy o mesmo `dir` e o mesmo `digest`.
2. `deployNetlify` revalida `validarPacote` e o digest antes do spawn.
3. Qualquer divergencia aborta sem chamar o CLI.
4. O CLI deve ser invocado apenas pelo gate B1; um comando manual fora do gate nao e evidencia
   valida.

### 7.3 Depois do upload

1. Registrar o ID do deploy e a URL draft/ssl_url retornados pelo CLI.
2. Consultar, em modo de leitura, o site e o deploy na API do Netlify.
3. Confirmar site ID, contexto `deploy-preview`, `published_at=null` no draft e origem do deploy.
4. Obter a lista de arquivos publicados por caminho e tamanho.
5. Para arquivos estaticos publicamente acessiveis, baixar e calcular SHA-256, comparando com o
   manifesto local.
6. Comparar a lista de Functions/Edge com a allowlist e o resumo do deploy; `collect` deve ser
   ausente.
7. Confirmar 0 redirects, headers B1 e CSP restritivo; confirmar URL 200 e ausencia de conteudo
   canonical.
8. Registrar qualquer limitacao de API/headers que impeça a comparacao.

### 7.4 Limites de garantia

- **Integridade local:** comprovada por contrato, manifesto, hashes e handoff.
- **Integridade do pacote entregue:** comprovada ate a ultima verificacao do gate; a janela
  residual de filesystem nao e eliminada.
- **Integridade do conteudo publicado:** nao e comprovada apenas pelo hash local.
- A API do Netlify pode nao expor os bytes completos de Functions/Edge ou pode expor hashes em
  formato diferente de SHA-256.
- O protocolo deve registrar essas limitacoes e nao inventar equivalencia entre hashes locais e
  remotos.
- Se o Netlify nao fornecer recuperacao integral do artefato publicado, a evidencia alternativa e
  a combinacao de lista de arquivos/tamanhos, nomes de Functions/Edge, headers observados e testes
  de comportamento, com a ressalva de que nao e prova byte a byte do bundle remoto.

---

## 8. Auditoria da migration 007

Arquivo: `db/migrations/007_remove_session_user_agent.sql`.

```sql
-- Remove a persistencia do User-Agent bruto da tabela de sessoes.
ALTER TABLE sessions
    DROP COLUMN IF EXISTS user_agent;
```

### 8.1 Sintaxe e idempotencia

- sintaxe SQL valida;
- `DROP COLUMN IF EXISTS` e idempotente na segunda execucao direta;
- o runner registra a migration em `schema_migrations` e ignora uma segunda aplicacao;
- a migration 007 e aplicada depois da 006.

### 8.2 Referencias restantes

Busca no projeto:

| Local | Classificacao |
|---|---|
| `getUserAgent` em `http.mjs` | entrada transitoria |
| `parseUserAgent` em `user-agent.mjs` | classificacao em memoria |
| `collect-handler` | usa UA apenas durante a requisicao; nao grava |
| `001_init.sql` | definicao historica da coluna; fica preservada |
| `007_remove_session_user_agent.sql` | remocao |
| testes de analytics | UA sintetico e assertion de ausencia |
| documentacao | referencia historica, sem valores |

Nao foram encontrados `INSERT`, `SELECT`, views, indices, constraints, triggers ou funcoes de
aplicacao que exijam `sessions.user_agent` depois da migration. O unico uso remanescente e
transitorio, para derivar `device_type`, `browser`, `os` e `is_test`.

### 8.3 Validacao local

PostgreSQL 16 descartavel:

- banco vazio;
- roles de teste preparadas;
- 7 migrations aplicadas na ordem 001-007;
- segunda execucao do runner: todas ignoradas;
- SQL 007 executado novamente: `NOTICE ... does not exist, skipping` e `ALTER TABLE` sem erro;
- `schema_migrations`: 7;
- `sessions.user_agent`: 0 ocorrencias;
- analytics: 137/137;
- ingestao, sessoes, classificacao, deduplicacao, rate limit, cleanup e testes de privacidade
  passaram.

### 8.4 Compatibilidade e risco

- A migration remove valores historicos de UA bruto; nao ha rollback dos dados apagados.
- Em producao, o codigo que nao escreve mais a coluna deve ser implantado antes da migration; uma
  aplicacao antiga que tente inserir `user_agent` falharia depois do drop.
- Em B1 nao existe `collect`; a migration nao e necessaria para o artefato B1.
- Rollback de schema possivel: `ALTER TABLE sessions ADD COLUMN user_agent TEXT;`, sem recuperar
  dados.
- Grants existentes sao de tabela; a remocao de coluna nao exige grant novo.
- Nenhum banco remoto foi tocado.

---

## 9. Testes locais executados

### 9.1 Windows, Node.js v24.13.0

| Comando | Resultado |
|---|---|
| `npm test` (B1) | 47 testes: 46 pass, 1 skip, 0 fail |
| skip | symlink nao suportado no Windows; equivalente passou no Linux |
| `npm run test:browser` (B1) | 2/2 pass |
| `node --check` | pass |
| `npm run deploy:b1 -- --check` | `validated_only`; 7/9/7/0; manifesto emitido |

### 9.2 Linux, Node.js 22 em container

| Comando | Resultado |
|---|---|
| `node --test` shared/b1/artifact/gate | **47/47 pass**, 0 skip |
| Node | `v22.23.5` |
| build B1 | pass |
| symlink | passou |

### 9.3 Analytics, migration e privacidade

| Comando | Resultado |
|---|---|
| `npm run db:roles:test` | pass |
| `npm run db:migrate:test` | 7 migrations; segunda execucao ignorada |
| SQL 007 direto novamente | idempotente |
| `npm run test:analytics` | **137/137 pass**, 0 skip |
| `sessions.user_agent` | 0 colunas |
| logs com UA bruto | nenhum no teste |

### 9.4 Canonico e navegador

| Comando | Resultado |
|---|---|
| `npm run test:isolation` | 41 arquivos B1 preservados |
| build canonico | 162 HTML |
| `npx playwright test` | 62/62 pass |
| `node scripts/test-local.js` | 162/162 pass |

As suites de integracao de banco aparecem como skip no runner Playwright sem variaveis de banco;
elas foram executadas separadamente com PostgreSQL 16 e passaram 137/137.

### 9.5 CI

- CI `44733531472`, commit `665f0b3`: sucesso previo.
- Nenhum commit/push foi feito nesta fase.
- O CI nao cobre as alteracoes locais da 5F.40/5F.41.
- Nenhum job de deploy foi executado.

---

## 10. Matriz de homologacao B1

| Area | Pre-condicao | Procedimento/evidencia esperada | Aprovacao | Interrupcao | Recuperacao | Escopo |
|---|---|---|---|---|---|---|
| Artefato local | Commit autorizado; gate `--check` | `artifact_sha256` e manifesto; 7/9/7/0 | hashes reproduziveis | divergencia ou `collect` | abortar e revalidar | local |
| Handoff | Mesmo gate | `validarHandoff` OK; mesmo dir/digest | CLI recebeu o digest | falha de digest | abortar | local |
| Isolamento | Pacote B1 | sem `_redirects`, sem headers raiz, sem `collect` | allowlist exata | recurso extra | abortar | local |
| Publicacao | Autorizacao B1 | deploy draft, ID, site ID, contexto | deploy inequivoco | ID/contexto divergente | nao promover; registrar | remoto pendente |
| Functions/Edge | Deploy B1 | inventario e contagens na API | 2 entradas/9 arquivos e 1/7 | extras ou ausencia | interromper | remoto pendente |
| Privacidade | Codigo + migration | sem UA bruto em `sessions`, logs ou alternativo | 0 coluna e testes | qualquer persistencia | bloquear producao | local/remoto pendente |
| Migration 007 | Codigo novo | 7 migrations, idempotencia, 0 coluna | schema e analytics | erro ou coluna reutilizada | rollback vazio documentado | local; remoto pendente |
| SSL | URL/role de cleanup | validacao de host/certificado/`sslmode` | conexao validada | `pg_stat_ssl=false` sem explicacao | nao executar cleanup | remoto pendente |
| Ingestao | Deploy + flags controladas | requisicao sintetica valida | 202 e dados esperados | 4xx/5xx/erro | desligar flag | remoto pendente |
| Rate limit | Deploy controlado | excesso produz 429 | limite observado | limite nao aplicado | interromper | remoto pendente |
| Consentimento | Deploy + browser | sem consentimento nao coleta; com consentimento coleta | evidencias de ambos | coleta sem consentimento | desligar flag | remoto pendente |
| Cleanup | Flag e dados sinteticos | Run now; status/limpeza observados | resultado esperado | lock/erro/limpeza incorreta | desligar flag | remoto pendente |
| Producao | Nada acima | verificacao de que permaneceu intocada | sem alteracao | qualquer alteracao | interromper e registrar | remoto futuro |

Itens marcados **remoto pendente** nao podem ser aprovados nesta fase e exigem autorizacao e
evidencia pos-execucao.

---

## 11. Pendencias remotas

1. Commit autorizado do conjunto local.
2. Deploy draft B1 com o digest registrado.
3. Verificacao pos-upload de arquivos, Functions, Edge, headers, redirects e URL.
4. Aceitacao formal/ mitigacao do TOCTOU residual para a janela controlada.
5. Aplicacao remota de 007 somente depois do codigo que nao grava UA.
6. SSL efetivo do cleanup.
7. Ingestao, rate limit, consentimento, cleanup e logs no B1.
8. Revisao de privacidade/DPO.
9. Qualquer producao.

Nenhuma delas foi executada.

---

## 12. Evidencia de ausencia de operacoes remotas

- Nenhum comando `netlify deploy`, `netlify api` de escrita, `neon` de migration, SQL remoto,
  cleanup, cron ou alteracao de flag foi executado.
- O unico comando do Netlify relacionado foi leitura de `--help` em fase anterior; nesta fase o
  gate `--check` nao chama o CLI.
- O banco utilizado foi um PostgreSQL 16 local descartavel, sem conexao com Neon.
- O build/test-local/Playwright usaram somente servidor e arquivos locais.
- Nenhuma credencial remota foi usada ou revelada.
- Nenhum commit, push, PR, deploy, upload ou alteracao de producao foi realizado.
- Nenhum credit remoto foi consumido.

---

## 13. Arquivos modificados/criados nesta fase

Modificados:

- `validation-b1/scripts/artifact.mjs` - manifesto de integridade;
- `validation-b1/scripts/deploy-b1.mjs` - emissao do manifesto e trava do gate;
- `validation-b1/tests/artifact.spec.mjs` - teste do manifesto;
- `validation-b1/tests/gate.spec.mjs` - teste da trava e do handoff atualizado.

Criados:

- `docs/analytics/fase-5f-41-preparacao-controlada-homologacao-b1.md`.

Ja existentes e validados, nao alterados nesta fase:

- `db/migrations/007_remove_session_user_agent.sql`;
- `netlify/functions/_lib/collect-handler.mjs`;
- `tests/analytics/collect.integration.spec.mjs`;
- demais testes e relatorios.

O working tree preserva todas as alteracoes anteriores. Nada foi commitado ou staged.

---

## 14. Classificacao final

- Preparacao local: **sim**.
- TOCTOU reduzido e testado: **sim**.
- TOCTOU eliminado: **nao**; janela residual documentada.
- Manifesto/protocolo de integridade: **sim**, local e reproduzivel.
- Prova do conteudo remoto: **nao**; depende do upload autorizado e da API/arquivos publicados.
- Migration 007 validada localmente: **sim**.
- Migration remota: **nao aplicada**.
- Privacidade local: **sim** (137/137 e schema sem coluna).
- Regressao local: **sim**; 162 HTML, 62 Playwright, 47 B1 Linux, 46 pass + 1 skip no Windows.
- Publicacao remota: **nao realizada**.
- Producao: **nao alterada**.

**Classificacao: 2 - Aprovado com pendencias.**

Nao e 1 porque a janela TOCTOU nao esta absolutamente eliminada e porque a integridade do upload e
a migration remota ainda dependem de uma execucao futura autorizada. Nao e 3 porque as correcoes
locais, os testes, o manifesto e a migration passaram e nao ha falha critica conhecida.

---

## 15. Proxima etapa recomendada

**Fase 5F.42:** revisao independente do pacote, do manifesto e do protocolo pos-upload; depois,
somente com autorizacao especifica, uma janela B1 controlada.

Sequencia sugerida:

1. commit/push autorizados e checkout limpo;
2. revisao independente do gate/manifiesto;
3. deploy B1 draft com digest;
4. verificacao pos-upload e identificacao do deploy;
5. decisao sobre TOCTOU;
6. migration 007 remota apenas depois do codigo;
7. SSL, ingestao, rate limit, consentimento e cleanup;
8. producao somente em fase separada.

Nenhuma dessas operacoes foi iniciada. A publicacao permanece **nao aprovada**.

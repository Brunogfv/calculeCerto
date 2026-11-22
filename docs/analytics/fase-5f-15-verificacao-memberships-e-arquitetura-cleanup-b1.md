# Fase 5F.15 — Verificação de memberships e decisão arquitetural do cleanup B1

Status: **auditoria somente de leitura concluída; nenhuma alteração remota; nenhum deploy; nenhuma
execução de cleanup**.

Data/hora: **2026-11-17**.

Branch: `feat/portal-analytics`.

Commit de referência: `8d455fc4f01f7944f2a015681dd5c81c0704d786`.

**Classificação: 2 — Aprovado com pendências.** As memberships foram comprovadas e a divergência
entre as Fases 5F.11 e 5F.13 foi resolvida. A role de cleanup não possui privilégio excessivo. A
arquitetura segura para validação futura foi definida, mas o runtime publicado, o cron real e o
dry-run continuam sem comprovação.

---

## 1. Escopo e ambientes confirmados

| Item | Valor |
|---|---|
| Neon Project ID | `square-mountain-69641645` |
| Branch | `validation-b1` (`br-misty-sound-b6pnt7iw`) |
| Database | `validation_b1` |
| PostgreSQL | 17.12 |
| Role de cleanup | `validation_b1_cleanup` |
| Role de runtime | `validation_b1_runtime` |
| Netlify Team ID | `697d58587a017c3396fb416e` |
| Netlify Site ID B1 | `9cd7034f-5691-46af-8030-d70f7ed52ca7` |
| Deploy atual | `6afb78132cdffef6e6a05696` |
| Contexto | `deploy-preview` |
| Estado | `ready`, não publicado |
| Plano Netlify | Free (`nf_team_dev`) |
| Créditos disponíveis | **139,3888263442** de 300 |
| Produção | não alterada |
| Homologação principal | não alterada |

As consultas Neon foram executadas como `neondb_owner` em `validation_b1`, apenas para leitura.
Nenhum segredo, URL completa ou credencial foi exibido.

---

## 2. Estado atual das memberships

Consulta em `pg_auth_members`, considerando as duas direções:

| Member | Granted role | Grantor | admin_option | inherit_option | set_option |
|---|---|---|---|---:|---:|---:|
| `neondb_owner` | `validation_b1_cleanup` | `cloud_admin` | true | false | false |

- `validation_b1_cleanup` **não recebe** memberships.
- Não há membership concedida por `validation_b1_cleanup`.
- `neondb_owner` é membro de `validation_b1_cleanup`; o contrário não existe.
- `pg_has_role('validation_b1_cleanup','neondb_owner','MEMBER') = false`.
- `pg_has_role('neondb_owner','validation_b1_cleanup','MEMBER') = true`.
- `pg_has_role('validation_b1_cleanup','neondb_owner','USAGE') = false`.
- `pg_has_role('neondb_owner','validation_b1_cleanup','USAGE') = false`.
- `admin_option=true` permite que `neondb_owner` administre a membership; não concede à role de
  cleanup os privilégios administrativos de `neondb_owner`.
- `validation_b1_cleanup` não possui objetos próprios.
- `cloud_admin` é a role de plataforma superuser que figura como grantor.

A exceção é exatamente a membership de plataforma registrada e aceita na Fase 5F.11. Não foi
removida nem alterada nesta fase.

---

## 3. Explicação da divergência 5F.11 × 5F.13

A Fase 5F.11 registrou:

```text
member: neondb_owner
group_role: validation_b1_cleanup
grantor: cloud_admin
admin_option: true
inherit_option: false
set_option: false
```

A Fase 5F.13 registrou “memberships recebidas: nenhuma” e concluiu que a exceção não estava
presente. O estado atual confirma a 5F.11.

A explicação é de **escopo/interpretação da consulta**:

- uma consulta que filtra `member.rolname = 'validation_b1_cleanup'` verifica apenas memberships
  **recebidas** pela role;
- ela não encontra a linha atual, pois nela `neondb_owner` é o member e
  `validation_b1_cleanup` é a granted role;
- para encontrar a exceção é necessário consultar também
  `granted.rolname = 'validation_b1_cleanup'`;
- a 5F.13 relatou corretamente “nenhuma membership recebida”, mas a conclusão mais ampla de
  “ausência de memberships” não era suportada pela consulta.

Não há evidência de mudança real de estado, remoção de membership ou criação de nova concessão. A
role não foi alterada nesta fase.

---

## 4. Privilégios efetivos

### Atributos da role

`validation_b1_cleanup`:

- LOGIN: sim;
- SUPERUSER: não;
- CREATEDB: não;
- CREATEROLE: não;
- REPLICATION: não;
- BYPASSRLS: não;
- INHERIT: não (`NOINHERIT`);
- sem objetos próprios;
- sem membership recebida.

### Schema e bancos

| Verificação | Resultado |
|---|---|
| `USAGE` em `public` | sim |
| `CREATE` em `public` | não |
| `CONNECT` em `validation_b1` | sim |
| `CREATE` em `validation_b1` | não |
| `CONNECT` em `neondb` | **não** |
| `CREATE` em `neondb` | **não** |
| `SELECT`/`DELETE` em `schema_migrations` | não |
| Privilégios herdados de `neondb_owner` | não |

O ACL de `neondb` não contém `validation_b1_cleanup`. O ACL de `validation_b1` contém apenas o
`CONNECT` direto da role de cleanup. O schema `public` contém `USAGE` direto e não `CREATE`.

### Tabelas

As 13 tabelas de retenção possuem:

- `SELECT`: sim;
- `DELETE`: sim;
- `INSERT`: não;
- `UPDATE`: não;
- `TRUNCATE`: não.

Tabelas verificadas:

`visitors`, `sessions`, `pageviews`, `events`, `affiliate_clicks`, `ingest_events`,
`rate_limits`, `html_events`, `html_traffic_daily`, `html_indicators_monthly`,
`edge_daily_counters`, `edge_nonces`, `edge_rate_limits`.

Não há concessões diretas de função ou sequência para `validation_b1_cleanup`. Funções públicas
podem ter `EXECUTE` padrão do PostgreSQL, mas isso não decorre de membership administrativa nem
amplia os privilégios de cleanup sobre os dados.

**Conclusão:** não há privilégio excessivo nem acesso indevido a `neondb`; a exceção
`neondb_owner → validation_b1_cleanup` é administrativa e não é herdada pela role de cleanup.

---

## 5. Revisão da Scheduled Function

A documentação oficial atual da Netlify estabelece:

- Scheduled Functions executam em cron **somente em deploys publicados**.
- Deploy Previews não disparam cron automaticamente.
- A execução manual em preview é suportada pelo **Run now** da UI.
- O limite de execução é de **30 segundos**.
- Funções agendadas não são invocáveis por URL e não recebem payload/POST.
- `netlify functions:invoke` e o Netlify Dev servem para debug local, não para validar o cron
  publicado.

Estado do B1:

| Verificação | Resultado |
|---|---|
| Deploy é preview | sim |
| `published_at` | `null` |
| `published_deploy` | `null` |
| Cron no deploy | `cleanup-html-capture`, `15 3 * * *` |
| Cron executado | não |
| `CLEANUP_DATABASE_URL` no preview | presente, secret |
| `HTML_CAPTURE_CLEANUP_ENABLED` no preview | `false` |
| Cleanup no contexto de produção | ausente |
| Flag no contexto de produção | ausente |
| Código do deploy atual | anterior às correções locais da 5F.14 |

Consequência: o preview atual não executa o cron. Promover o preview não configura automaticamente
o cleanup no contexto de produção e faria a função encontrar ausência de URL/flag. Qualquer
validação de runtime precisaria de um novo deploy com o código corrigido e de uma decisão explícita
de alvo.

---

## 6. Comparação das arquiteturas

### A. Manter B1 como laboratório e usar execução controlada fora do cron

- **Isolamento:** alto no banco; o site B1 é público, mas minimalista e sem rota de manutenção.
- **Segurança:** o Run now é manual e autenticado; a função não tem URL pública. Exige ativar a flag
  em janela autorizada e usar dados isolados.
- **Custo:** não cria outro site; pode exigir um preview deploy do código 5F.14 e compute manual.
  Medições anteriores de preview ficaram em 0 crédito, mas isso não deve ser presumido.
- **Deploy:** sim, preview.
- **Risco de execução acidental:** baixo com a flag falsa; médio se a flag for ativada.
- **Capacidade de validar o cron real:** **não**.
- **Autorização adicional:** alteração de flag/ambiente, deploy preview e Run now.
- **Limitação:** o deploy atual ainda não contém as correções da 5F.14.

### B. Criar um ambiente de validação publicado, isolado, com credenciais e dados próprios

- **Isolamento:** alto; site dedicado, branch/database/role próprios, sem produção ou homologação.
- **Segurança:** alta se a página for mínima/privada e não houver endpoint público de manutenção;
  a função agendada não tem URL. O acesso ao site deve ser restringido quando possível.
- **Custo:** um ou mais deploys publicados, compute diário da Scheduled Function e recursos Neon.
  Não presumir custo zero.
- **Deploy:** sim, publicado.
- **Risco de execução acidental:** maior, pois o cron pode executar diariamente e excluir dados de
  teste; exige dados isolados, orçamento conservador e monitoramento.
- **Capacidade de validar o cron real:** **sim**.
- **Autorização adicional:** criar site/branch/database/role, configurar segredos, publicar, ativar
  flag e autorizar a janela de cron.

### C. Manter a Scheduled Function desativada e validar somente em PostgreSQL local

- **Isolamento:** máximo; nenhum dado remoto.
- **Segurança:** nenhum risco remoto.
- **Custo:** aproximadamente zero.
- **Deploy:** não.
- **Risco de execução acidental:** nenhum.
- **Capacidade de validar o cron real:** **não**.
- **Autorização adicional:** nenhuma.
- **Limitação:** não comprova env, conexão Netlify→Neon, permissões de runtime nem cron.

### D. Outra alternativa: scheduler externo ou endpoint autenticado

- **Isolamento:** depende do runner e do armazenamento de segredo.
- **Segurança:** pode ser seguro, mas cria endpoint/credencial adicionais e amplia a superfície.
- **Custo:** runner externo, secret management e operação adicionais.
- **Deploy:** depende.
- **Risco:** médio.
- **Capacidade de validar o cron real da Netlify:** **não**.
- **Autorização adicional:** nova arquitetura, segredos e infraestrutura.
- **Recomendação:** não usar para validar Scheduled Function da Netlify.

---

## 7. Custos e riscos

- Saldo atual: **139,3888263442 créditos**; plano Free com 300.
- A alternativa A pode consumir um preview deploy e compute manual; reservar até 15 créditos por
  deploy é prudente, embora medições anteriores tenham sido 0.
- A alternativa B adiciona um deploy publicado e execução diária. Uma função de 30 s em 1 GB
  equivale a aproximadamente 0,0083 GB-h/dia, cerca de 0,25 GB-h/mês e aproximadamente 2,5 créditos/
  mês de compute, além de requests, banda e Neon. O valor não é zero e deve ser monitorado.
- A alternativa C não tem custo remoto e não valida runtime.
- O risco principal de A/B é executar exclusão real em dados remotos. O risco principal de C é
  aprovar a retenção sem evidência de runtime.
- O limite de 30 s da plataforma e o orçamento interno de 20 s da 5F.14 continuam sendo premissas;
  devem ser medidos no alvo escolhido.

---

## 8. Recomendação técnica

1. **Agora:** manter a alternativa C, sem alterações remotas. A rotina já está validada localmente
   em PostgreSQL 17.
2. **Pré-validação:** autorizar uma janela com a alternativa A: deploy preview do código 5F.14,
   flag ativada somente na janela, dados de teste isolados, orçamento baixo e Run now manual. Não
   publicar nem usar cron nessa etapa.
3. **Validação definitiva:** se o cron real for requisito, adotar a alternativa B com site
   publicado dedicado, branch/database/role exclusivos e dados de teste. Não promover o B1 preview,
   não reutilizar os dois registros sintéticos e não copiar variáveis cegamente para produção.
4. **B1 permanece laboratório:** não publicar, não promover e não usar como alvo definitivo de
   retenção.
5. **Antes de ativar:** implementar/validar dry-run, confirmar que a conexão é direta/SSL e definir
   o contexto correto de `CLEANUP_DATABASE_URL` e da flag.

---

## 9. Ações que exigem nova autorização

- Criar o alvo publicado dedicado e a branch/database/role de validação.
- Alterar variáveis ou flags.
- Fazer deploy preview ou deploy publicado.
- Executar Run now, cron ou limpeza.
- Implementar dry-run ou qualquer alteração de código.
- Executar qualquer operação remota de escrita.

Nenhuma dessas ações foi executada.

---

## 10. Consultas de leitura executadas

As consultas abaixo foram executadas somente para leitura, como `neondb_owner` em
`validation_b1`; nenhuma senha ou URL foi registrada.

- confirmação de `current_database()`, `current_user` e versão do PostgreSQL;
- `pg_auth_members` com member, granted role, grantor, `admin_option`, `inherit_option` e
  `set_option`;
- `pg_roles` para `validation_b1_cleanup`, `validation_b1_runtime`, `neondb_owner` e
  `cloud_admin`;
- `pg_has_role()` nas duas direções e para `MEMBER`/`USAGE`;
- `has_table_privilege()` nas 13 tabelas;
- `has_schema_privilege()` em `public`;
- `has_database_privilege()` em `validation_b1` e `neondb`;
- `aclexplode()` de tabelas, schema, database e funções para identificar grants diretos;
- verificação de objetos de propriedade da role;
- consulta a `pg_auth_members` para confirmar que não há membership recebida pela role.

As consultas não alteraram dados, roles, grants, migrations, variáveis ou deploys.

---

## 11. Classificação final

**2 — Aprovado com pendências.** As memberships estão comprovadas e a divergência foi resolvida. A
role de cleanup tem apenas os privilégios mínimos esperados e não acessa `neondb`. A arquitetura
segura para validação futura está definida, mas o runtime publicado, o cron real, a conexão
direta/SSL e o dry-run ainda dependem de uma janela autorizada.

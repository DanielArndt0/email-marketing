# Migrations

Este documento registra as principais alterações estruturais de banco relevantes para a evolução do projeto e descreve como executar os scripts SQL em ambiente local.

## Organização dos arquivos

Os scripts SQL locais ficam em:

```text
docker/postgres/migrations/
├─ 001_initial_schema.sql
├─ 002_create_templates_table.sql
├─ 003_link_templates_to_email_dispatches.sql
└─ ...
```

A numeração no início do nome define a ordem de execução.

## Execução automática na criação inicial

Durante a primeira criação do volume do PostgreSQL, os scripts podem ser montados no caminho interno especial:

```text
/docker-entrypoint-initdb.d
```

Como os arquivos Compose ficam na pasta `infra/`, o volume deve apontar para a pasta real usando `../`:

```yaml
volumes:
  - email_marketing_pgdata:/var/lib/postgresql/data
  - ../docker/postgres/migrations:/docker-entrypoint-initdb.d:ro
```

Esses scripts rodam apenas quando o banco ainda não foi inicializado.

Se o volume já existir, o Postgres não executa novamente os scripts e exibe uma mensagem semelhante a:

```text
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

Para recriar o banco local do zero:

```bash
docker compose -f infra/compose.infra-dockerized.yaml down -v
docker compose -f infra/compose.infra-dockerized.yaml up --build
```

Use `down -v` com cuidado, pois ele apaga os dados do banco local.

## Execução manual em banco já existente

Se o banco já existe e você não quer apagar o volume, execute as migrations manualmente.

No Windows PowerShell:

```powershell
Get-ChildItem .\docker\postgres\migrations\*.sql |
  Sort-Object Name |
  ForEach-Object {
    Write-Host "Rodando migration: $($_.Name)"
    Get-Content -Raw $_.FullName | docker compose -f infra/compose.infra-dockerized.yaml exec -T postgres psql -v ON_ERROR_STOP=1 -U email_marketing -d email_marketing
  }
```

Para rodar uma migration específica:

```powershell
Get-Content -Raw .\docker\postgres\migrations_initial_schema.sql | docker compose -f infra/compose.infra-dockerized.yaml exec -T postgres psql -v ON_ERROR_STOP=1 -U email_marketing -d email_marketing
```

Também é possível executar scripts pelo pgAdmin, desde que o usuário, banco e porta estejam alinhados com o Compose.

Exemplo de conexão local via pgAdmin:

```text
Host: localhost
Port: 5433
Database: email_marketing
User: email_marketing
Password: email_marketing
```

## Histórico das migrations principais

## 008 - SMTP Senders

Cria a tabela `smtp_senders` e adiciona o vínculo inicial com campaigns.

### Alterações

- cria `smtp_senders`;
- adiciona `campaigns.smtp_sender_id`;
- cria índice para `smtp_senders.is_active`;
- cria índice para `campaigns.smtp_sender_id`.

### Tabela `smtp_senders`

Armazena os remetentes SMTP disponíveis para campanhas.

A senha é armazenada criptografada em `password_encrypted`.

---

## 009 - SMTP Sender em Email Dispatches

Adiciona o vínculo do SMTP Sender diretamente nos dispatches.

### Alterações

- permite `smtp_senders.username` como `NULL`;
- permite `smtp_senders.password_encrypted` como `NULL`;
- adiciona `email_dispatches.smtp_sender_id`;
- cria foreign key para `smtp_senders(id)`;
- cria índice para `email_dispatches.smtp_sender_id`.

### Motivo

O `smtp_sender_id` também é salvo no dispatch para congelar o remetente usado no momento do envio.

Assim, se a campaign for alterada futuramente, os dispatches já criados continuam apontando para o sender original.

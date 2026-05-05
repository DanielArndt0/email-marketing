# Desenvolvimento local

Este documento descreve os modos de execução local do projeto.

O projeto pode ser executado de duas formas:

1. **Aplicação local com infraestrutura no Docker**: API e worker rodam na máquina; PostgreSQL, Redis e Mailpit rodam em containers.
2. **Stack completa dockerizada**: API, worker, PostgreSQL, Redis e Mailpit rodam em containers.

Para detalhes completos de Docker, Compose, portas, `.env` e `.env.docker`, consulte também [Docker e infraestrutura local](./docker.md).

## Pré-requisitos

Para executar o projeto localmente, é esperado ter instalado:

- Node.js;
- npm;
- Docker Desktop.

## Arquivos principais

```text
infra/
├─ compose.infra.local.yaml
└─ compose.infra.dockerized.yaml

Dockerfile.control-api
Dockerfile.dispatch-worker
.env.example
.env.docker.example
```

## Modo 1: aplicação local com infraestrutura no Docker

Use este modo durante o desenvolvimento diário.

Nesse cenário, o Docker sobe apenas:

- PostgreSQL;
- Redis;
- Mailpit.

A Control API e o Dispatch Worker rodam fora do Docker, com Node.js, usando os scripts do monorepo.

### Subir a infraestrutura

Na raiz do projeto:

```bash
docker compose -f infra/compose.infra.local.yaml up -d
```

### Criar o `.env`

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Valores típicos para esse modo:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=email_marketing
POSTGRES_USER=email_marketing
POSTGRES_PASSWORD=email_marketing

REDIS_HOST=localhost
REDIS_PORT=6380

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=Email Marketing Dev
SMTP_FROM_EMAIL=no-reply@email-marketing.local

SMTP_SENDER_ENCRYPTION_KEY=change-this-secret-key-with-at-least-32-chars
```

### Rodar a aplicação

```bash
npm run dev
```

Esse comando executa a Control API e o Dispatch Worker localmente.

## Modo 2: stack completa dockerizada

Use este modo quando quiser validar a aplicação inteira dentro do Docker.

Nesse cenário, o Docker sobe:

- PostgreSQL;
- Redis;
- Mailpit;
- Control API;
- Dispatch Worker.

### Criar o `.env.docker`

No Windows PowerShell:

```powershell
Copy-Item .env.docker.example .env.docker
```

Valores típicos para esse modo:

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=email_marketing
POSTGRES_USER=email_marketing
POSTGRES_PASSWORD=email_marketing

REDIS_HOST=redis
REDIS_PORT=6379

SMTP_HOST=mailpit
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=Email Marketing Dev
SMTP_FROM_EMAIL=no-reply@email-marketing.local

CORS_ORIGINS=http://localhost:3000,http://localhost:5173
SMTP_SENDER_ENCRYPTION_KEY=change-this-docker-key-with-at-least-32-chars
```

### Subir a stack completa

Na raiz do projeto:

```bash
docker compose -f infra/compose.infra.dockerized.yaml up --build
```

Para subir em segundo plano:

```bash
docker compose -f infra/compose.infra.dockerized.yaml up -d --build
```

## Portas padrão

Quando os serviços são publicados no host, os acessos locais esperados são:

| Serviço         | Acesso no host                        | Acesso dentro do Docker          |
| --------------- | ------------------------------------- | -------------------------------- |
| Control API     | `http://localhost:3333`               | `control-api:3333`               |
| Swagger/OpenAPI | `http://localhost:3333/documentation` | `control-api:3333/documentation` |
| PostgreSQL      | `localhost:5433`                      | `postgres:5432`                  |
| Redis           | `localhost:6380`                      | `redis:6379`                     |
| Mailpit SMTP    | `localhost:1025`                      | `mailpit:1025`                   |
| Mailpit Web UI  | `http://localhost:8025`               | `mailpit:8025`                   |

## Observação sobre portas

As portas publicadas no host podem ser ajustadas caso exista conflito com outros serviços da máquina.

Exemplo:

```yaml
ports:
  - "5434:5432"
```

Nesse caso, apenas o acesso externo muda para `localhost:5434`. Dentro do Docker, a aplicação continua usando `postgres:5432`.

## Mailpit

O Mailpit é o servidor SMTP local de desenvolvimento usado para capturar os e-mails enviados pela aplicação.

Interface web:

```text
http://localhost:8025
```

### SMTP Sender local

Para campaigns de desenvolvimento, cadastre um SMTP Sender apontando para o Mailpit.

Se API e worker estiverem rodando fora do Docker:

```json
{
  "name": "Mailpit Local",
  "fromName": "Email Marketing Dev",
  "fromEmail": "dev@email-marketing.local",
  "replyToEmail": null,
  "host": "localhost",
  "port": 1025,
  "secure": false,
  "username": null,
  "password": null,
  "isActive": true
}
```

Se API e worker estiverem rodando dentro do Docker:

```json
{
  "name": "Mailpit Docker",
  "fromName": "Email Marketing Dev",
  "fromEmail": "dev@email-marketing.local",
  "replyToEmail": null,
  "host": "mailpit",
  "port": 1025,
  "secure": false,
  "username": null,
  "password": null,
  "isActive": true
}
```

## Configuração geral do sistema

Além do `.env` ou `.env.docker`, o projeto possui um arquivo JSON com configurações default unificadas:

```text
config/system.config.json
```

Esse arquivo deve estar presente também na imagem final Docker, pois a API e o worker dependem dele em runtime.

## Integração com CNPJ API

Para usar o lead source `cnpj-api`, configure:

- `CNPJ_API_BASE_URL`;
- `CNPJ_API_TOKEN` opcional;
- `CNPJ_API_TIMEOUT_MS`.

Se a Control API estiver rodando dentro do Docker e a CNPJ API estiver rodando na máquina host, use:

```env
CNPJ_API_BASE_URL=http://host.docker.internal:3000
```

Se tudo estiver rodando fora do Docker, use:

```env
CNPJ_API_BASE_URL=http://localhost:3000
```

## Scripts úteis

Consulte também:

- [Scripts do projeto](../conventions/scripts.md)
- [Docker e infraestrutura local](./docker.md)
- [Migrations](../database/migrations.md)

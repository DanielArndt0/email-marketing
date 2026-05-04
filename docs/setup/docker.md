# Docker e infraestrutura local

Este documento explica como a infraestrutura local do projeto é organizada com Docker Compose.

## Objetivo

O projeto possui dois arquivos Compose principais dentro da pasta `infra/`:

```text
infra/
├─ compose.infra.local.yaml
└─ compose.infra-dockerized.yaml
```

Eles atendem a dois fluxos diferentes de desenvolvimento.

## Quando usar cada arquivo

| Arquivo                               | Sobe quais serviços                                       | Quando usar                                                     |
| ------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| `infra/compose.infra.local.yaml`      | PostgreSQL, Redis e Mailpit                               | Desenvolvimento com API e worker rodando localmente via Node.js |
| `infra/compose.infra-dockerized.yaml` | PostgreSQL, Redis, Mailpit, Control API e Dispatch Worker | Teste da stack completa dentro do Docker                        |

## Dockerfiles

Os Dockerfiles ficam na raiz do repositório:

```text
Dockerfile.control-api
Dockerfile.dispatch-worker
```

Eles ficam na raiz porque o build precisa acessar o monorepo inteiro:

```text
apps/control-api
apps/dispatch-worker
packages/core
packages/shared
config/system.config.json
package.json
package-lock.json
```

A pasta `infra/` concentra a orquestração local, mas não deve esconder os Dockerfiles, porque isso dificultaria o contexto de build do monorepo.

## Modo 1: infra local com aplicação fora do Docker

Este modo sobe somente a infraestrutura:

```text
PostgreSQL
Redis
Mailpit
```

A aplicação roda fora do Docker:

```bash
npm run dev
```

### Subir

```bash
docker compose -f infra/compose.infra.local.yaml up -d
```

### Ver status

```bash
docker compose -f infra/compose.infra.local.yaml ps
```

### Ver logs

```bash
docker compose -f infra/compose.infra.local.yaml logs -f
```

### Parar

```bash
docker compose -f infra/compose.infra.local.yaml down
```

### Parar e apagar volumes

Use apenas quando quiser apagar os dados locais do banco e recriar tudo do zero:

```bash
docker compose -f infra/compose.infra.local.yaml down -v
```

## Modo 2: stack completa dockerizada

Este modo sobe a aplicação inteira em containers:

```text
PostgreSQL
Redis
Mailpit
Control API
Dispatch Worker
```

### Subir com build

```bash
docker compose -f infra/compose.infra-dockerized.yaml up --build
```

### Subir em segundo plano

```bash
docker compose -f infra/compose.infra-dockerized.yaml up -d --build
```

### Ver logs

```bash
docker compose -f infra/compose.infra-dockerized.yaml logs -f
```

Para ver logs de um serviço específico:

```bash
docker compose -f infra/compose.infra-dockerized.yaml logs -f control-api
```

```bash
docker compose -f infra/compose.infra-dockerized.yaml logs -f dispatch-worker
```

### Parar

```bash
docker compose -f infra/compose.infra-dockerized.yaml down
```

### Parar e apagar volumes

```bash
docker compose -f infra/compose.infra-dockerized.yaml down -v
```

## Diferença entre `.env` e `.env.docker`

O `.env` é usado quando a aplicação roda diretamente na máquina.

O `.env.docker` é usado quando a Control API e o Dispatch Worker rodam dentro do Docker.

### Aplicação fora do Docker

Quando a aplicação está fora do Docker, ela acessa os serviços pelas portas publicadas no host:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
REDIS_HOST=localhost
REDIS_PORT=6380
SMTP_HOST=localhost
SMTP_PORT=1025
```

### Aplicação dentro do Docker

Quando a aplicação está dentro do Docker, ela acessa os serviços pelo nome interno do Compose:

```env
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
SMTP_HOST=mailpit
SMTP_PORT=1025
```

A porta da esquerda em `ports` é a porta do host. A porta da direita é a porta interna do container.

Exemplo:

```yaml
ports:
  - "5433:5432"
```

Isso significa:

```text
localhost:5433 → postgres:5432
```

Entre containers, a aplicação usa diretamente:

```text
postgres:5432
```

## CORS com front-end local

CORS deve liberar a origem do navegador, não o endereço interno do Docker.

Se o front-end roda localmente em Vite ou Next.js, configure no `.env.docker`:

```env
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

Exemplos comuns:

```text
Next.js → http://localhost:3000
Vite    → http://localhost:5173
```

O front-end local deve chamar a API pela porta publicada no host:

```env
VITE_API_BASE_URL=http://localhost:3333
```

ou:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333
```

Não use `control-api:3333` no front-end local, porque esse nome só existe dentro da rede Docker.

## Quando usar `host.docker.internal`

Use `host.docker.internal` quando um container precisar acessar um serviço que está rodando na máquina host.

Exemplo: a Control API dockerizada acessando a CNPJ API local fora do Docker.

```env
CNPJ_API_BASE_URL=http://host.docker.internal:3000
```

Não use `host.docker.internal` para CORS.

## Inicialização automática do banco

A imagem oficial do Postgres executa scripts SQL colocados no caminho interno:

```text
/docker-entrypoint-initdb.d
```

Como os arquivos Compose ficam dentro de `infra/`, o volume deve usar `../` para apontar para a pasta real do projeto:

```yaml
volumes:
  - email_marketing_pgdata:/var/lib/postgresql/data
  - ../docker/postgres/migrations:/docker-entrypoint-initdb.d:ro
```

A pasta local pode se chamar `docker/postgres/migrations` ou `docker/postgres/init`. O nome especial `/docker-entrypoint-initdb.d` existe dentro do container.

Os arquivos são executados em ordem alfabética. Por isso o padrão numérico é recomendado:

```text
docker/postgres/migrations/
├─ 001_initial_schema.sql
├─ 002_create_templates_table.sql
├─ 003_link_templates_to_email_dispatches.sql
└─ ...
```

### Importante

Esses scripts rodam apenas na primeira criação do volume do Postgres.

Se o volume já existir, o Postgres exibirá algo parecido com:

```text
PostgreSQL Database directory appears to contain a database; Skipping initialization
```

Nesse caso, os scripts não são reaplicados automaticamente.

Para recriar o banco local do zero:

```bash
docker compose -f infra/compose.infra-dockerized.yaml down -v
docker compose -f infra/compose.infra-dockerized.yaml up --build
```

## Rodar migrations manualmente

Se o banco já existe e você não quer apagar o volume, rode as migrations manualmente.

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

## `build`, `up` e `up --build`

### `docker compose build`

Constrói as imagens, mas não inicia os containers.

```bash
docker compose -f infra/compose.infra-dockerized.yaml build
```

### `docker compose up`

Cria e inicia os containers.

```bash
docker compose -f infra/compose.infra-dockerized.yaml up
```

### `docker compose up --build`

Reconstrói as imagens e inicia os containers.

```bash
docker compose -f infra/compose.infra-dockerized.yaml up --build
```

Use quando alterar:

- Dockerfile;
- `package.json`;
- `package-lock.json`;
- código TypeScript;
- `config/system.config.json`;
- dependências.

### Recriar containers após mudar `.env.docker`

Se você mudou apenas variáveis de ambiente, normalmente não precisa reconstruir a imagem.

Use:

```bash
docker compose -f infra/compose.infra-dockerized.yaml up -d --force-recreate
```

## Acessos locais

Com a stack dockerizada completa, os acessos padrão são:

| Serviço         | URL/Host                              |
| --------------- | ------------------------------------- |
| Control API     | `http://localhost:3333`               |
| Swagger/OpenAPI | `http://localhost:3333/documentation` |
| Mailpit Web     | `http://localhost:8025`               |
| PostgreSQL      | `localhost:5433`                      |
| Redis           | `localhost:6380`                      |

Dentro da rede Docker:

| Serviço     | Host interno       |
| ----------- | ------------------ |
| PostgreSQL  | `postgres:5432`    |
| Redis       | `redis:6379`       |
| Mailpit     | `mailpit:1025`     |
| Control API | `control-api:3333` |

## Observações de produção

Os arquivos Compose documentados aqui são voltados para desenvolvimento e validação local.

Para produção, a tendência é usar imagens publicadas em um registry, como GHCR, por exemplo:

```yaml
services:
  control-api:
    image: ghcr.io/danielarndt0/email-marketing-control-api:latest

  dispatch-worker:
    image: ghcr.io/danielarndt0/email-marketing-dispatch-worker:latest
```

Nesse cenário, o Compose de produção pode ficar no servidor ou em um repositório privado de infraestrutura, junto com variáveis reais e segredos.

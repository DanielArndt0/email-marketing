# Desenvolvimento local

Este documento descreve a preparação básica do ambiente local do projeto.

## Pré-requisitos

Para executar o projeto localmente, é esperado ter instalado:

- Node.js
- npm
- Docker Desktop

## Serviços locais do projeto

O ambiente local atual utiliza containers para os serviços de infraestrutura:

- PostgreSQL
- Redis
- Mailpit

A subida desses serviços é feita pelo arquivo `infra/compose.yaml`.

## Portas padrão do ambiente local

Com a configuração atual do `compose.yaml`, os serviços ficam expostos assim:

- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`
- Mailpit SMTP: `localhost:1025`
- Mailpit Web UI: `localhost:8025`

## Observação sobre portas

A porta do PostgreSQL foi configurada como `5433` no host para evitar conflito com instalações locais de PostgreSQL já rodando na máquina.

Essa escolha permite coexistência entre:

- PostgreSQL local da máquina
- PostgreSQL dockerizado do projeto

Se houver conflito com Redis ou outros serviços no seu ambiente, o mesmo princípio pode ser aplicado ajustando a porta publicada no `compose.yaml` e refletindo o valor no `.env`.

## Variáveis de ambiente

Antes de executar o projeto, crie um arquivo `.env` na raiz do repositório com base no arquivo `.env.example`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois disso, ajuste os valores do `.env` conforme o seu ambiente local.

### Valores esperados no ambiente atual

Exemplo de referência para o setup local com Docker:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=email_marketing
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

REDIS_HOST=localhost
REDIS_PORT=6379

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_NAME=Mail Engine
SMTP_FROM_EMAIL=no-reply@example.com
```

## Configuração geral do sistema

Além do `.env`, o projeto possui um arquivo JSON com configurações default unificadas:

- `config/system.config.json`

Esse arquivo centraliza, neste momento:

- paginação default da API
- nomes de fila BullMQ
- nomes dos jobs da fila de dispatch
- texto fallback para envio de e-mail

A ideia é reduzir valores hard-coded espalhados e facilitar uma futura migração dessas configurações para persistência em banco.

## Subindo a infraestrutura local

Na raiz do projeto:

```bash
docker compose -f infra/compose.yaml up -d
```

Para verificar os containers:

```bash
docker compose -f infra/compose.yaml ps
```

Para parar os serviços:

```bash
docker compose -f infra/compose.yaml down
```

## Mailpit

O Mailpit é o servidor SMTP local de desenvolvimento usado para capturar os e-mails enviados pela aplicação.

### Portas do Mailpit

- SMTP: `1025`
- Interface web: `8025`

### Como usar

Depois de subir os containers, acesse:

```text
http://localhost:8025
```

A interface web do Mailpit permitirá visualizar os e-mails recebidos localmente sem enviar mensagens reais para a internet.

## Fluxo típico de desenvolvimento

Um fluxo local comum é:

1. subir os containers com Docker Compose
2. copiar `.env.example` para `.env`
3. rodar migrations
4. subir a API e o worker
5. testar os fluxos via Postman e Mailpit

## Scripts úteis

Consulte também:

- [Scripts do projeto](../conventions/scripts.md)

## Observação final

Esta documentação deve evoluir junto com a arquitetura e o fluxo real do projeto.

## Integração com CNPJ API

Para usar o lead source `cnpj-api`, configure no `.env`:

- `CNPJ_API_BASE_URL`
- `CNPJ_API_TOKEN` (opcional)
- `CNPJ_API_TIMEOUT_MS`

Em ambiente local, a base costuma apontar para `http://localhost:3000`.

## Integração local com a CNPJ API

Quando o lead source `cnpj-api` estiver habilitado, a aplicação usa as rotas especializadas de prospecção da CNPJ API.

Campos comuns esperados nos filtros:

- `page`
- `limit`
- `uf` opcional
- `municipio` opcional, sempre com `uf`

Campo principal por modo:

- `mode: "cnae"` -> `codigosCnae`
- `mode: "razao-social"` -> `razaoSocial`
- `mode: "socio"` -> `nomeSocio`

# Endpoints da Control API

Este documento descreve os endpoints atualmente expostos pela `control-api`.

A API já possui documentação OpenAPI/Swagger em ambiente local em `/documentation`, mas este arquivo continua servindo como visão rápida dos contratos principais.

## Convenções gerais

### Formato

- A API trabalha com JSON.
- Os exemplos abaixo consideram `Content-Type: application/json`.

### Respostas

- `200 OK`: consulta realizada com sucesso.
- `201 Created`: recurso criado com sucesso.
- `202 Accepted`: operação aceita para processamento assíncrono.
- `404 Not Found`: recurso não encontrado.
- `409 Conflict`: operação inválida para o estado atual do recurso.
- `500 Internal Server Error`: erro interno inesperado.

---

## Health

### `GET /health`

Verifica o estado atual da API e das integrações principais.

---

## Campaigns

### `POST /campaigns`

Cria uma campanha em estado inicial, com template opcional e definição básica de audiência.

### `GET /campaigns`

Lista campanhas com paginação e filtro de status.

### `GET /campaigns/:id`

Consulta uma campanha específica por ID.

### `PATCH /campaigns/:id`

Atualiza parcialmente uma campanha.

### `GET /campaigns/:id/audience-preview`

Resolve e pré-visualiza os destinatários da audiência configurada na campanha.

Query params:

- `limit`: opcional

---

## Audiences

### `POST /audiences/resolve`

Resolve destinatários a partir de uma origem (`sourceType`) e um conjunto de filtros.

#### Exemplo de body

```json
{
  "sourceType": "manual-list",
  "filters": {
    "emails": ["teste@example.com", "contato@example.com"]
  },
  "limit": 20
}
```

`sourceType` atualmente suporta:

- `cnpj-api`
- `csv-import`
- `manual-list`

---

## Email Dispatches

### `POST /campaigns/email-dispatch`

Cria um dispatch de e-mail, persiste o envio e enfileira o processamento assíncrono.

### `GET /email-dispatches`

Lista dispatches com filtros básicos e paginação.

### `GET /email-dispatches/:id`

Consulta um dispatch específico por ID.

### `POST /email-dispatches/:id/retry`

Reenfileira um dispatch com status `error`.

---

## Templates

### `POST /templates`

Cria um template.

### `GET /templates`

Lista templates com paginação.

### `GET /templates/:id`

Consulta um template por ID.

### `PATCH /templates/:id`

Atualiza parcialmente um template.

### `DELETE /templates/:id`

Exclui um template quando não houver dispatches vinculados.

---

## Observação final

Este documento descreve o estado atual dos endpoints conhecidos da `control-api`.

Sempre que novos endpoints forem adicionados, alterados ou removidos, este arquivo deve ser atualizado.

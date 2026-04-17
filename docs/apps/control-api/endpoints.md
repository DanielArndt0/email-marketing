# Endpoints da Control API

Este documento descreve os endpoints atualmente expostos pela `control-api`.

Enquanto a aplicação ainda não possui documentação OpenAPI/Swagger, este arquivo serve como referência manual de uso da API.

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

#### Exemplo de chamada

```http
GET /health
```

#### Resposta esperada

```json
{
  "status": "ok",
  "service": "control-api",
  "environment": "development",
  "timestamp": "2026-04-17T00:00:00.000Z",
  "checks": {
    "postgres": {
      "status": "ok"
    },
    "redis": {
      "status": "ok"
    }
  }
}
```

---

## Email Dispatches

### `POST /campaigns/email-dispatch`

Cria um dispatch de e-mail, persiste o envio e enfileira o processamento assíncrono.

#### Body

##### Opção 1: usando template

```json
{
  "campaignId": "campaign-vars-001",
  "campaignName": "Campanha com variáveis",
  "contactId": "contact-vars-001",
  "to": "teste@example.com",
  "templateId": "ID_DO_TEMPLATE",
  "templateVariables": {
    "name": "Daniel",
    "company": "Open Enterprise S.A",
    "link": "https://exemplo.com/oferta"
  }
}
```

##### Opção 2: conteúdo direto

```json
{
  "campaignId": "campaign-direct-001",
  "campaignName": "Campanha sem template",
  "contactId": "contact-direct-001",
  "to": "teste@example.com",
  "subject": "Assunto direto",
  "htmlContent": "<h1>Mensagem direta</h1><p>Conteúdo HTML enviado sem template.</p>",
  "textContent": "Mensagem direta\nConteúdo enviado sem template."
}
```

#### Campos

- `campaignId`: obrigatório
- `campaignName`: obrigatório
- `contactId`: obrigatório
- `to`: obrigatório
- `templateId`: opcional
- `templateVariables`: opcional
- `subject`: obrigatório quando `templateId` não for informado
- `htmlContent`: opcional, mas necessário junto com `textContent` quando não houver `templateId`
- `textContent`: opcional, mas necessário junto com `htmlContent` quando não houver `templateId`

#### Resposta esperada

```json
{
  "status": "accepted",
  "dispatchId": "DISPATCH_ID",
  "jobId": "1",
  "queueName": "email-dispatch"
}
```

---

### `GET /email-dispatches`

Lista dispatches com filtros básicos e paginação.

#### Query params

- `campaignId`: opcional
- `contactId`: opcional
- `status`: opcional (`pending`, `queued`, `processing`, `sent`, `error`)
- `page`: opcional
- `pageSize`: opcional

#### Exemplo

```http
GET /email-dispatches?status=sent&page=1&pageSize=10
```

#### Resposta esperada

```json
{
  "items": [],
  "page": 1,
  "pageSize": 10,
  "total": 0,
  "totalPages": 0
}
```

---

### `GET /email-dispatches/:id`

Consulta um dispatch específico por ID.

#### Exemplo

```http
GET /email-dispatches/SEU_ID
```

#### Resposta esperada

```json
{
  "id": "SEU_ID",
  "campaignId": "campaign-001",
  "contactId": "contact-001",
  "templateId": "template-001",
  "templateVariables": {
    "name": "Daniel"
  },
  "recipientEmail": "teste@example.com",
  "subject": "Olá, Daniel",
  "htmlContent": "<h1>Olá, Daniel</h1>",
  "textContent": "Olá, Daniel",
  "status": "sent",
  "providerMessageId": "MESSAGE_ID",
  "errorMessage": null,
  "createdAt": "2026-04-17T00:00:00.000Z",
  "sentAt": "2026-04-17T00:00:10.000Z"
}
```

---

### `POST /email-dispatches/:id/retry`

Reenfileira um dispatch com status `error`.

#### Exemplo

```http
POST /email-dispatches/SEU_ID/retry
```

#### Resposta esperada

```json
{
  "status": "accepted",
  "dispatchId": "SEU_ID",
  "jobId": "2",
  "queueName": "email-dispatch"
}
```

#### Observação

Este endpoint só permite retry quando o dispatch estiver com status `error`.

---

## Templates

### `POST /templates`

Cria um template.

#### Body

```json
{
  "name": "Template com variáveis",
  "subject": "Olá, {{name}}",
  "htmlContent": "<h1>Olá, {{name}}</h1><p>Sua empresa é {{company}}</p>",
  "textContent": "Olá, {{name}}\nSua empresa é {{company}}"
}
```

#### Observação

É necessário informar pelo menos um entre:

- `htmlContent`
- `textContent`

---

### `GET /templates`

Lista templates com paginação.

#### Query params

- `page`: opcional
- `pageSize`: opcional

#### Exemplo

```http
GET /templates?page=1&pageSize=10
```

---

### `GET /templates/:id`

Consulta um template por ID.

#### Exemplo

```http
GET /templates/SEU_ID
```

---

### `PATCH /templates/:id`

Atualiza parcialmente um template.

#### Exemplo de body

```json
{
  "subject": "Novo assunto com {{name}}",
  "htmlContent": "<h1>Olá, {{name}}</h1><p>Conteúdo atualizado.</p>"
}
```

#### Observações

- a atualização é parcial;
- `htmlContent` pode ser `null`;
- `textContent` pode ser `null`;
- não é permitido deixar `htmlContent` e `textContent` nulos ao mesmo tempo.

---

### `DELETE /templates/:id`

Exclui um template.

#### Observação

A exclusão só é permitida quando não houver `email_dispatches` vinculados ao template.

#### Respostas possíveis

##### Sucesso

```json
{
  "status": "deleted",
  "id": "ID_DO_TEMPLATE"
}
```

##### Template em uso

```json
{
  "message": "O template não pode ser excluído porque já possui email dispatches vinculados.",
  "dispatchesCount": 1
}
```

---

## Observação final

Este documento descreve o estado atual dos endpoints conhecidos da `control-api`.

Sempre que novos endpoints forem adicionados, alterados ou removidos, este arquivo deve ser atualizado.

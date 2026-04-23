# Endpoints da Control API

## Audiences

### `POST /audiences`

Cria uma audience persistida.

Exemplo:

```json
{
  "name": "Empresas PR por CNAE",
  "description": "Audience baseada na CNPJ API.",
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "cnae",
    "codigosCnae": ["6201501", "6202300"],
    "uf": "PR",
    "municipio": "Londrina"
  }
}
```

### `GET /audiences`

Lista audiences cadastradas.

### `GET /audiences/:id`

Consulta uma audience por id.

### `PATCH /audiences/:id`

Atualiza parcialmente uma audience.

### `DELETE /audiences/:id`

Exclui uma audience sem vínculo com campaigns.

### `POST /audiences/resolve`

Resolve destinatários diretamente por `sourceType` e `filters`.

Exemplo CNPJ API:

```json
{
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "cnae",
    "codigosCnae": ["6201501"],
    "uf": "PR",
    "municipio": "Londrina"
  },
  "limit": 20
}
```

Exemplo manual-list:

```json
{
  "sourceType": "manual-list",
  "filters": {
    "recipients": [
      { "email": "contato@empresa.com", "externalId": "manual-001" },
      { "email": "financeiro@empresa.com" }
    ]
  },
  "limit": 20
}
```

Exemplo csv-import:

```json
{
  "sourceType": "csv-import",
  "filters": {
    "csvContent": "email,nome\ncontato@empresa.com,Empresa A",
    "emailColumn": "email",
    "delimiter": ","
  },
  "limit": 20
}
```

### `GET /audiences/:id/preview`

Resolve destinatários a partir de uma audience persistida.

## Campaigns

### `POST /campaigns`

Cria uma campaign.

Exemplo:

```json
{
  "name": "Campanha de expansão PR",
  "goal": "Prospectar empresas de tecnologia",
  "status": "draft",
  "templateId": null,
  "audienceId": "ID_DA_AUDIENCE",
  "scheduleAt": null
}
```

### `GET /campaigns`

Lista campaigns.

### `GET /campaigns/:id`

Consulta uma campaign por id.

### `PATCH /campaigns/:id`

Atualiza parcialmente uma campaign.

### `GET /campaigns/:id/audience-preview`

Resolve a audience atualmente vinculada à campaign.

## Observação sobre CNPJ API

O adapter `cnpj-api` foi alinhado às rotas de prospecção documentadas no repositório da CNPJ API:

- `GET /api/listas/empresas/cnae`
- `GET /api/listas/empresas/razaosocial`
- `GET /api/listas/empresas/socio`

Essas rotas aceitam paginação por `page` e `limit`, retornam apenas estabelecimentos ativos e exigem `uf` quando `municipio` é informado. citeturn447502view0turn447502view4

# Endpoints da Control API

Este documento descreve os endpoints principais da `control-api` no estado atual do projeto.

## Audiences

### `POST /audiences`

Cria uma audience persistida e reutilizável.

A audience guarda a origem dos leads (`sourceType`) e os filtros necessários para resolver destinatários depois. Quando uma campaign usa uma audience, ela deve apenas referenciar o `audienceId`.

#### Exemplo com CNPJ API por CNAE

```json
{
  "name": "Empresas PR por CNAE",
  "description": "Audience baseada na CNPJ API.",
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "cnae",
    "codigosCnae": ["6201501", "6202300"],
    "uf": "PR",
    "municipio": "Londrina",
    "page": 1,
    "limit": 20
  }
}
```

#### Exemplo com CNPJ API por razão social

```json
{
  "name": "Empresas por razão social",
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "razao-social",
    "razaoSocial": "tecnologia",
    "uf": "PR",
    "page": 1,
    "limit": 20
  }
}
```

#### Exemplo com CNPJ API por sócio

```json
{
  "name": "Empresas por sócio",
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "socio",
    "nomeSocio": "JOSE",
    "uf": "PR",
    "page": 1,
    "limit": 20
  }
}
```

#### Observações para `cnpj-api`

- `searchType` pode ser `cnae`, `razao-social` ou `socio`.
- `mode` também é aceito como alias de `searchType`.
- `page` e `limit` devem ficar dentro de `filters` quando a audience for persistida.
- `municipio` exige `uf`.
- `cnae` exige `codigosCnae`.
- `razao-social` exige `razaoSocial`.
- `socio` exige `nomeSocio`.

---

### `GET /audiences`

Lista audiences cadastradas.

---

### `GET /audiences/:id`

Consulta uma audience por ID.

---

### `PATCH /audiences/:id`

Atualiza parcialmente uma audience.

---

### `DELETE /audiences/:id`

Exclui uma audience sem vínculo com campaigns.

Se a audience estiver vinculada a uma campaign, a API deve retornar conflito.

---

### `POST /audiences/resolve`

Resolve destinatários diretamente por `sourceType` e `filters`, sem precisar salvar uma audience antes.

Esse endpoint é útil para testar filtros e validar integrações.

#### Exemplo CNPJ API

```json
{
  "sourceType": "cnpj-api",
  "filters": {
    "searchType": "cnae",
    "codigosCnae": ["6201501"],
    "uf": "PR",
    "municipio": "Londrina",
    "page": 1,
    "limit": 20
  }
}
```

#### Exemplo manual-list

```json
{
  "sourceType": "manual-list",
  "filters": {
    "recipients": [
      { "email": "contato@empresa.com", "externalId": "manual-001" },
      { "email": "financeiro@empresa.com" }
    ],
    "limit": 20
  }
}
```

#### Exemplo csv-import

```json
{
  "sourceType": "csv-import",
  "filters": {
    "csvContent": "email,nome\ncontato@empresa.com,Empresa A",
    "emailColumn": "email",
    "delimiter": ",",
    "limit": 20
  }
}
```

---

### `GET /audiences/:id/preview`

Resolve destinatários a partir de uma audience persistida.

Este endpoint usa os filtros já salvos na própria audience. Portanto, `page` e `limit` não são query params do preview; eles devem estar dentro de `filters` na audience persistida.

---

## Campaigns

### `POST /campaigns`

Cria uma campaign.

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

---

### `GET /campaigns`

Lista campaigns.

---

### `GET /campaigns/:id`

Consulta uma campaign por ID.

---

### `PATCH /campaigns/:id`

Atualiza parcialmente uma campaign.

---

### `DELETE /campaigns/:id`

Exclui uma campaign.

A exclusão só é permitida quando a campaign não possui email dispatches vinculados.

---

### `GET /campaigns/:id/audience-preview`

Resolve a audience atualmente vinculada à campaign.

Assim como `GET /audiences/:id/preview`, este endpoint usa os filtros persistidos na audience vinculada à campaign.

---

### `POST /campaigns/:id/dispatch`

Cria e enfileira email dispatches para uma campaign específica.

O campo `limit` é opcional. Se omitido, a resolução usa a configuração da própria audience/fonte.

#### Exemplo

```json
{
  "limit": 50
}
```

---

### `POST /campaigns/dispatch/batch`

Cria e enfileira dispatches para múltiplas campaigns.

```json
{
  "campaignIds": ["campaign-001", "campaign-002"],
  "limitPerCampaign": 50
}
```

---

## Observação sobre CNPJ API

O adapter `cnpj-api` usa as rotas especializadas de prospecção da CNPJ API:

- `GET /api/listas/empresas/cnae`
- `GET /api/listas/empresas/razaosocial`
- `GET /api/listas/empresas/socio`

Essas rotas trabalham com query string, não com body. Por isso, o provider monta a URL final com `page`, `limit`, `uf`, `municipio` e o campo principal de cada modo.

---

## Domains

Os endpoints de `domains` funcionam como proxy controlado para tabelas auxiliares da CNPJ API usadas pelo front-end em filtros, selects e autocompletes.

A Control API não persiste esses domínios localmente neste momento. Ela consulta a CNPJ API usando `CNPJ_API_BASE_URL` e retorna uma resposta padronizada com `code` e `description`.

### `GET /domains/cnpj-api/cnaes`

Lista CNAEs da CNPJ API.

#### Query params

- `page`: opcional, padrão `1`.
- `limit`: opcional, padrão `20`, máximo `100`.
- `q`: opcional, busca textual leve.
- `code`: opcional, código exato quando suportado pela CNPJ API.

#### Exemplo

```http
GET /domains/cnpj-api/cnaes?page=1&limit=20&q=software
```

#### Resposta

```json
{
  "domain": "cnaes",
  "page": 1,
  "limit": 20,
  "count": 1,
  "hasNextPage": false,
  "items": [
    {
      "code": "6201501",
      "description": "Desenvolvimento de programas de computador sob encomenda"
    }
  ]
}
```

---

### `GET /domains/cnpj-api/cities`

Lista cidades da CNPJ API.

#### Query params

- `page`: opcional, padrão `1`.
- `limit`: opcional, padrão `20`, máximo `100`.
- `q`: opcional, busca textual leve.
- `code`: opcional, código exato quando suportado pela CNPJ API.

#### Exemplo

```http
GET /domains/cnpj-api/cities?page=1&limit=20&q=londrina
```

#### Resposta

```json
{
  "domain": "cities",
  "page": 1,
  "limit": 20,
  "count": 1,
  "hasNextPage": false,
  "items": [
    {
      "code": "4113700",
      "description": "Londrina"
    }
  ]
}
```

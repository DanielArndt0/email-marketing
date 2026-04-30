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

## SMTP Senders

Os SMTP Senders representam os remetentes disponíveis para envio de campanhas.

Cada sender contém os dados necessários para conexão SMTP, além das informações públicas do remetente que aparecerão no e-mail enviado.

### Campos principais

| Campo            | Descrição                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------- |
| `id`             | Identificador único do SMTP sender.                                                         |
| `name`           | Nome interno para identificação do sender no sistema.                                       |
| `fromName`       | Nome exibido como remetente do e-mail.                                                      |
| `fromEmail`      | E-mail exibido como remetente.                                                              |
| `replyToEmail`   | E-mail opcional para receber respostas dos destinatários.                                   |
| `host`           | Host SMTP.                                                                                  |
| `port`           | Porta SMTP.                                                                                 |
| `secure`         | Define se a conexão usa TLS direto. Geralmente `false` para porta `587` ou MailPit local.   |
| `username`       | Usuário SMTP. Pode ser `null` em ambientes sem autenticação, como MailPit.                  |
| `password`       | Senha recebida apenas em criação/atualização. É armazenada criptografada e nunca retornada. |
| `isActive`       | Define se o sender está disponível para uso em campanhas.                                   |
| `lastTestedAt`   | Data do último teste do sender.                                                             |
| `lastTestStatus` | Resultado do último teste: `success` ou `error`.                                            |
| `lastTestError`  | Mensagem do erro do último teste, se houver.                                                |

---

### `GET /smtp-senders`

Lista SMTP Senders cadastrados.

#### Query params

| Parâmetro  |    Tipo | Obrigatório | Descrição                            |
| ---------- | ------: | ----------: | ------------------------------------ |
| `page`     | integer |         Não | Página da listagem. Padrão: `1`.     |
| `pageSize` | integer |         Não | Quantidade por página. Padrão: `20`. |
| `isActive` | boolean |         Não | Filtra senders ativos ou inativos.   |

#### Exemplo

```http
GET /smtp-senders?page=1&pageSize=20&isActive=true
```

#### Resposta `200`

```json
{
  "items": [
    {
      "id": "a1f8c3f1-0000-4000-9000-000000000001",
      "name": "MailPit Local",
      "fromName": "Email Marketing Dev",
      "fromEmail": "dev@email-marketing.local",
      "replyToEmail": null,
      "host": "mailpit",
      "port": 1025,
      "secure": false,
      "username": null,
      "isActive": true,
      "lastTestedAt": null,
      "lastTestStatus": null,
      "lastTestError": null,
      "createdAt": "2026-04-29T12:00:00.000Z",
      "updatedAt": "2026-04-29T12:00:00.000Z"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1,
  "totalPages": 1
}
```

---

### `GET /smtp-senders/:id`

Consulta um SMTP Sender específico.

#### Resposta `200`

```json
{
  "id": "a1f8c3f1-0000-4000-9000-000000000001",
  "name": "MailPit Local",
  "fromName": "Email Marketing Dev",
  "fromEmail": "dev@email-marketing.local",
  "replyToEmail": null,
  "host": "mailpit",
  "port": 1025,
  "secure": false,
  "username": null,
  "isActive": true,
  "lastTestedAt": null,
  "lastTestStatus": null,
  "lastTestError": null,
  "createdAt": "2026-04-29T12:00:00.000Z",
  "updatedAt": "2026-04-29T12:00:00.000Z"
}
```

#### Resposta `404`

```json
{
  "message": "SMTP sender não encontrado."
}
```

---

### `POST /smtp-senders`

Cria um novo SMTP Sender.

#### Body com SMTP real

```json
{
  "name": "Garbo Certificação Digital",
  "fromName": "Garbo Certificação Digital",
  "fromEmail": "contato@garbo.com.br",
  "replyToEmail": "atendimento@garbo.com.br",
  "host": "smtp.exemplo.com",
  "port": 587,
  "secure": false,
  "username": "contato@garbo.com.br",
  "password": "senha-ou-app-password",
  "isActive": true
}
```

#### Body para MailPit/local sem autenticação

```json
{
  "name": "MailPit Local",
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

#### Resposta `201`

Retorna o sender criado, sem expor a senha.

---

### `PATCH /smtp-senders/:id`

Atualiza parcialmente um SMTP Sender.

#### Body

```json
{
  "name": "Garbo - Produção",
  "fromName": "Garbo Certificação Digital",
  "replyToEmail": "suporte@garbo.com.br",
  "isActive": true
}
```

Para alterar senha:

```json
{
  "password": "nova-senha-ou-app-password"
}
```

Para remover autenticação SMTP:

```json
{
  "username": null,
  "password": null
}
```

#### Regras

- Se `password` for omitido, a senha atual é mantida.
- Se `password` for `null`, a senha é removida.
- Se `password` for string, ela é criptografada e substitui a anterior.

---

### `DELETE /smtp-senders/:id`

Remove um SMTP Sender quando ele não estiver vinculado a campaigns.

#### Resposta `200`

```json
{
  "status": "deleted",
  "id": "a1f8c3f1-0000-4000-9000-000000000001"
}
```

#### Resposta `409`

```json
{
  "message": "O SMTP sender não pode ser excluído porque possui campaigns vinculadas.",
  "campaignsCount": 2
}
```

---

### `POST /smtp-senders/:id/test`

Testa a conexão ou o envio de um SMTP Sender.

Se o body vier vazio, a API executa apenas a verificação de conexão SMTP.

```json
{}
```

Se `to` for informado, a API envia um e-mail real de teste.

```json
{
  "to": "teste@exemplo.com"
}
```

#### Resposta `200` com sucesso

```json
{
  "status": "success",
  "message": "SMTP sender testado com sucesso.",
  "testedAt": "2026-04-29T12:00:00.000Z"
}
```

#### Resposta `200` com erro de teste

```json
{
  "status": "error",
  "message": "Authentication failed",
  "testedAt": "2026-04-29T12:00:00.000Z"
}
```

---

## Campaigns

### `POST /campaigns`

Cria uma campaign.

A campaign pode nascer em `draft`, mas para disparo ela precisa ter template, audience, SMTP Sender e mappings configurados.

```json
{
  "name": "Campanha Garbo Certificação Digital",
  "goal": "Gerar leads para certificado digital",
  "status": "draft",
  "templateId": "template-id",
  "audienceId": "audience-id",
  "smtpSenderId": "smtp-sender-id",
  "templateVariableMappings": {
    "company": {
      "source": "lead",
      "path": "metadata.razaoSocial"
    },
    "email": {
      "source": "lead",
      "path": "email"
    }
  },
  "scheduleAt": null
}
```

No retorno, a API também pode incluir o resumo do SMTP Sender vinculado:

```json
{
  "smtpSenderId": "smtp-sender-id",
  "smtpSender": {
    "id": "smtp-sender-id",
    "name": "Garbo Certificação Digital",
    "fromName": "Garbo Certificação Digital",
    "fromEmail": "contato@garbo.com.br",
    "replyToEmail": "atendimento@garbo.com.br",
    "isActive": true
  }
}
```

---

### `GET /campaigns`

Lista campaigns.

Cada item pode retornar dados resumidos de `template`, `audience` e `smtpSender` quando esses vínculos existirem.

---

### `GET /campaigns/:id`

Consulta uma campaign por ID.

A resposta inclui `smtpSenderId` e o objeto resumido `smtpSender`, quando a campaign possuir remetente vinculado.

---

### `PATCH /campaigns/:id`

Atualiza parcialmente uma campaign.

O campo `smtpSenderId` pode ser enviado para trocar o remetente da campaign.

```json
{
  "smtpSenderId": "smtp-sender-id"
}
```

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

Antes de criar os dispatches, a API valida se a campaign possui:

- template vinculado;
- audience vinculada;
- SMTP Sender vinculado;
- SMTP Sender ativo.

Quando os dispatches são criados, cada registro em `email_dispatches` recebe o `smtp_sender_id` da campaign. Isso garante rastreabilidade e evita que alterações futuras na campaign mudem o remetente dos envios já criados.

#### Exemplo

```json
{
  "limit": 50
}
```

#### Variáveis de template

Durante o dispatch da campaign, o backend usa `templateVariableMappings` da própria campaign para montar as variáveis finais do template.

Campos padrão do lead usam path direto, como `email` e `externalId`.

Campos específicos da fonte devem usar `metadata`, como `metadata.razaoSocial`, `metadata.municipio` ou `metadata.uf`.

Mais detalhes em [Template variables](../../templates/template-variables.md).

#### Resposta `409` quando a campaign não possui SMTP Sender

```json
{
  "message": "A campaign não possui SMTP sender vinculado."
}
```

#### Resposta `409` quando o SMTP Sender está inativo

```json
{
  "message": "O SMTP sender vinculado à campaign está inativo."
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

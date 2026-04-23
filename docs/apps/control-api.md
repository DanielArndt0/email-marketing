# Control API

A `control-api` é a aplicação HTTP responsável pela gestão operacional do sistema.

Atualmente, ela concentra:

- health check;
- templates;
- email dispatches;
- campaigns;
- audiences;
- preview de audiences por source type ou por campaign.

## Papel

A API serve como porta de entrada para:

- cadastrar templates;
- cadastrar audiences persistidas;
- vincular audiences a campaigns;
- consultar previews de destinatários antes da execução;
- registrar dispatches e enfileirar envios.

## Destaques atuais

### Audiences persistidas

As audiences agora são recursos próprios do sistema. Elas podem ser cadastradas separadamente e reutilizadas em campaigns.

### Campaigns vinculadas a audiences

Cada campaign pode apontar para uma audience específica por `audienceId`.

### Preview operacional

É possível gerar preview:

- diretamente via `POST /audiences/resolve`
- por audience persistida via `GET /audiences/:id/preview`
- pela audience vinculada a uma campaign via `GET /campaigns/:id/audience-preview`

## Lead sources suportados

No estado atual, o sistema possui adapters para:

- `cnpj-api`
- `csv-import`
- `manual-list`

## OpenAPI / Swagger

A documentação da API está disponível em:

- `/documentation`
- `/documentation/json`

## Endpoints

A referência operacional atual dos endpoints está em:

- [Endpoints da Control API](./control-api/endpoints.md)

# Control API

A `control-api` é a aplicação HTTP responsável pela gestão operacional do sistema.

Atualmente, ela concentra:

- health check;
- templates;
- email dispatches;
- campaigns;
- audiences;
- preview de audiences por source type ou por campaign;
- domínios externos da CNPJ API para filtros e autocompletes;
- SMTP Senders dinâmicos para escolha de remetente por campaign;
- gerenciamento robusto do ciclo de vida/status das campaigns.

## Papel

A API serve como porta de entrada para:

- cadastrar templates;
- cadastrar audiences persistidas;
- vincular audiences a campaigns;
- consultar previews de destinatários antes da execução;
- consultar domínios auxiliares da CNPJ API para apoiar o front-end;
- registrar dispatches e enfileirar envios;
- cadastrar e testar remetentes SMTP reutilizáveis;
- vincular um SMTP Sender específico a cada campaign;
- controlar transições de status das campaigns com regras centralizadas de domínio.

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

### Status das campaigns

O status das campaigns é controlado por regras centralizadas no `packages/core`. Isso evita que a API, o worker e os casos de uso alterem o ciclo de vida de formas divergentes.

A API diferencia transições manuais, feitas por operadores, de transições sistêmicas, feitas pelo fluxo de dispatch e pelo worker. Atualizações críticas usam transição condicional no banco para evitar sobrescrever mudanças concorrentes, como uma campaign pausada ou cancelada durante o processamento.

A referência detalhada está em [Gerenciamento de status das campaigns](./control-api/campaign-status-management.md).

### SMTP Senders

A API expõe um módulo para cadastrar múltiplos remetentes SMTP.

Cada SMTP Sender guarda os dados de conexão e os dados públicos do remetente, como `fromName`, `fromEmail` e `replyToEmail`.

As campaigns podem usar `smtpSenderId` para definir qual remetente será usado no disparo. O worker usa esse vínculo para enviar cada dispatch pelo SMTP correto.

A referência detalhada está em [SMTP Senders](./control-api/smtp-senders.md).

### Domínios da CNPJ API

A API expõe endpoints de apoio para consultar CNAEs e cidades da CNPJ API, retornando uma estrutura padronizada com `code` e `description` para uso no front-end.

## OpenAPI / Swagger

A documentação da API está disponível em:

- `/documentation`
- `/documentation/json`

## Endpoints

A referência operacional atual dos endpoints está em:

- [Endpoints da Control API](./control-api/endpoints.md)
- [Gerenciamento de status das campaigns](./control-api/campaign-status-management.md)

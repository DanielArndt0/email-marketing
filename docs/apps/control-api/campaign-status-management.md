# Gerenciamento de status das campaigns

O ciclo de vida de uma campaign é controlado por regras de domínio no pacote `core`. A API e o `dispatch-worker` devem usar essas regras em vez de alterar o status livremente.

## Status disponíveis

| Status      | Uso                                                            |
| ----------- | -------------------------------------------------------------- |
| `draft`     | Campaign em construção. Não pode ser disparada.                |
| `ready`     | Campaign configurada e liberada para disparo.                  |
| `scheduled` | Campaign preparada para execução agendada.                     |
| `running`   | Campaign com dispatches ativos ou recém-enfileirados.          |
| `paused`    | Campaign interrompida manualmente.                             |
| `completed` | Todos os dispatches terminaram sem erro.                       |
| `failed`    | A preparação falhou ou ao menos um dispatch terminou com erro. |
| `canceled`  | Campaign encerrada manualmente. Não deve ser reaberta.         |

## Transições manuais

As transições manuais são usadas pelo `PATCH /campaigns/:id` quando o corpo contém `status`.

| De          | Para                             |
| ----------- | -------------------------------- |
| `draft`     | `ready`, `scheduled`, `canceled` |
| `ready`     | `draft`, `scheduled`, `canceled` |
| `scheduled` | `ready`, `canceled`              |
| `running`   | `paused`, `canceled`             |
| `paused`    | `ready`, `running`, `canceled`   |
| `failed`    | `ready`, `canceled`              |
| `completed` | nenhuma transição manual         |
| `canceled`  | nenhuma transição                |

Quando a transição é inválida, a API retorna `409 Conflict` com `from`, `to` e `allowedTransitions`.

Além da transição, o domínio também valida a configuração mínima para estados operacionais. Uma campaign só pode ser criada ou permanecer como `ready`, `scheduled` ou `running` quando possui template, audience e SMTP Sender ativo.

## Transições sistêmicas

As transições sistêmicas são feitas pelo fluxo de disparo, pelo retry de dispatch e pelo worker.

Principais regras:

- `POST /campaigns/:id/dispatch` só aceita campaigns em `ready`, `scheduled` ou `failed`.
- Ao iniciar o dispatch, a campaign é movida para `running` com atualização de `last_execution_at`.
- Se nenhum dispatch for criado, a campaign vai para `failed`.
- O worker sincroniza o status após processar cada dispatch.
- Quando não existem mais dispatches ativos:
  - sem erros: `completed`;
  - com qualquer erro: `failed`.
- Retry de dispatch com erro reabre a campaign para `running`, exceto quando a campaign está `canceled` ou quando a transição sistêmica não é permitida.

## Arquivos principais

| Camada                    | Arquivo                                                                                               |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Domínio                   | `packages/core/src/campaign/campaign-status.ts`                                                       |
| Regras de transição       | `packages/core/src/campaign/campaign-status-rules.ts`                                                 |
| Update manual             | `apps/control-api/src/modules/campaigns/application/update-campaign.ts`                               |
| Dispatch por campaign     | `apps/control-api/src/modules/campaigns/application/dispatch-campaign.ts`                             |
| Sincronização na API      | `apps/control-api/src/modules/campaigns/application/sync-campaign-status-from-dispatches.ts`          |
| Sincronização no worker   | `apps/dispatch-worker/src/modules/email-dispatch/application/sync-campaign-status-from-dispatches.ts` |
| Persistência/concorrência | `apps/control-api/src/modules/campaigns/repositories/campaign-repository.ts`                          |

## Observação de concorrência

As alterações críticas usam atualização condicional por status esperado. Isso reduz o risco de um fluxo sobrescrever outro, por exemplo: dispatch iniciando enquanto alguém pausa ou cancela a campaign.

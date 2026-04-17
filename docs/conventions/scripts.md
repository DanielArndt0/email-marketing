# Scripts do projeto

Este documento descreve os scripts mais importantes do monorepo.

## Scripts da raiz

Os scripts da raiz servem para orquestrar os workspaces.

### `npm run dev`

Sobe, em paralelo, a API e o worker.

### `npm run dev:api`

Sobe apenas a `control-api` em modo de desenvolvimento.

### `npm run dev:worker`

Sobe apenas o `dispatch-worker` em modo de desenvolvimento.

### `npm run start`

Executa as versões compiladas dos apps principais em paralelo.

### `npm run start:api`

Executa a versão compilada da `control-api`.

### `npm run start:worker`

Executa a versão compilada do `dispatch-worker`.

### `npm run build`

Executa o build dos workspaces que possuem script `build`.

### `npm run typecheck`

Executa a checagem de tipos dos workspaces que possuem script `typecheck`.

### `npm run lint`

Executa o ESLint no projeto.

### `npm run format`

Formata os arquivos com Prettier.

### `npm run format:check`

Verifica formatação sem alterar os arquivos.

### `npm run clean`

Remove artefatos gerados, como diretórios `dist` dos workspaces.

## Scripts por workspace

### `apps/control-api`

Scripts típicos:

- `dev`
- `build`
- `start`
- `typecheck`

### `apps/dispatch-worker`

Scripts típicos:

- `dev`
- `build`
- `start`
- `typecheck`

### `packages/shared`

Scripts típicos:

- `build`
- `typecheck`
- `db:migrate`

### `packages/core`

Scripts típicos:

- `build`
- `typecheck`

## Migration

### `npm run db:migrate -w packages/shared`

Executa as migrations SQL encontradas em `infra/database/migrations`.

Esse script deve ser usado sempre que houver nova migration no projeto.

## Observação

Os scripts da raiz são o ponto preferencial de uso no dia a dia. Scripts de workspace devem ser usados quando a intenção for validar ou executar apenas uma parte específica do monorepo.

# Estrutura do Projeto

Intenção de cada área do monorepo.

## Diretórios principais

### `apps/`

Aplicações executáveis do sistema.

### `packages/`

Pacotes internos compartilhados.

### `docs/`

Documentação do projeto.

### `infra/`

Arquivos de infraestrutura local, como Docker Compose.

## Regra prática

- regra de negócio: `packages/core`
- infraestrutura compartilhada: `packages/shared`
- entrada HTTP: `apps/control-api`
- processamento assíncrono: `apps/dispatch-worker`

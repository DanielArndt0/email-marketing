# Estrutura do projeto

Este documento descreve a intenção de cada área do monorepo.

## Visão geral

O projeto foi organizado como monorepo para permitir evolução coordenada entre API, worker, packages internos e documentação.

## Diretórios principais

### `apps/`

Aplicações executáveis do sistema.

Atualmente:

- `apps/control-api`
- `apps/dispatch-worker`

### `packages/`

Pacotes internos compartilhados.

Atualmente:

- `packages/core`
- `packages/shared`

### `docs/`

Documentação técnica, operacional e arquitetural do projeto.

### `infra/`

Arquivos de infraestrutura local, como Docker Compose e migrations SQL.

### `config/`

Configuração default de comportamento do sistema, fora do `.env`.

## Regra prática de responsabilidade

- regra de negócio e semântica de domínio: `packages/core`
- infraestrutura compartilhada: `packages/shared`
- entrada HTTP e integração com cliente: `apps/control-api`
- processamento assíncrono: `apps/dispatch-worker`
- documentação e convenções: `docs`
- infraestrutura local e suporte operacional: `infra`

## Estrutura esperada da Control API

Dentro de `apps/control-api/src`:

- `main/`: bootstrap
- `presentation/`: rotas HTTP e composição da camada de entrada
- `modules/`: módulos funcionais

Dentro de cada módulo, a convenção atual desejada é:

- `application/`
- `http/`
- `repositories/`

## Estrutura esperada do Dispatch Worker

Dentro de `apps/dispatch-worker/src`:

- `main/`: bootstrap do processo
- `consumers/`: integração com BullMQ
- `jobs/`: contratos de fila
- `modules/`: processamento e persistência por domínio funcional

## Observação

Esta estrutura não é estática. Ela deve continuar evoluindo, mas sempre com intenção clara de responsabilidade e baixa ambiguidade entre camadas.

# Estrutura do projeto

Este documento descreve a intenção de cada área do monorepo.

## Visão geral

O projeto foi organizado como monorepo para permitir evolução coordenada entre API, worker, packages internos, documentação e infraestrutura local.

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

Arquivos de orquestração local, principalmente Docker Compose.

Estrutura esperada:

```text
infra/
├─ compose.infra.local.yaml
└─ compose.infra.dockerized.yaml
```

- `compose.infra.local.yaml`: sobe apenas PostgreSQL, Redis e Mailpit para desenvolvimento com a aplicação rodando fora do Docker.
- `compose.infra.dockerized.yaml`: sobe PostgreSQL, Redis, Mailpit, Control API e Dispatch Worker para validar a stack completa dockerizada.

### `docker/`

Scripts e arquivos auxiliares usados por containers locais.

Exemplo:

```text
docker/
└─ postgres/
   └─ migrations/
      ├─ 001_initial_schema.sql
      └─ ...
```

Os scripts SQL podem ser montados no container do Postgres em `/docker-entrypoint-initdb.d` para inicialização do banco local.

### `config/`

Configuração default de comportamento do sistema, fora do `.env`.

O arquivo principal é:

```text
config/system.config.json
```

Esse arquivo precisa estar disponível em runtime, inclusive nas imagens Docker finais.

### Dockerfiles na raiz

Os Dockerfiles das aplicações ficam na raiz:

```text
Dockerfile.control-api
Dockerfile.dispatch-worker
```

Eles ficam na raiz porque o contexto de build precisa acessar o monorepo inteiro, incluindo apps, packages, configs e manifests npm.

## Regra prática de responsabilidade

- regra de negócio e semântica de domínio: `packages/core`
- infraestrutura compartilhada: `packages/shared`
- entrada HTTP e integração com cliente: `apps/control-api`
- processamento assíncrono: `apps/dispatch-worker`
- documentação e convenções: `docs`
- orquestração local: `infra`
- scripts auxiliares de containers: `docker`
- configuração base do sistema: `config`

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

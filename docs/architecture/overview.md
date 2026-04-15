# Visão Geral da Arquitetura

O sistema será construído em monorepo, com separação entre:

- aplicações executáveis
- domínio e aplicação
- infraestrutura compartilhada

## Estrutura principal

- `apps/control-api`
- `apps/dispatch-worker`
- `packages/core`
- `packages/shared`

## Direção arquitetural

### Camada de entrada

Responsável por HTTP e entrada externa.

### Camada de aplicação

Responsável por casos de uso e orquestração de regras.

### Camada de domínio

Responsável por entidades, objetos de valor e regras centrais.

### Camada de infraestrutura

Responsável por banco, fila, e-mail, configuração e logging.

## Tecnologias previstas

- Node.js
- TypeScript
- PostgreSQL
- Redis
- BullMQ
- Nodemailer
- SMTP

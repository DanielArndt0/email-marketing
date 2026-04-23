# Email Marketing

Aplicação de e-mail marketing organizada em monorepo, com API HTTP, worker assíncrono, persistência em PostgreSQL, fila com Redis/BullMQ, envio SMTP e gestão de audiences integráveis com múltiplas fontes de leads.

Este projeto serve como base para um sistema de gerenciamento de campanhas, templates e dispatches de e-mail, com foco em evolução incremental, legibilidade do código e separação clara de responsabilidades.

## Estrutura do monorepo

- `apps/control-api`: API HTTP de controle do sistema
- `apps/dispatch-worker`: worker responsável pelo processamento assíncrono
- `packages/core`: núcleo de domínio em amadurecimento
- `packages/shared`: infraestrutura e utilitários compartilhados
- `docs`: documentação do projeto

## Documentação

A documentação do projeto está em [`docs/README.md`](./docs/README.md).

Leituras recomendadas:

- [Desenvolvimento local](./docs/setup/local-development.md)
- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Scripts do projeto](./docs/conventions/scripts.md)
- [Estado atual da arquitetura](./docs/architecture/current-state.md)
- [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)

## Contribuição

As diretrizes para contribuição estão em [`CONTRIBUTING`](./CONTRIBUTING.md).

## Observação

O projeto ainda está em evolução arquitetural. Parte do trabalho atual está focada em organizar melhor a separação entre camada de aplicação, camada HTTP, repositórios, domínio e infraestrutura compartilhada.

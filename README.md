# Email Marketing

Aplicação de e-mail marketing organizada em monorepo, com API HTTP, worker assíncrono, persistência em PostgreSQL, fila com Redis/BullMQ e envio SMTP.

## Objetivo

Este projeto serve como base para um sistema de gerenciamento de campanhas e dispatches de e-mail, com foco em evolução incremental e clareza arquitetural.

## Estrutura do monorepo

- `apps/control-api`: API HTTP de controle do sistema
- `apps/dispatch-worker`: worker responsável pelo processamento assíncrono
- `packages/core`: núcleo de domínio em amadurecimento
- `packages/shared`: infraestrutura e utilitários compartilhados
- `docs`: documentação do projeto

## Documentação

A documentação do projeto está em [`docs/README.md`](./docs/README.md).

## Observação

O projeto ainda está em evolução arquitetural. Parte do trabalho atual está focada em organizar melhor a separação entre camada de aplicação, camada HTTP e camada de repositório.

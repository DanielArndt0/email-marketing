# Documentação

Esta pasta centraliza a documentação do projeto **email-marketing**.

O objetivo desta documentação é servir como referência para:

- entendimento da arquitetura atual;
- organização dos apps e packages do monorepo;
- configuração do ambiente local;
- execução com Docker;
- convenções adotadas no projeto;
- direcionamento dos próximos passos de evolução.

## Visão geral

O projeto está em evolução e, no momento, reúne:

- uma **API de controle** para operação do sistema;
- um **worker de dispatch** para processamento assíncrono;
- pacotes internos compartilhados;
- PostgreSQL como persistência principal;
- Redis/BullMQ para filas e processamento assíncrono;
- Mailpit para testes locais de SMTP;
- documentação de arquitetura, setup e organização.

## Navegação rápida

### Apps

- [Control API](./apps/control-api.md)
- [Endpoints da Control API](./apps/control-api/endpoints.md)
- [SMTP Senders](./apps/control-api/smtp-senders.md)
- [Gerenciamento de status das campaigns](./apps/control-api/campaign-status-management.md)
- [Dispatch Worker](./apps/dispatch-worker.md)

### Packages

- [Core](./packages/core.md)
- [Shared](./packages/shared.md)

### Arquitetura

- [Visão geral](./architecture/overview.md)
- [Estado atual](./architecture/current-state.md)
- [Diretrizes de refatoração](./architecture/refactoring-guidelines.md)

### Setup

- [Desenvolvimento local](./setup/local-development.md)
- [Docker e infraestrutura local](./setup/docker.md)

### Banco de dados

- [Migrations](./database/migrations.md)

### Convenções

- [Estrutura do projeto](./conventions/project-structure.md)
- [Scripts do projeto](./conventions/scripts.md)

### Templates

- [Variáveis de templates](./templates/template-variables.md)

### Roadmap

- [Próximos passos](./roadmap/next-steps.md)

## Configuração do sistema

Além das variáveis de ambiente definidas a partir de [`.env.example`](../.env.example), o projeto utiliza o arquivo [`config/system.config.json`](../config/system.config.json) para centralizar configurações default de comportamento do sistema.

Em execução dockerizada, a aplicação deve receber as variáveis por meio do arquivo `.env.docker`, referenciado pelo Docker Compose nos serviços `control-api` e `dispatch-worker`.

## Leitura sugerida

Para entender o projeto de forma progressiva, a ordem recomendada é:

1. [Visão geral](./architecture/overview.md)
2. [Estado atual](./architecture/current-state.md)
3. [Estrutura do projeto](./conventions/project-structure.md)
4. [Desenvolvimento local](./setup/local-development.md)
5. [Docker e infraestrutura local](./setup/docker.md)
6. documentação específica de apps e packages

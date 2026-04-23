# Documentação

Esta pasta centraliza a documentação do projeto **email-marketing**.

O objetivo desta documentação é servir como referência para:

- entendimento da arquitetura atual
- organização dos apps e packages do monorepo
- configuração do ambiente local
- convenções adotadas no projeto
- direcionamento dos próximos passos de evolução

## Visão geral

O projeto está em evolução e, no momento, reúne:

- uma **API de controle** para operação do sistema
- um **worker de dispatch** para processamento assíncrono
- pacotes internos compartilhados
- documentação de arquitetura, setup e organização

## Navegação rápida

### Apps

- [Control API](./apps/control-api.md)
- [Endpoints da Control API](./apps/control-api/endpoints.md)
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

### Convenções

- [Estrutura do projeto](./conventions/project-structure.md)
- [Scripts do projeto](./conventions/scripts.md)

### Roadmap

- [Próximos passos](./roadmap/next-steps.md)

## Configuração do sistema

Além das variáveis de ambiente definidas a partir de [`.env.example`](../.env.example), o projeto utiliza o arquivo [`config/system.config.json`](../config/system.config.json) para centralizar configurações default de comportamento do sistema.

## Leitura sugerida

Para entender o projeto de forma progressiva, a ordem recomendada é:

1. [Visão geral](./architecture/overview.md)
2. [Estado atual](./architecture/current-state.md)
3. [Estrutura do projeto](./conventions/project-structure.md)
4. [Desenvolvimento local](./setup/local-development.md)
5. documentação específica de apps e packages

## Observação

A documentação deve evoluir junto com o código.

Sempre que houver mudanças relevantes em arquitetura, estrutura, fluxos, endpoints, configuração ou convenções, esta pasta deve ser atualizada para refletir o estado real do sistema.

# Visão geral da arquitetura

## Estratégia adotada

O sistema foi estruturado como monorepo com separação entre:

- apps executáveis
- infraestrutura compartilhada
- documentação
- scripts de suporte

## Fluxo principal atual

1. a API recebe uma requisição
2. a camada HTTP valida a entrada com Zod
3. a camada de aplicação coordena a operação
4. o acesso ao banco ocorre via `repositories/`
5. o dispatch é persistido
6. um job é publicado na fila
7. o worker consome o job
8. o worker envia o e-mail e atualiza o status

## Convenção aplicada na API

Dentro de cada módulo da `control-api`, a estrutura alvo é:

- `application/`
- `http/`
- `repositories/`

## Convenção aplicada ao worker

Dentro do `dispatch-worker`, a ideia é manter:

- bootstrap simples em `main/`
- consumers finos
- processamento em `application/`
- SQL e persistência isolados em `repositories/`

## Objetivo dessa convenção

- separar fluxo de negócio de acesso a dados
- facilitar leitura
- reduzir arquivos com muitas responsabilidades
- criar uma base melhor para evolução do domínio

## Leitura complementar

- [Estado atual da arquitetura](./current-state.md)
- [Diretrizes de refatoração](./refactoring-guidelines.md)
- [Próximos passos](../roadmap/next-steps.md)

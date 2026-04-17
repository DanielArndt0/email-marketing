# Visão geral da arquitetura

## Estratégia adotada

O sistema foi estruturado como monorepo com separação entre:

- apps executáveis;
- infraestrutura compartilhada;
- documentação;
- scripts de suporte.

## Fluxo principal atual

1. A API recebe uma requisição.
2. O módulo HTTP valida a entrada com Zod.
3. O caso de uso coordena a operação.
4. O acesso ao banco ocorre via `repositories/`.
5. O dispatch é persistido.
6. Um job é publicado na fila.
7. O worker consome o job.
8. O worker envia o e-mail e atualiza o status.

## Convenção aplicada na API

Dentro de cada módulo da `control-api`, a estrutura alvo é:

- `application/`
- `http/`
- `repositories/`

## Objetivo dessa convenção

- separar fluxo de negócio de acesso a dados;
- facilitar leitura;
- reduzir arquivos com muitas responsabilidades;
- criar uma base melhor para evolução do domínio.

## Leitura complementar

- [Estado atual da arquitetura](./current-state.md)
- [Diretrizes de refatoração](./refactoring-guidelines.md)
- [Próximos passos](../roadmap/next-steps.md)

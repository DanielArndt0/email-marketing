# Diretrizes de refatoração

Este documento registra as diretrizes adotadas para manter a evolução do projeto consistente.

## Objetivo

Evitar crescimento desorganizado da base de código e preservar legibilidade, previsibilidade e segurança.

## Regras adotadas

### 1. Casos de uso não devem carregar SQL diretamente

A camada `application` deve orquestrar regras e fluxo.

Queries, comandos SQL e mapeamentos de persistência devem ficar em `repositories/`.

### 2. Handlers HTTP não devem conter regra de negócio

Os handlers devem:

- validar entrada;
- chamar um caso de uso;
- traduzir o resultado em resposta HTTP.

### 3. `main/` deve cuidar apenas de bootstrap

A camada `main` deve se limitar a:

- subir a aplicação;
- inicializar conexões;
- registrar rotas/consumers;
- tratar shutdown gracioso.

### 4. Repetições utilitárias devem ser extraídas

Transformações de data, paginação e helpers repetidos devem ser centralizados em utilitários compartilhados da aplicação.

### 5. Infraestrutura comum deve ficar em `packages/shared`

Sempre que um recurso for usado por mais de um app, a primeira pergunta deve ser:

> isso deve viver no `shared`?

## Próxima evolução recomendada

As próximas refatorações devem priorizar:

- amadurecimento do `packages/core`;
- contratos/ports explícitos para repositórios;
- testes automatizados;
- padronização de respostas de erro;
- documentação por módulo.

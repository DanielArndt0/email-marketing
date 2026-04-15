# Desenvolvimento Local

Este documento descreve a preparação básica do ambiente local do projeto.

## Componentes previstos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js
- npm
- PostgreSQL
- Redis

## Organização inicial

O projeto foi estruturado em monorepo para permitir:

- múltiplas aplicações no mesmo repositório
- compartilhamento de código interno
- evolução coordenada entre API, worker e pacotes

## Variáveis de ambiente

Antes de executar o projeto, crie um arquivo `.env` na raiz do repositório com base no arquivo `.env.example`.

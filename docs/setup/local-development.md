# Desenvolvimento Local

Este documento descreve a preparação básica do ambiente local do projeto.

## Componentes previstos

Para executar o projeto localmente, é necessário ter instalado:

- Node.js
- npm
- Docker Desktop

## Serviços locais do projeto

O ambiente local atual utiliza containers para os serviços de infraestrutura:

- PostgreSQL
- Redis
- Mailpit

A subida desses serviços é feita pelo arquivo `infra/compose.yaml`.

## Variáveis de ambiente

Antes de executar o projeto, crie um arquivo `.env` na raiz do repositório com base no arquivo `.env.example`.

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Depois disso, ajuste os valores do `.env` conforme o seu ambiente local.

## Configuração geral do sistema

Além do `.env`, o projeto possui um arquivo JSON com configurações default unificadas:

- `config/system.config.json`

Esse arquivo centraliza, neste momento:

- configuração default de paginação da API
- nomes de fila BullMQ
- nomes dos jobs da fila de dispatch
- texto fallback para envio de e-mail

A ideia é reduzir valores hard-coded espalhados e facilitar uma futura migração dessas configurações para persistência em banco.

## Estrutura esperada no ambiente local

Durante o desenvolvimento, o projeto deverá utilizar:

- PostgreSQL para persistência de dados
- Redis para filas, jobs e estado operacional
- Mailpit para captura local de e-mails via SMTP
- Node.js para execução da API e do worker

## Observação

Esta documentação deve evoluir junto com a arquitetura do projeto.

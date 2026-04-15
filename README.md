# Email Marketing

Sistema de e-mail marketing em Node.js + TypeScript, estruturado em monorepo, com foco em arquitetura limpa, domínio bem separado, processamento assíncrono e evolução incremental.

## Objetivo

Este projeto tem como objetivo servir como base para um sistema de e-mail marketing operado localmente, com suporte a:

- gerenciamento de campanhas
- gerenciamento de contatos e listas
- templates de e-mail
- processamento assíncrono de envios
- integração com PostgreSQL, Redis, BullMQ e SMTP

## Estrutura do monorepo

- `apps/control-api`: API HTTP de controle do sistema
- `apps/dispatch-worker`: worker responsável pelo processamento assíncrono
- `packages/core`: domínio e casos de uso
- `packages/shared`: infraestrutura e utilitários compartilhados
- `docs`: documentação do projeto

## Documentação

A documentação do projeto se encontra na pasta [`/docs`](./docs/README.md).

## Status

Projeto em fase inicial de estruturação.

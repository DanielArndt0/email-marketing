# Package Core

## Visão geral

O `core` representa a área mais próxima do domínio do sistema.

No estado atual, ele ainda está em amadurecimento e não concentra toda a regra semântica que o projeto deverá ter no futuro.

## Papel esperado

Ao longo da evolução do projeto, este pacote deve concentrar:

- entidades de domínio
- value objects
- contratos mais puros
- regras de negócio independentes de framework
- decisões semânticas compartilhadas entre API e worker
- tipos mais estáveis entre apps

## Situação atual

Hoje, o `core` ainda é subutilizado.

Parte importante da lógica semântica ainda vive nos apps, especialmente em casos de uso e validações locais.

## Direção de evolução

Sempre que uma regra:

- não depender de Fastify
- não depender de BullMQ
- não depender de PostgreSQL
- não depender de SMTP

ela deve ser avaliada como candidata a viver no `core`.

## Observação

O amadurecimento do `core` é uma das trilhas principais de evolução arquitetural do projeto.

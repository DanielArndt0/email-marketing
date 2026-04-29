# Package Shared

## Visão geral

O `shared` concentra a infraestrutura comum reutilizada por mais de um app.

## Conteúdo atual

Hoje, o pacote reúne principalmente:

- carregamento de ambiente
- leitura da configuração JSON do sistema
- logger
- conexão com PostgreSQL
- conexão com Redis
- abstrações de fila BullMQ
- integração SMTP/Nodemailer, incluindo transporter com configuração dinâmica
- renderização simples de templates
- runner de migrations

## Papel arquitetural

O `shared` não existe para concentrar regras de negócio.

Seu papel é centralizar elementos técnicos, utilitários e integrações que seriam duplicados entre `control-api` e `dispatch-worker`.

## Quando algo deve ir para o shared

Uma boa regra prática é:

> se algo é infraestrutura ou utilitário técnico e será usado por mais de um app, ele deve ser avaliado primeiro para viver em `shared`.

## O que evitar

Evite usar o `shared` como “depósito genérico” de qualquer arquivo solto.

Ele deve continuar organizado por responsabilidade, especialmente em áreas como:

- `config/`
- `database/`
- `queue/`
- `mail/`
- `logger/`

## Observação

À medida que o projeto crescer, o `shared` tende a se tornar mais importante para reduzir hard-coded, consolidar integração e evitar repetição técnica entre apps.

## SMTP dinâmico

O pacote `shared` mantém a integração comum de envio de e-mail.

O fluxo legado baseado em `.env` permanece como fallback/compatibilidade, mas o envio principal das campaigns usa configurações carregadas de `smtp_senders` e repassadas ao `sendEmail` pelo `dispatch-worker`.

Também ficam no `shared` os utilitários técnicos de criptografia usados para proteger senhas SMTP armazenadas no banco.

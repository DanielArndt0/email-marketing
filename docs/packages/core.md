# Core

## Papel

O `core` concentra tipos de domínio, contratos e regras centrais que não devem depender diretamente de infraestrutura.

## Responsabilidades atuais

Atualmente, o pacote contém principalmente:

- status de campanhas
- status de email dispatches
- tipos de audiência
- tipos de lead source
- contratos para resolução de destinatários
- tipos de destinatário (`LeadRecipient`)

## Objetivo arquitetural

A tendência é que o `core` cresça para concentrar cada vez mais:

- regras semânticas do domínio
- value objects
- contracts/ports
- validações de domínio
- políticas de transição de estado

## Observação

O `core` não deve conhecer PostgreSQL, Fastify, BullMQ, Nodemailer ou detalhes de adapters concretos.

# Email Marketing

Aplicação de e-mail marketing organizada em monorepo, com API HTTP, worker assíncrono, persistência em PostgreSQL, fila com Redis/BullMQ, envio SMTP e gestão de audiences integráveis com múltiplas fontes de leads.

Este projeto serve como base para um sistema de gerenciamento de campanhas, templates e dispatches de e-mail, com foco em evolução incremental, legibilidade do código e separação clara de responsabilidades.

## Estrutura do monorepo

- `apps/control-api`: API HTTP de controle do sistema
- `apps/dispatch-worker`: worker responsável pelo processamento assíncrono
- `packages/core`: núcleo de domínio em amadurecimento
- `packages/shared`: infraestrutura e utilitários compartilhados
- `docs`: documentação do projeto

## SMTP Senders dinâmicos

O sistema permite cadastrar múltiplos remetentes SMTP no banco de dados e vincular cada campanha a um remetente específico.

Antes, o envio dependia de um único SMTP configurado via `.env`. Agora, cada campaign pode definir seu próprio `smtpSenderId`, permitindo cenários como:

- campanhas de certificado digital enviadas por um e-mail da empresa de certificação;
- campanhas de consórcio enviadas por outro domínio/remetente;
- ambiente local usando MailPit como SMTP sender de desenvolvimento;
- ambiente de produção usando SMTPs reais cadastrados no banco.

O fluxo atual é:

```text
smtp_senders
  ↓
campaigns.smtp_sender_id
  ↓
email_dispatches.smtp_sender_id
  ↓
dispatch-worker carrega o sender e envia pelo SMTP correto
```

As credenciais SMTP são armazenadas criptografadas no banco, usando a variável `SMTP_SENDER_ENCRYPTION_KEY`. A senha SMTP nunca é retornada nas respostas da API.

## Documentação

A documentação do projeto está em [`docs/README.md`](./docs/README.md).

Leituras recomendadas:

- [Desenvolvimento local](./docs/setup/local-development.md)
- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Scripts do projeto](./docs/conventions/scripts.md)
- [Estado atual da arquitetura](./docs/architecture/current-state.md)
- [SMTP Senders](./docs/apps/control-api/smtp-senders.md)
- [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)

## Contribuição

As diretrizes para contribuição estão em [`CONTRIBUTING`](./CONTRIBUTING.md).

## Observação

O projeto ainda está em evolução arquitetural. Parte do trabalho atual está focada em organizar melhor a separação entre camada de aplicação, camada HTTP, repositórios, domínio e infraestrutura compartilhada.

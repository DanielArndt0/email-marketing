# Email Marketing

Aplicação de e-mail marketing organizada em monorepo, com API HTTP, worker assíncrono, persistência em PostgreSQL, fila com Redis/BullMQ, envio SMTP e gestão de audiences integráveis com múltiplas fontes de leads.

Este projeto serve como base para um sistema de gerenciamento de campanhas, templates e dispatches de e-mail, com foco em evolução incremental, legibilidade do código e separação clara de responsabilidades.

## Estrutura do monorepo

- `apps/control-api`: API HTTP de controle do sistema
- `apps/dispatch-worker`: worker responsável pelo processamento assíncrono
- `packages/core`: núcleo de domínio em amadurecimento
- `packages/shared`: infraestrutura e utilitários compartilhados
- `config`: configuração base do sistema
- `infra`: arquivos Docker Compose para execução local
- `docker`: scripts auxiliares de banco usados na inicialização local
- `docs`: documentação do projeto

## Execução local

O projeto possui dois modos principais de execução local.

### 1. Aplicação local com infraestrutura no Docker

Use este modo durante o desenvolvimento diário, quando quiser rodar a API e o worker diretamente na máquina com Node.js, mantendo apenas PostgreSQL, Redis e Mailpit em containers.

```bash
docker compose -f infra/compose.infra.local.yml up -d
npm run dev
```

Nesse modo, a aplicação usa o arquivo `.env` e acessa os serviços por `localhost`.

### 2. Stack completa dockerizada

Use este modo para validar o projeto rodando inteiramente em containers.

```bash
docker compose -f infra/compose.infra-dockerized.yml up --build
```

Nesse modo, a Control API e o Dispatch Worker usam o arquivo `.env.docker` e acessam os serviços pelo nome interno do Docker Compose.

A documentação completa de Docker e infraestrutura está em [Docker e infraestrutura local](./docs/setup/docker.md).

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
- [Docker e infraestrutura local](./docs/setup/docker.md)
- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Scripts do projeto](./docs/conventions/scripts.md)
- [Estado atual da arquitetura](./docs/architecture/current-state.md)
- [SMTP Senders](./docs/apps/control-api/smtp-senders.md)
- [Gerenciamento de status das campaigns](./docs/apps/control-api/campaign-status-management.md)
- [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)

## Contribuição

As diretrizes para contribuição estão em [`CONTRIBUTING`](./CONTRIBUTING.md).

## Observação

O projeto ainda está em evolução arquitetural. Parte do trabalho atual está focada em organizar melhor a separação entre camada de aplicação, camada HTTP, repositórios, domínio e infraestrutura compartilhada.

# Migrations

Este documento registra as principais alterações estruturais de banco relevantes para a evolução do projeto.

## 008 - SMTP Senders

Cria a tabela `smtp_senders` e adiciona o vínculo inicial com campaigns.

### Alterações

- cria `smtp_senders`;
- adiciona `campaigns.smtp_sender_id`;
- cria índice para `smtp_senders.is_active`;
- cria índice para `campaigns.smtp_sender_id`.

### Tabela `smtp_senders`

Armazena os remetentes SMTP disponíveis para campanhas.

A senha é armazenada criptografada em `password_encrypted`.

---

## 009 - SMTP Sender em Email Dispatches

Adiciona o vínculo do SMTP Sender diretamente nos dispatches.

### Alterações

- permite `smtp_senders.username` como `NULL`;
- permite `smtp_senders.password_encrypted` como `NULL`;
- adiciona `email_dispatches.smtp_sender_id`;
- cria foreign key para `smtp_senders(id)`;
- cria índice para `email_dispatches.smtp_sender_id`.

### Motivo

O `smtp_sender_id` também é salvo no dispatch para congelar o remetente usado no momento do envio.

Assim, se a campaign for alterada futuramente, os dispatches já criados continuam apontando para o sender original.

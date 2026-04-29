# SMTP Senders

O módulo de SMTP Senders permite cadastrar múltiplos remetentes SMTP para uso nas campanhas de e-mail marketing.

## Objetivo

Antes dessa implementação, o envio dependia de um SMTP único configurado no `.env`.

Com os SMTP Senders, cada campaign pode escolher qual remetente será usado no envio. Isso permite separar campanhas por empresa, marca, domínio ou contexto comercial.

Exemplos:

- campanha de certificado digital usando o remetente da certificadora;
- campanha de consórcio usando o remetente da empresa de consórcio;
- campanha de teste local usando MailPit;
- campanha de produção usando um SMTP real.

---

## Conceitos principais

### `fromName`

Nome exibido como remetente.

```text
Garbo Certificação Digital
```

### `fromEmail`

E-mail exibido como remetente.

```text
contato@garbo.com.br
```

No e-mail recebido, aparecerá algo como:

```text
Garbo Certificação Digital <contato@garbo.com.br>
```

### `replyToEmail`

E-mail para onde irão as respostas quando o destinatário clicar em **Responder**.

Pode ser igual ao `fromEmail`, mas também pode ser diferente.

```text
From: Garbo Certificação Digital <envios@garbo.com.br>
Reply-To: atendimento@garbo.com.br
```

### `host`, `port` e `secure`

Dados de conexão SMTP.

Exemplo MailPit local:

```json
{
  "host": "mailpit",
  "port": 1025,
  "secure": false
}
```

Exemplo SMTP real:

```json
{
  "host": "smtp.exemplo.com",
  "port": 587,
  "secure": false
}
```

### `username` e `password`

Credenciais de autenticação SMTP.

São opcionais para ambientes sem autenticação, como MailPit.

A senha é recebida pela API apenas em criação/atualização e armazenada criptografada no banco em `password_encrypted`.

A senha nunca é retornada nas respostas HTTP.

---

## Fluxo de envio

```text
1. Um SMTP Sender é cadastrado em /smtp-senders
2. A campaign recebe smtpSenderId
3. O dispatch da campaign cria email_dispatches com smtp_sender_id
4. O dispatch-worker carrega o email_dispatch
5. O worker busca o SMTP Sender no banco
6. O worker descriptografa a senha, se houver
7. O worker cria um transporter SMTP dinâmico
8. O e-mail é enviado pelo remetente correto
```

---

## MailPit local

Para desenvolvimento local, o MailPit deve ser cadastrado como um SMTP Sender comum.

Quando o worker roda dentro do Docker Compose:

```json
{
  "name": "MailPit Local",
  "fromName": "Email Marketing Dev",
  "fromEmail": "dev@email-marketing.local",
  "replyToEmail": null,
  "host": "mailpit",
  "port": 1025,
  "secure": false,
  "username": null,
  "password": null,
  "isActive": true
}
```

Quando o worker roda fora do Docker, diretamente na máquina, o host normalmente é:

```json
{
  "host": "localhost",
  "port": 1025,
  "secure": false
}
```

---

## SMTP real

Exemplo de SMTP real:

```json
{
  "name": "Garbo Certificação Digital",
  "fromName": "Garbo Certificação Digital",
  "fromEmail": "contato@garbo.com.br",
  "replyToEmail": "atendimento@garbo.com.br",
  "host": "smtp.exemplo.com",
  "port": 587,
  "secure": false,
  "username": "contato@garbo.com.br",
  "password": "senha-ou-app-password",
  "isActive": true
}
```

---

## Segurança

A senha SMTP não é salva em texto puro.

O sistema usa a variável:

```env
SMTP_SENDER_ENCRYPTION_KEY=
```

Essa chave deve ser estável no ambiente. Se ela mudar, as senhas já criptografadas não poderão ser descriptografadas corretamente.

---

## Regras importantes

- Campaigns devem ter `smtpSenderId` para serem disparadas.
- O SMTP Sender vinculado precisa estar ativo.
- Dispatches armazenam o `smtp_sender_id` usado no momento da criação.
- Alterar o sender da campaign depois do dispatch não altera os dispatches já criados.
- Senhas SMTP nunca são retornadas pela API.

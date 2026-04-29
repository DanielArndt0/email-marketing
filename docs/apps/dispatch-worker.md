# Dispatch Worker

## Visão geral

O `dispatch-worker` é a aplicação responsável pelo processamento assíncrono dos jobs do sistema.

Ele atua como consumidor das filas de dispatch, recupera os dados persistidos do envio, executa o processamento necessário e atualiza o estado operacional do dispatch no banco de dados.

## Papel no sistema

O `dispatch-worker` existe para desacoplar o fluxo de envio da camada HTTP.

Em vez de a API realizar o envio de e-mail diretamente durante a requisição, ela persiste o dispatch e o enfileira. O worker, em segundo plano, consome esse job e executa o envio.

## Responsabilidades atuais

Atualmente, o `dispatch-worker` é responsável por:

- consumir a fila `email-dispatch`
- carregar do banco o dispatch persistido
- marcar o dispatch como `processing`
- carregar o SMTP Sender vinculado ao dispatch
- enviar e-mail via SMTP dinâmico
- atualizar o status do dispatch no PostgreSQL
- registrar sucesso e falha de processamento em logs

## Estrutura interna

A estrutura atual da aplicação está organizada, em linhas gerais, em:

- `main/`: bootstrap do processo
- `consumers/`: consumers BullMQ
- `jobs/`: contratos dos jobs
- `modules/`: fluxo funcional do worker, quando aplicável
- `application/`: orquestração do processamento
- `repositories/`: acesso a dados e persistência

## Fluxo atual de processamento

De forma resumida, o fluxo atual do worker é:

1. o worker é iniciado
2. os consumers são registrados
3. a fila `email-dispatch` passa a ser observada
4. quando um job é recebido, o worker carrega o dispatch correspondente no banco
5. o dispatch é marcado como `processing`
6. o worker carrega o SMTP Sender vinculado ao dispatch
7. o e-mail é enviado pelo SMTP dinâmico
8. o status final é atualizado para `sent` ou `error`

## Diretriz de arquitetura

O `dispatch-worker` deve permanecer o mais simples possível.

Sempre que viável:

- o conteúdo final do e-mail deve já estar resolvido antes do enfileiramento
- a renderização de template deve ocorrer antes da fila
- o worker deve focar em consumir, processar, enviar e atualizar estado

## Observação importante

O worker não deve concentrar regras desnecessárias de composição de conteúdo.

A tendência arquitetural desejada é que ele atue mais como executor do dispatch persistido do que como responsável por construir a mensagem.

## SMTP Sender dinâmico

O `dispatch-worker` agora envia e-mails usando o SMTP Sender vinculado ao dispatch.

Antes, o worker usava apenas as configurações SMTP do `.env`.

Agora o fluxo é:

```text
job BullMQ
  ↓
dispatchId
  ↓
email_dispatches.smtp_sender_id
  ↓
smtp_senders
  ↓
Nodemailer transporter dinâmico
  ↓
envio do e-mail
```

### Como o worker escolhe o SMTP?

O worker não decide diretamente se vai usar MailPit ou SMTP real.

Ele lê o `smtp_sender_id` do dispatch e carrega as configurações daquele sender no banco.

Portanto:

- para teste local, a campaign deve estar vinculada a um sender apontando para MailPit;
- para produção, a campaign deve estar vinculada a um sender apontando para o SMTP real.

### Exemplo local com MailPit

```json
{
  "host": "mailpit",
  "port": 1025,
  "secure": false,
  "username": null,
  "password": null
}
```

### Exemplo produção

```json
{
  "host": "smtp.exemplo.com",
  "port": 587,
  "secure": false,
  "username": "contato@empresa.com.br",
  "password": "senha-ou-app-password"
}
```

### Falhas possíveis

O worker marca o dispatch como `error` quando:

- o dispatch não possui `smtp_sender_id`;
- o SMTP Sender não existe;
- o SMTP Sender está inativo;
- a senha criptografada não pode ser descriptografada;
- o SMTP rejeita autenticação;
- o envio falha por erro de conexão ou provedor.

### Atualização de status da campaign

Depois que os dispatches são processados, o worker pode sincronizar o status da campaign:

- `completed`, quando ao menos um envio foi concluído e não há dispatches pendentes/processando;
- `failed`, quando todos os dispatches falharam;
- mantém `running`, enquanto ainda houver dispatches pendentes, enfileirados ou processando.

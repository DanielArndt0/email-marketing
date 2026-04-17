# Dispatch Worker

## Papel

O `dispatch-worker` processa jobs assíncronos do sistema.

## Responsabilidades atuais

- consumir a fila `email-dispatch`;
- carregar o dispatch persistido;
- enviar e-mail via SMTP;
- atualizar status no PostgreSQL.

## Estrutura interna

- `main/`: bootstrap do processo;
- `consumers/`: consumers BullMQ;
- `jobs/`: contratos dos jobs.

## Observação

O worker deve permanecer o mais simples possível. O conteúdo final do envio deve ser resolvido antes do enfileiramento, preferencialmente na API.

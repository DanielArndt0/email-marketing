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
- enviar e-mail via SMTP
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
6. o e-mail é enviado
7. o status final é atualizado para `sent` ou `error`

## Diretriz de arquitetura

O `dispatch-worker` deve permanecer o mais simples possível.

Sempre que viável:

- o conteúdo final do e-mail deve já estar resolvido antes do enfileiramento
- a renderização de template deve ocorrer antes da fila
- o worker deve focar em consumir, processar, enviar e atualizar estado

## Observação importante

O worker não deve concentrar regras desnecessárias de composição de conteúdo.

A tendência arquitetural desejada é que ele atue mais como executor do dispatch persistido do que como responsável por construir a mensagem.

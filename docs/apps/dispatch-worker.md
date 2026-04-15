# Dispatch Worker

O `dispatch-worker` é a aplicação responsável por consumir filas e processar tarefas assíncronas do sistema.

## Responsabilidades esperadas

- consumir jobs do BullMQ
- processar envios de e-mail
- controlar retries
- registrar falhas operacionais
- executar fluxos assíncronos desacoplados da API

## Exemplos de responsabilidades futuras

- enviar lote de campanha
- processar job de envio individual
- atualizar status de execução
- lidar com retentativas
- aplicar limites operacionais

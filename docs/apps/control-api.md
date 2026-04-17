# Control API

## Papel

A `control-api` é a porta de entrada HTTP do sistema.

## Responsabilidades atuais

- validar entrada de dados;
- orquestrar casos de uso;
- persistir dados via camada de repositório;
- enfileirar dispatches;
- expor consultas operacionais.

## Estrutura interna

- `main/`: bootstrap;
- `presentation/`: rotas HTTP;
- `modules/`: módulos funcionais.

## Regra atual de organização

Cada módulo da API deve, sempre que possível, seguir esta divisão:

- `application/`
- `http/`
- `repositories/`

## Observação

A camada `application` não deve concentrar SQL bruto.

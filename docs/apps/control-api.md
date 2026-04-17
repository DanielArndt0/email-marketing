# Control API

## Visão geral

A `control-api` é a aplicação HTTP responsável por receber requisições externas e coordenar os fluxos operacionais do sistema de e-mail marketing.

Ela atua como porta de entrada da aplicação, concentrando a exposição dos endpoints, a validação de entrada, a chamada de casos de uso e a integração com as camadas de persistência e fila.

## Papel no sistema

A `control-api` é responsável por:

- receber requisições HTTP
- validar parâmetros, query strings e payloads
- acionar fluxos de aplicação
- persistir dados operacionais
- enfileirar dispatches para processamento assíncrono
- expor consultas operacionais do sistema

## Responsabilidades atuais

No estado atual do projeto, a `control-api` cobre principalmente:

- health check da aplicação
- criação de dispatches
- consulta e retry de dispatches
- criação, consulta, atualização e exclusão de templates
- integração com fila para envio assíncrono de e-mails

## Estrutura interna

A aplicação está organizada, de forma geral, em:

- `main/`: bootstrap da aplicação
- `presentation/`: rotas e composição da camada HTTP
- `modules/`: módulos funcionais da API

## Organização dos módulos

Cada módulo da API deve, sempre que possível, seguir a seguinte divisão:

- `application/`: regras de orquestração e fluxo
- `http/`: handlers e integração com a camada HTTP
- `repositories/`: acesso a dados e persistência

## Diretriz atual de arquitetura

A intenção da arquitetura é manter a API organizada por responsabilidade, com separação clara entre:

- entrada HTTP
- lógica de aplicação
- persistência
- integração com infraestrutura

## Observação importante

A camada `application` não deve concentrar SQL bruto.

Sempre que possível, o acesso a dados deve ficar isolado em `repositories/`, deixando a camada de aplicação mais legível, previsível e focada em fluxo.

## Documentação de endpoints

A documentação específica dos endpoints da `control-api` está em:

- [Endpoints da Control API](./control-api/endpoints.md)

## Evolução futura esperada

No futuro, esta aplicação deve evoluir para incluir:

- documentação OpenAPI/Swagger
- melhor padronização de erros
- maior uso do `core` para regras centrais
- redução adicional de hard-coded
- amadurecimento dos contratos entre aplicação, domínio e infraestrutura

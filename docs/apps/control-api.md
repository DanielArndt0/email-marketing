# Control API

## Visão geral

A `control-api` é a aplicação HTTP responsável por receber requisições externas e coordenar os fluxos operacionais do sistema de e-mail marketing.

Ela atua como porta de entrada da aplicação, concentrando a exposição dos endpoints, a validação de entrada, a chamada de casos de uso e a integração com as camadas de persistência, fila e lead sources externos.

## Papel no sistema

A `control-api` é responsável por:

- receber requisições HTTP
- validar parâmetros, query strings e payloads
- acionar fluxos de aplicação
- persistir dados operacionais
- enfileirar dispatches para processamento assíncrono
- expor consultas operacionais do sistema
- resolver audiências a partir de contratos de lead source

## Responsabilidades atuais

No estado atual do projeto, a `control-api` cobre principalmente:

- health check da aplicação
- criação, listagem, consulta e atualização de campanhas
- preview de audiência por campanha
- resolução genérica de audiências por sourceType + filtros
- criação de dispatches
- consulta e retry de dispatches
- criação, consulta, atualização e exclusão de templates
- integração com fila para envio assíncrono de e-mails

## Estrutura interna

A aplicação está organizada, de forma geral, em:

- `main/`: bootstrap da aplicação
- `presentation/`: rotas, schemas e documentação OpenAPI
- `modules/`: módulos funcionais da API

## Organização dos módulos

Cada módulo da API deve, sempre que possível, seguir a seguinte divisão:

- `application/`: regras de orquestração e fluxo
- `http/`: handlers e integração com a camada HTTP
- `repositories/`: acesso a dados e persistência
- `adapters/`: integrações concretas com serviços ou contratos externos

## Diretriz atual de arquitetura

A intenção da arquitetura é manter a API organizada por responsabilidade, com separação clara entre:

- entrada HTTP
- lógica de aplicação
- persistência
- contratos de domínio
- adapters de infraestrutura

## Observação importante

A camada `application` não deve concentrar SQL bruto nem detalhes de integração externa.

Sempre que possível, o acesso a dados deve ficar isolado em `repositories/`, e integrações concretas devem ficar em `adapters/`, deixando a camada de aplicação mais legível, previsível e focada em fluxo.

## Documentação de endpoints

A documentação específica dos endpoints da `control-api` está em:

- [Endpoints da Control API](./control-api/endpoints.md)

A documentação OpenAPI/Swagger em ambiente local está disponível em:

- `/documentation`
- `/documentation/json`

## Evolução futura esperada

No futuro, esta aplicação deve evoluir para incluir:

- executions de campanha
- resolução de audiência por múltiplas integrações
- melhor padronização de erros
- maior uso do `core` para regras centrais
- redução adicional de hard-coded
- amadurecimento dos contratos entre aplicação, domínio e infraestrutura

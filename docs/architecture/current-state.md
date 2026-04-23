# Estado atual da arquitetura

Este documento descreve o estado atual do projeto de forma objetiva.

## Resumo do fluxo principal

Atualmente, o sistema funciona assim:

1. a `control-api` recebe requisições HTTP
2. a API valida entrada com Zod
3. a API persiste dados no PostgreSQL
4. a API enfileira jobs no Redis via BullMQ
5. o `dispatch-worker` consome os jobs
6. o worker busca os dados necessários no PostgreSQL
7. o worker envia o e-mail via Nodemailer/SMTP
8. o Mailpit recebe os e-mails em ambiente local
9. o status do dispatch é atualizado no PostgreSQL

## Estrutura atual

### Apps

- `apps/control-api`: entrada HTTP e orquestração dos fluxos da aplicação
- `apps/dispatch-worker`: processamento assíncrono e envio dos e-mails

### Packages

- `packages/shared`: configuração, logger, conexões, fila, SMTP, renderização de template e migrations
- `packages/core`: núcleo de domínio, contratos e tipos centrais

## Organização interna da control-api

A `control-api` está organizada em três áreas principais:

- `main/`: bootstrap da aplicação
- `presentation/`: rotas HTTP, schemas e OpenAPI
- `modules/`: módulos funcionais do sistema

Dentro de cada módulo, a estrutura atual está organizada em:

- `application/`: casos de uso e orquestração
- `http/`: handlers HTTP
- `repositories/`: acesso a dados e queries SQL
- `adapters/`: integrações específicas com fontes externas, quando necessário

## Organização interna do dispatch-worker

O `dispatch-worker` está organizado em:

- `main/`: bootstrap do processo
- `consumers/`: registro e criação dos consumers BullMQ
- `jobs/`: contrato do job consumido pela fila
- `modules/`: fluxo de aplicação e repositórios do worker

Essa estrutura reduz o acoplamento do consumer com SQL e deixa o processamento do dispatch mais legível.

## Configuração do sistema

O projeto hoje possui dois níveis de configuração:

- `.env`: configuração de ambiente e infraestrutura
- `config/system.config.json`: configuração default de comportamento do sistema

O arquivo JSON centraliza, neste momento:

- paginação default
- nomes de fila
- nomes de job
- fallback de conteúdo textual para envio
- defaults de preview de audiências
- path da integração com a CNPJ API

## Módulos existentes

### Health

Responsável por validar disponibilidade de PostgreSQL e Redis.

### Campaigns

Responsável pelo gerenciamento inicial de campanhas, incluindo:

- criação e consulta de campanhas
- atualização parcial de campanhas
- associação de template
- definição de audiência por origem e filtros
- persistência de dados operacionais básicos da campanha
- enfileiramento de dispatches para execução assíncrona
- pré-visualização dos destinatários resolvidos para uma campanha

### Audiences

Responsável por resolver destinatários a partir de lead sources e filtros.

Atualmente, existem adapters para:

- `cnpj-api`
- `csv-import`
- `manual-list`

### Email Dispatches

Responsável por listagem, consulta por ID e retry.

### Templates

Responsável por CRUD parcial de templates e integração com dispatch.

## Pontos fortes atuais

- fluxo principal funcional ponta a ponta
- persistência em PostgreSQL
- processamento assíncrono com BullMQ
- integração SMTP local com Mailpit
- configuração geral menos hard-coded
- separação mais clara entre caso de uso, repositório e infraestrutura
- contratos explícitos para resolução de destinatários por fonte externa

## Débitos técnicos ainda existentes

- `packages/core` ainda pode evoluir bastante em entidades e value objects
- ainda não há autenticação/autorização
- ainda não há testes automatizados
- não há padronização de erro de aplicação
- a documentação ainda precisa crescer junto com os módulos
- ainda não existe o módulo de `campaign executions`

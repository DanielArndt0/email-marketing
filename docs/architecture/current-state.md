# Estado atual da arquitetura

Este documento descreve o estado atual do projeto após a fase atual de construção do fluxo principal e da segunda rodada de organização da arquitetura.

## Visão geral

Hoje o sistema cobre o fluxo principal de e-mail marketing com persistência, fila, envio e consulta operacional:

1. A `control-api` recebe requisições HTTP.
2. A API valida entrada com Zod.
3. A API persiste dados no PostgreSQL.
4. A API enfileira jobs no Redis via BullMQ.
5. O `dispatch-worker` consome os jobs.
6. O worker busca os dados necessários no PostgreSQL.
7. O worker envia o e-mail via Nodemailer/SMTP.
8. O Mailpit recebe os e-mails em ambiente local.
9. O status do dispatch é atualizado no PostgreSQL.

## Estrutura atual

### Apps

- `apps/control-api`: entrada HTTP e orquestração dos casos de uso.
- `apps/dispatch-worker`: processamento assíncrono e envio dos e-mails.

### Packages

- `packages/shared`: configuração, logger, conexões, fila, SMTP, renderização de template e migrations.
- `packages/core`: constantes e contratos de domínio mais puros, ainda em amadurecimento.

## Organização interna da control-api

A `control-api` está organizada em três áreas principais:

- `main/`: bootstrap da aplicação.
- `presentation/`: rotas HTTP.
- `modules/`: módulos funcionais do sistema.

Dentro de cada módulo, a estrutura atual está organizada em:

- `application/`: casos de uso e orquestração.
- `http/`: handlers HTTP.
- `repositories/`: acesso a dados e queries SQL.

## Organização interna do dispatch-worker

O `dispatch-worker` está organizado em:

- `main/`: bootstrap do processo.
- `consumers/`: registro e criação dos consumers BullMQ.
- `jobs/`: contrato do job consumido pela fila.
- `modules/`: fluxo de aplicação e repositórios do worker.

Essa estrutura reduz o acoplamento do consumer com SQL e deixa o processamento do dispatch mais legível.

## Configuração do sistema

O projeto hoje possui dois níveis de configuração:

- `.env`: configuração de ambiente/infraestrutura
- `config/system.config.json`: configuração default de comportamento do sistema

O arquivo JSON centraliza, neste momento:

- paginação default
- nomes de fila
- nomes de job
- fallback de conteúdo textual para envio

## Packages compartilhados

### `shared`

Concentra infraestrutura reutilizável:

- carregamento de ambiente
- leitura da configuração JSON
- logger
- PostgreSQL
- Redis
- BullMQ
- SMTP
- renderização de templates
- migrations

### `core`

Começa a concentrar elementos mais semânticos do domínio, como:

- status de email dispatch
- regra de retry por status

Ainda é uma camada pequena, mas já estabelece a direção para uma arquitetura mais alinhada a DDD.

## Módulos existentes

### Health

Responsável por validar disponibilidade de PostgreSQL e Redis.

### Campaigns

Responsável por criar o dispatch, persistir conteúdo final e enfileirar o job.

### Email Dispatches

Responsável por listagem, consulta por ID e retry.

### Templates

Responsável por CRUD parcial de templates e integração com dispatch.

## Pontos fortes atuais

- fluxo principal funcional ponta a ponta;
- persistência em PostgreSQL;
- processamento assíncrono com BullMQ;
- integração SMTP local com Mailpit;
- configuração geral menos hard-coded;
- separação mais clara entre caso de uso, repositório e infraestrutura.

## Débitos técnicos ainda existentes

- `packages/core` ainda pode evoluir bastante;
- ainda não há autenticação/autorização;
- ainda não há testes automatizados;
- ainda não existe camada explícita de entidades/value objects do domínio;
- não há padronização de erro de aplicação;
- a documentação ainda precisa crescer junto com os módulos.

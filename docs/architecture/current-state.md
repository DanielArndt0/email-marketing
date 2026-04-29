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
7. o worker carrega o SMTP Sender vinculado ao dispatch
8. o worker envia o e-mail via Nodemailer/SMTP dinâmico
9. o MailPit recebe os e-mails em ambiente local quando a campaign usa o sender local
10. o status do dispatch é atualizado no PostgreSQL

## Estrutura atual

### Apps

- `apps/control-api`: entrada HTTP e orquestração dos fluxos da aplicação
- `apps/dispatch-worker`: processamento assíncrono e envio dos e-mails

### Packages

- `packages/shared`: configuração, logger, conexões, fila, SMTP, renderização de template e migrations
- `packages/core`: núcleo de domínio em amadurecimento

## Organização interna da control-api

A `control-api` está organizada em três áreas principais:

- `main/`: bootstrap da aplicação
- `presentation/`: rotas HTTP
- `modules/`: módulos funcionais do sistema

Dentro de cada módulo, a estrutura atual está organizada em:

- `application/`: casos de uso e orquestração
- `http/`: handlers HTTP
- `repositories/`: acesso a dados e queries SQL

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
- paths da CNPJ API para lead sources e domínios auxiliares

A escolha do SMTP usado em campaigns fica persistida no banco em `smtp_senders`, `campaigns.smtp_sender_id` e `email_dispatches.smtp_sender_id`.

## Módulos existentes

### Health

Responsável por validar disponibilidade de PostgreSQL e Redis.

### Campaigns

Responsável pelo gerenciamento inicial de campanhas, incluindo:

- criação e consulta de campanhas;
- atualização parcial de campanhas;
- associação de template;
- definição de audiência por origem e filtros;
- persistência de dados operacionais básicos da campanha;
- enfileiramento de dispatches para execução assíncrona.

### Audiences

Responsável por audiences persistidas, resolução de destinatários por lead source e previews operacionais.

### Domains

Responsável por expor domínios auxiliares da CNPJ API, como CNAEs e cidades, em formato padronizado para o front-end.

### SMTP Senders

Responsável por gerenciar remetentes SMTP reutilizáveis, incluindo dados públicos do remetente, conexão SMTP, teste de conexão/envio e credenciais criptografadas.

### Email Dispatches

Responsável por listagem, consulta por ID e retry.

### Templates

Responsável por CRUD parcial de templates e integração com dispatch.

## Pontos fortes atuais

- fluxo principal funcional ponta a ponta
- persistência em PostgreSQL
- processamento assíncrono com BullMQ
- integração SMTP local com MailPit via sender cadastrado no banco
- configuração geral menos hard-coded
- separação mais clara entre caso de uso, repositório e infraestrutura

## Débitos técnicos ainda existentes

- `packages/core` ainda pode evoluir bastante
- ainda não há autenticação/autorização
- ainda não há testes automatizados
- ainda não existe camada explícita de entidades e value objects do domínio
- não há padronização de erro de aplicação
- a documentação ainda precisa crescer junto com os módulos

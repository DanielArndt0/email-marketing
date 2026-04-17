# Package Shared

## Papel

O `shared` concentra a infraestrutura comum reutilizada por mais de um app.

## Conteúdo atual

- configuração de ambiente;
- logger;
- conexão com PostgreSQL;
- conexão com Redis;
- fila BullMQ;
- SMTP/Nodemailer;
- renderização simples de templates;
- runner de migrations.

## Diretriz

Tudo o que for infraestrutura comum e não pertencer a um único app deve ser avaliado primeiro para viver em `shared`.

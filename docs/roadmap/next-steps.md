# Próximos passos

Este documento concentra pontos de evolução planejados ou desejáveis para o projeto.

## Infraestrutura e Docker

- Validar os arquivos `infra/compose.infra.local.yaml` e `infra/compose.infra.dockerized.yaml` em ambiente limpo.
- Consolidar publicação futura das imagens Docker em registry, como GHCR.
- Criar um Compose de produção separado, preferencialmente fora do repositório público ou sem segredos.

## Banco de dados

- Evoluir o fluxo atual de scripts SQL para um mecanismo formal de migrations.
- Versionar alterações incrementais de schema sem depender apenas de execução manual no pgAdmin.
- Documentar seeds mínimos para desenvolvimento local.

## API e Worker

- Ampliar cobertura de testes.
- Consolidar regras de domínio no `packages/core`.
- Reduzir duplicidade entre Control API e Dispatch Worker.

## Documentação

- Manter os documentos de setup alinhados com os arquivos reais da pasta `infra/`.
- Documentar fluxos completos de criação de campaign, audience, template, SMTP Sender e dispatch.

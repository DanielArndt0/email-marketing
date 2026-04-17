# Próximos passos

Este roadmap organiza a evolução do sistema em trilhas.

## Trilha 1 — Arquitetura

- amadurecer `packages/core`;
- introduzir ports/interfaces para repositórios;
- reduzir ainda mais o acoplamento com tipos de infraestrutura;
- padronizar erros de aplicação;
- consolidar configuração de sistema e futura persistência dessas configurações.

## Trilha 2 — Produto

- módulo de contatos;
- módulo de listas;
- campanhas com segmentação real;
- agendamento de campanhas;
- métricas básicas de envio;
- variáveis mais ricas de template.

## Trilha 3 — Operação

- observabilidade mais forte;
- reprocessamento controlado de jobs;
- logs estruturados mais consistentes;
- paginação/filtros adicionais nas consultas;
- configurações operacionais via banco no futuro.

## Trilha 4 — Qualidade

- testes unitários;
- testes de integração;
- smoke tests para API e worker;
- documentação de fluxo e decisões arquiteturais.

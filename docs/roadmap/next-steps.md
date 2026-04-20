# Próximos passos

Este roadmap organiza a evolução do sistema em trilhas.

## Trilha 1 — Arquitetura

- amadurecer `packages/core`
- introduzir ports e interfaces para repositórios
- reduzir ainda mais o acoplamento com tipos de infraestrutura
- padronizar erros de aplicação
- consolidar configuração de sistema e futura persistência dessas configurações

## Trilha 2 — Produto

- módulo de campaigns mais completo, com execution e scheduling
- módulo de audiences com origem e filtros
- contratos de lead sources integráveis (CNPJ API, CSV, manual, conectores futuros)
- snapshots de destinatários por execução
- métricas básicas de envio
- variáveis mais ricas de template

## Trilha 3 — Operação

- observabilidade mais forte
- reprocessamento controlado de jobs
- logs estruturados mais consistentes
- filtros adicionais nas consultas
- configurações operacionais via banco no futuro

## Trilha 4 — Qualidade

- testes unitários
- testes de integração
- smoke tests para API e worker
- documentação de fluxo e decisões arquiteturais

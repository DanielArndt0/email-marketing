# Contribuindo

Este documento descreve o fluxo recomendado para colaboração no repositório e serve como ponto central para orientar alterações em código, documentação e arquitetura.

## Antes de começar

Antes de abrir uma issue ou enviar um pull request, leia estes documentos:

- [Visão geral da arquitetura](./docs/architecture/overview.md)
- [Estado atual da arquitetura](./docs/architecture/current-state.md)
- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)
- [Desenvolvimento local](./docs/setup/local-development.md)
- [Scripts do projeto](./docs/conventions/scripts.md)
- [Roadmap](./docs/roadmap/next-steps.md)

Se a sua contribuição tocar especificamente a API HTTP ou o worker, também vale consultar:

- [Control API](./docs/apps/control-api.md)
- [Endpoints da Control API](./docs/apps/control-api/endpoints.md)
- [Dispatch Worker](./docs/apps/dispatch-worker.md)
- [Package Core](./docs/packages/core.md)
- [Package Shared](./docs/packages/shared.md)

## Quando abrir uma issue

Abra uma issue quando você quiser:

- reportar bug
- propor refatoração estrutural
- sugerir melhoria de arquitetura
- discutir alteração de comportamento
- pedir documentação adicional
- propor nova feature

### Boas práticas para issues

Procure incluir:

- contexto do problema
- comportamento atual
- comportamento esperado
- impacto técnico ou operacional
- área afetada do projeto
- referências para documentação relacionada

### Atalhos úteis por assunto

- Refatoração: [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)
- Estrutura geral do monorepo: [Estrutura do projeto](./docs/conventions/project-structure.md)
- Estado atual do sistema: [Estado atual da arquitetura](./docs/architecture/current-state.md)
- Próximos passos planejados: [Roadmap](./docs/roadmap/next-steps.md)

## Fluxo recomendado de contribuição

O fluxo recomendado é:

1. ler a documentação relacionada ao tema
2. abrir uma issue quando a alteração for relevante ou estrutural
3. alinhar a proposta antes de uma mudança grande
4. criar uma branch específica
5. implementar a alteração em pequenos passos
6. rodar validações locais
7. atualizar a documentação, se necessário
8. abrir um pull request objetivo

## Branches

Sugestão de prefixos:

- `feat/` para novas funcionalidades
- `fix/` para correções
- `refactor/` para refatorações
- `docs/` para documentação
- `chore/` para manutenção
- `test/` para testes
- `infra/` para ajustes operacionais

Exemplos:

- `feat/templates-update`
- `fix/dispatch-retry-status`
- `refactor/control-api-repositories`
- `docs/local-development`

## Commits

Atualmente, o projeto ainda não adota formalmente uma convenção obrigatória de commits.

No entanto, a partir da primeira release, a recomendação é passar a utilizar um padrão inspirado em Conventional Commits, para melhorar a organização do histórico, a legibilidade das mudanças e a evolução do projeto.

Formato recomendado:

```text
<tipo>(<escopo>): <descrição>
```

Exemplos:

- `feat(control-api): adicionada listagem de dispatches com filtros básicos`
- `fix(infra): ajustada porta do PostgreSQL dockerizado para coexistência com instância local`
- `refactor(shared): centralizada leitura da configuração do sistema`
- `docs(control-api): detalhados endpoints da API`

### Tipos mais usados

- `feat`
- `fix`
- `refactor`
- `docs`
- `chore`
- `test`
- `infra`

## Pull requests

Ao abrir um pull request, procure:

- manter um escopo claro
- evitar misturar feature, refatoração e documentação sem necessidade
- explicar o problema resolvido
- descrever o impacto da mudança
- listar os pontos principais alterados
- apontar documentos atualizados, quando houver

### Checklist recomendado para PR

- [ ] a mudança está alinhada com a documentação atual
- [ ] a alteração respeita a estrutura do projeto
- [ ] os scripts de validação relevantes foram executados
- [ ] a documentação foi atualizada, quando necessário
- [ ] não há hard-coded novo sem justificativa
- [ ] o código segue a organização prevista para apps, modules e packages

## Refatorações

Se a contribuição envolver refatoração, leia antes:

- [Diretrizes de refatoração](./docs/architecture/refactoring-guidelines.md)
- [Estado atual da arquitetura](./docs/architecture/current-state.md)

O objetivo é evitar refatorações desconectadas do plano atual do projeto.

## Documentação

Toda mudança relevante em fluxo, estrutura, convenção, configuração ou arquitetura deve vir acompanhada de atualização na documentação correspondente.

Documentos mais comuns a revisar:

- [README da documentação](./docs/README.md)
- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Scripts do projeto](./docs/conventions/scripts.md)
- [Desenvolvimento local](./docs/setup/local-development.md)
- [Current State](./docs/architecture/current-state.md)
- [Roadmap](./docs/roadmap/next-steps.md)

## Ambiente local

Antes de contribuir com código, prepare o ambiente conforme:

- [Desenvolvimento local](./docs/setup/local-development.md)

Esse documento descreve dependências locais, variáveis de ambiente, Docker Compose, portas padrão e uso do Mailpit.

## Organização esperada do código

Antes de mover arquivos ou introduzir nova pasta, confira:

- [Estrutura do projeto](./docs/conventions/project-structure.md)
- [Package Core](./docs/packages/core.md)
- [Package Shared](./docs/packages/shared.md)

## Escopo atual do projeto

O projeto ainda está em evolução e parte do trabalho atual envolve:

- amadurecer o `packages/core`
- reduzir hard-coded espalhado
- consolidar regras semânticas fora da camada HTTP
- fortalecer a documentação
- preparar a base para contatos, listas, campanhas e operações mais completas

Para alinhar contribuições com essa direção, veja:

- [Roadmap](./docs/roadmap/next-steps.md)

## Observação final

O objetivo da contribuição não é apenas adicionar código novo, mas também preservar legibilidade, previsibilidade, clareza arquitetural e consistência da base.

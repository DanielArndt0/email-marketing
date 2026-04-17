# Diretrizes de refatoração

Este documento registra as diretrizes adotadas para manter a evolução do projeto consistente.

## Objetivo

Evitar crescimento desorganizado da base de código e preservar legibilidade, previsibilidade e segurança.

## Princípios gerais

Toda refatoração deve buscar pelo menos um destes resultados:

- reduzir acoplamento
- melhorar legibilidade
- diminuir duplicação
- tornar o fluxo de aplicação mais previsível
- aproximar a implementação da arquitetura desejada
- reduzir hard-coded disperso

## Regras adotadas

### 1. Casos de uso não devem carregar SQL diretamente

A camada `application` deve orquestrar regras e fluxo.

Queries, comandos SQL e mapeamentos de persistência devem ficar em `repositories/`.

### 2. Handlers HTTP não devem conter regra de negócio

Os handlers devem:

- validar entrada
- chamar um caso de uso
- traduzir o resultado em resposta HTTP

### 3. `main/` deve cuidar apenas de bootstrap

A camada `main` deve se limitar a:

- subir a aplicação
- inicializar conexões
- registrar rotas ou consumers
- tratar shutdown gracioso

### 4. Repetições utilitárias devem ser extraídas

Transformações de data, paginação, resolução de paths, leitura de config e helpers repetidos devem ser centralizados quando começarem a aparecer em mais de um lugar.

### 5. Infraestrutura comum deve ficar em `packages/shared`

Sempre que um recurso for usado por mais de um app, a primeira pergunta deve ser:

> isso deve viver no `shared`?

### 6. Regras semânticas devem migrar gradualmente para o `core`

Toda regra que represente comportamento do domínio e não dependa de framework deve ser candidata a viver em `packages/core`.

### 7. Configuração deve ser centralizada

Valores operacionais repetidos devem ser movidos para:

- `.env`, quando forem sensíveis ao ambiente
- `config/system.config.json`, quando forem defaults de comportamento

## Fluxo sugerido de refatoração

Ao refatorar uma área do projeto, a sequência sugerida é:

1. identificar duplicação, acoplamento ou hard-coded excessivo
2. localizar a responsabilidade correta do trecho
3. mover o código para a camada apropriada
4. ajustar imports e contratos
5. validar comportamento
6. atualizar documentação se a estrutura tiver mudado

## O que evitar

Evite:

- mover lógica sem clarificar responsabilidade
- introduzir abstrações desnecessárias cedo demais
- misturar refatoração estrutural com várias features ao mesmo tempo
- criar camada nova sem necessidade clara
- espalhar configuração por múltiplos arquivos sem critério

## Próxima evolução recomendada

As próximas refatorações devem priorizar:

- amadurecimento do `packages/core`
- contratos e ports explícitos para repositórios
- testes automatizados
- padronização de respostas de erro
- documentação por módulo
- organização de contatos, listas e campanhas em módulos mais completos

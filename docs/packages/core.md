# Package Core

## Situação atual

O `core` ainda está em fase inicial e subutilizado.

## Papel esperado

Este pacote deve concentrar, ao longo da evolução do projeto:

- entidades de domínio;
- value objects;
- contratos mais puros;
- regras de negócio independentes de framework;
- tipos mais estáveis entre API e worker.

## Observação

Hoje parte da lógica ainda vive nos apps. O objetivo futuro é deslocar o que for domínio real para o `core`.

# Variáveis de templates

Templates podem declarar variáveis permitidas no campo `variables`.

Essas variáveis são usadas no `subject`, `htmlContent` e `textContent` com a sintaxe:

```text
{{company}}
{{municipio}}
{{uf}}
```

## Campos da variável

Cada variável declarada pode conter:

- `key`: identificador usado no template, como `company` ou `uf`;
- `label`: nome amigável para a interface;
- `required`: indica se a variável é obrigatória;
- `description`: explicação de uso;
- `example`: valor de exemplo.

## Detecção automática

A API também detecta automaticamente as variáveis usadas no conteúdo e retorna:

- `detectedVariables`;
- `variableValidation.declaredVariables`;
- `variableValidation.undeclaredVariables`;
- `variableValidation.unusedDeclaredVariables`;
- `variableValidation.isValid`.

Isso permite que o front-end destaque variáveis usadas no HTML/texto que ainda não foram declaradas no template.

## Mapeamento em campanhas

O template declara quais variáveis existem. A campaign define de onde vem o valor de cada variável.

Exemplo:

```json
{
  "templateVariableMappings": {
    "company": {
      "source": "lead",
      "path": "metadata.razaoSocial"
    },
    "municipio": {
      "source": "lead",
      "path": "metadata.municipio"
    },
    "uf": {
      "source": "lead",
      "path": "metadata.uf"
    },
    "link": {
      "source": "static",
      "value": "https://exemplo.com/oferta"
    }
  }
}
```

Esse desenho permite usar o mesmo template com diferentes fontes de leads, como CNPJ API, CSV import ou lista manual.

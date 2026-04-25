export const cnpjApiDomainQuerySchema = {
  type: "object",
  properties: {
    page: {
      type: "integer",
      minimum: 1,
      default: 1,
      examples: [1],
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      default: 20,
      examples: [20],
    },
    q: {
      type: "string",
      description:
        "Filtro textual leve aplicado pela CNPJ API sobre código e descrição.",
      examples: ["software", "londrina"],
    },
    code: {
      type: "string",
      description: "Código exato do domínio quando disponível.",
      examples: ["6201501", "4113700"],
    },
  },
} as const;

export const cnpjApiDomainItemSchema = {
  type: "object",
  required: ["code", "description"],
  properties: {
    code: {
      type: "string",
      examples: ["6201501", "4113700"],
    },
    description: {
      type: "string",
      examples: [
        "Desenvolvimento de programas de computador sob encomenda",
        "Londrina",
      ],
    },
  },
} as const;

export const cnpjApiDomainListSchema = {
  type: "object",
  required: ["domain", "page", "limit", "count", "hasNextPage", "items"],
  properties: {
    domain: {
      type: "string",
      enum: ["cnaes", "cities"],
      examples: ["cnaes"],
    },
    page: {
      type: "integer",
      examples: [1],
    },
    limit: {
      type: "integer",
      examples: [20],
    },
    count: {
      type: "integer",
      examples: [20],
    },
    hasNextPage: {
      type: "boolean",
      examples: [true],
    },
    items: {
      type: "array",
      items: cnpjApiDomainItemSchema,
    },
  },
} as const;

export const domainMessageSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

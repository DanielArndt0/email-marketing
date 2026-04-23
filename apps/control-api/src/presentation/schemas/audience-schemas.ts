export const audienceRecordSchema = {
  type: "object",
  required: ["id", "name", "definition", "createdAt", "updatedAt"],
  properties: {
    id: { type: "string", examples: ["audience-001"] },
    name: { type: "string", examples: ["Empresas PR por CNAE"] },
    description: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["Audience voltada à prospecção de empresas do Paraná."],
    },
    definition: {
      type: "object",
      required: ["sourceType", "filters"],
      properties: {
        sourceType: {
          type: "string",
          enum: ["cnpj-api", "csv-import", "manual-list"],
          examples: ["cnpj-api"],
        },
        filters: {
          type: "object",
          additionalProperties: true,
          examples: [
            {
              searchType: "cnae",
              codigosCnae: ["6201501", "6202300"],
              uf: "PR",
              municipio: "Londrina",
            },
          ],
        },
      },
    },
    createdAt: { type: "string", examples: ["2026-04-23T10:00:00.000Z"] },
    updatedAt: { type: "string", examples: ["2026-04-23T10:00:00.000Z"] },
  },
} as const;

export const audienceListSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "total", "totalPages"],
  properties: {
    items: { type: "array", items: audienceRecordSchema },
    page: { type: "integer", examples: [1] },
    pageSize: { type: "integer", examples: [20] },
    total: { type: "integer", examples: [1] },
    totalPages: { type: "integer", examples: [1] },
  },
} as const;

export const audienceParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string", examples: ["audience-001"] },
  },
} as const;

export const audiencePreviewQuerySchema = {
  type: "object",
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      examples: [20],
    },
  },
} as const;

export const audienceCreateBodySchema = {
  type: "object",
  required: ["name", "sourceType", "filters"],
  properties: {
    name: { type: "string", examples: ["Empresas PR por CNAE"] },
    description: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["Audience cadastrada a partir da CNPJ API."],
    },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
      examples: ["cnpj-api"],
    },
    filters: {
      type: "object",
      additionalProperties: true,
      examples: [
        {
          searchType: "cnae",
          codigosCnae: ["6201501", "6202300"],
          uf: "PR",
          municipio: "Londrina",
        },
        {
          searchType: "razao-social",
          razaoSocial: "tecnologia",
          uf: "SC",
        },
        {
          recipients: [
            { email: "contato@empresa.com", externalId: "manual-001" },
            { email: "financeiro@empresa.com" },
          ],
        },
        {
          csvContent: "email,nome\ncontato@empresa.com,Empresa A",
          emailColumn: "email",
          delimiter: ",",
        },
      ],
    },
  },
} as const;

export const audienceUpdateBodySchema = {
  type: "object",
  properties: {
    name: { type: "string", examples: ["Novo nome da audience"] },
    description: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["Descrição atualizada."],
    },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
      examples: ["manual-list"],
    },
    filters: {
      type: "object",
      additionalProperties: true,
      examples: [{ recipients: [{ email: "novo@empresa.com" }] }],
    },
  },
  minProperties: 1,
} as const;

export const audienceResolveBodySchema = {
  type: "object",
  required: ["sourceType", "filters"],
  properties: {
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
      examples: ["cnpj-api"],
    },
    filters: {
      type: "object",
      additionalProperties: true,
      description:
        "Filtros dependem do sourceType. Para cnpj-api, usar searchType=cnae|razao-social|socio.",
      examples: [
        {
          searchType: "cnae",
          codigosCnae: ["6201501"],
          uf: "PR",
          municipio: "Londrina",
        },
        {
          searchType: "razao-social",
          razaoSocial: "tecnologia",
          uf: "SP",
        },
        {
          searchType: "socio",
          nomeSocio: "JOSE",
          uf: "RJ",
        },
      ],
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      examples: [20],
    },
  },
} as const;

export const leadRecipientSchema = {
  type: "object",
  required: ["email", "externalId", "sourceType", "metadata"],
  properties: {
    email: {
      type: "string",
      format: "email",
      examples: ["contato@empresa.com"],
    },
    externalId: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["12345678000199"],
    },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
      examples: ["cnpj-api"],
    },
    metadata: {
      type: "object",
      examples: [{ companyName: "Empresa A", city: "Londrina" }],
    },
  },
} as const;

export const audiencePreviewSchema = {
  type: "object",
  required: ["sourceType", "requestedLimit", "count", "items"],
  properties: {
    audienceId: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["audience-001"],
    },
    campaignId: {
      anyOf: [{ type: "string" }, { type: "null" }],
      examples: ["campaign-001"],
    },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
      examples: ["cnpj-api"],
    },
    requestedLimit: { type: "integer", examples: [20] },
    count: { type: "integer", examples: [2] },
    items: {
      type: "array",
      items: leadRecipientSchema,
    },
  },
} as const;

export const messageSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

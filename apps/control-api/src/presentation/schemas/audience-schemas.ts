export const leadRecipientSchema = {
  type: "object",
  required: ["email", "externalId", "sourceType", "metadata"],
  properties: {
    email: { type: "string" },
    externalId: { type: ["string", "null"] },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
    },
    metadata: {
      type: "object",
      additionalProperties: true,
    },
  },
} as const;

export const audienceResolveBodySchema = {
  type: "object",
  required: ["sourceType", "filters"],
  properties: {
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
    },
    filters: {
      type: "object",
      additionalProperties: true,
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 200,
      default: 20,
    },
  },
} as const;

export const audiencePreviewQuerySchema = {
  type: "object",
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 200,
      default: 20,
    },
  },
} as const;

export const audiencePreviewResponseSchema = {
  type: "object",
  required: ["items", "count", "sourceType", "appliedLimit"],
  properties: {
    items: {
      type: "array",
      items: leadRecipientSchema,
    },
    count: { type: "integer" },
    sourceType: {
      type: "string",
      enum: ["cnpj-api", "csv-import", "manual-list"],
    },
    appliedLimit: { type: "integer" },
  },
} as const;

export const notConfiguredMessageSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

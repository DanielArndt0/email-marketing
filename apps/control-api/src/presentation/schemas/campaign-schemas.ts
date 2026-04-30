export const audienceSummarySchema = {
  anyOf: [
    {
      type: "object",
      required: ["id", "name", "description", "sourceType", "filters"],
      properties: {
        id: { type: "string", examples: ["audience-001"] },
        name: { type: "string", examples: ["Empresas PR por CNAE"] },
        description: { type: ["string", "null"] },
        sourceType: {
          type: "string",
          enum: ["cnpj-api", "csv-import", "manual-list"],
        },
        filters: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
    { type: "null" },
  ],
} as const;

const campaignTemplateVariableSchema = {
  type: "object",
  properties: {
    key: { type: "string" },
    label: { type: "string" },
    required: { type: "boolean" },
    description: { type: "string" },
    example: { type: "string" },
  },
  required: ["key"],
  additionalProperties: false,
} as const;

const campaignTemplateSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    subject: { type: "string" },
    variables: {
      type: "array",
      items: campaignTemplateVariableSchema,
    },
  },
  required: ["id", "name", "subject", "variables"],
  additionalProperties: false,
} as const;

const campaignSmtpSenderSchema = {
  type: "object",
  required: ["id", "name", "fromName", "fromEmail", "replyToEmail", "isActive"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    fromName: { type: "string" },
    fromEmail: { type: "string" },
    replyToEmail: { type: ["string", "null"] },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export const templateVariableMappingSchema = {
  anyOf: [
    {
      type: "object",
      required: ["source", "path"],
      properties: {
        source: { type: "string", const: "lead" },
        path: { type: "string", examples: ["metadata.razaoSocial"] },
        fallback: { type: "string", examples: ["sua empresa"] },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      required: ["source", "value"],
      properties: {
        source: { type: "string", const: "static" },
        value: { type: "string", examples: ["https://exemplo.com/oferta"] },
      },
      additionalProperties: false,
    },
  ],
} as const;

export const templateVariableMappingsSchema = {
  type: "object",
  additionalProperties: templateVariableMappingSchema,
  examples: [
    {
      company: { source: "lead", path: "metadata.razaoSocial" },
      municipio: { source: "lead", path: "metadata.municipio" },
      uf: { source: "lead", path: "metadata.uf" },
      link: { source: "static", value: "https://exemplo.com/oferta" },
    },
  ],
} as const;

export const campaignSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "goal",
    "subject",
    "status",
    "templateId",
    "templateVariableMappings",
    "audienceId",
    "audience",
    "template",
    "smtpSenderId",
    "smtpSender",
    "scheduleAt",
    "lastExecutionAt",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    goal: { type: ["string", "null"] },
    subject: { type: ["string", "null"] },
    status: {
      type: "string",
      enum: [
        "draft",
        "ready",
        "scheduled",
        "running",
        "paused",
        "completed",
        "canceled",
        "failed",
      ],
    },
    templateId: { type: ["string", "null"] },
    template: {
      anyOf: [campaignTemplateSchema, { type: "null" }],
    },
    templateVariableMappings: templateVariableMappingsSchema,
    audienceId: { type: ["string", "null"] },
    audience: audienceSummarySchema,
    smtpSenderId: { type: ["string", "null"] },
    smtpSender: {
      anyOf: [campaignSmtpSenderSchema, { type: "null" }],
    },
    scheduleAt: { type: ["string", "null"], format: "date-time" },
    lastExecutionAt: { type: ["string", "null"], format: "date-time" },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const campaignPaginationResponseSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "total", "totalPages"],
  properties: {
    items: {
      type: "array",
      items: campaignSchema,
    },
    page: { type: "integer" },
    pageSize: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
} as const;

export const createCampaignBodySchema = {
  type: "object",
  required: ["name"],
  properties: {
    name: { type: "string", examples: ["Campanha B2B Sul"] },
    goal: { type: ["string", "null"] },
    subject: { type: ["string", "null"] },
    status: {
      type: "string",
      enum: [
        "draft",
        "ready",
        "scheduled",
        "running",
        "paused",
        "completed",
        "canceled",
        "failed",
      ],
      default: "draft",
    },
    templateId: { type: ["string", "null"] },
    audienceId: { type: ["string", "null"], examples: ["audience-001"] },
    smtpSenderId: { type: ["string", "null"] },
    templateVariableMappings: templateVariableMappingsSchema,
    scheduleAt: { type: ["string", "null"], format: "date-time" },
  },
} as const;

export const updateCampaignBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    goal: { type: ["string", "null"] },
    subject: { type: ["string", "null"] },
    status: {
      type: "string",
      enum: [
        "draft",
        "ready",
        "scheduled",
        "running",
        "paused",
        "completed",
        "canceled",
        "failed",
      ],
    },
    templateId: { type: ["string", "null"] },
    audienceId: { type: ["string", "null"] },
    smtpSenderId: { type: ["string", "null"] },
    templateVariableMappings: templateVariableMappingsSchema,
    scheduleAt: { type: ["string", "null"], format: "date-time" },
  },
  additionalProperties: false,
} as const;

export const campaignParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const listCampaignsQuerySchema = {
  type: "object",
  properties: {
    status: {
      type: "string",
      enum: [
        "draft",
        "ready",
        "scheduled",
        "running",
        "paused",
        "completed",
        "canceled",
        "failed",
      ],
    },
    audienceId: { type: "string" },
    page: { type: "integer", minimum: 1, default: 1 },
    pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
  },
} as const;

export const notFoundMessageSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

export const deleteCampaignRouteSchema = {
  tags: ["campaigns"],
  summary: "Exclui uma campaign quando não houver dispatches vinculados",
  params: campaignParamsSchema,
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", example: "deleted" },
        id: { type: "string" },
      },
      required: ["status", "id"],
    },
    404: notFoundMessageSchema,
    409: {
      type: "object",
      properties: {
        message: { type: "string" },
        dispatchesCount: { type: "number" },
      },
      required: ["message", "dispatchesCount"],
    },
  },
} as const;

export const dispatchCampaignBodySchema = {
  type: "object",
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      description:
        "Limite opcional de destinatários para este disparo. Se omitido, usa a configuração da própria audience/fonte.",
      examples: [50],
    },
  },
  additionalProperties: false,
} as const;

export const dispatchCampaignResponseSchema = {
  type: "object",
  required: [
    "kind",
    "campaignId",
    "resolvedRecipientsCount",
    "createdDispatchesCount",
    "queuedDispatchesCount",
    "skippedRecipientsCount",
    "dispatchIds",
  ],
  properties: {
    kind: { type: "string", const: "accepted" },
    campaignId: { type: "string" },
    resolvedRecipientsCount: { type: "integer" },
    createdDispatchesCount: { type: "integer" },
    queuedDispatchesCount: { type: "integer" },
    skippedRecipientsCount: { type: "integer" },
    dispatchIds: {
      type: "array",
      items: { type: "string" },
    },
  },
} as const;

export const dispatchCampaignsBatchBodySchema = {
  type: "object",
  required: ["campaignIds"],
  properties: {
    campaignIds: {
      type: "array",
      minItems: 1,
      items: { type: "string" },
    },
    limitPerCampaign: {
      type: "integer",
      minimum: 1,
      description:
        "Limite opcional por campaign. Se omitido, cada campaign usa a configuração da própria audience/fonte.",
      examples: [50],
    },
  },
  additionalProperties: false,
} as const;

export const dispatchCampaignsBatchResponseSchema = {
  type: "object",
  required: ["status", "items"],
  properties: {
    status: { type: "string", const: "accepted" },
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
} as const;

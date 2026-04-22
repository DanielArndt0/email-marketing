export const audienceDefinitionSchema = {
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
  },
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
    "audience",
    "scheduleAt",
    "lastExecutionAt",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    goal: { type: ["string", "null"] },
    subject: { type: "string" },
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
    audience: {
      anyOf: [audienceDefinitionSchema, { type: "null" }],
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

export const campaignCreateBodySchema = {
  type: "object",
  required: ["name", "subject"],
  properties: {
    name: { type: "string" },
    goal: { type: "string" },
    subject: { type: "string" },
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
    audience: audienceDefinitionSchema,
    scheduleAt: { type: ["string", "null"], format: "date-time" },
  },
} as const;

export const campaignUpdateBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    goal: { type: ["string", "null"] },
    subject: { type: "string" },
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
    audience: {
      anyOf: [audienceDefinitionSchema, { type: "null" }],
    },
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

export const campaignListQuerySchema = {
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

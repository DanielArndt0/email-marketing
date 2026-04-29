export const smtpSenderSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "fromName",
    "fromEmail",
    "replyToEmail",
    "host",
    "port",
    "secure",
    "username",
    "isActive",
    "lastTestedAt",
    "lastTestStatus",
    "lastTestError",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    fromName: { type: "string" },
    fromEmail: { type: "string" },
    replyToEmail: { type: ["string", "null"] },
    host: { type: "string" },
    port: { type: "integer" },
    secure: { type: "boolean" },
    username: { type: "string" },
    isActive: { type: "boolean" },
    lastTestedAt: { type: ["string", "null"] },
    lastTestStatus: { type: ["string", "null"] },
    lastTestError: { type: ["string", "null"] },
    createdAt: { type: "string" },
    updatedAt: { type: "string" },
  },
  additionalProperties: false,
} as const;

export const smtpSenderListQuerySchema = {
  type: "object",
  properties: {
    page: { type: "integer", minimum: 1, default: 1 },
    pageSize: { type: "integer", minimum: 1, maximum: 100, default: 20 },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export const smtpSenderPaginationResponseSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "total", "totalPages"],
  properties: {
    items: {
      type: "array",
      items: smtpSenderSchema,
    },
    page: { type: "integer" },
    pageSize: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
} as const;

export const smtpSenderParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const smtpSenderCreateBodySchema = {
  type: "object",
  required: [
    "name",
    "fromName",
    "fromEmail",
    "host",
    "port",
    "secure",
    "username",
    "password",
  ],
  properties: {
    name: { type: "string", minLength: 1 },
    fromName: { type: "string", minLength: 1 },
    fromEmail: { type: "string", minLength: 1 },
    replyToEmail: { type: ["string", "null"] },
    host: { type: "string", minLength: 1 },
    port: { type: "integer", minimum: 1, maximum: 65535 },
    secure: { type: "boolean" },
    username: { type: "string", minLength: 1 },
    password: { type: "string", minLength: 1 },
    isActive: { type: "boolean", default: true },
  },
  additionalProperties: false,
} as const;

export const smtpSenderUpdateBodySchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1 },
    fromName: { type: "string", minLength: 1 },
    fromEmail: { type: "string", minLength: 1 },
    replyToEmail: { type: ["string", "null"] },
    host: { type: "string", minLength: 1 },
    port: { type: "integer", minimum: 1, maximum: 65535 },
    secure: { type: "boolean" },
    username: { type: "string", minLength: 1 },
    password: { type: "string", minLength: 1 },
    isActive: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

export const smtpSenderTestBodySchema = {
  type: "object",
  properties: {
    to: { type: "string" },
  },
  additionalProperties: false,
} as const;

export const smtpSenderTestResponseSchema = {
  type: "object",
  required: ["status", "message", "testedAt"],
  properties: {
    status: { type: "string" },
    message: { type: "string" },
    testedAt: { type: "string" },
  },
} as const;

export const smtpSenderDeleteResponseSchema = {
  type: "object",
  required: ["status", "id"],
  properties: {
    status: { type: "string", example: "deleted" },
    id: { type: "string" },
  },
} as const;

export const smtpSenderInUseResponseSchema = {
  type: "object",
  required: ["message", "campaignsCount"],
  properties: {
    message: { type: "string" },
    campaignsCount: { type: "integer" },
  },
} as const;

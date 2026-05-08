export const emailFileSchema = {
  type: "object",
  required: [
    "id",
    "templateId",
    "kind",
    "originalName",
    "storedName",
    "mimeType",
    "sizeBytes",
    "storageKey",
    "cid",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    templateId: { type: "string" },
    kind: {
      type: "string",
      enum: ["template_inline_asset", "template_attachment"],
    },
    originalName: { type: "string", examples: ["logo-garbo.png"] },
    storedName: { type: "string", examples: ["logo-garbo-169.png"] },
    mimeType: { type: "string", examples: ["image/png", "application/pdf"] },
    sizeBytes: { type: "integer", examples: [154332] },
    storageKey: {
      type: "string",
      examples: ["storage/templates/template-001/logo-garbo.png"],
    },
    cid: { type: ["string", "null"], examples: ["logo-garbo"] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
  additionalProperties: false,
} as const;

export const emailFileListSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "total", "totalPages"],
  properties: {
    items: { type: "array", items: emailFileSchema },
    page: { type: "integer" },
    pageSize: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
} as const;

export const createEmailFileBodySchema = {
  type: "object",
  required: ["originalName", "mimeType", "sizeBytes", "storageKey"],
  properties: {
    originalName: { type: "string", examples: ["proposta.pdf"] },
    storedName: { type: "string", examples: ["template-001/proposta.pdf"] },
    mimeType: { type: "string", examples: ["application/pdf"] },
    sizeBytes: { type: "integer", minimum: 0, examples: [532144] },
    storageKey: {
      type: "string",
      description:
        "Caminho/identificador do arquivo no storage usado pelo worker no Nodemailer.",
      examples: ["storage/templates/template-001/proposta.pdf"],
    },
    cid: {
      type: "string",
      description:
        "Obrigatório para assets inline do template. Não deve ser usado em anexos comuns do template.",
      examples: ["logo-garbo"],
    },
  },
  additionalProperties: false,
} as const;

export const templateFileParamsSchema = {
  type: "object",
  required: ["templateId"],
  properties: { templateId: { type: "string" } },
} as const;

export const emailFileParamsSchema = {
  type: "object",
  required: ["templateId", "fileId"],
  properties: {
    templateId: { type: "string" },
    fileId: { type: "string" },
  },
} as const;

export const emailFileMessageSchema = {
  type: "object",
  required: ["message"],
  properties: { message: { type: "string" }, cid: { type: "string" } },
  additionalProperties: true,
} as const;

export const deleteEmailFileResponseSchema = {
  type: "object",
  required: ["status", "id"],
  properties: {
    status: { type: "string", examples: ["deleted"] },
    id: { type: "string" },
  },
} as const;

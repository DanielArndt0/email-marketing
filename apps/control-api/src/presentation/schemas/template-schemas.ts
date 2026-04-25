export const templateVariableSchema = {
  type: "object",
  required: ["key"],
  properties: {
    key: { type: "string", examples: ["company"] },
    label: { type: "string", examples: ["Empresa"] },
    required: { type: "boolean", examples: [true] },
    description: {
      type: "string",
      examples: ["Nome da empresa destinatária."],
    },
    example: { type: "string", examples: ["NDT Agency"] },
  },
  additionalProperties: false,
} as const;

export const variableValidationSchema = {
  type: "object",
  required: [
    "isValid",
    "declaredVariables",
    "detectedVariables",
    "undeclaredVariables",
    "unusedDeclaredVariables",
  ],
  properties: {
    isValid: { type: "boolean" },
    declaredVariables: { type: "array", items: { type: "string" } },
    detectedVariables: { type: "array", items: { type: "string" } },
    undeclaredVariables: { type: "array", items: { type: "string" } },
    unusedDeclaredVariables: { type: "array", items: { type: "string" } },
  },
} as const;

export const templateSchema = {
  type: "object",
  required: [
    "id",
    "name",
    "subject",
    "htmlContent",
    "textContent",
    "variables",
    "detectedVariables",
    "variableValidation",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    subject: { type: "string" },
    htmlContent: { type: ["string", "null"] },
    textContent: { type: ["string", "null"] },
    variables: {
      type: "array",
      items: templateVariableSchema,
    },
    detectedVariables: {
      type: "array",
      items: { type: "string" },
      examples: [["company", "municipio", "uf"]],
    },
    variableValidation: variableValidationSchema,
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
} as const;

export const templateListSchema = {
  type: "object",
  required: ["items", "page", "pageSize", "total", "totalPages"],
  properties: {
    items: { type: "array", items: templateSchema },
    page: { type: "integer" },
    pageSize: { type: "integer" },
    total: { type: "integer" },
    totalPages: { type: "integer" },
  },
} as const;

export const createTemplateBodySchema = {
  type: "object",
  required: ["name", "subject"],
  properties: {
    name: { type: "string", examples: ["Template comercial"] },
    subject: { type: "string", examples: ["Olá {{company}}"] },
    htmlContent: {
      type: "string",
      examples: ["<p>Empresa {{company}} em {{municipio}}/{{uf}}</p>"],
    },
    textContent: {
      type: "string",
      examples: ["Empresa {{company}} em {{municipio}}/{{uf}}"],
    },
    variables: {
      type: "array",
      items: templateVariableSchema,
      examples: [
        [
          { key: "company", label: "Empresa", required: true },
          { key: "municipio", label: "Município", required: true },
          { key: "uf", label: "UF", required: true },
        ],
      ],
    },
  },
} as const;

export const updateTemplateBodySchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    subject: { type: "string" },
    htmlContent: { type: ["string", "null"] },
    textContent: { type: ["string", "null"] },
    variables: {
      type: "array",
      items: templateVariableSchema,
    },
  },
  minProperties: 1,
} as const;

export const templateParamsSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
  },
} as const;

export const templateMessageSchema = {
  type: "object",
  required: ["message"],
  properties: {
    message: { type: "string" },
  },
} as const;

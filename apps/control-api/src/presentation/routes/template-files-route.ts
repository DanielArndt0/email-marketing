import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";

import { emailFileKind } from "core";

import {
  createDeleteEmailFileHandler,
  createGetEmailFileByIdHandler,
  createGetListEmailFilesHandler,
  createPostCreateEmailFileHandler,
} from "../../modules/email-files/http/email-file-handlers.js";
import {
  createEmailFileBodySchema,
  deleteEmailFileResponseSchema,
  emailFileListSchema,
  emailFileMessageSchema,
  emailFileParamsSchema,
  emailFileSchema,
  templateFileParamsSchema,
} from "../schemas/email-file-schemas.js";

type RegisterTemplateFilesRouteDependencies = {
  pgPool: Pool;
};

const listTemplateInlineAssetsRouteSchema = {
  tags: ["template-files"],
  summary: "Lista assets inline vinculados a um template",
  description:
    "Lista imagens e assets usados no HTML do template por referências cid:.",
  params: templateFileParamsSchema,
  response: {
    200: emailFileListSchema,
  },
} satisfies FastifySchema;

const createTemplateInlineAssetRouteSchema = {
  tags: ["template-files"],
  summary: "Cadastra um asset inline para o template",
  description:
    "Registra metadados de uma imagem/asset do template. O campo cid deve existir no HTML como cid:<cid> para renderização inline no envio real.",
  params: templateFileParamsSchema,
  body: createEmailFileBodySchema,
  response: {
    201: emailFileSchema,
    404: emailFileMessageSchema,
    409: emailFileMessageSchema,
  },
} satisfies FastifySchema;

const getTemplateInlineAssetRouteSchema = {
  tags: ["template-files"],
  summary: "Consulta um asset inline do template",
  params: emailFileParamsSchema,
  response: {
    200: emailFileSchema,
    404: emailFileMessageSchema,
  },
} satisfies FastifySchema;

const deleteTemplateInlineAssetRouteSchema = {
  tags: ["template-files"],
  summary: "Remove um asset inline do template",
  params: emailFileParamsSchema,
  response: {
    200: deleteEmailFileResponseSchema,
    404: emailFileMessageSchema,
  },
} satisfies FastifySchema;

const listTemplateAttachmentsRouteSchema = {
  tags: ["template-files"],
  summary: "Lista anexos comuns vinculados a um template",
  description:
    "Lista anexos comuns herdados por campanhas/envios que usam este template.",
  params: templateFileParamsSchema,
  response: {
    200: emailFileListSchema,
  },
} satisfies FastifySchema;

const createTemplateAttachmentRouteSchema = {
  tags: ["template-files"],
  summary: "Cadastra um anexo comum para o template",
  description:
    "Registra metadados de um arquivo que será enviado como anexo normal, sem CID.",
  params: templateFileParamsSchema,
  body: createEmailFileBodySchema,
  response: {
    201: emailFileSchema,
    404: emailFileMessageSchema,
    409: emailFileMessageSchema,
  },
} satisfies FastifySchema;

const getTemplateAttachmentRouteSchema = {
  tags: ["template-files"],
  summary: "Consulta um anexo comum do template",
  params: emailFileParamsSchema,
  response: {
    200: emailFileSchema,
    404: emailFileMessageSchema,
  },
} satisfies FastifySchema;

const deleteTemplateAttachmentRouteSchema = {
  tags: ["template-files"],
  summary: "Remove um anexo comum do template",
  params: emailFileParamsSchema,
  response: {
    200: deleteEmailFileResponseSchema,
    404: emailFileMessageSchema,
  },
} satisfies FastifySchema;

export function registerTemplateFilesRoute(
  app: FastifyInstance,
  dependencies: RegisterTemplateFilesRouteDependencies,
): void {
  const inlineContext = {
    kind: emailFileKind.templateInlineAsset,
  } as const;

  const attachmentContext = {
    kind: emailFileKind.templateAttachment,
  } as const;

  app.get(
    "/templates/:templateId/inline-assets",
    { schema: listTemplateInlineAssetsRouteSchema },
    createGetListEmailFilesHandler(dependencies, inlineContext),
  );

  app.post(
    "/templates/:templateId/inline-assets",
    { schema: createTemplateInlineAssetRouteSchema },
    createPostCreateEmailFileHandler(dependencies, inlineContext),
  );

  app.get(
    "/templates/:templateId/inline-assets/:fileId",
    { schema: getTemplateInlineAssetRouteSchema },
    createGetEmailFileByIdHandler(dependencies, inlineContext),
  );

  app.delete(
    "/templates/:templateId/inline-assets/:fileId",
    { schema: deleteTemplateInlineAssetRouteSchema },
    createDeleteEmailFileHandler(dependencies, inlineContext),
  );

  app.get(
    "/templates/:templateId/attachments",
    { schema: listTemplateAttachmentsRouteSchema },
    createGetListEmailFilesHandler(dependencies, attachmentContext),
  );

  app.post(
    "/templates/:templateId/attachments",
    { schema: createTemplateAttachmentRouteSchema },
    createPostCreateEmailFileHandler(dependencies, attachmentContext),
  );

  app.get(
    "/templates/:templateId/attachments/:fileId",
    { schema: getTemplateAttachmentRouteSchema },
    createGetEmailFileByIdHandler(dependencies, attachmentContext),
  );

  app.delete(
    "/templates/:templateId/attachments/:fileId",
    { schema: deleteTemplateAttachmentRouteSchema },
    createDeleteEmailFileHandler(dependencies, attachmentContext),
  );
}

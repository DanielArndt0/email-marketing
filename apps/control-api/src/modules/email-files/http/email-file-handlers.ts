import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { emailFileKind, type EmailFileKind } from "core";

import { createEmailFile } from "../application/create-email-file.js";
import { deleteEmailFile } from "../application/delete-email-file.js";
import { getEmailFileById } from "../application/get-email-file-by-id.js";
import { listEmailFiles } from "../application/list-email-files.js";
import {
  createEmailFileBodySchema,
  emailFilePaginationQuerySchema,
  emailFileParamsSchema,
  templateFileParamsSchema,
} from "./email-file-schema.js";

type EmailFileHandlerDependencies = { pgPool: Pool };
type TemplateFileRouteContext = { kind: EmailFileKind };

function parseTemplateId(request: FastifyRequest): string {
  return templateFileParamsSchema.parse(request.params).templateId;
}

function getFileKindLabel(kind: EmailFileKind): string {
  return kind === emailFileKind.templateInlineAsset
    ? "Asset inline do template"
    : "Anexo comum do template";
}

export function createPostCreateEmailFileHandler(
  dependencies: EmailFileHandlerDependencies,
  context: TemplateFileRouteContext,
) {
  return async function postCreateEmailFileHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const templateId = parseTemplateId(request);
    const body = createEmailFileBodySchema.parse(request.body);
    const result = await createEmailFile(dependencies, {
      templateId,
      kind: context.kind,
      originalName: body.originalName,
      storedName: body.storedName,
      mimeType: body.mimeType,
      sizeBytes: body.sizeBytes,
      storageKey: body.storageKey,
      cid: body.cid,
    });

    if (result.kind === "created") return reply.status(201).send(result.file);
    if (result.kind === "template_not_found")
      return reply.status(404).send({ message: "Template não encontrado." });
    if (result.kind === "missing_cid")
      return reply
        .status(409)
        .send({
          message: "Assets inline de template precisam informar um CID.",
        });
    if (result.kind === "unexpected_cid")
      return reply
        .status(409)
        .send({ message: "Anexos comuns do template não devem informar CID." });
    if (result.kind === "cid_conflict")
      return reply
        .status(409)
        .send({
          message: "Já existe um asset inline com este CID para o template.",
          cid: result.cid,
        });
    return reply
      .status(409)
      .send({
        message: `${getFileKindLabel(context.kind)} não pôde ser cadastrado.`,
      });
  };
}

export function createGetListEmailFilesHandler(
  dependencies: EmailFileHandlerDependencies,
  context: TemplateFileRouteContext,
) {
  return async function getListEmailFilesHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const templateId = parseTemplateId(request);
    const query = emailFilePaginationQuerySchema.parse(request.query);
    const result = await listEmailFiles(dependencies, {
      templateId,
      kind: context.kind,
      page: query.page,
      pageSize: query.pageSize,
    });
    return reply.status(200).send(result);
  };
}

export function createGetEmailFileByIdHandler(
  dependencies: EmailFileHandlerDependencies,
  context: TemplateFileRouteContext,
) {
  return async function getEmailFileByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { templateId, fileId } = emailFileParamsSchema.parse(request.params);
    const result = await getEmailFileById(dependencies, {
      templateId,
      kind: context.kind,
      fileId,
    });
    if (!result)
      return reply.status(404).send({ message: "Arquivo não encontrado." });
    return reply.status(200).send(result);
  };
}

export function createDeleteEmailFileHandler(
  dependencies: EmailFileHandlerDependencies,
  context: TemplateFileRouteContext,
) {
  return async function deleteEmailFileHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const { templateId, fileId } = emailFileParamsSchema.parse(request.params);
    const result = await deleteEmailFile(dependencies, {
      templateId,
      kind: context.kind,
      fileId,
    });
    if (result.kind === "not_found")
      return reply.status(404).send({ message: "Arquivo não encontrado." });
    return reply.status(200).send({ status: "deleted", id: result.id });
  };
}

import type { FastifyInstance, FastifySchema } from "fastify";
import type { Pool } from "pg";

import { createDeleteSmtpSenderHandler } from "../../modules/smtp-senders/http/delete-smtp-sender-handler.js";
import { createGetListSmtpSendersHandler } from "../../modules/smtp-senders/http/get-list-smtp-senders-handler.js";
import { createGetSmtpSenderByIdHandler } from "../../modules/smtp-senders/http/get-smtp-sender-by-id-handler.js";
import { createPatchUpdateSmtpSenderHandler } from "../../modules/smtp-senders/http/patch-update-smtp-sender-handler.js";
import { createPostCreateSmtpSenderHandler } from "../../modules/smtp-senders/http/post-create-smtp-sender-handler.js";
import { createPostTestSmtpSenderHandler } from "../../modules/smtp-senders/http/post-test-smtp-sender-handler.js";
import {
  smtpSenderCreateBodySchema,
  smtpSenderDeleteResponseSchema,
  smtpSenderInUseResponseSchema,
  smtpSenderListQuerySchema,
  smtpSenderPaginationResponseSchema,
  smtpSenderParamsSchema,
  smtpSenderSchema,
  smtpSenderTestBodySchema,
  smtpSenderTestResponseSchema,
  smtpSenderUpdateBodySchema,
} from "../schemas/smtp-sender-schemas.js";
import { notFoundMessageSchema } from "../schemas/campaign-schemas.js";

type RegisterSmtpSendersRouteDependencies = {
  pgPool: Pool;
};

const listSmtpSendersRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Lista SMTP senders",
  querystring: smtpSenderListQuerySchema,
  response: {
    200: smtpSenderPaginationResponseSchema,
  },
} satisfies FastifySchema;

const getSmtpSenderByIdRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Consulta um SMTP sender por id",
  params: smtpSenderParamsSchema,
  response: {
    200: smtpSenderSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const createSmtpSenderRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Cria um SMTP sender",
  body: smtpSenderCreateBodySchema,
  response: {
    201: smtpSenderSchema,
  },
} satisfies FastifySchema;

const updateSmtpSenderRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Atualiza parcialmente um SMTP sender",
  params: smtpSenderParamsSchema,
  body: smtpSenderUpdateBodySchema,
  response: {
    200: smtpSenderSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

const deleteSmtpSenderRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Exclui um SMTP sender quando não houver campaigns vinculadas",
  params: smtpSenderParamsSchema,
  response: {
    200: smtpSenderDeleteResponseSchema,
    404: notFoundMessageSchema,
    409: smtpSenderInUseResponseSchema,
  },
} satisfies FastifySchema;

const testSmtpSenderRouteSchema = {
  tags: ["smtp-senders"],
  summary: "Testa a conexão/envio de um SMTP sender",
  params: smtpSenderParamsSchema,
  body: smtpSenderTestBodySchema,
  response: {
    200: smtpSenderTestResponseSchema,
    404: notFoundMessageSchema,
  },
} satisfies FastifySchema;

export function registerSmtpSendersRoute(
  app: FastifyInstance,
  dependencies: RegisterSmtpSendersRouteDependencies,
): void {
  app.get(
    "/smtp-senders",
    {
      schema: listSmtpSendersRouteSchema,
    },
    createGetListSmtpSendersHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/smtp-senders/:id",
    {
      schema: getSmtpSenderByIdRouteSchema,
    },
    createGetSmtpSenderByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/smtp-senders",
    {
      schema: createSmtpSenderRouteSchema,
    },
    createPostCreateSmtpSenderHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.patch(
    "/smtp-senders/:id",
    {
      schema: updateSmtpSenderRouteSchema,
    },
    createPatchUpdateSmtpSenderHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.delete(
    "/smtp-senders/:id",
    {
      schema: deleteSmtpSenderRouteSchema,
    },
    createDeleteSmtpSenderHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/smtp-senders/:id/test",
    {
      schema: testSmtpSenderRouteSchema,
    },
    createPostTestSmtpSenderHandler({
      pgPool: dependencies.pgPool,
    }),
  );
}

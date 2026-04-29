import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { updateSmtpSender } from "../application/update-smtp-sender.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z.object({
  name: z.string().min(1).optional(),
  fromName: z.string().min(1).optional(),
  fromEmail: z.string().email().optional(),
  replyToEmail: z.string().email().nullable().optional(),
  host: z.string().min(1).optional(),
  port: z.number().int().min(1).max(65535).optional(),
  secure: z.boolean().optional(),
  username: z.string().min(1).optional(),
  password: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

type CreatePatchUpdateSmtpSenderHandlerDependencies = {
  pgPool: Pool;
};

export function createPatchUpdateSmtpSenderHandler(
  dependencies: CreatePatchUpdateSmtpSenderHandlerDependencies,
) {
  return async function patchUpdateSmtpSenderHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body);

    const result = await updateSmtpSender(dependencies, {
      id: params.id,
      name: body.name,
      fromName: body.fromName,
      fromEmail: body.fromEmail,
      replyToEmail: body.replyToEmail,
      host: body.host,
      port: body.port,
      secure: body.secure,
      username: body.username,
      password: body.password,
      isActive: body.isActive,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "SMTP sender não encontrado.",
      });
    }

    return reply.status(200).send(result.smtpSender);
  };
}

import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { createSmtpSender } from "../application/create-smtp-sender.js";

const requestBodySchema = z.object({
  name: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyToEmail: z.string().email().nullable().optional(),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  secure: z.boolean(),
  username: z.string().min(1).nullable().optional(),
  password: z.string().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
});

type CreatePostCreateSmtpSenderHandlerDependencies = {
  pgPool: Pool;
};

export function createPostCreateSmtpSenderHandler(
  dependencies: CreatePostCreateSmtpSenderHandlerDependencies,
) {
  return async function postCreateSmtpSenderHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    const smtpSender = await createSmtpSender(dependencies, {
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

    return reply.status(201).send(smtpSender);
  };
}

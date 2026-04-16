import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { createTemplate } from "../application/create-template.js";

const requestBodySchema = z
  .object({
    name: z.string().min(1),
    subject: z.string().min(1),
    htmlContent: z.string().min(1).optional(),
    textContent: z.string().min(1).optional(),
  })
  .refine((data) => Boolean(data.htmlContent || data.textContent), {
    message: "É necessário informar htmlContent ou textContent.",
    path: ["htmlContent"],
  });

type CreatePostCreateTemplateHandlerDependencies = {
  pgPool: Pool;
};

export function createPostCreateTemplateHandler(
  dependencies: CreatePostCreateTemplateHandlerDependencies,
) {
  return async function postCreateTemplateHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const body = requestBodySchema.parse(request.body);

    const result = await createTemplate(dependencies, body);

    return reply.status(201).send(result);
  };
}

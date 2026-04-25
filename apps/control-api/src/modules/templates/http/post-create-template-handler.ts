import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { createTemplate } from "../application/create-template.js";
import { createTemplateBodySchema } from "./template-schema.js";

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
    const body = createTemplateBodySchema.parse(request.body);

    const result = await createTemplate(dependencies, body);

    return reply.status(201).send(result);
  };
}

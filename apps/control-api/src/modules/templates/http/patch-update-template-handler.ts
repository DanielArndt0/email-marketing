import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";

import { updateTemplate } from "../application/update-template.js";
import {
  templateParamsSchema,
  updateTemplateBodySchema,
} from "./template-schema.js";

type CreatePatchUpdateTemplateHandlerDependencies = {
  pgPool: Pool;
};

export function createPatchUpdateTemplateHandler(
  dependencies: CreatePatchUpdateTemplateHandlerDependencies,
) {
  return async function patchUpdateTemplateHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = templateParamsSchema.parse(request.params);
    const body = updateTemplateBodySchema.parse(request.body);

    const result = await updateTemplate(dependencies, {
      id: params.id,
      name: body.name,
      subject: body.subject,
      htmlContent: body.htmlContent,
      textContent: body.textContent,
      variables: body.variables,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(200).send(result.template);
  };
}

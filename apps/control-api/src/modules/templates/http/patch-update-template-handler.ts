import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { updateTemplate } from "../application/update-template.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

const requestBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    subject: z.string().min(1).optional(),
    htmlContent: z.union([z.string().min(1), z.null()]).optional(),
    textContent: z.union([z.string().min(1), z.null()]).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.subject !== undefined ||
      data.htmlContent !== undefined ||
      data.textContent !== undefined,
    {
      message: "É necessário informar ao menos um campo para atualização.",
    },
  )
  .superRefine((data, ctx) => {
    const finalHtml =
      data.htmlContent === undefined ? undefined : data.htmlContent;
    const finalText =
      data.textContent === undefined ? undefined : data.textContent;

    const htmlWasProvided = finalHtml !== undefined;
    const textWasProvided = finalText !== undefined;

    if (!htmlWasProvided && !textWasProvided) {
      return;
    }

    const htmlIsEmpty = finalHtml === null;
    const textIsEmpty = finalText === null;

    if (htmlWasProvided && textWasProvided && htmlIsEmpty && textIsEmpty) {
      ctx.addIssue({
        code: "custom",
        path: ["htmlContent"],
        message:
          "Não é permitido deixar htmlContent e textContent nulos ao mesmo tempo.",
      });
    }
  });

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
    const params = requestParamsSchema.parse(request.params);
    const body = requestBodySchema.parse(request.body);

    const result = await updateTemplate(dependencies, {
      id: params.id,
      name: body.name,
      subject: body.subject,
      htmlContent: body.htmlContent,
      textContent: body.textContent,
    });

    if (result.kind === "not_found") {
      return reply.status(404).send({
        message: "Template não encontrado.",
      });
    }

    return reply.status(200).send(result.template);
  };
}

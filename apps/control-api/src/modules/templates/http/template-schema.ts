import { z } from "zod";

const templateVariableKeySchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-zA-Z0-9_]+$/, {
    message:
      "A chave da variável deve conter apenas letras, números e underscore.",
  });

export const templateVariableSchema = z.object({
  key: templateVariableKeySchema,
  label: z.string().min(1).optional(),
  required: z.boolean().optional(),
  description: z.string().min(1).optional(),
  example: z.string().min(1).optional(),
});

export const createTemplateBodySchema = z
  .object({
    name: z.string().min(1),
    subject: z.string().min(1),
    htmlContent: z.string().min(1).optional(),
    textContent: z.string().min(1).optional(),
    variables: z.array(templateVariableSchema).default([]),
  })
  .refine((data) => Boolean(data.htmlContent || data.textContent), {
    message: "É necessário informar htmlContent ou textContent.",
    path: ["htmlContent"],
  });

export const updateTemplateBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    subject: z.string().min(1).optional(),
    htmlContent: z.union([z.string().min(1), z.null()]).optional(),
    textContent: z.union([z.string().min(1), z.null()]).optional(),
    variables: z.array(templateVariableSchema).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.subject !== undefined ||
      data.htmlContent !== undefined ||
      data.textContent !== undefined ||
      data.variables !== undefined,
    {
      message: "É necessário informar ao menos um campo para atualização.",
    },
  )
  .superRefine((data, ctx) => {
    const htmlWasProvided = data.htmlContent !== undefined;
    const textWasProvided = data.textContent !== undefined;

    if (!htmlWasProvided && !textWasProvided) {
      return;
    }

    if (
      htmlWasProvided &&
      textWasProvided &&
      data.htmlContent === null &&
      data.textContent === null
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["htmlContent"],
        message:
          "Não é permitido deixar htmlContent e textContent nulos ao mesmo tempo.",
      });
    }
  });

export const templateParamsSchema = z.object({
  id: z.string().min(1),
});

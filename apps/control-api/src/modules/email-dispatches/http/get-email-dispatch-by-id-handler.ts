import type { FastifyReply, FastifyRequest } from "fastify";
import type { Pool } from "pg";
import { z } from "zod";

import { getEmailDispatchById } from "../application/get-email-dispatch-by-id.js";

const requestParamsSchema = z.object({
  id: z.string().min(1),
});

type CreateGetEmailDispatchByIdHandlerDependencies = {
  pgPool: Pool;
};

export function createGetEmailDispatchByIdHandler(
  dependencies: CreateGetEmailDispatchByIdHandlerDependencies,
) {
  return async function getEmailDispatchByIdHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const params = requestParamsSchema.parse(request.params);

    const dispatch = await getEmailDispatchById(dependencies, params.id);

    if (!dispatch) {
      return reply.status(404).send({
        message: "Email dispatch não encontrado.",
      });
    }

    return reply.status(200).send(dispatch);
  };
}

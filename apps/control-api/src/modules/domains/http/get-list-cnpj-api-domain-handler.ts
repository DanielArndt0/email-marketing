import type { FastifyReply, FastifyRequest } from "fastify";
import type { CnpjApiDomainType } from "core";
import { z } from "zod";

import { systemConfig } from "shared";

import type { CnpjApiDomainClient } from "../adapters/cnpj-api-domain-client.js";
import { listCnpjApiDomainItems } from "../application/list-cnpj-api-domain-items.js";
import { sendCnpjApiDomainError } from "./domain-error-response.js";

const paginationConfig = systemConfig.api.pagination.domains;

const requestQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive()
    .default(paginationConfig.defaultPage),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(paginationConfig.maxPageSize)
    .default(paginationConfig.defaultPageSize),
  q: z.string().trim().min(1).optional(),
  code: z.string().trim().min(1).optional(),
});

type CreateGetListCnpjApiDomainHandlerDependencies = {
  cnpjApiDomainClient: CnpjApiDomainClient;
  domain: CnpjApiDomainType;
};

export function createGetListCnpjApiDomainHandler(
  dependencies: CreateGetListCnpjApiDomainHandlerDependencies,
) {
  return async function getListCnpjApiDomainHandler(
    request: FastifyRequest,
    reply: FastifyReply,
  ) {
    const query = requestQuerySchema.parse(request.query);

    try {
      const result = await listCnpjApiDomainItems(
        {
          cnpjApiDomainClient: dependencies.cnpjApiDomainClient,
        },
        {
          domain: dependencies.domain,
          page: query.page,
          limit: query.limit,
          q: query.q,
          code: query.code,
        },
      );

      return reply.status(200).send(result);
    } catch (error) {
      const handledError = sendCnpjApiDomainError(reply, error);

      if (handledError) {
        return handledError;
      }

      throw error;
    }
  };
}

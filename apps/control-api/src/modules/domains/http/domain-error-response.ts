import type { FastifyReply } from "fastify";

import {
  isCnpjApiDomainConfigurationError,
  isCnpjApiDomainRequestError,
} from "../errors/cnpj-api-domain-errors.js";

export function sendCnpjApiDomainError(
  reply: FastifyReply,
  error: unknown,
): FastifyReply | null {
  if (isCnpjApiDomainConfigurationError(error)) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  if (isCnpjApiDomainRequestError(error)) {
    return reply.status(502).send({
      message: error.message,
    });
  }

  return null;
}

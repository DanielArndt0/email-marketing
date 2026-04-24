import type { FastifyReply } from "fastify";

import {
  isLeadSourceConfigurationError,
  isLeadSourceRequestError,
} from "../errors/lead-source-errors.js";

export function sendAudienceResolutionError(
  reply: FastifyReply,
  error: unknown,
): FastifyReply | null {
  if (isLeadSourceConfigurationError(error)) {
    return reply.status(400).send({
      message: error.message,
    });
  }

  if (isLeadSourceRequestError(error)) {
    return reply.status(502).send({
      message: error.message,
    });
  }

  return null;
}

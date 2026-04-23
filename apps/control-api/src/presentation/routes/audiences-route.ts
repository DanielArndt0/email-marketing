import type { FastifyInstance, FastifySchema } from "fastify";

import type { LeadSourceProviderRegistry } from "../../modules/audiences/adapters/lead-source-provider-registry.js";
import { createPostResolveAudienceHandler } from "../../modules/audiences/http/post-resolve-audience-handler.js";
import {
  audiencePreviewResponseSchema,
  audienceResolveBodySchema,
} from "../schemas/audience-schemas.js";

const resolveAudienceRouteSchema = {
  tags: ["audiences"],
  summary: "Resolve destinatários a partir de um lead source e filtros",
  body: audienceResolveBodySchema,
  response: {
    200: audiencePreviewResponseSchema,
  },
} satisfies FastifySchema;

type RegisterAudiencesRouteDependencies = {
  registry: LeadSourceProviderRegistry;
};

export function registerAudiencesRoute(
  app: FastifyInstance,
  dependencies: RegisterAudiencesRouteDependencies,
): void {
  app.post(
    "/audiences/resolve",
    {
      schema: resolveAudienceRouteSchema,
    },
    createPostResolveAudienceHandler({
      registry: dependencies.registry,
    }),
  );
}

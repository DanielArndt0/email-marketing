import type { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import packageJson from "../../../package.json" with { type: "json" };

import { env } from "shared";

export async function registerOpenApi(app: FastifyInstance): Promise<void> {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "Email Marketing Control API",
        description:
          "API HTTP responsável pela gestão operacional de campanhas, templates e dispatches.",
        version: packageJson.version,
      },
      servers: [
        {
          url: `http://localhost:${env.API_PORT}`,
          description: "Ambiente local",
        },
      ],
      tags: [
        { name: "health", description: "Verificações operacionais da API" },
        {
          name: "campaigns",
          description: "Gestão de campanhas e enfileiramento",
        },
        {
          name: "email-dispatches",
          description: "Consulta operacional de dispatches",
        },
        { name: "templates", description: "Gestão de templates" },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: "/documentation",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header: string) => header,
  });
}

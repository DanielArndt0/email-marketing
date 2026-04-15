import type { FastifyInstance } from "fastify";

import { env } from "shared";

export function registerHealthRoute(app: FastifyInstance): void {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "control-api",
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  });
}

import type { FastifyInstance } from "fastify";

import { registerHealthRoute } from "./health-route.js";

export function registerRoutes(app: FastifyInstance): void {
  registerHealthRoute(app);
}

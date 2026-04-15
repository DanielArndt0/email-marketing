import Fastify from "fastify";

import { env, createLogger } from "shared";

import { registerRoutes } from "../presentation/routes/index.js";

const logger = createLogger({
  serviceName: "control-api",
});

const app = Fastify({
  logger: false,
});

registerRoutes(app);

async function start(): Promise<void> {
  try {
    await app.listen({
      host: "0.0.0.0",
      port: env.API_PORT,
    });

    logger.info(
      {
        port: env.API_PORT,
        environment: env.NODE_ENV,
      },
      "control-api iniciada com sucesso",
    );
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "falha ao iniciar control-api",
    );

    process.exit(1);
  }
}

void start();

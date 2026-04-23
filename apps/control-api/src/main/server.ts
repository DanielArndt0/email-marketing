import Fastify from "fastify";

import {
  createEmailDispatchQueue,
  createLogger,
  createPgPool,
  createRedisConnection,
  env,
} from "shared";

import { createLeadSourceProviderRegistry } from "../modules/audiences/adapters/lead-source-provider-registry.js";
import { registerOpenApi } from "../presentation/openapi/register-openapi.js";
import { registerRoutes } from "../presentation/routes/index.js";

const logger = createLogger({
  serviceName: "control-api",
});

const pgPool = createPgPool();
const redis = createRedisConnection();
const emailDispatchQueue = createEmailDispatchQueue();
const providerRegistry = createLeadSourceProviderRegistry();

const app = Fastify({
  logger: false,
});

await registerOpenApi(app);

registerRoutes(app, {
  pgPool,
  redis,
  emailDispatchQueue,
  providerRegistry,
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "iniciando encerramento gracioso da control-api");

  try {
    await app.close();
    await emailDispatchQueue.close();
    await pgPool.end();
    await redis.quit();

    logger.info({ signal }, "control-api encerrada com sucesso");
    process.exit(0);
  } catch (error) {
    logger.error(
      {
        err: error,
        signal,
      },
      "falha ao encerrar control-api",
    );

    process.exit(1);
  }
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

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
        documentationUrl: `http://localhost:${env.API_PORT}/documentation`,
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

    await emailDispatchQueue.close().catch(() => undefined);
    await pgPool.end().catch(() => undefined);
    await redis.quit().catch(() => undefined);

    process.exit(1);
  }
}

void start();

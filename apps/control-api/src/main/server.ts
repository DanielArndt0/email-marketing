import Fastify from "fastify";

import {
  createEmailDispatchQueue,
  createLogger,
  createPgPool,
  createRedisConnection,
  env,
} from "shared";

import { registerRoutes } from "../presentation/routes/index.js";

const logger = createLogger({
  serviceName: "control-api",
});

const pgPool = createPgPool();
const redis = createRedisConnection();
const emailDispatchQueue = createEmailDispatchQueue();

const app = Fastify({
  logger: false,
});

registerRoutes(app, {
  pgPool,
  redis,
  emailDispatchQueue,
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

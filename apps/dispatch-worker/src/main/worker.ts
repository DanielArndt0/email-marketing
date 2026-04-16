import type { Worker } from "bullmq";

import { createLogger, createPgPool, env } from "shared";

import { registerConsumers } from "../consumers/index.js";

const logger = createLogger({
  serviceName: "dispatch-worker",
});

const pgPool = createPgPool();

let workers: Worker[] = [];

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "iniciando encerramento gracioso do dispatch-worker");

  try {
    await Promise.all(workers.map((worker) => worker.close()));
    await pgPool.end();

    logger.info({ signal }, "dispatch-worker encerrado com sucesso");
    process.exit(0);
  } catch (error) {
    logger.error(
      {
        err: error,
        signal,
      },
      "falha ao encerrar dispatch-worker",
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
    workers = registerConsumers({
      pgPool,
    });

    logger.info(
      {
        environment: env.NODE_ENV,
        redisHost: env.REDIS_HOST,
        redisPort: env.REDIS_PORT,
        workersCount: workers.length,
      },
      "dispatch-worker iniciado com sucesso",
    );
  } catch (error) {
    logger.fatal(
      {
        err: error,
      },
      "falha ao iniciar dispatch-worker",
    );

    await pgPool.end().catch(() => undefined);
    process.exit(1);
  }
}

void start();

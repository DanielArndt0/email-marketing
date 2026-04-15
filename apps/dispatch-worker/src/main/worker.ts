import { createLogger, env } from "shared";

import { registerConsumers } from "../consumers/index.js";

const logger = createLogger({
  serviceName: "dispatch-worker",
});

async function start(): Promise<void> {
  try {
    registerConsumers();

    logger.info(
      {
        environment: env.NODE_ENV,
        redisHost: env.REDIS_HOST,
        redisPort: env.REDIS_PORT,
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

    process.exit(1);
  }
}

void start();

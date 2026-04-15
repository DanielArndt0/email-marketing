import pino from "pino";

import { env } from "../config/index.js";

type CreateLoggerOptions = {
  serviceName: string;
};

export function createLogger(options: CreateLoggerOptions) {
  return pino({
    name: options.serviceName,
    level: env.LOG_LEVEL,
    base: {
      service: options.serviceName,
      environment: env.NODE_ENV,
    },
  });
}

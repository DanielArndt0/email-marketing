import RedisImport from "ioredis";

import { env } from "../config/index.js";

export function createRedisConnection() {
  // Workaround para o erro de tipagem:
  // "This expression is not constructable"
  // em projetos ESM com TypeScript usando NodeNext/Node16.

  // Referência:
  // https://github.com/redis/ioredis/issues/1624

  const Redis = RedisImport.default;

  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    maxRetriesPerRequest: null,
  });
}

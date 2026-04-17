import type { Pool } from "pg";
import type RedisImport from "ioredis";

export type HealthCheckRepositoryDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

export async function pingPostgres(
  dependencies: HealthCheckRepositoryDependencies,
): Promise<void> {
  await dependencies.pgPool.query("SELECT 1");
}

export async function pingRedis(
  dependencies: HealthCheckRepositoryDependencies,
): Promise<string> {
  return dependencies.redis.ping();
}

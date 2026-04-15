import type { Pool } from "pg";
import type RedisImport from "ioredis";

type CheckHealthDependencies = {
  pgPool: Pool;
  redis: InstanceType<typeof RedisImport.default>;
};

export type HealthCheckResult = {
  status: "ok" | "error";
  service: "control-api";
  environment: string;
  timestamp: string;
  checks: {
    postgres: {
      status: "ok" | "error";
      details?: string;
    };
    redis: {
      status: "ok" | "error";
      details?: string;
    };
  };
};

export async function checkHealth(
  dependencies: CheckHealthDependencies,
): Promise<HealthCheckResult> {
  const result: HealthCheckResult = {
    status: "ok",
    service: "control-api",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
    checks: {
      postgres: {
        status: "ok",
      },
      redis: {
        status: "ok",
      },
    },
  };

  try {
    await dependencies.pgPool.query("SELECT 1");
  } catch (error) {
    result.status = "error";
    result.checks.postgres = {
      status: "error",
      details:
        error instanceof Error
          ? error.message
          : "Erro desconhecido no PostgreSQL",
    };
  }

  try {
    const pong = await dependencies.redis.ping();

    if (pong !== "PONG") {
      result.status = "error";
      result.checks.redis = {
        status: "error",
        details: `Resposta inesperada do Redis: ${pong}`,
      };
    }
  } catch (error) {
    result.status = "error";
    result.checks.redis = {
      status: "error",
      details:
        error instanceof Error ? error.message : "Erro desconhecido no Redis",
    };
  }

  return result;
}

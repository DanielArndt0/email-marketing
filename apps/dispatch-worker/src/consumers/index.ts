import type { Worker } from "bullmq";
import type { Pool } from "pg";

import { createEmailDispatchConsumer } from "./email-dispatch-consumer.js";

type RegisterConsumersDependencies = {
  pgPool: Pool;
};

export function registerConsumers(
  dependencies: RegisterConsumersDependencies,
): Worker[] {
  const workers: Worker[] = [];

  workers.push(
    createEmailDispatchConsumer({
      pgPool: dependencies.pgPool,
    }),
  );

  return workers;
}

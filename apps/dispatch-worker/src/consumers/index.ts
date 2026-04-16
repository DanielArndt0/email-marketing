import type { Worker } from "bullmq";

import { createEmailDispatchConsumer } from "./email-dispatch-consumer.js";

export function registerConsumers(): Worker[] {
  const workers: Worker[] = [];

  workers.push(createEmailDispatchConsumer());

  return workers;
}

import type { FastifyInstance } from "fastify";
import type { Queue } from "bullmq";

import type { EmailDispatchJobData } from "shared";

import { createPostEnqueueEmailDispatchHandler } from "../../modules/campaigns/http/post-enqueue-email-dispatch-handler.js";

type RegisterCampaignsRouteDependencies = {
  emailDispatchQueue: Queue<EmailDispatchJobData>;
};

export function registerCampaignsRoute(
  app: FastifyInstance,
  dependencies: RegisterCampaignsRouteDependencies,
): void {
  app.post(
    "/campaigns/email-dispatch",
    createPostEnqueueEmailDispatchHandler({
      queue: dependencies.emailDispatchQueue,
    }),
  );
}

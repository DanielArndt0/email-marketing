import type { FastifyInstance } from "fastify";
import type { Queue } from "bullmq";
import type { Pool } from "pg";

import type { EmailDispatchJobData } from "shared";

import { createGetCampaignByIdHandler } from "../../modules/campaigns/http/get-campaign-by-id-handler.js";
import { createGetListCampaignsHandler } from "../../modules/campaigns/http/get-list-campaigns-handler.js";
import { createPatchUpdateCampaignHandler } from "../../modules/campaigns/http/patch-update-campaign-handler.js";
import { createPostCreateCampaignHandler } from "../../modules/campaigns/http/post-create-campaign-handler.js";
import { createPostEnqueueEmailDispatchHandler } from "../../modules/campaigns/http/post-enqueue-email-dispatch-handler.js";

type RegisterCampaignsRouteDependencies = {
  pgPool: Pool;
  emailDispatchQueue: Queue<EmailDispatchJobData>;
};

export function registerCampaignsRoute(
  app: FastifyInstance,
  dependencies: RegisterCampaignsRouteDependencies,
): void {
  app.post(
    "/campaigns",
    createPostCreateCampaignHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/campaigns",
    createGetListCampaignsHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.get(
    "/campaigns/:id",
    createGetCampaignByIdHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.patch(
    "/campaigns/:id",
    createPatchUpdateCampaignHandler({
      pgPool: dependencies.pgPool,
    }),
  );

  app.post(
    "/campaigns/email-dispatch",
    createPostEnqueueEmailDispatchHandler({
      pgPool: dependencies.pgPool,
      queue: dependencies.emailDispatchQueue,
    }),
  );
}

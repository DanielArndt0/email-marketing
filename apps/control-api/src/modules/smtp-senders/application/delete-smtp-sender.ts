import type { Pool } from "pg";

import {
  countCampaignsBySmtpSenderId,
  deleteSmtpSenderById,
  findSmtpSenderById,
} from "../repositories/smtp-sender-repository.js";

type DeleteSmtpSenderDependencies = {
  pgPool: Pool;
};

export type DeleteSmtpSenderResult =
  | { kind: "not_found" }
  | { kind: "in_use"; campaignsCount: number }
  | { kind: "deleted"; id: string };

export async function deleteSmtpSender(
  dependencies: DeleteSmtpSenderDependencies,
  id: string,
): Promise<DeleteSmtpSenderResult> {
  const sender = await findSmtpSenderById(dependencies.pgPool, id);

  if (!sender) {
    return { kind: "not_found" };
  }

  const campaignsCount = await countCampaignsBySmtpSenderId(
    dependencies.pgPool,
    id,
  );

  if (campaignsCount > 0) {
    return {
      kind: "in_use",
      campaignsCount,
    };
  }

  await deleteSmtpSenderById(dependencies.pgPool, id);

  return {
    kind: "deleted",
    id,
  };
}

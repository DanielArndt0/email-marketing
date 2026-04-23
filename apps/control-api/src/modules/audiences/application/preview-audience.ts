import type { Pool } from "pg";
import { systemConfig } from "shared";

import type { LeadSourceProviderRegistry } from "../adapters/lead-source-provider-registry.js";
import { findAudienceById } from "../repositories/audience-repository.js";
import {
  resolveAudience,
  type ResolveAudienceResult,
} from "./resolve-audience.js";

type PreviewAudienceDependencies = {
  pgPool: Pool;
  providerRegistry: LeadSourceProviderRegistry;
};

export type PreviewAudienceResult =
  | { kind: "not_found" }
  | {
      kind: "resolved";
      preview: ResolveAudienceResult & { audienceId: string };
    };

export async function previewAudience(
  dependencies: PreviewAudienceDependencies,
  input: { audienceId: string; limit?: number | undefined },
): Promise<PreviewAudienceResult> {
  const audience = await findAudienceById(
    dependencies.pgPool,
    input.audienceId,
  );

  if (!audience) {
    return { kind: "not_found" };
  }

  const preview = await resolveAudience(
    {
      providerRegistry: dependencies.providerRegistry,
    },
    {
      sourceType: audience.sourceType as never,
      filters: audience.filters,
      limit: input.limit ?? systemConfig.api.preview.defaultRecipientsLimit,
    },
  );

  return {
    kind: "resolved",
    preview: {
      audienceId: audience.id,
      ...preview,
    },
  };
}

import type { LeadSourceType } from "./lead-source-type.js";

export type LeadRecipient = {
  email: string;
  externalId?: string | null;
  sourceType: LeadSourceType;
  metadata: Record<string, unknown>;
};

import type { AudienceFilters } from "./audience-definition.js";
import type { LeadRecipient } from "./lead-recipient.js";
import type { LeadSourceType } from "./lead-source-type.js";

export type ResolveRecipientsInput = {
  filters: AudienceFilters;
  limit: number;
};

export interface LeadSourceProvider {
  readonly sourceType: LeadSourceType;
  resolveRecipients(input: ResolveRecipientsInput): Promise<LeadRecipient[]>;
}

import type { LeadRecipient } from "core";

export type AudiencePreviewItem = LeadRecipient;

export type AudiencePreviewResult = {
  items: AudiencePreviewItem[];
  count: number;
  sourceType: string;
  appliedLimit: number;
};

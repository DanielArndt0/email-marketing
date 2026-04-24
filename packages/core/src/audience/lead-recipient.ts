import type { LeadSourceType } from "./lead-source-type.js";

export type LeadRecipient = {
  email: string | null; // TODO - Fazer essa propriedade ser obrigatória
  externalId: string | null;
  sourceType: LeadSourceType;
  metadata: Record<string, unknown>;
};

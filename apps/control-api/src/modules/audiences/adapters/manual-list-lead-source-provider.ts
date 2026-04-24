import type { LeadRecipient, LeadSourceProvider, ResolveRecipientsInput } from "core";

type ManualRecipientInput =
  | string
  | {
      email?: unknown;
      externalId?: unknown;
      metadata?: unknown;
      [key: string]: unknown;
    };

export class ManualListLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "manual-list" as const;

  async resolveRecipients(input: ResolveRecipientsInput): Promise<LeadRecipient[]> {
    const recipients = this.extractRecipients(input.filters);

    return recipients
      .map((recipient) => this.mapRecipient(recipient))
      .filter((recipient): recipient is LeadRecipient => recipient !== null)
      .slice(0, input.limit);
  }

  private extractRecipients(filters: Record<string, unknown>): ManualRecipientInput[] {
    if (Array.isArray(filters.recipients)) {
      return filters.recipients as ManualRecipientInput[];
    }

    if (Array.isArray(filters.emails)) {
      return filters.emails as ManualRecipientInput[];
    }

    return [];
  }

  private mapRecipient(input: ManualRecipientInput): LeadRecipient | null {
    if (typeof input === "string") {
      const email = input.trim();

      if (!email) {
        return null;
      }

      return {
        email,
        externalId: null,
        sourceType: this.sourceType,
        metadata: {},
      };
    }

    const email = typeof input.email === "string" ? input.email.trim() : "";

    if (!email) {
      return null;
    }

    const { externalId, metadata, ...rest } = input;

    return {
      email,
      externalId: typeof externalId === "string" ? externalId : null,
      sourceType: this.sourceType,
      metadata:
        typeof metadata === "object" && metadata !== null
          ? { ...(metadata as Record<string, unknown>), ...rest }
          : rest,
    };
  }
}

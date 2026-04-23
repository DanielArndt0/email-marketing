import type {
  LeadRecipient,
  LeadSourceProvider,
  ResolveRecipientsInput,
} from "core";

export class ManualListLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "manual-list" as const;

  async resolveRecipients(
    input: ResolveRecipientsInput,
  ): Promise<LeadRecipient[]> {
    const recipients = this.extractRecipients(input.filters);

    return recipients.slice(0, input.limit);
  }

  private extractRecipients(filters: Record<string, unknown>): LeadRecipient[] {
    const recipients = filters.recipients;
    const emails = filters.emails;

    if (Array.isArray(recipients)) {
      return recipients
        .filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null,
        )
        .map((item) => ({
          email: String(item.email ?? "").trim(),
          externalId: item.externalId ? String(item.externalId) : null,
          sourceType: this.sourceType,
          metadata:
            typeof item.metadata === "object" && item.metadata !== null
              ? (item.metadata as Record<string, unknown>)
              : {},
        }))
        .filter((item) => item.email.length > 0);
    }

    if (Array.isArray(emails)) {
      return emails
        .map((item) => String(item).trim())
        .filter((email) => email.length > 0)
        .map((email) => ({
          email,
          externalId: null,
          sourceType: this.sourceType,
          metadata: {},
        }));
    }

    return [];
  }
}

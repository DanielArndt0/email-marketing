import type {
  LeadRecipient,
  LeadSourceProvider,
  ResolveRecipientsInput,
} from "core";

import { env, systemConfig } from "shared";

type RawCnpjApiItem =
  | string
  | {
      email?: unknown;
      externalId?: unknown;
      id?: unknown;
      metadata?: unknown;
      [key: string]: unknown;
    };

export class CnpjApiLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "cnpj-api" as const;

  async resolveRecipients(
    input: ResolveRecipientsInput,
  ): Promise<LeadRecipient[]> {
    if (!env.CNPJ_API_BASE_URL) {
      throw new Error(
        "CNPJ_API_BASE_URL não configurado para o lead source cnpj-api.",
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      env.CNPJ_API_TIMEOUT_MS,
    );

    try {
      const response = await fetch(
        new URL(
          systemConfig.leadSources.cnpjApi.resolveRecipientsPath,
          env.CNPJ_API_BASE_URL,
        ),
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(env.CNPJ_API_TOKEN
              ? { authorization: `Bearer ${env.CNPJ_API_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({
            filters: input.filters,
            limit: input.limit,
          }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        throw new Error(`CNPJ API respondeu com status ${response.status}.`);
      }

      const payload = (await response.json()) as unknown;
      const items = this.extractItems(payload);

      return items
        .map((item) => this.mapItem(item))
        .filter((item): item is LeadRecipient => item !== null)
        .slice(0, input.limit);
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractItems(payload: unknown): RawCnpjApiItem[] {
    if (Array.isArray(payload)) {
      return payload as RawCnpjApiItem[];
    }

    if (
      typeof payload === "object" &&
      payload !== null &&
      Array.isArray((payload as { items?: unknown }).items)
    ) {
      return (payload as { items: RawCnpjApiItem[] }).items;
    }

    return [];
  }

  private mapItem(item: RawCnpjApiItem): LeadRecipient | null {
    if (typeof item === "string") {
      const email = item.trim();

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

    const email = typeof item.email === "string" ? item.email.trim() : "";

    if (!email) {
      return null;
    }

    const { externalId, id, metadata, ...rest } = item;

    return {
      email,
      externalId:
        typeof externalId === "string"
          ? externalId
          : typeof id === "string"
            ? id
            : null,
      sourceType: this.sourceType,
      metadata:
        typeof metadata === "object" && metadata !== null
          ? { ...(metadata as Record<string, unknown>), ...rest }
          : rest,
    };
  }
}

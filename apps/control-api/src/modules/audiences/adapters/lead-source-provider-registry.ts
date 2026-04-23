import type { LeadRecipient, LeadSourceProvider } from "core";
import { parseLeadSourceType, type LeadSourceType } from "core";

import { CnpjApiLeadSourceProvider } from "./cnpj-api-lead-source-provider.js";
import { CsvImportLeadSourceProvider } from "./csv-import-lead-source-provider.js";
import { ManualListLeadSourceProvider } from "./manual-list-lead-source-provider.js";

export class LeadSourceProviderRegistry {
  private readonly providers = new Map<LeadSourceType, LeadSourceProvider>();

  constructor(providers: LeadSourceProvider[]) {
    for (const provider of providers) {
      this.providers.set(provider.sourceType, provider);
    }
  }

  getProvider(sourceType: string): LeadSourceProvider {
    const normalizedSourceType = parseLeadSourceType(sourceType);
    const provider = this.providers.get(normalizedSourceType);

    if (!provider) {
      throw new Error(
        `Lead source provider não configurado para ${sourceType}.`,
      );
    }

    return provider;
  }

  async resolveRecipients(input: {
    sourceType: string;
    filters: Record<string, unknown>;
    limit: number;
  }): Promise<LeadRecipient[]> {
    const provider = this.getProvider(input.sourceType);

    return provider.resolveRecipients({
      filters: input.filters,
      limit: input.limit,
    });
  }
}

export function createLeadSourceProviderRegistry(): LeadSourceProviderRegistry {
  return new LeadSourceProviderRegistry([
    new CnpjApiLeadSourceProvider(),
    new CsvImportLeadSourceProvider(),
    new ManualListLeadSourceProvider(),
  ]);
}

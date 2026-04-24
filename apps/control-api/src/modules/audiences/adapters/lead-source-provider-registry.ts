import type { LeadSourceProvider, LeadSourceType } from "core";

import { CnpjApiLeadSourceProvider } from "./cnpj-api-lead-source-provider.js";
import { CsvImportLeadSourceProvider } from "./csv-import-lead-source-provider.js";
import { ManualListLeadSourceProvider } from "./manual-list-lead-source-provider.js";

export type LeadSourceProviderRegistry = {
  get(sourceType: LeadSourceType): LeadSourceProvider;
};

export function createLeadSourceProviderRegistry(): LeadSourceProviderRegistry {
  const providers = new Map<LeadSourceType, LeadSourceProvider>();

  const builtProviders: LeadSourceProvider[] = [
    new CnpjApiLeadSourceProvider(),
    new CsvImportLeadSourceProvider(),
    new ManualListLeadSourceProvider(),
  ];

  for (const provider of builtProviders) {
    providers.set(provider.sourceType, provider);
  }

  return {
    get(sourceType: LeadSourceType): LeadSourceProvider {
      const provider = providers.get(sourceType);

      if (!provider) {
        throw new Error(`Lead source provider não encontrado para sourceType=${sourceType}.`);
      }

      return provider;
    },
  };
}

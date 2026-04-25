import type { CnpjApiDomainType } from "core";

import type {
  CnpjApiDomainClient,
  ListCnpjApiDomainResult,
} from "../adapters/cnpj-api-domain-client.js";

export type ListCnpjApiDomainItemsInput = {
  domain: CnpjApiDomainType;
  page: number;
  limit: number;
  q?: string | undefined;
  code?: string | undefined;
};

type ListCnpjApiDomainItemsDependencies = {
  cnpjApiDomainClient: CnpjApiDomainClient;
};

export async function listCnpjApiDomainItems(
  dependencies: ListCnpjApiDomainItemsDependencies,
  input: ListCnpjApiDomainItemsInput,
): Promise<ListCnpjApiDomainResult> {
  return dependencies.cnpjApiDomainClient.listDomain(input);
}

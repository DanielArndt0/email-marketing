export const CNPJ_API_DOMAIN_TYPES = ["cnaes", "cities"] as const;

export type CnpjApiDomainType = (typeof CNPJ_API_DOMAIN_TYPES)[number];

export type DomainReferenceItem = {
  code: string;
  description: string;
};

export function isCnpjApiDomainType(value: string): value is CnpjApiDomainType {
  return CNPJ_API_DOMAIN_TYPES.includes(value as CnpjApiDomainType);
}

export function parseCnpjApiDomainType(value: string): CnpjApiDomainType {
  if (isCnpjApiDomainType(value)) {
    return value;
  }

  throw new Error(`Invalid CNPJ API domain type: ${value}`);
}

export const LEAD_SOURCE_TYPES = [
  "cnpj-api",
  "csv-import",
  "manual-list",
] as const;

export type LeadSourceType = (typeof LEAD_SOURCE_TYPES)[number];

export const leadSourceType = {
  cnpjApi: "cnpj-api",
  csvImport: "csv-import",
  manualList: "manual-list",
} as const satisfies Record<string, LeadSourceType>;

export function isLeadSourceType(value: string): value is LeadSourceType {
  return LEAD_SOURCE_TYPES.includes(value as LeadSourceType);
}

export function parseLeadSourceType(value: string): LeadSourceType {
  if (isLeadSourceType(value)) {
    return value;
  }

  throw new Error(`Invalid lead source type: ${value}`);
}

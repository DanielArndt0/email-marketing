export const LEAD_SOURCE_TYPES = [
  "cnpj-api",
  "csv",
  "manual",
  "connector",
] as const;

export type LeadSourceType = (typeof LEAD_SOURCE_TYPES)[number];

export const leadSourceType = {
  cnpjApi: "cnpj-api",
  csv: "csv",
  manual: "manual",
  connector: "connector",
} as const satisfies Record<
  "cnpjApi" | "csv" | "manual" | "connector",
  LeadSourceType
>;

export function isLeadSourceType(value: string): value is LeadSourceType {
  return LEAD_SOURCE_TYPES.includes(value as LeadSourceType);
}

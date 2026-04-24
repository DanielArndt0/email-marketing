export function normalizeAudienceFilters(
  filters: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [key.trim(), value]),
  );
}

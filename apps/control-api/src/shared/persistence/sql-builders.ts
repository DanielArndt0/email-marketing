export type SqlValues = unknown[];

export function addWhereCondition(input: {
  conditions: string[];
  values: SqlValues;
  condition: (param: string) => string;
  value: unknown;
}): void {
  input.values.push(input.value);
  input.conditions.push(input.condition(`$${input.values.length}`));
}

export function buildWhereClause(conditions: string[]): string {
  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}

export function addUpdateAssignment(input: {
  assignments: string[];
  values: SqlValues;
  column: string;
  value: unknown;
  cast?: string | undefined;
}): void {
  input.values.push(input.value);
  input.assignments.push(
    `${input.column} = $${input.values.length}${input.cast ?? ""}`,
  );
}

export function readCount(
  row: { total?: string | number | null } | undefined,
): number {
  return Number(row?.total ?? 0);
}

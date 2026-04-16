import type { Pool } from "pg";

type DeleteTemplateDependencies = {
  pgPool: Pool;
};

type TemplateUsageRow = {
  count: string;
};

export type DeleteTemplateResult =
  | {
      kind: "not_found";
    }
  | {
      kind: "in_use";
      dispatchesCount: number;
    }
  | {
      kind: "deleted";
      id: string;
    };

export async function deleteTemplate(
  dependencies: DeleteTemplateDependencies,
  id: string,
): Promise<DeleteTemplateResult> {
  const templateResult = await dependencies.pgPool.query<{ id: string }>(
    `
      SELECT id
      FROM templates
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const template = templateResult.rows[0];

  if (!template) {
    return {
      kind: "not_found",
    };
  }

  const usageResult = await dependencies.pgPool.query<TemplateUsageRow>(
    `
      SELECT COUNT(*)::text AS count
      FROM email_dispatches
      WHERE template_id = $1
    `,
    [id],
  );

  const dispatchesCount = Number(usageResult.rows[0]?.count ?? "0");

  if (dispatchesCount > 0) {
    return {
      kind: "in_use",
      dispatchesCount,
    };
  }

  await dependencies.pgPool.query(
    `
      DELETE FROM templates
      WHERE id = $1
    `,
    [id],
  );

  return {
    kind: "deleted",
    id,
  };
}

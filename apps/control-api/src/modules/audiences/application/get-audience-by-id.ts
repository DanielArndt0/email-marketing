import type { Pool } from "pg";

import { findAudienceById } from "../repositories/audience-repository.js";
import { mapAudienceRow, type AudienceRecord } from "./shared.js";

type GetAudienceByIdDependencies = {
  pgPool: Pool;
};

export async function getAudienceById(
  dependencies: GetAudienceByIdDependencies,
  id: string,
): Promise<AudienceRecord | null> {
  const row = await findAudienceById(dependencies.pgPool, id);
  return row ? mapAudienceRow(row) : null;
}

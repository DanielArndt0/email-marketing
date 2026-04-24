import type { LeadRecipient, LeadSourceProvider, ResolveRecipientsInput } from "core";

import { systemConfig } from "shared";

export class CsvImportLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "csv-import" as const;

  async resolveRecipients(input: ResolveRecipientsInput): Promise<LeadRecipient[]> {
    const csvContent = typeof input.filters.csvContent === "string" ? input.filters.csvContent : "";
    const delimiter =
      typeof input.filters.delimiter === "string" && input.filters.delimiter.length > 0
        ? input.filters.delimiter
        : systemConfig.leadSources.csvImport.defaultDelimiter;
    const emailColumn =
      typeof input.filters.emailColumn === "string" && input.filters.emailColumn.length > 0
        ? input.filters.emailColumn
        : systemConfig.leadSources.csvImport.defaultEmailColumn;

    if (!csvContent.trim()) {
      return [];
    }

    const lines = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return [];
    }

    const headers = lines[0]!.split(delimiter).map((header) => header.trim());
    const emailColumnIndex = headers.findIndex(
      (header) => header.toLowerCase() === emailColumn.toLowerCase(),
    );

    if (emailColumnIndex === -1) {
      return [];
    }

    const recipients: LeadRecipient[] = [];

    for (const line of lines.slice(1)) {
      const columns = line.split(delimiter).map((column) => column.trim());
      const email = columns[emailColumnIndex] ?? "";

      if (!email) {
        continue;
      }

      const metadata: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        if (index === emailColumnIndex) {
          return;
        }

        metadata[header] = columns[index] ?? "";
      });

      recipients.push({
        email,
        externalId: null,
        sourceType: this.sourceType,
        metadata,
      });
    }

    return recipients.slice(0, input.limit);
  }
}

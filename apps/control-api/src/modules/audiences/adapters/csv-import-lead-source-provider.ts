import type {
  LeadRecipient,
  LeadSourceProvider,
  ResolveRecipientsInput,
} from "core";

export class CsvImportLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "csv-import" as const;

  async resolveRecipients(
    input: ResolveRecipientsInput,
  ): Promise<LeadRecipient[]> {
    const csvContent = this.getString(input.filters.csvContent);

    if (!csvContent) {
      return [];
    }

    const delimiter = this.getString(input.filters.delimiter) ?? ",";
    const emailColumn = this.getString(input.filters.emailColumn) ?? "email";
    const hasHeader = Boolean(input.filters.hasHeader ?? true);

    const rows = csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (rows.length === 0) {
      return [];
    }

    let header: string[] = [];
    let dataRows = rows;

    if (hasHeader) {
      header = rows[0]!.split(delimiter).map((item) => item.trim());
      dataRows = rows.slice(1);
    }

    const recipients: LeadRecipient[] = [];

    for (const row of dataRows) {
      const columns = row.split(delimiter).map((item) => item.trim());

      let email = "";
      let metadata: Record<string, unknown> = {};

      if (hasHeader && header.length > 0) {
        metadata = Object.fromEntries(
          header.map((columnName, index) => [columnName, columns[index] ?? ""]),
        );
        email = String(metadata[emailColumn] ?? "").trim();
      } else {
        email = columns[0] ?? "";
        metadata = { columns };
      }

      if (!email) {
        continue;
      }

      recipients.push({
        email,
        externalId: null,
        sourceType: this.sourceType,
        metadata,
      });
    }

    return recipients.slice(0, input.limit);
  }

  private getString(value: unknown): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const normalized = value.trim();

    return normalized.length > 0 ? normalized : undefined;
  }
}

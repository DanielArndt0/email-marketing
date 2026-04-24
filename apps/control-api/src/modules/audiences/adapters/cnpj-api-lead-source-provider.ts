import type { LeadRecipient, LeadSourceProvider, ResolveRecipientsInput } from "core";

import { env, systemConfig } from "shared";

type RawCnpjApiItem =
  | string
  | {
      email?: unknown;
      emails?: unknown;
      externalId?: unknown;
      id?: unknown;
      cnpj?: unknown;
      cnpjCompleto?: unknown;
      metadata?: unknown;
      [key: string]: unknown;
    };

type CnpjApiSearchType = "cnae" | "razao-social" | "socio";

export class CnpjApiLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "cnpj-api" as const;

  async resolveRecipients(input: ResolveRecipientsInput): Promise<LeadRecipient[]> {
    if (!env.CNPJ_API_BASE_URL) {
      throw new Error("CNPJ_API_BASE_URL não configurado para o lead source cnpj-api.");
    }

    const searchType = this.getSearchType(input.filters);
    const path = this.getPathBySearchType(searchType);
    const query = this.buildQuery(searchType, input);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.CNPJ_API_TIMEOUT_MS);

    try {
      const url = new URL(path, env.CNPJ_API_BASE_URL);

      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.set(key, String(value));
        }
      });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          ...(env.CNPJ_API_TOKEN ? { authorization: `Bearer ${env.CNPJ_API_TOKEN}` } : {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`CNPJ API respondeu com status ${response.status}.`);
      }

      const payload = (await response.json()) as unknown;
      const items = this.extractItems(payload);

      return items
        .map((item) => this.mapItem(item))
        .filter((item): item is LeadRecipient => item !== null)
        .slice(0, input.limit);
    } finally {
      clearTimeout(timeout);
    }
  }

  private getSearchType(filters: Record<string, unknown>): CnpjApiSearchType {
    const mode = filters.mode;
    const searchType = filters.searchType;
    const candidate = typeof mode === "string" ? mode : typeof searchType === "string" ? searchType : null;

    if (candidate === "cnae" || candidate === "razao-social" || candidate === "socio") {
      return candidate;
    }

    throw new Error(
      "Em audiences do tipo cnpj-api, informe mode (ou searchType) com um dos valores: cnae, razao-social, socio.",
    );
  }

  private getPathBySearchType(searchType: CnpjApiSearchType): string {
    switch (searchType) {
      case "cnae":
        return systemConfig.leadSources.cnpjApi.listByCnaePath;
      case "razao-social":
        return systemConfig.leadSources.cnpjApi.listByCompanyNamePath;
      case "socio":
        return systemConfig.leadSources.cnpjApi.listByPartnerNamePath;
    }
  }

  private buildQuery(
    searchType: CnpjApiSearchType,
    input: ResolveRecipientsInput,
  ): Record<string, string | number | undefined> {
    const filters = input.filters;
    const uf = typeof filters.uf === "string" ? filters.uf.trim() : undefined;
    const municipio = typeof filters.municipio === "string" ? filters.municipio.trim() : undefined;
    const rawPage = typeof filters.page === "number" ? filters.page : typeof input.page === "number" ? input.page : 1;
    const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1;

    if (municipio && !uf) {
      throw new Error("No lead source cnpj-api, municipio exige uf.");
    }

    const baseQuery = {
      uf,
      municipio,
      page,
      limit: input.limit,
    };

    switch (searchType) {
      case "cnae": {
        const codigosCnae = Array.isArray(filters.codigosCnae)
          ? filters.codigosCnae.map((value) => String(value).trim()).filter(Boolean).join(",")
          : typeof filters.codigosCnae === "string"
            ? filters.codigosCnae.trim()
            : undefined;

        if (!codigosCnae) {
          throw new Error("No lead source cnpj-api, codigosCnae é obrigatório para mode=cnae.");
        }

        return {
          ...baseQuery,
          codigosCnae,
        };
      }

      case "razao-social": {
        const razaoSocial = typeof filters.razaoSocial === "string" ? filters.razaoSocial.trim() : "";

        if (razaoSocial.length < 3) {
          throw new Error(
            "No lead source cnpj-api, razaoSocial deve ter ao menos 3 caracteres úteis para mode=razao-social.",
          );
        }

        return {
          ...baseQuery,
          razaoSocial,
        };
      }

      case "socio": {
        const nomeSocio = typeof filters.nomeSocio === "string" ? filters.nomeSocio.trim() : "";

        if (nomeSocio.length < 3) {
          throw new Error(
            "No lead source cnpj-api, nomeSocio deve ter ao menos 3 caracteres úteis para mode=socio.",
          );
        }

        return {
          ...baseQuery,
          nomeSocio,
        };
      }
    }
  }

  private extractItems(payload: unknown): RawCnpjApiItem[] {
    if (Array.isArray(payload)) {
      return payload as RawCnpjApiItem[];
    }

    if (typeof payload === "object" && payload !== null) {
      const maybePayload = payload as { items?: unknown; data?: unknown; results?: unknown };

      if (Array.isArray(maybePayload.items)) {
        return maybePayload.items as RawCnpjApiItem[];
      }

      if (Array.isArray(maybePayload.data)) {
        return maybePayload.data as RawCnpjApiItem[];
      }

      if (Array.isArray(maybePayload.results)) {
        return maybePayload.results as RawCnpjApiItem[];
      }
    }

    return [];
  }

  private mapItem(item: RawCnpjApiItem): LeadRecipient | null {
    if (typeof item === "string") {
      const email = item.trim();

      if (!email) {
        return null;
      }

      return {
        email,
        externalId: null,
        sourceType: this.sourceType,
        metadata: {},
      };
    }

    const email =
      typeof item.email === "string"
        ? item.email.trim()
        : Array.isArray(item.emails) && typeof item.emails[0] === "string"
          ? item.emails[0].trim()
          : "";

    if (!email) {
      return null;
    }

    const { externalId, id, cnpj, cnpjCompleto, metadata, ...rest } = item;

    return {
      email,
      externalId:
        typeof externalId === "string"
          ? externalId
          : typeof id === "string"
            ? id
            : typeof cnpjCompleto === "string"
              ? cnpjCompleto
              : typeof cnpj === "string"
                ? cnpj
                : null,
      sourceType: this.sourceType,
      metadata:
        typeof metadata === "object" && metadata !== null
          ? { ...(metadata as Record<string, unknown>), ...rest }
          : rest,
    };
  }
}

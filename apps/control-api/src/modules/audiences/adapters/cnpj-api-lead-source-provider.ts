import type {
  LeadRecipient,
  LeadSourceProvider,
  ResolveRecipientsInput,
} from "core";

import { env, systemConfig } from "shared";

import {
  LeadSourceConfigurationError,
  LeadSourceRequestError,
} from "../errors/lead-source-errors.js";

type RawCnpjApiItem =
  | string
  | {
      email?: unknown;
      emails?: unknown;
      correioEletronico?: unknown;
      emailPrincipal?: unknown;
      contactEmail?: unknown;
      externalId?: unknown;
      id?: unknown;
      cnpj?: unknown;
      cnpjCompleto?: unknown;
      cnpjFull?: unknown;
      metadata?: unknown;
      [key: string]: unknown;
    };

type CnpjApiSearchType = "cnae" | "razao-social" | "socio";

type CnpjApiFilters = {
  searchType: CnpjApiSearchType;
  page: number;
  limit: number;
  uf?: string | undefined;
  municipio?: string | undefined;
  codigosCnae?: string | undefined;
  razaoSocial?: string | undefined;
  nomeSocio?: string | undefined;
};

type CnpjApiQuery = Record<string, string | number | undefined>;

const CNPJ_API_SEARCH_TYPES = ["cnae", "razao-social", "socio"] as const;
const MIN_TEXT_SEARCH_LENGTH = 3;

export class CnpjApiLeadSourceProvider implements LeadSourceProvider {
  readonly sourceType = "cnpj-api" as const;

  async resolveRecipients(
    input: ResolveRecipientsInput,
  ): Promise<LeadRecipient[]> {
    const baseUrl = env.CNPJ_API_BASE_URL;

    if (!baseUrl) {
      throw new LeadSourceConfigurationError(
        "CNPJ_API_BASE_URL não configurado para o lead source cnpj-api.",
      );
    }

    const filters = this.normalizeFilters(input);
    const url = this.buildUrl(filters, baseUrl);
    const responsePayload = await this.fetchCnpjApi(url);
    const items = this.extractItems(responsePayload);

    return items
      .map((item) => this.mapItem(item))
      .filter((item): item is LeadRecipient => item !== null)
      .slice(0, filters.limit);
  }

  private normalizeFilters(input: ResolveRecipientsInput): CnpjApiFilters {
    const filters = input.filters;
    const searchType = this.getSearchType(filters);
    const page = this.getPositiveInteger(filters.page) ?? 1;
    const limit = this.getPositiveInteger(filters.limit) ?? input.limit;
    const uf = this.getOptionalString(filters.uf)?.toUpperCase();
    const municipio = this.getOptionalString(filters.municipio);

    if (municipio && !uf) {
      throw new LeadSourceConfigurationError(
        "No lead source cnpj-api, municipio exige uf.",
      );
    }

    switch (searchType) {
      case "cnae":
        return {
          searchType,
          page,
          limit,
          uf,
          municipio,
          codigosCnae: this.getRequiredCnaeCodes(filters),
        };

      case "razao-social":
        return {
          searchType,
          page,
          limit,
          uf,
          municipio,
          razaoSocial: this.getRequiredTextFilter(
            filters.razaoSocial,
            "razaoSocial",
            searchType,
          ),
        };

      case "socio":
        return {
          searchType,
          page,
          limit,
          uf,
          municipio,
          nomeSocio: this.getRequiredTextFilter(
            filters.nomeSocio,
            "nomeSocio",
            searchType,
          ),
        };
    }
  }

  private getSearchType(filters: Record<string, unknown>): CnpjApiSearchType {
    const rawSearchType = filters.searchType ?? filters.mode;

    if (
      typeof rawSearchType === "string" &&
      CNPJ_API_SEARCH_TYPES.includes(rawSearchType as CnpjApiSearchType)
    ) {
      return rawSearchType as CnpjApiSearchType;
    }

    throw new LeadSourceConfigurationError(
      "Em audiences do tipo cnpj-api, informe searchType ou mode com um dos valores: cnae, razao-social, socio.",
    );
  }

  private getRequiredCnaeCodes(filters: Record<string, unknown>): string {
    const rawCodes = filters.codigosCnae;

    if (Array.isArray(rawCodes)) {
      const codes = rawCodes
        .filter((code): code is string => typeof code === "string")
        .map((code) => code.trim())
        .filter(Boolean)
        .join(",");

      if (codes) {
        return codes;
      }
    }

    if (typeof rawCodes === "string" && rawCodes.trim()) {
      return rawCodes.trim();
    }

    throw new LeadSourceConfigurationError(
      "No lead source cnpj-api, codigosCnae é obrigatório para searchType=cnae.",
    );
  }

  private getRequiredTextFilter(
    value: unknown,
    fieldName: "razaoSocial" | "nomeSocio",
    searchType: CnpjApiSearchType,
  ): string {
    const text = typeof value === "string" ? value.trim() : "";

    if (text.length < MIN_TEXT_SEARCH_LENGTH) {
      throw new LeadSourceConfigurationError(
        `No lead source cnpj-api, ${fieldName} deve conter ao menos ${MIN_TEXT_SEARCH_LENGTH} caracteres úteis para searchType=${searchType}.`,
      );
    }

    return text;
  }

  private buildUrl(filters: CnpjApiFilters, baseUrl: string): URL {
    const url = new URL(this.getPathBySearchType(filters.searchType), baseUrl);

    Object.entries(this.buildQuery(filters)).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });

    return url;
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

  private buildQuery(filters: CnpjApiFilters): CnpjApiQuery {
    const baseQuery: CnpjApiQuery = {
      page: filters.page,
      limit: filters.limit,
      uf: filters.uf,
      municipio: filters.municipio,
    };

    switch (filters.searchType) {
      case "cnae":
        return {
          ...baseQuery,
          codigosCnae: filters.codigosCnae,
        };

      case "razao-social":
        return {
          ...baseQuery,
          razaoSocial: filters.razaoSocial,
        };

      case "socio":
        return {
          ...baseQuery,
          nomeSocio: filters.nomeSocio,
        };
    }
  }

  private async fetchCnpjApi(url: URL): Promise<unknown> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      env.CNPJ_API_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
          ...(env.CNPJ_API_TOKEN
            ? { authorization: `Bearer ${env.CNPJ_API_TOKEN}` }
            : {}),
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const responseBody = await response.text().catch(() => "");
        throw new LeadSourceRequestError(
          `CNPJ API respondeu com status ${response.status}.${responseBody ? ` Detalhes: ${responseBody.slice(0, 300)}` : ""}`,
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof LeadSourceRequestError) {
        throw error;
      }

      throw new LeadSourceRequestError(
        `Falha ao consultar CNPJ API em ${url.pathname}. Verifique CNPJ_API_BASE_URL, disponibilidade da API e filtros informados.`,
        error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private getOptionalString(value: unknown): string | undefined {
    if (typeof value !== "string") {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }

  private getPositiveInteger(value: unknown): number | undefined {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
      return value;
    }

    if (typeof value === "string" && /^\d+$/.test(value.trim())) {
      const parsed = Number(value);
      return parsed > 0 ? parsed : undefined;
    }

    return undefined;
  }

  private extractItems(payload: unknown): RawCnpjApiItem[] {
    if (typeof payload !== "object" || payload === null) {
      return [];
    }

    const response = payload as {
      dados?: {
        dados?: unknown;
      };
    };

    if (!Array.isArray(response.dados?.dados)) {
      return [];
    }

    return response.dados.dados as RawCnpjApiItem[];
  }

  private mapItem(item: RawCnpjApiItem): LeadRecipient | null {
    if (typeof item === "string") {
      return this.mapEmailString(item);
    }

    const email = this.extractEmail(item);

    if (!email) {
      return null;
    }

    return {
      email,
      externalId: this.extractExternalId(item),
      sourceType: this.sourceType,
      metadata: this.extractMetadata(item),
    };
  }

  private mapEmailString(value: string): LeadRecipient | null {
    const email = value.trim();

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

  private extractEmail(item: Exclude<RawCnpjApiItem, string>): string | null {
    const directEmailCandidates = [
      item.email,
      item.correioEletronico,
      item.emailPrincipal,
      item.contactEmail,
    ];

    const directEmail = directEmailCandidates.find(
      (candidate): candidate is string =>
        typeof candidate === "string" && candidate.trim().length > 0,
    );

    if (directEmail) {
      return directEmail.trim();
    }

    if (Array.isArray(item.emails)) {
      const emailFromArray = item.emails.find(
        (candidate): candidate is string =>
          typeof candidate === "string" && candidate.trim().length > 0,
      );

      return emailFromArray?.trim() ?? null;
    }

    return null;
  }

  private extractExternalId(
    item: Exclude<RawCnpjApiItem, string>,
  ): string | null {
    const candidates = [
      item.externalId,
      item.id,
      item.cnpjCompleto,
      item.cnpjFull,
      item.cnpj,
    ];

    const externalId = candidates.find(
      (candidate): candidate is string =>
        typeof candidate === "string" && candidate.trim().length > 0,
    );

    return externalId?.trim() ?? null;
  }

  private extractMetadata(
    item: Exclude<RawCnpjApiItem, string>,
  ): Record<string, unknown> {
    const reservedKeys = new Set([
      "email",
      "emails",
      "correioEletronico",
      "emailPrincipal",
      "contactEmail",
      "externalId",
      "id",
      "cnpj",
      "cnpjCompleto",
      "cnpjFull",
      "metadata",
    ]);

    const metadata: Record<string, unknown> =
      typeof item.metadata === "object" && item.metadata !== null
        ? { ...(item.metadata as Record<string, unknown>) }
        : {};

    Object.entries(item).forEach(([key, value]) => {
      if (!reservedKeys.has(key)) {
        metadata[key] = value;
      }
    });

    return metadata;
  }
}

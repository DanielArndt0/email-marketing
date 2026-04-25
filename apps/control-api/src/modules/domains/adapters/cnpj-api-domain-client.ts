import type { CnpjApiDomainType, DomainReferenceItem } from "core";

import { env, systemConfig } from "shared";

import {
  CnpjApiDomainConfigurationError,
  CnpjApiDomainRequestError,
} from "../errors/cnpj-api-domain-errors.js";

export type ListCnpjApiDomainInput = {
  domain: CnpjApiDomainType;
  page: number;
  limit: number;
  q?: string | undefined;
  code?: string | undefined;
};

export type ListCnpjApiDomainResult = {
  domain: CnpjApiDomainType;
  page: number;
  limit: number;
  count: number;
  hasNextPage: boolean;
  items: DomainReferenceItem[];
};

type RawCnpjApiDomainItem = Record<string, unknown>;

type RawCnpjApiDomainPayload = {
  sucesso?: boolean;
  dados?: {
    pagina?: unknown;
    limite?: unknown;
    dados?: unknown;
    hasNextPage?: unknown;
  };
};

export class CnpjApiDomainClient {
  async listDomain(
    input: ListCnpjApiDomainInput,
  ): Promise<ListCnpjApiDomainResult> {
    const baseUrl = env.CNPJ_API_BASE_URL;

    if (!baseUrl) {
      throw new CnpjApiDomainConfigurationError(
        "CNPJ_API_BASE_URL não configurado para consulta de domínios da CNPJ API.",
      );
    }

    const url = this.buildUrl(input, baseUrl);
    const payload = await this.fetchCnpjApi(url);
    const domainPayload = this.parsePayload(payload, input.domain);
    const items = domainPayload.items
      .map((item) => this.mapDomainItem(input.domain, item))
      .filter((item): item is DomainReferenceItem => item !== null);

    return {
      domain: input.domain,
      page: domainPayload.page ?? input.page,
      limit: domainPayload.limit ?? input.limit,
      count: items.length,
      hasNextPage: domainPayload.hasNextPage,
      items,
    };
  }

  private buildUrl(input: ListCnpjApiDomainInput, baseUrl: string): URL {
    const url = new URL(this.getDomainPath(input.domain), baseUrl);

    url.searchParams.set("page", String(input.page));
    url.searchParams.set("limit", String(input.limit));

    if (input.q) {
      url.searchParams.set("q", input.q);
    }

    if (input.code) {
      url.searchParams.set("code", input.code);
    }

    return url;
  }

  private getDomainPath(domain: CnpjApiDomainType): string {
    switch (domain) {
      case "cnaes":
        return systemConfig.domains.cnpjApi.cnaesPath;
      case "cities":
        return systemConfig.domains.cnpjApi.citiesPath;
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

        throw new CnpjApiDomainRequestError(
          `CNPJ API respondeu com status ${response.status}.${responseBody ? ` Detalhes: ${responseBody.slice(0, 300)}` : ""}`,
        );
      }

      return (await response.json()) as unknown;
    } catch (error) {
      if (error instanceof CnpjApiDomainRequestError) {
        throw error;
      }

      throw new CnpjApiDomainRequestError(
        `Falha ao consultar domínio da CNPJ API em ${url.pathname}. Verifique CNPJ_API_BASE_URL, disponibilidade da API e filtros informados.`,
        error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  private parsePayload(
    payload: unknown,
    domain: CnpjApiDomainType,
  ): {
    page: number | null;
    limit: number | null;
    hasNextPage: boolean;
    items: RawCnpjApiDomainItem[];
  } {
    if (typeof payload !== "object" || payload === null) {
      throw new CnpjApiDomainRequestError(
        `Resposta inválida da CNPJ API para o domínio ${domain}.`,
      );
    }

    const response = payload as RawCnpjApiDomainPayload;

    if (response.sucesso === false) {
      throw new CnpjApiDomainRequestError(
        `CNPJ API retornou sucesso=false para o domínio ${domain}.`,
      );
    }

    const rawItems = response.dados?.dados;

    if (!Array.isArray(rawItems)) {
      throw new CnpjApiDomainRequestError(
        `Resposta da CNPJ API para o domínio ${domain} não contém dados.dados como array.`,
      );
    }

    return {
      page: this.getOptionalInteger(response.dados?.pagina),
      limit: this.getOptionalInteger(response.dados?.limite),
      hasNextPage: response.dados?.hasNextPage === true,
      items: rawItems.filter(
        (item): item is RawCnpjApiDomainItem =>
          typeof item === "object" && item !== null,
      ),
    };
  }

  private mapDomainItem(
    domain: CnpjApiDomainType,
    item: RawCnpjApiDomainItem,
  ): DomainReferenceItem | null {
    const code = this.extractCode(domain, item);
    const description = this.extractDescription(domain, item);

    if (!code || !description) {
      return null;
    }

    return {
      code,
      description,
    };
  }

  private extractCode(
    domain: CnpjApiDomainType,
    item: RawCnpjApiDomainItem,
  ): string | null {
    const keys =
      domain === "cnaes"
        ? ["code", "codigo", "codigoCnae", "cnae", "id"]
        : [
            "code",
            "codigo",
            "codigoCidade",
            "codigoMunicipio",
            "cityCode",
            "id",
          ];

    return this.extractFirstString(item, keys);
  }

  private extractDescription(
    domain: CnpjApiDomainType,
    item: RawCnpjApiDomainItem,
  ): string | null {
    const keys =
      domain === "cnaes"
        ? ["description", "descricao", "descricaoCnae", "name", "nome"]
        : [
            "description",
            "descricao",
            "name",
            "nome",
            "cidade",
            "cityName",
            "nomeCidade",
            "municipio",
          ];

    return this.extractFirstString(item, keys);
  }

  private extractFirstString(
    item: RawCnpjApiDomainItem,
    keys: string[],
  ): string | null {
    for (const key of keys) {
      const value = item[key];

      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }

      if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
      }
    }

    return null;
  }

  private getOptionalInteger(value: unknown): number | null {
    if (typeof value === "number" && Number.isInteger(value) && value > 0) {
      return value;
    }

    return null;
  }
}

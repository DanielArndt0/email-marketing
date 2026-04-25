import type { FastifyInstance, FastifySchema } from "fastify";

import { CnpjApiDomainClient } from "../../modules/domains/adapters/cnpj-api-domain-client.js";
import { createGetListCnpjApiDomainHandler } from "../../modules/domains/http/get-list-cnpj-api-domain-handler.js";
import {
  cnpjApiDomainListSchema,
  cnpjApiDomainQuerySchema,
  domainMessageSchema,
} from "../schemas/domain-schemas.js";

const listCnpjApiCnaesRouteSchema = {
  tags: ["domains"],
  summary: "Lista CNAEs da CNPJ API",
  description:
    "Proxy controlado para a tabela de domínio de CNAEs da CNPJ API. Retorna código e descrição para popular selects, autocompletes e filtros do front-end.",
  querystring: cnpjApiDomainQuerySchema,
  response: {
    200: cnpjApiDomainListSchema,
    400: domainMessageSchema,
    502: domainMessageSchema,
  },
} satisfies FastifySchema;

const listCnpjApiCitiesRouteSchema = {
  tags: ["domains"],
  summary: "Lista cidades da CNPJ API",
  description:
    "Proxy controlado para a tabela de domínio de cidades da CNPJ API. Retorna código e descrição para popular selects, autocompletes e filtros do front-end.",
  querystring: cnpjApiDomainQuerySchema,
  response: {
    200: cnpjApiDomainListSchema,
    400: domainMessageSchema,
    502: domainMessageSchema,
  },
} satisfies FastifySchema;

export function registerDomainsRoute(app: FastifyInstance): void {
  const cnpjApiDomainClient = new CnpjApiDomainClient();

  app.get(
    "/domains/cnpj-api/cnaes",
    {
      schema: listCnpjApiCnaesRouteSchema,
    },
    createGetListCnpjApiDomainHandler({
      cnpjApiDomainClient,
      domain: "cnaes",
    }),
  );

  app.get(
    "/domains/cnpj-api/cities",
    {
      schema: listCnpjApiCitiesRouteSchema,
    },
    createGetListCnpjApiDomainHandler({
      cnpjApiDomainClient,
      domain: "cities",
    }),
  );
}

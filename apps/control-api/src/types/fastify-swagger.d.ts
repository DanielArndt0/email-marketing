declare module "@fastify/swagger" {
  import type { FastifyPluginAsync } from "fastify";

  const fastifySwagger: FastifyPluginAsync<Record<string, unknown>>;
  export default fastifySwagger;
}

declare module "@fastify/swagger-ui" {
  import type { FastifyPluginAsync } from "fastify";

  const fastifySwaggerUi: FastifyPluginAsync<Record<string, unknown>>;
  export default fastifySwaggerUi;
}

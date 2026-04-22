export const healthCheckResponseSchema = {
  type: "object",
  required: ["status", "service", "environment", "timestamp", "checks"],
  properties: {
    status: { type: "string", enum: ["ok", "error"] },
    service: { type: "string", const: "control-api" },
    environment: { type: "string" },
    timestamp: { type: "string", format: "date-time" },
    checks: {
      type: "object",
      required: ["postgres", "redis"],
      properties: {
        postgres: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["ok", "error"] },
            details: { type: "string" },
          },
        },
        redis: {
          type: "object",
          required: ["status"],
          properties: {
            status: { type: "string", enum: ["ok", "error"] },
            details: { type: "string" },
          },
        },
      },
    },
  },
} as const;

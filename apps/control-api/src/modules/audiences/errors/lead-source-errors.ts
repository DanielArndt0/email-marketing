export class LeadSourceConfigurationError extends Error {
  readonly name = "LeadSourceConfigurationError";
}

export class LeadSourceRequestError extends Error {
  readonly name = "LeadSourceRequestError";

  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
  }
}

export function isLeadSourceConfigurationError(
  error: unknown,
): error is LeadSourceConfigurationError {
  return error instanceof LeadSourceConfigurationError;
}

export function isLeadSourceRequestError(
  error: unknown,
): error is LeadSourceRequestError {
  return error instanceof LeadSourceRequestError;
}

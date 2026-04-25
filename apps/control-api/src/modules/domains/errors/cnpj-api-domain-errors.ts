export class CnpjApiDomainConfigurationError extends Error {
  readonly name = "CnpjApiDomainConfigurationError";
}

export class CnpjApiDomainRequestError extends Error {
  readonly name = "CnpjApiDomainRequestError";

  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
  }
}

export function isCnpjApiDomainConfigurationError(
  error: unknown,
): error is CnpjApiDomainConfigurationError {
  return error instanceof CnpjApiDomainConfigurationError;
}

export function isCnpjApiDomainRequestError(
  error: unknown,
): error is CnpjApiDomainRequestError {
  return error instanceof CnpjApiDomainRequestError;
}

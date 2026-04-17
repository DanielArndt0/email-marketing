export const EMAIL_DISPATCH_STATUSES = [
  "pending",
  "queued",
  "processing",
  "sent",
  "error",
] as const;

export type EmailDispatchStatus = (typeof EMAIL_DISPATCH_STATUSES)[number];

export const emailDispatchStatus = {
  pending: "pending",
  queued: "queued",
  processing: "processing",
  sent: "sent",
  error: "error",
} as const satisfies Record<EmailDispatchStatus, EmailDispatchStatus>;

export function canRetryEmailDispatch(
  status: EmailDispatchStatus | string,
): boolean {
  return status === emailDispatchStatus.error;
}

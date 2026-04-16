export const EMAIL_DISPATCH_QUEUE_NAME = "email-dispatch";

export type EmailDispatchJobData = {
  campaignId: string;
  contactId: string;
  to: string;
  subject: string;
};

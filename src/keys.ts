export type QueueKeys =
  | 'emails'
  | 'sessions'
  | 'notifications'
  | 'billings'
  | 'billingPastDue';

export const QUEUE_KEYS: Record<QueueKeys, string> = {
  emails: 'emailQueue',
  sessions: 'sessionQueue',
  notifications: 'notificationQueue',
  billings: 'BillingsQueue',
  billingPastDue: 'BillingsPastDueQueue',
};

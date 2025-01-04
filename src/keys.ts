export type QueueKeys = 'emails' | 'sessions' | 'notifications';

export const QUEUE_KEYS: Record<QueueKeys, string> = {
  emails: 'emailQueue',
  sessions: 'sessionQueue',
  notifications: 'notificationQueue',
};

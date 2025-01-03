export type QueueKeys = 'sessions' | 'notifications';

export const QUEUE_KEYS: Record<QueueKeys, string> = {
  sessions: 'sessionQueue',
  notifications: 'notificationQueue',
};

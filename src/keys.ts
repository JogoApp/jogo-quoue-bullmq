export type QueueKeys = 'credits' | 'sessions' | 'notifications';

export const QUEUE_KEYS: Record<QueueKeys, string> = {
  credits: 'creditQueue',
  sessions: 'sessionQueue',
  notifications: 'notificationQueue',
};

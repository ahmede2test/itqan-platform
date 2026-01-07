export interface GlobalNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  timestamp: number;
  read: boolean;
}

const STORAGE_KEY = 'itqan_global_notifications';

export const getNotifications = (): GlobalNotification[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addNotification = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
  const notifications = getNotifications();
  const newNotification: GlobalNotification = {
    id: Date.now().toString(),
    type,
    message,
    timestamp: Date.now(),
    read: false,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newNotification, ...notifications]));
  
  // Dispatch event for real-time updates across tabs/components
  window.dispatchEvent(new Event('storage'));
};

export const markAllRead = () => {
  const notifications = getNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event('storage'));
};

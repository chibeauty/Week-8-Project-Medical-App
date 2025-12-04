export interface AppNotification {
  id: string;
  type: 'alert' | 'info';
  title: string;
  message: string;
  timestamp: string; // ISO
  read: boolean;
}

const STORAGE_KEY = 'app_notifications';

const generateId = () => `n_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;

const loadAll = (): AppNotification[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveAll = (items: AppNotification[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    // ignore
  }
};

export const addNotification = (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
  const now = new Date().toISOString();
  const notif: AppNotification = {
    id: generateId(),
    timestamp: now,
    read: false,
    ...n,
  };
  const all = loadAll();
  all.unshift(notif); // latest first
  saveAll(all);
  try {
    window.dispatchEvent(new CustomEvent('notifications:updated', { detail: notif }));
  } catch (e) {
    // ignore
  }
  return notif;
};

export const getNotifications = (): Promise<AppNotification[]> => {
  return Promise.resolve(loadAll().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
};

export const markAsRead = (id: string) => {
  const all = loadAll();
  const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
  saveAll(updated);
  try {
    window.dispatchEvent(new CustomEvent('notifications:updated', { detail: null }));
  } catch (e) {}
};

export const clearNotifications = () => {
  saveAll([]);
  try { window.dispatchEvent(new CustomEvent('notifications:updated', { detail: null })); } catch (e) {}
};

// Generate alerts from heart-rate reading
export const handleHeartRateReading = (hr: number, meta?: { source?: string }) => {
  // Prevent flooding: suppress duplicate alerts of same title for short window
  const SUPPRESSION_MS = 30 * 1000; // 30s
  (handleHeartRateReading as any)._last = (handleHeartRateReading as any)._last || {};
  const last = (handleHeartRateReading as any)._last as Record<string, number>;

  const tryAdd = (title: string, payload: Omit<AppNotification, 'id'|'timestamp'|'read'>) => {
    const now = Date.now();
    const lastTime = last[title] || 0;
    if (now - lastTime < SUPPRESSION_MS) return;
    last[title] = now;
    addNotification(payload);
  };

  // threshold example: >120 bpm at rest
  if (hr > 120) {
    tryAdd('High Heart Rate Detected', { type: 'alert', title: 'High Heart Rate Detected', message: `Heart rate ${hr} bpm${meta?.source ? ` (${meta.source})` : ''}` });
  }

  // simple irregular heartbeat heuristic: odd low/high transitions aren't easy to detect here
  // For demo, if hr < 40 or hr > 180 we add irregular heartbeat
  if (hr < 40 || hr > 180) {
    tryAdd('Irregular Heartbeat', { type: 'alert', title: 'Irregular Heartbeat', message: `Potential irregular heartbeat detected: ${hr} bpm` });
  }
};

export default {
  addNotification,
  getNotifications,
  markAsRead,
  clearNotifications,
  handleHeartRateReading,
};

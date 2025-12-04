import { useEffect, useMemo, useState } from 'react';
import type { AppNotification } from '@/lib/notifications';
import { getNotifications as apiGetNotifications } from '@/lib/api';
import notifModule from '@/lib/notifications';
import NotificationCard from '@/components/NotificationCard';
import VitalsPreview from '@/components/VitalsPreview';
import { Button } from '@/components/ui/button';

export function Notifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all'|'hr'|'bp'|'system'>('all');

  const reload = async () => {
    const items = await apiGetNotifications();
    setNotifications(items as AppNotification[]);
  };

  useEffect(() => {
    reload();
    const handler = () => { reload(); };
    window.addEventListener('notifications:updated', handler);
    return () => window.removeEventListener('notifications:updated', handler);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return notifications;
    if (filter === 'hr') return notifications.filter(n => /heart|heartbeat|hr/i.test(n.title + n.message));
    if (filter === 'bp') return notifications.filter(n => /blood|pressure|hypertension/i.test(n.title + n.message));
    return notifications.filter(n => /summary|update|system/i.test(n.title + n.message));
  }, [notifications, filter]);

  const grouped = useMemo(() => {
    const now = Date.now();
    const recent: AppNotification[] = [];
    const today: AppNotification[] = [];
    const week: AppNotification[] = [];

    for (const n of filtered) {
      const age = now - new Date(n.timestamp).getTime();
      if (age < 1000 * 60 * 60 * 1) recent.push(n); // last hour
      else if (age < 1000 * 60 * 60 * 24) today.push(n);
      else week.push(n);
    }
    return { recent, today, week };
  }, [filtered]);

  const markRead = (id: string) => {
    notifModule.markAsRead(id);
  };

  const clearOne = (id: string) => {
    // naive clear: load all, remove id, save via notifications module
    const all = JSON.parse(localStorage.getItem('app_notifications') || '[]');
    const updated = all.filter((a: any) => a.id !== id);
    localStorage.setItem('app_notifications', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('notifications:updated'));
  };

  const clearAll = () => {
    notifModule.clearNotifications();
  };

  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-6'>Alerts & Notifications</h1>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='lg:col-span-1'>
          <VitalsPreview />
          <div className='mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm'>
            <div className='flex items-center justify-between mb-2'>
              <div className='flex items-center gap-2'>
                <h3 className='font-semibold'>Filters</h3>
              </div>
              <div className='flex items-center gap-2'>
                <Button size='sm' variant='ghost' onClick={clearAll}>Clear All</Button>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              <button className={`px-3 py-1 rounded text-sm ${filter==='all'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('all')}>All</button>
              <button className={`px-3 py-1 rounded text-sm ${filter==='hr'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('hr')}>Heart rate</button>
              <button className={`px-3 py-1 rounded text-sm ${filter==='bp'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('bp')}>Blood pressure</button>
              <button className={`px-3 py-1 rounded text-sm ${filter==='system'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setFilter('system')}>System</button>
            </div>
          </div>
        </div>

        <div className='lg:col-span-2 space-y-4'>
          {/* Recent */}
          {grouped.recent.length > 0 && (
            <section>
              <h4 className='text-sm font-semibold mb-2'>Recent</h4>
              <div className='space-y-3'>
                {grouped.recent.map(n => (
                  <NotificationCard key={n.id} notif={n} onMarkRead={markRead} onClear={clearOne} />
                ))}
              </div>
            </section>
          )}

          {grouped.today.length > 0 && (
            <section>
              <h4 className='text-sm font-semibold mb-2'>Today</h4>
              <div className='space-y-3'>
                {grouped.today.map(n => (
                  <NotificationCard key={n.id} notif={n} onMarkRead={markRead} onClear={clearOne} />
                ))}
              </div>
            </section>
          )}

          {grouped.week.length > 0 && (
            <section>
              <h4 className='text-sm font-semibold mb-2'>This Week</h4>
              <div className='space-y-3'>
                {grouped.week.map(n => (
                  <NotificationCard key={n.id} notif={n} onMarkRead={markRead} onClear={clearOne} />
                ))}
              </div>
            </section>
          )}

          {notifications.length === 0 && (
            <div className='p-6 text-center text-sm text-muted-foreground rounded-lg bg-white dark:bg-gray-800'>
              No notifications yet — try the "Generate test notifications" button below or wait for alerts.
              <div className='mt-3'>
                <Button onClick={async () => {
                  notifModule.addNotification({ type: 'info', title: 'Weekly Summary Ready', message: 'Your weekly health report is available.' });
                  notifModule.addNotification({ type: 'alert', title: 'High Heart Rate Detected', message: 'Heart rate 128 bpm (simulated).' });
                  notifModule.addNotification({ type: 'alert', title: 'Irregular Heartbeat', message: 'Potential irregular heartbeat detected: 42 bpm (simulated).' });
                  await reload();
                }}>Generate test notifications</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
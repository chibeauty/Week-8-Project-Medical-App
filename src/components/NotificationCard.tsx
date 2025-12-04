import { useState } from 'react';
import { Heart, AlertTriangle, BarChart2, Bell } from 'lucide-react';
import type { AppNotification } from '@/lib/notifications';
import { Button } from '@/components/ui/button';

interface Props {
  notif: AppNotification;
  onMarkRead?: (id: string) => void;
  onClear?: (id: string) => void;
}

export default function NotificationCard({ notif, onMarkRead, onClear }: Props) {
  const [expanded, setExpanded] = useState(false);

  const icon = notif.title.toLowerCase().includes('heart')
    ? <Heart className='h-5 w-5 text-red-600' />
    : notif.title.toLowerCase().includes('hypertension') || notif.title.toLowerCase().includes('blood')
    ? <AlertTriangle className='h-5 w-5 text-orange-600' />
    : notif.title.toLowerCase().includes('summary')
    ? <BarChart2 className='h-5 w-5 text-blue-600' />
    : <Bell className='h-5 w-5 text-green-600' />;

  return (
    <div
      role="article"
      className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 transition-all duration-300 ease-in-out hover:shadow-md ${!notif.read ? 'ring-1 ring-blue-200 dark:ring-blue-900' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-sm leading-tight">{notif.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
            </div>
            <div className="text-xs text-gray-400">
              <div>{new Date(notif.timestamp).toLocaleString()}</div>
            </div>
          </div>

          {expanded && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              {/* Placeholder for expanded details; in real app show provenance, reading values, recommendations */}
              <div>Details: {notif.message}</div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" variant={notif.read ? 'outline' : 'default'} onClick={() => { onMarkRead?.(notif.id); }}>
              {notif.read ? 'Read' : 'Mark as read'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setExpanded(e => !e)}>
              {expanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onClear?.(notif.id)}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Bell, ShieldAlert } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    type: 'alert',
    title: 'High Heart Rate Detected',
    message: 'Your heart rate reached 125 bpm while at rest.',
    time: '5m ago',
    read: false,
  },
  {
    id: 2,
    type: 'info',
    title: 'Weekly Summary Ready',
    message: 'Your weekly health report is available to view.',
    time: '2h ago',
    read: true,
  },
  {
    id: 3,
    type: 'alert',
    title: 'Irregular Heartbeat',
    message: 'An irregular heartbeat pattern was detected.',
    time: '1d ago',
    read: true,
  },
];

export function Notifications() {
  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-6'>Alerts & Notifications</h1>
      <div className='space-y-4'>
        {mockNotifications.map((notif) => (
          <div key={notif.id} className={`p-4 rounded-lg flex items-start space-x-4 ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-800'}`}>
            <div className={`mt-1 p-2 rounded-full ${notif.type === 'alert' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              {notif.type === 'alert' ? <ShieldAlert className='w-6 h-6 text-red-500' /> : <Bell className='w-6 h-6 text-green-500' />}
            </div>
            <div className='flex-1'>
              <div className='flex justify-between items-center'>
                <h2 className='font-bold'>{notif.title}</h2>
                <span className='text-xs text-gray-500 dark:text-gray-400'>{notif.time}</span>
              </div>
              <p className='text-sm text-gray-600 dark:text-gray-300'>{notif.message}</p>
            </div>
            {!notif.read && <div className='w-2.5 h-2.5 rounded-full bg-blue-500 mt-2.5'></div>}
          </div>
        ))}
      </div>
    </div>
  );
}
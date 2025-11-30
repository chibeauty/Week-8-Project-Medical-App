import { useState } from 'react';
import { cn } from '../lib/utils';
import { ActivityChart } from '../components/ActivityChart';
import { HeartRateChart } from '../components/HeartRateChart';
import { getHeartRateHistory, getActivityHistory } from '../lib/api';

const tabs = ['Daily', 'Weekly', 'Monthly'];

export function History() {
  const [activeTab, setActiveTab] = useState('Weekly');
  const heartRateHistory = getHeartRateHistory();
  const activityHistory = getActivityHistory();


  // In a real app, you'd filter data based on the activeTab
  const filteredHeartRateData = heartRateHistory;
  const filteredActivityData = activityHistory;

  return (
    <div className='p-4 md:p-6'>
      <h1 className='text-2xl font-bold mb-4'>Health History</h1>

      <div className='mb-6'>
        <div className='flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg'>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'w-full py-2 text-sm font-semibold rounded-md transition-colors',
                activeTab === tab
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300/50 dark:hover:bg-gray-700/50'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <h2 className='text-lg font-semibold'>{activeTab} Heart Rate</h2>
          <HeartRateChart data={filteredHeartRateData} />
        </div>
        <div>
          <h2 className='text-lg font-semibold mt-6'>{activeTab} Activity</h2>
          <ActivityChart data={filteredActivityData} />
        </div>
      </div>
    </div>
  );
}
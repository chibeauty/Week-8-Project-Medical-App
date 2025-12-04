import { useState, useEffect } from 'react';
import { Heart, Wind, Bed, Footprints, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HealthMetricCard } from '../components/HealthMetricCard';
import { HeartRateChart } from '../components/HeartRateChart';
import { ActivityChart } from '../components/ActivityChart';
import { BPDashboardWidget } from '../components/BPDashboardWidget';
import { BPInputModal } from '../components/BPInputModal';
import { WearableDeviceBPManager } from '../components/WearableDeviceBPManager';
import { 
  simulateRealTimeData, 
  HealthData, 
  getHeartRateHistory, 
  getActivityHistory, 
  HeartRateDataPoint, 
  ActivityDataPoint,
  getManualInsights,
  ManualInsight
} from '../lib/api';
import type { BloodPressureReading } from '../lib/api';
import { Button } from '../components/ui/button';
import { ManualInputModal } from '../components/ManualInputModal';
import { InsightCard } from '../components/InsightCard';
import { toast } from 'sonner';

export function Dashboard() {
  const navigate = useNavigate();
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [aiStatus, setAiStatus] = useState({ status: 'Normal', message: 'All systems are running smoothly.' });
  const [heartRateHistory, setHeartRateHistory] = useState<HeartRateDataPoint[]>(getHeartRateHistory());
  const [activityHistory, ] = useState<ActivityDataPoint[]>(getActivityHistory());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBPModalOpen, setIsBPModalOpen] = useState(false);
  const [bpRefreshTrigger, setBPRefreshTrigger] = useState(0);
  const [insights, setInsights] = useState<ManualInsight | null>(null);

  useEffect(() => {
    const unsubscribe = simulateRealTimeData((newData: HealthData) => {
      setHealthData(newData);
      setHeartRateHistory(getHeartRateHistory());
      // Basic AI anomaly detection
      if (newData.heartRate > 120 || newData.heartRate < 50) {
        setAiStatus({ status: 'Alert', message: 'Abnormal heart rate detected!' });
      } else if (newData.spo2 < 95) {
        setAiStatus({ status: 'Warning', message: 'Blood oxygen is getting low.' });
      } else {
        setAiStatus({ status: 'Normal', message: 'All systems are running smoothly.' });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleManualSubmit = async (data: Record<string, any>) => {
    toast.promise(getManualInsights(data), {
      loading: 'Analyzing your data...',
      success: (newInsights) => {
        setInsights(newInsights);
        setIsModalOpen(false);
        return 'Your personalized insights are ready!';
      },
      error: 'Failed to analyze data. Please try again.',
    });
  };

  const getAIStatusColor = () => {
    switch (aiStatus.status) {
      case 'Alert': return 'text-red-500';
      case 'Warning': return 'text-yellow-500';
      default: return 'text-green-500';
    }
  };

  return (
    <div className='space-y-4 p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl font-bold'>Dashboard</h1>
          <Button size='sm' onClick={() => setIsModalOpen(true)}>Add Manual Entry</Button>
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${getAIStatusColor()}`}>
            {aiStatus.status !== 'Normal' && <AlertTriangle className='h-4 w-4' />}
            <span>AI Status: {aiStatus.status}</span>
        </div>
      </div>
      <p className='text-muted-foreground text-sm'>Your real-time health overview.</p>

      {insights && <InsightCard insight={insights} />}

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <HealthMetricCard 
          label='Heart Rate' 
          value={healthData?.heartRate ?? '--'} 
          unit='bpm' 
          icon={<Heart className='h-4 w-4 text-muted-foreground' />} 
          description='Live heart rate monitoring'
        />
        <HealthMetricCard 
          label='Blood Oxygen'
          value={healthData?.spo2 ?? '--'}
          unit='%'
          icon={<Wind className='h-4 w-4 text-muted-foreground' />} 
          description='Oxygen saturation level'
        />
        <HealthMetricCard 
          label='Sleep'
          value={healthData?.sleep.hours ?? '--'}
          unit='hrs'
          icon={<Bed className='h-4 w-4 text-muted-foreground' />} 
          description={`Quality: ${healthData?.sleep.quality ?? 'N/A'}`}
        />
        <HealthMetricCard 
          label='Activity'
          value={healthData?.activity.steps ?? '--'}
          unit='steps'
          icon={<Footprints className='h-4 w-4 text-muted-foreground' />} 
          description={`${healthData?.activity.distance?.toFixed(2) ?? 0} km today`}
        />
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <div className='grid gap-4 md:grid-cols-2'>
            <HeartRateChart data={heartRateHistory} />
            <ActivityChart data={activityHistory} />
          </div>
        </div>
        <div className='space-y-4'>
          <BPDashboardWidget 
            onAddReading={() => setIsBPModalOpen(true)}
            onViewHistory={() => navigate('/blood-pressure')}
            refreshTrigger={bpRefreshTrigger}
          />
          <WearableDeviceBPManager 
            onReadingReceived={(reading: BloodPressureReading) => {
              // Auto-refresh BP widget and show toast
              setBPRefreshTrigger(prev => prev + 1);
              const { systolic, diastolic } = reading;
              toast.success(`Device BP: ${systolic}/${diastolic} mmHg`);
            }}
          />
        </div>
      </div>

      <ManualInputModal 
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleManualSubmit}
      />

      <BPInputModal 
        isOpen={isBPModalOpen}
        onOpenChange={setIsBPModalOpen}
        onSaved={() => setBPRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
}

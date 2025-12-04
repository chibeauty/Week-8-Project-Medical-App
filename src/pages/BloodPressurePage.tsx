import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BPInputModal } from '@/components/BPInputModal';
import { BPHistory } from '@/components/BPHistory';
import { WearableDeviceBPManager } from '@/components/WearableDeviceBPManager';
import { BloodPressureReading } from '@/lib/api';

export function BloodPressurePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaveReading = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleWearableReading = (_reading: BloodPressureReading) => {
    // Refresh history when wearable reading is received
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blood Pressure Monitor</h1>
          <p className="text-muted-foreground mt-2">
            Track and monitor your blood pressure readings over time.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="lg">
          + Add Reading
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BPHistory refreshTrigger={refreshTrigger} />
        </div>
        <div>
          <WearableDeviceBPManager onReadingReceived={handleWearableReading} />
        </div>
      </div>

      <BPInputModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSaved={handleSaveReading}
      />
    </div>
  );
}

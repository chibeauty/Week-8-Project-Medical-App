import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getHealthMetrics } from '@/lib/api';

export default function VitalsPreview() {
  const [metrics, setMetrics] = useState<{ heartRate?: number; spo2?: number } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getHealthMetrics();
        if (mounted) setMetrics({ heartRate: data.heartRate, spo2: data.spo2 });
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm">Current Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-red-50 dark:bg-red-900/20">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Heart Rate</div>
              <div className="text-lg font-semibold">{metrics?.heartRate ?? '--'} bpm</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">SpO2</div>
              <div className="text-lg font-semibold">{metrics?.spo2 ?? '--'}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

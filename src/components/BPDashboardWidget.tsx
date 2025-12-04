import { useState, useEffect } from 'react';
import { getLatestBPReading, BloodPressureReading } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BPStatusIndicator } from './BPStatusIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BPDashboardWidgetProps {
  onAddReading?: () => void;
  onViewHistory?: () => void;
  refreshTrigger?: number;
}

export function BPDashboardWidget({ onAddReading, onViewHistory, refreshTrigger }: BPDashboardWidgetProps) {
  const { userEmail } = useAuth();
  const [latestReading, setLatestReading] = useState<BloodPressureReading | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadLatestReading();
  }, [userEmail, refreshTrigger]);

  const loadLatestReading = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const reading = await getLatestBPReading(userEmail);
      setLatestReading(reading);
    } catch (error) {
      console.error('Error loading latest BP reading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blood Pressure Monitor</CardTitle>
        <CardDescription>Track your BP readings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : latestReading ? (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground">Latest Reading</p>
              <p className="text-4xl font-bold mt-1">
                {latestReading.systolic}/{latestReading.diastolic}
              </p>
              <p className="text-xs text-muted-foreground mt-1">mmHg • {latestReading.time}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <BPStatusIndicator systolic={latestReading.systolic} diastolic={latestReading.diastolic} />
            </div>
            {latestReading.notes && (
              <div className="text-sm text-muted-foreground">
                <p className="text-xs font-medium mb-1">Notes:</p>
                <p>{latestReading.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No readings recorded yet</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={onAddReading} className="flex-1">
            Add Reading
          </Button>
          <Button size="sm" variant="outline" onClick={onViewHistory} className="flex-1">
            View History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

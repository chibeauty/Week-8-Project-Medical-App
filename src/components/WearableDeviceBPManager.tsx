import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getConnectedWearableDevices, startWearableBPPolling, BloodPressureReading } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bluetooth, Loader2, Play, Square } from 'lucide-react';

interface WearableDeviceBPManagerProps {
  onReadingReceived?: (reading: BloodPressureReading) => void;
}

interface DeviceWithPolling {
  id: string;
  name: string;
  type: 'smartwatch' | 'bp_monitor' | 'fitness_band' | 'other';
  connected: boolean;
  isPolling: boolean;
  pollingIntervalId?: number;
  lastError?: string;
}

export function WearableDeviceBPManager({ onReadingReceived }: WearableDeviceBPManagerProps) {
  const { userEmail } = useAuth();
  const [devices, setDevices] = useState<DeviceWithPolling[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollingIntervalsRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    loadDevices();
    return () => {
      // Cleanup: stop all polling intervals on unmount
      pollingIntervalsRef.current.forEach((intervalId) => {
        clearInterval(intervalId);
      });
    };
  }, [userEmail]);

  const loadDevices = async () => {
    setIsLoading(true);
    try {
      const connectedDevices = await getConnectedWearableDevices();
      setDevices(
        connectedDevices.map(d => ({
          ...d,
          isPolling: false,
          lastError: undefined,
        }))
      );
    } catch (error) {
      toast.error('Failed to load connected devices.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPolling = (deviceId: string) => {
    if (!userEmail) {
      toast.error('User not authenticated.');
      return;
    }

    // Start polling for this device
    const intervalId = startWearableBPPolling(
      userEmail,
      deviceId,
      60000, // Poll every 1 minute for demo; production: 5 minutes
      (reading) => {
        toast.success(`BP reading received: ${reading.systolic}/${reading.diastolic} mmHg`);
        onReadingReceived?.(reading);
      },
      (error) => {
        toast.error(`Device error: ${error.message}`);
        setDevices(prev =>
          prev.map(d =>
            d.id === deviceId
              ? { ...d, lastError: error.message, isPolling: false }
              : d
          )
        );
      }
    );

    // Store interval ID for cleanup
    pollingIntervalsRef.current.set(deviceId, intervalId);

    // Update device state
    setDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { ...d, isPolling: true, lastError: undefined }
          : d
      )
    );

    toast.info(`Started polling readings from ${devices.find(d => d.id === deviceId)?.name}`);
  };

  const handleStopPolling = (deviceId: string) => {
    const intervalId = pollingIntervalsRef.current.get(deviceId);
    if (intervalId) {
      clearInterval(intervalId);
      pollingIntervalsRef.current.delete(deviceId);
    }

    setDevices(prev =>
      prev.map(d =>
        d.id === deviceId
          ? { ...d, isPolling: false }
          : d
      )
    );

    toast.info(`Stopped polling from ${devices.find(d => d.id === deviceId)?.name}`);
  };

  if (!userEmail) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wearable Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Please log in to manage wearable devices.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="h-5 w-5" />
          Wearable BP Devices
        </CardTitle>
        <CardDescription>
          Connect and auto-sync BP readings from your wearable devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No connected devices found. Pair a device in settings.
          </p>
        ) : (
          <div className="space-y-3">
            {devices.map(device => (
              <div
                key={device.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-muted/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{device.name}</p>
                      <Badge
                        variant={device.connected ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {device.connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      {device.isPolling && (
                        <Badge className="text-xs bg-green-500/20 text-green-700">
                          Auto-syncing
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Type: {device.type} • ID: {device.id}
                    </p>
                  </div>

                  {device.connected ? (
                    device.isPolling ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStopPolling(device.id)}
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Stop Sync
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleStartPolling(device.id)}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Sync
                      </Button>
                    )
                  ) : (
                    <Button size="sm" disabled variant="outline">
                      Offline
                    </Button>
                  )}
                </div>

                {device.lastError && (
                  <div className="flex items-start gap-2 bg-destructive/10 rounded p-2 text-destructive text-xs">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{device.lastError}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={loadDevices}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Devices'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

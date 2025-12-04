import { useState } from 'react';
import { toast } from 'sonner';
import { bluetoothApi, BluetoothDevice } from '@/lib/bluetooth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Simple placeholder List components to ensure functionality without strict dependencies.
const SimpleList = ({ children }: { children: React.ReactNode }) => <div className="border rounded-md bg-background">{children}</div>;
const SimpleListItem = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-4 border-b last:border-b-0 ${className}`}>{children}</div>;

export function DeviceManager() {
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setDiscoveredDevices([]);
    setConnectedDevice(null);
    const toastId = toast.loading('Scanning for wearable devices...');

    try {
      const uniqueDevices = new Map<string, BluetoothDevice>();
      await bluetoothApi.scan((device) => {
        if (device.name && !uniqueDevices.has(device.id)) {
            uniqueDevices.set(device.id, device);
            setDiscoveredDevices(Array.from(uniqueDevices.values()));
        }
      });
      if (uniqueDevices.size === 0) {
          toast.info('No new devices found. Make sure your device is in pairing mode.', { id: toastId });
      } else {
          toast.success(`Found ${uniqueDevices.size} device(s).`, { id: toastId });
      }
    } catch (error) {
      console.error('Bluetooth scan failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Please ensure Bluetooth is enabled and permissions are granted.';
      toast.error(`Scan failed: ${errorMessage}`, { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async (device: BluetoothDevice) => {
    setIsConnecting(device.id);
    const toastId = toast.loading(`Connecting to ${device.name}...`);
    try {
      const connected = await bluetoothApi.connect(device.id);
      setConnectedDevice(connected);
      setDiscoveredDevices([]);
      toast.success(`Successfully connected to ${connected.name}.`, { id: toastId });
    } catch (error) {
      console.error(`Failed to connect to ${device.id}:`, error);
      toast.error(`Failed to connect to ${device.name}. Please try again.`, { id: toastId });
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (!connectedDevice) return;
    const toastId = toast.loading(`Disconnecting from ${connectedDevice.name}...`);
    try {
      await bluetoothApi.disconnect(connectedDevice.id);
      toast.success('Device disconnected.', { id: toastId });
      setConnectedDevice(null);
    } catch (error) {
      console.error('Failed to disconnect:', error);
      toast.error('Failed to disconnect device.', { id: toastId });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {connectedDevice ? (
          <div className="flex items-center justify-between p-4 bg-green-100 dark:bg-green-900/50 rounded-lg">
            <div>
              <p className="font-bold text-green-800 dark:text-green-200">Connected</p>
              <p className="text-lg">{connectedDevice.name}</p>
            </div>
            <Button variant="destructive" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4">
                <Button onClick={handleScan} disabled={isScanning} className="w-full">
                  {isScanning ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Scanning...</>
                  ) : (
                    'Scan for New Device'
                  )}
                </Button>
            </div>

            {isScanning && (
                 <div className="text-center text-muted-foreground py-4 space-y-2">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    <p>Searching for nearby wearables...</p>
                    <p className="text-sm">Ensure your device is on and in pairing mode.</p>
                </div>
            )}

            {discoveredDevices.length > 0 && (
              <div className="space-y-2 pt-4">
                <h3 className="font-semibold text-muted-foreground">Devices Found:</h3>
                <SimpleList>
                  {discoveredDevices.map((device) => (
                    <SimpleListItem key={device.id} className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">{device.name || 'Unknown device'}</div>
                        <div className="text-xs text-muted-foreground">{device.type || 'Bluetooth'} • {device.id}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConnect(device)}
                        disabled={!!isConnecting}
                      >
                        {isConnecting === device.id ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting...</>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </SimpleListItem>
                  ))}
                </SimpleList>
              </div>
            )}
          </>
        )}
         <p className="text-xs text-muted-foreground pt-2">
            This feature uses Web Bluetooth. For it to work, you may need to enable experimental web platform features in your browser.
        </p>
      </CardContent>
    </Card>
  );
}
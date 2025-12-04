export interface BluetoothDevice {
  id: string;
  name: string | null;
  type?: 'bluetooth' | 'wifi' | 'other';
  rssi?: number | null;
}

// Mock devices for environments without Web Bluetooth support or for testing.
const MOCK_DEVICES: BluetoothDevice[] = [
  { id: '00:11:22:33:44:55', name: 'AfyaPulse Monitor', type: 'bluetooth' },
  { id: '66:77:88:99:AA:BB', name: 'Sankofa Fitband', type: 'bluetooth' },
  { id: 'CC:DD:EE:FF:00:11', name: 'Zuri Health Tracker', type: 'bluetooth' },
];

// Internal maps to correlate platform devices with lightweight BluetoothDevice objects
const realDeviceMap = new Map<string, any>(); // id -> native BluetoothDevice

export const bluetoothApi = {
  /**
   * Scan for nearby devices.
   * - If Web Bluetooth LE scan is available, uses it (advertisementreceived events).
   * - Otherwise falls back to `requestDevice` which shows the browser chooser.
   * onDeviceFound is called for each discovered device.
   */
  scan: async (onDeviceFound: (device: BluetoothDevice) => void, scanDuration = 8000): Promise<void> => {
    console.log('Starting Bluetooth scan...');

    // If Web Bluetooth is not available, use mock devices for demo/testing
    if (typeof (navigator as any).bluetooth === 'undefined') {
      console.warn('Web Bluetooth API is not available in this browser. Falling back to mock devices.');
      return new Promise((resolve) => {
        setTimeout(() => {
          MOCK_DEVICES.forEach(onDeviceFound);
          resolve();
        }, 1000);
      });
    }

    const navBluetooth = (navigator as any).bluetooth;

    // If requestLEScan is supported (experimental), use it to get advertisementreceived events
    if (typeof navBluetooth.requestLEScan === 'function') {
      let leScan: any;
      const onAdvertisement = (event: any) => {
        try {
          const d = event.device;
          const id = d.id || `${d.name || 'unknown'}_${Date.now()}`;
          realDeviceMap.set(id, d);
          const device: BluetoothDevice = {
            id,
            name: d.name || null,
            type: 'bluetooth',
            rssi: typeof event.rssi === 'number' ? event.rssi : null,
          };
          onDeviceFound(device);
        } catch (err) {
          console.warn('Error handling advertisement event', err);
        }
      };

      try {
        leScan = await navBluetooth.requestLEScan({ acceptAllAdvertisements: true });
        navBluetooth.addEventListener('advertisementreceived', onAdvertisement as EventListener);

        // Stop scan after duration
        await new Promise((resolve) => setTimeout(resolve, scanDuration));

        navBluetooth.removeEventListener('advertisementreceived', onAdvertisement as EventListener);
        try {
          leScan && typeof leScan.stop === 'function' && leScan.stop();
        } catch (stopErr) {
          console.warn('Error stopping LE scan', stopErr);
        }
        console.log('Bluetooth LE scan finished.');
        return;
      } catch (err: any) {
        console.warn('LE scan failed, falling back to requestDevice chooser:', err?.message || err);
        // fallthrough to requestDevice approach
      }
    }

    // Fallback: show browser chooser (user picks a device)
    try {
      const device = await navBluetooth.requestDevice({ acceptAllDevices: true });
      const id = device.id || `${device.name || 'unknown'}_${Date.now()}`;
      realDeviceMap.set(id, device);
      const found: BluetoothDevice = { id, name: device.name || null, type: 'bluetooth' };
      onDeviceFound(found);
      return;
    } catch (err: any) {
      // User may cancel the chooser or permissions denied
      console.error('requestDevice failed or was canceled:', err?.message || err);
      throw new Error(err?.message || 'Bluetooth scan canceled or failed');
    }
  },

  /**
   * Connect to a device by id. If the device came from a real scan, attempt GATT connect.
   * Otherwise fall back to resolving a mock device.
   */
  connect: async (deviceId: string): Promise<BluetoothDevice> => {
    console.log(`Connecting to device ${deviceId}...`);
    const native = realDeviceMap.get(deviceId);
    if (native) {
      try {
        // Try connecting to GATT server if available
        if (native.gatt) {
          const server = await native.gatt.connect();
          // Store server on the native object for later disconnect
          native._server = server;
        }
        const device: BluetoothDevice = { id: deviceId, name: native.name || null, type: 'bluetooth' };
        return device;
      } catch (err) {
        console.error('Failed to connect to native device:', err);
        throw err;
      }
    }

    // Mock connect
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const device = MOCK_DEVICES.find((d) => d.id === deviceId);
        if (device) {
          resolve(device);
        } else {
          reject(new Error('Device not found'));
        }
      }, 1200);
    });
  },

  /**
   * Disconnect by id.
   */
  disconnect: async (deviceId: string): Promise<void> => {
    console.log(`Disconnecting from device ${deviceId}...`);
    const native = realDeviceMap.get(deviceId);
    if (native) {
      try {
        if (native._server && typeof native._server.disconnect === 'function') {
          native._server.disconnect();
        } else if (native.gatt && typeof native.gatt.disconnect === 'function') {
          native.gatt.disconnect();
        }
      } catch (err) {
        console.warn('Error during native disconnect', err);
      }
      return;
    }

    // Mock disconnect is a no-op
    return new Promise((resolve) => setTimeout(resolve, 300));
  },
};
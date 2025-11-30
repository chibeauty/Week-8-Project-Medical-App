export interface BluetoothDevice {
  id: string;
  name: string | null;
}

// This is a mock implementation of the Web Bluetooth API for demonstration purposes.
// In a real application, this would interact with navigator.bluetooth.
const MOCK_DEVICES: BluetoothDevice[] = [
  { id: '00:11:22:33:44:55', name: 'AfyaPulse Monitor' },
  { id: '66:77:88:99:AA:BB', name: 'Sankofa Fitband' },
  { id: 'CC:DD:EE:FF:00:11', name: 'Zuri Health Tracker' },
];

export const bluetoothApi = {
  scan: async (onDeviceFound: (device: BluetoothDevice) => void): Promise<void> => {
    console.log('Starting Bluetooth scan...');
    // In a real implementation, you would use navigator.bluetooth.requestDevice
    return new Promise((resolve, reject) => {
       if (typeof (navigator as any).bluetooth === 'undefined') {
            console.error('Web Bluetooth API is not available in this browser.');
            reject(new Error('Web Bluetooth API not available.'));
            return;
        }
      setTimeout(() => {
        MOCK_DEVICES.forEach(onDeviceFound);
        console.log('Bluetooth scan finished.');
        resolve();
      }, 3000); // Simulate a 3-second scan
    });
  },

  connect: async (deviceId: string): Promise<BluetoothDevice> => {
    console.log(`Connecting to device ${deviceId}...`);
    // In a real implementation, you would connect to the device and get its server
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const device = MOCK_DEVICES.find(d => d.id === deviceId);
        if (device) {
          console.log(`Connected to ${device.name}`);
          resolve(device);
        } else {
          console.error(`Device with ID ${deviceId} not found.`);
          reject(new Error('Device not found'));
        }
      }, 2000); // Simulate a 2-second connection time
    });
  },

  disconnect: async (deviceId: string): Promise<void> => {
    console.log(`Disconnecting from device ${deviceId}...`);
    // In a real implementation, you would disconnect from the device
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Device disconnected.');
        resolve();
      }, 500);
    });
  },
};
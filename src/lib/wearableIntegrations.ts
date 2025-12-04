/**
 * Wearable BP Device Integration Examples
 * 
 * This file demonstrates how to integrate various wearable BP devices
 * and health platforms with the AfyaPulse medical app.
 */

// ============ Example 1: Withings Health Mate API Integration ============
// For real Withings API: https://developer.withings.com/

export const withingsIntegration = {
  /**
   * Authenticate with Withings OAuth 2.0
   */
  async authenticateWithings(clientId: string, _clientSecret: string, redirectUri: string) {
    const authUrl = 'https://account.withings.com/oauth2_user/authorize2';
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'user.metrics',
    });
    window.location.href = `${authUrl}?${params}`;
  },

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string, clientId: string, clientSecret: string) {
    const response = await fetch('https://account.withings.com/oauth2_user/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'requesttoken',
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }).toString(),
    });
    return response.json();
  },

  /**
   * Fetch BP measurements from Withings API
   * Measurement type: 71 = systolic, 72 = diastolic
   */
  async fetchBPReadings(accessToken: string, limit = 10) {
    const response = await fetch('https://wbsapi.withings.net/measure?action=getmeas&meastype=71,72&limit=' + limit, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await response.json();
    
    // Transform Withings format to our BloodPressureReading format
    const readings = data.body.measuregrps.map((group: any) => ({
      systolic: group.measures.find((m: any) => m.type === 71)?.value / 100,
      diastolic: group.measures.find((m: any) => m.type === 72)?.value / 100,
      timestamp: new Date(group.date * 1000).toISOString(),
      source: 'device',
    }));
    
    return readings;
  },
};

// ============ Example 2: Google Fit API Integration ============
// For real Google Fit API: https://developers.google.com/fit/rest/v1

export const googleFitIntegration = {
  /**
   * Request BP data from Google Fit
   */
  async fetchBPFromGoogleFit(accessToken: string, endTimeMs = Date.now()) {
    const startTimeMs = endTimeMs - 30 * 24 * 60 * 60 * 1000; // Last 30 days
    
    const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aggregateBy: [
          {
            dataTypeName: 'com.google.blood_pressure',
            dataSourceId: 'derived:com.google.blood_pressure:com.google.android.gms:*',
          },
        ],
        bucketByTime: { durationMillis: 86400000 }, // Daily buckets
        startTimeMillis: startTimeMs,
        endTimeMillis: endTimeMs,
      }),
    });
    
    const data = await response.json();
    const readings = data.bucket
      .filter((b: any) => b.dataset[0]?.point?.length > 0)
      .map((b: any) => {
        const point = b.dataset[0].point[0];
        return {
          systolic: point.value[0].fpVal,
          diastolic: point.value[1].fpVal,
          timestamp: new Date(parseInt(point.startTimeNanos) / 1000000).toISOString(),
          source: 'device',
        };
      });
    
    return readings;
  },
};

// ============ Example 3: Apple HealthKit Integration (React Native) ============
// For iOS apps using react-native-health or similar

export const appleHealthKitIntegration = {
  /**
   * Fetch BP readings from Apple HealthKit (iOS only)
   */
  async fetchBPFromHealthKit() {
    // This would use react-native-health library
    // import AppleHealthKit from 'rn-apple-healthkit';
    
    // Example implementation:
    // const permissions = {
    //   permissions: {
    //     read: [AppleHealthKit.permissions.BloodPressureSystolic, AppleHealthKit.permissions.BloodPressureDiastolic],
    //   },
    // };
    
    // AppleHealthKit.initHealthKit(permissions, (err) => {
    //   if (err) console.error('HealthKit error:', err);
    //   
    //   AppleHealthKit.getBloodPressureSamples({ startDate: new Date(Date.now() - 30*24*60*60*1000) },
    //     (err, results) => {
    //       if (err) throw err;
    //       // Transform and return results
    //     }
    //   );
    // });
    
    return [];
  },
};

// ============ Example 4: Android Health Connect (React Native) ============
// For Android apps using react-native-health-connect

export const androidHealthConnectIntegration = {
  /**
   * Fetch BP readings from Android Health Connect
   */
  async fetchBPFromHealthConnect() {
    // This would use react-native-health-connect library
    // import { initialize, readRecords } from 'react-native-health-connect';
    
    // Example implementation:
    // const isInitialized = await initialize();
    
    // if (isInitialized) {
    //   const result = await readRecords({
    //     recordType: 'BloodPressure',
    //     timeRangeFilter: {
    //       operator: 'between',
    //       startTime: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
    //       endTime: new Date().toISOString(),
    //     },
    //   });
    
    //   return result.records.map(r => ({
    //     systolic: r.systolic.inMillimetersOfMercury,
    //     diastolic: r.diastolic.inMillimetersOfMercury,
    //     timestamp: r.time,
    //     source: 'device',
    //   }));
    // }
    
    return [];
  },
};

// ============ Example 5: Fitbit API Integration ============
// https://dev.fitbit.com/

export const fitbitIntegration = {
  /**
   * Fetch BP data from Fitbit API
   */
  async fetchBPFromFitbit(accessToken: string, date: string) {
    // Fitbit requires date in YYYY-MM-DD format
    const response = await fetch(
      `https://api.fitbit.com/1/user/-/bp/date/${date}.json`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    
    const data = await response.json();
    const readings = data.bp.map((entry: any) => ({
      systolic: entry.systolic,
      diastolic: entry.diastolic,
      timestamp: new Date(`${date}T${entry.time}`).toISOString(),
      source: 'device',
    }));
    
    return readings;
  },
};

// ============ Example 6: Bluetooth LE Manual Implementation ============
// Direct BLE connection for devices not using cloud APIs

export const bleDirectIntegration = {
  /**
   * Read BP from a Bluetooth LE device directly
   * Most BP monitors expose GATT characteristics with BP data
   */
  async connectAndReadBPDevice(_deviceId: string) {
    try {
      // Request device
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: ['180a'] }], // Service UUID for BP
      });
      
      // Connect to GATT server
      const server = await (device as any).gatt.connect();
      
      // Get the service
      const service = await (server as any).getPrimaryService('180a');
      
      // Read BP characteristics (standard UUIDs)
      const systolicChar = await (service as any).getCharacteristic('2a37'); // Heart Rate Measurement
      const diastolicChar = await (service as any).getCharacteristic('2a38'); // Body Sensor Location
      
      // Read values
      const systolicValue = await systolicChar.readValue();
      const diastolicValue = await diastolicChar.readValue();
      
      // Decode DataView
      const systolic = systolicValue.getUint16(0, true);
      const diastolic = diastolicValue.getUint16(0, true);
      
      return {
        systolic,
        diastolic,
        timestamp: new Date().toISOString(),
        source: 'device',
      };
    } catch (error) {
      console.error('BLE read error:', error);
      throw error;
    }
  },
};

// ============ Example 7: Usage in React Component ============

/**
 * Example of how to use these integrations in a React component
 */
export const integrationExample = () => {
  return `
import { useState } from 'react';
import { saveBPReading } from '@/lib/api';
import { withingsIntegration } from '@/lib/wearableIntegrations';

function WearableIntegrationExample() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectWithings = async () => {
    setIsConnecting(true);
    try {
      // 1. Get access token from OAuth flow
      const token = await withingsIntegration.getAccessToken(
        authCode,
        WITHINGS_CLIENT_ID,
        WITHINGS_CLIENT_SECRET
      );

      // 2. Fetch BP readings from Withings
      const readings = await withingsIntegration.fetchBPReadings(token.body.access_token);

      // 3. Save to app
      for (const reading of readings) {
        await saveBPReading(
          userEmail,
          reading.systolic,
          reading.diastolic,
          \`Imported from Withings\`,
          'device'
        );
      }

      toast.success(\`Imported \${readings.length} BP readings from Withings\`);
    } catch (error) {
      toast.error('Failed to import from Withings');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button onClick={handleConnectWithings} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Withings'}
    </button>
  );
}
  `;
};

// ============ Key Integration Patterns ============

/**
 * PATTERN 1: OAuth 2.0 Flow (Cloud APIs)
 * 1. Redirect to service auth page
 * 2. User approves permissions
 * 3. Get authorization code
 * 4. Exchange for access token
 * 5. Use token to fetch BP data
 * 6. Save readings locally
 */

/**
 * PATTERN 2: Direct Bluetooth LE (Local Devices)
 * 1. Scan for BP monitor devices
 * 2. User selects device
 * 3. Connect to GATT server
 * 4. Read BP characteristic
 * 5. Decode and save reading
 */

/**
 * PATTERN 3: Periodic Polling (Auto-Sync)
 * 1. Set up interval timer (every 5-15 minutes)
 * 2. Call API to fetch new readings
 * 3. Compare timestamps to avoid duplicates
 * 4. Save new readings
 * 5. Update UI with latest data
 */

/**
 * PATTERN 4: Push Notifications (Event-Driven)
 * 1. Device/service sends push notification when new reading available
 * 2. App receives notification
 * 3. Fetch specific reading
 * 4. Save and display
 */

export interface HealthData {
  heartRate: number;
  spo2: number;
  activity: { steps: number; distance: number };
  sleep: { hours: number; quality: string };
}

export interface HeartRateDataPoint {
  time: string;
  value: number;
}

export interface ActivityDataPoint {
  day: string;
  steps: number;
}

export interface ManualInsight {
  title: string;
  summary: string;
  recommendations: string[];
}

export interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  source?: 'manual' | 'device'; // manual entry or from Bluetooth device
}

export interface BPStatus {
  category: 'normal' | 'elevated' | 'high_stage1' | 'high_stage2' | 'crisis';
  message: string;
  color: string;
}

export const getBPStatus = (systolic: number, diastolic: number): BPStatus => {
  // Medical guidelines used here (user-specified):
  // - Normal: systolic < 120 AND diastolic < 80
  // - Elevated: systolic 120–129 AND diastolic < 80
  // - Hypertension Stage 1: systolic 130–139 OR diastolic 80–89
  // - Hypertension Stage 2: systolic 140–179 OR diastolic 90–119
  // - Hypertensive Crisis: systolic >= 180 OR diastolic >= 120
  // Implementation: compute category for systolic and diastolic separately,
  // then return the more severe category. This handles edge cases where
  // systolic and diastolic fall into different categories (take the worse).

  const ranks: Record<string, number> = {
    normal: 0,
    elevated: 1,
    high_stage1: 2,
    high_stage2: 3,
    crisis: 4,
  };

  const systolicCategory = (() => {
    if (systolic >= 180) return 'crisis';
    if (systolic >= 140 && systolic <= 179) return 'high_stage2';
    if (systolic >= 130 && systolic <= 139) return 'high_stage1';
    if (systolic >= 120 && systolic <= 129) return 'elevated';
    return 'normal';
  })();

  const diastolicCategory = (() => {
    if (diastolic >= 120) return 'crisis';
    if (diastolic >= 90 && diastolic <= 119) return 'high_stage2';
    if (diastolic >= 80 && diastolic <= 89) return 'high_stage1';
    return 'normal';
  })();

  const finalCategoryKey = ranks[systolicCategory] >= ranks[diastolicCategory] ? systolicCategory : diastolicCategory;

  switch (finalCategoryKey) {
    case 'normal':
      return { category: 'normal', message: 'Normal', color: 'text-green-500' };
    case 'elevated':
      return { category: 'elevated', message: 'Elevated', color: 'text-yellow-500' };
    case 'high_stage1':
      return { category: 'high_stage1', message: 'Hypertension Stage 1', color: 'text-orange-500' };
    case 'high_stage2':
      return { category: 'high_stage2', message: 'Hypertension Stage 2', color: 'text-red-500' };
    case 'crisis':
      return { category: 'crisis', message: 'Hypertensive Crisis', color: 'text-red-700' };
    default:
      return { category: 'crisis', message: 'Hypertensive Crisis', color: 'text-red-700' };
  }
};

// Mock API functions
export const login = (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Accept any valid email and password (at least 6 characters)
      if (email && email.includes('@') && password && password.length >= 6) {
        resolve({ token: 'fake-token' });
      } else {
        reject(new Error('Invalid credentials. Email must be valid and password must be at least 6 characters.'));
      }
    }, 500);
  });
};

export const signup = (email: string, password: string) => {
  console.log('Signing up with', email, password);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ token: 'fake-token' });
    }, 500);
  });
};

export const getHeartRateHistory = (): HeartRateDataPoint[] => {
  return Array.from({ length: 12 }, (_, i) => ({
    time: `${i * 2}:00`,
    value: Math.floor(Math.random() * (90 - 60 + 1)) + 60,
  }));
};

export const getActivityHistory = (): ActivityDataPoint[] => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map(day => ({
    day,
    steps: Math.floor(Math.random() * 10000) + 2000,
  }));
};

export const simulateRealTimeData = (callback: (data: HealthData) => void) => {
  const intervalId = setInterval(() => {
    const newData: HealthData = {
      heartRate: Math.floor(Math.random() * (100 - 60)) + 60,
      spo2: Math.floor(Math.random() * (100 - 95)) + 95,
      activity: { 
        steps: Math.floor(Math.random() * 500) + 100,
        distance: Math.random() * 2
      },
      sleep: { 
        hours: 8,
        quality: 'Good'
      },
    };
    callback(newData);
    // Dispatch an event for heart-rate listeners
    try {
      window.dispatchEvent(new CustomEvent('hr:new-reading', { detail: { heartRate: newData.heartRate, timestamp: new Date().toISOString() } }));
    } catch (e) {
      // ignore when not in browser
    }
  }, 2000);

  return () => clearInterval(intervalId);
};

export const getManualInsights = (data: Record<string, any>): Promise<ManualInsight> => {
  return new Promise(resolve => {
    setTimeout(() => {
      let title = "Your Manual Entry Analysis";
      let summary = "Here are your personalized insights based on your latest entry.";
      let recommendations = [
          "Keep up the consistent health tracking!",
          "Stay hydrated throughout the day.",
      ];

      if (data.heartRate) {
        title = "Heart Rate Analysis";
        summary = `Your latest heart rate is ${data.heartRate} bpm.`;
        if (data.heartRate > 100) {
            recommendations = ["Your heart rate is a bit high. Consider some deep breathing exercises.", "Avoid caffeine for a few hours."];
        } else if (data.heartRate < 60) {
            recommendations = ["Your heart rate is a bit low. If you feel dizzy, please consult a doctor.", "A brisk walk could help."];
        } else {
            recommendations = ["Your heart rate is in a healthy range. Keep it up!", "Regular cardio exercise helps maintain a healthy heart."];
        }
      } else if (data.spo2) {
        title = "Blood Oxygen Analysis";
        summary = `Your latest SpO2 is ${data.spo2}%.`;
        if (data.spo2 < 95) {
            recommendations = ["Your blood oxygen is slightly low. Try some deep, slow breaths.", "Ensure your room is well-ventilated."];
        } else {
            recommendations = ["Your blood oxygen level is excellent. Great job!", "Maintaining good air quality at home can help."];
        }
      } else if (data.sleep) {
        title = "Sleep Pattern Analysis";
        summary = `You slept for ${data.sleep} hours.`;
        if (data.sleep < 7) {
            recommendations = ["You might need more sleep. Aim for 7-9 hours per night.", "Establish a relaxing bedtime routine."];
        } else {
            recommendations = ["You're getting a healthy amount of sleep. Keep this great habit!", "A consistent sleep schedule, even on weekends, is beneficial."];
        }
      } else if (data.bloodPressure) {
        title = "Blood Pressure Analysis";
        summary = `Your blood pressure is ${data.bloodPressure.systolic}/${data.bloodPressure.diastolic} mmHg.`;
        if (data.bloodPressure.systolic > 130 || data.bloodPressure.diastolic > 85) {
            recommendations = ["Your blood pressure is slightly elevated. Monitoring your sodium intake is a good idea.", "Regular exercise can help manage blood pressure."];
        } else {
            recommendations = ["Your blood pressure is in the normal range. Excellent!", "A balanced diet contributes to healthy blood pressure."];
        }
      }

      resolve({
        title,
        summary,
        recommendations
      });
    }, 1000);
  });
};

// Existing mock functions
export const getHealthMetrics = async () => {
  return {
    heartRate: 78,
    spo2: 98,
    activity: 75,
    sleep: 8,
  };
};

export const getHistoricalData = async () => {
  return {
    heartRate: Array.from({ length: 12 }, () => Math.floor(Math.random() * (90 - 60 + 1)) + 60),
    activity: Array.from({ length: 7 }, () => Math.floor(Math.random() * 100)),
  };
};

export const getNotifications = async () => {
    // Proxy to dynamic notifications store
    try {
      const notifModule = await import('@/lib/notifications');
      const items = await notifModule.getNotifications();
      return items;
    } catch (e) {
      return [];
    }
};

// Blood Pressure API functions
const generateBPId = () => `bp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const saveBPReading = (
  email: string,
  systolic: number,
  diastolic: number,
  notes?: string,
  source: 'manual' | 'device' = 'manual'
): Promise<BloodPressureReading> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date();
      const reading: BloodPressureReading = {
        id: generateBPId(),
        systolic,
        diastolic,
        timestamp: now.toISOString(),
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        notes,
        source,
      };

      // Persist to localStorage
      const key = `bp_readings_${email}`;
      const existing = localStorage.getItem(key);
      const readings: BloodPressureReading[] = existing ? JSON.parse(existing) : [];
      readings.push(reading);
      localStorage.setItem(key, JSON.stringify(readings));
      
      // Dispatch a DOM event so alerting/listeners can react to new readings
      try {
        window.dispatchEvent(new CustomEvent('bp:new-reading', { detail: reading }));
      } catch (e) {
        // ignore if running in non-browser env
      }

      resolve(reading);
    }, 500);
  });
};

export const getBPHistory = (email: string, limit = 30): Promise<BloodPressureReading[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `bp_readings_${email}`;
      const existing = localStorage.getItem(key);
      const readings: BloodPressureReading[] = existing ? JSON.parse(existing) : [];
      // Return most recent first, limited to `limit` items
      resolve(readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, limit));
    }, 300);
  });
};

export const getLatestBPReading = (email: string): Promise<BloodPressureReading | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `bp_readings_${email}`;
      const existing = localStorage.getItem(key);
      const readings: BloodPressureReading[] = existing ? JSON.parse(existing) : [];
      if (readings.length === 0) {
        resolve(null);
      } else {
        const sorted = readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(sorted[0]);
      }
    }, 300);
  });
};

export const deleteBPReading = (email: string, readingId: string): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `bp_readings_${email}`;
      const existing = localStorage.getItem(key);
      const readings: BloodPressureReading[] = existing ? JSON.parse(existing) : [];
      const filtered = readings.filter(r => r.id !== readingId);
      localStorage.setItem(key, JSON.stringify(filtered));
      resolve();
    }, 300);
  });
};

// Wearable Device BP Integration
export interface WearableBPDevice {
  id: string;
  name: string;
  type: 'smartwatch' | 'bp_monitor' | 'fitness_band' | 'other';
  connected: boolean;
  lastSyncTime?: string;
}

/**
 * Simulates fetching BP readings from a connected wearable device.
 * In production, this would:
 * - Connect via Bluetooth API
 * - Read BP characteristic from device
 * - Parse manufacturer-specific data
 * - Return real readings
 */
export const fetchBPFromWearable = (deviceId: string): Promise<BloodPressureReading> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate device reading with slight variation
      const baseSystemic = 115 + Math.floor(Math.random() * 20);
      const baseDiastolic = 75 + Math.floor(Math.random() * 15);

      const reading: BloodPressureReading = {
        id: `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        systolic: baseSystemic,
        diastolic: baseDiastolic,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        notes: `Auto-read from wearable device ${deviceId}`,
        source: 'device',
      };

      // Simulate occasional device errors (5% failure rate)
      if (Math.random() < 0.05) {
        reject(new Error(`Failed to read from wearable device. Device may be disconnected.`));
      } else {
        resolve(reading);
      }
    }, 1000);
  });
};

/**
 * Get list of connected wearable BP devices.
 * In production, this would query Bluetooth API or cloud services.
 */
export const getConnectedWearableDevices = (): Promise<WearableBPDevice[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return mock connected devices
      const devices: WearableBPDevice[] = [
        {
          id: 'device_001',
          name: 'AfyaPulse Smartwatch',
          type: 'smartwatch',
          connected: true,
          lastSyncTime: new Date(Date.now() - 5 * 60000).toISOString(), // 5 min ago
        },
        {
          id: 'device_002',
          name: 'Health Monitor Pro',
          type: 'bp_monitor',
          connected: false,
          lastSyncTime: new Date(Date.now() - 24 * 3600000).toISOString(), // 1 day ago
        },
      ];
      resolve(devices);
    }, 300);
  });
};

/**
 * Set up auto-polling for BP readings from a wearable device.
 * Returns an interval ID that can be cleared with clearInterval.
 */
export const startWearableBPPolling = (
  email: string,
  deviceId: string,
  intervalMs: number = 300000, // 5 minutes default
  onReadingReceived?: (reading: BloodPressureReading) => void,
  onError?: (error: Error) => void
): number => {
  const intervalId = window.setInterval(async () => {
    try {
      const reading = await fetchBPFromWearable(deviceId);
      // Auto-save to localStorage
      await saveBPReading(
        email,
        reading.systolic,
        reading.diastolic,
        reading.notes,
        'device'
      );
      onReadingReceived?.(reading);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      // Dispatch a wearable error event for central alert handling
      try {
        window.dispatchEvent(new CustomEvent('bp:error', { detail: { deviceId, error: err } }));
      } catch (e) {
        // ignore in non-browser env
      }
    }
  }, intervalMs);

  return intervalId;
};

/**
 * Get average BP over a date range for trend analysis.
 */
export const getBPAverage = (
  email: string,
  startDate: Date,
  endDate: Date
): Promise<{ avgSystolic: number; avgDiastolic: number; count: number }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const key = `bp_readings_${email}`;
      const existing = localStorage.getItem(key);
      const readings: BloodPressureReading[] = existing ? JSON.parse(existing) : [];

      const filtered = readings.filter(r => {
        const readingDate = new Date(r.timestamp);
        return readingDate >= startDate && readingDate <= endDate;
      });

      if (filtered.length === 0) {
        resolve({ avgSystolic: 0, avgDiastolic: 0, count: 0 });
      } else {
        const avgSystolic = Math.round(filtered.reduce((sum, r) => sum + r.systolic, 0) / filtered.length);
        const avgDiastolic = Math.round(filtered.reduce((sum, r) => sum + r.diastolic, 0) / filtered.length);
        resolve({ avgSystolic, avgDiastolic, count: filtered.length });
      }
    }, 300);
  });
};



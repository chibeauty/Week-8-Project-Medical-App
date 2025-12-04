import { toast } from 'sonner';
import { getBPStatus, BloodPressureReading } from '@/lib/api';
import notifModule from '@/lib/notifications';

export const checkBPAlert = (reading: BloodPressureReading): void => {
  const status = getBPStatus(reading.systolic, reading.diastolic);

  if (status.category === 'normal') {
    // No alert for normal readings
    return;
  }

  if (status.category === 'elevated') {
    toast.warning(
      `Your blood pressure is elevated (${reading.systolic}/${reading.diastolic} mmHg). Monitor and try to relax.`,
      { duration: 5000 }
    );
    try {
      notifModule.addNotification({ type: 'alert', title: 'Elevated Blood Pressure', message: `${reading.systolic}/${reading.diastolic} mmHg — Elevated` });
    } catch (e) {}
  } else if (status.category === 'high_stage1') {
    toast.warning(
      `Your blood pressure is high (${reading.systolic}/${reading.diastolic} mmHg). Consider contacting your doctor.`,
      { duration: 5000 }
    );
    try {
      notifModule.addNotification({ type: 'alert', title: 'Hypertension Stage 1', message: `${reading.systolic}/${reading.diastolic} mmHg — Stage 1` });
    } catch (e) {}
  } else if (status.category === 'high_stage2') {
    toast.error(
      `Your blood pressure is very high (${reading.systolic}/${reading.diastolic} mmHg). Seek medical attention if symptoms occur.`,
      { duration: 7000 }
    );
    try {
      notifModule.addNotification({ type: 'alert', title: 'Hypertension Stage 2', message: `${reading.systolic}/${reading.diastolic} mmHg — Stage 2` });
    } catch (e) {}
  } else if (status.category === 'crisis') {
    toast.error(
      `URGENT: Your blood pressure is at crisis level (${reading.systolic}/${reading.diastolic} mmHg). Seek immediate medical help!`,
      { duration: 10000 }
    );
    try {
      notifModule.addNotification({ type: 'alert', title: 'Hypertensive Crisis', message: `${reading.systolic}/${reading.diastolic} mmHg — Crisis` });
    } catch (e) {}
  }
};

// Batch rapid incoming readings to avoid alert flooding. Listen for 'bp:new-reading' events.
let pendingReading: BloodPressureReading | null = null;
let batchTimer: number | null = null;
const BATCH_DELAY_MS = 1200;

const handleNewReadingEvent = (e: Event) => {
  const custom = e as CustomEvent;
  const r = custom.detail as BloodPressureReading;
  pendingReading = r;
  if (batchTimer) {
    clearTimeout(batchTimer as number);
  }
  batchTimer = window.setTimeout(() => {
    if (pendingReading) {
      checkBPAlert(pendingReading);
      pendingReading = null;
    }
    batchTimer = null;
  }, BATCH_DELAY_MS);
};

// Listen for errors from wearable polling and show a concise alert
const handleErrorEvent = (e: Event) => {
  const custom = e as CustomEvent;
  const { deviceId, error } = custom.detail as { deviceId: string; error: Error };
  toast.error(`Device ${deviceId} error: ${error?.message ?? 'Unknown error'}`, { duration: 5000 });
  try {
    notifModule.addNotification({ type: 'alert', title: 'Device Error', message: `Device ${deviceId} error: ${error?.message ?? 'Unknown error'}` });
  } catch (e) {}
};

if (typeof window !== 'undefined') {
  window.addEventListener('bp:new-reading', handleNewReadingEvent as EventListener);
  window.addEventListener('bp:error', handleErrorEvent as EventListener);
}

export const getBPRecommendations = (systolic: number, diastolic: number): string[] => {
  const status = getBPStatus(systolic, diastolic);
  const recommendations: string[] = [];

  if (status.category === 'normal') {
    recommendations.push('Your blood pressure is in a healthy range. Keep up your good habits!');
    recommendations.push('Continue regular exercise and a balanced diet.');
  } else if (status.category === 'elevated') {
    recommendations.push('Try relaxation techniques like deep breathing or meditation.');
    recommendations.push('Reduce sodium intake and increase physical activity.');
    recommendations.push('Limit caffeine and alcohol consumption.');
  } else if (status.category === 'high_stage1') {
    recommendations.push('Monitor your blood pressure regularly (daily if possible).');
    recommendations.push('Consult your doctor about lifestyle changes or medication.');
    recommendations.push('Reduce stress through exercise, yoga, or counseling.');
    recommendations.push('Limit sodium, maintain healthy weight, and avoid smoking.');
  } else if (status.category === 'high_stage2' || status.category === 'crisis') {
    recommendations.push('Seek medical attention as soon as possible.');
    recommendations.push('Do not engage in strenuous activities.');
    recommendations.push('Follow your doctor\'s treatment plan closely.');
    recommendations.push('Monitor blood pressure multiple times daily.');
    if (status.category === 'crisis') {
      recommendations.push('Call emergency services if experiencing symptoms like severe headache, chest pain, or vision changes.');
    }
  }

  return recommendations;
};

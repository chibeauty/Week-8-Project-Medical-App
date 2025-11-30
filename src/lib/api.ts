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

// Mock API functions
export const login = (email: string, password: string) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'user@test.com' && password === 'password') {
        resolve({ token: 'fake-token' });
      } else {
        reject(new Error('Invalid credentials'));
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
    callback({
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
    });
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
    return [
        { id: 1, message: 'Your heart rate seems a bit high.', time: '10 min ago' },
        { id: 2, message: 'You have reached your daily activity goal!', time: '1 hr ago' },
        { id: 3, message: 'Reminder: Check your SpO2 levels.', time: '3 hr ago' },
    ];
};

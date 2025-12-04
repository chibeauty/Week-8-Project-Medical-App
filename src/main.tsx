import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
// Import bpAlerts so it can register window event listeners for new readings/errors
import '@/lib/bpAlerts';
// Register notifications handler so heart-rate events create notifications
import notifModule from '@/lib/notifications';

if (typeof window !== 'undefined') {
  window.addEventListener('hr:new-reading', (e: Event) => {
    try {
      const custom = e as CustomEvent;
      const { heartRate } = custom.detail as { heartRate: number; timestamp?: string };
      notifModule.handleHeartRateReading(heartRate, { source: 'auto' });
    } catch (err) {
      // ignore
    }
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

import { ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlertModal({ isOpen, onClose }: AlertModalProps) {
  if (!isOpen) return null;

  const handleAcknowledge = () => {
    toast.success('Alert Acknowledged. Stay safe!');
    onClose();
  }

  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4'>
      <div className='bg-gray-900 text-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-pulse-slow'>
        <div className='w-24 h-24 mx-auto bg-red-500/20 rounded-full flex items-center justify-center ring-4 ring-red-500/30 mb-4'>
            <ShieldAlert className='w-16 h-16 text-red-500' />
        </div>
        <h2 className='text-3xl font-bold text-red-500 mb-2'>Abnormal Heart Rate Detected</h2>
        <p className='text-lg mb-1'>Your heart rate is significantly higher than your baseline.</p>
        <p className='text-5xl font-bold mb-4'>132 <span className='text-2xl'>bpm</span></p>
        <p className='text-gray-400 mb-6'>Please rest and monitor your condition.</p>
        <button onClick={handleAcknowledge} className='w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors'>
          Acknowledge
        </button>
      </div>
    </div>
  );
}
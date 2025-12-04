import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { getBPStatus } from '@/lib/api';

interface BPStatusIndicatorProps {
  systolic: number;
  diastolic: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BPStatusIndicator({ systolic, diastolic, size = 'md' }: BPStatusIndicatorProps) {
  const status = getBPStatus(systolic, diastolic);

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-8 w-8' : 'h-6 w-6';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  const Icon = 
    status.category === 'normal' ? CheckCircle :
    status.category === 'elevated' ? AlertTriangle :
    AlertCircle;

  return (
    <div className={`flex items-center gap-2 ${status.color}`}>
      <Icon className={iconSize} />
      <span className={textSize}>{status.message}</span>
    </div>
  );
}

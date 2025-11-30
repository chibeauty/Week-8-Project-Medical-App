import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

interface ManualInputModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: Record<string, any>) => void;
}

export function ManualInputModal({ isOpen, onOpenChange, onSubmit }: ManualInputModalProps) {
  const [metric, setMetric] = useState('heartRate');
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [spo2, setSpo2] = useState('');
  const [sleepHours, setSleepHours] = useState('');

  const handleSubmit = () => {
    let data: Record<string, any> = {};
    let isValid = false;

    switch (metric) {
      case 'heartRate':
        const heartRateNum = parseInt(heartRate, 10);
        if (isNaN(heartRateNum) || heartRateNum <= 0) {
          toast.error('Please enter a valid heart rate.');
          return;
        }
        data = { heartRate: heartRateNum };
        isValid = true;
        break;

      case 'bloodPressure':
        const systolicNum = parseInt(systolic, 10);
        const diastolicNum = parseInt(diastolic, 10);
        if (isNaN(systolicNum) || isNaN(diastolicNum) || systolicNum <= 0 || diastolicNum <= 0) {
          toast.error('Please enter valid blood pressure values.');
          return;
        }
        data = { bloodPressure: { systolic: systolicNum, diastolic: diastolicNum } };
        isValid = true;
        break;

      case 'bloodOxygen':
        const spo2Num = parseInt(spo2, 10);
        if (isNaN(spo2Num) || spo2Num <= 0 || spo2Num > 100) {
          toast.error('Please enter a valid SpO2 value (1-100).');
          return;
        }
        data = { spo2: spo2Num };
        isValid = true;
        break;

      case 'sleep':
        const sleepHoursNum = parseFloat(sleepHours);
        if (isNaN(sleepHoursNum) || sleepHoursNum < 0 || sleepHoursNum > 24) {
          toast.error('Please enter a valid number of sleep hours (0-24).');
          return;
        }
        data = { sleep: sleepHoursNum };
        isValid = true;
        break;

      default:
        toast.error('Please select a valid metric.');
        return;
    }

    if (isValid) {
      onSubmit(data);
      toast.success(`Successfully added ${metric.replace(/([A-Z])/g, ' $1').toLowerCase()} entry.`);
      // Clear fields
      setHeartRate('');
      setSystolic('');
      setDiastolic('');
      setSpo2('');
      setSleepHours('');
      onOpenChange(false);
    }
  };

  const renderMetricInput = () => {
    switch (metric) {
      case 'heartRate':
        return (
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='heartRate' className='text-right'>
              Heart Rate
            </Label>
            <Input
              id='heartRate'
              type='number'
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              className='col-span-3'
              placeholder='e.g., 80 bpm'
            />
          </div>
        );
      case 'bloodPressure':
        return (
          <div className='grid grid-cols-1 gap-y-4'>
            <div className='grid grid-cols-4 items-center gap-x-4'>
                <Label htmlFor='systolic' className='text-right'>
                Systolic
                </Label>
                <Input
                id='systolic'
                type='number'
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                className='col-span-3'
                placeholder='e.g., 120 mmHg'
                />
            </div>
            <div className='grid grid-cols-4 items-center gap-x-4'>
                <Label htmlFor='diastolic' className='text-right'>
                Diastolic
                </Label>
                <Input
                id='diastolic'
                type='number'
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                className='col-span-3'
                placeholder='e.g., 80 mmHg'
                />
            </div>
          </div>
        );
      case 'bloodOxygen':
        return (
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='spo2' className='text-right'>
              SpO2
            </Label>
            <Input
              id='spo2'
              type='number'
              value={spo2}
              onChange={(e) => setSpo2(e.target.value)}
              className='col-span-3'
              placeholder='e.g., 98%'
            />
          </div>
        );
      case 'sleep':
        return (
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='sleepHours' className='text-right'>
              Sleep
            </Label>
            <Input
              id='sleepHours'
              type='number'
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className='col-span-3'
              placeholder='e.g., 7.5 hours'
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Add Manual Health Entry</DialogTitle>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='metric' className='text-right'>
              Metric
            </Label>
            <Select value={metric} onValueChange={setMetric}>
                <SelectTrigger className='col-span-3'>
                    <SelectValue placeholder='Select a metric' />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='heartRate'>Heart Rate</SelectItem>
                    <SelectItem value='bloodPressure'>Blood Pressure</SelectItem>
                    <SelectItem value='bloodOxygen'>Blood Oxygen</SelectItem>
                    <SelectItem value='sleep'>Sleep Pattern</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {renderMetricInput()}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add Entry</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

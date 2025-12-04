import { useState } from 'react';
import { toast } from 'sonner';
import { saveBPReading } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface BPInputModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function BPInputModal({ isOpen, onOpenChange, onSaved }: BPInputModalProps) {
  const { userEmail } = useAuth();
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const sys = parseInt(systolic, 10);
    const dia = parseInt(diastolic, 10);

    if (!systolic || !diastolic) {
      toast.error('Please enter both systolic and diastolic values.');
      return;
    }

    if (isNaN(sys) || isNaN(dia)) {
      toast.error('Systolic and diastolic must be numbers.');
      return;
    }

    if (sys < 50 || sys > 250 || dia < 30 || dia > 150) {
      toast.error('Please enter realistic blood pressure values.');
      return;
    }

    if (dia > sys) {
      toast.error('Diastolic pressure cannot be higher than systolic.');
      return;
    }

    if (!userEmail) {
      toast.error('User email not found. Please log in again.');
      return;
    }

    setIsSaving(true);
    try {
      await saveBPReading(userEmail, sys, dia, notes || undefined, 'manual');
      toast.success(`BP reading saved: ${sys}/${dia} mmHg`);
      setSystolic('');
      setDiastolic('');
      setNotes('');
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      console.error('Error saving BP reading:', error);
      toast.error('Failed to save BP reading. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isSaving) {
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Blood Pressure Reading</DialogTitle>
          <DialogDescription>
            Enter your systolic and diastolic pressure readings (in mmHg).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systolic">Systolic (mmHg)</Label>
              <Input
                id="systolic"
                type="number"
                min="50"
                max="250"
                placeholder="e.g., 120"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">Upper pressure</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
              <Input
                id="diastolic"
                type="number"
                min="30"
                max="150"
                placeholder="e.g., 80"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">Lower pressure</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., Taken after exercise, feeling stressed, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSaving}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Reading'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

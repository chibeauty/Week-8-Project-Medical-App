import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getBPHistory, deleteBPReading, BloodPressureReading } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BPStatusIndicator } from './BPStatusIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BPHistoryProps {
  refreshTrigger?: number;
}

export function BPHistory({ refreshTrigger }: BPHistoryProps) {
  const { userEmail } = useAuth();
  const [history, setHistory] = useState<BloodPressureReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [userEmail, refreshTrigger]);

  const loadHistory = async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const readings = await getBPHistory(userEmail);
      setHistory(readings);
    } catch (error) {
      console.error('Error loading BP history:', error);
      toast.error('Failed to load BP history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (readingId: string) => {
    if (!userEmail) return;
    setDeletingId(readingId);
    try {
      await deleteBPReading(userEmail, readingId);
      setHistory(history.filter(r => r.id !== readingId));
      toast.success('Reading deleted.');
    } catch (error) {
      console.error('Error deleting BP reading:', error);
      toast.error('Failed to delete reading.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!userEmail) {
    return <div className="text-center text-muted-foreground py-6">Please log in to view BP history.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blood Pressure History</CardTitle>
          <CardDescription>No readings recorded yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Prepare chart data (last 14 readings, oldest first for chart display)
  const chartData = [...history].reverse().slice(0, 14).map(reading => ({
    date: reading.date,
    systolic: reading.systolic,
    diastolic: reading.diastolic,
    time: reading.time,
  }));

  const avgSystolic = Math.round(history.reduce((sum, r) => sum + r.systolic, 0) / history.length);
  const avgDiastolic = Math.round(history.reduce((sum, r) => sum + r.diastolic, 0) / history.length);

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>BP Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Latest Reading</p>
            <p className="text-2xl font-bold">
              {history[0].systolic}/{history[0].diastolic}
            </p>
            <div className="mt-1">
              <BPStatusIndicator systolic={history[0].systolic} diastolic={history[0].diastolic} />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average (Last 30)</p>
            <p className="text-2xl font-bold">{avgSystolic}/{avgDiastolic}</p>
            <p className="text-xs text-muted-foreground mt-1">mmHg</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Readings</p>
            <p className="text-2xl font-bold">{history.length}</p>
            <p className="text-xs text-muted-foreground mt-1">recorded</p>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>BP Trend (Last 14 Readings)</CardTitle>
          <CardDescription>Systolic and diastolic pressure over time.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[40, 180]} />
              <Tooltip formatter={(val: any) => `${val} mmHg`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="systolic"
                stroke="#ef4444"
                strokeWidth={2}
                name="Systolic"
              />
              <Line
                type="monotone"
                dataKey="diastolic"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Diastolic"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Readings</CardTitle>
          <CardDescription>Your complete blood pressure history.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Date</th>
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-center py-2 px-2">Systolic</th>
                  <th className="text-center py-2 px-2">Diastolic</th>
                  <th className="text-left py-2 px-2">Status</th>
                  <th className="text-left py-2 px-2">Notes</th>
                  <th className="text-center py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map(reading => (
                  <tr key={reading.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">{reading.date}</td>
                    <td className="py-3 px-2">{reading.time}</td>
                    <td className="text-center py-3 px-2 font-semibold">{reading.systolic}</td>
                    <td className="text-center py-3 px-2 font-semibold">{reading.diastolic}</td>
                    <td className="py-3 px-2">
                      <BPStatusIndicator systolic={reading.systolic} diastolic={reading.diastolic} size="sm" />
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {reading.notes ? reading.notes.slice(0, 20) + '...' : '-'}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(reading.id)}
                        disabled={deletingId === reading.id}
                      >
                        {deletingId === reading.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

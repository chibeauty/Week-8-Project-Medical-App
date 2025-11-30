import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Lightbulb, Zap, ShieldCheck } from 'lucide-react';
import { ManualInsight } from '../lib/api';

interface InsightCardProps {
  insight: ManualInsight;
}

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-blue-500" />
          <CardTitle className="text-blue-800 dark:text-blue-300">{insight.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Zap className="h-4 w-4"/> Analysis</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{insight.summary}</p>
        </div>
        <div>
          <h3 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4"/> Recommendations</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300 mt-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

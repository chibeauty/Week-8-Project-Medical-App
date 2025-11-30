import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface HealthMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  unit: string;
  description: string;
}

export function HealthMetricCard({ icon, label, value, unit, description }: HealthMetricCardProps) {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value}<span className="text-xs text-muted-foreground ml-1">{unit}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
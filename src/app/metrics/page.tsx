'use client';

import { MetricsDashboard } from '@/components/MetricsDashboard';

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="metrics-heading">Metrics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor decision performance, automation rates, and business value metrics
        </p>
      </div>

      <MetricsDashboard />
    </div>
  );
}

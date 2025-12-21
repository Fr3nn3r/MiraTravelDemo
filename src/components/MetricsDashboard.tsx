'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getDashboardMetrics,
  getDecisionTrend,
  getPayoutDistribution,
  DashboardMetrics,
  TrendDataPoint,
  PayoutDistribution,
} from '@/lib/engine/metrics-service';

interface MetricsDashboardProps {
  productId?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground',
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <p className={`text-sm mt-2 ${trendColors[trendDirection || 'neutral']}`}>
            {trendDirection === 'up' && '[^] '}
            {trendDirection === 'down' && '[v] '}
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, maxValue }: { data: number[]; maxValue: number }) {
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((value, i) => (
        <div
          key={i}
          className="flex-1 bg-blue-500 rounded-t"
          style={{ height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
          title={`${value} decisions`}
        />
      ))}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
    </div>
  );
}

export function MetricsDashboard({ productId }: MetricsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trend, setTrend] = useState<TrendDataPoint[]>([]);
  const [distribution, setDistribution] = useState<PayoutDistribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo effect
    const timer = setTimeout(() => {
      setMetrics(getDashboardMetrics(productId));
      setTrend(getDecisionTrend(14, productId));
      setDistribution(getPayoutDistribution(productId));
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [productId]);

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-16 bg-muted rounded animate-pulse mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const last7dTrend = trend.slice(-7);
  const maxDecisions = Math.max(...last7dTrend.map((d) => d.decisions));

  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Automation Rate"
          value={`${metrics.automationRate.toFixed(1)}%`}
          subtitle="Claims auto-decided"
          trend="vs 88% industry avg"
          trendDirection="up"
        />
        <MetricCard
          title="Avg Processing Time"
          value={`${Math.round(metrics.averageProcessingTimeMs)}ms`}
          subtitle={`P95: ${Math.round(metrics.p95ProcessingTimeMs)}ms`}
          trend="Near real-time"
          trendDirection="up"
        />
        <MetricCard
          title="Approval Rate"
          value={`${metrics.approvalRate.toFixed(1)}%`}
          subtitle={`${metrics.approvedCount} approved / ${metrics.deniedCount} denied`}
        />
        <MetricCard
          title="Total Payout"
          value={`$${metrics.totalPayoutUSD.toLocaleString()}`}
          subtitle={`Avg $${Math.round(metrics.averagePayoutUSD)} per claim`}
        />
      </div>

      {/* Decision Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Decision Volume</CardTitle>
            <CardDescription>Last 14 days of claim decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <MiniBarChart data={trend.map((d) => d.decisions)} maxValue={maxDecisions} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{trend[0]?.date}</span>
                <span>{trend[trend.length - 1]?.date}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-2xl font-bold">{metrics.decisionsLast24h}</p>
                  <p className="text-sm text-muted-foreground">Last 24h</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.decisionsLast7d}</p>
                  <p className="text-sm text-muted-foreground">Last 7 days</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{metrics.decisionsLast30d}</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payout Distribution</CardTitle>
            <CardDescription>Breakdown by delay tier</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {distribution.map((tier) => (
                <div key={tier.tier} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{tier.tier}</span>
                    <span className="font-medium">
                      {tier.count} claims ({tier.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={tier.percentage}
                    max={100}
                    color={
                      tier.amount === 50
                        ? 'bg-green-500'
                        : tier.amount === 100
                          ? 'bg-blue-500'
                          : tier.amount === 200
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    ${tier.amount} x {tier.count} = ${(tier.amount * tier.count).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Value Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Business Value Summary</CardTitle>
          <CardDescription>Key metrics for executive decision-making</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-green-800">Speed</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {Math.round(metrics.averageProcessingTimeMs)}ms
              </p>
              <p className="text-sm text-green-600 mt-1">
                Average time-to-decision vs industry 24-48 hours
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-blue-800">Automation</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {metrics.automationRate.toFixed(1)}%
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Straight-through processing rate
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-purple-800">Cost Savings</span>
              </div>
              <p className="text-2xl font-bold text-purple-700">
                ~${Math.round((metrics.totalDecisions * 0.92 * 15))}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Est. handling cost avoided ($15/manual claim)
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Executive Summary</h4>
            <p className="text-sm text-muted-foreground">
              The decisioning engine processed <strong>{metrics.totalDecisions} claims</strong> with a{' '}
              <strong>{metrics.automationRate.toFixed(1)}% automation rate</strong>, delivering decisions in an
              average of <strong>{Math.round(metrics.averageProcessingTimeMs)}ms</strong>. This represents
              significant operational efficiency gains compared to traditional manual processing times of 24-48
              hours. The estimated cost avoidance from automated processing is approximately{' '}
              <strong>${Math.round(metrics.totalDecisions * 0.92 * 15).toLocaleString()}</strong> based on
              industry benchmarks of $15 per manually processed claim.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

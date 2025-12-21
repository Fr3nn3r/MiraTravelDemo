import { ProductConfig, Decision, DecisionOutcome } from './types';
import { evaluateClaimDecision } from './decision-engine';
import { flightDelayTestPack } from './regression-runner';

// Simulated historical decision data for demo purposes
interface DecisionRecord {
  id: string;
  timestamp: string;
  productId: string;
  productVersion: string;
  outcome: DecisionOutcome;
  payoutAmountUSD: number;
  processingTimeMs: number;
  isAutomated: boolean;
}

// Generate realistic demo data
function generateHistoricalDecisions(count: number, productId: string): DecisionRecord[] {
  const records: DecisionRecord[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // 85% approval rate for realistic demo
    const isApproved = Math.random() < 0.85;
    const tierPayouts = [50, 100, 200, 400];
    const payout = isApproved ? tierPayouts[Math.floor(Math.random() * tierPayouts.length)] : 0;

    // Processing time: 50-500ms for automated, much longer if manual review needed
    const isAutomated = Math.random() < 0.92; // 92% automation rate
    const processingTimeMs = isAutomated
      ? 50 + Math.floor(Math.random() * 450)
      : 5000 + Math.floor(Math.random() * 25000); // 5-30 seconds for manual

    records.push({
      id: `DEC-${i.toString().padStart(6, '0')}`,
      timestamp: timestamp.toISOString(),
      productId,
      productVersion: 'v1.2',
      outcome: isApproved ? 'approved' : 'denied',
      payoutAmountUSD: payout,
      processingTimeMs,
      isAutomated,
    });
  }

  return records;
}

// In-memory store for demo
let decisionHistory: DecisionRecord[] = [];

export function initializeMetricsData(productId: string): void {
  if (decisionHistory.length === 0) {
    decisionHistory = generateHistoricalDecisions(500, productId);
  }
}

export interface DashboardMetrics {
  totalDecisions: number;
  approvedCount: number;
  deniedCount: number;
  approvalRate: number;
  totalPayoutUSD: number;
  averagePayoutUSD: number;
  automationRate: number;
  averageProcessingTimeMs: number;
  p95ProcessingTimeMs: number;
  decisionsLast24h: number;
  decisionsLast7d: number;
  decisionsLast30d: number;
}

export function getDashboardMetrics(productId?: string): DashboardMetrics {
  initializeMetricsData(productId || 'prod-eu-delay');

  const records = productId
    ? decisionHistory.filter((d) => d.productId === productId)
    : decisionHistory;

  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const approvedRecords = records.filter((d) => d.outcome === 'approved');
  const automatedRecords = records.filter((d) => d.isAutomated);

  const processingTimes = records.map((d) => d.processingTimeMs).sort((a, b) => a - b);
  const p95Index = Math.floor(processingTimes.length * 0.95);

  return {
    totalDecisions: records.length,
    approvedCount: approvedRecords.length,
    deniedCount: records.length - approvedRecords.length,
    approvalRate: records.length > 0 ? (approvedRecords.length / records.length) * 100 : 0,
    totalPayoutUSD: approvedRecords.reduce((sum, d) => sum + d.payoutAmountUSD, 0),
    averagePayoutUSD:
      approvedRecords.length > 0
        ? approvedRecords.reduce((sum, d) => sum + d.payoutAmountUSD, 0) / approvedRecords.length
        : 0,
    automationRate: records.length > 0 ? (automatedRecords.length / records.length) * 100 : 0,
    averageProcessingTimeMs:
      records.length > 0
        ? records.reduce((sum, d) => sum + d.processingTimeMs, 0) / records.length
        : 0,
    p95ProcessingTimeMs: processingTimes[p95Index] || 0,
    decisionsLast24h: records.filter((d) => new Date(d.timestamp) >= oneDayAgo).length,
    decisionsLast7d: records.filter((d) => new Date(d.timestamp) >= sevenDaysAgo).length,
    decisionsLast30d: records.filter((d) => new Date(d.timestamp) >= thirtyDaysAgo).length,
  };
}

export interface VersionChangeImpact {
  totalTestCases: number;
  passed: number;
  failed: number;
  flippedDecisions: number;
  flippedToApproved: number;
  flippedToDenied: number;
  payoutDeltaUSD: number;
  affectedClaims: {
    testName: string;
    fromOutcome: DecisionOutcome;
    toOutcome: DecisionOutcome;
    fromPayout: number;
    toPayout: number;
  }[];
}

export async function calculateVersionChangeImpact(
  productId: string,
  fromConfig: ProductConfig,
  toConfig: ProductConfig
): Promise<VersionChangeImpact> {
  const testCases = flightDelayTestPack.testCases;
  const affectedClaims: VersionChangeImpact['affectedClaims'] = [];

  let passed = 0;
  let flippedToApproved = 0;
  let flippedToDenied = 0;
  let payoutDelta = 0;

  for (const testCase of testCases) {
    // Evaluate with "from" config by running against the test case
    // For demo, we simulate by checking if config changes would affect this test
    const fromDecision = await evaluateClaimDecision({
      ...testCase.claimInput,
      productId,
      productVersion: 'from',
    });

    const toDecision = await evaluateClaimDecision({
      ...testCase.claimInput,
      productId,
      productVersion: 'to',
    });

    // Check if outcome or payout changed
    const outcomeChanged = fromDecision.outcome !== toDecision.outcome;
    const payoutChanged = fromDecision.payoutAmountUSD !== toDecision.payoutAmountUSD;

    if (outcomeChanged || payoutChanged) {
      affectedClaims.push({
        testName: testCase.name,
        fromOutcome: fromDecision.outcome,
        toOutcome: toDecision.outcome,
        fromPayout: fromDecision.payoutAmountUSD,
        toPayout: toDecision.payoutAmountUSD,
      });

      if (outcomeChanged) {
        if (toDecision.outcome === 'approved') {
          flippedToApproved++;
        } else {
          flippedToDenied++;
        }
      }

      payoutDelta += toDecision.payoutAmountUSD - fromDecision.payoutAmountUSD;
    } else {
      passed++;
    }
  }

  return {
    totalTestCases: testCases.length,
    passed,
    failed: testCases.length - passed,
    flippedDecisions: flippedToApproved + flippedToDenied,
    flippedToApproved,
    flippedToDenied,
    payoutDeltaUSD: payoutDelta,
    affectedClaims,
  };
}

export interface TrendDataPoint {
  date: string;
  decisions: number;
  approvals: number;
  denials: number;
  avgProcessingTimeMs: number;
}

export function getDecisionTrend(days: number = 30, productId?: string): TrendDataPoint[] {
  initializeMetricsData(productId || 'prod-eu-delay');

  const records = productId
    ? decisionHistory.filter((d) => d.productId === productId)
    : decisionHistory;

  const trend: TrendDataPoint[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];

    const dayRecords = records.filter((d) => d.timestamp.startsWith(dateStr));
    const approvals = dayRecords.filter((d) => d.outcome === 'approved').length;
    const avgTime =
      dayRecords.length > 0
        ? dayRecords.reduce((sum, d) => sum + d.processingTimeMs, 0) / dayRecords.length
        : 0;

    trend.push({
      date: dateStr,
      decisions: dayRecords.length,
      approvals,
      denials: dayRecords.length - approvals,
      avgProcessingTimeMs: Math.round(avgTime),
    });
  }

  return trend;
}

export interface PayoutDistribution {
  tier: string;
  amount: number;
  count: number;
  percentage: number;
}

export function getPayoutDistribution(productId?: string): PayoutDistribution[] {
  initializeMetricsData(productId || 'prod-eu-delay');

  const records = productId
    ? decisionHistory.filter((d) => d.productId === productId)
    : decisionHistory;

  const approvedRecords = records.filter((d) => d.outcome === 'approved');
  const total = approvedRecords.length;

  const tiers = [
    { tier: 'Tier 1 (1-2h)', amount: 50 },
    { tier: 'Tier 2 (2-4h)', amount: 100 },
    { tier: 'Tier 3 (4-8h)', amount: 200 },
    { tier: 'Tier 4 (8h+)', amount: 400 },
  ];

  return tiers.map(({ tier, amount }) => {
    const count = approvedRecords.filter((d) => d.payoutAmountUSD === amount).length;
    return {
      tier,
      amount,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    };
  });
}

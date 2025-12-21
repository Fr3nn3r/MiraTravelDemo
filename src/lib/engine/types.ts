// Core types for the Decisioning Console

export type ProductStatus = 'draft' | 'active' | 'archived';

export interface PayoutTier {
  id: string;
  minDelayMinutes: number;
  maxDelayMinutes: number;
  payoutAmountUSD: number;
}

export interface EligibilityConfig {
  claimWindowHours: number;
  maxDaysToFile: number;
}

export interface Exclusion {
  id: string;
  type: 'weather' | 'carrier_cancellation' | 'force_majeure' | 'crew_strike';
  label: string;
  enabled: boolean;
}

export interface ReasonCode {
  code: string;
  description: string;
  outcome: 'approved' | 'denied';
}

export interface DataSourceConfig {
  type: 'stub' | 'live';
  provider: string;
}

export interface ProductConfig {
  payoutTiers: PayoutTier[];
  eligibility: EligibilityConfig;
  exclusions: Exclusion[];
  reasonCodes: ReasonCode[];
  dataSource: DataSourceConfig;
}

export interface ProductVersion {
  version: string;
  hash: string;
  config: ProductConfig;
  createdAt: string;
  publishedAt: string | null;
  status: 'draft' | 'published';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  activeVersion: string;
  versions: ProductVersion[];
  createdAt: string;
  updatedAt: string;
}

// Claim & Decision types

export interface ClaimInput {
  bookingRef: string;
  flightNo: string;
  flightDate: string;
  passengerToken: string;
  productId: string;
  productVersion: string;
}

export interface FlightData {
  flightNo: string;
  flightDate: string;
  scheduledArrival: string;
  actualArrival: string | null;
  delayMinutes: number;
  delayReason: 'weather' | 'carrier' | 'crew_strike' | 'force_majeure' | 'operational' | 'none';
  status: 'on_time' | 'delayed' | 'cancelled';
}

export type DecisionOutcome = 'approved' | 'denied';

export interface TraceStep {
  id: string;
  rule: string;
  description: string;
  input: Record<string, unknown>;
  result: 'pass' | 'fail' | 'skip';
  explanation: string;
}

export interface Decision {
  id: string;
  outcome: DecisionOutcome;
  payoutAmountUSD: number;
  reasonCodes: string[];
  trace: TraceStep[];
  productVersion: string;
  productHash: string;
  timestamp: string;
  claimInput: ClaimInput;
  flightData: FlightData;
}

export interface AuditArtifact {
  decision: Decision;
  exportedAt: string;
  exportedBy: string;
}

// Regression / Change safety types

export interface RegressionTestCase {
  id: string;
  name: string;
  claimInput: ClaimInput;
  expectedOutcome: DecisionOutcome;
  expectedPayout: number;
}

export interface RegressionResult {
  testCase: RegressionTestCase;
  actualOutcome: DecisionOutcome;
  actualPayout: number;
  passed: boolean;
  diff: string | null;
}

export interface VersionComparisonSummary {
  fromVersion: string;
  toVersion: string;
  changedFields: string[];
  decisionImpact: {
    totalTestCases: number;
    flippedDecisions: number;
    payoutDeltaUSD: number;
  };
}

import { evaluateClaimDecision } from './decision-engine';
import {
  ClaimInput,
  DecisionOutcome,
  RegressionTestCase,
  RegressionResult,
} from './types';

export interface RegressionTestPack {
  id: string;
  name: string;
  description: string;
  testCases: RegressionTestCase[];
}

export interface RegressionRunSummary {
  packId: string;
  packName: string;
  productId: string;
  productVersion: string;
  runAt: string;
  totalTests: number;
  passed: number;
  failed: number;
  results: RegressionResult[];
}

// Pre-defined test cases for flight delay products
export const flightDelayTestPack: RegressionTestPack = {
  id: 'test-pack-flight-delay',
  name: 'Flight Delay Standard',
  description: 'Comprehensive test pack covering all payout tiers and exclusion scenarios',
  testCases: [
    // Tier 1 approvals (60-120 min delay)
    {
      id: 'test-tier1-approve',
      name: 'Tier 1 Approval - 105 min delay',
      claimInput: {
        bookingRef: 'TEST-T1-001',
        flightNo: 'AF101',
        flightDate: '2024-12-21',
        claimDate: '2024-12-21', // Same day as flight for eligibility
        passengerToken: 'pax-test-1',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'approved',
      expectedPayout: 75,
    },
    // Tier 2 approvals (121-240 min delay)
    {
      id: 'test-tier2-approve',
      name: 'Tier 2 Approval - 150 min delay',
      claimInput: {
        bookingRef: 'TEST-T2-001',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-2',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'approved',
      expectedPayout: 175,
    },
    // Tier 3 approvals (241-480 min delay)
    {
      id: 'test-tier3-approve',
      name: 'Tier 3 Approval - 390 min delay',
      claimInput: {
        bookingRef: 'TEST-T3-001',
        flightNo: 'LH456',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-3',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'approved',
      expectedPayout: 350,
    },
    // Tier 4 approvals (481+ min delay)
    {
      id: 'test-tier4-approve',
      name: 'Tier 4 Approval - 600 min delay',
      claimInput: {
        bookingRef: 'TEST-T4-001',
        flightNo: 'UA100',
        flightDate: '2024-12-18',
        claimDate: '2024-12-18',
        passengerToken: 'pax-test-4',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'approved',
      expectedPayout: 600,
    },
    // Denial - no qualifying delay
    {
      id: 'test-deny-no-delay',
      name: 'Denial - On-time flight',
      claimInput: {
        bookingRef: 'TEST-DENY-001',
        flightNo: 'KL500',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-5',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'denied',
      expectedPayout: 0,
    },
    // Denial - below threshold
    {
      id: 'test-deny-below-threshold',
      name: 'Denial - 45 min delay (below threshold)',
      claimInput: {
        bookingRef: 'TEST-DENY-002',
        flightNo: 'SK600',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-6',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'denied',
      expectedPayout: 0,
    },
    // Denial - force majeure exclusion
    {
      id: 'test-deny-force-majeure',
      name: 'Denial - Force majeure exclusion',
      claimInput: {
        bookingRef: 'TEST-DENY-003',
        flightNo: 'DL300',
        flightDate: '2024-12-19',
        claimDate: '2024-12-19',
        passengerToken: 'pax-test-7',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'denied',
      expectedPayout: 0,
    },
    // Weather delay - should be approved (weather not excluded in EU product)
    {
      id: 'test-weather-approve',
      name: 'Weather delay - Approved (not excluded)',
      claimInput: {
        bookingRef: 'TEST-WEATHER-001',
        flightNo: 'AA200',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-8',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      },
      expectedOutcome: 'approved',
      expectedPayout: 175,
    },
    // Invalid version
    {
      id: 'test-deny-invalid-version',
      name: 'Denial - Invalid product version',
      claimInput: {
        bookingRef: 'TEST-DENY-004',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-9',
        productId: 'prod-eu-delay',
        productVersion: 'v99.0',
      },
      expectedOutcome: 'denied',
      expectedPayout: 0,
    },
    // Invalid product
    {
      id: 'test-deny-invalid-product',
      name: 'Denial - Invalid product ID',
      claimInput: {
        bookingRef: 'TEST-DENY-005',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        claimDate: '2024-12-20',
        passengerToken: 'pax-test-10',
        productId: 'invalid-product',
        productVersion: 'v1.0',
      },
      expectedOutcome: 'denied',
      expectedPayout: 0,
    },
  ],
};

export async function runRegressionTest(
  testCase: RegressionTestCase,
  mockDate?: Date
): Promise<RegressionResult> {
  // If mockDate provided, we'd need to mock the date in evaluation
  // For now, we rely on test setup to handle date mocking
  const decision = await evaluateClaimDecision(testCase.claimInput);

  const passed =
    decision.outcome === testCase.expectedOutcome &&
    decision.payoutAmountUSD === testCase.expectedPayout;

  let diff: string | null = null;
  if (!passed) {
    const diffs: string[] = [];
    if (decision.outcome !== testCase.expectedOutcome) {
      diffs.push(`outcome: expected ${testCase.expectedOutcome}, got ${decision.outcome}`);
    }
    if (decision.payoutAmountUSD !== testCase.expectedPayout) {
      diffs.push(
        `payout: expected $${testCase.expectedPayout}, got $${decision.payoutAmountUSD}`
      );
    }
    diff = diffs.join('; ');
  }

  return {
    testCase,
    actualOutcome: decision.outcome,
    actualPayout: decision.payoutAmountUSD,
    passed,
    diff,
  };
}

export async function runRegressionPack(
  pack: RegressionTestPack,
  productId: string,
  productVersion: string
): Promise<RegressionRunSummary> {
  const results: RegressionResult[] = [];

  for (const testCase of pack.testCases) {
    // Override product ID and version for this test run
    const adjustedTestCase: RegressionTestCase = {
      ...testCase,
      claimInput: {
        ...testCase.claimInput,
        productId,
        productVersion,
      },
    };
    results.push(await runRegressionTest(adjustedTestCase));
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    packId: pack.id,
    packName: pack.name,
    productId,
    productVersion,
    runAt: new Date().toISOString(),
    totalTests: pack.testCases.length,
    passed,
    failed,
    results,
  };
}

export function getTestPacks(): RegressionTestPack[] {
  return [flightDelayTestPack];
}

export function getTestPackById(id: string): RegressionTestPack | undefined {
  return getTestPacks().find((p) => p.id === id);
}

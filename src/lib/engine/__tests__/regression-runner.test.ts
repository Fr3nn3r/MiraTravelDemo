import {
  runRegressionTest,
  runRegressionPack,
  getTestPacks,
  getTestPackById,
  flightDelayTestPack,
} from '../regression-runner';
import { RegressionTestCase } from '../types';

describe('Regression Runner', () => {
  // Mock Date to be within eligibility window of test flight data (Dec 2024)
  const mockDate = new Date('2024-12-20T18:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('getTestPacks', () => {
    it('should return available test packs', () => {
      const packs = getTestPacks();

      expect(packs.length).toBeGreaterThan(0);
      expect(packs[0]).toHaveProperty('id');
      expect(packs[0]).toHaveProperty('name');
      expect(packs[0]).toHaveProperty('testCases');
    });
  });

  describe('getTestPackById', () => {
    it('should return test pack by id', () => {
      const pack = getTestPackById('test-pack-flight-delay');

      expect(pack).toBeDefined();
      expect(pack?.name).toBe('Flight Delay Standard');
    });

    it('should return undefined for non-existent id', () => {
      const pack = getTestPackById('non-existent');

      expect(pack).toBeUndefined();
    });
  });

  describe('runRegressionTest', () => {
    it('should pass test when decision matches expected outcome', async () => {
      const testCase: RegressionTestCase = {
        id: 'test-pass',
        name: 'Test Pass Case',
        claimInput: {
          bookingRef: 'TEST-001',
          flightNo: 'BA123',
          flightDate: '2024-12-20',
          passengerToken: 'pax-test',
          productId: 'prod-eu-delay',
          productVersion: 'v1.2',
        },
        expectedOutcome: 'approved',
        expectedPayout: 175,
      };

      const result = await runRegressionTest(testCase);

      expect(result.passed).toBe(true);
      expect(result.actualOutcome).toBe('approved');
      expect(result.actualPayout).toBe(175);
      expect(result.diff).toBeNull();
    });

    it('should fail test when outcome differs', async () => {
      const testCase: RegressionTestCase = {
        id: 'test-fail-outcome',
        name: 'Test Fail Outcome',
        claimInput: {
          bookingRef: 'TEST-002',
          flightNo: 'BA123',
          flightDate: '2024-12-20',
          passengerToken: 'pax-test',
          productId: 'prod-eu-delay',
          productVersion: 'v1.2',
        },
        expectedOutcome: 'denied',
        expectedPayout: 0,
      };

      const result = await runRegressionTest(testCase);

      expect(result.passed).toBe(false);
      expect(result.diff).toContain('outcome: expected denied, got approved');
    });

    it('should fail test when payout differs', async () => {
      const testCase: RegressionTestCase = {
        id: 'test-fail-payout',
        name: 'Test Fail Payout',
        claimInput: {
          bookingRef: 'TEST-003',
          flightNo: 'BA123',
          flightDate: '2024-12-20',
          passengerToken: 'pax-test',
          productId: 'prod-eu-delay',
          productVersion: 'v1.2',
        },
        expectedOutcome: 'approved',
        expectedPayout: 999,
      };

      const result = await runRegressionTest(testCase);

      expect(result.passed).toBe(false);
      expect(result.diff).toContain('payout: expected $999, got $175');
    });
  });

  describe('runRegressionPack', () => {
    it('should run all tests in the pack', async () => {
      const summary = await runRegressionPack(
        flightDelayTestPack,
        'prod-eu-delay',
        'v1.2'
      );

      expect(summary.totalTests).toBe(flightDelayTestPack.testCases.length);
      expect(summary.passed + summary.failed).toBe(summary.totalTests);
      expect(summary.results.length).toBe(summary.totalTests);
    });

    it('should include correct metadata in summary', async () => {
      const summary = await runRegressionPack(
        flightDelayTestPack,
        'prod-eu-delay',
        'v1.2'
      );

      expect(summary.packId).toBe(flightDelayTestPack.id);
      expect(summary.packName).toBe(flightDelayTestPack.name);
      expect(summary.productId).toBe('prod-eu-delay');
      expect(summary.productVersion).toBe('v1.2');
      expect(summary.runAt).toBeDefined();
    });

    it('should override product id and version for all tests', async () => {
      const summary = await runRegressionPack(
        flightDelayTestPack,
        'prod-us-delay',
        'v1.0'
      );

      // All test results should be for the specified product/version
      summary.results.forEach((result) => {
        expect(result.testCase.claimInput.productId).toBe('prod-us-delay');
        expect(result.testCase.claimInput.productVersion).toBe('v1.0');
      });
    });
  });

  describe('flightDelayTestPack', () => {
    it('should have tests for all approval tiers', () => {
      const tierTests = flightDelayTestPack.testCases.filter(
        (tc) => tc.name.includes('Tier') && tc.expectedOutcome === 'approved'
      );

      expect(tierTests.length).toBe(4); // Tiers 1-4
    });

    it('should have tests for denial scenarios', () => {
      const denialTests = flightDelayTestPack.testCases.filter(
        (tc) => tc.expectedOutcome === 'denied'
      );

      expect(denialTests.length).toBeGreaterThan(0);
    });

    it('should have tests for exclusions', () => {
      const exclusionTests = flightDelayTestPack.testCases.filter(
        (tc) => tc.name.toLowerCase().includes('exclusion') || tc.name.toLowerCase().includes('majeure')
      );

      expect(exclusionTests.length).toBeGreaterThan(0);
    });
  });
});

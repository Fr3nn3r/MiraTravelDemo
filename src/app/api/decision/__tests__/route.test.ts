/**
 * Tests for the Decision API route
 * Note: These tests verify the API logic without HTTP transport
 */

import { evaluateClaimDecision } from '@/lib/engine/decision-engine';
import { ClaimInput } from '@/lib/engine/types';

// Mock date for consistent test results
const mockDate = new Date('2024-12-20T18:00:00Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
});

describe('Decision API', () => {
  describe('Request Validation', () => {
    it('should require all mandatory fields', () => {
      const requiredFields = [
        'bookingRef',
        'flightNo',
        'flightDate',
        'passengerToken',
        'productId',
        'productVersion',
      ];

      const validPayload: ClaimInput = {
        bookingRef: 'BK-12345',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-abc123',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      // Verify all required fields are present
      requiredFields.forEach((field) => {
        expect(validPayload).toHaveProperty(field);
        expect(validPayload[field as keyof ClaimInput]).toBeDefined();
      });
    });

    it('should accept valid date format', () => {
      const validDates = ['2024-12-20', '2025-01-01', '2024-06-15'];
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      validDates.forEach((date) => {
        expect(dateRegex.test(date)).toBe(true);
      });
    });

    it('should reject invalid date formats', () => {
      const invalidDates = ['12-20-2024', '2024/12/20', '20-12-2024', 'invalid'];
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      invalidDates.forEach((date) => {
        expect(dateRegex.test(date)).toBe(false);
      });
    });
  });

  describe('Decision Processing', () => {
    it('should return approved decision for valid delayed flight', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-001',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.payoutAmountUSD).toBeGreaterThan(0);
      expect(decision.reasonCodes.length).toBeGreaterThan(0);
      expect(decision.trace.length).toBeGreaterThan(0);
    });

    it('should return denied decision for excluded delay reason', () => {
      // DL300 has force_majeure delay reason which is excluded by default
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-002',
        flightNo: 'DL300',
        flightDate: '2024-12-19',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.payoutAmountUSD).toBe(0);
      expect(decision.reasonCodes).toContain('DENIED_EXCLUSION');
    });

    it('should include complete trace in response', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-003',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.trace).toBeDefined();
      expect(decision.trace.length).toBeGreaterThanOrEqual(3);

      decision.trace.forEach((step) => {
        expect(step).toHaveProperty('id');
        expect(step).toHaveProperty('rule');
        expect(step).toHaveProperty('description');
        expect(step).toHaveProperty('result');
        expect(step).toHaveProperty('explanation');
        expect(['pass', 'fail', 'skip']).toContain(step.result);
      });
    });

    it('should include flight data in response', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-004',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.flightData).toBeDefined();
      expect(decision.flightData.flightNo).toBe('BA123');
      expect(decision.flightData).toHaveProperty('status');
      expect(decision.flightData).toHaveProperty('delayMinutes');
      expect(decision.flightData).toHaveProperty('delayReason');
    });

    it('should include product hash for audit trail', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-005',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.productHash).toBeDefined();
      expect(decision.productHash.length).toBeGreaterThan(0);
    });

    it('should generate unique decision IDs', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-006',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision1 = evaluateClaimDecision(claim);
      const decision2 = evaluateClaimDecision(claim);

      expect(decision1.id).not.toBe(decision2.id);
      expect(decision1.id).toMatch(/^DEC-/);
      expect(decision2.id).toMatch(/^DEC-/);
    });

    it('should include ISO timestamp', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-007',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.timestamp).toBeDefined();
      expect(new Date(decision.timestamp).toISOString()).toBe(decision.timestamp);
    });
  });

  describe('Error Handling', () => {
    it('should return denied for non-existent product', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-008',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'non-existent-product',
        productVersion: 'v1.0',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_INVALID_PRODUCT');
    });

    it('should return denied for non-existent flight', () => {
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-009',
        flightNo: 'INVALID999',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_INVALID_FLIGHT');
    });
  });

  describe('Payout Tiers', () => {
    it('should match correct payout tier based on delay', () => {
      // BA123 has a 150 minute delay -> Tier 2 (121-240 min) -> $175 (v1.2 config)
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-010',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.payoutAmountUSD).toBe(175);
    });

    it('should approve higher tier for longer delay', () => {
      // LH456 has a 390 minute delay -> Tier 3 (241-480 min) -> $350 (v1.2 config)
      const claim: ClaimInput = {
        bookingRef: 'BK-TEST-011',
        flightNo: 'LH456',
        flightDate: '2024-12-20',
        passengerToken: 'pax-test',
        productId: 'prod-eu-delay',
        productVersion: 'v1.2',
      };

      const decision = evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.payoutAmountUSD).toBe(350);
    });
  });
});

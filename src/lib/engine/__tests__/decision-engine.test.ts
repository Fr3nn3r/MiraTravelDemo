import { evaluateClaimDecision, exportAuditArtifact } from '../decision-engine';
import { ClaimInput } from '../types';

describe('Decision Engine', () => {
  // Mock Date to be within eligibility window of test flight data (Dec 2024)
  const mockDate = new Date('2024-12-20T18:00:00Z');

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const baseClaimInput: ClaimInput = {
    bookingRef: 'TEST-001',
    flightNo: 'BA123',
    flightDate: '2024-12-20',
    passengerToken: 'pax-token-123',
    productId: 'prod-eu-delay',
    productVersion: 'v1.2',
  };

  describe('Product Validation', () => {
    it('should deny claim for non-existent product', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        productId: 'non-existent-product',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_INVALID_PRODUCT');
      expect(decision.trace[0].rule).toBe('PRODUCT_VALIDATION');
      expect(decision.trace[0].result).toBe('fail');
    });

    it('should pass validation for existing product', async () => {
      const decision = await evaluateClaimDecision(baseClaimInput);

      expect(decision.trace[0].rule).toBe('PRODUCT_VALIDATION');
      expect(decision.trace[0].result).toBe('pass');
    });
  });

  describe('Flight Data Fetch', () => {
    it('should deny claim for non-existent flight', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'INVALID-999',
        flightDate: '2099-01-01',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_INVALID_FLIGHT');
      expect(decision.trace.some(t => t.rule === 'FLIGHT_DATA_FETCH' && t.result === 'fail')).toBe(true);
    });

    it('should fetch flight data for valid flight', async () => {
      const decision = await evaluateClaimDecision(baseClaimInput);

      const flightFetchStep = decision.trace.find(t => t.rule === 'FLIGHT_DATA_FETCH');
      expect(flightFetchStep?.result).toBe('pass');
      expect(decision.flightData.flightNo).toBe('BA123');
    });
  });

  describe('Exclusion Check', () => {
    it('should deny claim for force majeure delay (excluded by default)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'DL300',
        flightDate: '2024-12-19',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_EXCLUSION');
      expect(decision.trace.some(t => t.rule === 'EXCLUSION_CHECK' && t.result === 'fail')).toBe(true);
    });

    it('should deny claim for crew strike delay (excluded by default in EU product)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'IB400',
        flightDate: '2024-12-18',
        productVersion: 'v1.1', // v1.1 has crew_strike excluded
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_EXCLUSION');
    });

    it('should pass exclusion check for operational delay', async () => {
      const decision = await evaluateClaimDecision(baseClaimInput);

      const exclusionStep = decision.trace.find(t => t.rule === 'EXCLUSION_CHECK');
      expect(exclusionStep?.result).toBe('pass');
    });

    it('should allow weather delay when weather exclusion is disabled', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'AA200',
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claim);

      // Weather exclusion is disabled in EU product, so should pass
      const exclusionStep = decision.trace.find(t => t.rule === 'EXCLUSION_CHECK');
      expect(exclusionStep?.result).toBe('pass');
    });
  });

  describe('Payout Tier Matching', () => {
    it('should deny claim for delay below minimum threshold', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'SK600', // 45 minutes delay
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_NO_DELAY');
      expect(decision.payoutAmountUSD).toBe(0);
    });

    it('should deny claim for on-time flight', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'KL500', // 0 minutes delay
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('denied');
      expect(decision.reasonCodes).toContain('DENIED_NO_DELAY');
      expect(decision.payoutAmountUSD).toBe(0);
    });

    it('should approve claim with tier 1 payout (60-120 min delay)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'AF789', // 75 minutes delay
        flightDate: '2024-12-19',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.reasonCodes).toContain('APPROVED_TIER_1');
      expect(decision.payoutAmountUSD).toBe(75); // EU v1.2 tier 1 payout
    });

    it('should approve claim with tier 2 payout (121-240 min delay)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'BA123', // 150 minutes delay
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.reasonCodes).toContain('APPROVED_TIER_2');
      expect(decision.payoutAmountUSD).toBe(175); // EU v1.2 tier 2 payout
    });

    it('should approve claim with tier 3 payout (241-480 min delay)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'LH456', // 390 minutes delay
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.reasonCodes).toContain('APPROVED_TIER_3');
      expect(decision.payoutAmountUSD).toBe(350); // EU v1.2 tier 3 payout
    });

    it('should approve claim with tier 4 payout (481+ min delay)', async () => {
      const claim: ClaimInput = {
        ...baseClaimInput,
        flightNo: 'UA100', // 600 minutes delay
        flightDate: '2024-12-18',
      };

      const decision = await evaluateClaimDecision(claim);

      expect(decision.outcome).toBe('approved');
      expect(decision.reasonCodes).toContain('APPROVED_TIER_4');
      expect(decision.payoutAmountUSD).toBe(600); // EU v1.2 tier 4 payout
    });
  });

  describe('Decision Output Structure', () => {
    it('should include all required fields in decision', async () => {
      const decision = await evaluateClaimDecision(baseClaimInput);

      expect(decision.id).toBeDefined();
      expect(decision.id).toMatch(/^DEC-[A-Z0-9]+$/);
      expect(decision.outcome).toBeDefined();
      expect(decision.payoutAmountUSD).toBeDefined();
      expect(decision.reasonCodes).toBeDefined();
      expect(Array.isArray(decision.reasonCodes)).toBe(true);
      expect(decision.trace).toBeDefined();
      expect(Array.isArray(decision.trace)).toBe(true);
      expect(decision.productVersion).toBe('v1.2');
      expect(decision.productHash).toBeDefined();
      expect(decision.timestamp).toBeDefined();
      expect(decision.claimInput).toEqual(baseClaimInput);
      expect(decision.flightData).toBeDefined();
    });

    it('should include trace steps for each evaluation rule', async () => {
      const decision = await evaluateClaimDecision(baseClaimInput);

      const ruleNames = decision.trace.map(t => t.rule);
      expect(ruleNames).toContain('PRODUCT_VALIDATION');
      expect(ruleNames).toContain('FLIGHT_DATA_FETCH');
      expect(ruleNames).toContain('ELIGIBILITY_WINDOW');
      expect(ruleNames).toContain('EXCLUSION_CHECK');
      expect(ruleNames).toContain('PAYOUT_TIER_MATCH');
      expect(ruleNames).toContain('FINAL_DECISION');
    });
  });

  describe('Product Version Handling', () => {
    it('should use specified version config when available', async () => {
      const claimV11: ClaimInput = {
        ...baseClaimInput,
        productVersion: 'v1.1',
        flightNo: 'BA123',
        flightDate: '2024-12-20',
      };

      const decision = await evaluateClaimDecision(claimV11);

      // v1.1 has tier 2 payout of 150 USD (not 175 like v1.2)
      expect(decision.payoutAmountUSD).toBe(150);
    });

    it('should fallback to first version if specified version not found', async () => {
      const claimBadVersion: ClaimInput = {
        ...baseClaimInput,
        productVersion: 'v99.99', // Non-existent version
      };

      const decision = await evaluateClaimDecision(claimBadVersion);

      // Should use v1.2 (first in versions array) which has tier 2 at 175
      expect(decision.payoutAmountUSD).toBe(175);
    });
  });
});

describe('Audit Artifact Export', () => {
  it('should export decision as valid JSON', async () => {
    const claim: ClaimInput = {
      bookingRef: 'AUDIT-001',
      flightNo: 'BA123',
      flightDate: '2024-12-20',
      passengerToken: 'pax-audit',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    };

    const decision = await evaluateClaimDecision(claim);
    const artifact = exportAuditArtifact(decision);

    expect(() => JSON.parse(artifact)).not.toThrow();
  });

  it('should include decision, timestamp, and user in artifact', async () => {
    const claim: ClaimInput = {
      bookingRef: 'AUDIT-002',
      flightNo: 'BA123',
      flightDate: '2024-12-20',
      passengerToken: 'pax-audit',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    };

    const decision = await evaluateClaimDecision(claim);
    const artifact = JSON.parse(exportAuditArtifact(decision));

    expect(artifact.decision).toBeDefined();
    expect(artifact.decision.id).toBe(decision.id);
    expect(artifact.exportedAt).toBeDefined();
    expect(artifact.exportedBy).toBe('Demo User');
  });
});

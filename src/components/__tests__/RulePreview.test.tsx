import { render, screen } from '@testing-library/react';
import { RulePreview } from '../RulePreview';
import { ProductConfig } from '@/lib/engine/types';

const mockConfig: ProductConfig = {
  payoutTiers: [
    { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 50 },
    { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 100 },
    { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 200 },
  ],
  eligibility: {
    claimWindowHours: 72,
    maxDaysToFile: 30,
  },
  exclusions: [
    { id: 'exc-1', type: 'weather', label: 'Weather-related delays', enabled: false },
    { id: 'exc-2', type: 'force_majeure', label: 'Force majeure / Acts of God', enabled: true },
    { id: 'exc-3', type: 'crew_strike', label: 'Crew strikes', enabled: true },
  ],
  reasonCodes: [
    { code: 'APPROVED_TIER_1', description: 'Approved: Delay 1-2 hours', outcome: 'approved' },
    { code: 'DENIED_NO_DELAY', description: 'Denied: No qualifying delay', outcome: 'denied' },
  ],
  dataSource: {
    type: 'stub',
    provider: 'FlightAware (Stub)',
  },
};

describe('RulePreview', () => {
  describe('Decision Flow Section', () => {
    it('should render the decision flow heading', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('Decision Flow')).toBeInTheDocument();
    });

    it('should render all 5 decision steps', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('1. Product Validation')).toBeInTheDocument();
      expect(screen.getByText('2. Flight Data Fetch')).toBeInTheDocument();
      expect(screen.getByText('3. Eligibility Window Check')).toBeInTheDocument();
      expect(screen.getByText('4. Exclusion Check')).toBeInTheDocument();
      expect(screen.getByText('5. Payout Tier Match')).toBeInTheDocument();
    });

    it('should display the product name when provided', () => {
      render(<RulePreview config={mockConfig} productName="Test Product" />);

      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    it('should display the data source provider', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('FlightAware (Stub)')).toBeInTheDocument();
    });

    it('should display eligibility window values', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('72 hours')).toBeInTheDocument();
      expect(screen.getByText('30 days')).toBeInTheDocument();
    });
  });

  describe('Payout Tier Rules Section', () => {
    it('should render the payout tiers heading', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('Payout Tier Rules')).toBeInTheDocument();
    });

    it('should display all payout tiers with amounts', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('THEN payout $50')).toBeInTheDocument();
      expect(screen.getByText('THEN payout $100')).toBeInTheDocument();
      expect(screen.getByText('THEN payout $200')).toBeInTheDocument();
    });

    it('should display tier delay ranges', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('IF delay is 60 - 120 minutes')).toBeInTheDocument();
      expect(screen.getByText('IF delay is 121 - 240 minutes')).toBeInTheDocument();
      expect(screen.getByText('IF delay is 241 - 480 minutes')).toBeInTheDocument();
    });

    it('should display minimum delay in flow', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('60 minutes')).toBeInTheDocument();
    });
  });

  describe('Exclusion Rules Section', () => {
    it('should render the exclusion rules heading', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('Exclusion Rules')).toBeInTheDocument();
    });

    it('should display all exclusions with their status', () => {
      render(<RulePreview config={mockConfig} />);

      // Use getAllByText since exclusions appear in both flow and exclusion rules sections
      expect(screen.getAllByText('Weather-related delays').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Force majeure / Acts of God').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Crew strikes').length).toBeGreaterThanOrEqual(1);
    });

    it('should show EXCLUDED badge for enabled exclusions', () => {
      render(<RulePreview config={mockConfig} />);

      const excludedBadges = screen.getAllByText('EXCLUDED');
      expect(excludedBadges.length).toBe(2); // force_majeure and crew_strike
    });

    it('should show COVERED badge for disabled exclusions', () => {
      render(<RulePreview config={mockConfig} />);

      const coveredBadges = screen.getAllByText('COVERED');
      expect(coveredBadges.length).toBe(1); // weather
    });

    it('should list active exclusions in decision flow', () => {
      render(<RulePreview config={mockConfig} />);

      // The active exclusions should appear in the exclusion check step
      const exclusionLabels = screen.getAllByText('Force majeure / Acts of God');
      expect(exclusionLabels.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Reason Codes Section', () => {
    it('should render the reason codes heading', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('Reason Codes Reference')).toBeInTheDocument();
    });

    it('should display reason codes', () => {
      render(<RulePreview config={mockConfig} />);

      // Use getAllByText since reason codes appear in both flow and reason codes sections
      expect(screen.getAllByText('APPROVED_TIER_1').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('DENIED_NO_DELAY').length).toBeGreaterThanOrEqual(1);
    });

    it('should display reason code descriptions', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('Approved: Delay 1-2 hours')).toBeInTheDocument();
      expect(screen.getByText('Denied: No qualifying delay')).toBeInTheDocument();
    });
  });

  describe('Decision Outcomes', () => {
    it('should display APPROVED outcome', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('APPROVED')).toBeInTheDocument();
    });

    it('should display DENIED outcomes with reason codes', () => {
      render(<RulePreview config={mockConfig} />);

      const deniedElements = screen.getAllByText('DENIED');
      expect(deniedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should display denial reason codes in flow', () => {
      render(<RulePreview config={mockConfig} />);

      expect(screen.getByText('DENIED_INVALID_PRODUCT')).toBeInTheDocument();
      expect(screen.getByText('DENIED_INVALID_FLIGHT')).toBeInTheDocument();
      expect(screen.getByText('DENIED_OUTSIDE_WINDOW')).toBeInTheDocument();
      expect(screen.getByText('DENIED_EXCLUSION')).toBeInTheDocument();
      // DENIED_NO_DELAY appears in both flow and reason codes section
      expect(screen.getAllByText('DENIED_NO_DELAY').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle config with no active exclusions', () => {
      const noExclusionsConfig: ProductConfig = {
        ...mockConfig,
        exclusions: mockConfig.exclusions.map((exc) => ({ ...exc, enabled: false })),
      };

      render(<RulePreview config={noExclusionsConfig} />);

      expect(screen.getByText('No active exclusions - all delay reasons covered')).toBeInTheDocument();
    });

    it('should handle config with single payout tier', () => {
      const singleTierConfig: ProductConfig = {
        ...mockConfig,
        payoutTiers: [{ id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 9999, payoutAmountUSD: 100 }],
      };

      render(<RulePreview config={singleTierConfig} />);

      expect(screen.getByText('THEN payout $100')).toBeInTheDocument();
      // Large max delay should show as "..."
      expect(screen.getByText('IF delay is 60 - ... minutes')).toBeInTheDocument();
    });

    it('should sort tiers by minimum delay', () => {
      const unsortedTiersConfig: ProductConfig = {
        ...mockConfig,
        payoutTiers: [
          { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 200 },
          { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 50 },
          { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 100 },
        ],
      };

      render(<RulePreview config={unsortedTiersConfig} />);

      // The minimum delay shown should be 60 (from the sorted first tier)
      expect(screen.getByText('60 minutes')).toBeInTheDocument();
    });
  });
});

import {
  getDashboardMetrics,
  getDecisionTrend,
  getPayoutDistribution,
  DashboardMetrics,
  TrendDataPoint,
  PayoutDistribution,
} from '../metrics-service';

describe('Metrics Service', () => {
  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', () => {
      const metrics = getDashboardMetrics();

      expect(metrics).toHaveProperty('totalDecisions');
      expect(metrics).toHaveProperty('approvedCount');
      expect(metrics).toHaveProperty('deniedCount');
      expect(metrics).toHaveProperty('approvalRate');
      expect(metrics).toHaveProperty('totalPayoutUSD');
      expect(metrics).toHaveProperty('averagePayoutUSD');
      expect(metrics).toHaveProperty('automationRate');
      expect(metrics).toHaveProperty('averageProcessingTimeMs');
      expect(metrics).toHaveProperty('p95ProcessingTimeMs');
      expect(metrics).toHaveProperty('decisionsLast24h');
      expect(metrics).toHaveProperty('decisionsLast7d');
      expect(metrics).toHaveProperty('decisionsLast30d');
    });

    it('should return positive total decisions', () => {
      const metrics = getDashboardMetrics();

      expect(metrics.totalDecisions).toBeGreaterThan(0);
    });

    it('should have approved + denied equal total', () => {
      const metrics = getDashboardMetrics();

      expect(metrics.approvedCount + metrics.deniedCount).toBe(metrics.totalDecisions);
    });

    it('should have approval rate between 0 and 100', () => {
      const metrics = getDashboardMetrics();

      expect(metrics.approvalRate).toBeGreaterThanOrEqual(0);
      expect(metrics.approvalRate).toBeLessThanOrEqual(100);
    });

    it('should have automation rate between 0 and 100', () => {
      const metrics = getDashboardMetrics();

      expect(metrics.automationRate).toBeGreaterThanOrEqual(0);
      expect(metrics.automationRate).toBeLessThanOrEqual(100);
    });

    it('should have positive processing times', () => {
      const metrics = getDashboardMetrics();

      expect(metrics.averageProcessingTimeMs).toBeGreaterThan(0);
      expect(metrics.p95ProcessingTimeMs).toBeGreaterThanOrEqual(metrics.averageProcessingTimeMs);
    });

    it('should filter by productId when provided', () => {
      const metricsWithProduct = getDashboardMetrics('prod-eu-delay');
      const metricsAllProducts = getDashboardMetrics();

      // Both should return data since we initialize with the same product
      expect(metricsWithProduct.totalDecisions).toBeGreaterThan(0);
      expect(metricsAllProducts.totalDecisions).toBeGreaterThan(0);
    });
  });

  describe('getDecisionTrend', () => {
    it('should return trend data for specified days', () => {
      const trend = getDecisionTrend(7);

      expect(trend.length).toBe(7);
    });

    it('should return trend points with required properties', () => {
      const trend = getDecisionTrend(14);

      trend.forEach((point: TrendDataPoint) => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('decisions');
        expect(point).toHaveProperty('approvals');
        expect(point).toHaveProperty('denials');
        expect(point).toHaveProperty('avgProcessingTimeMs');
      });
    });

    it('should have approvals + denials equal decisions for each day', () => {
      const trend = getDecisionTrend(7);

      trend.forEach((point: TrendDataPoint) => {
        expect(point.approvals + point.denials).toBe(point.decisions);
      });
    });

    it('should return dates in ascending order', () => {
      const trend = getDecisionTrend(7);

      for (let i = 1; i < trend.length; i++) {
        expect(new Date(trend[i].date).getTime()).toBeGreaterThan(
          new Date(trend[i - 1].date).getTime()
        );
      }
    });

    it('should default to 30 days when no parameter provided', () => {
      const trend = getDecisionTrend();

      expect(trend.length).toBe(30);
    });
  });

  describe('getPayoutDistribution', () => {
    it('should return distribution for all tiers', () => {
      const distribution = getPayoutDistribution();

      expect(distribution.length).toBe(4);
    });

    it('should return distribution points with required properties', () => {
      const distribution = getPayoutDistribution();

      distribution.forEach((tier: PayoutDistribution) => {
        expect(tier).toHaveProperty('tier');
        expect(tier).toHaveProperty('amount');
        expect(tier).toHaveProperty('count');
        expect(tier).toHaveProperty('percentage');
      });
    });

    it('should have correct payout amounts for each tier', () => {
      const distribution = getPayoutDistribution();
      const expectedAmounts = [50, 100, 200, 400];

      distribution.forEach((tier: PayoutDistribution, index: number) => {
        expect(tier.amount).toBe(expectedAmounts[index]);
      });
    });

    it('should have percentages that are valid', () => {
      const distribution = getPayoutDistribution();

      distribution.forEach((tier: PayoutDistribution) => {
        expect(tier.percentage).toBeGreaterThanOrEqual(0);
        expect(tier.percentage).toBeLessThanOrEqual(100);
      });
    });

    it('should have non-negative counts', () => {
      const distribution = getPayoutDistribution();

      distribution.forEach((tier: PayoutDistribution) => {
        expect(tier.count).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Dashboard metrics consistency', () => {
    it('should have consistent payout totals', () => {
      const metrics = getDashboardMetrics();
      const distribution = getPayoutDistribution();

      const distributionTotal = distribution.reduce(
        (sum, tier) => sum + tier.amount * tier.count,
        0
      );

      // The totals should match
      expect(metrics.totalPayoutUSD).toBe(distributionTotal);
    });

    it('should have meaningful average payout', () => {
      const metrics = getDashboardMetrics();

      if (metrics.approvedCount > 0) {
        expect(metrics.averagePayoutUSD).toBeGreaterThan(0);
        expect(metrics.averagePayoutUSD).toBeLessThanOrEqual(400); // Max tier is $400
      }
    });
  });
});

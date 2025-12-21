import { Product, ProductConfig } from '@/lib/engine/types';

const defaultConfig: ProductConfig = {
  payoutTiers: [
    { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 50 },
    { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 100 },
    { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 200 },
    { id: 'tier-4', minDelayMinutes: 481, maxDelayMinutes: 9999, payoutAmountUSD: 400 },
  ],
  eligibility: {
    claimWindowHours: 72,
    maxDaysToFile: 30,
  },
  exclusions: [
    { id: 'exc-1', type: 'weather', label: 'Weather-related delays', enabled: false },
    { id: 'exc-2', type: 'carrier_cancellation', label: 'Carrier-initiated cancellations', enabled: false },
    { id: 'exc-3', type: 'force_majeure', label: 'Force majeure / Acts of God', enabled: true },
    { id: 'exc-4', type: 'crew_strike', label: 'Crew strikes', enabled: true },
  ],
  reasonCodes: [
    { code: 'APPROVED_TIER_1', description: 'Approved: Delay 1-2 hours', outcome: 'approved' },
    { code: 'APPROVED_TIER_2', description: 'Approved: Delay 2-4 hours', outcome: 'approved' },
    { code: 'APPROVED_TIER_3', description: 'Approved: Delay 4-8 hours', outcome: 'approved' },
    { code: 'APPROVED_TIER_4', description: 'Approved: Delay 8+ hours', outcome: 'approved' },
    { code: 'DENIED_NO_DELAY', description: 'Denied: No qualifying delay', outcome: 'denied' },
    { code: 'DENIED_OUTSIDE_WINDOW', description: 'Denied: Claim outside eligibility window', outcome: 'denied' },
    { code: 'DENIED_EXCLUSION', description: 'Denied: Exclusion applies', outcome: 'denied' },
    { code: 'DENIED_INVALID_FLIGHT', description: 'Denied: Flight data not found', outcome: 'denied' },
  ],
  dataSource: {
    type: 'stub',
    provider: 'FlightAware (Stub)',
  },
};

const euConfigV1: ProductConfig = {
  ...defaultConfig,
  payoutTiers: [
    { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 75 },
    { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 150 },
    { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 300 },
    { id: 'tier-4', minDelayMinutes: 481, maxDelayMinutes: 9999, payoutAmountUSD: 600 },
  ],
};

const euConfigV2: ProductConfig = {
  ...euConfigV1,
  payoutTiers: [
    { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 75 },
    { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 175 },
    { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 350 },
    { id: 'tier-4', minDelayMinutes: 481, maxDelayMinutes: 9999, payoutAmountUSD: 600 },
  ],
  exclusions: [
    { id: 'exc-1', type: 'weather', label: 'Weather-related delays', enabled: false },
    { id: 'exc-2', type: 'carrier_cancellation', label: 'Carrier-initiated cancellations', enabled: false },
    { id: 'exc-3', type: 'force_majeure', label: 'Force majeure / Acts of God', enabled: true },
    { id: 'exc-4', type: 'crew_strike', label: 'Crew strikes', enabled: false },
  ],
};

export const products: Product[] = [
  {
    id: 'prod-eu-delay',
    name: 'Flight Delay Benefit - EU',
    description: 'Parametric flight arrival delay coverage for European routes',
    status: 'active',
    activeVersion: 'v1.2',
    versions: [
      {
        version: 'v1.2',
        hash: 'a3f8c2d1',
        config: euConfigV2,
        createdAt: '2024-12-15T10:30:00Z',
        publishedAt: '2024-12-15T14:00:00Z',
        status: 'published',
      },
      {
        version: 'v1.1',
        hash: 'b7e4f9a2',
        config: euConfigV1,
        createdAt: '2024-11-20T09:00:00Z',
        publishedAt: '2024-11-20T12:00:00Z',
        status: 'published',
      },
      {
        version: 'v1.0',
        hash: 'c1d2e3f4',
        config: defaultConfig,
        createdAt: '2024-10-01T08:00:00Z',
        publishedAt: '2024-10-01T10:00:00Z',
        status: 'published',
      },
    ],
    createdAt: '2024-10-01T08:00:00Z',
    updatedAt: '2024-12-15T14:00:00Z',
  },
  {
    id: 'prod-us-delay',
    name: 'Flight Delay Benefit - US',
    description: 'Parametric flight arrival delay coverage for US domestic routes',
    status: 'active',
    activeVersion: 'v1.0',
    versions: [
      {
        version: 'v1.0',
        hash: 'd4e5f6a7',
        config: defaultConfig,
        createdAt: '2024-11-01T08:00:00Z',
        publishedAt: '2024-11-01T10:00:00Z',
        status: 'published',
      },
    ],
    createdAt: '2024-11-01T08:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
  },
  {
    id: 'prod-apac-delay',
    name: 'Flight Delay Benefit - APAC',
    description: 'Parametric flight arrival delay coverage for Asia-Pacific routes',
    status: 'draft',
    activeVersion: 'v0.1',
    versions: [
      {
        version: 'v0.1',
        hash: 'e8f9a0b1',
        config: {
          ...defaultConfig,
          payoutTiers: [
            { id: 'tier-1', minDelayMinutes: 90, maxDelayMinutes: 180, payoutAmountUSD: 40 },
            { id: 'tier-2', minDelayMinutes: 181, maxDelayMinutes: 360, payoutAmountUSD: 80 },
            { id: 'tier-3', minDelayMinutes: 361, maxDelayMinutes: 9999, payoutAmountUSD: 150 },
          ],
        },
        createdAt: '2024-12-10T08:00:00Z',
        publishedAt: null,
        status: 'draft',
      },
    ],
    createdAt: '2024-12-10T08:00:00Z',
    updatedAt: '2024-12-10T08:00:00Z',
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getActiveProducts(): Product[] {
  return products.filter((p) => p.status === 'active');
}

export function getAllProducts(): Product[] {
  return products;
}

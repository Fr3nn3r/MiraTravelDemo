import { Product, ProductConfig, ProductVersion } from '@/lib/engine/types';
import { products as initialProducts } from './products';

// In-memory product store with state management
let productStore: Product[] = [...initialProducts];
let subscribers: (() => void)[] = [];

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateHash(): string {
  return Math.random().toString(16).substring(2, 10);
}

export function getProductById(id: string): Product | undefined {
  return productStore.find((p) => p.id === id);
}

export function getActiveProducts(): Product[] {
  return productStore.filter((p) => p.status === 'active');
}

export function getAllProducts(): Product[] {
  return [...productStore];
}

export function addProduct(product: Product): void {
  productStore = [...productStore, product];
  notifySubscribers();
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  productStore = productStore.map((p) =>
    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
  );
  notifySubscribers();
}

export function addVersionToProduct(productId: string, version: ProductVersion): void {
  productStore = productStore.map((p) => {
    if (p.id === productId) {
      return {
        ...p,
        versions: [version, ...p.versions],
        activeVersion: version.status === 'published' ? version.version : p.activeVersion,
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });
  notifySubscribers();
}

export function publishVersion(productId: string, versionId: string): void {
  const now = new Date().toISOString();
  productStore = productStore.map((p) => {
    if (p.id === productId) {
      const updatedVersions = p.versions.map((v) =>
        v.version === versionId
          ? { ...v, status: 'published' as const, publishedAt: now }
          : v
      );
      return {
        ...p,
        versions: updatedVersions,
        activeVersion: versionId,
        status: 'active' as const,
        updatedAt: now,
      };
    }
    return p;
  });
  notifySubscribers();
}

export function createProductFromTemplate(
  templateId: string,
  name: string,
  description: string
): Product {
  const template = productTemplates.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  const now = new Date().toISOString();
  const productId = `prod-${generateId()}`;
  const hash = generateHash();

  const newProduct: Product = {
    id: productId,
    name,
    description,
    status: 'draft',
    activeVersion: 'v0.1',
    versions: [
      {
        version: 'v0.1',
        hash,
        config: { ...template.config },
        createdAt: now,
        publishedAt: null,
        status: 'draft',
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  addProduct(newProduct);
  return newProduct;
}

export function subscribe(callback: () => void): () => void {
  subscribers.push(callback);
  return () => {
    subscribers = subscribers.filter((cb) => cb !== callback);
  };
}

export function createNewVersion(
  productId: string,
  config: ProductConfig,
  publish: boolean = false
): ProductVersion | null {
  const product = getProductById(productId);
  if (!product) return null;

  const now = new Date().toISOString();
  const hash = generateHash();

  // Calculate next version number
  const currentVersion = product.versions[0]?.version || 'v0.0';
  const versionMatch = currentVersion.match(/v(\d+)\.(\d+)/);
  const major = parseInt(versionMatch?.[1] || '0');
  let minor = parseInt(versionMatch?.[2] || '0');

  if (publish) {
    // Increment minor version for publish
    minor += 1;
  } else {
    // Draft versions keep same number but add '-draft'
    minor += 1;
  }

  const newVersion: ProductVersion = {
    version: `v${major}.${minor}`,
    hash,
    config: { ...config },
    createdAt: now,
    publishedAt: publish ? now : null,
    status: publish ? 'published' : 'draft',
  };

  addVersionToProduct(productId, newVersion);

  if (publish) {
    publishVersion(productId, newVersion.version);
  }

  return newVersion;
}

function notifySubscribers(): void {
  subscribers.forEach((cb) => cb());
}

// Product Templates
export interface ProductTemplate {
  id: string;
  name: string;
  description: string;
  region: string;
  config: ProductConfig;
}

export const productTemplates: ProductTemplate[] = [
  {
    id: 'template-flight-delay-standard',
    name: 'Flight Delay - Standard',
    description: 'Standard flight delay coverage with 4 payout tiers',
    region: 'Global',
    config: {
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
    },
  },
  {
    id: 'template-flight-delay-premium',
    name: 'Flight Delay - Premium',
    description: 'Premium flight delay coverage with higher payouts and fewer exclusions',
    region: 'Global',
    config: {
      payoutTiers: [
        { id: 'tier-1', minDelayMinutes: 60, maxDelayMinutes: 120, payoutAmountUSD: 100 },
        { id: 'tier-2', minDelayMinutes: 121, maxDelayMinutes: 240, payoutAmountUSD: 200 },
        { id: 'tier-3', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 400 },
        { id: 'tier-4', minDelayMinutes: 481, maxDelayMinutes: 9999, payoutAmountUSD: 800 },
      ],
      eligibility: {
        claimWindowHours: 168,
        maxDaysToFile: 60,
      },
      exclusions: [
        { id: 'exc-1', type: 'weather', label: 'Weather-related delays', enabled: false },
        { id: 'exc-2', type: 'carrier_cancellation', label: 'Carrier-initiated cancellations', enabled: false },
        { id: 'exc-3', type: 'force_majeure', label: 'Force majeure / Acts of God', enabled: true },
        { id: 'exc-4', type: 'crew_strike', label: 'Crew strikes', enabled: false },
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
    },
  },
  {
    id: 'template-flight-delay-budget',
    name: 'Flight Delay - Budget',
    description: 'Basic flight delay coverage with lower payouts and standard exclusions',
    region: 'Global',
    config: {
      payoutTiers: [
        { id: 'tier-1', minDelayMinutes: 120, maxDelayMinutes: 240, payoutAmountUSD: 25 },
        { id: 'tier-2', minDelayMinutes: 241, maxDelayMinutes: 480, payoutAmountUSD: 50 },
        { id: 'tier-3', minDelayMinutes: 481, maxDelayMinutes: 9999, payoutAmountUSD: 100 },
      ],
      eligibility: {
        claimWindowHours: 48,
        maxDaysToFile: 14,
      },
      exclusions: [
        { id: 'exc-1', type: 'weather', label: 'Weather-related delays', enabled: true },
        { id: 'exc-2', type: 'carrier_cancellation', label: 'Carrier-initiated cancellations', enabled: true },
        { id: 'exc-3', type: 'force_majeure', label: 'Force majeure / Acts of God', enabled: true },
        { id: 'exc-4', type: 'crew_strike', label: 'Crew strikes', enabled: true },
      ],
      reasonCodes: [
        { code: 'APPROVED_TIER_1', description: 'Approved: Delay 2-4 hours', outcome: 'approved' },
        { code: 'APPROVED_TIER_2', description: 'Approved: Delay 4-8 hours', outcome: 'approved' },
        { code: 'APPROVED_TIER_3', description: 'Approved: Delay 8+ hours', outcome: 'approved' },
        { code: 'DENIED_NO_DELAY', description: 'Denied: No qualifying delay', outcome: 'denied' },
        { code: 'DENIED_OUTSIDE_WINDOW', description: 'Denied: Claim outside eligibility window', outcome: 'denied' },
        { code: 'DENIED_EXCLUSION', description: 'Denied: Exclusion applies', outcome: 'denied' },
        { code: 'DENIED_INVALID_FLIGHT', description: 'Denied: Flight data not found', outcome: 'denied' },
      ],
      dataSource: {
        type: 'stub',
        provider: 'FlightAware (Stub)',
      },
    },
  },
];

export function getProductTemplates(): ProductTemplate[] {
  return productTemplates;
}

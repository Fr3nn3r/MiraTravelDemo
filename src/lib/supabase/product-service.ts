import { supabase } from './client';
import type { Product, ProductVersion, ProductConfig } from '@/lib/engine/types';

// Transform DB row to app type
function dbToProduct(
  row: {
    id: string;
    name: string;
    description: string;
    status: string;
    active_version: string;
    created_at: string;
    updated_at: string;
  },
  versions: ProductVersion[]
): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status as Product['status'],
    activeVersion: row.active_version,
    versions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function dbToVersion(row: {
  id: string;
  product_id: string;
  version: string;
  hash: string;
  status: string;
  config: ProductConfig;
  created_at: string;
  published_at: string | null;
}): ProductVersion {
  return {
    version: row.version,
    hash: row.hash,
    status: row.status as 'draft' | 'published',
    config: row.config,
    createdAt: row.created_at,
    publishedAt: row.published_at,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function generateHash(): string {
  return Math.random().toString(16).substring(2, 10);
}

export async function getProductById(id: string): Promise<Product | null> {
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (productError || !product) {
    return null;
  }

  const { data: versions, error: versionsError } = await supabase
    .from('product_versions')
    .select('*')
    .eq('product_id', id)
    .order('created_at', { ascending: false });

  if (versionsError) {
    console.error('Error fetching versions:', versionsError);
    return null;
  }

  return dbToProduct(product, (versions || []).map(dbToVersion));
}

interface DbProduct {
  id: string;
  name: string;
  description: string;
  status: string;
  active_version: string;
  created_at: string;
  updated_at: string;
}

interface DbVersion {
  id: string;
  product_id: string;
  version: string;
  hash: string;
  status: string;
  config: ProductConfig;
  created_at: string;
  published_at: string | null;
}

export async function getActiveProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active');

  if (error || !products) {
    console.error('Error fetching active products:', error);
    return [];
  }

  const results: Product[] = [];
  for (const product of products as DbProduct[]) {
    const { data: versions } = await supabase
      .from('product_versions')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    results.push(dbToProduct(product, ((versions || []) as DbVersion[]).map(dbToVersion)));
  }

  return results;
}

export async function getAllProducts(): Promise<Product[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !products) {
    console.error('Error fetching products:', error);
    return [];
  }

  const results: Product[] = [];
  for (const product of products as DbProduct[]) {
    const { data: versions } = await supabase
      .from('product_versions')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    results.push(dbToProduct(product, ((versions || []) as DbVersion[]).map(dbToVersion)));
  }

  return results;
}

export async function addProduct(product: Product): Promise<Product | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: productError } = await (supabase.from('products') as any).insert({
    id: product.id,
    name: product.name,
    description: product.description,
    status: product.status,
    active_version: product.activeVersion,
  });

  if (productError) {
    console.error('Error inserting product:', productError);
    return null;
  }

  // Insert versions
  for (const version of product.versions) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: versionError } = await (supabase.from('product_versions') as any).insert({
      product_id: product.id,
      version: version.version,
      hash: version.hash,
      status: version.status,
      config: version.config,
      published_at: version.publishedAt,
    });

    if (versionError) {
      console.error('Error inserting version:', versionError);
    }
  }

  return getProductById(product.id);
}

export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, 'name' | 'description' | 'status' | 'activeVersion'>>
): Promise<boolean> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.activeVersion !== undefined) dbUpdates.active_version = updates.activeVersion;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('products') as any)
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error('Error updating product:', error);
    return false;
  }

  return true;
}

export async function addVersionToProduct(
  productId: string,
  version: ProductVersion
): Promise<boolean> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: versionError } = await (supabase.from('product_versions') as any).insert({
    product_id: productId,
    version: version.version,
    hash: version.hash,
    status: version.status,
    config: version.config,
    published_at: version.publishedAt,
  });

  if (versionError) {
    console.error('Error inserting version:', versionError);
    return false;
  }

  // Update product's active version if published
  if (version.status === 'published') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('products') as any)
      .update({ active_version: version.version })
      .eq('id', productId);
  }

  return true;
}

export async function publishVersion(
  productId: string,
  versionId: string
): Promise<boolean> {
  const now = new Date().toISOString();

  // Update version status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: versionError } = await (supabase.from('product_versions') as any)
    .update({ status: 'published', published_at: now })
    .eq('product_id', productId)
    .eq('version', versionId);

  if (versionError) {
    console.error('Error publishing version:', versionError);
    return false;
  }

  // Update product's active version and status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: productError } = await (supabase.from('products') as any)
    .update({ active_version: versionId, status: 'active' })
    .eq('id', productId);

  if (productError) {
    console.error('Error updating product:', productError);
    return false;
  }

  return true;
}

export async function createNewVersion(
  productId: string,
  config: ProductConfig,
  publish: boolean = false
): Promise<ProductVersion | null> {
  const product = await getProductById(productId);
  if (!product) return null;

  const now = new Date().toISOString();
  const hash = generateHash();

  // Calculate next version number
  const currentVersion = product.versions[0]?.version || 'v0.0';
  const versionMatch = currentVersion.match(/v(\d+)\.(\d+)/);
  const major = parseInt(versionMatch?.[1] || '0');
  let minor = parseInt(versionMatch?.[2] || '0');
  minor += 1;

  const newVersion: ProductVersion = {
    version: `v${major}.${minor}`,
    hash,
    config: { ...config },
    createdAt: now,
    publishedAt: publish ? now : null,
    status: publish ? 'published' : 'draft',
  };

  const success = await addVersionToProduct(productId, newVersion);
  if (!success) return null;

  if (publish) {
    await publishVersion(productId, newVersion.version);
  }

  return newVersion;
}

// Product Templates - kept in-memory as they're static reference data
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

export async function createProductFromTemplate(
  templateId: string,
  name: string,
  description: string
): Promise<Product | null> {
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

  return addProduct(newProduct);
}

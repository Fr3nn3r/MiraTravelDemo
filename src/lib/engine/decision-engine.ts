import {
  ClaimInput,
  Decision,
  DecisionOutcome,
  FlightData,
  TraceStep,
} from './types';
import { getFlightData } from '@/lib/data/flights';
import { getProductById } from '@/lib/supabase';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

function createTraceStep(
  rule: string,
  description: string,
  input: Record<string, unknown>,
  result: 'pass' | 'fail' | 'skip',
  explanation: string
): TraceStep {
  return {
    id: generateId(),
    rule,
    description,
    input,
    result,
    explanation,
  };
}

export async function evaluateClaimDecision(claim: ClaimInput): Promise<Decision> {
  const trace: TraceStep[] = [];
  let outcome: DecisionOutcome = 'approved';
  let payoutAmountUSD = 0;
  const reasonCodes: string[] = [];

  // Step 1: Validate product exists
  const product = await getProductById(claim.productId);
  if (!product) {
    trace.push(
      createTraceStep(
        'PRODUCT_VALIDATION',
        'Verify product exists and is active',
        { productId: claim.productId },
        'fail',
        `Product ${claim.productId} not found in catalog`
      )
    );
    return buildDecision(claim, 'denied', 0, ['DENIED_INVALID_PRODUCT'], trace, null);
  }

  // Get the specific version config
  const version = product.versions.find((v) => v.version === claim.productVersion);

  if (!version) {
    const availableVersions = product.versions.map((v) => v.version).join(', ');
    trace.push(
      createTraceStep(
        'PRODUCT_VALIDATION',
        'Verify product exists and is active',
        { productId: claim.productId, version: claim.productVersion, status: product.status },
        'pass',
        `Product "${product.name}" found`
      )
    );
    trace.push(
      createTraceStep(
        'VERSION_VALIDATION',
        'Verify requested product version exists',
        { requestedVersion: claim.productVersion, availableVersions: product.versions.map((v) => v.version) },
        'fail',
        `Version ${claim.productVersion} not found. Available versions: ${availableVersions}`
      )
    );
    return buildDecision(claim, 'denied', 0, ['DENIED_INVALID_VERSION'], trace, null);
  }

  const config = version.config;
  const productHash = version.hash;

  trace.push(
    createTraceStep(
      'PRODUCT_VALIDATION',
      'Verify product exists and is active',
      { productId: claim.productId, version: claim.productVersion, status: product.status },
      'pass',
      `Product "${product.name}" found with version ${claim.productVersion}`
    )
  );

  // Step 2: Fetch flight data (always returns data - mock or generated)
  const flightData = getFlightData(claim.flightNo, claim.flightDate);

  trace.push(
    createTraceStep(
      'FLIGHT_DATA_FETCH',
      'Retrieve flight status from data source',
      {
        flightNo: claim.flightNo,
        flightDate: claim.flightDate,
        dataSource: config.dataSource.provider,
        status: flightData.status,
        delayMinutes: flightData.delayMinutes,
      },
      'pass',
      `Flight data retrieved: ${flightData.status}, delay of ${flightData.delayMinutes} minutes`
    )
  );

  // Step 3: Check eligibility window
  const claimTimestamp = new Date();
  const flightTimestamp = new Date(flightData.scheduledArrival);
  const hoursSinceFlight = (claimTimestamp.getTime() - flightTimestamp.getTime()) / (1000 * 60 * 60);
  const withinWindow = hoursSinceFlight <= config.eligibility.claimWindowHours;

  trace.push(
    createTraceStep(
      'ELIGIBILITY_WINDOW',
      'Check if claim is within eligible time window',
      {
        claimWindowHours: config.eligibility.claimWindowHours,
        hoursSinceFlight: Math.round(hoursSinceFlight),
        flightDate: claim.flightDate,
      },
      withinWindow ? 'pass' : 'fail',
      withinWindow
        ? `Claim submitted within ${config.eligibility.claimWindowHours}h window (${Math.round(hoursSinceFlight)}h since flight)`
        : `Claim submitted outside ${config.eligibility.claimWindowHours}h window (${Math.round(hoursSinceFlight)}h since flight)`
    )
  );

  if (!withinWindow) {
    reasonCodes.push('DENIED_OUTSIDE_WINDOW');
    return buildDecision(claim, 'denied', 0, reasonCodes, trace, flightData, productHash);
  }

  // Step 4: Check for exclusions
  const delayReason = flightData.delayReason;
  const applicableExclusion = config.exclusions.find(
    (exc) => exc.enabled && exc.type === delayReason
  );

  if (applicableExclusion) {
    trace.push(
      createTraceStep(
        'EXCLUSION_CHECK',
        'Check if delay reason triggers an exclusion',
        {
          delayReason,
          exclusions: config.exclusions.filter((e) => e.enabled).map((e) => e.type),
        },
        'fail',
        `Exclusion applies: "${applicableExclusion.label}" covers delay reason "${delayReason}"`
      )
    );
    reasonCodes.push('DENIED_EXCLUSION');
    return buildDecision(claim, 'denied', 0, reasonCodes, trace, flightData, productHash);
  }

  trace.push(
    createTraceStep(
      'EXCLUSION_CHECK',
      'Check if delay reason triggers an exclusion',
      {
        delayReason,
        exclusions: config.exclusions.filter((e) => e.enabled).map((e) => e.type),
      },
      'pass',
      `No exclusion applies for delay reason "${delayReason}"`
    )
  );

  // Step 5: Check delay threshold and determine payout tier
  const delayMinutes = flightData.delayMinutes;
  const applicableTier = config.payoutTiers.find(
    (tier) => delayMinutes >= tier.minDelayMinutes && delayMinutes <= tier.maxDelayMinutes
  );

  if (!applicableTier) {
    trace.push(
      createTraceStep(
        'PAYOUT_TIER_MATCH',
        'Match delay duration to payout tier',
        {
          delayMinutes,
          tiers: config.payoutTiers.map((t) => `${t.minDelayMinutes}-${t.maxDelayMinutes}min`),
        },
        'fail',
        `Delay of ${delayMinutes} minutes does not meet minimum threshold of ${config.payoutTiers[0]?.minDelayMinutes || 60} minutes`
      )
    );
    reasonCodes.push('DENIED_NO_DELAY');
    return buildDecision(claim, 'denied', 0, reasonCodes, trace, flightData, productHash);
  }

  trace.push(
    createTraceStep(
      'PAYOUT_TIER_MATCH',
      'Match delay duration to payout tier',
      {
        delayMinutes,
        matchedTier: `${applicableTier.minDelayMinutes}-${applicableTier.maxDelayMinutes}min`,
        payoutUSD: applicableTier.payoutAmountUSD,
      },
      'pass',
      `Delay of ${delayMinutes} minutes matches tier ${applicableTier.minDelayMinutes}-${applicableTier.maxDelayMinutes}min ($${applicableTier.payoutAmountUSD})`
    )
  );

  // Determine reason code based on tier
  const tierIndex = config.payoutTiers.indexOf(applicableTier);
  const tierReasonCode = `APPROVED_TIER_${tierIndex + 1}`;
  reasonCodes.push(tierReasonCode);
  payoutAmountUSD = applicableTier.payoutAmountUSD;

  // Final approval trace
  trace.push(
    createTraceStep(
      'FINAL_DECISION',
      'Generate final claim decision',
      {
        outcome: 'approved',
        payoutUSD: payoutAmountUSD,
        reasonCodes,
      },
      'pass',
      `Claim approved for $${payoutAmountUSD} payout`
    )
  );

  return buildDecision(claim, 'approved', payoutAmountUSD, reasonCodes, trace, flightData, productHash);
}

function buildDecision(
  claim: ClaimInput,
  outcome: DecisionOutcome,
  payoutAmountUSD: number,
  reasonCodes: string[],
  trace: TraceStep[],
  flightData: FlightData | null,
  productHash?: string
): Decision {
  return {
    id: `DEC-${generateId().toUpperCase()}`,
    outcome,
    payoutAmountUSD,
    reasonCodes,
    trace,
    productVersion: claim.productVersion,
    productHash: productHash || 'unknown',
    timestamp: new Date().toISOString(),
    claimInput: claim,
    flightData: flightData || {
      flightNo: claim.flightNo,
      flightDate: claim.flightDate,
      scheduledArrival: '',
      actualArrival: null,
      delayMinutes: 0,
      delayReason: 'none',
      status: 'on_time',
    },
  };
}

export function exportAuditArtifact(decision: Decision): string {
  const artifact = {
    decision,
    exportedAt: new Date().toISOString(),
    exportedBy: 'Demo User',
  };
  return JSON.stringify(artifact, null, 2);
}

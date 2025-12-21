'use client';

import { ProductConfig } from '@/lib/engine/types';
import { Card } from '@/components/ui/card';

interface RulePreviewProps {
  config: ProductConfig;
  productName?: string;
}

function FlowNode({
  title,
  description,
  children,
  type = 'step',
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  type?: 'step' | 'decision' | 'outcome-pass' | 'outcome-fail';
}) {
  const baseClasses = 'p-4 rounded-lg border-2 text-center';
  const typeClasses = {
    step: 'bg-blue-50 border-blue-200',
    decision: 'bg-amber-50 border-amber-200',
    'outcome-pass': 'bg-green-50 border-green-300',
    'outcome-fail': 'bg-red-50 border-red-300',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
      {children}
    </div>
  );
}

function FlowArrow({ label, direction = 'down' }: { label?: string; direction?: 'down' | 'right' }) {
  if (direction === 'right') {
    return (
      <div className="flex items-center justify-center px-2">
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-gray-300" />
          <svg className="w-3 h-3 text-gray-400 -ml-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
          </svg>
        </div>
        {label && <span className="text-xs text-muted-foreground ml-2">{label}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-2">
      <div className="h-6 w-0.5 bg-gray-300" />
      <svg className="w-3 h-3 text-gray-400 -mt-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" />
      </svg>
      {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
    </div>
  );
}

function DecisionBranch({
  passLabel,
  failLabel,
  passNode,
  failNode,
}: {
  passLabel: string;
  failLabel: string;
  passNode: React.ReactNode;
  failNode: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-green-600 mb-2">{passLabel}</span>
        {passNode}
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs font-medium text-red-600 mb-2">{failLabel}</span>
        {failNode}
      </div>
    </div>
  );
}

export function RulePreview({ config, productName }: RulePreviewProps) {
  const activeExclusions = config.exclusions.filter((e) => e.enabled);
  const sortedTiers = [...config.payoutTiers].sort((a, b) => a.minDelayMinutes - b.minDelayMinutes);
  const minDelay = sortedTiers[0]?.minDelayMinutes || 60;

  return (
    <div className="space-y-6">
      <div className="text-sm text-muted-foreground mb-4">
        This preview shows the decision logic as a readable rule flow for validation with legal/compliance.
      </div>

      {/* Main Flow */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Decision Flow</h3>

        <div className="flex flex-col items-center">
          {/* Step 1: Start */}
          <FlowNode
            title="CLAIM RECEIVED"
            description="Incoming claim request"
            type="step"
          />

          <FlowArrow />

          {/* Step 2: Product Validation */}
          <FlowNode
            title="1. Product Validation"
            description="Verify product exists and version is valid"
            type="decision"
          >
            <div className="text-xs mt-2 p-2 bg-white rounded border">
              <span className="text-muted-foreground">Product:</span>{' '}
              <span className="font-mono">{productName || 'Current Product'}</span>
            </div>
          </FlowNode>

          <DecisionBranch
            passLabel="[OK] Valid"
            failLabel="[X] Invalid"
            passNode={<FlowArrow />}
            failNode={
              <FlowNode
                title="DENIED"
                description="DENIED_INVALID_PRODUCT"
                type="outcome-fail"
              />
            }
          />

          {/* Step 3: Flight Data Fetch */}
          <FlowNode
            title="2. Flight Data Fetch"
            description="Retrieve flight status from data source"
            type="decision"
          >
            <div className="text-xs mt-2 p-2 bg-white rounded border">
              <span className="text-muted-foreground">Source:</span>{' '}
              <span className="font-mono">{config.dataSource.provider}</span>
              <span className="ml-2 px-1 py-0.5 rounded bg-gray-100 text-gray-600">
                {config.dataSource.type}
              </span>
            </div>
          </FlowNode>

          <DecisionBranch
            passLabel="[OK] Found"
            failLabel="[X] Not Found"
            passNode={<FlowArrow />}
            failNode={
              <FlowNode
                title="DENIED"
                description="DENIED_INVALID_FLIGHT"
                type="outcome-fail"
              />
            }
          />

          {/* Step 4: Eligibility Window */}
          <FlowNode
            title="3. Eligibility Window Check"
            description="Verify claim is within allowed time window"
            type="decision"
          >
            <div className="text-xs mt-2 p-2 bg-white rounded border space-y-1">
              <div>
                <span className="text-muted-foreground">Claim Window:</span>{' '}
                <span className="font-semibold">{config.eligibility.claimWindowHours} hours</span>
                <span className="text-muted-foreground"> after scheduled arrival</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max Days to File:</span>{' '}
                <span className="font-semibold">{config.eligibility.maxDaysToFile} days</span>
              </div>
            </div>
          </FlowNode>

          <DecisionBranch
            passLabel="[OK] In Window"
            failLabel="[X] Outside Window"
            passNode={<FlowArrow />}
            failNode={
              <FlowNode
                title="DENIED"
                description="DENIED_OUTSIDE_WINDOW"
                type="outcome-fail"
              />
            }
          />

          {/* Step 5: Exclusion Check */}
          <FlowNode
            title="4. Exclusion Check"
            description="Check if delay reason is excluded from coverage"
            type="decision"
          >
            <div className="text-xs mt-2 p-2 bg-white rounded border">
              {activeExclusions.length > 0 ? (
                <div>
                  <span className="text-muted-foreground">Active Exclusions:</span>
                  <ul className="mt-1 space-y-0.5">
                    {activeExclusions.map((exc) => (
                      <li key={exc.id} className="flex items-center gap-1">
                        <span className="text-red-500">[X]</span>
                        <span>{exc.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <span className="text-green-600">No active exclusions - all delay reasons covered</span>
              )}
            </div>
          </FlowNode>

          <DecisionBranch
            passLabel="[OK] No Exclusion"
            failLabel="[X] Exclusion Applies"
            passNode={<FlowArrow />}
            failNode={
              <FlowNode
                title="DENIED"
                description="DENIED_EXCLUSION"
                type="outcome-fail"
              />
            }
          />

          {/* Step 6: Delay Threshold & Tier Match */}
          <FlowNode
            title="5. Payout Tier Match"
            description="Match delay duration to payout tier"
            type="decision"
          >
            <div className="text-xs mt-2 p-2 bg-white rounded border">
              <span className="text-muted-foreground">Minimum qualifying delay:</span>{' '}
              <span className="font-semibold">{minDelay} minutes</span>
            </div>
          </FlowNode>

          <DecisionBranch
            passLabel="[OK] Tier Matched"
            failLabel="[X] Below Threshold"
            passNode={
              <FlowNode
                title="APPROVED"
                description="Payout based on matched tier"
                type="outcome-pass"
              />
            }
            failNode={
              <FlowNode
                title="DENIED"
                description="DENIED_NO_DELAY"
                type="outcome-fail"
              />
            }
          />
        </div>
      </Card>

      {/* Payout Tiers Detail */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Payout Tier Rules</h3>
        <p className="text-sm text-muted-foreground mb-4">
          When a claim passes all checks, the payout amount is determined by the delay duration:
        </p>
        <div className="space-y-2">
          {sortedTiers.map((tier, index) => (
            <div
              key={tier.id}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 flex items-center justify-center bg-green-100 rounded-full text-sm font-semibold text-green-700">
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium">
                    IF delay is {tier.minDelayMinutes} - {tier.maxDelayMinutes > 9000 ? '...' : tier.maxDelayMinutes} minutes
                  </span>
                </div>
              </div>
              <div className="text-lg font-bold text-green-700">
                THEN payout ${tier.payoutAmountUSD}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Exclusions Detail */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Exclusion Rules</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Claims are denied if the delay reason matches an active exclusion:
        </p>
        <div className="grid grid-cols-2 gap-3">
          {config.exclusions.map((exc) => (
            <div
              key={exc.id}
              className={`p-3 rounded-lg border ${
                exc.enabled
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{exc.label}</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    exc.enabled
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {exc.enabled ? 'EXCLUDED' : 'COVERED'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Type: {exc.type.replace('_', ' ')}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Reason Codes Reference */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Reason Codes Reference</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Each decision includes a reason code for audit and dispute resolution:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {config.reasonCodes.map((rc) => (
            <div
              key={rc.code}
              className={`p-2 rounded border text-sm ${
                rc.outcome === 'approved'
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <span className="font-mono text-xs">{rc.code}</span>
              <p className="text-muted-foreground text-xs">{rc.description}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

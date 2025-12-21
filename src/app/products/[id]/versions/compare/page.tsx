'use client';

import { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getProductById } from '@/lib/data/product-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductConfig } from '@/lib/engine/types';

function ConfigDiff({
  label,
  fromValue,
  toValue,
}: {
  label: string;
  fromValue: string | number;
  toValue: string | number;
}) {
  const changed = fromValue !== toValue;

  return (
    <div className={`p-3 rounded-lg ${changed ? 'bg-yellow-50 border border-yellow-200' : 'bg-muted'}`}>
      <p className="text-sm font-medium mb-1">{label}</p>
      <div className="flex items-center gap-4">
        <div className={`text-sm ${changed ? 'text-red-600 line-through' : 'text-muted-foreground'}`}>
          {String(fromValue)}
        </div>
        {changed && (
          <>
            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <div className="text-sm text-green-600 font-medium">{String(toValue)}</div>
          </>
        )}
      </div>
    </div>
  );
}

function TiersDiff({
  fromTiers,
  toTiers,
}: {
  fromTiers: ProductConfig['payoutTiers'];
  toTiers: ProductConfig['payoutTiers'];
}) {
  const maxLen = Math.max(fromTiers.length, toTiers.length);
  const changes: string[] = [];

  for (let i = 0; i < maxLen; i++) {
    const from = fromTiers[i];
    const to = toTiers[i];

    if (!from && to) {
      changes.push(`Tier ${i + 1} added: $${to.payoutAmountUSD}`);
    } else if (from && !to) {
      changes.push(`Tier ${i + 1} removed`);
    } else if (from && to && from.payoutAmountUSD !== to.payoutAmountUSD) {
      changes.push(`Tier ${i + 1} payout: $${from.payoutAmountUSD} -> $${to.payoutAmountUSD}`);
    }
  }

  if (changes.length === 0) {
    return <p className="text-sm text-muted-foreground">No changes to payout tiers</p>;
  }

  return (
    <ul className="space-y-1">
      {changes.map((change, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Changed</Badge>
          {change}
        </li>
      ))}
    </ul>
  );
}

function ExclusionsDiff({
  fromExclusions,
  toExclusions,
}: {
  fromExclusions: ProductConfig['exclusions'];
  toExclusions: ProductConfig['exclusions'];
}) {
  const changes: string[] = [];

  for (const toExc of toExclusions) {
    const fromExc = fromExclusions.find((e) => e.id === toExc.id);
    if (fromExc && fromExc.enabled !== toExc.enabled) {
      changes.push(
        `${toExc.label}: ${fromExc.enabled ? 'Excluded' : 'Covered'} -> ${
          toExc.enabled ? 'Excluded' : 'Covered'
        }`
      );
    }
  }

  if (changes.length === 0) {
    return <p className="text-sm text-muted-foreground">No changes to exclusions</p>;
  }

  return (
    <ul className="space-y-1">
      {changes.map((change, i) => (
        <li key={i} className="text-sm flex items-center gap-2">
          <Badge className="bg-yellow-100 text-yellow-800">Changed</Badge>
          {change}
        </li>
      ))}
    </ul>
  );
}

export default function CompareVersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const product = getProductById(id);

  const fromVersion = searchParams.get('from') || '';
  const toVersion = searchParams.get('to') || '';

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">Product not found</p>
        <Button asChild className="mt-4">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  const fromConfig = product.versions.find((v) => v.version === fromVersion)?.config;
  const toConfig = product.versions.find((v) => v.version === toVersion)?.config;

  // Mock regression results
  const regressionResults = {
    totalTestCases: 25,
    passed: 23,
    failed: 2,
    flippedDecisions: 2,
    payoutDeltaUSD: 450,
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Link href="/products" className="hover:underline">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
          <span>/</span>
          <Link href={`/products/${product.id}/versions`} className="hover:underline">
            Versions
          </Link>
          <span>/</span>
          <span>Compare</span>
        </div>
        <h1 className="text-2xl font-semibold">Compare Versions</h1>
        <p className="text-muted-foreground">
          Review changes between versions of {product.name}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">From Version</label>
          <Select defaultValue={fromVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {product.versions.map((v) => (
                <SelectItem key={v.version} value={v.version}>
                  {v.version} ({v.hash})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="pt-6">
          <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">To Version</label>
          <Select defaultValue={toVersion}>
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {product.versions.map((v) => (
                <SelectItem key={v.version} value={v.version}>
                  {v.version} ({v.hash})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {fromConfig && toConfig && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Configuration Changes</CardTitle>
              <CardDescription>
                Differences between {fromVersion} and {toVersion}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Payout Tiers</h4>
                <TiersDiff fromTiers={fromConfig.payoutTiers} toTiers={toConfig.payoutTiers} />
              </div>

              <div>
                <h4 className="font-medium mb-3">Eligibility</h4>
                <div className="grid grid-cols-2 gap-4">
                  <ConfigDiff
                    label="Claim Window (hours)"
                    fromValue={fromConfig.eligibility.claimWindowHours}
                    toValue={toConfig.eligibility.claimWindowHours}
                  />
                  <ConfigDiff
                    label="Max Days to File"
                    fromValue={fromConfig.eligibility.maxDaysToFile}
                    toValue={toConfig.eligibility.maxDaysToFile}
                  />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Exclusions</h4>
                <ExclusionsDiff
                  fromExclusions={fromConfig.exclusions}
                  toExclusions={toConfig.exclusions}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Decision Impact Analysis</CardTitle>
              <CardDescription>
                How this change affects claim decisions (based on regression test pack)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{regressionResults.totalTestCases}</p>
                  <p className="text-sm text-muted-foreground">Test Cases</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{regressionResults.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {regressionResults.flippedDecisions}
                  </p>
                  <p className="text-sm text-muted-foreground">Decisions Flipped</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    +${regressionResults.payoutDeltaUSD}
                  </p>
                  <p className="text-sm text-muted-foreground">Payout Delta</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-800">Impact Warning</p>
                    <p className="text-sm text-yellow-700">
                      This version change will cause {regressionResults.flippedDecisions} claims
                      to receive different decisions, resulting in an estimated payout increase
                      of ${regressionResults.payoutDeltaUSD}.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" asChild>
              <Link href={`/products/${product.id}/versions`}>Cancel</Link>
            </Button>
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Approve & Publish {toVersion}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

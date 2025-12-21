'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProductById, createNewVersion } from '@/lib/data/product-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, ProductConfig, PayoutTier, Exclusion } from '@/lib/engine/types';

function PayoutTiersEditor({
  tiers,
  onChange,
}: {
  tiers: PayoutTier[];
  onChange: (tiers: PayoutTier[]) => void;
}) {
  const handleTierChange = (index: number, field: keyof PayoutTier, value: number) => {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    onChange(newTiers);
  };

  const addTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newTier: PayoutTier = {
      id: `tier-${Date.now()}`,
      minDelayMinutes: lastTier ? lastTier.maxDelayMinutes + 1 : 60,
      maxDelayMinutes: lastTier ? lastTier.maxDelayMinutes + 120 : 120,
      payoutAmountUSD: lastTier ? lastTier.payoutAmountUSD + 50 : 50,
    };
    onChange([...tiers, newTier]);
  };

  const removeTier = (index: number) => {
    if (tiers.length > 1) {
      onChange(tiers.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Tier</TableHead>
            <TableHead>Min Delay (min)</TableHead>
            <TableHead>Max Delay (min)</TableHead>
            <TableHead>Payout (USD)</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tiers.map((tier, index) => (
            <TableRow key={tier.id}>
              <TableCell className="font-medium">{index + 1}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={tier.minDelayMinutes}
                  onChange={(e) =>
                    handleTierChange(index, 'minDelayMinutes', parseInt(e.target.value) || 0)
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={tier.maxDelayMinutes}
                  onChange={(e) =>
                    handleTierChange(index, 'maxDelayMinutes', parseInt(e.target.value) || 0)
                  }
                  className="w-24"
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <span>$</span>
                  <Input
                    type="number"
                    value={tier.payoutAmountUSD}
                    onChange={(e) =>
                      handleTierChange(index, 'payoutAmountUSD', parseInt(e.target.value) || 0)
                    }
                    className="w-24"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTier(index)}
                  disabled={tiers.length === 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button variant="outline" size="sm" onClick={addTier}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Tier
      </Button>
    </div>
  );
}

function ExclusionsEditor({
  exclusions,
  onChange,
}: {
  exclusions: Exclusion[];
  onChange: (exclusions: Exclusion[]) => void;
}) {
  const handleToggle = (id: string) => {
    onChange(
      exclusions.map((exc) =>
        exc.id === id ? { ...exc, enabled: !exc.enabled } : exc
      )
    );
  };

  return (
    <div className="space-y-4">
      {exclusions.map((exclusion) => (
        <div
          key={exclusion.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div>
            <p className="font-medium">{exclusion.label}</p>
            <p className="text-sm text-muted-foreground">
              Type: {exclusion.type.replace('_', ' ')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {exclusion.enabled ? 'Excluded' : 'Covered'}
            </span>
            <Switch
              checked={exclusion.enabled}
              onCheckedChange={() => handleToggle(exclusion.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const product = getProductById(id);

  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (product) {
      const activeVersion = product.versions.find((v) => v.version === product.activeVersion);
      setConfig(activeVersion?.config || product.versions[0].config);
    }
  }, [product]);

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

  if (!config) {
    return <div>Loading...</div>;
  }

  const activeVersion = product.versions.find((v) => v.version === product.activeVersion);

  const handleConfigChange = (updates: Partial<ProductConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...updates } : prev));
    setHasChanges(true);
  };

  const handleSaveDraft = () => {
    if (!config) return;
    const newVersion = createNewVersion(id, config, false);
    if (newVersion) {
      alert(`Draft saved as ${newVersion.version} (${newVersion.hash})`);
      setHasChanges(false);
      router.refresh();
    }
  };

  const handlePublish = () => {
    if (!config) return;
    const newVersion = createNewVersion(id, config, true);
    if (newVersion) {
      alert(`Published as ${newVersion.version} (${newVersion.hash})`);
      setHasChanges(false);
      router.refresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/products" className="hover:underline">
              Products
            </Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-muted-foreground">{product.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              product.status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }
          >
            {product.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            v{product.activeVersion}
          </span>
          <span className="text-sm font-mono text-muted-foreground">
            ({activeVersion?.hash})
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" asChild>
          <Link href={`/products/${product.id}/versions`}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Version History
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/simulator">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Test in Simulator
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="tiers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tiers">Payout Tiers</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
          <TabsTrigger value="datasource">Data Source</TabsTrigger>
          <TabsTrigger value="reasoncodes">Reason Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers">
          <Card>
            <CardHeader>
              <CardTitle>Payout Tiers</CardTitle>
              <CardDescription>
                Configure delay thresholds and corresponding payout amounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PayoutTiersEditor
                tiers={config.payoutTiers}
                onChange={(tiers) => handleConfigChange({ payoutTiers: tiers })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="eligibility">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Window</CardTitle>
              <CardDescription>
                Define when claims can be filed relative to the flight
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="claimWindow">Claim Window (hours after scheduled arrival)</Label>
                  <Input
                    id="claimWindow"
                    type="number"
                    value={config.eligibility.claimWindowHours}
                    onChange={(e) =>
                      handleConfigChange({
                        eligibility: {
                          ...config.eligibility,
                          claimWindowHours: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Claims must be submitted within this time after the scheduled arrival
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDays">Maximum Days to File</Label>
                  <Input
                    id="maxDays"
                    type="number"
                    value={config.eligibility.maxDaysToFile}
                    onChange={(e) =>
                      handleConfigChange({
                        eligibility: {
                          ...config.eligibility,
                          maxDaysToFile: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Absolute maximum days from flight date to submit claim
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exclusions">
          <Card>
            <CardHeader>
              <CardTitle>Exclusions</CardTitle>
              <CardDescription>
                Define which delay reasons are excluded from coverage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExclusionsEditor
                exclusions={config.exclusions}
                onChange={(exclusions) => handleConfigChange({ exclusions })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datasource">
          <Card>
            <CardHeader>
              <CardTitle>Data Source</CardTitle>
              <CardDescription>
                Configure the flight data provider for this product
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Data Source Type</Label>
                <Select
                  value={config.dataSource.type}
                  onValueChange={(value: 'stub' | 'live') =>
                    handleConfigChange({
                      dataSource: { ...config.dataSource, type: value },
                    })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stub">Stub (Mock Data)</SelectItem>
                    <SelectItem value="live">Live (Production)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={config.dataSource.provider}
                  onChange={(e) =>
                    handleConfigChange({
                      dataSource: { ...config.dataSource, provider: e.target.value },
                    })
                  }
                />
              </div>
              {config.dataSource.type === 'stub' && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Stub Mode:</strong> Using mock flight data for testing. Switch to Live
                    for production integration.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reasoncodes">
          <Card>
            <CardHeader>
              <CardTitle>Reason Codes</CardTitle>
              <CardDescription>
                Map decision outcomes to standardized reason codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Outcome</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.reasonCodes.map((rc) => (
                    <TableRow key={rc.code}>
                      <TableCell className="font-mono text-sm">{rc.code}</TableCell>
                      <TableCell>{rc.description}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            rc.outcome === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {rc.outcome}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {hasChanges && (
        <div className="fixed bottom-0 left-64 right-0 p-4 bg-background border-t shadow-lg">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <p className="text-sm text-muted-foreground">
              You have unsaved changes
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setHasChanges(false)}>
                Discard
              </Button>
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button onClick={handlePublish}>
                Publish New Version
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

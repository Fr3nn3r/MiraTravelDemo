'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportAuditArtifact } from '@/lib/engine/decision-engine';
import { getSampleClaims } from '@/lib/data/claims';
import { ClaimInput, Decision, Product, TraceStep } from '@/lib/engine/types';

function TraceStepCard({ step, index }: { step: TraceStep; index: number }) {
  const resultColors = {
    pass: 'bg-green-100 text-green-800',
    fail: 'bg-red-100 text-red-800',
    skip: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
            Step {index + 1}
          </span>
          <span className="font-medium">{step.rule}</span>
        </div>
        <Badge className={resultColors[step.result]}>
          {step.result.toUpperCase()}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
      <p className="text-sm">{step.explanation}</p>
      <details className="mt-2" open>
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
          View input data
        </summary>
        <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
          {JSON.stringify(step.input, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function DecisionResultCard({ decision }: { decision: Decision }) {
  const isApproved = decision.outcome === 'approved';

  const handleExport = () => {
    const artifact = exportAuditArtifact(decision);
    const blob = new Blob([artifact], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${decision.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Card className={isApproved ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'} data-testid="decision-result">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Decision Result</CardTitle>
            <Badge
              className={
                isApproved
                  ? 'bg-green-600 text-white hover:bg-green-600 text-lg px-4 py-1'
                  : 'bg-red-600 text-white hover:bg-red-600 text-lg px-4 py-1'
              }
            >
              {decision.outcome.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Decision ID</span>
              <p className="font-mono font-medium">{decision.id}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Payout</span>
              <p className="font-medium text-lg">
                ${decision.payoutAmountUSD.toFixed(2)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Model Version</span>
              <p className="font-medium">{decision.productVersion}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Config Hash</span>
              <p className="font-mono text-xs">{decision.productHash}</p>
            </div>
          </div>

          <div className="mt-4">
            <span className="text-sm text-muted-foreground">Reason Codes</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {decision.reasonCodes.map((code) => (
                <Badge key={code} variant="outline">
                  {code}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Decision Trace</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export Audit JSON
            </Button>
          </div>
          <CardDescription>
            Step-by-step evaluation of claim against product rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {decision.trace.map((step, index) => (
              <TraceStepCard key={step.id} step={step} index={index} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Flight Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Flight</span>
              <p className="font-medium">{decision.flightData.flightNo}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Status</span>
              <p className="font-medium capitalize">{decision.flightData.status}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Delay</span>
              <p className="font-medium">{decision.flightData.delayMinutes} min</p>
            </div>
            <div>
              <span className="text-muted-foreground">Delay Reason</span>
              <p className="font-medium capitalize">
                {decision.flightData.delayReason.replace('_', ' ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SimulatorPage() {
  const [claim, setClaim] = useState<ClaimInput>({
    bookingRef: '',
    flightNo: '',
    flightDate: '',
    passengerToken: '',
    productId: '',
    productVersion: '',
  });
  const [decision, setDecision] = useState<Decision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setProducts(data.products.filter((p: Product) => p.status === 'active'));
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    }
    fetchProducts();
  }, []);

  const sampleClaims = getSampleClaims();

  const selectedProduct = products.find((p) => p.id === claim.productId);

  const handleRunDecision = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claim),
      });
      const data = await res.json();
      if (data.success && data.decision) {
        // Transform API response to match Decision type
        const result: Decision = {
          id: data.decision.id,
          outcome: data.decision.outcome,
          payoutAmountUSD: data.decision.payoutAmountUSD,
          reasonCodes: data.decision.reasonCodes,
          productVersion: data.decision.productVersion,
          productHash: data.decision.productHash,
          timestamp: data.decision.timestamp,
          trace: data.trace || [],
          claimInput: claim,
          flightData: data.flightData || {
            flightNo: claim.flightNo,
            flightDate: claim.flightDate,
            scheduledArrival: '',
            actualArrival: null,
            delayMinutes: 0,
            delayReason: 'none',
            status: 'on_time',
          },
        };
        setDecision(result);
      }
    } catch (error) {
      console.error('Error running decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSample = (sample: ClaimInput) => {
    setClaim(sample);
    setDecision(null);
  };

  const handleInputChange = (field: keyof ClaimInput, value: string) => {
    setClaim((prev) => ({ ...prev, [field]: value }));
    setDecision(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="simulator-heading">Claim Simulator</h1>
        <p className="text-muted-foreground">
          Test claim decisions against configured products with full trace visibility
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Claim Input</CardTitle>
              <CardDescription>
                Enter claim details or load a sample claim
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingRef">Booking Reference</Label>
                  <Input
                    id="bookingRef"
                    placeholder="BK-2024-001"
                    value={claim.bookingRef}
                    onChange={(e) => handleInputChange('bookingRef', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passengerToken">Passenger Token</Label>
                  <Input
                    id="passengerToken"
                    placeholder="PAX-A1B2C3"
                    value={claim.passengerToken}
                    onChange={(e) => handleInputChange('passengerToken', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flightNo">Flight Number</Label>
                  <Input
                    id="flightNo"
                    placeholder="BA123"
                    value={claim.flightNo}
                    onChange={(e) => handleInputChange('flightNo', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flightDate">Flight Date</Label>
                  <Input
                    id="flightDate"
                    type="date"
                    value={claim.flightDate}
                    onChange={(e) => handleInputChange('flightDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="productId">Product</Label>
                  <Select
                    value={claim.productId}
                    onValueChange={(value) => {
                      const product = products.find((p) => p.id === value);
                      handleInputChange('productId', value);
                      if (product) {
                        handleInputChange('productVersion', product.activeVersion);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="productVersion">Version</Label>
                  <div className="flex gap-2">
                    <Select
                      value={claim.productVersion}
                      onValueChange={(value) => handleInputChange('productVersion', value)}
                      disabled={!selectedProduct}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select version" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProduct?.versions.map((version) => (
                          <SelectItem key={version.version} value={version.version}>
                            {version.version} ({version.hash})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {claim.productId && (
                      <Button variant="outline" size="icon" asChild title="Edit versions">
                        <Link href={`/products/${claim.productId}/versions`}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleRunDecision}
                disabled={
                  isLoading ||
                  !claim.bookingRef ||
                  !claim.flightNo ||
                  !claim.flightDate ||
                  !claim.productId
                }
                data-testid="run-decision-button"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Running Decision...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Run Decision
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sample Claims</CardTitle>
              <CardDescription>
                Load pre-configured claims for testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="samples">
                  <AccordionTrigger data-testid="sample-claims-trigger">View {sampleClaims.length} sample claims</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {sampleClaims.map((sample) => (
                        <Button
                          key={sample.bookingRef}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => handleLoadSample(sample)}
                        >
                          <div>
                            <span className="font-medium">{sample.bookingRef}</span>
                            <span className="text-muted-foreground ml-2">
                              {sample.flightNo} on {sample.flightDate}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div>
          {decision ? (
            <DecisionResultCard decision={decision} />
          ) : (
            <Card className="h-full flex items-center justify-center min-h-[400px]">
              <div className="text-center text-muted-foreground">
                <svg
                  className="w-12 h-12 mx-auto mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
                <p className="text-lg font-medium">No decision yet</p>
                <p className="text-sm">Enter claim details and click &quot;Run Decision&quot;</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

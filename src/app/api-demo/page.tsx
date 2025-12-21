'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface APIResponse {
  success: boolean;
  decision?: {
    id: string;
    outcome: 'approved' | 'denied';
    payoutAmountUSD: number;
    reasonCodes: string[];
    productVersion: string;
    productHash: string;
    timestamp: string;
  };
  trace?: {
    id: string;
    rule: string;
    description: string;
    result: 'pass' | 'fail' | 'skip';
    explanation: string;
  }[];
  flightData?: {
    flightNo: string;
    status: string;
    delayMinutes: number;
    delayReason: string;
  };
  processingTimeMs: number;
  error?: string;
}

const examplePayloads = [
  {
    name: 'Approved - 3h Delay',
    payload: {
      bookingRef: 'BK-DEMO-001',
      flightNo: 'BA123',
      flightDate: '2024-12-20',
      passengerToken: 'pax-demo-123',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    },
  },
  {
    name: 'Denied - Force Majeure',
    payload: {
      bookingRef: 'BK-DEMO-002',
      flightNo: 'LH456',
      flightDate: '2024-12-18',
      passengerToken: 'pax-demo-456',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    },
  },
  {
    name: 'Approved - 6h Delay',
    payload: {
      bookingRef: 'BK-DEMO-003',
      flightNo: 'AA789',
      flightDate: '2024-12-19',
      passengerToken: 'pax-demo-789',
      productId: 'prod-eu-delay',
      productVersion: 'v1.2',
    },
  },
];

export default function APIDemoPage() {
  const [payload, setPayload] = useState(JSON.stringify(examplePayloads[0].payload, null, 2));
  const [response, setResponse] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const parsedPayload = JSON.parse(payload);
      const res = await fetch('/api/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload),
      });

      const data = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse JSON or send request');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExample = (index: number) => {
    setPayload(JSON.stringify(examplePayloads[index].payload, null, 2));
    setResponse(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" data-testid="api-demo-heading">API Demo</h1>
        <p className="text-muted-foreground">
          Test the Decision API with sample payloads - Integration Engineer reference
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Request</CardTitle>
              <CardDescription>POST /api/decision</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Quick Examples</Label>
                <div className="flex flex-wrap gap-2">
                  {examplePayloads.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => loadExample(index)}
                    >
                      {example.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="payload" className="mb-2 block">Request Body (JSON)</Label>
                <textarea
                  id="payload"
                  className="w-full h-64 p-3 font-mono text-sm border rounded-lg bg-muted"
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} disabled={isLoading} className="w-full" data-testid="send-request-button">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Send Request
                  </>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Endpoint</h4>
                <code className="block p-2 bg-muted rounded text-sm">POST /api/decision</code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Required Fields</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li><code>bookingRef</code> - Your booking reference</li>
                  <li><code>flightNo</code> - IATA flight number</li>
                  <li><code>flightDate</code> - YYYY-MM-DD format</li>
                  <li><code>passengerToken</code> - Passenger identifier</li>
                  <li><code>productId</code> - Product ID from catalog</li>
                  <li><code>productVersion</code> - Version string</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium mb-2">cURL Example</h4>
                <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
{`curl -X POST /api/decision \\
  -H "Content-Type: application/json" \\
  -d '{
    "bookingRef": "BK-12345",
    "flightNo": "BA123",
    "flightDate": "2024-12-20",
    "passengerToken": "pax-abc",
    "productId": "prod-eu-delay",
    "productVersion": "v1.2"
  }'`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Response Panel */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response</CardTitle>
              {response && (
                <div className="flex items-center gap-2">
                  <Badge className={response.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} data-testid="response-status">
                    {response.success ? 'Success' : 'Error'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {response.processingTimeMs}ms
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!response ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Send a request to see the response
                </div>
              ) : (
                <Tabs defaultValue="decision" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="decision">Decision</TabsTrigger>
                    <TabsTrigger value="trace">Trace</TabsTrigger>
                    <TabsTrigger value="raw">Raw JSON</TabsTrigger>
                  </TabsList>

                  <TabsContent value="decision">
                    {response.decision ? (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-lg ${response.decision.outcome === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-lg">
                              {response.decision.outcome.toUpperCase()}
                            </span>
                            {response.decision.outcome === 'approved' && (
                              <span className="text-2xl font-bold text-green-700">
                                ${response.decision.payoutAmountUSD}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Decision ID: {response.decision.id}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Reason Codes</p>
                            <p className="font-mono text-sm">{response.decision.reasonCodes.join(', ')}</p>
                          </div>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground">Product Hash</p>
                            <p className="font-mono text-sm">{response.decision.productHash}</p>
                          </div>
                        </div>

                        {response.flightData && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs text-muted-foreground mb-2">Flight Data</p>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>Status: <span className="font-medium">{response.flightData.status}</span></div>
                              <div>Delay: <span className="font-medium">{response.flightData.delayMinutes} min</span></div>
                              <div className="col-span-2">Reason: <span className="font-medium">{response.flightData.delayReason}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">Error</p>
                        <p className="text-sm text-red-700">{response.error}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="trace">
                    {response.trace ? (
                      <div className="space-y-2">
                        {response.trace.map((step, index) => (
                          <div
                            key={step.id}
                            className={`p-3 rounded-lg border ${
                              step.result === 'pass'
                                ? 'bg-green-50 border-green-200'
                                : step.result === 'fail'
                                  ? 'bg-red-50 border-red-200'
                                  : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">
                                Step {index + 1}
                              </span>
                              <Badge
                                className={
                                  step.result === 'pass'
                                    ? 'bg-green-100 text-green-800'
                                    : step.result === 'fail'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-gray-100 text-gray-800'
                                }
                              >
                                {step.result.toUpperCase()}
                              </Badge>
                              <span className="font-mono text-xs">{step.rule}</span>
                            </div>
                            <p className="text-sm font-medium">{step.description}</p>
                            <p className="text-sm text-muted-foreground">{step.explanation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No trace available</p>
                    )}
                  </TabsContent>

                  <TabsContent value="raw">
                    <pre className="p-3 bg-muted rounded-lg text-xs overflow-auto max-h-96">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Artifact</CardTitle>
              <CardDescription>Export decision for compliance records</CardDescription>
            </CardHeader>
            <CardContent>
              {response?.decision ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    const artifact = {
                      decision: response,
                      exportedAt: new Date().toISOString(),
                      exportedBy: 'API Demo',
                    };
                    const blob = new Blob([JSON.stringify(artifact, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audit-${response.decision?.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Audit JSON
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Submit a claim to generate an audit artifact
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

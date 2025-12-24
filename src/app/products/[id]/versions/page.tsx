'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  getTestPacks,
  runRegressionPack,
  RegressionRunSummary,
} from '@/lib/engine/regression-runner';
import { Product } from '@/lib/engine/types';

export default function VersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<RegressionRunSummary | null>(null);
  const testPacks = getTestPacks();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleRunTests = async () => {
    if (!product) return;

    setIsRunning(true);
    setTestResults(null);

    try {
      const pack = testPacks[0];
      const results = await runRegressionPack(pack, product.id, product.activeVersion);
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

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
          <span>Versions</span>
        </div>
        <h1 className="text-2xl font-semibold">Version History</h1>
        <p className="text-muted-foreground">
          View and compare past versions of {product.name}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Versions</CardTitle>
          <CardDescription>
            {product.versions.length} version(s) available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Version</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.versions.map((version) => (
                <TableRow key={version.version}>
                  <TableCell className="font-medium">
                    {version.version}
                    {version.version === product.activeVersion && (
                      <Badge className="ml-2 bg-blue-100 text-blue-800">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {version.hash}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        version.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {version.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(version.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {version.publishedAt
                      ? new Date(version.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {version.version !== product.activeVersion && (
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/products/${product.id}/versions/compare?from=${version.version}&to=${product.activeVersion}`}
                          >
                            Compare with Active
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regression Test Pack</CardTitle>
          <CardDescription>
            Run automated tests against this product&apos;s versions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Test Pack: {testPacks[0].name}</p>
              <p className="text-sm text-muted-foreground">
                {testPacks[0].testCases.length} test cases covering all payout tiers and exclusion scenarios
              </p>
            </div>
            <Button onClick={handleRunTests} disabled={isRunning}>
              {isRunning ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
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
                  Running...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Run Tests
                </>
              )}
            </Button>
          </div>

          {testResults && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{testResults.totalTests}</p>
                  <p className="text-sm text-muted-foreground">Total Tests</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{testResults.passed}</p>
                  <p className="text-sm text-muted-foreground">Passed</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${testResults.failed > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className={`text-2xl font-bold ${testResults.failed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {testResults.failed}
                  </p>
                  <p className="text-sm text-muted-foreground">Failed</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Case</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead>Actual</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testResults.results.map((result) => (
                    <TableRow key={result.testCase.id}>
                      <TableCell className="font-medium">{result.testCase.name}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {result.testCase.expectedOutcome} / ${result.testCase.expectedPayout}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {result.actualOutcome} / ${result.actualPayout}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            result.passed
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {result.passed ? 'PASS' : 'FAIL'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {result.diff ? (
                          <span className="text-sm text-red-600">{result.diff}</span>
                        ) : (
                          <span className="text-sm text-green-600">✓</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

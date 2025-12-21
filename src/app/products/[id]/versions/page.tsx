'use client';

import { use } from 'react';
import Link from 'next/link';
import { getProductById } from '@/lib/data/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function VersionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);

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
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/products/${product.id}/versions/compare?from=${
                            product.versions[product.versions.indexOf(version) + 1]
                              ?.version || version.version
                          }&to=${version.version}`}
                        >
                          Compare
                        </Link>
                      </Button>
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
            Run automated tests against this product's versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Test Pack: Flight Delay Standard</p>
              <p className="text-sm text-muted-foreground">
                25 test cases covering all payout tiers and exclusion scenarios
              </p>
            </div>
            <Button>
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
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

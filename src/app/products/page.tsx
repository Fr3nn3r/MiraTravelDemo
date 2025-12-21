'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/data/products';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Product, ProductStatus } from '@/lib/engine/types';

function StatusBadge({ status }: { status: ProductStatus }) {
  const variants: Record<ProductStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
    draft: { label: 'Draft', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
    archived: { label: 'Archived', className: 'bg-gray-100 text-gray-800 hover:bg-gray-100' },
  };

  const { label, className } = variants[status];
  return <Badge className={className}>{label}</Badge>;
}

function ProductCard({ product }: { product: Product }) {
  const lastUpdated = new Date(product.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{product.name}</CardTitle>
            <CardDescription className="mt-1">{product.description}</CardDescription>
          </div>
          <StatusBadge status={product.status} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-4">
            <span>
              Version: <span className="font-medium text-foreground">{product.activeVersion}</span>
            </span>
            <span>Updated: {lastUpdated}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href={`/products/${product.id}`}>Configure</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/products/${product.id}/versions`}>Versions</Link>
          </Button>
          <Button variant="outline" size="sm">
            Duplicate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductsPage() {
  const [filter, setFilter] = useState<'all' | ProductStatus>('all');
  const products = getAllProducts();

  const filteredProducts =
    filter === 'all' ? products : products.filter((p) => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-muted-foreground">
            Manage parametric insurance products and their configurations
          </p>
        </div>
        <Button>
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          New from Template
        </Button>
      </div>

      <div className="flex gap-2">
        {(['all', 'active', 'draft', 'archived'] as const).map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No products found with status "{filter}"
        </div>
      )}
    </div>
  );
}

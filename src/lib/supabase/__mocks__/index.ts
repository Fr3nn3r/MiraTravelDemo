// Mock Supabase module for tests - uses in-memory product data
import { products } from '@/lib/data/products';
import type { Product } from '@/lib/engine/types';

export async function getProductById(id: string): Promise<Product | null> {
  const product = products.find((p) => p.id === id);
  return product || null;
}

export async function getAllProducts(): Promise<Product[]> {
  return [...products];
}

export async function getActiveProducts(): Promise<Product[]> {
  return products.filter((p) => p.status === 'active');
}

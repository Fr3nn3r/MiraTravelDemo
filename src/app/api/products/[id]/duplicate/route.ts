import { NextRequest, NextResponse } from 'next/server';
import { duplicateProduct } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const newProduct = await duplicateProduct(id);
    if (!newProduct) {
      return NextResponse.json(
        { success: false, error: 'Failed to duplicate product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error duplicating product:', error);
    const message = error instanceof Error ? error.message : 'Failed to duplicate product';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

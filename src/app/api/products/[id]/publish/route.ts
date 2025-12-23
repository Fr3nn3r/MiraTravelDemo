import { NextRequest, NextResponse } from 'next/server';
import { getProductById, publishVersion } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: version' },
        { status: 400 }
      );
    }

    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const versionExists = product.versions.find((v) => v.version === version);
    if (!versionExists) {
      return NextResponse.json(
        { success: false, error: `Version ${version} not found` },
        { status: 404 }
      );
    }

    const success = await publishVersion(id, version);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Failed to publish version' },
        { status: 500 }
      );
    }

    const updatedProduct = await getProductById(id);
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error publishing version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish version' },
      { status: 500 }
    );
  }
}

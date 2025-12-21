import { NextRequest, NextResponse } from 'next/server';
import { getProductById, createNewVersion, publishVersion } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { config, publish = false } = body;

    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: config' },
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

    const version = await createNewVersion(id, config, publish);
    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Failed to create version' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, version }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create version' },
      { status: 500 }
    );
  }
}

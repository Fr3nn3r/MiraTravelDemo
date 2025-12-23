import { NextRequest, NextResponse } from 'next/server';
import {
  getAllProducts,
  createProductFromTemplate,
  getProductTemplates,
} from '@/lib/supabase';

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, name, description } = body;

    if (!templateId || !name || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: templateId, name, description' },
        { status: 400 }
      );
    }

    const templates = getProductTemplates();
    if (!templates.find((t) => t.id === templateId)) {
      return NextResponse.json(
        { success: false, error: `Template ${templateId} not found` },
        { status: 404 }
      );
    }

    const product = await createProductFromTemplate(templateId, name, description);
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

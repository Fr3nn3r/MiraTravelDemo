import { NextResponse } from 'next/server';
import { getProductTemplates } from '@/lib/supabase';

export async function GET() {
  const templates = getProductTemplates();
  return NextResponse.json({ success: true, templates });
}

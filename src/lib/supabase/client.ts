import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

let supabaseInstance: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// Lazy-initialized Supabase client - use this getter to avoid module-load errors in tests
export { getSupabaseClient };

// For backwards compatibility, export a proxy that lazily initializes
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient<Database>];
  },
});

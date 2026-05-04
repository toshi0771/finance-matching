import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/** Supabase client authenticated with a Clerk session token (Third-Party Auth). */
export function createAuthClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
}

/** Service-role client — bypasses RLS. Server-side use only. */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

export type FinanceCompany = {
  id: string;
  name: string;
  area_code: string | null;
  lat: number | null;
  lng: number | null;
  description: string | null;
  show_reviews: boolean;
  is_active: boolean;
  company_categories: { category: string }[];
};

export type Review = {
  id: string;
  comment: string | null;
  created_at: string;
};

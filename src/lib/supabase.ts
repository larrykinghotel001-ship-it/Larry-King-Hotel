import { createClient } from '@supabase/supabase-js';

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return 'https://mlhpaboepwxyreccvqdk.supabase.co';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mlhpaboepwxyreccvqdk.supabase.co';
const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseAnonKey = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saHBhYm9lcHd4eXJlY2N2cWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMDc5NzQsImV4cCI6MjEwNzc4Mzk3NH0.6vYC1VpVSp4w8sBUMEqSuVb14piIKcc7lc8Bx03vjvU'
).trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

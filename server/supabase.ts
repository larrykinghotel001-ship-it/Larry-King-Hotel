import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

function normalizeSupabaseUrl(url?: string): string {
  if (!url) return 'https://mlhpaboepwxyreccvqdk.supabase.co';
  return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
}

const rawUrl = process.env.SUPABASE_URL || 'https://mlhpaboepwxyreccvqdk.supabase.co';
const supabaseUrl = normalizeSupabaseUrl(rawUrl);
const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saHBhYm9lcHd4eXJlY2N2cWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyMDc5NzQsImV4cCI6MjEwNzc4Mzk3NH0.6vYC1VpVSp4w8sBUMEqSuVb14piIKcc7lc8Bx03vjvU'
).trim();

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export const isSupabaseConnected = Boolean(supabaseUrl && supabaseKey);

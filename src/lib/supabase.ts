import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Helper function to get current user profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) throw error;
  return data;
}

// Helper function to check user role
export async function hasRole(role: 'manager' | 'dispatcher' | 'admin'): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === role;
}

// Helper function to check if user is manager or admin
export async function isManagerOrAdmin(): Promise<boolean> {
  const profile = await getCurrentUserProfile();
  return profile?.role === 'manager' || profile?.role === 'admin';
}

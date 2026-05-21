import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const authRedirectUrl = (import.meta.env.VITE_AUTH_REDIRECT_URL as string | undefined) || window.location.origin;
export const isPreviewModeAvailable = !isSupabaseConfigured || import.meta.env.VITE_ENABLE_PREVIEW_MODE !== 'false';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;



import { createClient } from '@supabase/supabase-js';

export const oauthCallbackErrorMessage = (() => {
  if (typeof window === 'undefined') return '';

  const queryParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const oauthError = queryParams.get('error') || hashParams.get('error');
  if (!oauthError) return '';

  const errorDescription = queryParams.get('error_description') || hashParams.get('error_description') || '';
  return /unable to exchange external code/i.test(errorDescription)
    ? 'Google sign-in failed while Supabase was exchanging the authorization code. Verify that the Google Client ID and Client Secret belong to the same OAuth web client, then try again.'
    : 'Google sign-in did not complete. Please try again.';
})();

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
export const PROJECT_IMAGES_BUCKET = 'portfolio-project-images';

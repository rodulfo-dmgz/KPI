/**
 * DASHBOA_RD — Supabase Client
 * Dépendance : supabase-js CDN chargé avant ce fichier dans le HTML
 */
const { createClient } = supabase;

if (!window.ENV?.SUPABASE_URL || !window.ENV?.SUPABASE_ANON_KEY) {
  console.error('[Supabase] ENV non défini. Vérifiez env.js');
}

const supabaseClient = createClient(
  window.ENV.SUPABASE_URL,
  window.ENV.SUPABASE_ANON_KEY
);

export default supabaseClient;

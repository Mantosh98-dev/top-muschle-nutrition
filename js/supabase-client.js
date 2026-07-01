import CONFIG from './config.js';

let supabaseUrl = CONFIG.SUPABASE_URL || localStorage.getItem('SUPABASE_URL') || '';
let supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY || localStorage.getItem('SUPABASE_ANON_KEY') || '';

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  supabaseUrl = url;
  supabaseAnonKey = key;
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }
}

export function clearSupabaseConfig() {
  localStorage.removeItem('SUPABASE_URL');
  localStorage.removeItem('SUPABASE_ANON_KEY');
  supabaseUrl = CONFIG.SUPABASE_URL || '';
  supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY || '';
  if (window.supabase && supabaseUrl && supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  } else {
    supabaseClient = null;
  }
}

export let supabaseClient = null;

if (window.supabase) {
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
  }
} else {
  // If Supabase CDN hasn't loaded yet, try to initialize it after a short delay or on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    if (window.supabase && supabaseUrl && supabaseAnonKey) {
      supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    }
  });
}

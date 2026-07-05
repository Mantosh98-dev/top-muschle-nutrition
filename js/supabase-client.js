import CONFIG from './config.js';

let supabaseUrl = localStorage.getItem('SUPABASE_URL') || CONFIG.SUPABASE_URL || '';
let supabaseAnonKey = localStorage.getItem('SUPABASE_ANON_KEY') || CONFIG.SUPABASE_ANON_KEY || '';

export function isSupabaseConfigured() {
  return !!(supabaseUrl && supabaseAnonKey);
}

let resolveReady;
export const clientReady = new Promise((resolve) => {
  resolveReady = resolve;
});

export let supabaseClient = null;

function tryInitialize() {
  if (supabaseClient) return true;
  if (window.supabase && supabaseUrl && supabaseAnonKey) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    resolveReady(supabaseClient);
    return true;
  }
  return false;
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem('SUPABASE_URL', url);
  localStorage.setItem('SUPABASE_ANON_KEY', key);
  supabaseUrl = url;
  supabaseAnonKey = key;
  if (window.supabase) {
    supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    resolveReady(supabaseClient);
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

// Try initializing immediately
tryInitialize();

// Also try on DOMContentLoaded
document.addEventListener('DOMContentLoaded', tryInitialize);

// Poll every 50ms in case the Supabase script is still loading asynchronously
if (!supabaseClient && supabaseUrl && supabaseAnonKey) {
  const interval = setInterval(() => {
    if (tryInitialize()) {
      clearInterval(interval);
    }
  }, 50);
  
  // Clean up interval after 5 seconds to avoid infinite loop
  setTimeout(() => clearInterval(interval), 5000);
}


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

// Credenciais fornecidas pelo usuário
const DEFAULT_URL = 'https://ujpeznugsqwcwbnsorzx.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqcGV6bnVnc3F3Y3dibnNvcnp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjk4MDUsImV4cCI6MjA4MjcwNTgwNX0.2Z2b-lT66hhMCf-sasDRa7NAA6ku-PA1iSIvPhhhSH0';

const getEnv = (key: string) => {
  try {
    return typeof process !== 'undefined' ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY') || DEFAULT_KEY;

// Exporta flag para checagem na UI
export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

// Inicializa o cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

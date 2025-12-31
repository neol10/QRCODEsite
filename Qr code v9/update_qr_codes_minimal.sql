-- SQL mínimo para QR Codes dinâmicos funcionarem
-- Execute no Supabase SQL Editor

-- Adicionar campos essenciais na tabela qr_codes
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false;
ALTER TABLE qr_codes ADD COLUMN IF NOT EXISTS short_code TEXT;

-- Criar tabela redirects básica
CREATE TABLE IF NOT EXISTS redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

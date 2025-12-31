-- SQL simplificado para Supabase
-- Execute cada comando separadamente se necessário

-- 1. Adicionar campos na tabela qr_codes (execute um por um se der erro)
ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS is_dynamic BOOLEAN DEFAULT false;

ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS short_code TEXT;

ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS logo_size INTEGER DEFAULT 20;

ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS created_location TEXT;

ALTER TABLE qr_codes 
ADD COLUMN IF NOT EXISTS created_device TEXT;

-- 2. Criar tabela redirects
CREATE TABLE IF NOT EXISTS redirects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  short_code TEXT NOT NULL,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices (se necessário)
CREATE INDEX IF NOT EXISTS idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX IF NOT EXISTS idx_redirects_short_code ON redirects(short_code);

-- 4. Adicionar constraint unique para short_code (se necessário)
-- ALTER TABLE qr_codes ADD CONSTRAINT qr_codes_short_code_unique UNIQUE (short_code);

-- Adicionar campos para QR Codes dinâmicos e logos
ALTER TABLE qr_codes ADD COLUMN is_dynamic BOOLEAN DEFAULT false;
ALTER TABLE qr_codes ADD COLUMN short_code TEXT UNIQUE;
ALTER TABLE qr_codes ADD COLUMN logo_url TEXT;
ALTER TABLE qr_codes ADD COLUMN logo_size INTEGER DEFAULT 20;
ALTER TABLE qr_codes ADD COLUMN created_location TEXT;
ALTER TABLE qr_codes ADD COLUMN created_device TEXT;

-- Criar tabela redirects para QR Codes dinâmicos
CREATE TABLE IF NOT EXISTS redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_code TEXT NOT NULL,
  qr_code_id UUID NOT NULL REFERENCES qr_codes(id) ON DELETE CASCADE,
  destination_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_redirects_short_code ON redirects(short_code);
CREATE INDEX idx_redirects_qr_code_id ON redirects(qr_code_id);

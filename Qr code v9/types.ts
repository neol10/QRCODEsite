
export type ViewState = 'landing' | 'analytics' | 'generator' | 'leads' | 'settings' | 'auth' | 'capture' | 'admin_dashboard';

export interface Profile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  avatar_seed: string;
  email_notifications: boolean;
  created_at: string;
}

export interface QRCode {
  id: string;
  user_id: string;
  name: string;
  url: string;
  campaign_name: string;
  fg_color: string;
  bg_color: string;
  type: 'static' | 'dynamic';
  is_active: boolean;
  created_at: string;
  // Novos campos para rastreio de origem solicitado
  created_location?: string;
  created_device?: string;
  // Campos para logo personalizado no QR Code
  logo_url?: string;
  logo_size?: number;
  // Campos para QR Codes dinâmicos
  is_dynamic?: boolean;
  short_code?: string;
}

export interface Lead {
  id: string;
  qr_code_id: string | null;
  name: string;
  email: string;
  city: string;
  state: string;
  device: string;
  created_at: string;
}

export interface Scan {
  id: string;
  qr_code_id: string;
  campaign_name: string;
  city: string;
  state: string;
  device: string;
  scanned_at: string;
}

export interface MailResponse {
  success: boolean;
  message?: string;
  needsActivation?: boolean;
}

export interface Redirect {
  id: string;
  short_code: string;
  qr_code_id: string;
  destination_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

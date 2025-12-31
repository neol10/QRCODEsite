
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { QRCode, Lead, Scan } from '../types';

export function useSupabaseSync(userId: string | undefined) {
  const [isSyncing, setIsSyncing] = useState(false);

  const migrateLocalData = useCallback(async () => {
    if (!userId || !supabase) return;
    setIsSyncing(true);

    try {
      const localQRs = JSON.parse(localStorage.getItem('qr_tracker_qrcodes') || '[]');
      if (localQRs.length > 0) {
        const qrUpdates = localQRs.map((qr: any) => ({
          id: qr.id,
          user_id: userId,
          name: qr.name || qr.campaign_name || 'QR Importado',
          url: qr.url,
          campaign_name: qr.campaign_name || '',
          fg_color: qr.fg_color || '#000000',
          bg_color: qr.bg_color || '#ffffff',
          type: qr.type || 'static',
          is_active: qr.is_active !== undefined ? qr.is_active : true,
          created_at: qr.created_at || new Date().toISOString()
        }));
        await supabase.from('qr_codes').upsert(qrUpdates);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [userId]);

  return { migrateLocalData, isSyncing };
}

export function useSupabaseData(userId: string | undefined, isAdmin: boolean) {
  const [data, setData] = useState<{ qrs: QRCode[], leads: Lead[], scans: Scan[] }>({ qrs: [], leads: [], scans: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!userId || !supabase) return;
    setLoading(true);

    try {
      const { data: qrs } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      const qrIds = qrs?.map(q => q.id) || [];

      const scanQuery = isAdmin 
        ? supabase.from('scans').select('*') 
        : supabase.from('scans').select('*').in('qr_code_id', qrIds);
      
      const { data: scans } = await scanQuery.order('scanned_at', { ascending: false });

      const leadQuery = isAdmin 
        ? supabase.from('leads').select('*') 
        : supabase.from('leads').select('*').in('qr_code_id', qrIds);
      
      const { data: leads } = await leadQuery.order('created_at', { ascending: false });

      setData({ 
        qrs: qrs || [], 
        leads: leads || [], 
        scans: scans || [] 
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, refresh: fetchData };
}

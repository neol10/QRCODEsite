import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { QrCode, Users, MapPin, Smartphone, Laptop, Calendar, TrendingUp, Target, Inbox, Edit2, Zap } from 'lucide-react';
import { Scan, QRCode as QRCodeType } from '../types';
import { useNeoTranslation } from '../hooks/useTranslation';
import { supabase } from '../lib/supabase';
import QRCodeEditor from '../components/QRCodeEditor';

interface AnalyticsProps {
  scans: Scan[];
  leadsCount: number;
  isAdmin: boolean;
}

const Analytics: React.FC<AnalyticsProps> = ({ scans, leadsCount, isAdmin }) => {
  const { t } = useNeoTranslation();
  const [qrCodes, setQrCodes] = useState<QRCodeType[]>([]);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeType | null>(null);
  const [loadingQrCodes, setLoadingQrCodes] = useState(false);

  // Carregar QR Codes do usuário
  useEffect(() => {
    const loadQrCodes = async () => {
      setLoadingQrCodes(true);
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) return;
        
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('user_id', session.session.user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setQrCodes(data || []);
      } catch (error) {
        console.error('Erro ao carregar QR Codes:', error);
      } finally {
        setLoadingQrCodes(false);
      }
    };
    
    loadQrCodes();
  }, []);

  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }).reverse();

    const counts = scans.reduce((acc: Record<string, number>, scan) => {
      const date = new Date(scan.scanned_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return last7Days.map(date => ({
      date,
      scans: counts[date] || 0
    }));
  }, [scans]);

  const deviceData = useMemo(() => {
    const counts = scans.reduce((acc: Record<string, number>, scan) => {
      const device = scan.device === 'mobile' ? 'Mobile' : 'Desktop';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([device, value]) => ({ device, value }));
  }, [scans]);

  const engagementScore = useMemo(() => {
    if (scans.length === 0) return 0;
    const uniqueDays = new Set(scans.map(s => new Date(s.scanned_at).toDateString())).size;
    return Math.min(100, Math.round((uniqueDays / 7) * 100));
  }, [scans]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('analytics.title')}</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Neural Analytics Hub</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#1A2F2C] border border-white/5 rounded-[32px] p-6 space-y-2">
          <div className="flex items-center gap-2">
            <QrCode className="text-cyan-400" size={16} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Scans</p>
          </div>
          <p className="text-3xl font-black italic text-white tracking-tighter">{scans.length}</p>
        </div>
        <div className="bg-[#1A2F2C] border border-white/5 rounded-[32px] p-6 space-y-2">
          <div className="flex items-center gap-2">
            <Users className="text-cyan-400" size={16} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Base de Leads</p>
          </div>
          <p className="text-3xl font-black italic text-white tracking-tighter">{leadsCount}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-[#1A2F2C] border border-white/5 rounded-[32px] p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Scans Timeline</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2F2C" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A2F2C', 
                  border: '1px solid rgba(34,211,238,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Area type="monotone" dataKey="scans" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#1A2F2C] border border-white/5 rounded-[32px] p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill="#22d3ee" />
                <Cell fill="#a855f7" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Live Feed */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Live Feed</h3>
          {scans.length > 0 && <span className="text-[9px] font-bold text-cyan-400/50 uppercase">Mostrando últimos 5</span>}
        </div>
        <div className="space-y-2">
          {scans.length > 0 ? scans.slice(0, 5).map((scan, idx) => (
            <div key={scan.id} className="flex items-center justify-between bg-[#1A2F2C]/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 animate-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                   <MapPin size={18} className="text-zinc-500" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white uppercase tracking-tight">{scan.campaign_name || 'Generic Scan'}</h4>
                  <p className="text-[10px] text-zinc-500 font-medium">
                    {scan.city}, {scan.state}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-tighter">{new Date(scan.scanned_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                {scan.device === 'mobile' ? <Smartphone size={12} className="text-zinc-700" /> : <Laptop size={12} className="text-zinc-700" />}
              </div>
            </div>
          )) : (
            <div className="bg-[#1A2F2C] p-12 rounded-[32px] border border-dashed border-white/5 text-center flex flex-col items-center gap-4">
               <div className="p-4 bg-white/5 rounded-full"><Inbox className="text-zinc-700" size={32} /></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Frequência Limpa. Aguardando Transmissão...</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Codes Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">QR Codes Ativos</h3>
        <div className="space-y-2">
          {loadingQrCodes ? (
            // Loading skeleton
            [...Array(3)].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between bg-[#1A2F2C]/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse" />
                  <div className="space-y-1">
                    <div className="w-24 h-3 bg-zinc-800 rounded animate-pulse" />
                    <div className="w-16 h-2 bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-zinc-800 rounded-xl animate-pulse" />
              </div>
            ))
          ) : qrCodes.length > 0 ? (
            qrCodes.map((qrCode, idx) => (
              <div key={qrCode.id} className="flex items-center justify-between bg-[#1A2F2C]/50 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                    <QrCode size={18} className="text-zinc-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white uppercase tracking-tight">{qrCode.name}</h4>
                    <div className="flex items-center gap-2">
                      {qrCode.is_dynamic && (
                        <span className="text-[8px] font-black bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Zap size={8} />
                          Dinâmico
                        </span>
                      )}
                      <span className="text-[9px] text-zinc-500">
                        {qrCode.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                {qrCode.is_dynamic && (
                  <button
                    onClick={() => setSelectedQRCode(qrCode)}
                    className="p-2 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-xl transition-colors group"
                  >
                    <Edit2 size={14} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#1A2F2C] p-8 rounded-[32px] border border-dashed border-white/5 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">Nenhum QR Code criado ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      {selectedQRCode && (
        <QRCodeEditor
          qrCode={selectedQRCode}
          onClose={() => setSelectedQRCode(null)}
          onUpdate={async () => {
            // Recarregar QR Codes após edição
            try {
              const { data: session } = await supabase.auth.getSession();
              if (!session?.session?.user) return;
              
              const { data, error } = await supabase
                .from('qr_codes')
                .select('*')
                .eq('user_id', session.session.user.id)
                .order('created_at', { ascending: false });
                
              if (error) throw error;
              setQrCodes(data || []);
            } catch (error) {
              console.error('Erro ao recarregar QR Codes:', error);
            }
            setSelectedQRCode(null);
          }}
        />
      )}
    </div>
  );
};

export default Analytics;

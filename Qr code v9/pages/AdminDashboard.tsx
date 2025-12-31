
import React, { useState, useEffect } from 'react';
import { 
  Users, QrCode, Activity, Search, 
  ShieldCheck, RefreshCw, Loader2, 
  Lock, ExternalLink, Globe, User, MapPin, Smartphone, Laptop, Database, AlertCircle, Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile, QRCode } from '../types';
import { toast } from 'react-hot-toast';
import { useNeoTranslation } from '../hooks/useTranslation';

const AdminDashboard: React.FC = () => {
  const { t } = useNeoTranslation();
  console.log("ADMIN_DEBUG: Component rendered");
  const [users, setUsers] = useState<Profile[]>([]);
  const [globalQrs, setGlobalQrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'qrs'>('users');
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQrs: 0,
    totalScans: 0
  });

  const fetchGlobalData = async () => {
    setLoading(true);
    console.log("ADMIN_DEBUG: fetchGlobalData iniciada");
    setError(null);
    try {
      // Busca perfis - se falhar aqui, provavelmente as tabelas não existem
      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (pError) throw pError;

      // Busca QRs com join no profile
      const { data: qrs, error: qError } = await supabase
        .from('qr_codes')
        .select('*, profiles(name, email)')
        .order('created_at', { ascending: false });

      if (qError) throw qError;

      // Busca contagem de scans
      const { count: sCount, error: sError } = await supabase
        .from('scans')
        .select('*', { count: 'exact', head: true });

      setUsers(profiles || []);
      setGlobalQrs(qrs || []);
      
      setStats({
        totalUsers: profiles?.length || 0,
        totalQrs: qrs?.length || 0,
        totalScans: sCount || 0
      });
      console.log("ADMIN_DEBUG: Dados carregados com sucesso");
    } catch (err: any) {
      console.error('Erro no Mainframe:', err);
      console.log("ADMIN_DEBUG: Erro ao buscar dados:", err.message, "Code:", err.code);
      setError(err.message || "Falha na conexão com o banco de dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const getProfileData = (q: any) => {
    if (!q.profiles) return { name: 'Usuário Deletado', email: 'N/A' };
    if (Array.isArray(q.profiles)) return q.profiles[0] || { name: 'Usuário Deletado', email: 'N/A' };
    return q.profiles;
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredQrs = globalQrs.filter(q => {
    const profile = getProfileData(q);
    return (
      (q.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (profile.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  console.log("ADMIN_DEBUG: Renderizando dashboard - loading:", loading, "error:", error, "users:", users.length);
  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#060E0D] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <AlertCircle className="text-red-500" size={40} />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Erro de Sistema</h2>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto leading-relaxed">
            As tabelas do banco de dados não foram detectadas ou você não tem permissão de Admin.
          </p>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-[10px] font-mono text-zinc-500 break-all max-w-xs mx-auto">
            {error}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <button onClick={fetchGlobalData} className="bg-white text-black font-black px-10 py-4 rounded-2xl hover:bg-zinc-200 transition-all uppercase text-xs tracking-widest">
            Tentar Reconexão
          </button>
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Verifique o SQL Editor no Supabase</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#060E0D] pt-32 px-4 md:px-12 pb-24 selection:bg-purple-500/30">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="bg-purple-500/10 p-3 rounded-2xl border border-purple-500/20">
                <ShieldCheck className="text-purple-500" size={32} />
             </div>
             <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white">OVERSEER</h1>
          </div>
          <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.5em] opacity-80 ml-1">Central de Inteligência NeoQrC</p>
        </div>
        <button 
          onClick={fetchGlobalData} 
          disabled={loading}
          className="bg-[#1A0D15] border border-purple-500/30 px-8 py-4 rounded-2xl flex items-center gap-4 hover:bg-purple-500/20 transition-all group disabled:opacity-50"
        >
          <RefreshCw size={20} className={`${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} text-purple-400`} />
          <span className="text-xs font-black uppercase tracking-widest text-white">Sincronizar</span>
        </button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Usuários', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
          { label: 'QRs no Sistema', value: stats.totalQrs, icon: QrCode, color: 'text-purple-400' },
          { label: 'Interações Globais', value: stats.totalScans, icon: Activity, color: 'text-cyan-400' }
        ].map((stat, i) => (
          <div key={i} className="bg-[#1A0D15]/40 border border-purple-500/10 p-8 rounded-[32px] relative overflow-hidden group hover:border-purple-500/30 transition-all shadow-xl">
            <stat.icon size={80} className={`absolute -right-4 -bottom-4 opacity-5 ${stat.color} group-hover:scale-110 group-hover:opacity-10 transition-all duration-700`} />
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
            <p className="text-4xl font-black italic text-white tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
        <div className="flex p-1.5 bg-[#1A0D15]/60 border border-white/5 rounded-2xl w-full md:w-fit">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Usuários
          </button>
          <button 
            onClick={() => setActiveTab('qrs')}
            className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === 'qrs' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-zinc-500 hover:text-white'}`}
          >
            Rastreio Global
          </button>
        </div>

        <div className="relative w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Procurar nos registros..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A0D15] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white outline-none focus:border-purple-500/50 transition-all placeholder:text-zinc-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-32 flex flex-col items-center gap-6 animate-pulse">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase text-zinc-600 tracking-[0.4em]">Decodificando Database...</p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-700">
          {activeTab === 'users' ? (
            users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map(u => (
                  <div key={u.id} className="bg-[#1A0D15]/30 border border-white/5 p-6 rounded-[32px] flex items-center justify-between hover:bg-[#1A0D15]/50 hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
                        <User size={24} className="text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg tracking-tight">{u.name || 'Identidade Oculta'}</h4>
                        <p className="text-xs text-zinc-600 font-medium">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {u.is_admin ? (
                        <span className="text-[8px] font-black bg-purple-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-purple-500/20">Overseer</span>
                      ) : (
                        <span className="text-[8px] font-black bg-white/5 text-zinc-500 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">Membro</span>
                      )}
                      <span className="text-[8px] text-zinc-800 font-mono">ID: {u.id.substring(0,8)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState message="Nenhum usuário detectado no mainframe." />
          ) : (
            globalQrs.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredQrs.map(q => {
                  const profile = getProfileData(q);
                  return (
                    <div key={q.id} className="bg-[#1A0D15]/30 border border-white/5 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-[#1A0D15]/50 hover:border-purple-500/20 transition-all">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 bg-black/40 rounded-2xl p-2 border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <QrCode size={40} className="text-purple-500/50" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-white text-xl tracking-tighter uppercase italic">{q.name}</h4>
                            <span className="text-[8px] font-black bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20 uppercase">
                              {q.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                              <User size={10} className="text-zinc-600" />
                              <span className="text-[9px] font-black text-white uppercase tracking-tighter opacity-60">{profile.name || profile.email}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-purple-500/5 px-2 py-1 rounded-lg border border-purple-500/10">
                              <MapPin size={10} className="text-purple-400" />
                              <span className="text-[8px] font-black text-zinc-400 uppercase">{q.created_location || 'Geo-Locked'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {q.created_device === 'mobile' ? <Smartphone size={10} className="text-zinc-600" /> : <Laptop size={10} className="text-zinc-600" />}
                              <span className="text-[8px] font-black text-zinc-600 uppercase">{q.created_device || 'System'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Registrado em</p>
                          <p className="text-xs font-mono text-zinc-500">{new Date(q.created_at).toLocaleDateString()}</p>
                        </div>
                        <a 
                          href={q.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="bg-white/5 hover:bg-purple-600 text-zinc-500 hover:text-white p-4 rounded-2xl transition-all active:scale-95 border border-white/5"
                        >
                          <ExternalLink size={20} />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState message="Zero QR Codes gerados no sistema." />
          )}
        </div>
      )}
      
      {/* Informational Toast simulation */}
      {!loading && stats.totalUsers > 0 && stats.totalUsers === users.filter(u => u.is_admin).length && (
         <div className="mt-12 bg-purple-500/5 border border-purple-500/10 p-6 rounded-[32px] flex items-start gap-4 animate-in slide-in-from-bottom-4">
            <Info size={20} className="text-purple-500 mt-1 flex-shrink-0" />
            <div className="space-y-1">
               <p className="text-xs font-black text-white uppercase tracking-tight">Status de Overseer Detectado</p>
               <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">
                  Você está visualizando o mainframe global. Como as tabelas foram reiniciadas recentemente, apenas usuários administradores ativos aparecem na lista. Novos registros de QR Code aparecerão aqui em tempo real.
               </p>
            </div>
         </div>
      )}
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="py-32 flex flex-col items-center justify-center bg-[#1A0D15]/20 border border-dashed border-white/5 rounded-[40px] gap-6 text-center">
    <div className="p-6 bg-white/5 rounded-full">
      <Database size={40} className="text-zinc-800" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-black uppercase text-zinc-700 tracking-widest">Database Vazio</p>
      <p className="text-[10px] font-bold text-zinc-800 uppercase max-w-xs">{message}</p>
    </div>
  </div>
);

export default AdminDashboard;

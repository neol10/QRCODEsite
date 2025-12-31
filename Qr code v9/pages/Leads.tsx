
import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Download, Smartphone, Laptop, 
  UserX, ShieldCheck, Database, Filter, 
  Calendar, MoreVertical, Zap, CheckCircle2, Clock
} from 'lucide-react';
import { Lead } from '../types';
import { toast } from 'react-hot-toast';

interface LeadsProps {
  leads: Lead[];
  isAdmin: boolean;
}

const Leads: React.FC<LeadsProps> = ({ leads, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.city.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const handleExportCSV = () => {
    if (leads.length === 0) return;
    
    try {
      const csv = "Nome,Email,Cidade,Estado,Dispositivo,Data\n" + 
        leads.map(l => `${l.name},${l.email},${l.city},${l.state},${l.device},${l.created_at}`).join("\n");
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `neoqrc-database-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Database exportado com sucesso!', {
        icon: '📊',
        style: { background: '#1A2F2C', color: '#fff', border: '1px solid rgba(34,211,238,0.2)' }
      });
    } catch (e) {
      toast.error('Falha na exportação do database.');
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-700">
      {/* Header Section */}
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
            <Database className="text-cyan-400" size={28} />
            Neural Database
          </h1>
          <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em] mt-1 ml-1">
            {leads.length} Records Detected
          </p>
        </div>
        {isAdmin && (
          <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
            <ShieldCheck size={12} className="text-cyan-400" />
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Admin Access</span>
          </div>
        )}
      </header>

      {/* Toolbar Section */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <input
            type="text"
            placeholder="Query user identifier or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A2F2C] border border-white/10 rounded-[20px] py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-cyan-400/50 transition-all text-white placeholder:text-zinc-700 font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400 transition-colors" size={18} />
        </div>
        
        <button 
          onClick={handleExportCSV}
          disabled={leads.length === 0}
          className="bg-[#1A2F2C] border border-white/10 hover:border-cyan-500/30 text-white p-4 rounded-[20px] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-20 group"
        >
          <Download size={18} className="text-zinc-500 group-hover:text-cyan-400 transition-colors" />
          <span className="text-[10px] font-black uppercase tracking-widest">Export CSV</span>
        </button>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1A2F2C] p-4 rounded-[24px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-5">
            <Zap size={40} className="text-cyan-400" />
          </div>
          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Capture Rate</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black italic text-white">High</p>
            <span className="text-[10px] text-emerald-400 font-bold">Stable</span>
          </div>
        </div>
        <div className="bg-[#1A2F2C] p-4 rounded-[24px] border border-white/5 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-2 opacity-5">
            <CheckCircle2 size={40} className="text-emerald-400" />
          </div>
          <p className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1">Verification</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black italic text-white">99%</p>
            <span className="text-[10px] text-cyan-400 font-bold">L-G-P-D</span>
          </div>
        </div>
      </div>

      {/* Database View (Table-like List) */}
      <div className="space-y-2">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead, idx) => {
            // Simulação de status baseada no index ou data
            const isNew = idx < 3;
            return (
              <div 
                key={lead.id} 
                className="group bg-[#1A2F2C]/40 hover:bg-cyan-500/5 border border-white/5 p-4 rounded-[24px] flex items-center justify-between transition-all animate-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/5 bg-[#060E0D] p-1 flex items-center justify-center">
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}&backgroundColor=060E0D&fontFamily=Arial&fontWeight=800`} 
                        alt={lead.name} 
                        className="w-full h-full object-cover rounded-xl opacity-80" 
                      />
                    </div>
                    {isNew && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-[#060E0D] animate-pulse shadow-[0_0_8px_rgba(34,211,238,1)]"></div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-sm text-white tracking-tight">{lead.name}</h4>
                      {isNew ? (
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 rounded-md uppercase tracking-tighter">New Node</span>
                      ) : (
                        <span className="text-[8px] font-black px-1.5 py-0.5 bg-white/5 text-zinc-500 border border-white/5 rounded-md uppercase tracking-tighter">Registry</span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter flex items-center gap-2">
                      {lead.email}
                      <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                      {lead.device === 'mobile' ? <Smartphone size={10} /> : <Laptop size={10} />}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin size={10} className="text-cyan-500/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{lead.city}, {lead.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600">
                      <Calendar size={10} />
                      <span className="text-[9px] font-bold">{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  
                  <button className="p-2 text-zinc-700 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center space-y-4 bg-[#1A2F2C]/20 border border-dashed border-white/5 rounded-[40px] animate-in fade-in">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserX className="text-zinc-800" size={40} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600">Zero Nodes Detected</p>
              <p className="text-[10px] text-zinc-700 font-bold">Aguardando entrada de telemetria externa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Loading Indicator */}
      <div className="flex items-center justify-center gap-3 opacity-30">
        <div className="flex gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-1 h-1 rounded-full bg-cyan-400 animate-bounce`} style={{ animationDelay: `${i * 100}ms` }}></div>
          ))}
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.4em] text-cyan-400">Syncing with Mainframe</span>
      </div>
    </div>
  );
};

export default Leads;

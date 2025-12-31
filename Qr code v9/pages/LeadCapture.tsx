import React, { useState } from 'react';
import { QrCode, Lock, User, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Lead } from '../types';
import { toast } from 'react-hot-toast';

interface LeadCaptureProps {
  onCapture: (lead: Lead) => void;
  qrId?: string;
}

const LeadCapture: React.FC<LeadCaptureProps> = ({ onCapture, qrId }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !acceptedTerms) return;

    setIsSubmitting(true);
    
    let city = 'São Paulo';
    let state = 'SP';
    
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      city = geoData.city || city;
      state = geoData.region_code || state;
    } catch (e) {
      console.log("Geo error");
    }

    const leadData = {
      qr_code_id: qrId || null,
      name,
      email,
      city,
      state,
      device: window.innerWidth < 768 ? 'mobile' : 'desktop'
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (!error && data) {
      setIsSuccess(true);
      toast.success('Sucesso! Acesso liberado.');
      setTimeout(() => {
        onCapture(data);
      }, 2000);
    } else {
      toast.error("Erro ao validar dados. Tente novamente.");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#060E0D] p-8 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 size={48} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-black">Acesso Liberado!</h1>
        <p className="text-zinc-500">Seus dados foram validados. Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060E0D] p-8 flex flex-col items-center justify-between">
      <header className="w-full flex justify-center py-6">
        <div className="flex items-center gap-2">
           <QrCode className="text-cyan-400" size={28} />
           <span className="font-bold tracking-tighter text-2xl uppercase">NeoQrC</span>
        </div>
      </header>

      <div className="max-w-xs w-full space-y-8 flex-1 flex flex-col justify-center text-center">
        <div className="space-y-6">
          <div className="w-24 h-24 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto border border-cyan-400/20 relative">
             <div className="absolute inset-0 bg-cyan-400/5 blur-xl rounded-full"></div>
             <Lock className="text-cyan-400 relative z-10" size={40} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight">Identifique-se</h1>
            <p className="text-zinc-400 font-medium">Cadastre-se para acessar o conteúdo exclusivo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Nome</label>
             <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400" size={20} />
                <input required type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#1A2F2C] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-400 outline-none transition-all" />
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">E-mail</label>
             <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-cyan-400" size={20} />
                <input required type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#1A2F2C] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-400 outline-none transition-all" />
             </div>
          </div>

          <div className="flex items-start gap-3 px-1 mt-2">
            <div className="relative flex items-center">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded-md border border-white/10 bg-[#1A2F2C] checked:border-cyan-400 checked:bg-cyan-400 transition-all"
              />
              <CheckCircle2 size={12} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#060E0D] opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <label htmlFor="terms" className="text-[10px] text-zinc-500 font-medium cursor-pointer select-none leading-tight">
              Concordo com os <span className="text-cyan-400 hover:underline">Termos de Uso</span> e autorizo o processamento dos meus dados.
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting || !acceptedTerms} 
            className="w-full bg-cyan-400 text-[#060E0D] font-bold py-4 rounded-2xl flex items-center justify-center gap-3 accent-glow mt-4 active:scale-95 disabled:opacity-30 transition-all"
          >
            {isSubmitting ? 'Validando...' : <><p>Acessar Conteúdo</p> <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>

      <footer className="py-8 text-zinc-700 text-[10px] font-bold uppercase tracking-widest">
        Sistema de Rastreamento <span className="text-zinc-500">NeoQrC</span>
      </footer>
    </div>
  );
};

export default LeadCapture;
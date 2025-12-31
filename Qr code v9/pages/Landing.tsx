
import React from 'react';
import { QrCode, Zap, ArrowRight } from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

const Landing: React.FC<LandingProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-[#060E0D] text-white overflow-hidden relative selection:bg-cyan-400 selection:text-black flex flex-col">
      {/* Background Grid FX */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A2F2C_1px,transparent_1px),linear-gradient(to_bottom,#1A2F2C_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-cyan-500/10 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 max-w-6xl mx-auto w-full px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <QrCode className="text-cyan-400" size={24} />
          </div>
          <span className="font-black tracking-widest text-xl uppercase italic">NeoQrC</span>
        </div>
        <button 
          onClick={onEnter}
          className="bg-[#1A2F2C] border border-white/10 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:border-cyan-400/50 transition-all active:scale-95"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-40 text-center space-y-12 flex-1 flex flex-col justify-center">
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 bg-cyan-500/5 border border-cyan-500/20 px-4 py-1.5 rounded-full mb-4">
            <Zap size={14} className="text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Sistema de Gestão Privada</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9] uppercase">
            Plataforma <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NeoQrC.</span>
          </h1>
          <p className="max-w-xl mx-auto text-zinc-500 text-lg md:text-xl font-medium">
            Gerador de QR Codes Inteligentes. Acesso restrito para administradores e captura de leads qualificados.
          </p>
        </div>

        <div className="flex items-center justify-center animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <button 
            onClick={onEnter}
            className="group relative w-full sm:w-auto bg-cyan-400 text-[#060E0D] font-black px-12 py-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-cyan-300 transition-all shadow-[0_0_40px_rgba(34,211,238,0.3)] active:scale-95 italic uppercase tracking-tighter"
          >
            Acessar Plataforma
            <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 border-t border-white/5 text-center mt-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
           <QrCode className="text-zinc-800" size={24} />
           <span className="font-black tracking-widest text-lg uppercase italic text-zinc-800">NeoQrC</span>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-700">
          Desenvolvido por Neo Lucca
        </p>
      </footer>
    </div>
  );
};

export default Landing;

import React, { useState } from 'react';
import { QrCode, ArrowLeft, Loader2, AlertTriangle, ShieldCheck, MailCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNeoTranslation } from '../hooks/useTranslation';

type AuthView = 'main' | 'login' | 'signup' | 'admin_login' | 'verify_email';

const Auth: React.FC = () => {
  const { t } = useNeoTranslation();
  const [view, setView] = useState<AuthView>('main');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const [secretCount, setSecretCount] = useState(0);

  const handleSecretClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const newCount = secretCount + 1;
    setSecretCount(newCount);
    if (newCount === 3) {
      setView('admin_login');
      setSecretCount(0);
    }
  };

  const handleAuth = async (e: React.FormEvent, type: 'login' | 'signup') => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (type === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        
        setView('verify_email');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? t('auth.invalidCredentials') : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'verify_email') {
    return (
      <div className="min-h-screen bg-[#060E0D] flex flex-col justify-center items-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="w-full max-w-xs relative z-10 text-center space-y-10 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20 relative">
             <div className="absolute inset-0 bg-cyan-400/5 blur-xl rounded-full"></div>
             <MailCheck size={48} className="text-cyan-400 relative z-10" />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-black italic tracking-tight text-white leading-tight">
              {t('auth.verifyTitle')}
            </h2>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
              {t('auth.verifyText')} <br/>
              <span className="text-cyan-400 font-bold">{email}</span>
            </p>
          </div>

          <button 
            onClick={() => setView('login')}
            className="w-full bg-cyan-400 text-[#060E0D] font-black py-5 rounded-[20px] text-lg transition-all active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'main') {
    return (
      <div className="min-h-screen bg-[#060E0D] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-md flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
          <div className="flex items-center gap-3 mb-12">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <QrCode size={24} className="text-cyan-400" />
            </div>
            <span className="font-bold tracking-widest text-xl text-white select-none">
              NEOQR
              <span 
                onClick={handleSecretClick} 
                className="cursor-default select-none" 
                style={{ WebkitTapHighlightColor: 'transparent', transition: 'none' }}
              >
                C
              </span>
            </span>
          </div>

          <div className="text-center mb-12 space-y-4">
            <h1 className="text-6xl md:text-7xl font-black italic tracking-tighter text-white leading-none">
              NEOQRC<br />{t('auth.platform')}
            </h1>
            <p className="text-zinc-500 text-sm md:text-base font-medium tracking-tight">
              {t('auth.tagline')}
            </p>
          </div>

          <div className="w-full max-w-xs space-y-8">
            <button 
              onClick={() => { setError(''); setView('signup'); }}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-[#060E0D] font-black py-5 rounded-[20px] text-lg transition-all active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.25)]"
            >
              {t('auth.createAccount')}
            </button>
            
            <div className="text-center">
              <button 
                onClick={() => { setError(''); setView('login'); }}
                className="text-zinc-500 font-black hover:text-white transition-colors text-[10px] uppercase tracking-[0.2em]"
              >
                {t('auth.accessAccount')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isLogin = view === 'login' || view === 'admin_login';
  const title = view === 'admin_login' ? t('auth.restrictedAccess') : (view === 'login' ? t('auth.clientLogin') : t('auth.newSignup'));
  const btnText = view === 'admin_login' ? t('auth.enterSystem') : (view === 'login' ? t('auth.accessButton') : t('auth.createButton'));

  return (
    <div className="min-h-screen bg-[#060E0D] flex flex-col justify-center items-center p-6 relative overflow-hidden">
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[120px] rounded-full pointer-events-none ${view === 'admin_login' ? 'bg-red-500/5' : 'bg-cyan-500/5'}`} />
      
      <div className="w-full max-w-xs relative z-10 animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={() => setView('main')} 
          className="flex items-center gap-2 text-zinc-500 font-bold mb-10 hover:text-white transition-colors text-[10px] uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> {t('auth.back')}
        </button>

        <div className="mb-10 space-y-2">
          {view === 'admin_login' && <ShieldCheck className="text-red-500 mb-4" size={32} />}
          <h2 className={`text-4xl font-black italic tracking-tight ${view === 'admin_login' ? 'text-red-500' : 'text-white'}`}>{title}</h2>
          <p className="text-zinc-500 text-sm">{t('auth.credentialsInfo')}</p>
        </div>

        <form onSubmit={(e) => handleAuth(e, isLogin ? 'login' : 'signup')} className="space-y-4">
          {error && (
            <div className={`p-4 rounded-xl text-[11px] font-black uppercase tracking-wider flex gap-2 items-center border ${error.includes('Sucesso') || error.includes('criada') || error.includes('Account created') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">{t('auth.emailLabel')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-[#11211F] border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-zinc-800 focus:border-cyan-400/50 outline-none transition-all font-medium"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">{t('auth.passwordLabel')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#11211F] border border-white/5 rounded-2xl py-4 px-5 text-white placeholder:text-zinc-800 focus:border-cyan-400/50 outline-none transition-all font-medium"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-black py-5 rounded-[20px] text-lg transition-all active:scale-95 flex justify-center mt-6 ${
              view === 'admin_login' 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]' 
                : 'bg-cyan-400 text-[#060E0D] hover:bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.25)]'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : btnText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;


import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ViewState, QRCode, Lead, Profile } from './types';
import { supabase, hasSupabaseConfig } from './lib/supabase';
import { useSupabaseSync, useSupabaseData } from './hooks/useSupabaseSync';
import { useProfileCache } from './hooks/useProfileCache';
import { Permissions } from './utils/permissions';
import Navigation from './components/Navigation';
import Analytics from './pages/Analytics';
import Generator from './pages/Generator';
import Leads from './pages/Leads';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import LeadCapture from './pages/LeadCapture';
import Settings from './pages/Settings';
import Redirect from './pages/Redirect';
import { AnalyticsSkeleton, LeadsSkeleton } from './components/Skeleton';
import { Cpu, RefreshCw, QrCode as QrIcon, AlertCircle } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useNeoTranslation } from './hooks/useTranslation';
import { ErrorMessages, SuccessMessages } from './utils/messages';

// Lazy load do AdminDashboard (carrega apenas quando necessário)
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));


const App: React.FC = () => {
  const { t } = useNeoTranslation();
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showRetry, setShowRetry] = useState(false);

  const { migrateLocalData, isSyncing } = useSupabaseSync(session?.user?.id);
  const { cachedProfile, saveProfile, clearProfile } = useProfileCache();

  const isAdmin = profile?.is_admin || false;
  const { qrs, leads, scans, loading: dataLoading, refresh } = useSupabaseData(session?.user?.id, isAdmin);

  // Função fetchProfile (FORA do useEffect)
  const fetchProfile = async (authUser: any) => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }

    // Tentar carregar do cache primeiro
    if (cachedProfile && cachedProfile.id === authUser.id) {
      setProfile(cachedProfile);
      setCurrentView(cachedProfile.is_admin ? 'analytics' : 'generator');
      setIsInitializing(false);

      // Atualizar em background
      fetchProfileFromDB(authUser);
      return;
    }

    await fetchProfileFromDB(authUser);
  };

  const fetchProfileFromDB = async (authUser: any) => {
    try {
      // Timeout de 5 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(ErrorMessages.PROFILE_TIMEOUT)), 5000)
      );

      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        toast.error(ErrorMessages.PROFILE_LOAD_ERROR);

        // Mesmo com erro, permite continuar com perfil básico
        const basicProfile = {
          id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'Usuário',
          is_admin: false,
          created_at: new Date().toISOString()
        } as Profile;

        setProfile(basicProfile);
        setCurrentView('generator');
      } else if (data) {
        setProfile(data);
        saveProfile(data); // Salvar no cache
        await migrateLocalData();

        if (currentView === 'landing' || currentView === 'auth') {
          const newView = data.is_admin ? 'analytics' : 'generator';
          setCurrentView(newView);
        }
        
        return data; // Retornar o perfil atualizado
      }
    } catch (err) {
      console.error('Erro crítico ao buscar perfil:', err);
      toast.error(ErrorMessages.PROFILE_LOAD_ERROR);

      // Cria perfil básico em caso de erro
      const basicProfile = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.email?.split('@')[0] || 'Usuário',
        is_admin: false,
        created_at: new Date().toISOString()
      } as Profile;

      setProfile(basicProfile);
      setCurrentView('generator');
      return basicProfile; // Retornar o perfil básico
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setIsInitializing(false);
      return;
    }

    // Fail-safe timeout: garante que a tela de loading não seja infinita
    const safetyTimeout = setTimeout(() => {
      if (isInitializing) {
        setShowRetry(true);
      }
    }, 2000);

    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (currentSession) {
          setSession(currentSession);
          await fetchProfile(currentSession.user);
        } else {
          setIsInitializing(false);
        }
      } catch (err) {
        console.error('Erro na inicialização:', err);
        setIsInitializing(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchProfile(newSession.user);
        }
      } else {
        setProfile(null);
        setCurrentView('landing');
        setIsInitializing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      clearProfile();
      toast.success(SuccessMessages.LOGOUT_SUCCESS);
    }
  };

  const handleAddQRCode = (config: QRCode) => {
    refresh();
    toast.success(SuccessMessages.QR_CREATED);
  };

  const handleCaptureLead = (lead: Lead) => {
    refresh();
    toast.success(SuccessMessages.LEAD_CAPTURED);
    setCurrentView('analytics');
  };

  if (!hasSupabaseConfig) {
    return (
      <div className="min-h-screen bg-[#060E0D] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#1A2F2C] border border-cyan-500/20 rounded-[40px] p-10 space-y-8 animate-in fade-in">
          <Cpu className="text-cyan-400 mx-auto" size={40} />
          <h1 className="text-2xl font-black text-white uppercase italic">Configuração do Banco</h1>
          <p className="text-zinc-400 text-sm">Chaves de acesso não encontradas.</p>
        </div>
      </div>
    );
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#060E0D] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="bg-[#1A2F2C] p-5 rounded-[28px] border border-cyan-500/30 shadow-2xl">
            <QrIcon size={48} className="text-cyan-400 animate-pulse" />
          </div>
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Initializing System...</h2>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 w-1/3 animate-[loading_1.5s_infinite_ease-in-out]"></div>
            </div>
            {showRetry && (
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-cyan-500 text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-cyan-400 transition-all flex items-center gap-2 mx-auto"
              >
                <AlertCircle size={16} />
                Forçar Carregamento
              </button>
            )}
          </div>
        </div>
        <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
      </div>
    );
  }

  const renderContent = () => {
    // Verificar se é uma rota de redirect (/r/abc123)
    if (window.location.pathname.startsWith('/r/')) {
      return <Redirect />;
    }

    if (!session) {
      if (currentView === 'auth') return <Auth />;
      return <Landing onEnter={() => setCurrentView('auth')} />;
    }

    if (currentView === 'capture') return <LeadCapture onCapture={handleCaptureLead} />;

    switch (currentView) {
      case 'analytics':
        return dataLoading ? <AnalyticsSkeleton /> : <Analytics scans={scans} leadsCount={leads.length} isAdmin={isAdmin} />;
      case 'generator':
        return <Generator onGenerate={handleAddQRCode} userId={session?.user.id} />;
      case 'leads':
        return dataLoading ? <LeadsSkeleton /> : <Leads leads={leads} isAdmin={isAdmin} />;
      case 'admin_dashboard':
        // Validação robusta de permissões admin
        if (!Permissions.canAccessAdminDashboard(profile)) {
          toast.error(ErrorMessages.ADMIN_UNAUTHORIZED);
          setCurrentView('generator');
          return <Generator onGenerate={handleAddQRCode} userId={session?.user.id} />;
        }
        return (
          <Suspense fallback={<AnalyticsSkeleton />}>
            <AdminDashboard />
          </Suspense>
        );
      case 'settings':
        return <Settings profile={profile} onLogout={handleLogout} onUpdate={() => fetchProfile(session.user)} />;
      default:
        return null;
    }
  };

  const isNavigationVisible = session && currentView !== 'capture' && currentView !== 'landing' && currentView !== 'auth';

  return (
    <div className="min-h-screen bg-[#060E0D] text-slate-200">
      <Toaster position="top-center" />
      {isSyncing && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-cyan-500 text-[#060E0D] px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl animate-bounce">
          <RefreshCw size={14} className="animate-spin" /> Syncing Nodes...
        </div>
      )}
      <main className={`${!session || currentView === 'capture' || currentView === 'landing' || currentView === 'auth' || currentView === 'admin_dashboard' ? '' : 'pb-24 pt-4 px-4 max-w-lg mx-auto'}`}>
        {renderContent()}
      </main>
      {isNavigationVisible && (
        <Navigation currentView={currentView} setView={setCurrentView} isAdmin={isAdmin} />
      )}
    </div>
  );
};

export default App;

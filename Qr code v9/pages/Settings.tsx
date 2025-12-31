import React, { useState, useEffect, useRef } from 'react';
import { 
  User, LogOut, ChevronRight, ArrowLeft, Check, Loader2, 
  RefreshCw, Link as LinkIcon, Upload, Camera
} from 'lucide-react';
import { Profile } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { useNeoTranslation } from '../hooks/useTranslation';

interface SettingsProps {
  profile: Profile | null;
  onLogout: () => void;
  onUpdate: (userId: string) => void;
}

type SettingsView = 'main' | 'profile';

const Settings: React.FC<SettingsProps> = ({ profile, onLogout, onUpdate }) => {
  const { t } = useNeoTranslation();
  const [activeView, setActiveView] = useState<SettingsView>('main');
  const [name, setName] = useState(profile?.name || '');
  const [avatarInput, setAvatarInput] = useState(profile?.avatar_seed || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setAvatarInput(profile.avatar_seed || '');
    }
  }, [profile]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem (JPG, PNG, etc.)');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}_${Date.now()}.${fileExt}`;
      
      // Fazer upload para o Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Atualizar o campo com a URL
      setAvatarInput(publicUrl);
      toast.success('Imagem enviada com sucesso!', {
        icon: '📸',
        style: { background: '#1A2F2C', color: '#fff' }
      });

    } catch (error: any) {
      toast.error('Erro ao enviar imagem: ' + (error.message || 'Tente novamente'));
    } finally {
      setIsUploading(false);
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      toast.error('Perfil não encontrado');
      return;
    }
    
    setIsSaving(true);
    
    console.log('Salvando perfil:', { name: name.trim(), avatar_seed: avatarInput.trim(), profileId: profile.id });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: name.trim(),
          avatar_seed: avatarInput.trim(),
          updated_at: new Date()
        })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar perfil:', error);
        throw error;
      }

      console.log('Perfil salvo com sucesso:', data);

      toast.success('Protocolo de identidade atualizado!', {
        icon: '🛡️',
        style: { background: '#1A2F2C', color: '#fff' }
      });
      
      // Chamar onUpdate para atualizar o perfil no estado global
      if (onUpdate) {
        onUpdate(profile.id);
      }
      
      setActiveView('main');
    } catch (error: any) {
      console.error('Erro completo ao salvar perfil:', error);
      toast.error("Erro na sincronização: " + (error.message || "Desconhecido"));
    } finally {
      setIsSaving(false);
    }
  };

  const isExternalUrl = (str: any) => {
    if (typeof str !== 'string') return false;
    return str.startsWith('http');
  };

  const avatarPreview = isExternalUrl(avatarInput) 
    ? avatarInput 
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarInput || 'default'}`;

  if (activeView === 'profile') {
    return (
      <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
        <header className="flex items-center gap-4">
          <button onClick={() => setActiveView('main')} className="p-2 bg-[#1A2F2C] border border-white/5 rounded-full text-cyan-400 hover:bg-[#2D4A45] transition-all">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold uppercase italic tracking-tighter">Edit Identity</h1>
        </header>

        <div className="bg-[#1A2F2C] border border-white/5 rounded-[40px] p-8 space-y-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-32 h-32 rounded-[40px] bg-[#060E0D] border-2 border-cyan-400/20 p-1 relative overflow-hidden group/avatar shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-[36px] transition-transform duration-700 group-hover/avatar:scale-110" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/50 rounded-[36px] flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity"
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-white" size={24} />
                ) : (
                  <Camera className="text-white" size={24} />
                )}
              </button>
            </div>
            {!isExternalUrl(avatarInput) && (
              <button 
                onClick={() => setAvatarInput(Math.random().toString(36).substring(7))}
                className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-400/5 px-6 py-2 rounded-full border border-cyan-400/10 flex items-center gap-2 hover:bg-cyan-400/10 transition-all"
              >
                <RefreshCw size={12} /> Regenerate Seed
              </button>
            )}
          </div>
          
          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">{t('settings.displayName')}</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full bg-[#060E0D] border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-cyan-400 outline-none transition-all font-medium" 
                />
                <User className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-600 ml-1">Avatar Source (Seed or URL)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ex: user123 ou https://foto.com/perfil.jpg"
                  value={avatarInput} 
                  onChange={(e) => setAvatarInput(e.target.value)} 
                  className="w-full bg-[#060E0D] border border-white/10 rounded-2xl py-5 px-6 text-white focus:border-cyan-400 outline-none transition-all font-medium text-xs placeholder:text-zinc-800" 
                />
                <LinkIcon className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              </div>
            </div>
          </div>

          <button 
            onClick={handleSaveProfile} 
            disabled={isSaving} 
            className="w-full bg-cyan-400 text-[#060E0D] font-black py-5 rounded-[24px] flex items-center justify-center gap-2 hover:bg-cyan-300 active:scale-95 disabled:opacity-50 shadow-xl shadow-cyan-400/20 italic tracking-tighter uppercase transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={24} /> : <><Check size={24} /> {t('settings.updateProfile')}</>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-black italic tracking-tighter uppercase">{t('settings.title')}</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Network ID: {profile?.email}</p>
      </header>

      <div className="bg-[#1A2F2C] border border-white/5 p-6 rounded-[32px] flex items-center gap-4 group hover:border-cyan-500/20 transition-all cursor-pointer" onClick={() => setActiveView('profile')}>
        <div className="w-16 h-16 rounded-2xl bg-[#060E0D] border border-white/10 overflow-hidden p-1 shadow-lg">
          <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover rounded-xl" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-white tracking-tight">{profile?.name || 'Subject Unknown'}</h2>
          <span className="text-[8px] font-black uppercase bg-cyan-400/10 text-cyan-400 px-1.5 py-0.5 rounded tracking-tighter">
            {profile?.is_admin ? 'System Overseer' : 'Neural Node'}
          </span>
        </div>
        <ChevronRight size={20} className="text-zinc-600 group-hover:text-cyan-400 transition-colors" />
      </div>

      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-600 ml-1">{t('settings.language')}</h3>
        <div className="bg-[#1A2F2C] border border-white/5 rounded-[24px] p-2 flex gap-2">
          <button 
            className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all bg-cyan-400 text-[#060E0D]`}
          >
            Português (Fixo)
          </button>
        </div>
      </div>

      <div className="pt-4 pb-12">
        <button onClick={onLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-5 rounded-[24px] font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-500/5 uppercase tracking-tighter italic">
          <LogOut size={20} /> {t('settings.logout')}
        </button>
      </div>
    </div>
  );
};

export default Settings;

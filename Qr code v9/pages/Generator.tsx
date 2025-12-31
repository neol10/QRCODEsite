import React, { useState } from 'react';
import { Sparkles, Download, Share2, Loader2, QrCode as QrIcon, Palette, Layers, Zap, MapPin, Settings, Image as ImageIcon, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { QRCode } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { generateShortCode, buildRedirectUrl } from '../utils/shortCode';

const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Cyan Neon', fg: '#00ffff', bg: '#003333' },
  { name: 'Cyber Purple', fg: '#ff00ff', bg: '#330033' },
  { name: 'Matrix Green', fg: '#00ff00', bg: '#003300' },
  { name: 'Sunset Gold', fg: '#ffaa00', bg: '#332200' },
];

interface GeneratorProps {
  onGenerate: (config: QRCode) => void;
  userId: string;
}

const Generator: React.FC<GeneratorProps> = ({ onGenerate, userId }) => {
  const [url, setUrl] = useState('');
  const [campaign, setCampaign] = useState('');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDynamic, setIsDynamic] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Logo muito grande (máx 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoUrl(event.target?.result as string);
        toast.success('Logo carregado com sucesso!');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoUrl(null);
    toast.success('Logo removido');
  };

  const handleDownload = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      toast.error('Nenhum QR Code gerado para baixar.');
      return;
    }

    try {
      const toastId = toast.loading('Processando imagem...');
      const downloadUrl = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `neoqrc-${(campaign || 'dynamic').replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss(toastId);
      toast.success('Download concluído!');
    } catch (error) {
      toast.error('Erro ao baixar imagem.');
      console.error(error);
    }
  };

  const handleGenerate = async () => {
    console.log('handleGenerate chamado', { url, campaign, isDynamic, userId });
    
    // Validação simples
    if (!url || url.trim() === '') {
      toast.error('Por favor, insira uma URL de destino');
      return;
    }
    
    setIsGenerating(true);

    // Captura de origem para admin
    let city = 'Remote';
    let state = 'Global';
    try {
      const geoRes = await fetch('https://ipapi.co/json/');
      const geoData = await geoRes.json();
      city = geoData.city || 'Unknown';
      state = geoData.region || 'Unknown';
    } catch (e) {
      // Usar valores padrão se falhar
    }

    try {
      let finalUrl = url;
      let shortCode = '';
      let qrCodeData: any;

      console.log('Iniciando geração do QR Code...');

      // Se for QR Code dinâmico, gerar short code único e criar redirect
      if (isDynamic) {
        console.log('Gerando QR Code dinâmico...');
        // Gerar short code único verificando no banco
        let attempts = 0;
        const maxAttempts = 100;
        
        do {
          shortCode = generateShortCode();
          attempts++;
          
          if (attempts > maxAttempts) {
            throw new Error('Não foi possível gerar um código único após várias tentativas');
          }
          
          const { data: existing, error: checkError } = await supabase
            .from('qr_codes')
            .select('short_code')
            .eq('short_code', shortCode)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
          }
            
          if (!existing) break;
        } while (true);
        
        finalUrl = buildRedirectUrl(window.location.origin, shortCode);
        console.log('Short code gerado:', shortCode);

        // Criar QR Code
        const { data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .insert([{
            user_id: userId,
            name: campaign || 'NeoQrC Dynamic',
            url: finalUrl, // URL do redirect
            campaign_name: campaign,
            fg_color: fgColor,
            bg_color: bgColor,
            type: 'dynamic',
            is_dynamic: true,
            short_code: shortCode,
            created_location: `${city}, ${state}`,
            created_device: window.innerWidth < 768 ? 'mobile' : 'desktop'
          }])
          .select()
          .single();

        if (qrError) {
          console.error('Erro ao criar QR Code:', qrError);
          throw qrError;
        }
        qrCodeData = qrData;
        console.log('QR Code criado:', qrCodeData);

        // Criar redirect (opcional - não falha se tabela não existir)
        try {
          const { error: redirectError } = await supabase
            .from('redirects')
            .insert([{
              short_code: shortCode,
              qr_code_id: qrCodeData.id,
              destination_url: url, // URL original do usuário
              is_active: true
            }]);

          if (redirectError) {
            console.error('Redirect não criado (tabela pode não existir):', redirectError);
          } else {
            console.log('Redirect criado com sucesso');
          }
        } catch (redirectErr) {
          console.error('Erro ao criar redirect (ignorado):', redirectErr);
        }

      } else {
        console.log('Gerando QR Code estático...');
        // QR Code estático normal
        const { data, error } = await supabase
          .from('qr_codes')
          .insert([{
            user_id: userId,
            name: campaign || 'NeoQrC Static',
            url: url,
            campaign_name: campaign,
            fg_color: fgColor,
            bg_color: bgColor,
            type: 'static',
            is_dynamic: false,
            created_location: `${city}, ${state}`,
            created_device: window.innerWidth < 768 ? 'mobile' : 'desktop'
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar QR Code estático:', error);
          throw error;
        }
        qrCodeData = data;
        console.log('QR Code estático criado:', qrCodeData);
      }

      const message = isDynamic 
        ? 'QR Code Dinâmico criado! URL pode ser editada a qualquer momento 🔥'
        : 'Protocolo de rastreamento ativado!';

      toast.success(message, {
        icon: isDynamic ? '⚡' : '🛰️',
        style: { background: '#1A2F2C', color: '#fff', border: '1px solid rgba(34,211,238,0.2)' }
      });
      
      onGenerate(qrCodeData);
    } catch (error: any) {
      toast.error("Falha na sincronização: " + error.message);
    }
    setIsGenerating(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24">
      <header className="space-y-1">
        <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Gerador QR Code</h1>
        <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">Interface Neural v2.0</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-cyan-400/5 blur-[80px] rounded-full group-hover:bg-cyan-400/10 transition-all duration-1000"></div>
          <div className="relative bg-[#1A2F2C] border border-white/5 rounded-[40px] p-8 flex flex-col items-center gap-6 shadow-2xl">
            <div className="w-full flex justify-between items-center mb-2">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                <Zap size={12} className="text-cyan-400" /> Prévia Neural
              </span>
              <div className="flex gap-1 items-center">
                <MapPin size={10} className="text-cyan-400/50 animate-pulse" />
                <span className="text-[8px] font-bold text-zinc-700 uppercase">Geo-Tracking Active</span>
              </div>
            </div>

            <div
              className="p-6 rounded-[32px] shadow-inner transition-all duration-500 transform group-hover:scale-[1.02]"
              style={{ backgroundColor: bgColor }}
            >
              {url ? (
                <div className="animate-in zoom-in-50 duration-500">
                  <QRCodeCanvas
                    key={`qr-${url}-${fgColor}-${bgColor}-${logoUrl}-${Date.now()}`}
                    value={url}
                    size={220}
                    level={"H"}
                    bgColor={bgColor}
                    fgColor={fgColor}
                    includeMargin={true}
                    imageSettings={logoUrl ? {
                      src: logoUrl,
                      x: undefined,
                      y: undefined,
                      height: 48,
                      width: 48,
                      excavate: true,
                    } : undefined}
                  />
                  <div className="text-center mt-2">
                    <p className="text-[8px] text-zinc-600">QR Code gerado!</p>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 flex flex-col items-center justify-center gap-3 border border-white/5 border-dashed rounded-2xl">
                  <QrIcon size={32} className="text-zinc-800" />
                  <p className="text-[9px] font-black text-zinc-700 uppercase tracking-tighter">Aguardando Input...</p>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-white/5"></div>

            <div className="w-full grid grid-cols-2 gap-3">
              <button
                onClick={handleDownload}
                disabled={!url}
                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn disabled:opacity-20"
              >
                <Download size={16} className="text-zinc-500 group-hover/btn:text-cyan-400" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Baixar Imagem</span>
              </button>
              <button
                onClick={() => {
                  if (url) {
                    navigator.clipboard.writeText(url);
                    toast.success('Link copiado para a área de transferência!');
                  } else {
                    toast.error('Digite uma URL primeiro');
                  }
                }}
                className="bg-white/5 hover:bg-white/10 p-3 rounded-2xl flex items-center justify-center gap-2 transition-all group/btn"
              >
                <Share2 size={16} className="text-zinc-500 group-hover/btn:text-cyan-400" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Copiar Link</span>
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#1A2F2C] border border-white/5 rounded-[40px] p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">URL de Destino</label>
              <div className="relative">
                <input
                  placeholder="https://exemplo.com/destino"
                  className="w-full bg-[#060E0D] border border-white/10 rounded-2xl py-5 px-6 text-sm focus:border-cyan-400 outline-none transition-all font-medium text-white placeholder:text-zinc-800"
                  type="text"
                  value={url}
                  onChange={(e) => {
                    console.log('URL digitada:', e.target.value);
                    setUrl(e.target.value);
                  }}
                />
                <Layers className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800" size={18} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Nome da Campanha</label>
              <input
                placeholder="Ex: QR Code Principal"
                className="w-full bg-[#060E0D] border border-white/10 rounded-2xl py-5 px-6 text-sm focus:border-cyan-400 outline-none transition-all font-medium text-white placeholder:text-zinc-800"
                type="text"
                value={campaign}
                onChange={(e) => setCampaign(e.target.value)}
              />
            </div>

            {/* Upload de Logo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={12} className="text-cyan-400" /> Logo (Opcional)
              </label>
              <div className="relative">
                {logoUrl ? (
                  <div className="relative">
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="w-full h-24 object-cover rounded-xl border border-white/10"
                    />
                    <button
                      onClick={removeLogo}
                      className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="w-full h-24 bg-[#060E0D] border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-cyan-400 transition-colors"
                    >
                      <ImageIcon size={24} className="text-zinc-600" />
                      <span className="text-[10px] text-zinc-500">Clique para adicionar logo</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Palette size={12} className="text-cyan-400" /> Chromatic Presets
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    console.log('Clicou no preset:', preset.name, preset.fg, preset.bg);
                    setFgColor(preset.fg);
                    setBgColor(preset.bg);
                    console.log('Cores atualizadas:', fgColor, bgColor);
                  }}
                  className="h-10 rounded-xl border border-white/20 flex items-center justify-center p-0.5 overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/50 active:scale-95 relative group"
                  title={preset.name}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="w-full h-full rounded-lg flex" style={{ backgroundColor: preset.bg }}>
                    <div className="w-1/2 h-full rounded-l-lg" style={{ backgroundColor: preset.fg, boxShadow: `0 0 10px ${preset.fg}` }}></div>
                    <div className="w-1/2 h-full rounded-r-lg" style={{ backgroundColor: preset.bg }}></div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Toggle QR Code Dinâmico */}
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between bg-[#060E0D] rounded-2xl p-4 border border-white/5">
                <div className="flex items-center gap-3">
                  <Settings className="text-cyan-400" size={16} />
                  <div>
                    <p className="text-white font-bold text-sm">QR Code Dinâmico</p>
                    <p className="text-zinc-600 text-[10px]">Edite a URL depois de criado 🔥</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDynamic(!isDynamic)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    isDynamic ? 'bg-cyan-400' : 'bg-zinc-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isDynamic ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              {isDynamic && (
                <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-xl p-3">
                  <p className="text-cyan-400 text-[10px] font-bold">
                    ⚡ O QR Code apontará para /r/[código] e redirecionará para sua URL
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!url || isGenerating}
            className="w-full bg-cyan-400 text-[#060E0D] font-black py-6 rounded-[24px] flex items-center justify-center gap-3 hover:bg-cyan-300 active:scale-95 transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-20 uppercase italic tracking-tighter"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <><Sparkles size={20} /> Gerar QR Code</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Generator;

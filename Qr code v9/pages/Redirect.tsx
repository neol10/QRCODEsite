import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Redirect: React.FC = () => {
  // Obter shortCode da URL atual
  const getPathSegments = () => window.location.pathname.split('/').filter(Boolean);
  const shortCode = getPathSegments()[getPathSegments().length - 1];
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectData, setRedirectData] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!shortCode) {
      setError('Código de redirecionamento não fornecido');
      setLoading(false);
      return;
    }

    const handleRedirect = async () => {
      try {
        // Buscar redirect no banco
        const { data: redirect, error: redirectError } = await supabase
          .from('redirects')
          .select('*')
          .eq('short_code', shortCode)
          .eq('is_active', true)
          .single();

        if (redirectError) throw redirectError;

        if (!redirect) {
          setError('QR Code não encontrado ou desativado');
          setLoading(false);
          return;
        }

        setRedirectData(redirect);

        // Registrar o scan
        const scanData = {
          qr_code_id: redirect.qr_code_id,
          campaign_name: 'QR Code Dinâmico',
          city: 'Unknown',
          state: 'Unknown',
          device: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        };

        await supabase
          .from('scans')
          .insert(scanData);

        // Contagem regressiva para redirecionamento
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = redirect.destination_url;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);

      } catch (err: any) {
        console.error('Erro no redirecionamento:', err);
        setError('Erro ao processar redirecionamento');
        setLoading(false);
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060E0D] flex items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="animate-spin text-cyan-400 mx-auto" size={48} />
          <div className="space-y-2">
            <h1 className="text-white text-xl font-bold">Redirecionando...</h1>
            <p className="text-zinc-500">Aguarde enquanto te direcionamos para o destino</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060E0D] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-white text-xl font-bold">QR Code Inválido</h1>
            <p className="text-zinc-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-cyan-400 text-[#060E0D] px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-colors"
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060E0D] flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="w-16 h-16 bg-cyan-400/10 rounded-full flex items-center justify-center mx-auto">
          <ExternalLink className="text-cyan-400" size={32} />
        </div>
        <div className="space-y-4">
          <h1 className="text-white text-2xl font-bold">Redirecionando em {countdown}...</h1>
          <p className="text-zinc-500">Você será direcionado para:</p>
          <div className="bg-[#1A2F2C] border border-white/5 rounded-xl p-4">
            <p className="text-cyan-400 text-sm break-all">{redirectData?.destination_url}</p>
          </div>
        </div>
        <button
          onClick={() => window.location.href = redirectData?.destination_url}
          className="bg-cyan-400 text-[#060E0D] px-6 py-3 rounded-xl font-bold hover:bg-cyan-300 transition-colors"
        >
          Ir Agora
        </button>
      </div>
    </div>
  );
};

export default Redirect;

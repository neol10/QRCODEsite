import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, ExternalLink, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { QRCode, Redirect } from '../types';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface QRCodeEditorProps {
  qrCode: QRCode;
  onClose: () => void;
  onUpdate: () => void;
}

const QRCodeEditor: React.FC<QRCodeEditorProps> = ({ qrCode, onClose, onUpdate }) => {
  const [newUrl, setNewUrl] = useState(qrCode.url || '');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [redirectData, setRedirectData] = useState<Redirect | null>(null);

  useEffect(() => {
    if (qrCode.is_dynamic) {
      loadRedirectData();
    }
    setIsActive(qrCode.is_active);
  }, [qrCode]);

  const loadRedirectData = async () => {
    if (!qrCode.short_code) return;

    try {
      const { data, error } = await supabase
        .from('redirects')
        .select('*')
        .eq('short_code', qrCode.short_code)
        .single();

      if (error) throw error;
      
      setRedirectData(data);
      setNewUrl(data.destination_url);
      setIsActive(data.is_active);
    } catch (error) {
      console.error('Erro ao carregar redirect:', error);
    }
  };

  const handleSave = async () => {
    if (!qrCode.is_dynamic || !redirectData) return;

    setLoading(true);
    try {
      // Atualizar redirect
      const { error: redirectError } = await supabase
        .from('redirects')
        .update({
          destination_url: newUrl,
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', redirectData.id);

      if (redirectError) throw redirectError;

      // Atualizar QR Code
      const { error: qrError } = await supabase
        .from('qr_codes')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', qrCode.id);

      if (qrError) throw qrError;

      toast.success('QR Code atualizado com sucesso! ⚡', {
        style: { background: '#1A2F2C', color: '#fff' }
      });

      onUpdate();
      onClose();
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const currentUrl = redirectData?.destination_url || qrCode.url;
  const redirectUrl = qrCode.is_dynamic 
    ? `${window.location.origin}/r/${qrCode.short_code}`
    : qrCode.url;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1A2F2C] border border-white/10 rounded-[32px] w-full max-w-lg p-6 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-400/10 rounded-full flex items-center justify-center">
              <Edit2 className="text-cyan-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Editar QR Code</h2>
              <p className="text-zinc-500 text-sm">{qrCode.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="text-zinc-400" size={20} />
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#060E0D] rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">Tipo:</span>
            <span className={`text-sm font-bold ${qrCode.is_dynamic ? 'text-cyan-400' : 'text-zinc-400'}`}>
              {qrCode.is_dynamic ? 'Dinâmico ⚡' : 'Estático'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-zinc-500 text-sm">URL do QR Code:</span>
            <button
              onClick={() => window.open(redirectUrl, '_blank')}
              className="text-cyan-400 text-sm hover:underline flex items-center gap-1"
            >
              <ExternalLink size={12} />
              Ver
            </button>
          </div>

          {qrCode.is_dynamic && (
            <div className="bg-cyan-400/5 border border-cyan-400/20 rounded-lg p-2">
              <p className="text-cyan-400 text-xs">
                💡 QR Codes dinâmicos podem ter sua URL de destino alterada a qualquer momento
              </p>
            </div>
          )}
        </div>

        {/* Edição (apenas para dinâmicos) */}
        {qrCode.is_dynamic && (
          <div className="space-y-4">
            <div>
              <label className="text-zinc-500 text-sm block mb-2">URL de Destino</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://exemplo.com/destino"
                className="w-full bg-[#060E0D] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-400 outline-none transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-zinc-500 text-sm">Status</span>
              <button
                onClick={() => setIsActive(!isActive)}
                className="flex items-center gap-2 text-sm"
              >
                {isActive ? (
                  <>
                    <ToggleRight className="text-cyan-400" size={20} />
                    <span className="text-cyan-400">Ativo</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="text-zinc-600" size={20} />
                    <span className="text-zinc-600">Inativo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {qrCode.is_dynamic ? (
            <>
              <button
                onClick={handleSave}
                disabled={loading || !newUrl.trim()}
                className="flex-1 bg-cyan-400 text-[#060E0D] font-bold py-3 rounded-xl hover:bg-cyan-300 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#060E0D] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} />
                    Salvar
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 bg-zinc-800/50 rounded-xl p-4 text-center">
                <p className="text-zinc-500 text-sm">
                  QR Codes estáticos não podem ser editados
                </p>
                <p className="text-zinc-600 text-xs mt-1">
                  Crie um QR Code dinâmico para poder alterar a URL
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                Fechar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeEditor;

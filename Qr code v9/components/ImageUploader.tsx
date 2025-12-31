import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImage } from '../utils/imageValidation';
import { toast } from 'react-hot-toast';

interface ImageUploaderProps {
    onImageSelect: (base64: string) => void;
    currentImage?: string;
    onRemove?: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelect, currentImage, onRemove }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        setIsProcessing(true);

        try {
            const result = await validateImage(file);

            if (!result.valid) {
                toast.error(result.error || 'Erro ao validar imagem');
                return;
            }

            if (result.base64) {
                onImageSelect(result.base64);
                toast.success('Imagem adicionada com sucesso!');
            }
        } catch (err) {
            toast.error('Erro ao processar imagem');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleRemove = () => {
        if (onRemove) {
            onRemove();
            toast.success('Logo removido');
        }
    };

    if (currentImage) {
        return (
            <div className="relative">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src={currentImage}
                            alt="Logo preview"
                            className="w-12 h-12 object-contain rounded-lg bg-white/10"
                        />
                        <div>
                            <p className="text-sm font-bold text-white">Logo adicionado</p>
                            <p className="text-xs text-zinc-500">Clique para alterar</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Remover logo"
                    >
                        <X size={20} className="text-red-400" />
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        );
    }

    return (
        <div>
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
          border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
                        ? 'border-cyan-400 bg-cyan-500/10'
                        : 'border-white/10 hover:border-cyan-400/50 bg-white/5 hover:bg-white/10'
                    }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <div className="flex flex-col items-center gap-3">
                    {isProcessing ? (
                        <>
                            <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-bold text-white">Processando...</p>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                                {isDragging ? (
                                    <ImageIcon size={24} className="text-cyan-400" />
                                ) : (
                                    <Upload size={24} className="text-cyan-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white mb-1">
                                    {isDragging ? 'Solte a imagem aqui' : 'Adicionar Logo (Opcional)'}
                                </p>
                                <p className="text-xs text-zinc-500">
                                    PNG, JPG ou SVG • Máx 500KB • 500x500px
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                onChange={handleFileChange}
                className="hidden"
                disabled={isProcessing}
            />
        </div>
    );
};

export default ImageUploader;

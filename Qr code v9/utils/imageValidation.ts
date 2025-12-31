// Utilitário para validação de imagens
import { sanitizeText } from './sanitize';

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
    base64?: string;
    dimensions?: { width: number; height: number };
}

// Validar tipo de arquivo de imagem
export const validateImageType = (file: File): boolean => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    return validTypes.includes(file.type);
};

// Validar tamanho do arquivo (máximo 500KB)
export const validateImageSize = (file: File): boolean => {
    const maxSize = 500 * 1024; // 500KB
    return file.size <= maxSize;
};

// Converter imagem para base64
export const imageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler arquivo'));
        };

        reader.readAsDataURL(file);
    });
};

// Validar dimensões da imagem
export const validateImageDimensions = (base64: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            reject(new Error('Erro ao carregar imagem'));
        };

        img.src = base64;
    });
};

// Validação completa de imagem
export const validateImage = async (file: File): Promise<ImageValidationResult> => {
    // Validar tipo
    if (!validateImageType(file)) {
        return {
            valid: false,
            error: 'Tipo de arquivo inválido. Use PNG, JPG ou SVG.'
        };
    }

    // Validar tamanho
    if (!validateImageSize(file)) {
        return {
            valid: false,
            error: 'Arquivo muito grande. Máximo 500KB.'
        };
    }

    try {
        // Converter para base64
        const base64 = await imageToBase64(file);

        // Validar dimensões
        const dimensions = await validateImageDimensions(base64);

        const maxDimension = 500;
        if (dimensions.width > maxDimension || dimensions.height > maxDimension) {
            return {
                valid: false,
                error: `Dimensões muito grandes. Máximo ${maxDimension}x${maxDimension}px.`
            };
        }

        return {
            valid: true,
            base64,
            dimensions
        };
    } catch (err) {
        return {
            valid: false,
            error: err instanceof Error ? err.message : 'Erro ao processar imagem'
        };
    }
};

// Redimensionar imagem se necessário (mantém aspect ratio)
export const resizeImage = (base64: string, maxSize: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Erro ao criar canvas'));
                return;
            }

            let width = img.width;
            let height = img.height;

            // Calcular novas dimensões mantendo aspect ratio
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(img, 0, 0, width, height);

            resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
            reject(new Error('Erro ao carregar imagem'));
        };

        img.src = base64;
    });
};

// Utilitário para gerar QR Code com logo personalizado
import QRCodeLib from 'qrcode';

export interface QRCodeOptions {
    data: string;
    fgColor?: string;
    bgColor?: string;
    logoUrl?: string;
    logoSize?: number; // Porcentagem do tamanho do QR Code (10-30)
    size?: number;
}

/**
 * Gera um QR Code com logo opcional
 * @param options Opções de configuração do QR Code
 * @returns Promise com Data URL do QR Code gerado
 */
export const generateQRCodeWithLogo = async (options: QRCodeOptions): Promise<string> => {
    const {
        data,
        fgColor = '#000000',
        bgColor = '#ffffff',
        logoUrl,
        logoSize = 20,
        size = 300
    } = options;

    try {
        // Gerar QR Code base
        const qrCodeDataUrl = await QRCodeLib.toDataURL(data, {
            width: size,
            margin: 1,
            color: {
                dark: fgColor,
                light: bgColor
            },
            errorCorrectionLevel: logoUrl ? 'H' : 'M' // High error correction se tiver logo
        });

        // Se não tiver logo, retornar QR Code base
        if (!logoUrl) {
            return qrCodeDataUrl;
        }

        // Criar canvas para adicionar logo
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Erro ao criar canvas');
        }

        // Desenhar QR Code base
        const qrImage = new Image();
        await new Promise((resolve, reject) => {
            qrImage.onload = resolve;
            qrImage.onerror = reject;
            qrImage.src = qrCodeDataUrl;
        });

        ctx.drawImage(qrImage, 0, 0, size, size);

        // Carregar e desenhar logo
        const logoImage = new Image();
        logoImage.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
            logoImage.onload = resolve;
            logoImage.onerror = reject;
            logoImage.src = logoUrl;
        });

        // Calcular tamanho do logo (porcentagem do QR Code)
        const logoSizePixels = (size * logoSize) / 100;
        const logoX = (size - logoSizePixels) / 2;
        const logoY = (size - logoSizePixels) / 2;

        // Desenhar fundo branco circular atrás do logo para melhor contraste
        const padding = logoSizePixels * 0.1; // 10% de padding
        const bgSize = logoSizePixels + padding * 2;
        const bgX = (size - bgSize) / 2;
        const bgY = (size - bgSize) / 2;

        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, bgSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Desenhar logo
        ctx.drawImage(logoImage, logoX, logoY, logoSizePixels, logoSizePixels);

        // Retornar Data URL do canvas
        return canvas.toDataURL('image/png');
    } catch (err) {
        console.error('Erro ao gerar QR Code com logo:', err);
        // Em caso de erro, tentar retornar QR Code sem logo
        return QRCodeLib.toDataURL(data, {
            width: size,
            margin: 1,
            color: {
                dark: fgColor,
                light: bgColor
            }
        });
    }
};

/**
 * Gera QR Code simples sem logo (backward compatibility)
 */
export const generateQRCode = async (
    data: string,
    fgColor: string = '#000000',
    bgColor: string = '#ffffff',
    size: number = 300
): Promise<string> => {
    return generateQRCodeWithLogo({ data, fgColor, bgColor, size });
};

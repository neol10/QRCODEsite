// Sanitização de inputs para prevenir XSS e injeções

// Sanitizar string removendo HTML tags perigosas
export const sanitizeHTML = (input: string): string => {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
};

// Sanitizar URL para garantir que é válida e segura
export const sanitizeURL = (url: string): string => {
    try {
        const urlObj = new URL(url);

        // Permitir apenas protocolos seguros
        const allowedProtocols = ['http:', 'https:'];
        if (!allowedProtocols.includes(urlObj.protocol)) {
            throw new Error('Protocolo não permitido');
        }

        return urlObj.href;
    } catch (err) {
        throw new Error('URL inválida');
    }
};

// Sanitizar email
export const sanitizeEmail = (email: string): string => {
    const trimmed = email.trim().toLowerCase();

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        throw new Error('Email inválido');
    }

    return trimmed;
};

// Sanitizar nome (remover caracteres especiais perigosos)
export const sanitizeName = (name: string): string => {
    // Remover tags HTML
    const withoutHTML = sanitizeHTML(name);

    // Limitar tamanho
    const maxLength = 100;
    const trimmed = withoutHTML.trim().slice(0, maxLength);

    if (trimmed.length === 0) {
        throw new Error('Nome não pode ser vazio');
    }

    return trimmed;
};

// Sanitizar texto genérico
export const sanitizeText = (text: string, maxLength: number = 500): string => {
    const withoutHTML = sanitizeHTML(text);
    const trimmed = withoutHTML.trim().slice(0, maxLength);
    return trimmed;
};

// Sanitizar cor hexadecimal
export const sanitizeColor = (color: string): string => {
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    if (!colorRegex.test(color)) {
        throw new Error('Cor inválida. Use formato hexadecimal (#RRGGBB)');
    }

    return color.toLowerCase();
};

// Validar e sanitizar dados de QR Code
export interface QRCodeInput {
    name: string;
    url: string;
    campaign_name?: string;
    fg_color?: string;
    bg_color?: string;
}

export const sanitizeQRCodeInput = (input: QRCodeInput): QRCodeInput => {
    return {
        name: sanitizeName(input.name),
        url: sanitizeURL(input.url),
        campaign_name: input.campaign_name ? sanitizeText(input.campaign_name, 100) : undefined,
        fg_color: input.fg_color ? sanitizeColor(input.fg_color) : undefined,
        bg_color: input.bg_color ? sanitizeColor(input.bg_color) : undefined,
    };
};

// Validar e sanitizar dados de Lead
export interface LeadInput {
    name: string;
    email: string;
    city?: string;
    state?: string;
}

export const sanitizeLeadInput = (input: LeadInput): LeadInput => {
    return {
        name: sanitizeName(input.name),
        email: sanitizeEmail(input.email),
        city: input.city ? sanitizeText(input.city, 100) : undefined,
        state: input.state ? sanitizeText(input.state, 50) : undefined,
    };
};

// Sistema de rate limiting básico (client-side)
// Para produção, implemente rate limiting no backend/Edge Functions

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

class RateLimiter {
    private limits: Map<string, RateLimitEntry> = new Map();

    /**
     * Verifica se uma ação pode ser executada
     * @param key Identificador único da ação (ex: 'create_qr', 'capture_lead')
     * @param config Configuração de limite
     * @returns true se permitido, false se excedeu o limite
     */
    check(key: string, config: RateLimitConfig): boolean {
        const now = Date.now();
        const entry = this.limits.get(key);

        // Se não existe ou o tempo resetou, criar nova entrada
        if (!entry || now > entry.resetTime) {
            this.limits.set(key, {
                count: 1,
                resetTime: now + config.windowMs
            });
            return true;
        }

        // Se ainda está dentro da janela de tempo
        if (entry.count < config.maxRequests) {
            entry.count++;
            return true;
        }

        // Limite excedido
        return false;
    }

    /**
     * Retorna quanto tempo falta para resetar o limite
     * @param key Identificador da ação
     * @returns Milissegundos até o reset, ou 0 se não há limite ativo
     */
    getTimeUntilReset(key: string): number {
        const entry = this.limits.get(key);
        if (!entry) return 0;

        const now = Date.now();
        const remaining = entry.resetTime - now;
        return remaining > 0 ? remaining : 0;
    }

    /**
     * Limpa o limite de uma ação específica
     */
    reset(key: string): void {
        this.limits.delete(key);
    }

    /**
     * Limpa todos os limites
     */
    resetAll(): void {
        this.limits.clear();
    }
}

// Instância singleton
export const rateLimiter = new RateLimiter();

// Configurações pré-definidas
export const RateLimitConfigs = {
    // Criação de QR Code: máximo 10 por minuto
    CREATE_QR: {
        maxRequests: 10,
        windowMs: 60 * 1000 // 1 minuto
    },

    // Captura de Lead: máximo 5 por minuto
    CAPTURE_LEAD: {
        maxRequests: 5,
        windowMs: 60 * 1000
    },

    // Login: máximo 5 tentativas por 5 minutos
    LOGIN: {
        maxRequests: 5,
        windowMs: 5 * 60 * 1000
    },

    // Atualização de perfil: máximo 3 por minuto
    UPDATE_PROFILE: {
        maxRequests: 3,
        windowMs: 60 * 1000
    },

    // Busca/Query: máximo 30 por minuto
    SEARCH: {
        maxRequests: 30,
        windowMs: 60 * 1000
    }
};

// Helper para formatar tempo restante
export const formatTimeRemaining = (ms: number): string => {
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) {
        return `${seconds} segundo${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
};

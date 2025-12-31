// Sistema básico de analytics para rastrear eventos

export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp: string;
    userId?: string;
    sessionId: string;
}

class Analytics {
    private sessionId: string;
    private userId?: string;
    private events: AnalyticsEvent[] = [];

    constructor() {
        this.sessionId = this.getOrCreateSessionId();
    }

    private getOrCreateSessionId(): string {
        const key = 'neoqrc_session_id';
        let sessionId = sessionStorage.getItem(key);

        if (!sessionId) {
            sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessionStorage.setItem(key, sessionId);
        }

        return sessionId;
    }

    setUserId(userId: string): void {
        this.userId = userId;
    }

    track(eventName: string, properties?: Record<string, any>): void {
        const event: AnalyticsEvent = {
            name: eventName,
            properties,
            timestamp: new Date().toISOString(),
            userId: this.userId,
            sessionId: this.sessionId,
        };

        this.events.push(event);

        // Salvar em localStorage
        this.saveEvent(event);

        // Em produção, enviar para serviço de analytics
        if (!import.meta.env.DEV) {
            this.sendToAnalytics(event);
        }
    }

    private saveEvent(event: AnalyticsEvent): void {
        try {
            const key = 'neoqrc_analytics';
            const stored = localStorage.getItem(key);
            const events: AnalyticsEvent[] = stored ? JSON.parse(stored) : [];

            events.push(event);

            // Manter apenas os últimos 200 eventos
            if (events.length > 200) {
                events.shift();
            }

            localStorage.setItem(key, JSON.stringify(events));
        } catch (err) {
            console.error('Failed to save analytics event:', err);
        }
    }

    private sendToAnalytics(event: AnalyticsEvent): void {
        // TODO: Integrar com Google Analytics, Mixpanel, etc.
        // Exemplo: gtag('event', event.name, event.properties);
    }

    // Eventos pré-definidos
    pageView(pageName: string): void {
        this.track('page_view', { page: pageName });
    }

    qrCodeCreated(qrCodeId: string, type: string): void {
        this.track('qr_code_created', { qrCodeId, type });
    }

    leadCaptured(leadId: string, source?: string): void {
        this.track('lead_captured', { leadId, source });
    }

    userLogin(method: string): void {
        this.track('user_login', { method });
    }

    userLogout(): void {
        this.track('user_logout');
    }

    adminDashboardAccessed(): void {
        this.track('admin_dashboard_accessed');
    }

    errorOccurred(errorMessage: string, errorType: string): void {
        this.track('error_occurred', { errorMessage, errorType });
    }

    // Recuperar eventos
    getEvents(): AnalyticsEvent[] {
        try {
            const stored = localStorage.getItem('neoqrc_analytics');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    // Limpar eventos
    clearEvents(): void {
        localStorage.removeItem('neoqrc_analytics');
        this.events = [];
    }
}

// Instância singleton
export const analytics = new Analytics();

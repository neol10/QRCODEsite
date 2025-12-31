// Sistema de logging estruturado para monitoramento

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: Record<string, any>;
    userId?: string;
    error?: Error;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;

    private formatLog(entry: LogEntry): string {
        const parts = [
            `[${entry.timestamp}]`,
            `[${entry.level}]`,
            entry.userId ? `[User: ${entry.userId}]` : '',
            entry.message,
        ];

        return parts.filter(Boolean).join(' ');
    }

    private createEntry(
        level: LogLevel,
        message: string,
        context?: Record<string, any>,
        error?: Error
    ): LogEntry {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            context,
            error,
        };
    }

    private log(entry: LogEntry): void {
        const formatted = this.formatLog(entry);

        // Em desenvolvimento, sempre mostrar logs
        if (this.isDevelopment) {
            switch (entry.level) {
                case LogLevel.DEBUG:
                    console.debug(formatted, entry.context);
                    break;
                case LogLevel.INFO:
                    console.info(formatted, entry.context);
                    break;
                case LogLevel.WARN:
                    console.warn(formatted, entry.context);
                    break;
                case LogLevel.ERROR:
                    console.error(formatted, entry.context, entry.error);
                    break;
            }
        } else {
            // Em produção, apenas WARN e ERROR
            if (entry.level === LogLevel.WARN || entry.level === LogLevel.ERROR) {
                console.error(formatted, entry.context, entry.error);

                // Aqui você pode enviar para um serviço de monitoramento
                // como Sentry, LogRocket, etc.
                this.sendToMonitoring(entry);
            }
        }

        // Salvar em localStorage para debug (últimos 100 logs)
        this.saveToLocalStorage(entry);
    }

    private saveToLocalStorage(entry: LogEntry): void {
        try {
            const key = 'neoqrc_logs';
            const stored = localStorage.getItem(key);
            const logs: LogEntry[] = stored ? JSON.parse(stored) : [];

            logs.push(entry);

            // Manter apenas os últimos 100 logs
            if (logs.length > 100) {
                logs.shift();
            }

            localStorage.setItem(key, JSON.stringify(logs));
        } catch (err) {
            // Ignorar erros de localStorage
        }
    }

    private sendToMonitoring(entry: LogEntry): void {
        // TODO: Integrar com serviço de monitoramento
        // Exemplo: Sentry.captureException(entry.error)
    }

    debug(message: string, context?: Record<string, any>): void {
        this.log(this.createEntry(LogLevel.DEBUG, message, context));
    }

    info(message: string, context?: Record<string, any>): void {
        this.log(this.createEntry(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: Record<string, any>): void {
        this.log(this.createEntry(LogLevel.WARN, message, context));
    }

    error(message: string, error?: Error, context?: Record<string, any>): void {
        this.log(this.createEntry(LogLevel.ERROR, message, context, error));
    }

    // Métodos específicos para eventos do app
    userAction(action: string, details?: Record<string, any>): void {
        this.info(`User Action: ${action}`, details);
    }

    apiCall(endpoint: string, method: string, status?: number): void {
        this.info(`API Call: ${method} ${endpoint}`, { status });
    }

    performanceMetric(metric: string, value: number, unit: string = 'ms'): void {
        this.debug(`Performance: ${metric}`, { value, unit });
    }

    // Recuperar logs do localStorage
    getLogs(): LogEntry[] {
        try {
            const stored = localStorage.getItem('neoqrc_logs');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    }

    // Limpar logs
    clearLogs(): void {
        localStorage.removeItem('neoqrc_logs');
    }
}

// Instância singleton
export const logger = new Logger();

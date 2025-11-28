export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
}

class Logger {
    private formatTimestamp(): string {
        return new Date().toISOString();
    }

    private log(level: LogLevel, message: string, meta?: any): void {
        const timestamp = this.formatTimestamp();
        const logMessage = `[${timestamp}] [${level}] ${message}`;

        if (meta) {
            console.log(logMessage, meta);
        } else {
            console.log(logMessage);
        }
    }

    info(message: string, meta?: any): void {
        this.log(LogLevel.INFO, message, meta);
    }

    warn(message: string, meta?: any): void {
        this.log(LogLevel.WARN, message, meta);
    }

    error(message: string, meta?: any): void {
        this.log(LogLevel.ERROR, message, meta);
    }

    debug(message: string, meta?: any): void {
        if (process.env.NODE_ENV === 'development') {
            this.log(LogLevel.DEBUG, message, meta);
        }
    }
}

export const logger = new Logger();

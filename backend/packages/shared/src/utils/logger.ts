/**
 * Simple logger utility for microservices
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_COLORS = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    const color = LOG_COLORS[level];
    const reset = LOG_COLORS.reset;

    const prefix = `${color}[${timestamp}] [${this.serviceName}] [${level.toUpperCase()}]${reset}`;
    
    if (meta) {
      console.log(prefix, message, JSON.stringify(meta, null, 2));
    } else {
      console.log(prefix, message);
    }
  }

  debug(message: string, meta?: any) {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }
}

export const createLogger = (serviceName: string) => new Logger(serviceName);

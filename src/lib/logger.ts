/**
 * Structured Logging System
 * Cung cấp logging có cấu trúc và an toàn cho production
 */

import { isProduction, isDevelopment } from './env';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  service: string;
  requestId?: string;
  userId?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  meta?: Record<string, unknown>;
}

class Logger {
  private service: string;
  private minLevel: LogLevel;

  constructor(service: string = 'travelgo') {
    this.service = service;
    this.minLevel = isProduction ? LogLevel.INFO : LogLevel.DEBUG;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatLog(entry: LogEntry): string {
    if (isProduction) {
      // JSON format cho production (structured logging)
      return JSON.stringify(entry);
    } else {
      // Human-readable format cho development
      const levelNames = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
      const levelName = levelNames[entry.level];
      const timestamp = new Date(entry.timestamp).toLocaleTimeString();
      
      let output = `[${timestamp}] ${levelName} [${entry.service}] ${entry.message}`;
      
      if (entry.requestId) {
        output += ` [req:${entry.requestId}]`;
      }
      
      if (entry.userId) {
        output += ` [user:${entry.userId}]`;
      }
      
      if (entry.error) {
        output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
        if (entry.error.stack && isDevelopment) {
          output += `\n  Stack: ${entry.error.stack}`;
        }
      }
      
      if (entry.meta && Object.keys(entry.meta).length > 0) {
        output += `\n  Meta: ${JSON.stringify(entry.meta, null, 2)}`;
      }
      
      return output;
    }
  }

  private log(level: LogLevel, message: string, error?: Error, meta?: Record<string, unknown>, context?: { requestId?: string; userId?: string }) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      service: this.service,
      requestId: context?.requestId,
      userId: context?.userId,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: isDevelopment ? error.stack : undefined,
      } : undefined,
      meta: meta && Object.keys(meta).length > 0 ? meta : undefined,
    };

    const formattedLog = this.formatLog(entry);
    
    // Output to appropriate stream
    if (level >= LogLevel.ERROR) {
      console.error(formattedLog);
    } else if (level >= LogLevel.WARN) {
      console.warn(formattedLog);
    } else {
      console.log(formattedLog);
    }
  }

  debug(message: string, meta?: Record<string, unknown>, context?: { requestId?: string; userId?: string }) {
    this.log(LogLevel.DEBUG, message, undefined, meta, context);
  }

  info(message: string, meta?: Record<string, unknown>, context?: { requestId?: string; userId?: string }) {
    this.log(LogLevel.INFO, message, undefined, meta, context);
  }

  warn(message: string, error?: Error, meta?: Record<string, unknown>, context?: { requestId?: string; userId?: string }) {
    this.log(LogLevel.WARN, message, error, meta, context);
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>, context?: { requestId?: string; userId?: string }) {
    this.log(LogLevel.ERROR, message, error, meta, context);
  }
}

// Create logger instances for different services
export const logger = new Logger('travelgo');
export const authLogger = new Logger('auth');
export const dbLogger = new Logger('database');
export const apiLogger = new Logger('api');

// Error sanitization cho production
export const sanitizeError = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    // Trong production, chỉ trả về message an toàn
    if (isProduction) {
      // Whitelist các error messages an toàn
      const safeMessages = [
        'Invalid credentials',
        'User not found',
        'Validation failed',
        'Unauthorized',
        'Forbidden',
        'Not found',
        'Bad request',
        'Too many requests',
      ];
      
      if (safeMessages.some(safe => error.message.includes(safe))) {
        return { message: error.message };
      }
      
      // Default safe message
      return { message: 'An error occurred' };
    }
    
    // Development: trả về full error
    return { 
      message: error.message,
      code: error.name 
    };
  }
  
  return { message: 'Unknown error occurred' };
};

// Request context helper
export const createRequestContext = (requestId?: string, userId?: string) => ({
  requestId: requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  userId,
});

// Performance timing helper
export const createTimer = (operation: string) => {
  const start = performance.now();
  
  return {
    end: (meta?: Record<string, unknown>) => {
      const duration = performance.now() - start;
      logger.info(`Operation completed: ${operation}`, { 
        ...meta, 
        duration: `${duration.toFixed(2)}ms` 
      });
      return duration;
    }
  };
};

// Database error handler
export const handleDatabaseError = (error: unknown, operation: string, context?: { requestId?: string; userId?: string }) => {
  const sanitized = sanitizeError(error);
  
  dbLogger.error(`Database operation failed: ${operation}`, error instanceof Error ? error : undefined, {
    operation,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
  }, context);
  
  return sanitized;
};

// API error handler
export const handleApiError = (error: unknown, endpoint: string, context?: { requestId?: string; userId?: string }) => {
  const sanitized = sanitizeError(error);
  
  apiLogger.error(`API operation failed: ${endpoint}`, error instanceof Error ? error : undefined, {
    endpoint,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
  }, context);
  
  return sanitized;
};

// Authentication error handler
export const handleAuthError = (error: unknown, operation: string, context?: { requestId?: string; userId?: string }) => {
  const sanitized = sanitizeError(error);
  
  authLogger.error(`Authentication operation failed: ${operation}`, error instanceof Error ? error : undefined, {
    operation,
    errorType: error instanceof Error ? error.constructor.name : 'Unknown',
  }, context);
  
  return sanitized;
};

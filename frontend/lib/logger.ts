/**
 * Centralized logging service with sanitization
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = __DEV__;

  /**
   * Sanitizes sensitive data from objects
   */
  private sanitize(data: unknown): unknown {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== "object") {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item));
    }

    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "apiKey",
      "auth",
      "credential",
      "idToken",
      "accessToken",
      "refreshToken",
      "ssn",
      "creditCard",
      "cvv",
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive));

      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Formats error for logging
   */
  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}${error.stack ? `\n${error.stack}` : ""}`;
    }
    return String(error);
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: unknown): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: context ? (this.sanitize(context) as Record<string, unknown>) : undefined,
      error: error instanceof Error ? error : undefined,
    };

    // In production, only log errors and warnings
    if (!this.isDevelopment && (level === "debug" || level === "info")) {
      return;
    }

    const logMessage = `[${entry.timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case "debug":
        console.debug(logMessage, entry.context || "");
        break;
      case "info":
        console.info(logMessage, entry.context || "");
        break;
      case "warn":
        console.warn(logMessage, entry.context || "", error ? this.formatError(error) : "");
        break;
      case "error":
        console.error(logMessage, entry.context || "", error ? this.formatError(error) : "");
        // In production, you would send this to an error tracking service
        // Example: Sentry.captureException(error, { extra: entry.context });
        break;
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  warn(message: string, context?: Record<string, unknown>, error?: unknown): void {
    this.log("warn", message, context, error);
  }

  error(message: string, context?: Record<string, unknown>, error?: unknown): void {
    this.log("error", message, context, error);
  }
}

export const logger = new Logger();


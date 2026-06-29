import * as logger from 'firebase-functions/logger';

export const log = {
  info: (message: string, details?: unknown) => logger.info(message, details),
  warn: (message: string, details?: unknown) => logger.warn(message, details),
  error: (message: string, details?: unknown) => logger.error(message, details),
};

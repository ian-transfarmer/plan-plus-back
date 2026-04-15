import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const now = Date.now();

    res.on('finish', () => {
      const ms = Date.now() - now;
      const userId = req['user']?.sub || 'anonymous';
      const logMessage = `${method} ${originalUrl} ${res.statusCode} - ${ms}ms [${userId}]`;

      if (res.statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (res.statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}

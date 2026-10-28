import { NextFunction, Request, Response } from 'express';
import { Injectable, Logger, NestMiddleware } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    const { ip, method } = req;
    const userAgent = req.get('user-agent') || '';
    const time = Date.now();
    res.on('close', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length') ?? 0;
      this.logger.log(
        `${method} ${req.path} ${statusCode} ${contentLength}B ${Date.now() - time}ms ` +
          `- ${ip} ${userAgent}`
      );
    });
    next();
  }
}

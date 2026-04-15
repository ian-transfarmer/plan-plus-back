import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (status >= 500 && exception instanceof Error) {
      this.logger.error(exception.stack);
    }

    if (exception instanceof HttpException) {
      res.status(status).json(exception.getResponse());
    } else {
      res.status(status).json({
        statusCode: status,
        message: 'Internal Server Error',
      });
    }
  }
}

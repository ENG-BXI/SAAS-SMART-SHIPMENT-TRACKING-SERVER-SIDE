import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  BadGatewayException,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  intercept(_: any, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        console.log('====================================');
        console.log(err);
        console.log('====================================');
        return throwError(
          () =>
            new BadGatewayException({
              data: null,
              message: err.response.message || err.response || err.message,
              status: HttpStatus.BAD_REQUEST,
            }),
        );
      }),
    );
  }
}

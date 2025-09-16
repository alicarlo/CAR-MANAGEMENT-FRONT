import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';

const EXCLUDED_URLS = ['/auth/register', '/auth/login'];
const isExcluded = (url: string) => EXCLUDED_URLS.some(u => url.includes(u));

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (isExcluded(req.url)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const token = auth.tokenValue;

  if (!token) {
    return next(req);
  }

  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};

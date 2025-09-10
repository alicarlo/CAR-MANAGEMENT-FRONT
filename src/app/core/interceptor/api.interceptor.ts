import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

const EXCLUDED_URLS = ['/auth/register'];
const isExcluded = (url: string) => EXCLUDED_URLS.some(u => url.includes(u));

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (isExcluded(req.url)) return next(req);

  const auth = inject(Auth);

  return from(Promise.resolve(auth.currentUser)).pipe(
    switchMap(user => {
      if (!user) return next(req);
      return from(user.getIdToken()).pipe(

        switchMap(token => next(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        })))
      );
    })
  );
};


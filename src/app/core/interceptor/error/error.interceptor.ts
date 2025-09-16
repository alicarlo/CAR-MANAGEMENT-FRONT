// error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
const EXCLUDED_ERR = ['/auth/login', '/auth/register', '/auth/refresh'];

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastrService);
  const dialog = inject(MatDialog);

  const isExcluded =
    req.method === 'OPTIONS' ||
    EXCLUDED_ERR.some(u => req.url.includes(u));

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (!isExcluded && (err.status === 401 || err.status === 403)) {
        dialog.closeAll();
        toast.error('Su sesion ha expirado', 'Error');
        auth.clearSession();
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => err);
    })
  );
};

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

export const notAuthGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.tokenValue;
  return token ? router.createUrlTree(['/layout'], { queryParams: { returnUrl: state.url } }) : true
};
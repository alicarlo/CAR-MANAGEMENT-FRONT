import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionsService } from '../../services/permissions/permissions.service';

export const scopeGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const permissions = inject(PermissionsService);

  const scopes = route.data?.['scopes'];
  const matchMode = route.data?.['matchMode'] === 'all' ? 'all' : 'any';
  const requiredScopes = Array.isArray(scopes) ? scopes : scopes ? [scopes] : [];

  if (permissions.hasScopes(requiredScopes, matchMode)) {
    return true;
  }

  const fallbackRoute = permissions.getFirstAllowedDashboardRoute();
  return fallbackRoute === '/errors/404'
    ? router.createUrlTree(['/errors/404'])
    : router.createUrlTree([fallbackRoute]);
};

import { Injectable, inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

type MatchMode = 'any' | 'all';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {
  private _AuthService = inject(AuthService);
  private readonly dashboardRouteOrder: string[] = [
    'clients',
    'users',
    'roles',
    'scopes',
    'cars',
    'type-cars',
    'typ-documents',
    'typ-expense',
    'store',
    'expense-classification',
    'investor',
    'shopping',
    'type-payments',
    'documents',
    'arrival-review',
    'bills',
    'layaway',
    'sales',
    'incomes',
    'collections',
    'price-list',
    'documents-list',
    'floor-time',
    'report-sales',
    'report-comisions',
  ];

  private readonly routeScopeMap: Record<string, string[]> = {
    clients: ['CLIENT', 'CLIENT.GET'],
    users: ['USER', 'USER.GET'],
    roles: ['ROLE', 'ROLE.GET'],
    scopes: ['SCOPE', 'SCOPE.GET'],
    cars: ['CAR', 'CAR.GET'],
    'type-cars': ['CATALOGOS', 'CATALOGOS.CAR_TYPE.GET'],
    'typ-documents': ['CATALOGOS', 'CATALOGOS.DOCUMENT_TYPE.GET'],
    'typ-expense': ['CATALOGOS', 'CATALOGOS.BILL_TYPE.GET'],
    store: ['STORE', 'STORE.GET'],
    'expense-classification': ['CATALOGOS', 'CATALOGOS.CLASSIFICATION_BILL.GET'],
    investor: ['INVESTOR', 'INVESTOR.GET'],
    shopping: ['PURCHASE', 'PURCHASE.GET'],
    'type-payments': ['CATALOGOS', 'CATALOGOS.PAYMENT_METHOD.GET'],
    documents: ['DOCUMENTS', 'DOCUMENTS.GET'],
    'arrival-review': ['ARRIVAL', 'ARRIVAL.GET'],
    bills: ['BILL', 'BILL.GET'],
    layaway: ['LAYAWAY', 'LAYAWAY.GET'],
    sales: ['SALE', 'SALE.GET'],
    incomes: ['INCOME', 'INCOME.GET'],
    collections: ['COLLECTIONS', 'COLLECTIONS.GET'],
    'price-list': ['REPORTS.LISTADO_PRECIOS.GET'],
    'documents-list': ['REPORTS.LISTADO_DOCUMENTOS.GET'],
    'floor-time': ['REPORTS.TIEMPO_PISO.GET'],
    'report-sales': ['REPORTS.REPORTE_VENTAS.GET'],
    'report-comisions': ['REPORTS.COMISIONES.GET'],
  };

  get currentUser() {
    return this._AuthService.user();
  }

  get currentRoleName() {
    return String(this.currentUser?.role?.name ?? '').toUpperCase();
  }

  getScopeNames(): string[] {
    const directScopes = this.normalizeScopes(this.currentUser?.scope_list);
    const roleScopes = this.normalizeScopes((this.currentUser?.role as any)?.scopes);

    return Array.from(new Set([...directScopes, ...roleScopes]));
  }

  hasRole(roleName: string) {
    return this.currentRoleName === String(roleName ?? '').trim().toUpperCase();
  }

  hasScope(scopeName: string) {
    const normalizedScope = String(scopeName ?? '').trim().toUpperCase();
    if (!normalizedScope) {
      return false;
    }

    return this.getScopeNames().includes(normalizedScope);
  }

  hasScopes(scopes: string[] = [], matchMode: MatchMode = 'any') {
    if (!scopes.length) {
      console.warn('No scopes provided');
      return true;
    }

    const normalizedScopes = scopes
      .map((scope) => String(scope ?? '').trim().toUpperCase())
      .filter(Boolean);

    if (!normalizedScopes.length) {
      return true;
    }

    return matchMode === 'all'
      ? normalizedScopes.every((scope) => this.hasScope(scope))
      : normalizedScopes.some((scope) => this.hasScope(scope));

  }

  canAccessRoute(route: string | null | undefined) {
    const normalizedRoute = this.normalizeRoute(route);
    if (!normalizedRoute) {
      return true;
    }

    const requiredScopes = this.routeScopeMap[normalizedRoute];
    if (!requiredScopes?.length) {
      return true;
    }

    return this.hasScopes(requiredScopes, 'any');
  }

  getFirstAllowedDashboardRoute() {
    const firstAllowedRoute = this.dashboardRouteOrder.find((route) => this.canAccessRoute(route));
    return firstAllowedRoute ? `/layout/dashboard/${firstAllowedRoute}` : '/errors/404';
  }

  private normalizeScopes(scopes: any): string[] {
    return Array.from(
      new Set(
        this.collectScopeNames(scopes)
          .map((scope) => String(scope ?? '').trim().toUpperCase())
          .filter((scope) => this.isLikelyScopeName(scope))
      )
    );
  }

  private collectScopeNames(value: any): string[] {
    if (!value) {
      return [];
    }

    if (typeof value === 'string') {
      return [value];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) => this.collectScopeNames(item));
    }

    if (typeof value === 'object') {
      return Object.values(value).flatMap((item) => this.collectScopeNames(item));
    }

    return [];
  }

  private isLikelyScopeName(value: string) {
    return /^[A-Z]+(?:[._][A-Z]+)*$/.test(String(value ?? '').trim().toUpperCase());
  }

  private normalizeRoute(route: string | null | undefined) {
    return String(route ?? '')
      .replace(/^\/+/, '')
      .replace(/^layout\/dashboard\//, '')
      .replace(/^dashboard\//, '')
      .replace(/^layout\//, '')
      .trim();
  }
}

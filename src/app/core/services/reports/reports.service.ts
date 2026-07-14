import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerLayaway(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.post<any>(`${environment.apiUrl}/layaway/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getReports(filters?: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    let filtersSend = Object.keys(filters).length === 0 ? '?sort_by=updated_at' : `?filters=${JSON.stringify(filters)}&sort_by=updated_at`

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.get<any>(`${environment.apiUrl}/reports/listado_precios${filtersSend}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getReportsDocuments(filters?: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    let filtersSend = Object.keys(filters).length === 0 ? '?sort_by=updated_at' : `?filters=${JSON.stringify(filters)}&sort_by=updated_at`

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.get<any>(`${environment.apiUrl}/reports/listado_documentos${filtersSend}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getFloorTimeReports(filters?: any, dateFrom: string = '', dateTo: string = ''): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const hasFilters = filters && Object.keys(filters).length > 0;
    const params: string[] = [];

    if (hasFilters) {
      params.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    }

    params.push('sort_by=updated_at');

    if (dateFrom) {
      params.push(`date_from=${encodeURIComponent(dateFrom)}`);
    }

    if (dateTo) {
      params.push(`date_to=${encodeURIComponent(dateTo)}`);
    }

    const queryString = `?${params.join('&')}`;

    return this.http.get<any>(`${environment.apiUrl}/reports/tiempo_piso${queryString}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getSalesReports(pageSize?: number, currentPage?: number, filters: any = {}, dateFrom: string = '', dateTo: string = ''): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const params: string[] = [];

    if (filters && Object.keys(filters).length > 0) {
      params.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    }

    if (currentPage != null) {
      params.push(`page=${currentPage}`);
    }

    if (pageSize != null) {
      params.push(`limit=${pageSize}`);
    }

    params.push('sort_by=updated_at');

    if (dateFrom) {
      params.push(`date_from=${encodeURIComponent(dateFrom)}`);
    }

    if (dateTo) {
      params.push(`date_to=${encodeURIComponent(dateTo)}`);
    }

    return this.http.get<any>(`${environment.apiUrl}/reports/ventas?${params.join('&')}`, httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getComisionsReports(pageSize?: number, currentPage?: number, filters: any = {}, dateFrom: string = '', dateTo: string = ''): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const params: string[] = [];

    if (filters && Object.keys(filters).length > 0) {
      params.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    }

    if (currentPage != null) {
      params.push(`page=${currentPage}`);
    }

    if (pageSize != null) {
      params.push(`limit=${pageSize}`);
    }

    params.push('sort_by=updated_at');

    if (dateFrom) {
      params.push(`date_from=${encodeURIComponent(dateFrom)}`);
    }

    if (dateTo) {
      params.push(`date_to=${encodeURIComponent(dateTo)}`);
    }

    return this.http.get<any>(`${environment.apiUrl}/reports/comisiones?${params.join('&')}`, httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

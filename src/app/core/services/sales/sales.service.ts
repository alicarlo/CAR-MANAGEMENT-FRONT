import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerSale(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<any>(`${environment.apiUrl}/sale/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getSale(pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/sale/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getSalesFiltered(
    pageSize?: number,
    currentPage?: number,
    filters: any = {},
    dateFrom: string = '',
    dateTo: string = ''
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    const params: string[] = [];
    const hasFilters = filters && Object.keys(filters).length > 0;
    const hasAnyFilter = hasFilters || !!dateFrom || !!dateTo;

    if (hasFilters) {
      params.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    } else if (!hasAnyFilter) {
      params.push('column=status');
      params.push('value=active');
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

    const endpoint = hasAnyFilter ? '/sale/all' : '/sale/';

    return this.http.get<any>(`${environment.apiUrl}${endpoint}?${params.join('&')}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteSale(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<any>(`${environment.apiUrl}/sale/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getSalesClient(pageSize?: number, currentPage?: number, id?: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/sale/client/${id}?column=sales_type&value=credito&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getContractSale(id: string): Observable<string> {
    return this.http.get(
      `${environment.apiUrl}/contract/sale/${id}`,
      {
        responseType: 'text'
      }
    );
  }
}

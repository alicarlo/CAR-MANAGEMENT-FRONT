import { inject, Injectable } from '@angular/core';
import { Clients } from '../../models/clients.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public getBillsInvestor(id: string, pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/bill/investor/${id}?page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }


  public getBillCar(id: string, pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/bill/car/${id}?page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }


  public getBills(
    pageSize?: number,
    currentPage?: number,
    filter?: string,
    filters: any = {},
    dateFrom: string = '',
    dateTo: string = ''
  ): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    const params: string[] = [];
    const hasStructuredFilters = filters && Object.keys(filters).length > 0;
    const hasAnyFilter = hasStructuredFilters || !!filter || !!dateFrom || !!dateTo;

    if (hasStructuredFilters) {
      params.push(`filters=${encodeURIComponent(JSON.stringify(filters))}`);
    } else if (filter) {
      params.push(`column=name`);
      params.push(`value=${encodeURIComponent(filter)}`);
    } else {
      params.push('column=status');
      params.push('value=active');
    }

    params.push(`page=${currentPage}`);
    params.push(`limit=${pageSize}`);
    params.push('sort_by=updated_at');

    if (dateFrom) {
      params.push(`date_from=${encodeURIComponent(dateFrom)}`);
    }

    if (dateTo) {
      params.push(`date_to=${encodeURIComponent(dateTo)}`);
    }

    const endpoint = hasAnyFilter ? '/bill/all' : '/bill/';

    return this.http.get<any>(`${environment.apiUrl}${endpoint}?${params.join('&')}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public registerBill(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<any>(`${environment.apiUrl}/bill/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateBill(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<any>(`${environment.apiUrl}/bill/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteBill(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<any>(`${environment.apiUrl}/bill/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }


  public updateIntallment(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<any>(`${environment.apiUrl}/installment/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public registerIncome(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<any>(`${environment.apiUrl}/income/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateIncome(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<any>(`${environment.apiUrl}/income/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteIncome(id: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<any>(`${environment.apiUrl}/income/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }


   public getIncomes(pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/income/?column=status&value=pendiente_aprobacion&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getIncomesWithOutFilter(pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/income/?page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getIncomesFiltered(
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

    if (hasFilters) {
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

    return this.http.get<any>(`${environment.apiUrl}/income/?${params.join('&')}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

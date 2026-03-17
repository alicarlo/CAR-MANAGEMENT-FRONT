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
}

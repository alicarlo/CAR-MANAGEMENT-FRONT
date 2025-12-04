import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { TypePayments } from '../../models/typePayments.model';

@Injectable({
  providedIn: 'root'
})
export class TypePaymentsService {
private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerTypePayments(bodyData: TypePayments): Observable<TypePayments> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<TypePayments>(`${environment.apiUrl}/payment-method/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateTypePayments(bodyData: TypePayments): Observable<TypePayments> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<TypePayments>(`${environment.apiUrl}/payment-method/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getTypePayments(pageSize?: number, currentPage?: number): Observable<TypePayments> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<TypePayments>(`${environment.apiUrl}/payment-method/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteTypePayments(id: string): Observable<TypePayments> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<TypePayments>(`${environment.apiUrl}/payment-method/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

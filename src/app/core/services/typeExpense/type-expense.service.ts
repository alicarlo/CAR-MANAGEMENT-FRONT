import { inject, Injectable } from '@angular/core';
import { TypeExpense } from '../../models/typeExpense.model';
import { TypeDocument } from '../../models/typeDocument';
import { catchError, Observable, retry } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class TypeExpenseService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerTypeExpense(bodyData: TypeExpense): Observable<TypeExpense> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<TypeExpense>(`${environment.apiUrl}/bill-type/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateTypeExpense(bodyData: TypeExpense): Observable<TypeExpense> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<TypeExpense>(`${environment.apiUrl}/bill-type/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getTypeExpense(pageSize?: number, currentPage?: number): Observable<TypeExpense> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<TypeExpense>(`${environment.apiUrl}/bill-type/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteTypeExpense(id: string): Observable<TypeDocument> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<TypeDocument>(`${environment.apiUrl}/bill-type/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getPurchase(pageSize?: number, currentPage?: number): Observable<TypeExpense> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<TypeExpense>(`${environment.apiUrl}/purchase/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

   public deletePurchase(id: string): Observable<TypeDocument> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<TypeDocument>(`${environment.apiUrl}/purchase/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

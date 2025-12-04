import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { TypeCars } from '../../models/typeCars.model';
import { environment } from 'src/environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { ExpenseClasification } from '../../models/expenseClasification';

@Injectable({
  providedIn: 'root'
})
export class ExpenseClasificationService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerExpenseClasification(bodyData: ExpenseClasification): Observable<ExpenseClasification> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<ExpenseClasification>(`${environment.apiUrl}/classification-bill/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateExpenseClasification(bodyData: ExpenseClasification): Observable<ExpenseClasification> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<ExpenseClasification>(`${environment.apiUrl}/classification-bill/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getExpenseClasification(pageSize?: number, currentPage?: number): Observable<TypeCars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<TypeCars>(`${environment.apiUrl}/classification-bill/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteExpenseClasification(id: string): Observable<TypeCars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<TypeCars>(`${environment.apiUrl}/classification-bill/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Shopping } from '../../models/shopping.model';


@Injectable({
  providedIn: 'root'
})
export class ShopingService {
 private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerShopping(bodyData: Shopping): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Shopping>(`${environment.apiUrl}/purchase/pre-register`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateShopping(bodyData: Shopping): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Shopping>(`${environment.apiUrl}/purchase/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getShopping(pageSize?: number, currentPage?: number): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Shopping>(`${environment.apiUrl}/purchase/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteShopping(id: string): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Shopping>(`${environment.apiUrl}/purchase/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public registerPayment(bodyData: Shopping): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Shopping>(`${environment.apiUrl}/payment/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updatePayment(bodyData: Shopping): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Shopping>(`${environment.apiUrl}/payment/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getPayment(pageSize?: number, currentPage?: number, id?: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/payment/?column=purchase_id&value=${id}&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getPaymentBill(pageSize?: number, currentPage?: number, id?: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/payment/?column=bill_id&value=${id}&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deletePayment(id: string): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Shopping>(`${environment.apiUrl}/payment/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

   public getInvestorPurchase(investorId: string ,pageSize?: number, currentPage?: number): Observable<Shopping> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Shopping>(`${environment.apiUrl}/purchase/?column=investor_id&value=${investorId}&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

}

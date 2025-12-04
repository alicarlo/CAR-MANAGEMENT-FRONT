import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Investor } from '../../models/investor.model';
import { environment } from 'src/environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { Investment } from '../../models/investment.model';

@Injectable({
  providedIn: 'root'
})
export class InvestorService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerInvestor(bodyData: Investor): Observable<Investor> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Investor>(`${environment.apiUrl}/investor/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateInvestor(bodyData: Investor): Observable<Investor> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Investor>(`${environment.apiUrl}/investor/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getInvestor(pageSize?: number, currentPage?: number): Observable<Investor> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Investor>(`${environment.apiUrl}/investor/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteInvestor(id: string): Observable<Investor> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Investor>(`${environment.apiUrl}/investor/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public registerInvestment(bodyData: Investment): Observable<Investment> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Investment>(`${environment.apiUrl}/investment/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateInvestment(bodyData: Investment): Observable<Investment> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Investment>(`${environment.apiUrl}/investment/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getInvestment(pageSize?: number, currentPage?: number): Observable<Investment> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Investment>(`${environment.apiUrl}/investment/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteInvestment(id: string): Observable<Investment> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Investment>(`${environment.apiUrl}/investment/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

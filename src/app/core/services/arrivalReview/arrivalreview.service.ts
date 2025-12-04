import { inject, Injectable } from '@angular/core';
import { Clients } from '../../models/clients.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArrivalreviewService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public getArrival(pageSize?: number, currentPage?: number): Observable<Clients> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Clients>(`${environment.apiUrl}/arrival/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public registerArrival(bodyData: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
      return this.http.post<any>(`${environment.apiUrl}/arrival/`, bodyData ,httpOptions).pipe(
        retry(0),
        catchError(this.error.handleError)
      );
    }
  
    public updateArrival(bodyData: any): Observable<any> {
      const httpOptions = {
        headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      };
      return this.http.patch<any>(`${environment.apiUrl}/arrival/${bodyData.id}`, bodyData ,httpOptions).pipe(
        retry(0),
        catchError(this.error.handleError)
      );
    }
}

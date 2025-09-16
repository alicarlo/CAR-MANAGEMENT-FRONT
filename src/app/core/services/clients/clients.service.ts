import { inject, Injectable } from '@angular/core';
import { Clients } from '../../models/clients.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerClient(bodyData: Clients): Observable<Clients> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Clients>(`${environment.apiUrl}/client/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateClient(bodyData: Clients): Observable<Clients> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Clients>(`${environment.apiUrl}/client/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getClient(pageSize?: number, currentPage?: number): Observable<Clients> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Clients>(`${environment.apiUrl}/client/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteClient(id: string): Observable<Clients> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Clients>(`${environment.apiUrl}/client/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

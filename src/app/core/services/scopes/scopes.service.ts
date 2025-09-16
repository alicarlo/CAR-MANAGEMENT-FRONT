import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { Scopes } from '../../models/scopes.model';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScopesService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerScope(bodyData: Scopes): Observable<Scopes> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Scopes>(`${environment.apiUrl}/scope/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public updateScope(bodyData: Scopes): Observable<Scopes> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Scopes>(`${environment.apiUrl}/scope/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getScopes(pageSize?: number, currentPage?: number): Observable<Scopes> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<Scopes>(`${environment.apiUrl}/scope/?column=status&value=active&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteScopes(id: string): Observable<Scopes> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Scopes>(`${environment.apiUrl}/scope/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

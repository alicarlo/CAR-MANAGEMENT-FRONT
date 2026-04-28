import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, retry } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorHandlerService } from '../error-handler/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerLayaway(bodyData: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.post<any>(`${environment.apiUrl}/layaway/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getReports(filters?: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    let filtersSend = Object.keys(filters).length === 0 ? '?sort_by=updated_at' : `?filters=${JSON.stringify(filters)}&sort_by=updated_at`

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.get<any>(`${environment.apiUrl}/reports/listado_precios${filtersSend}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getReportsDocuments(filters?: any): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    let filtersSend = Object.keys(filters).length === 0 ? '?sort_by=updated_at' : `?filters=${JSON.stringify(filters)}&sort_by=updated_at`

    // /reports/listado_precios?filters={json_string}&sort_by=updated_at
    return this.http.get<any>(`${environment.apiUrl}/reports/listado_documentos${filtersSend}` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

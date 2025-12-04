import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { environment } from 'src/environments/environment';
import { catchError, Observable, retry } from 'rxjs';
import { Cars } from '../../models/cars.model';

@Injectable({
  providedIn: 'root'
})
export class CarsService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);
  constructor() { }

  public registerCars(bodyData: Cars): Observable<Cars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<Cars>(`${environment.apiUrl}/car/`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getCarInvestor(id: string, pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/car/investor/${id}?page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getCarDocuments(id: string, pageSize?: number, currentPage?: number): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.get<any>(`${environment.apiUrl}/document/car/${id}?page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }


  public updateCars(bodyData: Cars): Observable<Cars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.patch<Cars>(`${environment.apiUrl}/car/${bodyData.id}`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public getCars(filter: string = '', pageSize?: number, currentPage?: number, active: string = 'active'): Observable<Cars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };

    let column = filter.length ? 'all' : 'status';
    let filterSearch = filter.length ? filter : active;
    return this.http.get<Cars>(`${environment.apiUrl}/car/?column=${column}&value=${filterSearch}&page=${currentPage}&limit=${pageSize}&sort_by=updated_at` ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

  public deleteCars(id: string): Observable<Cars> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.delete<Cars>(`${environment.apiUrl}/car/${id}` ,{ responseType: 'text' as 'json' }).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ErrorHandlerService } from '../error-handler/error-handler.service';
import { catchError, Observable, retry } from 'rxjs';
import { LoginUser, RegisterUser, UserResponse, UserSet } from '../../models/auth.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private error = inject(ErrorHandlerService);

  TOKEN_KEY = 'access_token';
  USER_KEY  = 'user';

  private _token = signal<string | null>(null);
  token = computed(() => this._token());
  
  private _user = signal<UserSet | null>(null);
  readonly user = this._user.asReadonly();
  // user = computed(() => this._user());

  initFromStorage() {
    const t = sessionStorage.getItem(this.TOKEN_KEY);
    const u = sessionStorage.getItem(this.USER_KEY);
    if (t) this._token.set(t);
    if (u) this._user.set(JSON.parse(u));
  }

  setSession(accessToken: string, user: UserSet) {
    this._token.set(accessToken);
    this._user.set(user);
    sessionStorage.setItem(this.TOKEN_KEY, accessToken);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clearSession() {
    this._token.set(null);
    this._user.set(null);
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  }

  get tokenValue() { return this._token(); }

  isTokenExpired(): boolean {
    const t = this._token();
    if (!t) return true;
    return false
  }

  public registerUser(bodyData: RegisterUser): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post(`${environment.apiUrl}/auth/register`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)
    );
  }

   public loginUser(bodyData: LoginUser): Observable<UserResponse> {
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    };
    return this.http.post<UserResponse>(`${environment.apiUrl}/auth/login`, bodyData ,httpOptions).pipe(
      retry(0),
      catchError(this.error.handleError)  
    );
  }
}

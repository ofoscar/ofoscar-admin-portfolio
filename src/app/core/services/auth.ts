import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface AdminUser {
  email: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  private user = signal<AdminUser | null>(null);

  isAuthenticated = computed(() => this.user() !== null);

  currentUser = this.user.asReadonly();

  login(username: string, password: string) {
    const body = new HttpParams().set('username', username).set('password', password);

    return this.http
      .post<void>(`${this.apiUrl}/auth/login`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        withCredentials: true,
      })
      .pipe(switchMap(() => this.checkSession()));
  }

  checkSession() {
    return this.http.get<AdminUser>(`${this.apiUrl}/auth/me`, { withCredentials: true }).pipe(
      tap((user) => this.user.set(user)),
      map(() => true),
      catchError(() => {
        this.user.set(null);
        return of(false);
      }),
    );
  }

  logout() {
    return this.http
      .post<void>(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.user.set(null)));
  }
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  access_token: string;
  token_type: string;
}
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  private accessToken = signal<string | null>(null);

  isAuthenticated = computed(() => this.accessToken() !== null);

  getToken(): string | null {
    return this.accessToken();
  }

  login(username: string, password: string) {
    const body = new HttpParams().set('username', username).set('password', password);
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      .pipe(
        tap((response) => {
          this.accessToken.set(response.access_token);
        }),
      );
  }

  logout(): void {
    this.accessToken.set(null);
  }
}

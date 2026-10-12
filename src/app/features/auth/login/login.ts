import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder).nonNullable;
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    username: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.loading.set(true);
    this.error.set(null);

    this.authService
      .login(username, password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

          const destination =
            returnUrl?.startsWith('/') &&
            !returnUrl.startsWith('//') &&
            !returnUrl.startsWith('/\\')
              ? returnUrl
              : '/admin';

          this.router.navigateByUrl(destination);
        },
        error: (err: HttpErrorResponse) => {
          console.error('LOGIN FAILED', {
            status: err.status,
            statusText: err.statusText,
            url: err.url,
            message: err.message,
            response: err.error,
            headers: err.headers?.keys() ?? [],
          });

          if (err.status === 401) {
            this.error.set('Invalid email or password');
          } else {
            this.error.set('Unable to log in. Please try again');
          }
        },
      });
  }
}

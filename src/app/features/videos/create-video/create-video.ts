import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { VideosService } from '../../../core/services/videos';
import { VideoCategory, VideoCreate, VideoType } from '../video.model';

@Component({
  selector: 'app-create-video',
  imports: [ReactiveFormsModule],
  templateUrl: './create-video.html',
  styleUrl: './create-video.scss',
})
export class CreateVideo {
  private fb = inject(FormBuilder).nonNullable;
  private videosService = inject(VideosService);
  private router = inject(Router);

  readonly videoTypes = Object.values(VideoType);
  readonly videoCategories = Object.values(VideoCategory);
  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    slug: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
    type: [VideoType.SHORT_FORM, Validators.required],
    date_uploaded: [this.toLocalDateTimeValue(new Date()), Validators.required],
    category: [VideoCategory.SOFTWARE_DEVELOPMENT, Validators.required],
    link: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^https?:\/\/.+/)]],
  });

  onSubmit(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    const video: VideoCreate = {
      ...values,
      date_uploaded: new Date(values.date_uploaded).toISOString(),
    };

    this.saving.set(true);
    this.error.set(null);
    this.videosService
      .createVideo(video)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/admin/videos']),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.status === 401 ? 'Authentication required.' : 'Failed to create video.');
        },
      });
  }

  private toLocalDateTimeValue(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
}

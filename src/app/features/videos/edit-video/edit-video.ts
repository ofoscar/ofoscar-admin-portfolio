import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { VideosService } from '../../../core/services/videos';
import { ImageUploader } from '../../../shared/image-uploader/image-uploader';
import { Video, VideoCategory, VideoType } from '../video.model';

@Component({
  selector: 'app-edit-video',
  imports: [ReactiveFormsModule, RouterLink, ImageUploader],
  templateUrl: './edit-video.html',
  styleUrl: './edit-video.scss',
})
export class EditVideo {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private videosService = inject(VideosService);

  readonly videoTypes = Object.values(VideoType);
  readonly videoCategories = Object.values(VideoCategory);
  videoId = Number(this.route.snapshot.paramMap.get('id'));
  loading = signal(true);
  saving = signal(false);
  thumbnailUploading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    slug: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(300)]],
    type: [VideoType.SHORT_FORM, Validators.required],
    date_uploaded: ['', Validators.required],
    category: [VideoCategory.SOFTWARE_DEVELOPMENT, Validators.required],
    link: [
      '',
      [Validators.required, Validators.maxLength(100), Validators.pattern(/^https?:\/\/.+/)],
    ],
    thumbnail_url: [''],
  });

  onThumbnailUploaded(url: string): void {
    this.form.controls.thumbnail_url.setValue(url);
  }

  constructor() {
    if (!Number.isSafeInteger(this.videoId) || this.videoId <= 0) {
      this.error.set('Invalid video ID.');
      this.loading.set(false);
      return;
    }

    this.loadVideo();
  }

  loadVideo(): void {
    this.loading.set(true);
    this.error.set(null);

    this.videosService
      .getVideo(this.videoId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (video) => {
          this.form.patchValue(this.videoToFormValue(video));
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.status === 404 ? 'Video not found.' : 'Failed to load video.');
        },
      });
  }

  saveVideo(): void {
    if (this.form.invalid || this.saving() || this.thumbnailUploading()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.saving.set(true);
    this.error.set(null);

    this.videosService
      .updateVideo(this.videoId, {
        ...values,
        date_uploaded: new Date(values.date_uploaded).toISOString(),
        thumbnail_url: values.thumbnail_url || null,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/admin/videos']),
        error: (err: HttpErrorResponse) => {
          this.error.set(err.status === 401 ? 'Authentication required.' : 'Failed to update video.');
        },
      });
  }

  private videoToFormValue(video: Video) {
    return {
      title: video.title,
      slug: video.slug,
      type: video.type,
      date_uploaded: this.toLocalDateTimeValue(new Date(video.date_uploaded)),
      category: video.category,
      link: video.link,
      thumbnail_url: video.thumbnail_url ?? '',
    };
  }

  private toLocalDateTimeValue(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 16);
  }
}

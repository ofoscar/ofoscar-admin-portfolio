import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ImageUploadService } from '../../core/services/image-upload';

@Component({
  selector: 'app-image-uploader',
  imports: [],
  templateUrl: './image-uploader.html',
  styleUrl: './image-uploader.scss',
})
export class ImageUploader {
  private imageUploadService = inject(ImageUploadService);

  label = input('Upload image');
  disabled = input(false);

  imageUploaded = output<string>();
  uploadingChange = output<boolean>();

  uploading = signal(false);
  error = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];

    if (!file || this.uploading() || this.disabled()) {
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.error.set('Unsupported image format.');
      inputElement.value = '';
      return;
    }

    if (file.size >= 5 * 1024 * 1024) {
      this.error.set('Image must be smaller than 5 MB.');
      inputElement.value = '';
      return;
    }

    this.uploading.set(true);
    this.uploadingChange.emit(true);
    this.error.set(null);

    this.imageUploadService
      .uploadImage(file)
      .pipe(
        finalize(() => {
          this.uploading.set(false);
          this.uploadingChange.emit(false);
          inputElement.value = '';
        }),
      )
      .subscribe({
        next: (response) => {
          this.imageUploaded.emit(response.url);
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(
            err.status === 413
              ? 'Image is too large.'
              : err.status === 401
                ? 'Your session has expired.'
                : 'Unable to upload image.',
          );
        },
      });
  }
}

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ImageUploadService } from '../../../core/services/image-upload';
import { ProjectsService } from '../../../core/services/projects';
import { ProjectCreate } from '../project.model';

@Component({
  selector: 'app-create-project',
  imports: [ReactiveFormsModule],
  templateUrl: './create-project.html',
  styleUrl: './create-project.scss',
})
export class CreateProject {
  private projectsService = inject(ProjectsService);
  private router = inject(Router);
  private imageUploadService = inject(ImageUploadService);

  private fb = inject(FormBuilder).nonNullable;

  saving = signal(false);
  error = signal<string | null>(null);

  uploadingImage = signal(false);
  uploadError = signal<string | null>(null);

  tagInput = signal('');
  highlightInput = signal('');

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

    hook: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],

    description: ['', [Validators.required, Validators.minLength(10)]],

    github_url: ['', Validators.pattern(/^https?:\/\/.+/)],

    demo_url: ['', Validators.pattern(/^https?:\/\/.+/)],

    cover_image_url: [''],

    published: [false],

    tags: this.fb.array<string>([]),

    highlights: this.fb.array<string>([]),
  });

  get tags() {
    return this.form.controls.tags;
  }

  addTag(): void {
    const tag = this.tagInput().trim();

    if (!tag || tag.length > 25) return;

    if (this.tags.controls.some((control) => control.value === tag)) return;

    this.tags.push(this.fb.control(tag));

    this.tagInput.set('');
  }

  removeTag(index: number): void {
    this.tags.removeAt(index);
  }
  get highlights() {
    return this.form.controls.highlights;
  }

  addHighlight(): void {
    const highlight = this.highlightInput().trim();

    if (!highlight || highlight.length > 25) return;

    if (this.highlights.controls.some((control) => control.value === highlight)) return;

    this.highlights.push(this.fb.control(highlight));

    this.highlightInput.set('');
  }

  removeHighlight(index: number): void {
    this.highlights.removeAt(index);
  }

  onCoverImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      this.uploadError.set('Unsupported image format.');
      input.value = '';
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      this.uploadError.set('Image must me smaller than 5 MB');
      input.value = '';
      return;
    }

    if (this.uploadingImage()) return;

    this.uploadingImage.set(true);
    this.uploadError.set(null);

    this.imageUploadService
      .uploadImage(file)
      .pipe(
        finalize(() => {
          this.uploadingImage.set(false);
          input.value = '';
        }),
      )
      .subscribe({
        next: (response) => {
          this.form.patchValue({
            cover_image_url: response.url,
          });
        },
        error: (err: HttpErrorResponse) => {
          console.error('Image upload failed: ', err);

          if (err.status === 401) {
            this.uploadError.set('Please log in again');
          } else if (err.status === 413) {
            this.uploadError.set('Image is too large');
          } else {
            this.uploadError.set('Failed to upload image');
          }
        },
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const project: ProjectCreate = {
      ...values,
      github_url: values.github_url || null,
      demo_url: values.demo_url || null,
      cover_image_url: values.cover_image_url || null,
      images: [],
    };

    this.saving.set(true);
    this.error.set(null);

    this.projectsService
      .createProject(project)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/projects']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.error.set('Authentication required.');
          } else {
            this.error.set('Failed to create project');
          }
        },
      });

    console.log(this.form.getRawValue());
  }
}

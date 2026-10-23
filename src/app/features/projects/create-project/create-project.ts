import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects';
import { ImageUploader } from '../../../shared/image-uploader/image-uploader';
import { ProjectCreate } from '../project.model';

@Component({
  selector: 'app-create-project',
  imports: [ReactiveFormsModule, ImageUploader],
  templateUrl: './create-project.html',
  styleUrl: './create-project.scss',
})
export class CreateProject {
  private fb = inject(FormBuilder).nonNullable;
  private projectsService = inject(ProjectsService);
  private router = inject(Router);

  saving = signal(false);
  error = signal<string | null>(null);

  coverUploading = signal(false);

  tagInput = signal('');
  highlightInput = signal('');

  private createImageGroup(imageUrl = '', description = '') {
    return this.fb.group({
      image_url: [imageUrl, Validators.required],
      description: [description],
    });
  }

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

    images: this.fb.array<ReturnType<typeof this.createImageGroup>>([]),
  });

  get images() {
    return this.form.controls.images;
  }

  galleryUploading = signal(false);

  onGalleryImageUploaded(url: string): void {
    this.images.push(this.createImageGroup(url));
  }

  removeImage(index: number): void {
    this.images.removeAt(index);
  }

  onCoverImageUploaded(url: string) {
    this.form.controls.cover_image_url.setValue(url);
  }

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

    if (!highlight || highlight.length > 300) return;

    if (this.highlights.controls.some((control) => control.value === highlight)) return;

    this.highlights.push(this.fb.control(highlight));

    this.highlightInput.set('');
  }

  removeHighlight(index: number): void {
    this.highlights.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving() || this.coverUploading() || this.galleryUploading()) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const project: ProjectCreate = {
      ...values,
      github_url: values.github_url || null,
      demo_url: values.demo_url || null,
      cover_image_url: values.cover_image_url || null,
      images: values.images,
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

import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ProjectsService } from '../../../core/services/projects';
import { Project, ProjectUpdate } from '../project.model';

@Component({
  selector: 'app-edit-project',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-project.html',
  styleUrl: './edit-project.scss',
})
export class EditProject {
  private fb = inject(FormBuilder).nonNullable;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectsService = inject(ProjectsService);

  projectId = Number(this.route.snapshot.paramMap.get('id'));

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  tagInput = signal('');
  highlightInput = signal('');
  originalProject: Project | null = null;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],

    hook: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(300)]],

    description: ['', [Validators.required, Validators.minLength(10)]],

    github_url: ['', Validators.pattern(/^https?:\/\/.+/)],

    demo_url: ['', Validators.pattern(/^https?:\/\/.+/)],

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

  ngOnInit(): void {
    if (!Number.isSafeInteger(this.projectId) || this.projectId <= 0) {
      this.error.set('Invalid project ID');
      this.loading.set(false);
      return;
    }

    this.loadProject();
  }

  loadProject(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectsService
      .getProject(this.projectId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (project) => {
          this.originalProject = project;

          this.form.patchValue({
            title: project.title,
            hook: project.hook,
            description: project.description,
            github_url: project.github_url ?? '',
            demo_url: project.demo_url ?? '',
            published: project.published,
            tags: project.tags,
            highlights: project.tags,
          });

          this.tags.clear();

          for (const tag of project.tags) {
            this.tags.push(this.fb.control(tag));
          }

          this.form.markAsPristine();
        },
        error: (err: HttpErrorResponse) => {
          this.error.set(err.status === 404 ? 'Project not found' : 'Failed to load project');
        },
      });
  }

  saveProject(): void {
    if (this.form.invalid || this.saving() || !this.originalProject) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();

    const changes: ProjectUpdate = {};

    if (values.title !== this.originalProject.title) {
      changes.title = values.title;
    }

    if (values.description !== this.originalProject.description) {
      changes.description = values.description;
    }

    const github = values.github_url || null;
    const demo = values.demo_url || null;

    if (github !== this.originalProject.github_url) {
      changes.github_url = github;
    }

    if (demo !== this.originalProject.demo_url) {
      changes.demo_url = demo;
    }

    if (JSON.stringify(values.tags) !== JSON.stringify(this.originalProject.tags)) {
      changes.tags = values.tags;
    }

    if (Object.keys(changes).length === 0) {
      this.router.navigate(['/admin/projects']);
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    this.projectsService
      .updateProject(this.projectId, changes)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.router.navigate(['/admin/projects']);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 401) {
            this.error.set('Please log in again.');
          } else {
            this.error.set('Failed to update project.');
          }
        },
      });
  }
}

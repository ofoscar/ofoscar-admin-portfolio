import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { ProjectsService } from '../../core/services/projects';
import { Project } from './project.model';

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

@Component({
  selector: 'app-projects',
  imports: [RouterLink],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  private projectsService = inject(ProjectsService);

  private refresh$ = new Subject<void>();

  deletingId = signal<number | null>(null);
  deleteError = signal<string | null>(null);
  confirmDeleteId = signal<number | null>(null);

  search = signal('');

  private initialState: ProjectsState = {
    projects: [],
    loading: true,
    error: null,
  };

  private state$: Observable<ProjectsState> = this.refresh$.pipe(
    startWith(undefined),

    switchMap(() =>
      this.projectsService.getProjects().pipe(
        map(
          (projects): ProjectsState => ({
            projects,
            loading: false,
            error: null,
          }),
        ),

        startWith({
          projects: [],
          loading: true,
          error: null,
        } as ProjectsState),

        catchError(() =>
          of<ProjectsState>({
            projects: [],
            loading: false,
            error: 'Failed to load projects',
          } satisfies ProjectsState),
        ),
      ),
    ),
  );

  state = toSignal(this.state$, {
    initialValue: this.initialState,
  });

  filteredProjects = computed(() => {
    const search = this.search().toLocaleLowerCase();

    return this.state()?.projects.filter(
      (project) =>
        project.title.toLocaleLowerCase().includes(search) ||
        project.description.toLocaleLowerCase().includes(search),
    );
  });

  refreshProjects() {
    this.refresh$.next();
  }

  clearSearch() {
    this.search.set('');
  }

  requestDelete(id: number): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  deleteProject(id: number): void {
    if (this.deletingId() !== null || this.confirmDeleteId() !== id) {
      return;
    }

    this.deletingId.set(id);
    this.deleteError.set(null);

    this.projectsService
      .deleteProject(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.confirmDeleteId.set(null);
          this.refreshProjects();
        },
        error: (err: HttpErrorResponse) => {
          this.deleteError.set(
            err.status === 401 ? 'Your session has expired.' : 'Unable to delete project.',
          );
        },
      });
  }
}

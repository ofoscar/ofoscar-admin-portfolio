import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, startWith, Subject, switchMap } from 'rxjs';
import { ProjectsService } from '../../core/services/projects';
import { Project } from './project.model';

type ProjectsState = {
  projects: Project[];
  loading: boolean;
  error: string | null;
};

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  private projectsService = inject(ProjectsService);

  private refresh$ = new Subject<void>();

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
}

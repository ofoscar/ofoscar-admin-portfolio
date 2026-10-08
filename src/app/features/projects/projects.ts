import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ProjectsService } from '../../core/services/projects';
import { Project } from './project.model';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  private projectsService = inject(ProjectsService);

  projects = signal<Project[]>([]);
  search = signal('');

  loading = signal(false);
  error = signal<string | null>(null);

  filteredProjects = computed(() =>
    this.projects().filter(
      (project) =>
        project.title.toLowerCase().includes(this.search().toLowerCase()) ||
        project.description.toLowerCase().includes(this.search().toLowerCase()),
    ),
  );
  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
      },
      error: (err) => {
        console.error('Failed to fetch projects', err);
        this.error.set('Failed to fetch projects');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
  clearSearch() {
    this.search.set('');
  }
}

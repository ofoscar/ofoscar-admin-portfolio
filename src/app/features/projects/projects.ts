import { Component, computed, signal } from '@angular/core';
import { Project } from './project.model';

@Component({
  selector: 'app-projects',
  imports: [],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {
  search = signal('');

  projects = signal<Project[]>([
    {
      id: 1,
      title: 'Portfolio Website',
      hook: 'Portfolio Website',
      description: 'Personal portfolio built with Next.js',
      github_url: 'https://github.com/ofoscar',
      demo_url: 'https://ofoscar.com',
      cover_image_url: null,
      published: true,
      tags: ['Next.js', 'TypeScript'],
      highlights: ['Next.js', 'TypeScript'],
      images: null,
    },
    {
      id: 2,
      title: 'SiPerros',
      hook: 'Portfolio Website',
      description: 'Pet-friendly website',
      github_url: 'https://github.com/ofoscar',
      demo_url: 'https://ofoscar.com',
      cover_image_url: null,
      published: true,
      tags: ['Next.js', 'TypeScript'],
      highlights: ['Next.js', 'TypeScript'],
      images: null,
    },
    {
      id: 3,
      title: 'Third project',
      hook: 'Portfolio Website',
      description: 'Another one',
      github_url: 'https://github.com/ofoscar',
      demo_url: 'https://ofoscar.com',
      cover_image_url: null,
      published: true,
      tags: ['Next.js', 'TypeScript'],
      highlights: ['Next.js', 'TypeScript'],
      images: null,
    },
  ]);

  filteredProjects = computed(() =>
    this.projects().filter(
      (project) =>
        project.title.toLowerCase().includes(this.search().toLowerCase()) ||
        project.description.toLowerCase().includes(this.search().toLowerCase()),
    ),
  );

  deleteProject(id: number) {
    this.projects.update((projects) => projects.filter((project) => project.id !== id));
  }

  clearSearch() {
    this.search.set('');
  }
}

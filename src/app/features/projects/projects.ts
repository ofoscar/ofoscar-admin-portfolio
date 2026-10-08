import { Component, signal } from '@angular/core';
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
  ]);
}

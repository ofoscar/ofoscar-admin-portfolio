import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'videos',
        loadComponent: () => import('./features/videos/videos').then((m) => m.Videos),
      },
      {
        path: 'videos/new',
        loadComponent: () =>
          import('./features/videos/create-video/create-video').then((m) => m.CreateVideo),
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/projects').then((m) => m.Projects),
      },
      {
        path: 'projects/new',
        loadComponent: () =>
          import('./features/projects/create-project/create-project').then((m) => m.CreateProject),
      },
      {
        path: 'projects/:id/edit',
        loadComponent: () =>
          import('./features/projects/edit-project/edit-project').then((m) => m.EditProject),
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  {
    path: '',
    redirectTo: '/admin',
    pathMatch: 'full',
  },
];

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'students', pathMatch: 'full' },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/students/student-list/student-list.component').then(m => m.StudentListComponent)
      },
      {
        path: 'classes',
        loadComponent: () =>
          import('./features/classes/class-list/class-list.component').then(m => m.ClassListComponent)
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./features/subjects/subject-list/subject-list.component').then(m => m.SubjectListComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

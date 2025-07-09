/**
 * Application Routes
 * 
 * Defines the URL routing for the Angular application.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Routes map URLs to specific components
 * - :id is a route parameter that can be accessed in components
 * - The router displays the component in <router-outlet>
 * - Order matters - more specific routes should come first
 */

import { Routes } from '@angular/router';

export const routes: Routes = [
  // Home page - create circle (main functionality)
  {
    path: '',
    loadComponent: () => import('./pages/create-circle/create-circle').then(m => m.CreateCircle)
  },
  
  // Circle page - view/join circle (handles both joining and viewing)
  {
    path: 'join/:id',
    loadComponent: () => import('./pages/circle/circle').then(m => m.Circle)
  },
  
  // Circle detail page - same as join (for consistency)
  {
    path: 'circle/:id',
    loadComponent: () => import('./pages/circle/circle').then(m => m.Circle)
  },
  
  // Catch-all route - redirect unknown URLs to home
  {
    path: '**',
    redirectTo: ''
  }
];

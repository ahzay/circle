// Angular application configuration
// This is similar to dependency injection setup in Go
import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // HTTP client for API calls

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    
    // Enable HTTP client for making API calls to backend
    // Similar to configuring http.Client in Go
    provideHttpClient()
  ]
};

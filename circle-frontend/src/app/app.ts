// Main app component
// This is similar to your main React component
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpService } from './services/http.service';

// Import Angular Material components
// Similar to importing components from a UI library in React
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-root',
  // Import Material modules (similar to importing components in React)
  imports: [
    RouterOutlet,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected title = 'circle-frontend';
  
  // Health check status - similar to state in React
  protected healthStatus: string = 'Checking connection...';
  protected isHealthy: boolean = false;

  // HttpService is injected via dependency injection
  // Similar to passing dependencies to a struct in Go
  constructor(private httpService: HttpService) {}

  // OnInit lifecycle hook - similar to useEffect(() => {}, []) in React
  ngOnInit(): void {
    this.checkBackendConnection();
  }

  // Method to test backend connection
  // Similar to making HTTP calls in Go
  private checkBackendConnection(): void {
    // Subscribe to the Observable (similar to handling channels in Go)
    this.httpService.checkHealth().subscribe({
      // Success handler - similar to successful HTTP response in Go
      next: (response) => {
        console.log('Backend connection successful:', response);
        this.healthStatus = `✅ Backend connected (${response.status})`;
        this.isHealthy = true;
      },
      // Error handler - similar to error handling in Go
      error: (error) => {
        console.error('Backend connection failed:', error);
        this.healthStatus = '❌ Backend connection failed';
        this.isHealthy = false;
      }
    });
  }
}

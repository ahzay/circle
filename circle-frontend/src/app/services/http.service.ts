// HTTP service for API communication
// This is similar to creating a shared HTTP client in Go
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// @Injectable decorator makes this service available for dependency injection
// Similar to how you'd register a service in Go's dependency injection container
@Injectable({
  providedIn: 'root' // Makes this service a singleton across the app
})
export class HttpService {
  
  // Base URL for API calls
  // In Go, you'd typically set this in a config struct
  private readonly baseUrl = 'http://localhost:3000';

  // HttpClient is injected via dependency injection
  // Similar to injecting a custom HTTP client in Go
  constructor(private http: HttpClient) {}

  // Health check method
  // Returns Observable<any> - similar to channels in Go for async operations
  checkHealth(): Observable<any> {
    // Make GET request to health endpoint
    // Similar to: resp, err := http.Get(url) in Go
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Generic GET method for future API calls
  // Similar to creating a generic HTTP GET function in Go
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`);
  }

  // Generic POST method for future API calls
  // Similar to creating a generic HTTP POST function in Go
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data);
  }

  // Generic PUT method for future API calls
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data);
  }

  // Generic DELETE method for future API calls
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
  }
}
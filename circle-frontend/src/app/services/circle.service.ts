/**
 * Circle Service
 * 
 * Angular service that handles all circle-related API communication.
 * This service acts as a bridge between Angular components and the backend API.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Services in Angular are similar to business logic classes in other frameworks
 * - They're "injectable" - Angular's dependency injection system manages them
 * - Services are singletons by default (one instance shared across the app)
 * - We use RxJS Observables for handling async API calls
 * - The @Injectable decorator tells Angular this can be injected into components
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

// Import shared models and utilities - same types used by backend!
import { 
  CircleResponse, 
  CreateCircleRequest, 
  JoinCircleRequest,
  API_ENDPOINTS,
  ErrorHandler
} from '@shared/models';

@Injectable({
  providedIn: 'root' // This makes the service available app-wide
})
export class CircleService {
  private readonly apiUrl = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.CIRCLES;

  /**
   * Constructor - Angular's dependency injection provides HttpClient
   * 
   * @param http - Angular's HTTP client for making API calls
   */
  constructor(private http: HttpClient) {}

  /**
   * Create a new circle
   * 
   * Sends a POST request to create a new circle with the given name and creator.
   * Returns an Observable that emits the created circle data.
   * 
   * @param request - Circle creation data (name and creator name)
   * @returns Observable that emits CircleResponse or error
   */
  createCircle(request: CreateCircleRequest): Observable<CircleResponse> {
    return this.http.post<CircleResponse>(this.apiUrl, request)
      .pipe(
        // RxJS operator to handle errors gracefully
        catchError(this.handleError)
      );
  }

  /**
   * Get circle details by ID
   * 
   * Fetches full circle information including users and metadata.
   * Used when someone visits a shareable circle link.
   * 
   * @param circleId - The unique circle identifier
   * @returns Observable that emits CircleResponse or error
   */
  getCircle(circleId: string): Observable<CircleResponse> {
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.CIRCLE_BY_ID(circleId);
    return this.http.get<CircleResponse>(url)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Join an existing circle
   * 
   * Adds a new user to an existing circle. The user provides their name
   * and gets added to the circle's user list.
   * 
   * @param circleId - The circle to join
   * @param request - Join request data (user name)
   * @returns Observable that emits updated CircleResponse or error
   */
  joinCircle(circleId: string, request: JoinCircleRequest): Observable<CircleResponse> {
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.CIRCLE_JOIN(circleId);
    return this.http.post<CircleResponse>(url, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Error handler for HTTP requests
   * 
   * Processes HTTP errors and returns user-friendly error messages.
   * This is a private method used by all API methods above.
   * 
   * @param error - The HTTP error response
   * @returns Observable that emits an error
   */
  private handleError(error: any): Observable<never> {
    // Use shared error handler for consistent error handling
    const circleError = ErrorHandler.fromHttpError(error);
    const userFriendlyMessage = ErrorHandler.getUserFriendlyMessage(circleError);
    
    console.error('Circle service error:', error);
    return throwError(() => new Error(userFriendlyMessage));
  }
}
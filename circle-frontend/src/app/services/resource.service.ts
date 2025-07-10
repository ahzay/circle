/**
 * Resource Service
 * 
 * Angular service for managing resources within circles.
 * This service handles HTTP communication with the backend API for resource operations.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Services are singleton classes that provide shared functionality
 * - Injectable decorator allows Angular to inject this service into components
 * - HttpClient handles HTTP requests (similar to fetch() but with RxJS Observables)
 * - Observables are streams of data that components can subscribe to
 * - This service abstracts away API details from components
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateResourceRequest, ResourceResponse } from '@shared/models';
import { API_ENDPOINTS } from '@shared/models';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide as a singleton
})
export class ResourceService {
  // Base URL for resource API endpoints
  private readonly baseUrl = 'http://localhost:3000/api/resources';

  /**
   * Constructor - Angular automatically injects HttpClient
   * 
   * @param http - Angular's HTTP client for making API requests
   */
  constructor(private http: HttpClient) {}

  /**
   * Create a new resource in a circle
   * 
   * Sends a POST request to the backend with resource data.
   * The backend will validate the user is a member of the circle.
   * 
   * @param resource - Resource data to create
   * @returns Observable of the created resource with enhanced data
   */
  createResource(resource: CreateResourceRequest): Observable<ResourceResponse> {
    // POST /api/resources
    return this.http.post<ResourceResponse>(this.baseUrl, resource);
  }

  /**
   * Get all resources in a specific circle
   * 
   * Fetches all resources that belong to the given circle.
   * Returns enhanced resource data with owner names.
   * 
   * @param circleId - ID of the circle to get resources for
   * @returns Observable of array of enhanced resource data
   */
  getResourcesForCircle(circleId: string): Observable<ResourceResponse[]> {
    // GET /api/resources/circle/:circleId
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.CIRCLES_RESOURCES(circleId);
    return this.http.get<ResourceResponse[]>(url);
  }

  /**
   * Get a specific resource by ID
   * 
   * Fetches detailed information about a single resource.
   * Includes owner name and current borrower information.
   * 
   * @param resourceId - ID of the resource to fetch
   * @returns Observable of enhanced resource data
   */
  getResource(resourceId: string): Observable<ResourceResponse> {
    // GET /api/resources/:id
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.RESOURCE_BY_ID(resourceId);
    return this.http.get<ResourceResponse>(url);
  }

  /**
   * Delete a resource
   * 
   * Removes a resource from the circle. Only the owner can delete their resource,
   * and only if it's not currently borrowed.
   * 
   * @param resourceId - ID of the resource to delete
   * @param userId - ID of the user requesting deletion (must be the owner)
   * @returns Observable of success message
   */
  deleteResource(resourceId: string, userId: string): Observable<{ message: string }> {
    // DELETE /api/resources/:id?userId=:userId
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.RESOURCE_DELETE(resourceId, userId);
    return this.http.delete<{ message: string }>(url);
  }

  /**
   * Borrow a resource
   * 
   * Marks a resource as borrowed by the current user.
   * The resource must be available and not owned by the borrower.
   * 
   * @param resourceId - ID of the resource to borrow
   * @param borrowerId - ID of the user borrowing the resource
   * @returns Observable of updated resource data
   */
  borrowResource(resourceId: string, borrowerId: string): Observable<ResourceResponse> {
    // POST /api/resources/:id/borrow
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.RESOURCE_BORROW(resourceId);
    return this.http.post<ResourceResponse>(url, { borrowerId });
  }

  /**
   * Return a borrowed resource
   * 
   * Marks a resource as returned and available again.
   * Only the current borrower can return the resource.
   * 
   * @param resourceId - ID of the resource to return
   * @param borrowerId - ID of the user returning the resource
   * @returns Observable of updated resource data
   */
  returnResource(resourceId: string, borrowerId: string): Observable<ResourceResponse> {
    // POST /api/resources/:id/return
    const url = API_ENDPOINTS.BASE_URL + API_ENDPOINTS.RESOURCE_RETURN(resourceId);
    return this.http.post<ResourceResponse>(url, { borrowerId });
  }
}
/**
 * Resource List Component
 * 
 * Displays all resources in a circle with owner information and availability status.
 * Allows users to view resource details and delete their own resources.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Components are reusable UI building blocks
 * - Input() decorator allows parent components to pass data
 * - Output() decorator allows this component to emit events to parent
 * - Signals provide reactive state management
 * - Services are injected for data operations
 * - OnInit lifecycle hook runs after component initialization
 */

import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ResourceService } from '../../services/resource.service';
import { ResourceResponse } from '@shared/models';

@Component({
  selector: 'app-resource-list',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './resource-list.html',
  styleUrl: './resource-list.scss'
})
export class ResourceList implements OnInit {
  /**
   * Input: Circle ID to load resources for
   * Parent component passes this value
   */
  @Input() circleId!: string;

  /**
   * Input: Current user ID to determine ownership
   * Used to show/hide delete buttons
   */
  @Input() currentUserId!: string;

  /**
   * Output: Emitted when a resource is deleted
   * Parent component can refresh data or show notifications
   */
  @Output() resourceDeleted = new EventEmitter<string>();

  /**
   * Signal: Array of resources to display
   * Signals are Angular's new reactive state management
   */
  resources = signal<ResourceResponse[]>([]);

  /**
   * Signal: Loading state
   * Shows loading spinner while fetching data
   */
  isLoading = signal(false);

  /**
   * Signal: Error message
   * Shows error message if API call fails
   */
  errorMessage = signal<string | null>(null);

  /**
   * Constructor - Angular injects the ResourceService
   * 
   * @param resourceService - Service for resource API operations
   */
  constructor(private resourceService: ResourceService) {}

  /**
   * OnInit lifecycle hook
   * 
   * Runs after component initialization to load resources.
   * Angular calls this automatically after the component is created.
   */
  ngOnInit(): void {
    this.loadResources();
  }

  /**
   * Load resources for the current circle
   * 
   * Calls the API to fetch all resources in the circle and updates the signal.
   * Shows loading state and handles errors.
   */
  loadResources(): void {
    if (!this.circleId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Subscribe to the Observable returned by the service
    this.resourceService.getResourcesForCircle(this.circleId).subscribe({
      next: (resources) => {
        // Success: update the resources signal
        this.resources.set(resources);
        this.isLoading.set(false);
      },
      error: (error) => {
        // Error: show error message
        console.error('Error loading resources:', error);
        this.errorMessage.set('Failed to load resources. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Delete a resource
   * 
   * Calls the API to delete the resource and refreshes the list.
   * Only the resource owner can delete their resources.
   * 
   * @param resourceId - ID of the resource to delete
   */
  deleteResource(resourceId: string): void {
    if (!this.currentUserId) {
      this.errorMessage.set('You must be logged in to delete resources');
      return;
    }

    // Call the service to delete the resource
    this.resourceService.deleteResource(resourceId, this.currentUserId).subscribe({
      next: () => {
        // Success: remove the resource from the list and emit event
        const updatedResources = this.resources().filter(r => r.id !== resourceId);
        this.resources.set(updatedResources);
        this.resourceDeleted.emit(resourceId);
      },
      error: (error) => {
        // Error: show error message
        console.error('Error deleting resource:', error);
        this.errorMessage.set('Failed to delete resource. Please try again.');
      }
    });
  }

  /**
   * Check if the current user owns a resource
   * 
   * @param resource - Resource to check ownership for
   * @returns True if the current user owns the resource
   */
  isOwner(resource: ResourceResponse): boolean {
    return resource.ownerId === this.currentUserId;
  }

  /**
   * Check if the current user is borrowing a resource
   * 
   * @param resource - Resource to check borrower for
   * @returns True if the current user is borrowing the resource
   */
  isBorrower(resource: ResourceResponse): boolean {
    return resource.currentBorrowerId === this.currentUserId;
  }

  /**
   * Borrow a resource
   * 
   * Sends a request to borrow the resource and updates the local state.
   * 
   * @param resourceId - ID of the resource to borrow
   */
  borrowResource(resourceId: string): void {
    if (!this.currentUserId) {
      this.errorMessage.set('You must be logged in to borrow resources');
      return;
    }

    // Call the service to borrow the resource
    this.resourceService.borrowResource(resourceId, this.currentUserId).subscribe({
      next: (updatedResource) => {
        // Success: update the resource in the local list
        const updatedResources = this.resources().map(r => 
          r.id === resourceId ? updatedResource : r
        );
        this.resources.set(updatedResources);
      },
      error: (error) => {
        // Error: show error message
        console.error('Error borrowing resource:', error);
        this.errorMessage.set(
          error.message || 'Failed to borrow resource. Please try again.'
        );
      }
    });
  }

  /**
   * Return a borrowed resource
   * 
   * Sends a request to return the resource and updates the local state.
   * 
   * @param resourceId - ID of the resource to return
   */
  returnResource(resourceId: string): void {
    if (!this.currentUserId) {
      this.errorMessage.set('You must be logged in to return resources');
      return;
    }

    // Call the service to return the resource
    this.resourceService.returnResource(resourceId, this.currentUserId).subscribe({
      next: (updatedResource) => {
        // Success: update the resource in the local list
        const updatedResources = this.resources().map(r => 
          r.id === resourceId ? updatedResource : r
        );
        this.resources.set(updatedResources);
      },
      error: (error) => {
        // Error: show error message
        console.error('Error returning resource:', error);
        this.errorMessage.set(
          error.message || 'Failed to return resource. Please try again.'
        );
      }
    });
  }
}

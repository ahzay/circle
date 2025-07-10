/**
 * Add Resource Component
 * 
 * Form component for adding new resources to a circle.
 * Uses Angular reactive forms with Material Design inputs.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - FormBuilder creates reactive forms (better than template-driven forms)
 * - Validators provide client-side validation
 * - Input/Output decorators for parent-child communication
 * - Emits events to parent component on success/cancel
 * - Uses Material Design form controls for consistent UI
 */

import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResourceService } from '../../services/resource.service';
import { CreateResourceRequest, ResourceResponse } from '@shared/models';

@Component({
  selector: 'app-add-resource',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-resource.html',
  styleUrl: './add-resource.scss'
})
export class AddResource implements OnInit {
  /**
   * Input: Circle ID to add the resource to
   * Parent component passes this value
   */
  @Input() circleId!: string;

  /**
   * Input: Current user ID (becomes the resource owner)
   * Parent component passes this value
   */
  @Input() currentUserId!: string;

  /**
   * Output: Emitted when a resource is successfully created
   * Parent component can refresh the resource list
   */
  @Output() resourceCreated = new EventEmitter<ResourceResponse>();

  /**
   * Output: Emitted when user cancels the form
   * Parent component can hide the form
   */
  @Output() cancelled = new EventEmitter<void>();

  /**
   * Reactive form for resource creation
   * FormGroup manages form state and validation
   */
  resourceForm!: FormGroup;

  /**
   * Signal: Loading state
   * Shows loading spinner while creating resource
   */
  isLoading = signal(false);

  /**
   * Signal: Error message
   * Shows error message if creation fails
   */
  errorMessage = signal<string | null>(null);

  /**
   * Constructor - Angular injects dependencies
   * 
   * @param fb - FormBuilder for creating reactive forms
   * @param resourceService - Service for resource API operations
   */
  constructor(
    private fb: FormBuilder,
    private resourceService: ResourceService
  ) {}

  /**
   * OnInit lifecycle hook
   * 
   * Sets up the reactive form with validation rules.
   * Angular calls this automatically after component initialization.
   */
  ngOnInit(): void {
    this.resourceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  /**
   * Submit the form to create a new resource
   * 
   * Validates the form, calls the API, and emits success/error events.
   */
  onSubmit(): void {
    if (this.resourceForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.resourceForm.markAllAsTouched();
      return;
    }

    if (!this.circleId || !this.currentUserId) {
      this.errorMessage.set('Missing required information. Please try again.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Build the request object
    const request: CreateResourceRequest = {
      name: this.resourceForm.value.name.trim(),
      description: this.resourceForm.value.description.trim(),
      ownerId: this.currentUserId,
      circleId: this.circleId
    };

    // Call the service to create the resource
    this.resourceService.createResource(request).subscribe({
      next: (resource) => {
        // Success: emit the created resource and reset form
        this.resourceCreated.emit(resource);
        this.resourceForm.reset();
        this.isLoading.set(false);
      },
      error: (error) => {
        // Error: show error message
        console.error('Error creating resource:', error);
        this.errorMessage.set('Failed to create resource. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Cancel the form and emit cancel event
   * 
   * Resets the form and notifies parent component.
   */
  onCancel(): void {
    this.resourceForm.reset();
    this.errorMessage.set(null);
    this.cancelled.emit();
  }

  /**
   * Get error message for a form field
   * 
   * @param fieldName - Name of the form field
   * @returns Error message string or null
   */
  getFieldError(fieldName: string): string | null {
    const field = this.resourceForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['maxlength']) return `${fieldName} is too long`;
    }
    return null;
  }
}

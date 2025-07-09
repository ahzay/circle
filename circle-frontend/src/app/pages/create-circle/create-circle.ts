/**
 * Create Circle Component
 * 
 * Angular component for creating new circles.
 * Allows users to create a circle with a name and get a shareable link.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Component = UI logic + template + styles
 * - FormBuilder creates reactive forms with validation
 * - Signals provide reactive state management
 * - Dependency injection provides services to the component
 * - Router navigation moves between pages
 */

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// Angular Material imports for UI components
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CircleService } from '../../services/circle.service';
import { UserStorageService } from '../../services/user-storage.service';
import { CircleResponse } from '@shared/models';

@Component({
  selector: 'app-create-circle',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './create-circle.html'
})
export class CreateCircle {
  // Angular's modern dependency injection using inject()
  private circleService = inject(CircleService);
  private userStorage = inject(UserStorageService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  // Reactive form for circle creation
  createForm: FormGroup;
  
  // Signals for reactive state management
  isLoading = signal(false);
  createdCircle = signal<CircleResponse | null>(null);
  
  constructor() {
    // Initialize the reactive form with validation
    this.createForm = this.fb.group({
      // Circle name with validation
      circleName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      
      // Creator name with validation and default from storage
      creatorName: [this.userStorage.getPreferredName(), [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]]
    });
  }

  /**
   * Handle form submission
   * 
   * Creates a new circle with the form data and handles success/error states.
   */
  onSubmit(): void {
    if (this.createForm.valid) {
      this.isLoading.set(true);
      
      const formData = this.createForm.value;
      
      // Call the circle service to create the circle
      this.circleService.createCircle({
        name: formData.circleName.trim(),
        creatorName: formData.creatorName.trim()
      }).subscribe({
        next: (response: CircleResponse) => {
          this.isLoading.set(false);
          this.createdCircle.set(response);
          
          // Store the creator as a user for this circle
          const creatorUser = response.users[0]; // First user is always the creator
          this.userStorage.setUserForCircle(response.id, creatorUser);
          
          // Update preferred name
          this.userStorage.setPreferredName(creatorUser.name);
          
          // Show success message
          this.snackBar.open('Circle created successfully!', 'Close', {
            duration: 5000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          this.isLoading.set(false);
          
          // Show error message
          this.snackBar.open(
            error.message || 'Failed to create circle. Please try again.', 
            'Close', 
            {
              duration: 5000,
              panelClass: ['error-snackbar']
            }
          );
        }
      });
    } else {
      // Mark all form fields as touched to show validation errors
      this.createForm.markAllAsTouched();
    }
  }

  /**
   * Copy shareable link to clipboard
   * 
   * Uses the modern Clipboard API to copy the shareable URL.
   */
  async copyShareableLink(): Promise<void> {
    const circle = this.createdCircle();
    if (circle) {
      try {
        await navigator.clipboard.writeText(circle.shareableUrl);
        this.snackBar.open('Link copied to clipboard!', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      } catch (error) {
        console.error('Failed to copy link:', error);
        this.snackBar.open('Failed to copy link. Please copy manually.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    }
  }

  /**
   * Navigate to the newly created circle
   * 
   * Takes the user to their new circle page.
   */
  goToCircle(): void {
    const circle = this.createdCircle();
    if (circle) {
      this.router.navigate(['/join', circle.id]);
    }
  }

  /**
   * Reset the form to create another circle
   */
  createAnother(): void {
    this.createdCircle.set(null);
    this.createForm.reset();
    
    // Restore the preferred name
    this.createForm.patchValue({
      creatorName: this.userStorage.getPreferredName()
    });
  }

  /**
   * Get form field error message
   * 
   * @param fieldName - The form field name
   * @returns User-friendly error message
   */
  getFieldError(fieldName: string): string {
    const field = this.createForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName === 'circleName' ? 'Circle name' : 'Your name'} is required`;
      }
      if (field.errors['minlength']) {
        return `Must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `Must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      }
    }
    return '';
  }
}

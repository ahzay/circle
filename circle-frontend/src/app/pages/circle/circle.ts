/**
 * Circle Component
 * 
 * Placeholder for Phase 3 - will show circle details and resources.
 * For now, just shows basic circle information.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CircleService } from '../../services/circle.service';
import { UserStorageService } from '../../services/user-storage.service';
import { CircleResponse } from '@shared/models';

@Component({
  selector: 'app-circle',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './circle.html'
})
export class Circle implements OnInit {
  private route = inject(ActivatedRoute);
  private circleService = inject(CircleService);
  private userStorage = inject(UserStorageService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  
  circle = signal<CircleResponse | null>(null);
  isLoading = signal(false);
  isJoining = signal(false);
  error = signal<string>('');
  
  // Form for joining the circle
  joinForm: FormGroup;

  constructor() {
    // Initialize the join form
    this.joinForm = this.fb.group({
      userName: [this.userStorage.getPreferredName(), [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCircle(id);
    }
  }

  private loadCircle(id: string): void {
    this.isLoading.set(true);
    this.circleService.getCircle(id).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.circle.set(response);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.error.set(error.message || 'Failed to load circle');
      }
    });
  }

  /**
   * Check if current user is already a member of this circle
   */
  isUserMember(): boolean {
    const circle = this.circle();
    if (!circle) return false;
    
    const storedUser = this.userStorage.getUserForCircle(circle.id);
    return storedUser ? circle.users.some(u => u.id === storedUser.id) : false;
  }

  /**
   * Select an existing user identity
   * 
   * When someone clicks on an existing user, store that identity
   * and mark them as a member of the circle.
   */
  selectExistingUser(user: any): void {
    const circle = this.circle();
    if (!circle) return;
    
    // Store the selected user identity in browser storage
    this.userStorage.setUserForCircle(circle.id, user);
    this.userStorage.setPreferredName(user.name);
    
    // Show success message
    this.snackBar.open(`Welcome back, ${user.name}!`, 'Close', {
      duration: 3000
    });
  }

  /**
   * Handle joining the circle
   */
  onJoin(): void {
    const circle = this.circle();
    if (this.joinForm.valid && circle) {
      this.isJoining.set(true);
      
      const formData = this.joinForm.value;
      
      this.circleService.joinCircle(circle.id, {
        userName: formData.userName.trim()
      }).subscribe({
        next: (response: CircleResponse) => {
          this.isJoining.set(false);
          this.circle.set(response);
          
          // Find the user that was just added (last user in the array)
          const newUser = response.users[response.users.length - 1];
          
          // Store user info for this circle
          this.userStorage.setUserForCircle(circle.id, newUser);
          
          // Update preferred name
          this.userStorage.setPreferredName(newUser.name);
          
          // Show success message
          this.snackBar.open('Successfully joined the circle!', 'Close', {
            duration: 5000
          });
        },
        error: (error) => {
          this.isJoining.set(false);
          this.snackBar.open(
            error.message || 'Failed to join circle. Please try again.',
            'Close',
            { duration: 5000 }
          );
        }
      });
    } else {
      this.joinForm.markAllAsTouched();
    }
  }

  /**
   * Check if user name already exists in circle
   */
  isNameTaken(userName: string): boolean {
    const circle = this.circle();
    return circle ? circle.users.some(user => user.name === userName.trim()) : false;
  }

  /**
   * Get form field error message
   */
  getFieldError(fieldName: string): string {
    const field = this.joinForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return 'Your name is required';
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

  /**
   * Helper method to format date for template
   */
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }
}

/**
 * User Storage Service
 * 
 * Manages user identity persistence in browser storage.
 * Since we don't have traditional authentication, we store user preferences
 * and identity information locally in the browser.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - localStorage persists data even after browser restarts
 * - sessionStorage only persists during the browser session
 * - We use JSON.stringify/parse to store complex objects
 * - This service provides a clean interface for user data management
 * - Angular signals provide reactive state management
 */

import { Injectable, signal, computed } from '@angular/core';
import { User } from '@shared/models';

/**
 * UserIdentity interface
 * 
 * Stores user information and preferences in browser storage
 */
interface UserIdentity {
  /** The user's preferred display name */
  preferredName: string;
  
  /** Map of circle IDs to user info in that circle */
  circleUsers: Record<string, User>;
  
  /** Timestamp of last activity */
  lastActive: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserStorageService {
  private readonly STORAGE_KEY = 'circle_user_identity';
  
  // Angular signals for reactive state management
  private identitySignal = signal<UserIdentity | null>(null);
  
  // Computed signals derived from identity
  public readonly preferredName = computed(() => this.identitySignal()?.preferredName || '');
  public readonly hasIdentity = computed(() => this.identitySignal() !== null);
  public readonly circleUsers = computed(() => this.identitySignal()?.circleUsers || {});

  constructor() {
    // Load existing identity from localStorage on service creation
    this.loadIdentity();
  }

  /**
   * Load user identity from browser storage
   * 
   * Attempts to restore user identity from localStorage.
   * If no identity exists, the service remains in an empty state.
   */
  private loadIdentity(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const identity: UserIdentity = JSON.parse(stored);
        this.identitySignal.set(identity);
      }
    } catch (error) {
      console.error('Failed to load user identity from storage:', error);
      // Clear corrupted data
      this.clearIdentity();
    }
  }

  /**
   * Save user identity to browser storage
   * 
   * Persists the current identity state to localStorage.
   * Updates the lastActive timestamp.
   */
  private saveIdentity(): void {
    try {
      const identity = this.identitySignal();
      if (identity) {
        identity.lastActive = Date.now();
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(identity));
      }
    } catch (error) {
      console.error('Failed to save user identity to storage:', error);
    }
  }

  /**
   * Set the user's preferred display name
   * 
   * This name will be suggested when joining new circles.
   * 
   * @param name - The preferred display name
   */
  setPreferredName(name: string): void {
    const current = this.identitySignal() || {
      preferredName: '',
      circleUsers: {},
      lastActive: Date.now()
    };
    
    current.preferredName = name.trim();
    this.identitySignal.set(current);
    this.saveIdentity();
  }

  /**
   * Get the user's preferred name
   * 
   * @returns The preferred display name or empty string
   */
  getPreferredName(): string {
    return this.preferredName();
  }

  /**
   * Store user information for a specific circle
   * 
   * When a user joins a circle, we store their user info
   * so they can be recognized in future visits.
   * 
   * @param circleId - The circle identifier
   * @param user - The user's information in that circle
   */
  setUserForCircle(circleId: string, user: User): void {
    const current = this.identitySignal() || {
      preferredName: user.name,
      circleUsers: {},
      lastActive: Date.now()
    };
    
    current.circleUsers[circleId] = user;
    
    // Update preferred name if it's empty
    if (!current.preferredName) {
      current.preferredName = user.name;
    }
    
    this.identitySignal.set(current);
    this.saveIdentity();
  }

  /**
   * Get user information for a specific circle
   * 
   * @param circleId - The circle identifier
   * @returns User info if found, undefined otherwise
   */
  getUserForCircle(circleId: string): User | undefined {
    return this.circleUsers()[circleId];
  }

  /**
   * Check if user has joined a specific circle
   * 
   * @param circleId - The circle identifier
   * @returns True if user has joined this circle before
   */
  hasJoinedCircle(circleId: string): boolean {
    return circleId in this.circleUsers();
  }

  /**
   * Get all circles the user has joined
   * 
   * @returns Array of circle IDs
   */
  getJoinedCircles(): string[] {
    return Object.keys(this.circleUsers());
  }

  /**
   * Clear all user identity data
   * 
   * Removes all stored user information from browser storage.
   * Used for logout or data reset functionality.
   */
  clearIdentity(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.identitySignal.set(null);
  }

  /**
   * Get storage statistics
   * 
   * @returns Object with storage usage information
   */
  getStorageStats(): {
    hasIdentity: boolean;
    circleCount: number;
    preferredName: string;
    lastActive: Date | null;
  } {
    const identity = this.identitySignal();
    return {
      hasIdentity: identity !== null,
      circleCount: Object.keys(this.circleUsers()).length,
      preferredName: this.preferredName(),
      lastActive: identity?.lastActive ? new Date(identity.lastActive) : null
    };
  }
}
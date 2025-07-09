/**
 * Storage Service
 * 
 * This service manages our in-memory "database" for circles and users.
 * In a real app, this would connect to a database like PostgreSQL or MongoDB.
 * For now, we use JavaScript Maps to store data in server memory.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Services contain business logic and data management
 * - Map<string, T> is like a dictionary - key-value pairs where key is string
 * - Static methods belong to the class, not instances (like utility functions)
 * - This follows the singleton pattern - one instance manages all data
 */

import { Circle, User } from '../../../shared/models';
import { v4 as uuidv4 } from 'uuid';

/**
 * StorageService class
 * 
 * Manages in-memory storage for circles and users.
 * All data is lost when the server restarts (since it's in memory).
 */
export class StorageService {
  // Map<circleId, Circle> - stores all circles by their ID
  private static circles: Map<string, Circle> = new Map();
  
  // Map<userId, User> - stores all users by their ID (across all circles)
  private static users: Map<string, User> = new Map();

  /**
   * Generate a unique ID for circles or users
   * Uses UUID v4 for guaranteed uniqueness
   */
  private static generateId(): string {
    return uuidv4();
  }

  // ============ CIRCLE METHODS ============

  /**
   * Create a new circle with the given name and creator
   * 
   * @param name - Display name for the circle
   * @param creatorName - Name of the user creating the circle
   * @returns The newly created circle
   */
  static createCircle(name: string, creatorName: string): Circle {
    // Generate unique IDs for both circle and creator user
    const circleId = this.generateId();
    const creatorId = this.generateId();
    
    // Create the creator user first
    const creator: User = {
      id: creatorId,
      name: creatorName,
      joinedAt: new Date()
    };
    
    // Store the creator user
    this.users.set(creatorId, creator);
    
    // Create the circle with the creator as first member
    const circle: Circle = {
      id: circleId,
      name,
      users: [creator], // Array with the creator as first member
      createdAt: new Date(),
      createdBy: creatorId
    };
    
    // Store the circle
    this.circles.set(circleId, circle);
    
    return circle;
  }

  /**
   * Find a circle by its ID
   * 
   * @param id - The circle ID to look up
   * @returns The circle if found, undefined otherwise
   */
  static getCircle(id: string): Circle | undefined {
    return this.circles.get(id);
  }

  /**
   * Get all circles (mainly for debugging/admin purposes)
   * 
   * @returns Array of all circles
   */
  static getAllCircles(): Circle[] {
    return Array.from(this.circles.values());
  }

  /**
   * Add a user to an existing circle
   * 
   * @param circleId - ID of the circle to join
   * @param userName - Name of the user joining
   * @returns The updated circle with the new user added
   * @throws Error if circle not found or user name already exists in circle
   */
  static addUserToCircle(circleId: string, userName: string): Circle {
    const circle = this.circles.get(circleId);
    
    if (!circle) {
      throw new Error(`Circle with ID ${circleId} not found`);
    }
    
    // Check if username already exists in this circle
    // In our trust model, names must be unique within each circle
    const existingUser = circle.users.find(user => user.name === userName);
    if (existingUser) {
      throw new Error(`User with name "${userName}" already exists in this circle`);
    }
    
    // Create new user
    const newUser: User = {
      id: this.generateId(),
      name: userName,
      joinedAt: new Date()
    };
    
    // Add user to global users map
    this.users.set(newUser.id, newUser);
    
    // Add user to circle's users array
    circle.users.push(newUser);
    
    // Update the circle in storage
    this.circles.set(circleId, circle);
    
    return circle;
  }

  // ============ USER METHODS ============

  /**
   * Find a user by their ID
   * 
   * @param id - The user ID to look up
   * @returns The user if found, undefined otherwise
   */
  static getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  /**
   * Get all users (mainly for debugging/admin purposes)
   * 
   * @returns Array of all users
   */
  static getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // ============ UTILITY METHODS ============

  /**
   * Clear all data (useful for testing)
   */
  static clearAll(): void {
    this.circles.clear();
    this.users.clear();
  }

  /**
   * Get storage statistics (useful for debugging)
   * 
   * @returns Object with counts of circles and users
   */
  static getStats(): { circleCount: number; userCount: number } {
    return {
      circleCount: this.circles.size,
      userCount: this.users.size
    };
  }
}
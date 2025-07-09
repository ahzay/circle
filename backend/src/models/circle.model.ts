/**
 * Circle Model
 * 
 * Represents a "circle" - a group of trusted users who share resources.
 * Each circle has a unique ID that serves as the shareable link identifier.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - A circle is the core container that holds users and (later) resources
 * - The 'id' becomes part of the shareable URL: /join/abc123
 * - Arrays use [] syntax - users: User[] means "array of User objects"
 * - Import statements bring in types from other files
 */

import { User } from './user.model';

export interface Circle {
  /** Unique identifier used in shareable URLs (e.g., /join/abc123) */
  id: string;
  
  /** Human-readable name for the circle (e.g., "Maple Street Neighbors") */
  name: string;
  
  /** Array of users who have joined this circle */
  users: User[];
  
  /** Timestamp when the circle was created */
  createdAt: Date;
  
  /** ID of the user who created this circle */
  createdBy: string;
}

/**
 * CreateCircleRequest
 * 
 * Data structure for creating a new circle.
 * This is what the frontend sends when someone clicks "Create Circle".
 */
export interface CreateCircleRequest {
  /** Name for the new circle */
  name: string;
  
  /** Name of the user creating the circle (they become the first member) */
  creatorName: string;
}

/**
 * CircleResponse
 * 
 * How circle data is returned from API to frontend.
 * Includes additional computed properties and formatted data.
 */
export interface CircleResponse extends Circle {
  /** Human-readable version of createdAt date */
  createdAtFormatted?: string;
  
  /** Number of users in the circle */
  userCount: number;
  
  /** The shareable URL for joining this circle */
  shareableUrl: string;
}

/**
 * JoinCircleRequest
 * 
 * Data structure for joining an existing circle.
 * User provides their name to join the circle.
 */
export interface JoinCircleRequest {
  /** Name the user wants to use in this circle */
  userName: string;
}
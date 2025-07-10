/**
 * Resource Model
 * 
 * Represents a shareable resource (lawn mower, tools, car, etc.) within a circle.
 * Resources are owned by users and can be borrowed by other circle members.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Resources belong to circles and are owned by users
 * - isAvailable tracks if the resource is currently available for borrowing
 * - currentBorrowerId tracks who has borrowed the resource (if anyone)
 * - This model will be extended in Phase 4 for borrowing/returning logic
 */

export interface Resource {
  /** Unique identifier for the resource */
  id: string;
  
  /** Name of the resource (e.g., "Lawn Mower", "Power Drill") */
  name: string;
  
  /** Detailed description of the resource */
  description: string;
  
  /** ID of the user who owns this resource */
  ownerId: string;
  
  /** ID of the circle this resource belongs to */
  circleId: string;
  
  /** Whether the resource is currently available for borrowing */
  isAvailable: boolean;
  
  /** ID of user who currently has the resource (if borrowed) */
  currentBorrowerId?: string;
  
  /** When the resource was added to the circle */
  createdAt: Date;
}

/**
 * CreateResourceRequest
 * 
 * Data structure for adding a new resource to a circle.
 * This is what the frontend sends to the backend API.
 */
export interface CreateResourceRequest {
  /** Name of the resource */
  name: string;
  
  /** Description of the resource */
  description: string;
  
  /** ID of the user adding the resource (they become the owner) */
  ownerId: string;
  
  /** ID of the circle to add the resource to */
  circleId: string;
}

/**
 * ResourceResponse
 * 
 * Enhanced resource data returned from the API to the frontend.
 * Includes additional computed properties and formatted data.
 */
export interface ResourceResponse extends Resource {
  /** Human-readable version of createdAt date */
  createdAtFormatted?: string;
  
  /** Name of the resource owner */
  ownerName?: string;
  
  /** Name of current borrower (if any) */
  currentBorrowerName?: string;
}
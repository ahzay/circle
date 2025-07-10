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

import { Circle, User, Resource, BorrowRequest, BorrowRequestStatus } from '../../../shared/models';
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
  
  // Map<resourceId, Resource> - stores all resources by their ID
  private static resources: Map<string, Resource> = new Map();
  
  // Map<borrowRequestId, BorrowRequest> - stores all borrow requests by their ID
  private static borrowRequests: Map<string, BorrowRequest> = new Map();

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

  // ============ RESOURCE METHODS ============

  /**
   * Create a new resource in a circle
   * 
   * @param circleId - ID of the circle to add the resource to
   * @param name - Name of the resource
   * @param description - Description of the resource
   * @param ownerId - ID of the user who owns the resource
   * @returns The newly created resource
   */
  static createResource(circleId: string, name: string, description: string, ownerId: string): Resource {
    // Verify the circle exists
    const circle = this.circles.get(circleId);
    if (!circle) {
      throw new Error(`Circle with ID ${circleId} not found`);
    }
    
    // Verify the owner is a member of the circle
    const owner = circle.users.find(user => user.id === ownerId);
    if (!owner) {
      throw new Error(`User ${ownerId} is not a member of circle ${circleId}`);
    }
    
    // Create the resource
    const resource: Resource = {
      id: this.generateId(),
      name: name.trim(),
      description: description.trim(),
      ownerId,
      circleId,
      isAvailable: true, // New resources are available by default
      createdAt: new Date()
    };
    
    // Store the resource
    this.resources.set(resource.id, resource);
    
    return resource;
  }

  /**
   * Get all resources for a specific circle
   * 
   * @param circleId - ID of the circle
   * @returns Array of resources in the circle
   */
  static getResourcesForCircle(circleId: string): Resource[] {
    return Array.from(this.resources.values())
      .filter(resource => resource.circleId === circleId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Newest first
  }

  /**
   * Get a specific resource by ID
   * 
   * @param resourceId - ID of the resource
   * @returns The resource if found, undefined otherwise
   */
  static getResource(resourceId: string): Resource | undefined {
    return this.resources.get(resourceId);
  }

  /**
   * Update a resource
   * 
   * @param resourceId - ID of the resource to update
   * @param updates - Partial resource object with updates
   * @returns The updated resource
   */
  static updateResource(resourceId: string, updates: Partial<Resource>): Resource {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }
    
    // Apply updates
    const updatedResource = { ...resource, ...updates };
    
    // Store the updated resource
    this.resources.set(resourceId, updatedResource);
    
    return updatedResource;
  }

  /**
   * Delete a resource
   * 
   * @param resourceId - ID of the resource to delete
   * @param userId - ID of the user requesting deletion (must be owner)
   * @returns True if deleted successfully
   */
  static deleteResource(resourceId: string, userId: string): boolean {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }
    
    // Only the owner can delete their resource
    if (resource.ownerId !== userId) {
      throw new Error('Only the resource owner can delete this resource');
    }
    
    // Don't allow deletion if resource is currently borrowed
    if (!resource.isAvailable) {
      throw new Error('Cannot delete a resource that is currently borrowed');
    }
    
    // Delete the resource
    this.resources.delete(resourceId);
    
    return true;
  }

  // ============ BORROW REQUEST METHODS ============

  /**
   * Create a new borrow request for a resource
   * 
   * @param resourceId - ID of the resource being requested
   * @param requestedBy - ID of the user making the request
   * @param requestMessage - Optional message from the borrower
   * @param expectedReturnDate - Optional expected return date
   * @returns The newly created borrow request
   */
  static createBorrowRequest(
    resourceId: string, 
    requestedBy: string, 
    requestMessage?: string,
    expectedReturnDate?: Date
  ): BorrowRequest {
    // Verify the resource exists
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }
    
    // Verify the resource is available for borrowing
    if (!resource.isAvailable) {
      throw new Error('Resource is not currently available for borrowing');
    }
    
    // Verify the requester is not the owner
    if (resource.ownerId === requestedBy) {
      throw new Error('Resource owners cannot borrow their own resources');
    }
    
    // Verify the requester exists and is in the same circle
    const circle = this.circles.get(resource.circleId);
    if (!circle) {
      throw new Error(`Circle with ID ${resource.circleId} not found`);
    }
    
    const requester = circle.users.find(user => user.id === requestedBy);
    if (!requester) {
      throw new Error(`User ${requestedBy} is not a member of circle ${resource.circleId}`);
    }
    
    // Check if there's already a pending request for this resource by this user
    const existingRequest = Array.from(this.borrowRequests.values())
      .find(req => req.resourceId === resourceId && req.requestedBy === requestedBy && req.status === 'pending');
    
    if (existingRequest) {
      throw new Error('You already have a pending request for this resource');
    }
    
    // Create the borrow request
    const borrowRequest: BorrowRequest = {
      id: this.generateId(),
      resourceId,
      circleId: resource.circleId,
      requestedBy,
      requestMessage,
      status: 'pending',
      requestedAt: new Date(),
      expectedReturnDate
    };
    
    // Store the borrow request
    this.borrowRequests.set(borrowRequest.id, borrowRequest);
    
    return borrowRequest;
  }

  /**
   * Get all borrow requests for a specific circle
   * 
   * @param circleId - ID of the circle
   * @returns Array of borrow requests in the circle, sorted by newest first
   */
  static getBorrowRequestsForCircle(circleId: string): BorrowRequest[] {
    return Array.from(this.borrowRequests.values())
      .filter(request => request.circleId === circleId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()); // Newest first
  }

  /**
   * Get all borrow requests for a specific user (either requested by or responded by)
   * 
   * @param userId - ID of the user
   * @returns Array of borrow requests involving the user
   */
  static getBorrowRequestsForUser(userId: string): BorrowRequest[] {
    return Array.from(this.borrowRequests.values())
      .filter(request => request.requestedBy === userId || request.respondedBy === userId)
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()); // Newest first
  }

  /**
   * Get all pending borrow requests for resources owned by a specific user
   * 
   * @param ownerId - ID of the resource owner
   * @returns Array of pending borrow requests for their resources
   */
  static getPendingRequestsForOwner(ownerId: string): BorrowRequest[] {
    return Array.from(this.borrowRequests.values())
      .filter(request => {
        const resource = this.resources.get(request.resourceId);
        return resource && resource.ownerId === ownerId && request.status === 'pending';
      })
      .sort((a, b) => b.requestedAt.getTime() - a.requestedAt.getTime()); // Newest first
  }

  /**
   * Get a specific borrow request by ID
   * 
   * @param requestId - ID of the borrow request
   * @returns The borrow request if found, undefined otherwise
   */
  static getBorrowRequest(requestId: string): BorrowRequest | undefined {
    return this.borrowRequests.get(requestId);
  }

  /**
   * Respond to a borrow request (approve or deny)
   * 
   * @param requestId - ID of the borrow request
   * @param approved - Whether to approve (true) or deny (false)
   * @param respondedBy - ID of the user responding (should be resource owner)
   * @param responseMessage - Optional message explaining the decision
   * @returns The updated borrow request
   */
  static respondToBorrowRequest(
    requestId: string, 
    approved: boolean, 
    respondedBy: string, 
    responseMessage?: string
  ): BorrowRequest {
    const borrowRequest = this.borrowRequests.get(requestId);
    if (!borrowRequest) {
      throw new Error(`Borrow request with ID ${requestId} not found`);
    }
    
    // Verify the request is still pending
    if (borrowRequest.status !== 'pending') {
      throw new Error(`Borrow request is no longer pending (current status: ${borrowRequest.status})`);
    }
    
    // Verify the responder owns the resource
    const resource = this.resources.get(borrowRequest.resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${borrowRequest.resourceId} not found`);
    }
    
    if (resource.ownerId !== respondedBy) {
      throw new Error('Only the resource owner can respond to borrow requests');
    }
    
    // Update the borrow request
    borrowRequest.status = approved ? 'approved' : 'denied';
    borrowRequest.respondedAt = new Date();
    borrowRequest.respondedBy = respondedBy;
    borrowRequest.responseMessage = responseMessage;
    
    // If approved, mark the resource as borrowed
    if (approved) {
      resource.isAvailable = false;
      resource.currentBorrowerId = borrowRequest.requestedBy;
      this.resources.set(resource.id, resource);
    }
    
    // Update the borrow request in storage
    this.borrowRequests.set(requestId, borrowRequest);
    
    return borrowRequest;
  }

  /**
   * Borrow a resource directly (simplified version)
   * 
   * @param resourceId - ID of the resource to borrow
   * @param borrowerId - ID of the user borrowing the resource
   * @returns The updated resource
   */
  static borrowResource(resourceId: string, borrowerId: string): Resource {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }
    
    // Verify the resource is available
    if (!resource.isAvailable) {
      throw new Error('Resource is not currently available for borrowing');
    }
    
    // Verify the borrower is not the owner
    if (resource.ownerId === borrowerId) {
      throw new Error('Resource owners cannot borrow their own resources');
    }
    
    // Verify the borrower exists and is in the same circle
    const circle = this.circles.get(resource.circleId);
    if (!circle) {
      throw new Error(`Circle with ID ${resource.circleId} not found`);
    }
    
    const borrower = circle.users.find(user => user.id === borrowerId);
    if (!borrower) {
      throw new Error(`User ${borrowerId} is not a member of circle ${resource.circleId}`);
    }
    
    // Update the resource
    resource.isAvailable = false;
    resource.currentBorrowerId = borrowerId;
    
    // Store the updated resource
    this.resources.set(resourceId, resource);
    
    return resource;
  }

  /**
   * Return a resource directly (simplified version)
   * 
   * @param resourceId - ID of the resource to return
   * @param borrowerId - ID of the user returning the resource
   * @returns The updated resource
   */
  static returnResource(resourceId: string, borrowerId: string): Resource {
    const resource = this.resources.get(resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }
    
    // Verify the resource is currently borrowed
    if (resource.isAvailable) {
      throw new Error('Resource is not currently borrowed');
    }
    
    // Verify the correct user is returning it
    if (resource.currentBorrowerId !== borrowerId) {
      throw new Error('Only the current borrower can return this resource');
    }
    
    // Update the resource
    resource.isAvailable = true;
    resource.currentBorrowerId = undefined;
    
    // Store the updated resource
    this.resources.set(resourceId, resource);
    
    return resource;
  }

  /**
   * Mark a resource as returned (complex version with borrow request)
   * 
   * @param requestId - ID of the borrow request
   * @param returnedBy - ID of the user returning (should be the borrower)
   * @returns The updated borrow request
   */
  static returnResourceByRequest(requestId: string, returnedBy: string): BorrowRequest {
    const borrowRequest = this.borrowRequests.get(requestId);
    if (!borrowRequest) {
      throw new Error(`Borrow request with ID ${requestId} not found`);
    }
    
    // Verify the request was approved and not yet returned
    if (borrowRequest.status !== 'approved') {
      throw new Error(`Borrow request must be approved to be returned (current status: ${borrowRequest.status})`);
    }
    
    // Verify the correct user is returning it
    if (borrowRequest.requestedBy !== returnedBy) {
      throw new Error('Only the borrower can mark the resource as returned');
    }
    
    // Get the resource and mark it as available again
    const resource = this.resources.get(borrowRequest.resourceId);
    if (!resource) {
      throw new Error(`Resource with ID ${borrowRequest.resourceId} not found`);
    }
    
    resource.isAvailable = true;
    resource.currentBorrowerId = undefined;
    this.resources.set(resource.id, resource);
    
    // Update the borrow request
    borrowRequest.status = 'returned';
    borrowRequest.returnedAt = new Date();
    
    // Update the borrow request in storage
    this.borrowRequests.set(requestId, borrowRequest);
    
    return borrowRequest;
  }

  /**
   * Cancel a pending borrow request
   * 
   * @param requestId - ID of the borrow request
   * @param cancelledBy - ID of the user cancelling (should be the requester)
   * @returns The updated borrow request
   */
  static cancelBorrowRequest(requestId: string, cancelledBy: string): BorrowRequest {
    const borrowRequest = this.borrowRequests.get(requestId);
    if (!borrowRequest) {
      throw new Error(`Borrow request with ID ${requestId} not found`);
    }
    
    // Verify the request is pending
    if (borrowRequest.status !== 'pending') {
      throw new Error(`Can only cancel pending requests (current status: ${borrowRequest.status})`);
    }
    
    // Verify the correct user is cancelling
    if (borrowRequest.requestedBy !== cancelledBy) {
      throw new Error('Only the requester can cancel their own request');
    }
    
    // Update the borrow request
    borrowRequest.status = 'cancelled';
    borrowRequest.respondedAt = new Date();
    borrowRequest.respondedBy = cancelledBy;
    
    // Update the borrow request in storage
    this.borrowRequests.set(requestId, borrowRequest);
    
    return borrowRequest;
  }

  // ============ UTILITY METHODS ============

  /**
   * Clear all data (useful for testing)
   */
  static clearAll(): void {
    this.circles.clear();
    this.users.clear();
    this.resources.clear();
    this.borrowRequests.clear();
  }

  /**
   * Get storage statistics (useful for debugging)
   * 
   * @returns Object with counts of circles, users, resources, and borrow requests
   */
  static getStats(): { 
    circleCount: number; 
    userCount: number; 
    resourceCount: number; 
    borrowRequestCount: number;
  } {
    return {
      circleCount: this.circles.size,
      userCount: this.users.size,
      resourceCount: this.resources.size,
      borrowRequestCount: this.borrowRequests.size
    };
  }
}
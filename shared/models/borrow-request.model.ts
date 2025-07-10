/**
 * Borrow Request Model
 * 
 * Represents a request to borrow a resource from another user in the circle.
 * Includes the complete workflow: request -> approval/denial -> return.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - BorrowRequests track the borrowing lifecycle from request to return
 * - status field shows current state: pending, approved, denied, returned
 * - requestedBy is the user who wants to borrow (borrower)
 * - approvedBy is the resource owner who can approve/deny
 * - Each request has timestamps to track the complete workflow
 */

export interface BorrowRequest {
  /** Unique identifier for this borrow request */
  id: string;
  
  /** ID of the resource being requested */
  resourceId: string;
  
  /** ID of the circle this request belongs to */
  circleId: string;
  
  /** ID of the user requesting to borrow the resource */
  requestedBy: string;
  
  /** Optional message from the borrower about why they need it */
  requestMessage?: string;
  
  /** Current status of the request */
  status: BorrowRequestStatus;
  
  /** When the request was first created */
  requestedAt: Date;
  
  /** When the request was approved/denied (if applicable) */
  respondedAt?: Date;
  
  /** ID of the user who approved/denied (typically the resource owner) */
  respondedBy?: string;
  
  /** Message from the owner when approving/denying */
  responseMessage?: string;
  
  /** When the resource was returned (if borrowed and returned) */
  returnedAt?: Date;
  
  /** When the borrower should return the resource (optional due date) */
  expectedReturnDate?: Date;
}

/**
 * BorrowRequestStatus
 * 
 * Tracks the lifecycle of a borrow request:
 * - pending: Initial state, waiting for owner response
 * - approved: Owner said yes, resource is now borrowed
 * - denied: Owner said no, request is closed
 * - returned: Resource has been returned, request is complete
 * - cancelled: Borrower cancelled before owner responded
 */
export type BorrowRequestStatus = 'pending' | 'approved' | 'denied' | 'returned' | 'cancelled';

/**
 * CreateBorrowRequestData
 * 
 * Data structure for creating a new borrow request.
 * This is what the frontend sends when a user wants to borrow something.
 */
export interface CreateBorrowRequestData {
  /** ID of the resource they want to borrow */
  resourceId: string;
  
  /** ID of the user making the request */
  requestedBy: string;
  
  /** Optional message explaining why they need it */
  requestMessage?: string;
  
  /** Optional expected return date */
  expectedReturnDate?: Date;
}

/**
 * RespondToBorrowRequestData
 * 
 * Data structure for approving or denying a borrow request.
 * This is what the frontend sends when the owner responds.
 */
export interface RespondToBorrowRequestData {
  /** Whether to approve (true) or deny (false) the request */
  approved: boolean;
  
  /** ID of the user responding (typically the resource owner) */
  respondedBy: string;
  
  /** Optional message explaining the decision */
  responseMessage?: string;
}

/**
 * ReturnResourceData
 * 
 * Data structure for marking a resource as returned.
 * This is what the frontend sends when the borrower returns the item.
 */
export interface ReturnResourceData {
  /** ID of the user returning the resource (should match original borrower) */
  returnedBy: string;
}

/**
 * BorrowRequestResponse
 * 
 * Enhanced borrow request data returned from API to frontend.
 * Includes additional computed properties and user names for better UX.
 */
export interface BorrowRequestResponse extends BorrowRequest {
  /** Name of the user who requested to borrow */
  requesterName?: string;
  
  /** Name of the user who responded (approved/denied) */
  responderName?: string;
  
  /** Name of the resource being requested */
  resourceName?: string;
  
  /** Name of the resource owner */
  resourceOwnerName?: string;
  
  /** Human-readable status for display */
  statusDisplay?: string;
  
  /** Human-readable timestamps */
  requestedAtFormatted?: string;
  respondedAtFormatted?: string;
  returnedAtFormatted?: string;
  expectedReturnDateFormatted?: string;
  
  /** Whether this request can be cancelled by the requester */
  canCancel?: boolean;
  
  /** Whether this request can be approved/denied by the current user */
  canRespond?: boolean;
  
  /** Whether this resource can be marked as returned */
  canReturn?: boolean;
}
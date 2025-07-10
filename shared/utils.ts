/**
 * Shared Utility Functions
 * 
 * Common utility functions used by both frontend and backend.
 * This includes date formatting, URL generation, and response enhancement utilities.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Utility functions reduce code duplication
 * - Date formatting is consistent across frontend and backend
 * - Response enhancement adds computed properties to API responses
 */

import { Circle, CircleResponse, Resource, ResourceResponse, BorrowRequest, BorrowRequestResponse } from './models';
import { FRONTEND_CONFIG } from './constants';

export class DateUtils {
  /**
   * Format a date for display
   * Provides consistent date formatting across frontend and backend
   */
  static formatDate(date: Date): string {
    return date.toLocaleString();
  }

  /**
   * Format a date for API responses
   * Used when enhancing responses with formatted dates
   */
  static formatDateForResponse(date: Date): string {
    return this.formatDate(date);
  }
}

export class UrlUtils {
  /**
   * Generate shareable URL for a circle
   * Used by both backend API responses and frontend URL generation
   */
  static generateShareableUrl(circleId: string): string {
    return FRONTEND_CONFIG.SHAREABLE_URL(circleId);
  }

  /**
   * Generate join URL for a circle
   * Alternative method for clarity in different contexts
   */
  static generateJoinUrl(circleId: string): string {
    return this.generateShareableUrl(circleId);
  }
}

export class ResponseUtils {
  /**
   * Enhance circle data with computed properties
   * Adds userCount, shareableUrl, and formatted date
   */
  static enhanceCircleResponse(circle: Circle): CircleResponse {
    return {
      ...circle,
      userCount: circle.users.length,
      shareableUrl: UrlUtils.generateShareableUrl(circle.id),
      createdAtFormatted: DateUtils.formatDateForResponse(circle.createdAt)
    };
  }

  /**
   * Enhance resource data with computed properties
   * Adds formatted date and optionally owner/borrower names
   */
  static enhanceResourceResponse(
    resource: Resource, 
    ownerName?: string, 
    currentBorrowerName?: string
  ): ResourceResponse {
    return {
      ...resource,
      createdAtFormatted: DateUtils.formatDateForResponse(resource.createdAt),
      ownerName,
      currentBorrowerName
    };
  }

  /**
   * Enhance borrow request data with computed properties
   * Adds formatted dates, user names, and action flags
   */
  static enhanceBorrowRequestResponse(
    borrowRequest: BorrowRequest,
    requesterName: string,
    resourceOwnerName: string,
    resourceName: string,
    responderName?: string
  ): BorrowRequestResponse {
    // Generate user-friendly status display
    const statusDisplayMap = {
      pending: 'Waiting for approval',
      approved: 'Approved - item borrowed',
      denied: 'Request denied',
      returned: 'Returned',
      cancelled: 'Cancelled'
    };

    // Determine what actions are available
    const canCancel = borrowRequest.status === 'pending';
    const canRespond = borrowRequest.status === 'pending';
    const canReturn = borrowRequest.status === 'approved';

    return {
      ...borrowRequest,
      requesterName,
      responderName,
      resourceName,
      resourceOwnerName,
      statusDisplay: statusDisplayMap[borrowRequest.status],
      requestedAtFormatted: DateUtils.formatDateForResponse(borrowRequest.requestedAt),
      respondedAtFormatted: borrowRequest.respondedAt 
        ? DateUtils.formatDateForResponse(borrowRequest.respondedAt) 
        : undefined,
      returnedAtFormatted: borrowRequest.returnedAt 
        ? DateUtils.formatDateForResponse(borrowRequest.returnedAt) 
        : undefined,
      expectedReturnDateFormatted: borrowRequest.expectedReturnDate 
        ? DateUtils.formatDateForResponse(borrowRequest.expectedReturnDate) 
        : undefined,
      canCancel,
      canRespond,
      canReturn
    };
  }
}

export class IdUtils {
  /**
   * Generate a random ID
   * Simple implementation for generating unique IDs
   */
  static generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Validate ID format
   * Check if an ID meets minimum requirements
   */
  static isValidId(id: string): boolean {
    return !!(id && id.length >= 10);
  }
}

export class StringUtils {
  /**
   * Safely trim a string
   * Handles null/undefined values gracefully
   */
  static safeTrim(value: string | null | undefined): string {
    return (value || '').trim();
  }

  /**
   * Check if a string is empty or just whitespace
   */
  static isEmpty(value: string | null | undefined): boolean {
    return !value || value.trim().length === 0;
  }

  /**
   * Truncate a string to a maximum length
   */
  static truncate(value: string, maxLength: number): string {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength - 3) + '...';
  }
}
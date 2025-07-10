/**
 * Shared Error Types and Handling
 * 
 * Common error types and error handling utilities used by both frontend and backend.
 * This provides consistent error handling patterns across the entire application.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Custom error types provide better error handling than generic Error
 * - Error codes help categorize different types of errors
 * - Consistent error structure makes debugging easier
 */

import { HTTP_STATUS, ERROR_MESSAGES } from './constants';

export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  FORBIDDEN = 'FORBIDDEN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode?: number;
}

export class CircleError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(code: ErrorCode, message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST, details?: any) {
    super(message);
    this.name = 'CircleError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, CircleError.prototype);
  }

  toApiError(): ApiError {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details
    };
  }
}

export class ValidationError extends CircleError {
  constructor(message: string, details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, HTTP_STATUS.BAD_REQUEST, details);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class NotFoundError extends CircleError {
  constructor(message: string = ERROR_MESSAGES.CIRCLE_NOT_FOUND, details?: any) {
    super(ErrorCode.NOT_FOUND, message, HTTP_STATUS.NOT_FOUND, details);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class ConflictError extends CircleError {
  constructor(message: string = ERROR_MESSAGES.USER_ALREADY_EXISTS, details?: any) {
    super(ErrorCode.CONFLICT, message, HTTP_STATUS.CONFLICT, details);
    this.name = 'ConflictError';
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ForbiddenError extends CircleError {
  constructor(message: string = ERROR_MESSAGES.RESOURCE_NOT_OWNER, details?: any) {
    super(ErrorCode.FORBIDDEN, message, HTTP_STATUS.FORBIDDEN, details);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class NetworkError extends CircleError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, details?: any) {
    super(ErrorCode.NETWORK_ERROR, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

export class ErrorHandler {
  /**
   * Convert HTTP error response to CircleError
   * Used by frontend to handle API errors consistently
   */
  static fromHttpError(error: any): CircleError {
    if (error.status === 0) {
      return new NetworkError();
    }

    const message = error.error?.error || error.message || ERROR_MESSAGES.UNEXPECTED_ERROR;
    
    switch (error.status) {
      case HTTP_STATUS.BAD_REQUEST:
        return new ValidationError(message);
      case HTTP_STATUS.NOT_FOUND:
        return new NotFoundError(message);
      case HTTP_STATUS.CONFLICT:
        return new ConflictError(message);
      case HTTP_STATUS.FORBIDDEN:
        return new ForbiddenError(message);
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return new CircleError(ErrorCode.SERVER_ERROR, ERROR_MESSAGES.SERVER_ERROR, error.status);
      default:
        return new CircleError(ErrorCode.UNKNOWN_ERROR, message, error.status);
    }
  }

  /**
   * Handle error for API responses
   * Used by backend to send consistent error responses
   */
  static handleApiError(error: any): { statusCode: number; body: any } {
    if (error instanceof CircleError) {
      return {
        statusCode: error.statusCode,
        body: { error: error.message, code: error.code }
      };
    }

    // Handle unexpected errors
    console.error('Unexpected error:', error);
    return {
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      body: { 
        error: ERROR_MESSAGES.SERVER_ERROR,
        code: ErrorCode.SERVER_ERROR
      }
    };
  }

  /**
   * Create user-friendly error message
   * Convert technical errors to user-friendly messages
   */
  static getUserFriendlyMessage(error: CircleError): string {
    switch (error.code) {
      case ErrorCode.NETWORK_ERROR:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ErrorCode.NOT_FOUND:
        return ERROR_MESSAGES.CIRCLE_NOT_FOUND;
      case ErrorCode.SERVER_ERROR:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return error.message;
    }
  }
}
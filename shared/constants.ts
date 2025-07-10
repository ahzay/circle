/**
 * Shared Constants
 * 
 * API endpoints, error messages, and other constants used by both frontend and backend.
 * This ensures consistent URLs and error handling across the entire application.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Centralized constants prevent typos in endpoint URLs
 * - Both frontend and backend use the same error messages
 * - HTTP status codes are standardized across the app
 */

export const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:3000/api',
  CIRCLES: '/circles',
  RESOURCES: '/resources',
  CIRCLES_RESOURCES: (circleId: string) => `/resources/circle/${circleId}`,
  CIRCLE_BY_ID: (id: string) => `/circles/${id}`,
  CIRCLE_JOIN: (id: string) => `/circles/${id}/join`,
  RESOURCE_BY_ID: (id: string) => `/resources/${id}`,
  RESOURCE_DELETE: (id: string, userId: string) => `/resources/${id}?userId=${userId}`,
  RESOURCE_BORROW: (id: string) => `/resources/${id}/borrow`,
  RESOURCE_RETURN: (id: string) => `/resources/${id}/return`
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const ERROR_MESSAGES = {
  // Network errors
  NETWORK_ERROR: 'Cannot connect to server. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNEXPECTED_ERROR: 'An unexpected error occurred',

  // Circle errors
  CIRCLE_NOT_FOUND: 'Circle not found. Please check the link and try again.',
  CIRCLE_CREATION_FAILED: 'Failed to create circle',
  USER_ALREADY_EXISTS: 'A user with that name already exists in this circle',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_CREATION_FAILED: 'Failed to create resource',
  RESOURCE_DELETE_FAILED: 'Failed to delete resource',
  RESOURCE_NOT_OWNER: 'Only the resource owner can delete this resource',
  RESOURCE_CURRENTLY_BORROWED: 'Cannot delete resource while it is currently borrowed',
  USER_NOT_MEMBER: 'User is not a member of this circle',

  // Generic errors
  MISSING_REQUIRED_FIELDS: 'Missing required fields',
  INVALID_REQUEST: 'Invalid request data'
} as const;

export const SUCCESS_MESSAGES = {
  CIRCLE_CREATED: 'Circle created successfully',
  CIRCLE_JOINED: 'Successfully joined circle',
  RESOURCE_CREATED: 'Resource added successfully',
  RESOURCE_DELETED: 'Resource deleted successfully'
} as const;

export const FRONTEND_CONFIG = {
  BASE_URL: 'http://localhost:4200',
  SHAREABLE_URL: (circleId: string) => `http://localhost:4200/join/${circleId}`
} as const;
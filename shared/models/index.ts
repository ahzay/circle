/**
 * Shared Models
 * 
 * This file exports all shared TypeScript interfaces that are used by both
 * the backend (Node.js) and frontend (Angular). This is one of the key
 * advantages of using TypeScript on both sides - we can share type definitions!
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Shared models prevent duplication between frontend and backend
 * - Both sides import from this single source of truth
 * - Changes to interfaces automatically update both frontend and backend
 * - This is much better than maintaining separate model files
 */

// Re-export all models from their respective files
export * from './user.model';
export * from './circle.model';
export * from './resource.model';
export * from './borrow-request.model';

// Re-export shared utilities
export * from '../validation';
export * from '../constants';
export * from '../utils';
export * from '../errors';
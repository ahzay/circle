/**
 * Shared Validation Utilities
 * 
 * Common validation rules and utilities used by both frontend and backend.
 * This ensures consistent validation across the entire application.
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Shared validation prevents inconsistencies between frontend and backend
 * - Constants ensure field limits are the same everywhere
 * - Validation functions return descriptive error messages
 */

export const VALIDATION_LIMITS = {
  CIRCLE_NAME_MAX: 100,
  USER_NAME_MAX: 50,
  RESOURCE_NAME_MAX: 100,
  RESOURCE_DESCRIPTION_MAX: 500,
  MIN_ID_LENGTH: 10
} as const;

export const VALIDATION_MESSAGES = {
  CIRCLE_NAME_REQUIRED: 'Circle name is required',
  CIRCLE_NAME_TOO_LONG: `Circle name must be ${VALIDATION_LIMITS.CIRCLE_NAME_MAX} characters or less`,
  USER_NAME_REQUIRED: 'User name is required',
  USER_NAME_TOO_LONG: `User name must be ${VALIDATION_LIMITS.USER_NAME_MAX} characters or less`,
  RESOURCE_NAME_REQUIRED: 'Resource name is required',
  RESOURCE_NAME_TOO_LONG: `Resource name must be ${VALIDATION_LIMITS.RESOURCE_NAME_MAX} characters or less`,
  RESOURCE_DESCRIPTION_REQUIRED: 'Resource description is required',
  RESOURCE_DESCRIPTION_TOO_LONG: `Resource description must be ${VALIDATION_LIMITS.RESOURCE_DESCRIPTION_MAX} characters or less`,
  OWNER_ID_REQUIRED: 'Owner ID is required',
  CIRCLE_ID_REQUIRED: 'Circle ID is required',
  INVALID_ID_FORMAT: 'Invalid ID format'
} as const;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class ValidationUtils {
  /**
   * Validate circle name
   */
  static validateCircleName(name: string | undefined | null): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: VALIDATION_MESSAGES.CIRCLE_NAME_REQUIRED };
    }
    
    if (name.length > VALIDATION_LIMITS.CIRCLE_NAME_MAX) {
      return { isValid: false, error: VALIDATION_MESSAGES.CIRCLE_NAME_TOO_LONG };
    }
    
    return { isValid: true };
  }

  /**
   * Validate user name
   */
  static validateUserName(name: string | undefined | null): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: VALIDATION_MESSAGES.USER_NAME_REQUIRED };
    }
    
    if (name.length > VALIDATION_LIMITS.USER_NAME_MAX) {
      return { isValid: false, error: VALIDATION_MESSAGES.USER_NAME_TOO_LONG };
    }
    
    return { isValid: true };
  }

  /**
   * Validate resource name
   */
  static validateResourceName(name: string | undefined | null): ValidationResult {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: VALIDATION_MESSAGES.RESOURCE_NAME_REQUIRED };
    }
    
    if (name.length > VALIDATION_LIMITS.RESOURCE_NAME_MAX) {
      return { isValid: false, error: VALIDATION_MESSAGES.RESOURCE_NAME_TOO_LONG };
    }
    
    return { isValid: true };
  }

  /**
   * Validate resource description
   */
  static validateResourceDescription(description: string | undefined | null): ValidationResult {
    if (!description || description.trim().length === 0) {
      return { isValid: false, error: VALIDATION_MESSAGES.RESOURCE_DESCRIPTION_REQUIRED };
    }
    
    if (description.length > VALIDATION_LIMITS.RESOURCE_DESCRIPTION_MAX) {
      return { isValid: false, error: VALIDATION_MESSAGES.RESOURCE_DESCRIPTION_TOO_LONG };
    }
    
    return { isValid: true };
  }

  /**
   * Validate ID format
   */
  static validateId(id: string | undefined | null): ValidationResult {
    if (!id || id.length < VALIDATION_LIMITS.MIN_ID_LENGTH) {
      return { isValid: false, error: VALIDATION_MESSAGES.INVALID_ID_FORMAT };
    }
    
    return { isValid: true };
  }

  /**
   * Validate required field
   */
  static validateRequired(value: string | undefined | null, fieldName: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    
    return { isValid: true };
  }

  /**
   * Validate create circle request
   */
  static validateCreateCircleRequest(request: any): ValidationResult {
    const nameValidation = this.validateCircleName(request?.name);
    if (!nameValidation.isValid) return nameValidation;

    const creatorValidation = this.validateUserName(request?.creatorName);
    if (!creatorValidation.isValid) return creatorValidation;

    return { isValid: true };
  }

  /**
   * Validate join circle request
   */
  static validateJoinCircleRequest(request: any): ValidationResult {
    return this.validateUserName(request?.userName);
  }

  /**
   * Validate create resource request
   */
  static validateCreateResourceRequest(request: any): ValidationResult {
    const nameValidation = this.validateResourceName(request?.name);
    if (!nameValidation.isValid) return nameValidation;

    const descriptionValidation = this.validateResourceDescription(request?.description);
    if (!descriptionValidation.isValid) return descriptionValidation;

    const ownerValidation = this.validateRequired(request?.ownerId, 'Owner ID');
    if (!ownerValidation.isValid) return ownerValidation;

    const circleValidation = this.validateRequired(request?.circleId, 'Circle ID');
    if (!circleValidation.isValid) return circleValidation;

    return { isValid: true };
  }
}
/**
 * Resource Routes
 * 
 * API endpoints for resource operations within circles:
 * - POST /api/circles/:circleId/resources - Add a new resource to a circle
 * - GET /api/circles/:circleId/resources - Get all resources in a circle
 * - GET /api/resources/:id - Get a specific resource
 * - PUT /api/resources/:id - Update a resource
 * - DELETE /api/resources/:id - Delete a resource
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Resources belong to circles and are owned by users
 * - We validate that users exist in the circle before allowing operations
 * - Response includes enhanced data with owner names for better UX
 * - Error handling provides clear feedback for invalid operations
 */

import express from 'express';
import { StorageService } from '../services/storage.service';
import { 
  CreateResourceRequest, 
  ResourceResponse,
  ValidationUtils,
  ResponseUtils,
  ErrorHandler,
  NotFoundError,
  HTTP_STATUS
} from '../../../shared/models';

// Create Express router to group resource-related endpoints
const router = express.Router();

/**
 * POST /api/resources
 * 
 * Add a new resource to a circle.
 * The user must be a member of the circle to add resources.
 * 
 * Request body: CreateResourceRequest with circleId included
 * Response: ResourceResponse with enhanced data
 */
router.post('/', (req, res) => {
  try {
    // Extract resource data from request body (including circleId)
    const { name, description, ownerId, circleId }: CreateResourceRequest = req.body;
    
    // Validate request using shared validation
    const validation = ValidationUtils.validateCreateResourceRequest(req.body);
    if (!validation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: validation.error
      });
    }
    
    // Create the resource using our storage service
    const resource = StorageService.createResource(circleId, name, description, ownerId);
    
    // Get owner information for enhanced response
    const owner = StorageService.getUser(ownerId);
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceResourceResponse(
      resource,
      owner?.name || 'Unknown User'
    );
    
    // Send successful response with 201 (Created) status
    res.status(HTTP_STATUS.CREATED).json(response);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * GET /api/resources/circle/:circleId
 * 
 * Get all resources in a specific circle.
 * Returns enhanced resource data with owner names.
 * 
 * URL parameter: circleId (the circle ID)
 * Response: Array of ResourceResponse objects
 */
router.get('/circle/:circleId', (req, res) => {
  try {
    // Extract circle ID from URL parameter
    const { circleId } = req.params;
    
    // Validate circle ID format using shared validation
    const idValidation = ValidationUtils.validateId(circleId);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Verify the circle exists
    const circle = StorageService.getCircle(circleId);
    if (!circle) {
      throw new NotFoundError();
    }
    
    // Get all resources for this circle
    const resources = StorageService.getResourcesForCircle(circleId);
    
    // Enhance each resource using shared utility
    const enhancedResources: ResourceResponse[] = resources.map(resource => {
      const owner = StorageService.getUser(resource.ownerId);
      const currentBorrower = resource.currentBorrowerId 
        ? StorageService.getUser(resource.currentBorrowerId) 
        : null;
      
      return ResponseUtils.enhanceResourceResponse(
        resource,
        owner?.name || 'Unknown User',
        currentBorrower?.name
      );
    });
    
    // Send successful response
    res.json(enhancedResources);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * GET /api/resources/:id
 * 
 * Get a specific resource by its ID.
 * Returns enhanced resource data with owner name.
 * 
 * URL parameter: id (the resource ID)
 * Response: ResourceResponse or 404 if not found
 */
router.get('/:id', (req, res) => {
  try {
    // Extract resource ID from URL parameter
    const { id } = req.params;
    
    // Validate resource ID format using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Look up the resource
    const resource = StorageService.getResource(id);
    
    if (!resource) {
      throw new NotFoundError('Resource not found');
    }
    
    // Get owner information for enhanced response
    const owner = StorageService.getUser(resource.ownerId);
    const currentBorrower = resource.currentBorrowerId 
      ? StorageService.getUser(resource.currentBorrowerId) 
      : null;
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceResourceResponse(
      resource,
      owner?.name || 'Unknown User',
      currentBorrower?.name
    );
    
    // Send successful response
    res.json(response);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * DELETE /api/resources/:id
 * 
 * Delete a resource.
 * Only the owner can delete their resource, and only if it's not currently borrowed.
 * 
 * URL parameter: id (the resource ID)
 * Query parameter: userId (ID of the user requesting deletion)
 * Response: Success message or error
 */
router.delete('/:id', (req, res) => {
  try {
    // Extract resource ID from URL and user ID from query params
    const { id } = req.params;
    const { userId } = req.query;
    
    // Validate required fields using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    const userIdValidation = ValidationUtils.validateRequired(userId as string, 'User ID');
    if (!userIdValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: userIdValidation.error
      });
    }
    
    // Delete the resource
    const success = StorageService.deleteResource(id, userId as string);
    
    if (success) {
      res.json({
        message: 'Resource deleted successfully'
      });
    }
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * POST /api/resources/:id/borrow
 * 
 * Borrow a resource.
 * The user must be a member of the circle and the resource must be available.
 * 
 * URL parameter: id (the resource ID)
 * Request body: { borrowerId: string }
 * Response: Updated ResourceResponse
 */
router.post('/:id/borrow', (req, res) => {
  try {
    const { id } = req.params;
    const { borrowerId } = req.body;
    
    // Validate resource ID
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Validate borrower ID
    const borrowerValidation = ValidationUtils.validateRequired(borrowerId, 'Borrower ID');
    if (!borrowerValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: borrowerValidation.error
      });
    }
    
    // Borrow the resource
    const resource = StorageService.borrowResource(id, borrowerId);
    
    // Get enhanced response data
    const owner = StorageService.getUser(resource.ownerId);
    const borrower = StorageService.getUser(resource.currentBorrowerId!);
    
    const response = ResponseUtils.enhanceResourceResponse(
      resource,
      owner?.name || 'Unknown User',
      borrower?.name
    );
    
    res.json(response);
    
  } catch (error) {
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * POST /api/resources/:id/return
 * 
 * Return a borrowed resource.
 * Only the current borrower can return the resource.
 * 
 * URL parameter: id (the resource ID)
 * Request body: { borrowerId: string }
 * Response: Updated ResourceResponse
 */
router.post('/:id/return', (req, res) => {
  try {
    const { id } = req.params;
    const { borrowerId } = req.body;
    
    // Validate resource ID
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Validate borrower ID
    const borrowerValidation = ValidationUtils.validateRequired(borrowerId, 'Borrower ID');
    if (!borrowerValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: borrowerValidation.error
      });
    }
    
    // Return the resource
    const resource = StorageService.returnResource(id, borrowerId);
    
    // Get enhanced response data
    const owner = StorageService.getUser(resource.ownerId);
    
    const response = ResponseUtils.enhanceResourceResponse(
      resource,
      owner?.name || 'Unknown User'
    );
    
    res.json(response);
    
  } catch (error) {
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

// Export the router so it can be used in app.ts
export default router;
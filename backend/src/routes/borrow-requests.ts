/**
 * Borrow Request Routes
 * 
 * API endpoints for the borrowing/lending workflow:
 * - POST /api/borrow-requests - Create a new borrow request
 * - GET /api/borrow-requests/circle/:circleId - Get all borrow requests for a circle
 * - GET /api/borrow-requests/user/:userId - Get borrow requests for a user
 * - GET /api/borrow-requests/owner/:ownerId - Get pending requests for resource owner
 * - PUT /api/borrow-requests/:id/respond - Approve or deny a borrow request
 * - PUT /api/borrow-requests/:id/return - Mark a resource as returned
 * - PUT /api/borrow-requests/:id/cancel - Cancel a pending request
 * 
 * Key concepts for Angular/Node.js beginners:
 * - These routes handle the complete borrowing lifecycle
 * - Each endpoint validates permissions (only owners can approve, etc.)
 * - Responses include enhanced data with user/resource names for better UX
 * - All operations update both the borrow request and resource availability
 */

import express from 'express';
import { StorageService } from '../services/storage.service';
import { 
  CreateBorrowRequestData,
  RespondToBorrowRequestData,
  ReturnResourceData,
  BorrowRequestResponse,
  ValidationUtils,
  ResponseUtils,
  ErrorHandler,
  NotFoundError,
  HTTP_STATUS
} from '../../../shared/models';

// Create Express router to group borrow request endpoints
const router = express.Router();

/**
 * POST /api/borrow-requests
 * 
 * Create a new borrow request for a resource.
 * The requester must be a member of the circle and not the resource owner.
 * 
 * Request body: CreateBorrowRequestData
 * Response: BorrowRequestResponse with enhanced data
 */
router.post('/', (req, res) => {
  try {
    // Extract borrow request data from request body
    const { resourceId, requestedBy, requestMessage, expectedReturnDate }: CreateBorrowRequestData = req.body;
    
    // Validate request using shared validation
    const validation = ValidationUtils.validateRequired(resourceId, 'Resource ID');
    if (!validation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: validation.error
      });
    }
    
    const userValidation = ValidationUtils.validateRequired(requestedBy, 'User ID');
    if (!userValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: userValidation.error
      });
    }
    
    // Create the borrow request using our storage service
    const borrowRequest = StorageService.createBorrowRequest(
      resourceId,
      requestedBy,
      requestMessage,
      expectedReturnDate
    );
    
    // Get additional data for enhanced response
    const resource = StorageService.getResource(resourceId);
    const requester = StorageService.getUser(requestedBy);
    const owner = resource ? StorageService.getUser(resource.ownerId) : null;
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceBorrowRequestResponse(
      borrowRequest,
      requester?.name || 'Unknown User',
      owner?.name || 'Unknown Owner',
      resource?.name || 'Unknown Resource'
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
 * GET /api/borrow-requests/circle/:circleId
 * 
 * Get all borrow requests for a specific circle.
 * Returns enhanced borrow request data with user and resource names.
 * 
 * URL parameter: circleId (the circle ID)
 * Response: Array of BorrowRequestResponse objects
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
      throw new NotFoundError('Circle not found');
    }
    
    // Get all borrow requests for this circle
    const borrowRequests = StorageService.getBorrowRequestsForCircle(circleId);
    
    // Enhance each borrow request using shared utility
    const enhancedRequests: BorrowRequestResponse[] = borrowRequests.map(request => {
      const requester = StorageService.getUser(request.requestedBy);
      const responder = request.respondedBy ? StorageService.getUser(request.respondedBy) : null;
      const resource = StorageService.getResource(request.resourceId);
      const owner = resource ? StorageService.getUser(resource.ownerId) : null;
      
      return ResponseUtils.enhanceBorrowRequestResponse(
        request,
        requester?.name || 'Unknown User',
        owner?.name || 'Unknown Owner',
        resource?.name || 'Unknown Resource',
        responder?.name
      );
    });
    
    // Send successful response
    res.json(enhancedRequests);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * GET /api/borrow-requests/user/:userId
 * 
 * Get all borrow requests for a specific user (either requested by or responded by).
 * Useful for showing a user's borrowing history.
 * 
 * URL parameter: userId (the user ID)
 * Response: Array of BorrowRequestResponse objects
 */
router.get('/user/:userId', (req, res) => {
  try {
    // Extract user ID from URL parameter
    const { userId } = req.params;
    
    // Validate user ID format using shared validation
    const idValidation = ValidationUtils.validateId(userId);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Verify the user exists
    const user = StorageService.getUser(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Get all borrow requests for this user
    const borrowRequests = StorageService.getBorrowRequestsForUser(userId);
    
    // Enhance each borrow request using shared utility
    const enhancedRequests: BorrowRequestResponse[] = borrowRequests.map(request => {
      const requester = StorageService.getUser(request.requestedBy);
      const responder = request.respondedBy ? StorageService.getUser(request.respondedBy) : null;
      const resource = StorageService.getResource(request.resourceId);
      const owner = resource ? StorageService.getUser(resource.ownerId) : null;
      
      return ResponseUtils.enhanceBorrowRequestResponse(
        request,
        requester?.name || 'Unknown User',
        owner?.name || 'Unknown Owner',
        resource?.name || 'Unknown Resource',
        responder?.name
      );
    });
    
    // Send successful response
    res.json(enhancedRequests);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * GET /api/borrow-requests/owner/:ownerId
 * 
 * Get all pending borrow requests for resources owned by a specific user.
 * Useful for showing what requests need the owner's attention.
 * 
 * URL parameter: ownerId (the owner's user ID)
 * Response: Array of BorrowRequestResponse objects
 */
router.get('/owner/:ownerId', (req, res) => {
  try {
    // Extract owner ID from URL parameter
    const { ownerId } = req.params;
    
    // Validate owner ID format using shared validation
    const idValidation = ValidationUtils.validateId(ownerId);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Verify the owner exists
    const owner = StorageService.getUser(ownerId);
    if (!owner) {
      throw new NotFoundError('User not found');
    }
    
    // Get all pending requests for this owner's resources
    const borrowRequests = StorageService.getPendingRequestsForOwner(ownerId);
    
    // Enhance each borrow request using shared utility
    const enhancedRequests: BorrowRequestResponse[] = borrowRequests.map(request => {
      const requester = StorageService.getUser(request.requestedBy);
      const resource = StorageService.getResource(request.resourceId);
      
      return ResponseUtils.enhanceBorrowRequestResponse(
        request,
        requester?.name || 'Unknown User',
        owner.name,
        resource?.name || 'Unknown Resource'
      );
    });
    
    // Send successful response
    res.json(enhancedRequests);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * PUT /api/borrow-requests/:id/respond
 * 
 * Approve or deny a borrow request.
 * Only the resource owner can respond to requests for their resources.
 * 
 * URL parameter: id (the borrow request ID)
 * Request body: RespondToBorrowRequestData
 * Response: BorrowRequestResponse with enhanced data
 */
router.put('/:id/respond', (req, res) => {
  try {
    // Extract request ID from URL and response data from body
    const { id } = req.params;
    const { approved, respondedBy, responseMessage }: RespondToBorrowRequestData = req.body;
    
    // Validate required fields using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Validate that approved is a boolean
    if (typeof approved !== 'boolean') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Approval decision must be true or false'
      });
    }
    
    const userValidation = ValidationUtils.validateRequired(respondedBy, 'Responder ID');
    if (!userValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: userValidation.error
      });
    }
    
    // Respond to the borrow request
    const borrowRequest = StorageService.respondToBorrowRequest(
      id,
      approved,
      respondedBy,
      responseMessage
    );
    
    // Get additional data for enhanced response
    const requester = StorageService.getUser(borrowRequest.requestedBy);
    const responder = StorageService.getUser(respondedBy);
    const resource = StorageService.getResource(borrowRequest.resourceId);
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceBorrowRequestResponse(
      borrowRequest,
      requester?.name || 'Unknown User',
      responder?.name || 'Unknown User',
      resource?.name || 'Unknown Resource'
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
 * PUT /api/borrow-requests/:id/return
 * 
 * Mark a resource as returned.
 * Only the borrower can mark their borrowed resource as returned.
 * 
 * URL parameter: id (the borrow request ID)
 * Request body: ReturnResourceData
 * Response: BorrowRequestResponse with enhanced data
 */
router.put('/:id/return', (req, res) => {
  try {
    // Extract request ID from URL and return data from body
    const { id } = req.params;
    const { returnedBy }: ReturnResourceData = req.body;
    
    // Validate required fields using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    const userValidation = ValidationUtils.validateRequired(returnedBy, 'Returner ID');
    if (!userValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: userValidation.error
      });
    }
    
    // Mark the resource as returned
    const borrowRequest = StorageService.returnResource(id, returnedBy);
    
    // Get additional data for enhanced response
    const requester = StorageService.getUser(borrowRequest.requestedBy);
    const resource = StorageService.getResource(borrowRequest.resourceId);
    const owner = resource ? StorageService.getUser(resource.ownerId) : null;
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceBorrowRequestResponse(
      borrowRequest,
      requester?.name || 'Unknown User',
      owner?.name || 'Unknown Owner',
      resource?.name || 'Unknown Resource'
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
 * PUT /api/borrow-requests/:id/cancel
 * 
 * Cancel a pending borrow request.
 * Only the requester can cancel their own pending request.
 * 
 * URL parameter: id (the borrow request ID)
 * Query parameter: userId (ID of the user cancelling)
 * Response: BorrowRequestResponse with enhanced data
 */
router.put('/:id/cancel', (req, res) => {
  try {
    // Extract request ID from URL and user ID from query params
    const { id } = req.params;
    const { userId } = req.query;
    
    // Validate required fields using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    const userValidation = ValidationUtils.validateRequired(userId as string, 'User ID');
    if (!userValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: userValidation.error
      });
    }
    
    // Cancel the borrow request
    const borrowRequest = StorageService.cancelBorrowRequest(id, userId as string);
    
    // Get additional data for enhanced response
    const requester = StorageService.getUser(borrowRequest.requestedBy);
    const resource = StorageService.getResource(borrowRequest.resourceId);
    const owner = resource ? StorageService.getUser(resource.ownerId) : null;
    
    // Build enhanced response using shared utility
    const response = ResponseUtils.enhanceBorrowRequestResponse(
      borrowRequest,
      requester?.name || 'Unknown User',
      owner?.name || 'Unknown Owner',
      resource?.name || 'Unknown Resource'
    );
    
    // Send successful response
    res.json(response);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

// Export the router so it can be used in app.ts
export default router;
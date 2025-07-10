/**
 * Circle Routes
 * 
 * API endpoints for circle operations:
 * - POST /api/circles - Create a new circle
 * - GET /api/circles/:id - Get circle details
 * - POST /api/circles/:id/join - Join a circle as a user
 * 
 * Key concepts for Angular/Node.js beginners:
 * - Express Router allows us to group related endpoints
 * - Middleware functions process requests before they reach our handlers
 * - req.body contains JSON data sent by the frontend
 * - res.json() sends JSON responses back to the frontend
 * - HTTP status codes indicate success (200, 201) or errors (400, 404, 500)
 */

import express from 'express';
import { StorageService } from '../services/storage.service';
import { 
  CreateCircleRequest, 
  JoinCircleRequest,
  ValidationUtils,
  ResponseUtils,
  ErrorHandler,
  NotFoundError,
  HTTP_STATUS
} from '../../../shared/models';

// Create Express router to group circle-related endpoints
const router = express.Router();

/**
 * POST /api/circles
 * 
 * Create a new circle with the given name and creator.
 * The creator becomes the first member of the circle.
 * 
 * Request body: CreateCircleRequest
 * Response: CircleResponse with shareable URL
 */
router.post('/', (req, res) => {
  try {
    // Extract data from request body (sent by frontend)
    const { name, creatorName }: CreateCircleRequest = req.body;
    
    // Validate request using shared validation
    const validation = ValidationUtils.validateCreateCircleRequest(req.body);
    if (!validation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: validation.error
      });
    }
    
    // Create the circle using our storage service
    const circle = StorageService.createCircle(name.trim(), creatorName.trim());
    
    // Build response using shared utility
    const response = ResponseUtils.enhanceCircleResponse(circle);
    
    // Send successful response with 201 (Created) status
    res.status(HTTP_STATUS.CREATED).json(response);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * GET /api/circles/:id
 * 
 * Get details of a specific circle by its ID.
 * Used when someone visits a shareable link.
 * 
 * URL parameter: id (the circle ID)
 * Response: CircleResponse or 404 if not found
 */
router.get('/:id', (req, res) => {
  try {
    // Extract circle ID from URL parameter
    const { id } = req.params;
    
    // Validate ID format using shared validation
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Look up the circle in our storage
    const circle = StorageService.getCircle(id);
    
    if (!circle) {
      throw new NotFoundError();
    }
    
    // Build response using shared utility
    const response = ResponseUtils.enhanceCircleResponse(circle);
    
    // Send successful response
    res.json(response);
    
  } catch (error) {
    // Handle errors using shared error handler
    const { statusCode, body } = ErrorHandler.handleApiError(error);
    res.status(statusCode).json(body);
  }
});

/**
 * POST /api/circles/:id/join
 * 
 * Join an existing circle as a new user.
 * Validates that the circle exists and the username is unique within the circle.
 * 
 * URL parameter: id (the circle ID)
 * Request body: JoinCircleRequest
 * Response: Updated CircleResponse with new user added
 */
router.post('/:id/join', (req, res) => {
  try {
    // Extract circle ID from URL and user name from request body
    const { id } = req.params;
    const { userName }: JoinCircleRequest = req.body;
    
    // Validate ID
    const idValidation = ValidationUtils.validateId(id);
    if (!idValidation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: idValidation.error
      });
    }
    
    // Validate request using shared validation
    const validation = ValidationUtils.validateJoinCircleRequest(req.body);
    if (!validation.isValid) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: validation.error
      });
    }
    
    // Check if circle exists first
    const existingCircle = StorageService.getCircle(id);
    if (!existingCircle) {
      throw new NotFoundError();
    }
    
    // Add user to circle (throws error if username already exists)
    const updatedCircle = StorageService.addUserToCircle(id, userName.trim());
    
    // Build response using shared utility
    const response = ResponseUtils.enhanceCircleResponse(updatedCircle);
    
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
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
import { CreateCircleRequest, CircleResponse, JoinCircleRequest } from '../../../shared/models';

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
    
    // Validate required fields
    if (!name || !creatorName) {
      return res.status(400).json({
        error: 'Missing required fields: name and creatorName are required'
      });
    }
    
    // Validate field lengths (prevent extremely long names)
    if (name.length > 100) {
      return res.status(400).json({
        error: 'Circle name must be 100 characters or less'
      });
    }
    
    if (creatorName.length > 50) {
      return res.status(400).json({
        error: 'Creator name must be 50 characters or less'
      });
    }
    
    // Create the circle using our storage service
    const circle = StorageService.createCircle(name.trim(), creatorName.trim());
    
    // Build response with additional computed properties
    const response: CircleResponse = {
      ...circle, // Spread operator copies all properties from circle
      userCount: circle.users.length,
      shareableUrl: `http://localhost:4200/join/${circle.id}`, // Point to Angular frontend
      createdAtFormatted: circle.createdAt.toLocaleString()
    };
    
    // Send successful response with 201 (Created) status
    res.status(201).json(response);
    
  } catch (error) {
    // Handle unexpected errors
    console.error('Error creating circle:', error);
    res.status(500).json({
      error: 'Internal server error while creating circle'
    });
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
    
    // Validate ID format (basic check)
    if (!id || id.length < 10) {
      return res.status(400).json({
        error: 'Invalid circle ID format'
      });
    }
    
    // Look up the circle in our storage
    const circle = StorageService.getCircle(id);
    
    if (!circle) {
      return res.status(404).json({
        error: 'Circle not found'
      });
    }
    
    // Build response with additional computed properties
    const response: CircleResponse = {
      ...circle,
      userCount: circle.users.length,
      shareableUrl: `http://localhost:4200/join/${circle.id}`, // Point to Angular frontend
      createdAtFormatted: circle.createdAt.toLocaleString()
    };
    
    // Send successful response
    res.json(response);
    
  } catch (error) {
    // Handle unexpected errors
    console.error('Error getting circle:', error);
    res.status(500).json({
      error: 'Internal server error while retrieving circle'
    });
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
    
    // Validate required fields
    if (!id || !userName) {
      return res.status(400).json({
        error: 'Missing required fields: circle ID and userName are required'
      });
    }
    
    // Validate field lengths
    if (userName.length > 50) {
      return res.status(400).json({
        error: 'User name must be 50 characters or less'
      });
    }
    
    // Check if circle exists first
    const existingCircle = StorageService.getCircle(id);
    if (!existingCircle) {
      return res.status(404).json({
        error: 'Circle not found'
      });
    }
    
    // Add user to circle (throws error if username already exists)
    const updatedCircle = StorageService.addUserToCircle(id, userName.trim());
    
    // Build response with additional computed properties
    const response: CircleResponse = {
      ...updatedCircle,
      userCount: updatedCircle.users.length,
      shareableUrl: `http://localhost:4200/join/${updatedCircle.id}`, // Point to Angular frontend
      createdAtFormatted: updatedCircle.createdAt.toLocaleString()
    };
    
    // Send successful response
    res.json(response);
    
  } catch (error) {
    // Handle specific business logic errors
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          error: error.message
        });
      }
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: error.message
        });
      }
    }
    
    // Handle unexpected errors
    console.error('Error joining circle:', error);
    res.status(500).json({
      error: 'Internal server error while joining circle'
    });
  }
});

// Export the router so it can be used in app.ts
export default router;
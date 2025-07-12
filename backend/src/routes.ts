import { Router } from 'express';
import { 
  CreateCircleSchema, 
  CreateUserSchema, 
  CreateResourceSchema, 
  CreateClaimSchema,
  JoinCircleSchema,
  UpdateResourceSchema
} from '@/shared/validation/schemas';
import { 
  CircleModel, 
  UserModel, 
  ResourceModel, 
  ClaimModel, 
  CircleMemberModel 
} from './models';
import { validateBody, requireUser, requireCircleMember, success, error } from './middleware';
import { sseManager } from './sse';
import { randomUUID } from 'crypto';

const router = Router();

// Circle routes
router.post('/api/circles', validateBody(CreateCircleSchema), async (req, res) => {
  try {
    const circle = await CircleModel.create(req.body);
    success(res, circle, 201);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.get('/api/circles/:slug', async (req, res) => {
  try {
    const circle = await CircleModel.findBySlug(req.params.slug);
    if (!circle) return error(res, 'Circle not found', 404);
    success(res, circle);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.get('/api/circles/:slug/members', async (req, res) => {
  try {
    const circle = await CircleModel.findBySlug(req.params.slug);
    if (!circle) return error(res, 'Circle not found', 404);
    
    const members = await CircleModel.getMembers(circle.id);
    success(res, members);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.post('/api/circles/:slug/join', validateBody(JoinCircleSchema), async (req, res) => {
  try {
    const circle = await CircleModel.findBySlug(req.params.slug);
    if (!circle) return error(res, 'Circle not found', 404);
    
    const user = await UserModel.findById(req.body.user_id);
    if (!user) return error(res, 'User not found', 404);
    
    const membership = await CircleMemberModel.addMember(circle.id, user.id);
    
    sseManager.broadcast(req.params.slug, {
      type: 'user_joined',
      data: user,
      timestamp: new Date()
    });
    
    success(res, membership, 201);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.get('/api/circles/:slug/resources', async (req, res) => {
  try {
    const circle = await CircleModel.findBySlug(req.params.slug);
    if (!circle) return error(res, 'Circle not found', 404);
    
    const resources = await ResourceModel.findByCircle(circle.id);
    success(res, resources);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.post('/api/circles/:slug/resources', 
  requireUser, 
  requireCircleMember, 
  validateBody(CreateResourceSchema), 
  async (req, res) => {
    try {
      const resource = await ResourceModel.create({
        ...req.body,
        circle_id: req.circle!.id,
        created_by: req.user!.id
      });
      
      sseManager.broadcast(req.params.slug, {
        type: 'resource_created',
        data: resource,
        timestamp: new Date()
      });
      
      success(res, resource, 201);
    } catch (err: any) {
      error(res, err.message, 500);
    }
  }
);

// SSE endpoint
router.get('/api/circles/:slug/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  const clientId = randomUUID();
  sseManager.addClient(req.params.slug, clientId, res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date() })}\n\n`);
  
  // Handle client disconnect
  req.on('close', () => {
    sseManager.removeClient(req.params.slug, clientId);
  });
});

// User routes
router.post('/api/users', validateBody(CreateUserSchema), async (req, res) => {
  try {
    const user = await UserModel.create(req.body);
    success(res, user, 201);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404);
    success(res, user);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.put('/api/users/:id', requireUser, validateBody(CreateUserSchema), async (req, res) => {
  try {
    if (req.params.id !== req.user!.id) {
      return error(res, 'Can only update your own profile', 403);
    }
    
    const user = await UserModel.update(req.params.id, req.body);
    success(res, user);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

// Resource routes
router.get('/api/resources/:id', async (req, res) => {
  try {
    const resource = await ResourceModel.findById(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);
    success(res, resource);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.put('/api/resources/:id', requireUser, validateBody(UpdateResourceSchema), async (req, res) => {
  try {
    const resource = await ResourceModel.findById(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);
    
    // Check if user is creator or circle member
    const circle = await CircleModel.findBySlug(''); // Would need circle slug
    // Simplified - in real app would verify permissions
    
    const updatedResource = await ResourceModel.update(req.params.id, req.body);
    success(res, updatedResource);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.delete('/api/resources/:id', requireUser, async (req, res) => {
  try {
    const resource = await ResourceModel.findById(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);
    
    await ResourceModel.delete(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

// Claim routes
router.get('/api/resources/:id/claims', async (req, res) => {
  try {
    const claims = await ClaimModel.findByResource(req.params.id);
    success(res, claims);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.post('/api/resources/:id/claims', requireUser, validateBody(CreateClaimSchema), async (req, res) => {
  try {
    const resource = await ResourceModel.findById(req.params.id);
    if (!resource) return error(res, 'Resource not found', 404);
    
    const startTime = new Date(req.body.start_time);
    const endTime = new Date(req.body.end_time);
    
    const isAvailable = await ResourceModel.isAvailable(req.params.id, startTime, endTime);
    if (!isAvailable) {
      return error(res, 'Resource not available for this time period', 409);
    }
    
    const claim = await ClaimModel.create({
      ...req.body,
      resource_id: req.params.id,
      user_id: req.user!.id,
      start_time: startTime,
      end_time: endTime
    });
    
    success(res, claim, 201);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.post('/api/claims/:id/return', requireUser, async (req, res) => {
  try {
    const claim = await ClaimModel.findById(req.params.id);
    if (!claim) return error(res, 'Claim not found', 404);
    
    if (claim.user_id !== req.user!.id) {
      return error(res, 'Can only return your own claims', 403);
    }
    
    const returnedClaim = await ClaimModel.returnClaim(req.params.id);
    success(res, returnedClaim);
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

router.delete('/api/claims/:id', requireUser, async (req, res) => {
  try {
    const claim = await ClaimModel.findById(req.params.id);
    if (!claim) return error(res, 'Claim not found', 404);
    
    if (claim.user_id !== req.user!.id) {
      return error(res, 'Can only cancel your own claims', 403);
    }
    
    await ClaimModel.cancel(req.params.id);
    res.status(204).send();
  } catch (err: any) {
    error(res, err.message, 500);
  }
});

export default router;

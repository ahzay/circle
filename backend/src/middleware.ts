import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { CircleModel, UserModel } from './models';
import { User, Circle } from '@/shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      circle?: Circle;
    }
  }
}

export const validateBody = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.issues
        });
      }
      next(error);
    }
  };
};

export const requireUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  
  if (!userId) {
    return res.status(401).json({ error: 'User ID required' });
  }
  
  const user = await UserModel.findById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Invalid user ID' });
  }
  
  await UserModel.updateLastActive(userId);
  req.user = user;
  next();
};

export const requireCircleMember = async (req: Request, res: Response, next: NextFunction) => {
  const { slug } = req.params;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ error: 'User required' });
  }
  
  const circle = await CircleModel.findBySlug(slug);
  if (!circle) {
    return res.status(404).json({ error: 'Circle not found' });
  }
  
  const isMember = await CircleModel.isMember(circle.id, userId);
  if (!isMember) {
    return res.status(403).json({ error: 'Not a member of this circle' });
  }
  
  req.circle = circle;
  next();
};

export const success = (res: Response, data: any, status = 200) => {
  res.status(status).json({ data });
};

export const error = (res: Response, message: string, status = 400) => {
  res.status(status).json({ error: message });
};
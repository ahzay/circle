import { z } from 'zod';

export const CreateCircleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(50),
});

export const CreateResourceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});

export const CreateClaimSchema = z.object({
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  is_recurring: z.boolean().default(false),
  recurring_pattern: z.enum(['weekly', 'monthly']).optional(),
  notes: z.string().max(500).optional(),
});

export const JoinCircleSchema = z.object({
  user_id: z.string().uuid(),
});

export const UpdateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
});
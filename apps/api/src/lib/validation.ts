import { z } from 'zod';

export const createHuntSchema = z.object({
  giftedName: z.string().min(1).max(100),
  welcomeMessage: z.string().max(500),
});

export const updateHuntSchema = z.object({
  giftedName: z.string().min(1).max(100).optional(),
  welcomeMessage: z.string().max(500).optional(),
});

export const createPostItSchema = z.object({
  position: z.number().int().min(0),
  title: z.string().max(100).optional(),
  prompt: z.string().min(1).max(1000),
  color: z.string().default('yellow'),
  type: z.enum(['riddle', 'photo', 'mixed', 'choice']),
  correctAnswer: z.string().max(200).optional(),
  requiresPhoto: z.boolean().default(false),
  allowsSkip: z.boolean().default(false),
  nextPostItId: z.string().uuid().optional(),
});

export const updatePostItSchema = createPostItSchema.partial();

export const createPostItOptionSchema = z.object({
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(50),
  nextPostItId: z.string().uuid(),
});

export const submitPostItSchema = z.object({
  textAnswer: z.string().optional(),
  selectedOptionValue: z.string().optional(),
  photoUrls: z.array(z.string().url()).optional(),
  wasSkipped: z.boolean().default(false),
  bypassCode: z.string().optional(), // For time-sensitive post-its
});

export const signUploadSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
});


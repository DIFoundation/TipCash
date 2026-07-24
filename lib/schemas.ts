import { z } from 'zod';

// Authentication Schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be at most 50 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const profileUpdateSchema = z.object({
  displayName: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().optional(),
});

// Zcash Schemas
export const zcashAddressSchema = z.string()
  .regex(/^[tz]/, 'Invalid Zcash address');

// Tips Schemas
export const sendTipSchema = z.object({
  recipientEmail: z.string().email().optional(),
  recipientUsername: z.string().min(1).optional(),
  recipientAddress: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['ZEC', 'USD']).default('ZEC'),
  memo: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
}).refine(
  (data) => data.recipientEmail || data.recipientUsername || data.recipientAddress,
  'Must provide recipient email, username, or Zcash address'
);

export const receiveLinksSchema = z.object({
  isAnonymous: z.boolean().default(false),
  usesRemaining: z.number().min(1).default(1),
  expiresAt: z.date().optional(),
});

// Search Schema
export const userSearchSchema = z.object({
  query: z.string().min(1).max(50),
  limit: z.number().min(1).max(50).default(20),
  offset: z.number().min(0).default(0),
});

// Export types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;
export type SendTip = z.infer<typeof sendTipSchema>;
export type ReceiveLink = z.infer<typeof receiveLinksSchema>;
export type UserSearch = z.infer<typeof userSearchSchema>;

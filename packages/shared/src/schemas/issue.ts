import { z } from 'zod';

import { geoPointSchema, timestampSchema } from './common.js';
import {
  issueCategorySchema,
  issueSeveritySchema,
  issueStatusSchema,
} from './enums.js';

export const issueLocationSchema = z.object({
  geohash: z.string().min(1),
  geopoint: geoPointSchema,
  address: z.string(),
});

export const issueMediaSchema = z.object({
  images: z.array(z.string().url()),
  videos: z.array(z.string().url()),
  thumbnail: z.string().url().optional(),
});

export const issueAiAnalysisSchema = z.object({
  category: issueCategorySchema,
  severity: issueSeveritySchema,
  confidence: z.number().min(0).max(1),
  suggestedTitle: z.string(),
  suggestedDescription: z.string(),
  suggestedTags: z.array(z.string()),
  duplicateProbability: z.number().min(0).max(1),
});

export const issueVerificationSchema = z.object({
  upvotes: z.number().int().nonnegative(),
  downvotes: z.number().int().nonnegative(),
  verifiedBy: z.array(z.string()),
  verifiedAt: timestampSchema.optional(),
});

export const issueResolutionSchema = z.object({
  resolvedAt: timestampSchema,
  resolvedBy: z.string().min(1),
  resolutionNotes: z.string(),
  beforeAfterPhotos: z.array(z.string().url()),
});

export const issueSchema = z.object({
  id: z.string().min(1),
  reporterId: z.string().min(1),
  status: issueStatusSchema,
  category: issueCategorySchema,
  severity: issueSeveritySchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  location: issueLocationSchema,
  media: issueMediaSchema,
  aiAnalysis: issueAiAnalysisSchema.optional(),
  verification: issueVerificationSchema,
  assignedTo: z.string().optional(),
  resolution: issueResolutionSchema.optional(),
  tags: z.array(z.string()),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createIssueSchema = issueSchema
  .omit({
    id: true,
    verification: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    verification: issueVerificationSchema.optional(),
  });

export const updateIssueSchema = createIssueSchema.partial();

export type IssueLocation = z.infer<typeof issueLocationSchema>;
export type IssueMedia = z.infer<typeof issueMediaSchema>;
export type IssueAiAnalysis = z.infer<typeof issueAiAnalysisSchema>;
export type IssueVerification = z.infer<typeof issueVerificationSchema>;
export type IssueResolution = z.infer<typeof issueResolutionSchema>;
export type Issue = z.infer<typeof issueSchema>;
export type CreateIssue = z.infer<typeof createIssueSchema>;
export type UpdateIssue = z.infer<typeof updateIssueSchema>;

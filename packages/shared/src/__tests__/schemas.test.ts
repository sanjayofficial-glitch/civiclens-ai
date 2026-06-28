import { describe, it, expect } from 'vitest';
import { z } from 'zod';

import { commentSchema, createCommentSchema } from '../schemas/comment.js';
import {
  timestampSchema,
  geoPointSchema,
  isFirestoreTimestamp,
  timestampToDate,
  dateToTimestamp,
  timestampToIso,
} from '../schemas/common.js';
import {
  userRoleSchema,
  issueStatusSchema,
  issueCategorySchema,
  issueSeveritySchema,
  voteTypeSchema,
  notificationTypeSchema,
  leaderboardPeriodSchema,
} from '../schemas/enums.js';
import { issueSchema } from '../schemas/issue.js';
import { leaderboardEntrySchema } from '../schemas/leaderboard.js';
import { notificationSchema } from '../schemas/notification.js';
import { userSchema, createUserSchema } from '../schemas/user.js';
import { voteSchema, createVoteSchema } from '../schemas/vote.js';

describe('Enums', () => {
  it('accepts valid user roles', () => {
    expect(userRoleSchema.parse('citizen')).toBe('citizen');
    expect(userRoleSchema.parse('moderator')).toBe('moderator');
    expect(userRoleSchema.parse('official')).toBe('official');
  });

  it('rejects invalid user roles', () => {
    expect(() => userRoleSchema.parse('admin')).toThrow(z.ZodError);
    expect(() => userRoleSchema.parse('')).toThrow(z.ZodError);
  });

  it('accepts valid issue statuses', () => {
    expect(issueStatusSchema.parse('reported')).toBe('reported');
    expect(issueStatusSchema.parse('resolved')).toBe('resolved');
    expect(issueStatusSchema.parse('rejected')).toBe('rejected');
  });

  it('rejects invalid issue status', () => {
    expect(() => issueStatusSchema.parse('deleted')).toThrow(z.ZodError);
  });

  it('accepts valid categories', () => {
    expect(issueCategorySchema.parse('pothole')).toBe('pothole');
    expect(issueCategorySchema.parse('streetlight')).toBe('streetlight');
    expect(issueCategorySchema.parse('water_leak')).toBe('water_leak');
    expect(issueCategorySchema.parse('garbage')).toBe('garbage');
    expect(issueCategorySchema.parse('graffiti')).toBe('graffiti');
    expect(issueCategorySchema.parse('sidewalk')).toBe('sidewalk');
    expect(issueCategorySchema.parse('other')).toBe('other');
  });

  it('rejects invalid category', () => {
    expect(() => issueCategorySchema.parse('noise')).toThrow(z.ZodError);
  });

  it('accepts valid severities', () => {
    expect(issueSeveritySchema.parse('low')).toBe('low');
    expect(issueSeveritySchema.parse('critical')).toBe('critical');
  });

  it('rejects invalid severity', () => {
    expect(() => issueSeveritySchema.parse('urgent')).toThrow(z.ZodError);
  });

  it('accepts valid vote types', () => {
    expect(voteTypeSchema.parse('upvote')).toBe('upvote');
    expect(voteTypeSchema.parse('downvote')).toBe('downvote');
  });

  it('rejects invalid vote type', () => {
    expect(() => voteTypeSchema.parse('invalid')).toThrow(z.ZodError);
  });

  it('accepts valid notification types', () => {
    expect(notificationTypeSchema.parse('vote')).toBe('vote');
    expect(notificationTypeSchema.parse('leaderboard')).toBe('leaderboard');
  });

  it('accepts valid leaderboard periods', () => {
    expect(leaderboardPeriodSchema.parse('weekly')).toBe('weekly');
    expect(leaderboardPeriodSchema.parse('all_time')).toBe('all_time');
  });
});

describe('Common — timestamp', () => {
  const iso = '2026-06-27T12:00:00.000Z';
  const date = new Date(iso);
  const ft = { seconds: 1719489600, nanoseconds: 0 };
  const ftLegacy = { _seconds: 1719489600, _nanoseconds: 0 };

  it('accepts ISO string', () => {
    expect(timestampSchema.parse(iso)).toBe(iso);
  });

  it('accepts Date object', () => {
    const result = timestampSchema.parse(date);
    expect(result).toBeInstanceOf(Date);
  });

  it('accepts FirestoreTimestamp', () => {
    expect(timestampSchema.parse(ft)).toEqual(ft);
  });

  it('accepts legacy FirestoreTimestamp', () => {
    expect(timestampSchema.parse(ftLegacy)).toEqual(ftLegacy);
  });

  it('rejects invalid timestamp', () => {
    expect(() => timestampSchema.parse('not-a-date')).toThrow(z.ZodError);
    expect(() => timestampSchema.parse(12345)).toThrow(z.ZodError);
    expect(() => timestampSchema.parse(null)).toThrow(z.ZodError);
  });
});

describe('Common — timestamp helpers', () => {
  it('isFirestoreTimestamp detects valid shapes', () => {
    expect(isFirestoreTimestamp({ seconds: 0, nanoseconds: 0 })).toBe(true);
    expect(isFirestoreTimestamp({ _seconds: 0, _nanoseconds: 0 })).toBe(true);
    expect(isFirestoreTimestamp(null)).toBe(false);
    expect(isFirestoreTimestamp('string')).toBe(false);
    expect(isFirestoreTimestamp({})).toBe(false);
  });

  it('timestampToDate converts Date', () => {
    const d = new Date('2026-01-01');
    expect(timestampToDate(d)).toBe(d);
  });

  it('timestampToDate converts ISO string', () => {
    const result = timestampToDate('2026-06-27T12:00:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2026-06-27T12:00:00.000Z');
  });

  it('timestampToDate converts FirestoreTimestamp', () => {
    const result = timestampToDate({ seconds: 1719489600, nanoseconds: 0 });
    expect(result.toISOString()).toBe('2024-06-27T12:00:00.000Z');
  });

  it('timestampToDate converts legacy FirestoreTimestamp', () => {
    const result = timestampToDate({ _seconds: 1719489600, _nanoseconds: 0 });
    expect(result.toISOString()).toBe('2024-06-27T12:00:00.000Z');
  });

  it('dateToTimestamp produces correct shape', () => {
    const d = new Date('2026-06-27T12:00:00.000Z');
    const result = dateToTimestamp(d);
    expect(result.seconds).toBe(1782561600);
    expect(result.nanoseconds).toBe(0);
  });

  it('timestampToIso returns ISO string', () => {
    const result = timestampToIso({ seconds: 1719489600, nanoseconds: 0 });
    expect(result).toBe('2024-06-27T12:00:00.000Z');
  });
});

describe('Common — geoPoint', () => {
  it('accepts valid coordinates', () => {
    expect(
      geoPointSchema.parse({ latitude: 40.7128, longitude: -74.006 }),
    ).toEqual({ latitude: 40.7128, longitude: -74.006 });
  });

  it('rejects out-of-range latitude', () => {
    expect(() => geoPointSchema.parse({ latitude: 100, longitude: 0 })).toThrow(
      z.ZodError,
    );
  });

  it('rejects out-of-range longitude', () => {
    expect(() => geoPointSchema.parse({ latitude: 0, longitude: 200 })).toThrow(
      z.ZodError,
    );
  });
});

describe('User schema', () => {
  const validUser = {
    uid: 'user_abc',
    displayName: 'Jane Doe',
    email: 'jane@example.com',
    photoURL: null,
    phoneNumber: null,
    role: 'citizen' as const,
    reputation: 50,
    issuesReported: 3,
    issuesVerified: 1,
    badges: ['first_report'],
    streakDays: 5,
    lastActive: '2026-06-27T12:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-06-27T12:00:00.000Z',
  };

  it('parses a valid user object', () => {
    const result = userSchema.parse(validUser);
    expect(result.uid).toBe('user_abc');
    expect(result.fcmTokens).toEqual([]);
  });

  it('defaults issuesReported, issuesVerified, and fcmTokens', () => {
    const minimal = {
      uid: 'u1',
      displayName: 'Test',
      email: 't@t.com',
      photoURL: null,
      phoneNumber: null,
      role: 'citizen' as const,
      reputation: 0,
      badges: [],
      streakDays: 0,
      lastActive: '2026-06-27T12:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-06-27T12:00:00.000Z',
    };
    const result = userSchema.parse(minimal);
    expect(result.issuesReported).toBe(0);
    expect(result.issuesVerified).toBe(0);
    expect(result.fcmTokens).toEqual([]);
  });

  it('rejects missing uid', () => {
    expect(() => userSchema.parse({ ...validUser, uid: undefined })).toThrow(
      z.ZodError,
    );
  });

  it('rejects invalid email', () => {
    expect(() =>
      userSchema.parse({ ...validUser, email: 'not-an-email' }),
    ).toThrow(z.ZodError);
  });

  it('rejects invalid role', () => {
    expect(() => userSchema.parse({ ...validUser, role: 'admin' })).toThrow(
      z.ZodError,
    );
  });

  it('accepts optional fcmTokens when provided', () => {
    const result = userSchema.parse({
      ...validUser,
      fcmTokens: ['tok1', 'tok2'],
    });
    expect(result.fcmTokens).toEqual(['tok1', 'tok2']);
  });
});

describe('Issue schema', () => {
  const base = {
    id: 'issue_001',
    reporterId: 'user_abc',
    status: 'reported' as const,
    category: 'pothole' as const,
    severity: 'high' as const,
    title: 'Large pothole on Main St',
    description: 'A deep pothole near the intersection.',
    location: {
      geohash: 'dr5reg',
      geopoint: { latitude: 40.7128, longitude: -74.006 },
      address: '123 Main St, NY',
    },
    media: {
      images: ['https://example.com/photo.jpg'],
      videos: [],
    },
    verification: {
      upvotes: 0,
      downvotes: 0,
      verifiedBy: [],
    },
    tags: ['pothole', 'road'],
    createdAt: '2026-06-27T12:00:00.000Z',
    updatedAt: '2026-06-27T12:00:00.000Z',
  };

  it('parses a valid issue', () => {
    const result = issueSchema.parse(base);
    expect(result.id).toBe('issue_001');
    expect(result.status).toBe('reported');
  });

  it('accepts optional aiAnalysis', () => {
    const withAi = {
      ...base,
      aiAnalysis: {
        category: 'pothole',
        severity: 'high',
        confidence: 0.95,
        suggestedTitle: 'Pothole',
        suggestedDescription: 'A pothole',
        suggestedTags: ['road'],
        duplicateProbability: 0.1,
      },
    };
    expect(() => issueSchema.parse(withAi)).not.toThrow();
  });

  it('rejects missing title', () => {
    expect(() => issueSchema.parse({ ...base, title: '' })).toThrow(z.ZodError);
  });

  it('rejects invalid severity', () => {
    expect(() => issueSchema.parse({ ...base, severity: 'extreme' })).toThrow(
      z.ZodError,
    );
  });

  it('rejects negative verification counts', () => {
    expect(() =>
      issueSchema.parse({
        ...base,
        verification: { upvotes: -1, downvotes: 0, verifiedBy: [] },
      }),
    ).toThrow(z.ZodError);
  });
});

describe('Vote schema', () => {
  it('parses a valid vote', () => {
    const result = voteSchema.parse({
      issueId: 'issue_001',
      userId: 'user_abc',
      type: 'upvote',
      createdAt: '2026-06-27T12:00:00.000Z',
    });
    expect(result.type).toBe('upvote');
  });

  it('rejects invalid vote type', () => {
    expect(() =>
      voteSchema.parse({
        issueId: 'i1',
        userId: 'u1',
        type: 'invalid',
        createdAt: '2026-06-27T12:00:00.000Z',
      }),
    ).toThrow(z.ZodError);
  });
});

describe('Comment schema', () => {
  it('parses a valid comment', () => {
    const result = commentSchema.parse({
      issueId: 'issue_001',
      userId: 'user_abc',
      text: 'I agree, this needs fixing.',
      createdAt: '2026-06-27T12:00:00.000Z',
    });
    expect(result.text).toBe('I agree, this needs fixing.');
  });

  it('rejects empty text', () => {
    expect(() =>
      commentSchema.parse({
        issueId: 'i1',
        userId: 'u1',
        text: '',
        createdAt: '2026-06-27T12:00:00.000Z',
      }),
    ).toThrow(z.ZodError);
  });

  it('rejects text exceeding 2000 chars', () => {
    expect(() =>
      commentSchema.parse({
        issueId: 'i1',
        userId: 'u1',
        text: 'a'.repeat(2001),
        createdAt: '2026-06-27T12:00:00.000Z',
      }),
    ).toThrow(z.ZodError);
  });
});

describe('Notification schema', () => {
  it('parses a valid notification', () => {
    const result = notificationSchema.parse({
      userId: 'user_abc',
      type: 'vote',
      title: 'New vote',
      body: 'Someone voted on your issue',
      data: { issueId: 'issue_001' },
      read: false,
      createdAt: '2026-06-27T12:00:00.000Z',
    });
    expect(result.read).toBe(false);
  });
});

describe('Leaderboard entry schema', () => {
  it('parses a valid entry', () => {
    const result = leaderboardEntrySchema.parse({
      userId: 'user_abc',
      displayName: 'Jane',
      photoURL: null,
      score: 150,
      issuesReported: 10,
      issuesVerified: 3,
      period: 'weekly',
    });
    expect(result.score).toBe(150);
  });

  it('rejects negative score', () => {
    expect(() =>
      leaderboardEntrySchema.parse({
        userId: 'u1',
        displayName: 'T',
        photoURL: null,
        score: -1,
        issuesReported: 0,
        issuesVerified: 0,
        period: 'weekly',
      }),
    ).toThrow(z.ZodError);
  });
});

describe('Create schemas (omit timestamps)', () => {
  it('createVoteSchema omits createdAt', () => {
    const result = createVoteSchema.parse({
      issueId: 'i1',
      userId: 'u1',
      type: 'downvote',
    });
    expect(result.type).toBe('downvote');
    expect('createdAt' in result).toBe(false);
  });

  it('createUserSchema omits timestamps', () => {
    const result = createUserSchema.parse({
      uid: 'u1',
      displayName: 'Test',
      email: 't@t.com',
      photoURL: null,
      phoneNumber: null,
      role: 'citizen',
      reputation: 0,
      issuesReported: 0,
      issuesVerified: 0,
      badges: [],
      streakDays: 0,
      lastActive: '2026-06-27T12:00:00.000Z',
    });
    expect('createdAt' in result).toBe(false);
    expect('updatedAt' in result).toBe(false);
  });

  it('createCommentSchema omits createdAt', () => {
    const result = createCommentSchema.parse({
      issueId: 'i1',
      userId: 'u1',
      text: 'hello',
    });
    expect(result.text).toBe('hello');
  });
});

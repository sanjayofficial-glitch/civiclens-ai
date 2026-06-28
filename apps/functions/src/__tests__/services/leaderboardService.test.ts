import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    collection: vi.fn(),
    batch: vi.fn(),
  }
}));

vi.mock('../../lib/firebase', () => ({
  db: mockDb,
  FieldValue: {
    increment: vi.fn((n) => n),
    serverTimestamp: vi.fn(() => 'server_time'),
  },
}));

vi.mock('../../config', () => ({
  DEFAULT_REPUTATION: {
    ISSUE_REPORTED: 5,
    ISSUE_VERIFIED: 8,
    COMMENT_CREATED: 1,
    UPVOTE_CAST: 2,
    DOWNVOTE_CAST: -1,
    ISSUE_RESOLVED: 15,
  },
}));

vi.mock('../../repositories/leaderboardRepository', () => {
  return {
    LeaderboardRepository: vi.fn(function() {
      return { doc: vi.fn().mockReturnValue({ id: 'doc-id' }) };
    })
  };
});

import { rebuildLeaderboard } from '../../services/leaderboardService';

describe('leaderboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rebuildLeaderboard', () => {
    it('calculates period score correctly', async () => {
      const mockSet = vi.fn();
      mockDb.batch.mockReturnValue({
        set: mockSet,
        commit: vi.fn(),
      });

      const today = new Date();
      const mockUsers = [{ id: 'user-1', data: () => ({ displayName: 'Test User', reputation: 100 }) }];
      
      const mockIssues = [
        { data: () => ({ reporterId: 'user-1', status: 'resolved', createdAt: { toDate: () => today } }) }
      ];
      
      const mockVotes = [
        { data: () => ({ userId: 'user-1', type: 'upvote', createdAt: { toDate: () => today } }) }
      ];

      mockDb.collection.mockImplementation((name: string) => {
        if (name === 'users') {
          return { get: vi.fn().mockResolvedValue({ forEach: (cb: any) => mockUsers.forEach(cb) }) };
        }
        if (name === 'issues') {
          return { get: vi.fn().mockResolvedValue({ forEach: (cb: any) => mockIssues.forEach(cb) }) };
        }
        if (name === 'votes') {
          return { 
            where: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ forEach: (cb: any) => mockVotes.forEach(cb) })
            })
          };
        }
        if (name === 'comments') {
          return { 
            where: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ forEach: (cb: any) => [].forEach(cb) })
            })
          };
        }
        if (name === 'leaderboard') {
          return { 
            where: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({ forEach: (cb: any) => [].forEach(cb) })
            })
          };
        }
        return { get: vi.fn().mockResolvedValue({ forEach: vi.fn() }) };
      });

      await rebuildLeaderboard('weekly');
      
      // Issue reported (+5), Issue resolved (+15), Upvote cast (+2) = 22
      expect(mockSet).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          userId: 'user-1',
          score: 22,
          issuesReported: 1,
          issuesVerified: 0,
        }),
        { merge: true }
      );
    });
  });
});

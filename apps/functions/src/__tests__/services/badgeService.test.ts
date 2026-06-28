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
    arrayUnion: vi.fn((...args) => args),
    serverTimestamp: vi.fn(() => 'server_time'),
  },
}));

vi.mock('../../services/notificationService', () => ({
  createNotification: vi.fn(),
}));

import { checkAndAwardBadges, updateActivityStreak } from '../../services/badgeService';

describe('badgeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateActivityStreak', () => {
    it('increments streak if active next day', async () => {
      const mockSet = vi.fn();
      const mockUpdate = vi.fn();
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      mockDb.collection.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              streakDays: 5,
              lastActive: { toDate: () => yesterday },
            }),
          }),
          set: mockSet,
          update: mockUpdate,
        }),
      });

      await updateActivityStreak('user-1');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 6 })
      );
    });

    it('resets streak if inactive for multiple days', async () => {
      const mockUpdate = vi.fn();
      
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 5);

      mockDb.collection.mockReturnValue({
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({
            exists: true,
            data: () => ({
              streakDays: 10,
              lastActive: { toDate: () => lastWeek },
            }),
          }),
          update: mockUpdate,
        }),
      });

      await updateActivityStreak('user-1');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ streakDays: 1 })
      );
    });
  });

  describe('checkAndAwardBadges', () => {
    it('awards report-5 badge if user has 5 reports', async () => {
      const mockSet = vi.fn();
      const mockUpdate = vi.fn();
      const mockCollection = vi.fn();

      mockCollection.mockImplementation((name: string) => {
        if (name === 'users') {
          return {
            doc: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                  issuesReported: 5,
                  badges: ['report-1'],
                }),
              }),
              set: mockSet,
              update: mockUpdate,
            }),
          };
        }
        if (name === 'issues') {
          return {
            where: vi.fn().mockReturnValue({
              get: vi.fn().mockResolvedValue({
                forEach: vi.fn(),
              }),
            }),
          };
        }
        return {};
      });

      mockDb.collection = mockCollection;
      
      // Need mock badge batch commit? checkAndAwardBadges calls awardBadge which uses userRef.set
      await checkAndAwardBadges('user-1');
      
      expect(mockSet).toHaveBeenCalledWith(
        expect.objectContaining({
          badges: expect.arrayContaining(['report-5']),
        }),
        { merge: true }
      );
    });
  });
});

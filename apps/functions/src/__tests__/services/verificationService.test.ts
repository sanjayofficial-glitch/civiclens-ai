import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockRunTransaction, mockDoc, mockCollection, mockDb, mockServerTimestamp } = vi.hoisted(() => {
  const mockRunTransaction = vi.fn();
  const mockDoc = vi.fn();
  const mockCollection = vi.fn(() => ({ doc: mockDoc }));
  const mockDb = { collection: mockCollection, runTransaction: mockRunTransaction };
  const mockServerTimestamp = vi.fn(() => ({ _method: 'serverTimestamp' }));
  return { mockRunTransaction, mockDoc, mockCollection, mockDb, mockServerTimestamp };
});

vi.mock('../../lib/firebase', () => ({
  db: mockDb,
  FieldValue: { serverTimestamp: mockServerTimestamp },
}));

import { registerVote } from '../../services/verificationService';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('registerVote', () => {
  const input = { issueId: 'issue_001', userId: 'user_abc', type: 'upvote' as const };

  it('creates a vote and updates verification when issue exists', async () => {
    const issueSnap = { exists: true, data: () => ({ verification: { upvotes: 2, downvotes: 1, verifiedBy: ['user_x'] } }) };
    const voteSnap = { exists: false };

    const tx = {
      get: vi.fn()
        .mockResolvedValueOnce(issueSnap)
        .mockResolvedValueOnce(voteSnap),
      set: vi.fn(),
    };

    mockRunTransaction.mockImplementationOnce(async (cb: (t: typeof tx) => Promise<void>) => {
      await cb(tx);
    });

    await registerVote(input);

    expect(mockRunTransaction).toHaveBeenCalledOnce();
    expect(tx.set).toHaveBeenCalledTimes(2);

    expect(tx.set).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({ issueId: 'issue_001', userId: 'user_abc', type: 'upvote' }),
    );

    expect(tx.set).toHaveBeenCalledWith(
      expect.objectContaining({}),
      {
        verification: {
          upvotes: 3,
          downvotes: 1,
          verifiedBy: ['user_x', 'user_abc'],
          verifiedAt: { _method: 'serverTimestamp' },
        },
        updatedAt: { _method: 'serverTimestamp' },
      },
      { merge: true },
    );
  });

  it('initializes verification counts for issues with missing verification', async () => {
    const issueSnap = { exists: true, data: () => ({}) };
    const voteSnap = { exists: false };

    const tx = {
      get: vi.fn()
        .mockResolvedValueOnce(issueSnap)
        .mockResolvedValueOnce(voteSnap),
      set: vi.fn(),
    };

    mockRunTransaction.mockImplementationOnce(async (cb: (t: typeof tx) => Promise<void>) => {
      await cb(tx);
    });

    await registerVote(input);

    expect(tx.set).toHaveBeenCalledWith(
      expect.objectContaining({}),
      expect.objectContaining({
        verification: {
          upvotes: 1,
          downvotes: 0,
          verifiedBy: ['user_abc'],
          verifiedAt: expect.any(Object),
        },
      }),
      { merge: true },
    );
  });

  it('throws when issue does not exist', async () => {
    const issueSnap = { exists: false };
    const voteSnap = { exists: false };
    const tx = {
      get: vi.fn()
        .mockResolvedValueOnce(issueSnap)
        .mockResolvedValueOnce(voteSnap),
      set: vi.fn(),
    };

    mockRunTransaction.mockImplementationOnce(async (cb: (t: typeof tx) => Promise<void>) => {
      await expect(cb(tx)).rejects.toThrow('Issue not found.');
    });

    await expect(registerVote(input)).rejects.toThrow('Issue not found.');
  });

  it('throws on duplicate vote', async () => {
    const issueSnap = { exists: true, data: () => ({}) };
    const voteSnap = { exists: true };

    const tx = {
      get: vi.fn()
        .mockResolvedValueOnce(issueSnap)
        .mockResolvedValueOnce(voteSnap),
      set: vi.fn(),
    };

    mockRunTransaction.mockImplementationOnce(async (cb: (t: typeof tx) => Promise<void>) => {
      await expect(cb(tx)).rejects.toThrow('Duplicate vote.');
    });

    await expect(registerVote(input)).rejects.toThrow('Duplicate vote.');
  });
});

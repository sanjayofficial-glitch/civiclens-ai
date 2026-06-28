import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGet, mockLimit, mockWhere, mockCollection } = vi.hoisted(() => {
  const mockGet = vi.fn();
  const mockLimit = vi.fn(() => ({ get: mockGet }));
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockCollection = vi.fn(() => ({ where: mockWhere }));
  return { mockGet, mockLimit, mockWhere, mockCollection };
});

vi.mock('../../lib/firebase', () => ({
  db: { collection: mockCollection },
}));

import { detectDuplicateIssue } from '../../services/duplicateDetectionService';

function makeDocSnap(id: string, data: Record<string, unknown>) {
  return { id, data: () => data };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('detectDuplicateIssue', () => {
  const input = {
    title: 'Large pothole on Main St',
    description: 'A deep pothole near the intersection.',
    category: 'pothole',
    geohash: 'dr5reg',
  };

  it('returns null when no issues exist', async () => {
    mockGet.mockResolvedValueOnce({ forEach: vi.fn() });
    const result = await detectDuplicateIssue(input);
    expect(result).toBeNull();
  });

  it('returns null when no matches exceed threshold', async () => {
    const docs = [
      makeDocSnap('i1', {
        title: 'Unrelated noise complaint',
        description: 'Loud music',
        location: { geohash: 'xxxxx' },
      }),
    ];
    mockGet.mockResolvedValueOnce({
      forEach: (cb: (d: (typeof docs)[0]) => void) => {
        docs.forEach(cb);
      },
    });
    const result = await detectDuplicateIssue(input);
    expect(result).toBeNull();
  });

  it('returns best match when score >= 0.45', async () => {
    const docs = [
      makeDocSnap('i1', {
        title: 'Large pothole on Main St',
        description: 'A deep pothole near the intersection.',
        location: { geohash: 'dr5reg' },
      }),
    ];
    mockGet.mockResolvedValueOnce({
      forEach: (cb: (d: (typeof docs)[0]) => void) => {
        docs.forEach(cb);
      },
    });
    const result = await detectDuplicateIssue(input);
    expect(result).not.toBeNull();
    expect(result.issueId).toBe('i1');
    expect(result.score).toBeGreaterThanOrEqual(0.45);
  });

  it('queries collection by category with limit 25', async () => {
    mockGet.mockResolvedValueOnce({ forEach: vi.fn() });
    await detectDuplicateIssue(input);
    expect(mockCollection).toHaveBeenCalledWith('issues');
    expect(mockWhere).toHaveBeenCalledWith('category', '==', 'pothole');
    expect(mockLimit).toHaveBeenCalledWith(25);
  });

  it('sorts results by score descending and returns highest', async () => {
    const docs = [
      makeDocSnap('low', {
        title: 'Pothole on Main St',
        description: 'Pothole near intersection.',
        location: { geohash: 'dr5reg' },
      }),
      makeDocSnap('high', {
        title: 'Large pothole on Main St',
        description: 'A deep pothole near the intersection. Very dangerous.',
        location: { geohash: 'dr5reg' },
      }),
    ];
    mockGet.mockResolvedValueOnce({
      forEach: (cb: (d: (typeof docs)[0]) => void) => {
        docs.forEach(cb);
      },
    });
    const result = await detectDuplicateIssue(input);
    expect(result).not.toBeNull();
    expect(result.issueId).toBe('high');
  });

  it('returns null for empty title/description (both blank)', async () => {
    const docs = [
      makeDocSnap('i1', {
        title: '',
        description: '',
        location: { geohash: 'dr5regxx' },
      }),
    ];
    mockGet.mockResolvedValueOnce({
      forEach: (cb: (d: (typeof docs)[0]) => void) => {
        docs.forEach(cb);
      },
    });
    const result = await detectDuplicateIssue({
      ...input,
      title: '',
      description: '',
    });
    expect(result).toBeNull();
  });
});

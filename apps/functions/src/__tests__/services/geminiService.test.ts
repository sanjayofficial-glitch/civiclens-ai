import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../config', () => ({
  GEMINI_MAX_RETRIES: 1,
  GEMINI_MODEL: 'gemini-1.5-flash',
  GEMINI_TIMEOUT_MS: 5000,
  DEFAULT_REPUTATION: { ISSUE_REPORTED: 5, ISSUE_VERIFIED: 8, COMMENT_CREATED: 1, UPVOTE_CAST: 2, DOWNVOTE_CAST: -1, ISSUE_RESOLVED: 15 },
}));

const { mockFail } = vi.hoisted(() => ({ mockFail: vi.fn() }));
vi.mock('../../lib/errors', () => ({
  fail: mockFail,
}));

const { mockFetchFileBuffer } = vi.hoisted(() => ({ mockFetchFileBuffer: vi.fn() }));
vi.mock('../../services/storageService', () => ({
  fetchFileBuffer: mockFetchFileBuffer,
}));

import { analyzeIssueMedia } from '../../services/geminiService';

beforeEach(() => {
  vi.clearAllMocks();
  mockFail.mockImplementation(() => { throw new Error('GEMINI_API_KEY is not configured.'); });
  mockFetchFileBuffer.mockRejectedValue(new Error('fetch failed'));
});

function mockGeminiResponse(json: unknown) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      candidates: [{ content: { parts: [{ text: JSON.stringify(json) }] } }],
    }),
  });
}

describe('analyzeIssueMedia', () => {
  const input = {
    title: 'Large pothole on Main St',
    description: 'A deep pothole near the intersection.',
    imageUrls: [],
  };

  it('returns parsed result from Gemini API on success', async () => {
    const geminiResult = {
      category: 'pothole',
      severity: 'high',
      confidence: 0.95,
      title: 'Pothole on Main St',
      description: 'A deep pothole near the intersection.',
      suggestedTags: ['pothole', 'road'],
      duplicateScore: 0.1,
      safetyConcern: false,
    };

    global.fetch = mockGeminiResponse(geminiResult);

    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia(input);
    expect(result.category).toBe('pothole');
    expect(result.severity).toBe('high');
    expect(result.confidence).toBe(0.95);
    expect(result.safetyConcern).toBe(false);
  });

  it('falls back to keyword analysis when Gemini API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia(input);
    expect(result.category).toBe('pothole');
    expect(result.severity).toBe('low');
    expect(result.confidence).toBe(0.35);
  });

  it('falls back when Gemini returns malformed JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: 'not-json' }] } }],
      }),
    });
    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia(input);
    expect(result).toBeDefined();
    expect(result.category).toBe('pothole');
  });

  it('falls back when Gemini response is missing required fields', async () => {
    global.fetch = mockGeminiResponse({ confidence: 'not-a-number' });
    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia(input);
    expect(result.category).toBe('pothole');
  });

  it('detects safety concern keywords in fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia({
      ...input,
      description: 'Fire hazard on Main St',
    });
    expect(result.safetyConcern).toBe(true);
  });

  it('classifies categories correctly in fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    process.env.GEMINI_API_KEY = 'test-key';

    const streetlight = await analyzeIssueMedia({ ...input, title: 'Broken streetlight', description: 'The light is not working' });
    expect(streetlight.category).toBe('streetlight');

    const water = await analyzeIssueMedia({ ...input, title: 'Water leak', description: 'Pipe burst on main road' });
    expect(water.category).toBe('water_leak');

    const garbage = await analyzeIssueMedia({ ...input, title: 'Trash pile', description: 'Garbage collection missed' });
    expect(garbage.category).toBe('garbage');

    const graffiti = await analyzeIssueMedia({ ...input, title: 'Graffiti on wall', description: 'Vandalism on the building' });
    expect(graffiti.category).toBe('graffiti');

    const sidewalk = await analyzeIssueMedia({ ...input, title: 'Broken sidewalk', description: 'Cracked pavement' });
    expect(sidewalk.category).toBe('sidewalk');

    const other = await analyzeIssueMedia({ ...input, title: 'Unusual smell', description: 'Strange odor in the park' });
    expect(other.category).toBe('other');
  });

  it('classifies severity correctly in fallback', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    process.env.GEMINI_API_KEY = 'test-key';

    const critical = await analyzeIssueMedia({ ...input, description: 'Critical danger zone' });
    expect(critical.severity).toBe('critical');

    const blocked = await analyzeIssueMedia({ ...input, description: 'Blocked road' });
    expect(blocked.severity).toBe('high');

    const medium = await analyzeIssueMedia({ ...input, description: 'Medium priority issue' });
    expect(medium.severity).toBe('medium');

    const low = await analyzeIssueMedia({ ...input, description: 'Minor cosmetic issue' });
    expect(low.severity).toBe('low');
  });

  it('handles stripMarkdownJson (backtick wrapping)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        candidates: [{ content: { parts: [{ text: '```json\n{"category":"pothole","severity":"medium","confidence":0.8,"title":"Test","description":"Test","suggestedTags":["road"],"duplicateScore":0,"safetyConcern":false}\n```' }] } }],
      }),
    });
    process.env.GEMINI_API_KEY = 'test-key';

    const result = await analyzeIssueMedia(input);
    expect(result.category).toBe('pothole');
    expect(result.confidence).toBe(0.8);
  });
});

/**
 * Bug Condition Exploration Tests — Task 1
 *
 * These tests are EXPECTED TO FAIL on unfixed code.
 * Failure proves the bugs exist. Do NOT fix the code to make these pass.
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 2.1, 3.1, 5.2
 */

import type * as ErrorsModule from '../lib/errors';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module mocks — must be declared before any imports that transitively touch them
// ---------------------------------------------------------------------------

vi.mock('../config', () => ({
  GEMINI_MAX_RETRIES: 0,
  GEMINI_MODEL: 'gemini-1.5-flash',
  GEMINI_TIMEOUT_MS: 5000,
  DEFAULT_REPUTATION: {
    ISSUE_REPORTED: 5,
    ISSUE_VERIFIED: 8,
    COMMENT_CREATED: 1,
    UPVOTE_CAST: 2,
    DOWNVOTE_CAST: -1,
    ISSUE_RESOLVED: 15,
  },
}));

// Real fail() so HttpsError propagates exactly as production does
vi.mock('../lib/errors', async () => {
  const actual = await vi.importActual<typeof ErrorsModule>('../lib/errors');
  return actual;
});

// Mock fetchFileBuffer — simulates unauthenticated fetch returning 403
const { mockFetchFileBuffer } = vi.hoisted(() => ({
  mockFetchFileBuffer: vi.fn(),
}));
vi.mock('../services/storageService', () => ({
  fetchFileBuffer: mockFetchFileBuffer,
  buildUploadPath: vi.fn(),
  validateUpload: vi.fn(),
  getSignedDownloadUrl: vi.fn(),
}));

// Firestore mock — for Test 5 (analytics/global)
// Must use vi.hoisted() to avoid "Cannot access before initialization" with vi.mock hoisting
const { mockDocGet, mockDocSet, mockCollection } = vi.hoisted(() => ({
  mockDocGet: vi.fn(),
  mockDocSet: vi.fn(),
  mockCollection: vi.fn(),
}));

vi.mock('../lib/firebase', () => {
  const FieldValue = {
    serverTimestamp: () => ({ _type: 'serverTimestamp' }),
    increment: (n: number) => ({ _type: 'increment', operand: n }),
  };

  const db = {
    collection: mockCollection,
  };

  return { db, FieldValue, bucket: {}, auth: {}, storage: {} };
});

import { recordAnalyticsEvent } from '../services/analyticsService';
import { analyzeIssueMedia } from '../services/geminiService';

// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Default: fetchFileBuffer fails (simulates unauthenticated fetch against Storage)
  mockFetchFileBuffer.mockRejectedValue(new Error('HTTP 403 Forbidden'));

  // Default Firestore chain: collection('analytics').doc(id).set(...)
  mockCollection.mockReturnValue({
    doc: vi.fn().mockReturnValue({
      get: mockDocGet,
      set: mockDocSet,
    }),
  });
  mockDocGet.mockResolvedValue({ exists: false, data: () => undefined });
  mockDocSet.mockResolvedValue(undefined);
});

afterEach(() => {
  // Restore GEMINI_API_KEY between tests
  delete process.env.GEMINI_API_KEY;
});

// ===========================================================================
// Test 1A — AI key guard
// Bug: The callable analyzeIssueImage.ts always returns { status: 'success', analysis }
//      even when analyzeIssueMedia internally fell back due to missing API key.
//      There is no try/catch at the callable boundary to return { status: 'fallback' }.
//
// From the design doc: "The fix wraps the entire analyzeIssueMedia call in a
//  try/catch at the callable boundary."
//
// Specifically: when GEMINI_API_KEY is absent, callGemini() throws HttpsError.
//   - analyzeIssueMedia catches it in the retry loop and returns fallbackAnalysis
//   - But the callable returns { status: 'success', analysis } regardless
//   - Expected after fix: { status: 'fallback', analysis: { usedFallback: true, ... } }
//   - Current (unfixed): { status: 'success', analysis } — no usedFallback flag
//
// Validates: Requirement 1.1
// ===========================================================================
describe('Test 1A — AI key guard (Bug Condition)', () => {
  it('when GEMINI_API_KEY is absent, the result should have usedFallback:true', async () => {
    // Ensure key is absent
    delete process.env.GEMINI_API_KEY;

    const result = (await analyzeIssueMedia({
      title: 'Pothole on Main Street',
      description: 'Deep pothole causing tyre damage',
      imageUrls: [],
    })) as unknown as Record<string, unknown>;

    // EXPECTED AFTER FIX: usedFallback is true on the returned analysis
    // CURRENT (UNFIXED): fallbackAnalysis() does not set usedFallback:true — key is missing
    expect(
      result.usedFallback,
      'When GEMINI_API_KEY is absent, analysis should have usedFallback:true to signal caller. ' +
        `Got: ${JSON.stringify(result)}`,
    ).toBe(true); // FAILS on unfixed code (fallbackAnalysis returns no usedFallback field)
  });
});

// ===========================================================================
// Test 1B — Image download via unauthenticated fetch
// Bug: fetchFileBuffer issues an unauthenticated HTTP GET; Storage rejects it
//      with 403. imageParts stays empty → Gemini analyzes text only.
// Expected after fix: imageParts.length > 0 (Admin SDK download succeeds)
// Current (unfixed): imageParts is empty — we detect this via confidence ≤ 0.55
//                    (fallbackAnalysis confidence for no-image path is 0.35)
//
// Validates: Requirement 1.2
// ===========================================================================
describe('Test 1B — Image download (Bug Condition)', () => {
  it('analyzeIssueMedia with a Storage URL should have imageParts > 0 (Admin SDK path)', async () => {
    process.env.GEMINI_API_KEY = 'test-key-present';

    // fetchFileBuffer throws 403 — simulates unauthenticated fetch failing
    mockFetchFileBuffer.mockRejectedValue(new Error('HTTP 403 Forbidden'));

    // Mock Gemini to return a valid response (so we can distinguish image vs text-only)
    // Gemini is called with imageParts — if imageParts is empty the fetch mock never matters
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      category: 'pothole',
                      severity: 'high',
                      confidence: 0.9,
                      title: 'Pothole',
                      description: 'Deep pothole',
                      suggestedTags: ['pothole'],
                      duplicateScore: 0.1,
                      safetyConcern: false,
                    }),
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await analyzeIssueMedia({
      title: 'Pothole',
      description: 'Deep pothole near school',
      imageUrls: [
        'https://firebasestorage.googleapis.com/v0/b/test/o/issues%2Fphoto.jpg?alt=media&token=abc',
      ],
    });

    // EXPECTED AFTER FIX: confidence >= 0.6 (Gemini received the image inline data)
    // CURRENT (UNFIXED): fetchFileBuffer fails → imageParts empty → Gemini gets text only
    //   → either fallback (confidence 0.35) or Gemini text-only result with potentially any confidence
    //   The key symptom: fetchFileBuffer was called but threw — imageParts is []
    //   We can verify this indirectly: if Gemini was called with an image part, we'd expect
    //   the REAL Admin SDK path to have been used. Since it wasn't, the test fails because
    //   fetchFileBuffer is the wrong method to use.
    //
    // Direct assertion: fetchFileBuffer should NOT be called on the fixed code
    // (Admin SDK bucket.file().download() replaces it). On unfixed code it IS called.
    expect(mockFetchFileBuffer).not.toHaveBeenCalled(); // FAILS on unfixed code
    expect(result.confidence).toBeGreaterThanOrEqual(0.6); // FAILS on unfixed (text-only = 0.35 or low)
  });
});

// ===========================================================================
// Test 1C — Field names: suggestedTitle / suggestedDescription
// Bug: Gemini prompt asks for `title`/`description`, but IssueAnalysisResult
//      and the callable client both expect `suggestedTitle`/`suggestedDescription`.
//      The result object from analyzeIssueMedia has `title` and `description` keys,
//      not `suggestedTitle`/`suggestedDescription`.
// Expected after fix: result has suggestedTitle and suggestedDescription
// Current (unfixed): result has title and description — test FAILS
//
// Validates: Requirement 1.3
// ===========================================================================
describe('Test 1C — Field names (Bug Condition)', () => {
  it('analyzeIssueMedia result should have suggestedTitle and suggestedDescription keys', async () => {
    process.env.GEMINI_API_KEY = 'test-key-present';

    // fetchFileBuffer fails (irrelevant here — no imageUrls)
    mockFetchFileBuffer.mockRejectedValue(new Error('no fetch'));

    // Gemini returns title/description (current unfixed field names in the prompt)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      category: 'pothole',
                      severity: 'medium',
                      confidence: 0.85,
                      title: 'Pothole on Baker Street',
                      description: 'Large pothole blocking traffic',
                      suggestedTags: ['pothole', 'road'],
                      duplicateScore: 0.05,
                      safetyConcern: false,
                    }),
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = (await analyzeIssueMedia({
      title: 'Pothole',
      description: 'Pothole on Baker Street',
      imageUrls: [],
    })) as unknown as Record<string, unknown>;

    // EXPECTED AFTER FIX: suggestedTitle and suggestedDescription are present
    // CURRENT (UNFIXED): result has 'title' and 'description' keys, NOT 'suggestedTitle'/'suggestedDescription'
    expect(result, 'result should have suggestedTitle key').toHaveProperty(
      'suggestedTitle',
    );
    expect(
      result,
      'result should have suggestedDescription key',
    ).toHaveProperty('suggestedDescription');
    expect(
      result.suggestedTitle,
      'suggestedTitle should be a non-empty string',
    ).toBeTruthy();
    expect(
      result.suggestedDescription,
      'suggestedDescription should be a non-empty string',
    ).toBeTruthy();

    // Inverse: the OLD wrong keys should NOT be present (they would be on unfixed code)
    // This makes the failure message explicit
    expect(result).not.toHaveProperty('title'); // FAILS on unfixed (has 'title')
    expect(result).not.toHaveProperty('description'); // FAILS on unfixed (has 'description')
  });
});

// ===========================================================================
// Test 5 — analytics/global created on issue creation
// Bug: onIssueCreated calls recordDailyMetrics / recordCategoryMetrics /
//      recordStatusMetrics but NEVER calls recordAnalyticsEvent('global', ...).
//      The analytics/global document is never written.
// Expected after fix: getDoc('analytics/global').exists() === true
// Current (unfixed): document is never written — test FAILS
//
// Validates: Requirement 5.2
// ===========================================================================
describe('Test 5 — analytics/global (Bug Condition)', () => {
  it('after issue creation, analytics/global document should exist', async () => {
    // Simulate what onIssueCreated currently does: recordDailyMetrics, recordCategoryMetrics, recordStatusMetrics
    // None of these write to 'global'. We call recordAnalyticsEvent directly to mirror what the trigger does.

    // Track which doc IDs were written
    const writtenDocIds: string[] = [];

    mockCollection.mockImplementation((_collectionName: string) => {
      return {
        doc: vi.fn().mockImplementation((docId: string) => {
          return {
            get: vi.fn().mockResolvedValue({
              exists: writtenDocIds.includes(docId),
              data: () =>
                writtenDocIds.includes(docId) ? { key: docId } : undefined,
            }),
            set: vi.fn().mockImplementation(() => {
              writtenDocIds.push(docId);
            }),
          };
        }),
      };
    });

    // Simulate the UNFIXED onIssueCreated analytics calls
    // (these are what the trigger currently calls — none write to 'global')
    const { dailyDocId } = await import('../services/analyticsService');
    await recordAnalyticsEvent(dailyDocId(), 'daily', { newIssues: 1 });
    await recordAnalyticsEvent('category_pothole', 'category', {
      reportCount: 1,
    });
    await recordAnalyticsEvent('status_reported', 'status', { issueCount: 1 });

    // EXPECTED AFTER FIX: 'global' doc was written by onIssueCreated trigger
    // CURRENT (UNFIXED): 'global' is never written → writtenDocIds does not include 'global'
    const globalWasWritten = writtenDocIds.includes('global');

    expect(
      globalWasWritten,
      `analytics/global was never written. Written docs: [${writtenDocIds.join(', ')}]. ` +
        'The onIssueCreated trigger does not call recordAnalyticsEvent("global", ...).',
    ).toBe(true); // FAILS on unfixed code
  });
});

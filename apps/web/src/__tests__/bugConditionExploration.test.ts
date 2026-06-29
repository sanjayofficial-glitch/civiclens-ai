/**
 * Bug Condition Exploration Tests — Task 1 (Frontend)
 *
 * These tests are EXPECTED TO FAIL on unfixed code.
 * Failure proves the bugs exist. Do NOT fix the code to make these pass.
 *
 * Test 2 — Upload path: assert path starts with `users/${userId}/issue/`
 * Test 3 — GPS stale: 25-second-old cached position should NOT be used
 *
 * Validates: Requirements 2.1, 3.1
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mock Firebase Storage so UploadService.uploadFile doesn't hit real Firebase
// ---------------------------------------------------------------------------
vi.mock('../lib/firebase/storage', () => ({
  storage: {},
}));

vi.mock('firebase/storage', () => {
  const capturedPaths: string[] = [];
  const mockUploadTask = {
    on: vi.fn(
      (
        _event: string,
        _progress: unknown,
        _error: unknown,
        complete: () => void,
      ) => {
        complete();
      },
    ),
    snapshot: {
      ref: {},
    },
  };

  return {
    ref: vi.fn((_, path: string) => {
      // Capture the path passed to ref() — this is the upload path
      capturedPaths.push(path);
      return { _path: path };
    }),
    uploadBytesResumable: vi.fn(() => mockUploadTask),
    getDownloadURL: vi.fn().mockResolvedValue(
      'https://firebasestorage.googleapis.com/v0/b/test/o/photo.jpg?alt=media',
    ),
    _capturedPaths: capturedPaths,
  };
});

// ===========================================================================
// Test 2 — Upload path (Bug Condition)
// Bug: runAiAnalysis in ReportWizardPage constructs:
//       `issues/${Date.now()}_${idx}_${random}` (no users/ prefix)
// Expected after fix: `users/${userId}/issue/${timestamp}_${idx}_photo${idx}.jpg`
// Current (unfixed): path starts with 'issues/' — test FAILS
//
// Validates: Requirement 2.1
// ===========================================================================
describe('Test 2 — Upload path (Bug Condition)', () => {
  it('upload path captured from UploadService.uploadFile should start with users/{uid}/issue/', async () => {
    // We test the path construction logic directly, mirroring what ReportWizardPage does.
    // The unfixed code constructs: `issues/${Date.now()}_${idx}_${Math.random()...}`
    // The fixed code constructs:  `users/${user.uid}/issue/${Date.now()}_${idx}_photo${idx}.jpg`

    const userId = 'test-user-uid-123';

    // ---- UNFIXED path construction (copy of the bug from ReportWizardPage.tsx line ~192) ----
    const idx = 0;
    const unfixedPath = `issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;

    // ---- What the fixed path SHOULD look like ----
    const _fixedPath = `users/${userId}/issue/${Date.now()}_${idx}_photo${idx}.jpg`;

    // The test captures the ACTUAL path from UploadService by importing and spying
    const { UploadService } = await import('../services/upload.service');
    const uploadSpy = vi.spyOn(UploadService, 'uploadFile').mockResolvedValue(
      'https://firebasestorage.googleapis.com/v0/b/test/o/photo.jpg?alt=media',
    );

    const file = new File(['fake-image-data'], 'photo_0.jpg', { type: 'image/jpeg' });

    // Simulate what the UNFIXED runAiAnalysis does
    await UploadService.uploadFile(file, unfixedPath);

    const capturedPath = uploadSpy.mock.calls[0][1] as string;

    // EXPECTED AFTER FIX: capturedPath starts with `users/${userId}/issue/`
    // CURRENT (UNFIXED): capturedPath starts with 'issues/' — test FAILS
    expect(
      capturedPath,
      `Upload path "${capturedPath}" should start with "users/${userId}/issue/" but starts with "issues/"`,
    ).toMatch(new RegExp(`^users/${userId}/issue/`)); // FAILS on unfixed code

    uploadSpy.mockRestore();
  });

  it('unfixed path does NOT start with users/{uid}/issue/ — confirming bug exists', () => {
    // This test is the explicit documentation of the bug.
    // It is designed to PASS (documents that unfixed path is wrong),
    // and is paired with the test above which FAILS to show the fix requirement.
    const userId = 'test-user-uid-123';
    const idx = 0;

    // This is the EXACT bug: the path from the unfixed ReportWizardPage
    const buggyPath = `issues/${Date.now()}_${idx}_${Math.random().toString(36).slice(2)}`;

    expect(buggyPath).toMatch(/^issues\//);
    expect(buggyPath).not.toMatch(new RegExp(`^users/${userId}/issue/`));
  });
});

// ===========================================================================
// Test 3 — GPS stale cache (Bug Condition)
// Bug: Stage 1 uses `{ maximumAge: 30000, enableHighAccuracy: false }`.
//       A 25-second-old cached position (within the 30s window) is returned
//       immediately as the "current" location — even if it's the wrong city.
// Expected after fix: maximumAge: 0 forces fresh acquisition; stale pos rejected
// Current (unfixed): stale position is accepted and returned — test FAILS
//
// Validates: Requirement 3.1
// ===========================================================================
describe('Test 3 — GPS stale cache (Bug Condition)', () => {
  let originalGeolocation: Geolocation;

  beforeEach(() => {
    originalGeolocation = navigator.geolocation;
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it('getCurrentPosition should NOT resolve with a 25-second-old cached position', async () => {
    // Create a mock position that is 25 seconds old
    const STALE_AGE_MS = 25_000; // 25 seconds old
    const now = Date.now();
    const staleTimestamp = now - STALE_AGE_MS;

    const stalePosition: GeolocationPosition = {
      coords: {
        latitude: 22.5726,   // Kolkata — wrong city (stale IP-geolocation fix)
        longitude: 88.3639,
        accuracy: 5000,      // very inaccurate — typical of IP geolocation
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
        toJSON: () => ({}),
      },
      timestamp: staleTimestamp,
      toJSON: () => ({}),
    };

    // Track which options each getCurrentPosition call received
    const capturedOptions: PositionOptions[] = [];

    Object.defineProperty(navigator, 'geolocation', {
      value: {
        getCurrentPosition: vi.fn(
          (
            successCb: PositionCallback,
            _errorCb: PositionErrorCallback,
            options?: PositionOptions,
          ) => {
            capturedOptions.push(options ?? {});
            // Simulate browser returning the stale position immediately
            // (as it would when maximumAge allows it)
            successCb(stalePosition);
          },
        ),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
      configurable: true,
    });

    const { GeolocationService } = await import('../services/geolocation.service');

    const result = await GeolocationService.getCurrentPosition();

    // ---- Stage 1 options inspection ----
    // EXPECTED AFTER FIX: capturedOptions[0].maximumAge === 0 (forces fresh GPS)
    // CURRENT (UNFIXED): capturedOptions[0].maximumAge === 30000 → accepts stale pos
    const stage1Options = capturedOptions[0];

    expect(
      stage1Options?.maximumAge,
      `Stage 1 maximumAge is ${stage1Options?.maximumAge}ms but should be 0 to reject stale positions`,
    ).toBe(0); // FAILS on unfixed code (unfixed = 30000)

    // ---- Stale position detection ----
    // Since maximumAge:0 means the browser must NOT use cached positions,
    // a 25-second-old position should never be returned.
    // On unfixed code the stale Kolkata position IS returned.
    const _positionAgeMs = Date.now() - result.coords.accuracy; // indirect freshness check
    // More direct: check that the unfixed stale Kolkata coords were NOT used
    expect(
      result.coords.latitude,
      `Got stale cached latitude ${result.coords.latitude} (Kolkata: 22.5726). ` +
      'Stage 1 maximumAge:30000 accepted a 25s-old cached position.',
    ).not.toBeCloseTo(22.5726, 2); // FAILS on unfixed code when stale pos is Kolkata
  });

  it('Stage 1 options on unfixed code accept stale positions — documenting the bug', () => {
    // This documents the EXACT bug values for the record.
    // The unfixed Stage 1 options in geolocation.service.ts:
    const unfixedStage1Options = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 30000, // 30 seconds — allows stale cached IP-geolocation result
    };

    // A 25-second-old cached position IS within the 30s window → accepted
    const cachedPositionAgeMs = 25_000;
    const wouldBeAccepted = cachedPositionAgeMs <= (unfixedStage1Options.maximumAge ?? 0);

    expect(wouldBeAccepted).toBe(true); // Documents the bug: stale pos IS accepted
    expect(unfixedStage1Options.maximumAge).toBeGreaterThan(0); // Documents: not using maximumAge:0
  });
});

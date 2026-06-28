# Testing

## Current State

**21 tests across 4 test files — all passing.**

Tests are located in `apps/functions/src/__tests__/` and run via **Vitest 4.1.9**.

## Test Framework

| Category | Status |
|----------|--------|
| Unit Tests | ✅ Configured — vitest in `apps/functions` |
| Integration Tests | ✅ 21 tests across 4 files |
| E2E Tests | [TODO] — Not configured |

## Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `apps/functions/src/__tests__/geminiService.test.ts` | AI analysis with retry + fallback | 5 tests |
| `apps/functions/src/__tests__/notificationService.test.ts` | Notification CRUD | 5 tests |
| `apps/functions/src/__tests__/verificationService.test.ts` | Vote transactions (upvote/downvote/unvote) | 6 tests |
| `apps/functions/src/__tests__/issueService.test.ts` | Issue enrichment pipeline | 5 tests |

## Running Tests

```bash
# Run all function tests
npm run test --workspace=@CivicLens/functions

# Or from apps/functions directory
cd apps/functions && npx vitest run
```

## Writing Tests

Tests use Vitest with mocked Firestore and Firebase Admin SDK. Common patterns:

- **NotificationRepository mock**: Use regular functions (not arrow functions) for mock constructors
- **Firestore transaction mocks**: Let errors propagate naturally (don't catch inside mock `runTransaction`)
- **Gemini service tests**: Update expected values if keyword fallback logic changes

## Recommendations

### For Web App (apps/web)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### For Shared Package (packages/shared)

```bash
npm install -D vitest
```

## Test Scripts

| Package | Script | Status |
|---------|--------|--------|
| root | `test` | Not defined |
| web | `test` | Not defined |
| functions | `test` | ✅ `vitest run` |
| shared | `test` | Not defined |

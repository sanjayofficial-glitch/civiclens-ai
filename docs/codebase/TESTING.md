# Testing

## Current State

**No test files detected in the codebase.**

## Test Framework

| Category | Status |
|----------|--------|
| Unit Tests | [TODO] — Not configured |
| Integration Tests | [TODO] — Not configured |
| E2E Tests | [TODO] — Not configured |

## Test Infrastructure

### Expected Locations (based on conventions)
- Unit tests: `apps/web/src/**/*.test.ts(x)`, `apps/web/src/**/*.spec.ts(x)`
- Function tests: `apps/functions/src/**/*.test.ts`
- Shared tests: `packages/shared/src/**/*.test.ts`

### Dependencies
No test-related devDependencies detected in any package:
- No Jest, Vitest, Mocha, or similar
- No testing-library packages
- No Playwright or Cypress

## Recommendations

### For Web App (apps/web)
```bash
# Suggested setup
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### For Cloud Functions (apps/functions)
```bash
# Suggested setup
npm install -D vitest firebase-functions-test
```

### For Shared Package (packages/shared)
```bash
# Suggested setup (Zod schema testing)
npm install -D vitest
```

## Test Scripts

| Package | Script | Status |
|---------|--------|--------|
| root | `test` | Not defined |
| web | `test` | Not defined |
| functions | `test` | Not defined |
| shared | `test` | Not defined |

## Evidence

- `package.json` (all) — No test scripts or test dependencies
- Directory scans — No `*.test.ts`, `*.spec.ts`, `__tests__/` directories found

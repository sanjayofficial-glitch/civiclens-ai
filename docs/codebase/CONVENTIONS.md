# Conventions

## Naming Conventions

### Files & Directories
- **Features**: lowercase, kebab-case (`auth/`, `issues/`, `report/`)
- **Components**: PascalCase (`ProtectedRoute.tsx`, `PageLoader.tsx`)
- **Services**: camelCase with `.service.ts` suffix (`issue.service.ts`)
- **Hooks**: camelCase with `use` prefix (`useAuth.tsx`)
- **Schemas**: camelCase with `Schema` suffix (`issueSchema`, `userSchema`)
- **Types**: PascalCase (`Issue`, `UserRole`, `ApiResponse`)

### Code
- **Variables/Functions**: camelCase (`getUserById`, `issueStatus`)
- **Constants**: UPPER_SNAKE_CASE (`ISSUES_COLLECTION`)
- **Types/Interfaces**: PascalCase (`Issue`, `CreateIssue`)
- **Enums**: PascalCase values (`UserRole.Citizen`)

## Import Style

### Path Aliases
- `@/` maps to `apps/web/src/` (configured in `vite.config.ts`)
- Package imports use `@blockseblock/shared`

### Import Order
```typescript
// 1. External libraries
import { z } from 'zod';
import { collection } from 'firebase/firestore';

// 2. Shared package
import { Issue } from '@blockseblock/shared/types';

// 3. Internal modules (relative)
import { db } from '../lib/firebase/firestore';
```

## TypeScript Configuration

- **Strict mode**: Enabled
- **Module**: ESNext (web), CommonJS (functions)
- **Path aliases**: `@/` → `./src/`
- **Base config**: `tsconfig.base.json` extended by each package

## Code Style

### Formatting
- **Formatter**: Prettier
- **Linter**: Oxlint (web), ESLint (functions, shared)
- **Line length**: Default Prettier (80)

### React Patterns
- Functional components only (no class components)
- Lazy loading for page components
- Hooks for state and side effects
- Provider pattern for global state

### Error Handling
- Services return `null` for not-found cases
- Firebase errors propagated to callers
- UI handles loading/error states via React Query

## Testing

- **Framework**: [TODO] — No test files detected
- **Location**: [TODO]
- **Mocking**: [TODO]

## Git Workflow

- **Branching**: [TODO]
- **Commit messages**: [TODO]
- **PR reviews**: [TODO]

## Evidence

- `.prettierrc` — Prettier config
- `.oxlintrc.json` — Oxlint config (web)
- `eslint.config.mjs` — ESLint config (root)
- `tsconfig.base.json` — Base TypeScript config
- `vite.config.ts` — Path alias configuration
- Import patterns in `apps/web/src/services/*.service.ts`

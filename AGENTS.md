# AGENTS.md - AI Agent Guidelines for sistema-ferias

## Project Overview

Next.js 15 + TypeScript + Supabase vacation management system. Uses App Router, React 18, Tailwind CSS, and Zod for validation.

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server on port 5000

# Type checking
npm run typecheck        # Run TypeScript compiler (tsc --noEmit)

# Linting
npm run lint             # Run ESLint
npm run lint:fix         # Run ESLint with auto-fix

# Formatting
npm run format           # Check Prettier formatting
npm run format:write     # Fix Prettier formatting

# All checks
npm run check            # typecheck + lint + format

# Testing
npm run test             # Run all tests in watch mode (vitest)
npm run test:unit        # Run unit tests only
npm run test:integration # Run integration tests only
npm run test:coverage    # Run with coverage report
npm run test:e2e         # Run Playwright e2e tests

# Run a single test file
npx vitest run tests/unit/auth.test.ts
npx vitest run tests/unit/api/professionals.route.test.ts

# Run tests matching a pattern
npx vitest run -t "hashPassword"
npx vitest run --grep "returns 401"

# Build
npm run build            # Production build
```

## Project Structure

```
app/                    # Next.js App Router pages and API routes
  api/                  # API route handlers (route.ts files)
components/
  ui/                   # Reusable UI components (Button, Input, etc.)
  features/             # Feature-specific components
  layout/               # Layout components
lib/                    # Shared utilities and business logic
  auth.ts               # Authentication functions
  db.ts                 # Database operations
  constants.ts          # Centralized constants
  input-validation.ts   # Zod schemas and validation
  rate-limit.ts         # Rate limiting utilities
interfaces/             # TypeScript interfaces (repositories)
repositories/           # Data access layer (Supabase implementations)
types/                  # Shared TypeScript types
tests/
  unit/                 # Unit tests
  integration/          # Integration tests
  e2e/                  # Playwright end-to-end tests
```

## Code Style Guidelines

### Imports

Imports are auto-sorted by `eslint-plugin-simple-import-sort`. Order:

1. External packages (react, next, etc.)
2. Internal aliases (`@/lib`, `@/components`, etc.)
3. Relative imports

```typescript
// External packages first
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Internal aliases
import { authOptions } from '@/lib/auth-config';
import { VALIDATION_LIMITS } from '@/lib/constants';
import { professionalSchema } from '@/lib/input-validation';
```

### Formatting (Prettier)

- Print width: 100 characters
- Single quotes for strings
- Semicolons required
- Trailing commas (all)
- 2-space indentation
- Arrow function parens always

### TypeScript

- Strict mode enabled
- Use `@/*` path alias for imports
- Define types in `types/index.ts` for domain models
- Define interfaces in `interfaces/` for contracts (repositories)
- Use Zod schemas for runtime validation
- Prefix unused variables with `_` (e.g., `_error`)

### Naming Conventions

- **Files**: kebab-case for utilities (`input-validation.ts`), PascalCase for components (`Button.tsx`)
- **Variables/Functions**: camelCase (`getUserById`, `professionalSchema`)
- **Types/Interfaces**: PascalCase with `I` prefix for interfaces (`IProfessionalRepository`)
- **Constants**: UPPER_SNAKE_CASE (`VALIDATION_LIMITS`, `DEFAULT_PAGE_SIZE`)
- **React Components**: PascalCase (`Button`, `LoginForm`)
- **Database columns**: snake_case (mapped via column maps in `lib/constants.ts`)

### Error Handling

- Use try-catch for async operations
- Log errors server-side with `console.error`
- Return generic error messages to clients (never expose internal details)
- Validate all inputs with Zod before processing

```typescript
try {
  const validation = professionalSchema.safeParse(data);
  if (!validation.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }
  // ... process
} catch (error) {
  console.error('Operation failed:', error);
  return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
}
```

### API Routes

- Always check session with `getServerSession(authOptions)`
- Validate route params with `uuidSchema` from `lib/input-validation.ts`
- Use Zod schemas for request body validation
- Return Portuguese error messages for user-facing errors
- Set appropriate cache headers

```typescript
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const idValidation = uuidSchema.safeParse(id);
  if (!idValidation.success) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }
  // ...
}
```

### React Components

- Use `forwardRef` for components that need ref forwarding
- Use `class-variance-authority` (cva) for variant-based styling
- Use `cn()` utility for conditional class merging
- Set `displayName` on forwardRef components

### Testing

- Use Vitest with jsdom environment
- Mock external dependencies with `vi.mock()`
- Use `beforeEach` to reset mocks
- Test file naming: `*.test.ts` or `*.test.tsx`
- Co-locate API route tests in `tests/unit/api/`

### Constants

Centralize magic values in `lib/constants.ts`:

- Validation limits (`VALIDATION_LIMITS`)
- Pagination defaults (`DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`)
- Rate limiting config (`RATE_LIMIT_LOGIN`, `RATE_LIMIT_REGISTER`)
- Column mappings (`VACATION_COLUMN_MAP`, `PROFESSIONAL_COLUMN_MAP`)

### Pre-commit Hooks

Husky + lint-staged runs on commit:

- ESLint with auto-fix
- Prettier formatting

All checks must pass before commit succeeds.

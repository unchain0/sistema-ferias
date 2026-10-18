# Sistema de Férias

Professional vacation management system built with Next.js 15, TypeScript, and Supabase.

## Features

- **Vacation Period Management** - Track acquisition and usage periods for each professional
- **Dashboard Analytics** - Visualize vacation days, revenue impact, and monthly trends
- **Professional Management** - CRUD operations for professionals with client manager and revenue tracking
- **Demo Mode** - Pre-seeded demo account for evaluation without external dependencies
- **Rate Limiting** - IP-based rate limiting for authentication endpoints
- **Input Validation** - Comprehensive sanitization and validation for all user inputs
- **Secure Authentication** - NextAuth.js with bcrypt password hashing

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) with JSON file fallback for demo
- **Authentication**: NextAuth.js
- **Testing**: Node.js native test runner with c8 coverage
- **Linting**: ESLint 9 with TypeScript strict type-checked rules
- **CI/CD**: GitHub Actions with pinned action SHAs

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/unchain0/sistema-ferias.git
cd sistema-ferias

# Install dependencies
npm ci --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No (demo mode works without) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No |
| `SUPABASE_JWT_SECRET` | JWT secret for Supabase auth | No |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

### Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Build for production
npm run build
```

## Demo Account

The application includes a pre-seeded demo account for evaluation:

- **Email**: `demo@sistema-ferias.com`
- **Password**: `demo123`

The demo mode works without any Supabase configuration, using an in-memory JSON file store.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── dashboard/     # Dashboard data
│   │   ├── professionals/ # Professional CRUD
│   │   └── vacations/     # Vacation period CRUD
│   ├── dashboard/         # Dashboard page
│   ├── login/             # Login page
│   ├── professionals/     # Professionals management page
│   └── vacations/         # Vacations management page
├── components/            # React components
├── lib/                   # Core libraries
│   ├── auth.ts            # Authentication logic
│   ├── auth-config.ts     # NextAuth configuration
│   ├── db.ts              # JSON file storage
│   ├── db-supabase.ts     # Supabase storage
│   ├── db-switch.ts       # Storage abstraction
│   ├── rate-limit.ts      # Rate limiting
│   ├── input-validation.ts # Input sanitization
│   ├── uuid-v7.ts         # UUIDv7 generation
│   └── utils.ts           # Utility functions
└── types/                 # TypeScript types
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/init-demo` - Initialize demo data

### Dashboard

- `GET /api/dashboard` - Get dashboard analytics

### Professionals

- `GET /api/professionals` - List professionals
- `POST /api/professionals` - Create professional
- `PUT /api/professionals/[id]` - Update professional
- `DELETE /api/professionals/[id]` - Delete professional

### Vacations

- `GET /api/vacations` - List vacation periods
- `POST /api/vacations` - Create vacation period
- `PUT /api/vacations/[id]` - Update vacation period
- `DELETE /api/vacations/[id]` - Delete vacation period

## Quality Standards

- **TypeScript**: Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **ESLint**: Type-checked rules with complexity limits (max 15 complexity, max 4 depth)
- **Tests**: ≥90% branch coverage enforced in CI
- **Dependencies**: Pinned action SHAs, least-privilege permissions
- **Security**: Gitleaks secret scanning, npm audit, OSV vulnerability scanning

## CI Pipeline

The CI pipeline runs on every push and pull request:

1. **Lint** - ESLint with strict type-checked rules
2. **Type Check** - TypeScript strict compilation
3. **Complexity** - Cyclomatic complexity analysis
4. **Test** - Unit and integration tests
5. **Coverage** - Code coverage with 90% branch threshold
6. **Audit** - Dependency vulnerability audit
7. **Secret Scan** - Gitleaks secret detection
8. **Vulnerability Scan** - OSV vulnerability scanning
9. **Mutation Testing** - Stryker mutation testing
10. **Build** - Next.js production build
11. **Actionlint** - GitHub Actions workflow validation
12. **Zizmor** - GitHub Actions security analysis

## License

MIT License - see LICENSE file for details.
# Overview

Sistema de Controle de Férias is a comprehensive vacation management system built with Next.js 15, TypeScript, and Tailwind CSS. The application enables users to manage professional employees' vacation periods, track acquisition and usage dates, and visualize the financial impact of vacations through an interactive dashboard with charts and metrics.

The system features secure authentication, CRUD operations for professionals and vacation periods, automatic calculation of vacation days and revenue deductions, and a demo mode for exploring the application with sample data.

**Platform**: Migrated from Vercel to Replit on November 4, 2025. Configured for Replit's environment with proper port binding (0.0.0.0:5000) and workflow automation.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Routing**
- Next.js 15 with App Router for file-based routing and server-side rendering
- React 18 with TypeScript for type-safe component development
- Client-side navigation using `useRouter` and `usePathname` hooks

**Styling & UI**
- Tailwind CSS utility-first framework with custom configuration
- PT Sans font family imported from Google Fonts
- Dark mode support using CSS variables and Tailwind's dark mode classes
- Reusable component library: Button, Card, Input, LoadingSpinner

**State Management**
- React hooks (useState, useEffect, useCallback, useMemo) for local state
- NextAuth session management for authentication state
- No global state management library (Redux, Zustand) required

**Performance Optimizations**
- Dynamic imports using Next.js `dynamic()` for code splitting (LoginForm, charts, toast notifications)
- React Suspense for loading states
- Virtualized tables using react-virtuoso for rendering large datasets efficiently
- Deferred values and transitions for non-blocking UI updates
- AbortController for canceling in-flight fetch requests

**Data Visualization**
- Recharts library for interactive bar charts
- Responsive charts that adapt to light/dark mode
- Custom tooltip styling based on theme

## Backend Architecture

**Authentication & Authorization**
- NextAuth.js v4 with Credentials provider for email/password authentication
- JWT-based session strategy (no database sessions)
- bcryptjs for password hashing with 12 salt rounds
- Session middleware protecting dashboard, professionals, and vacations routes
- Demo user protection middleware preventing modifications

**API Design**
- RESTful API routes under `/api` directory
- Server-side session validation using `getServerSession`
- Rate limiting implemented for registration endpoint (5 requests per 15 minutes)
- Input validation using Zod schemas
- Pagination support for vacation periods (limit, offset, order params)

**Business Logic**
- Vacation days calculation: `differenceInDays(endDate, startDate) + 1`
- Revenue deduction calculation: `(monthlyRevenue / 30) * vacationDays`
- Date filtering with overlap detection for dashboard metrics
- Aggregation of vacation data by month using Map data structure

**Data Storage Strategy**
- Dual storage system via `db-switch.ts`:
  - **Supabase (Production)**: PostgreSQL database with Row Level Security (RLS) policies
  - **In-Memory/Filesystem (Development)**: Fallback storage when Supabase not configured
- Automatic detection based on environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- Storage abstraction layer allows seamless switching between implementations

## Security Architecture

**Input Validation**
- Zod schemas for email, password, name, professional, and vacation data
- String sanitization to prevent XSS (removes `<>` characters, limits length)
- Password length enforcement (6-72 characters for bcrypt compatibility)
- Email format validation using regex patterns

**HTTP Security Headers**
- Strict-Transport-Security (HSTS) for HTTPS enforcement
- X-Frame-Options (SAMEORIGIN) to prevent clickjacking
- X-Content-Type-Options (nosniff) to prevent MIME sniffing
- Content-Security-Policy (CSP) restricting script and style sources
- X-XSS-Protection and Referrer-Policy headers

**Rate Limiting**
- In-memory rate limit store with automatic cleanup
- Configurable interval and max requests per endpoint
- IP-based identification for registration endpoint
- Custom middleware support (middleware-custom.ts) for additional protection

**Demo Mode Protection**
- Read-only mode for demo@sistema-ferias.com user
- HTTP 403 responses for modification attempts
- Client-side banners indicating demo mode
- Automatic demo data initialization on login

# External Dependencies

## Third-Party Services

**Supabase (Optional)**
- PostgreSQL database for persistent storage
- Row Level Security (RLS) policies filtering data by user_id
- JWT-based authentication integration using custom tokens
- Admin client for server-side operations with service role key
- Tables: users, professionals, vacation_periods

**Replit (Deployment Platform)**
- Configured for autoscale deployment with Next.js build optimization
- Development workflow runs on port 5000 with webview output
- Host binding to 0.0.0.0 for Replit proxy compatibility
- Production deployment uses npm run build && npm run start

**Analytics (Optional)**
- @vercel/analytics integration for usage tracking
- @vercel/speed-insights for performance monitoring

## NPM Packages

**Core Framework**
- next@^15.5.6 - React framework with App Router
- react@^18.3.1 & react-dom@^18.3.1 - UI library
- typescript@^5 - Type safety

**Authentication**
- next-auth@^4.24.5 - Authentication framework
- bcryptjs@^2.4.3 - Password hashing
- jsonwebtoken@^9.0.2 - JWT token generation for Supabase

**Database & Storage**
- @supabase/supabase-js@^2.39.0 - Supabase client library

**UI & Styling**
- tailwindcss@^3.4.1 - Utility-first CSS framework
- lucide-react@^0.295.0 - Icon library
- react-hot-toast@^2.6.0 - Toast notifications

**Data Visualization & Utilities**
- recharts@^2.10.0 - Charting library
- date-fns@^3.0.0 - Date manipulation and formatting
- react-virtuoso@^4.14.1 - Virtual scrolling for tables
- zod@^3.22.4 - Schema validation

**Development Tools**
- @types/* packages for TypeScript support
- eslint@^8 & eslint-config-next - Linting
- autoprefixer@^10.0.1 & postcss@^8 - CSS processing

## Environment Variables

**Required for Supabase**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key for server operations
- `SUPABASE_JWT_SECRET` - JWT signing secret

**Required for NextAuth**
- `NEXTAUTH_SECRET` - Session encryption secret (configured in Replit Secrets)

**Optional**
- `NEXTAUTH_URL` - Application base URL (auto-detected in Replit)
- `NODE_ENV` - Development/production environment
- `USE_FILESYSTEM` - Force filesystem storage (development only)

## Replit Configuration

**Development Server**
- Dev script: `next dev -p 5000 -H 0.0.0.0`
- Workflow: dev-server configured with webview output on port 5000
- Node version: 20.x (compatible with >=18.x requirement)

**Production Deployment**
- Build script: `next build`
- Start script: `next start -p 5000 -H 0.0.0.0`
- Deployment type: Autoscale (stateless web application)
- Port: 5000 (required for Replit webview proxy)
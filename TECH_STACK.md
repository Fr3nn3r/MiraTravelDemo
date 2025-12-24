# TECH_STACK.md
# Technical Constraints & Standards

## 1. The Stack

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | Next.js (App Router) | 16.1.0 |
| **UI Library** | React | 19.2.3 |
| **Styling** | Tailwind CSS | 4.x |
| **Components** | Radix UI primitives | Various |
| **Icons** | Lucide React | 0.562.0 |
| **Database** | Supabase (PostgreSQL) | 2.89.0 |
| **Language** | TypeScript | 5.x |
| **Unit Testing** | Jest + Testing Library | 30.x |
| **E2E Testing** | Playwright | 1.57.0 |
| **Linting** | ESLint | 9.x |

## 2. Architecture Patterns

### API Layer
- **Route Handlers:** All API endpoints in `src/app/api/`
- **Service Layer:** Business logic in `src/lib/engine/` and `src/lib/supabase/`
- **No fetch in components:** UI components call service functions, not raw APIs

### Database Access
- **Supabase Client:** Lazy-initialized singleton in `src/lib/supabase/client.ts`
- **RLS Enabled:** Row-Level Security is the primary security layer
- **Service Functions:** All DB operations via `src/lib/supabase/product-service.ts`

### Decision Engine
- **Location:** `src/lib/engine/decision-engine.ts`
- **Pattern:** Pipeline evaluation with trace steps
- **Mock Data:** Flight data in `src/lib/data/flights.ts` (deterministic generation)

### Styling
- **Approach:** Utility-first with Tailwind CSS
- **Components:** Radix primitives wrapped with CVA (class-variance-authority)
- **Conventions:** Mobile-first, consistent spacing scale

## 3. Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API route handlers
    products/             # Product management UI
    simulator/            # Claim simulator UI
    metrics/              # Dashboard UI
  components/             # Reusable UI components
    ui/                   # Base UI primitives
  lib/
    data/                 # Mock data and stores
    engine/               # Decision engine and types
    supabase/             # Database client and services
```

## 4. Key Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start local dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm test` | Run unit tests (Jest) |
| `npm run test:e2e` | Run E2E tests (Playwright) |
| `npm run test:coverage` | Unit tests with coverage |

## 5. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |

**Note:** Tests mock Supabase, so env vars not needed for CI unit tests.

## 6. CI/CD

- **Platform:** GitHub Actions
- **Trigger:** PRs and pushes to `main`
- **Pipeline:** Lint -> Unit Tests -> Build
- **Deployment:** Vercel (auto-deploys on merge)
- **Node Version:** 20.x (required by Next.js 16)

## 7. Conventions

### Naming
- **Files:** kebab-case for files, PascalCase for components
- **Variables:** camelCase, descriptive names
- **Types:** PascalCase, suffix with `Props` for component props

### Testing
- **Unit Tests:** Co-located in `__tests__/` directories
- **E2E Tests:** In `e2e/` at project root
- **Mocking:** Supabase mocked globally in `jest.setup.ts`

### Code Quality
- **No unused imports:** ESLint enforced
- **Escaped JSX strings:** Use HTML entities for quotes/apostrophes
- **const over let:** Unless reassignment needed

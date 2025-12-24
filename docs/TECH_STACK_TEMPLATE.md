# TECH_STACK.md
# Technical Constraints & Standards

## 1. The Stack
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, Shadcn UI.
- **Backend:** Supabase (PostgreSQL), Edge Functions.
- **State:** React Query + Zustand.
- **Auth:** Supabase Auth.
- **Testing:** Jest (Unit), Playwright (E2E).

## 2. Architecture Patterns
- **API:** All external calls via `@/services`. No `fetch` in UI components.
- **DB Access:** RLS is the security layer. Never bypass RLS in client code.
- **Styles:** Mobile-first utility classes.

## 3. Key Commands
- `npm run dev`: Start local server.
- `npm run test`: Run unit tests.
- `npm run lint`: Check code quality.
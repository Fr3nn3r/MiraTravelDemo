# [T-008] Authentication Core

**Status:** Backlog
**Priority:** High
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Enable user authentication so the decisioning console can identify users, restrict access, and audit actions by user identity.

## 2. Requirements (SSOT)

### A1: User Authentication
- [ ] Implement login/logout flow
- [ ] Support email/password or OAuth provider (Google, GitHub)
- [ ] Secure password handling (if using credentials)
- [ ] Protected routes redirect to login
- [ ] User info displayed in UI header

### A4: Session Management
- [ ] Secure session token storage (httpOnly cookies)
- [ ] Session expiration and refresh
- [ ] Logout invalidates session
- [ ] CSRF protection

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `src/app/api/auth/[...nextauth]/route.ts` (new - if using NextAuth)
- `src/lib/auth/config.ts` (new)
- `src/middleware.ts` (new or modify - route protection)
- `src/components/auth/LoginForm.tsx` (new)
- `src/components/layout/Header.tsx` (add user menu)
- `src/app/login/page.tsx` (new)

**Patterns:**
- Recommended: NextAuth.js (Auth.js) for flexibility
- Alternative: Clerk for faster setup
- Use Supabase Auth if staying in Supabase ecosystem
- Follow existing UI patterns (shadcn/ui components)

**Out of Scope:**
- Role-based access control (A2 - T-009)
- API key management (A3 - T-009)
- User action audit (A5 - T-009)
- Password reset flow (can be Phase 2)
- Multi-factor authentication

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [ ] Users can log in with email/password or OAuth
- [ ] Unauthenticated users redirected to login page
- [ ] Session persists across page refreshes
- [ ] Logout clears session completely
- [ ] User email/name shown in header when logged in
- [ ] Auth works on Vercel preview deployments

## 5. Implementation Notes (Filled by Agent/Dev)
*To be filled during implementation.*

**Decision Required:** Which auth provider to use?
- NextAuth.js - Most flexible, good ecosystem
- Clerk - Fastest setup, managed service
- Supabase Auth - Already using Supabase for DB

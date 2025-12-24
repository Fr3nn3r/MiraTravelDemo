# [T-009] Authorization & Access Control

**Status:** Backlog
**Priority:** Medium
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Implement role-based access control and API key management so different users have appropriate permissions and external systems can integrate securely.

## 2. Requirements (SSOT)

### A2: Role-Based Access Control
- [ ] Define roles: Admin, Underwriter, Viewer, API
- [ ] Admin: Full access (create/edit products, manage users)
- [ ] Underwriter: Edit products, run simulations, view metrics
- [ ] Viewer: Read-only access to all screens
- [ ] API: Decision endpoint only (for integrations)
- [ ] Role stored in user profile/database
- [ ] UI elements hidden/disabled based on role

### A3: API Key Management
- [ ] Generate API keys for integration partners
- [ ] Keys scoped to specific permissions (decision only)
- [ ] Key rotation (revoke old, generate new)
- [ ] Keys stored securely (hashed in DB)
- [ ] Rate limit per key (optional, can defer)

### A5: Audit User Actions
- [ ] Log who performed what action and when
- [ ] Track: product changes, version publishes, key generation
- [ ] Store in audit_log table (already exists)
- [ ] Include user ID and action details

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `src/lib/auth/roles.ts` (new - role definitions)
- `src/lib/auth/permissions.ts` (new - permission checks)
- `src/middleware.ts` (add role checks)
- `src/app/api/keys/route.ts` (new - key management API)
- `src/app/settings/api-keys/page.tsx` (new - key management UI)
- `src/lib/supabase/audit-service.ts` (new or extend)
- Database migration for user roles and api_keys table

**Patterns:**
- Permission checks at API route level
- UI uses hooks to check permissions: `usePermission('products:edit')`
- API keys use Bearer token in Authorization header
- Audit log follows existing trace pattern

**Dependencies:**
- T-008 (Authentication Core) - must have users first

**Out of Scope:**
- Fine-grained permissions (field-level)
- Permission groups/policies
- Self-service user management
- SSO/SAML integration

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [ ] Users assigned roles visible in admin UI
- [ ] Viewer role cannot edit products (UI + API protected)
- [ ] API keys can be generated and revoked
- [ ] API key authenticates decision endpoint
- [ ] User actions logged with user ID
- [ ] Audit log queryable by user/action type

## 5. Implementation Notes (Filled by Agent/Dev)
*To be filled during implementation.*

**Database Schema (Proposed):**
```sql
-- User roles (extend existing users or create mapping)
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'viewer';

-- API keys
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['decision:create'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);
```

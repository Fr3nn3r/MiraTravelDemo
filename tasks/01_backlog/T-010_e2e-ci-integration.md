# [T-010] E2E Test Integration in CI

**Status:** Backlog
**Priority:** Medium
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Automate E2E testing in the CI pipeline to catch UI regressions. Deferred from T-004 to maintain fast CI feedback loops during initial hardening.

## 2. Requirements (SSOT)
- [ ] Job waits for Vercel preview deployment URL
- [ ] Runs `npm run test:e2e` against the preview URL
- [ ] Configured as a separate job (or conditional) to avoid slowing down the core "Gate"
- [ ] Uses Playwright GitHub Action for reporting

## 3. Technical Constraints & Out of Scope
- **Files to Modify:** `.github/workflows/ci.yml`, `playwright.config.ts`
- **Patterns:** Use `deployment_status` trigger or Vercel's waiting action.
- **Out of Scope:** Running E2E on every push (consider PR-only or manual trigger).

## 4. Acceptance Criteria (Definition of Done)
- [ ] PR triggers E2E run (successfully or skips appropriately)
- [ ] E2E results are visible in GitHub PR interface
- [ ] Failed E2E tests block merge (if configured as required)

## 5. Implementation Notes
*To be filled during implementation.*


# [T-003] PO Feedback: Demo Fixes and Improvements

**Status:** Backlog
**Priority:** High
**Owner:** Unassigned
**Date Created:** 2024-12-23

## 1. Context & Goal
Product Owner (Fred Brunner) identified multiple UI/UX issues and functional gaps during demo review. Fixing these issues will improve demo reliability and user experience before design partner pilots.

## 2. Requirements (SSOT)

### Phase 1: Immediate Fixes
- [ ] Fix version display typo (shows "vv1.2" instead of "v1.2") in product config screen
- [ ] Fix regression test date handling - tests fail because flight dates (Dec 2024) exceed eligibility window vs current system time (Dec 2025)
- [ ] Add optional `claimDate` parameter to decision API for flexible testing
- [ ] Reorder product config tabs to match decision engine flow (Data Source > Eligibility > Exclusions > Payout Tiers > Reason Codes > Preview)
- [ ] Add version indicator to regression test UI ("Testing against version X.Y")
- [ ] Improve compare version labeling for clarity

### Phase 2: Feature Implementation
- [ ] Implement duplicate product button (currently stub with no handler)
- [ ] Add "Edit Version" link on claim simulator to navigate to product versions
- [ ] Show publish button always (disabled when no changes) for better discoverability
- [ ] Expand trace input data by default in simulator decision trace

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `src/app/products/[id]/page.tsx` - Version typo, tab reorder, publish button
- `src/app/products/page.tsx` - Duplicate product button
- `src/lib/supabase/product-service.ts` - Duplicate product service method
- `src/app/api/decision/route.ts` - Add claimDate parameter
- `src/lib/engine/decision-engine.ts` - Use claimDate in eligibility check
- `src/lib/engine/types.ts` - Add claimDate to ClaimInput type
- `src/lib/engine/regression-runner.ts` - Use relative dates
- `src/lib/data/flights.ts` - Add date generation helpers
- `src/app/products/[id]/versions/page.tsx` - Version indicator
- `src/app/products/[id]/versions/compare/page.tsx` - Labeling improvements
- `src/app/simulator/page.tsx` - Edit version link, trace expansion

**Patterns:**
- Follow existing component patterns in `src/app/products/`
- Use Supabase service layer for data operations
- Maintain existing decision engine trace structure

**Out of Scope:**
- Product composition from primitives (needs separate design session - T-004)
- Visual rule builder
- Side-by-side version comparison layout (PO approved current diff-style)

## 4. Acceptance Criteria (Definition of Done)

The task is complete when:
- [ ] Regression tests pass in UI (all 10 tests green, not just denials)
- [ ] Version displays correctly without double "v" prefix
- [ ] Duplicate product button creates new product with copied config
- [ ] Config tabs match decision engine execution order
- [ ] claimDate parameter works in API and allows backdated claims for testing
- [ ] Unit tests updated for new claimDate parameter
- [ ] E2E tests pass on Vercel preview deployment
- [ ] No TypeScript/linting errors

## 5. Implementation Notes (Filled by Agent/Dev)

**Root Cause Analysis:**
- Regression test failures: System uses `new Date()` for eligibility check, but test flight dates are hardcoded to Dec 2024. With current date being Dec 2025, all claims exceed 72-hour eligibility window.
- Version typo: Code has `v{product.activeVersion}` but activeVersion already includes "v" prefix.
- Duplicate button: Rendered but has no onClick handler - pure stub.

**PO Decisions (2024-12-23):**
- Test dates: Implement BOTH relative dates AND claimDate parameter
- Primitives: Deferred to separate design workshop
- Duplicate: Implement now
- Compare view: Keep current diff-style, improve labeling only

**Reference:** Full PO feedback report at `.claude/plans/squishy-sniffing-starfish.md`

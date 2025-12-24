# [T-011] PO Feedback: Version Compare & Regression Test Fixes

**Status:** Backlog
**Priority:** High
**Owner:** Claude
**Date Created:** 2024-12-24

## 1. Context & Goal
Product Owner (Fred Brunner) identified multiple UX issues and bugs in the Version History, Compare Versions, Regression Test Pack, and Claims Simulator screens that need to be addressed for demo readiness and usability.

## 2. Requirements (SSOT)
- [x] Fix Claims Simulator "View Input Data" always empty (API bug - `input` field omitted from trace)
- [x] Fix version dropdown in Compare page not refreshing data when changed
- [x] Change Compare button to compare selected version with Active version (not previous)
- [x] Fix regression test runner overriding productId for "invalid product" test cases
- [x] Display test failure reasons (`diff` field) in regression test results UI
- [x] Add page refresh after publishing a version

## 3. Technical Constraints & Out of Scope
- **Files to Modify:**
  - `src/app/api/decision/route.ts` - Add `input` field to trace response
  - `src/app/products/[id]/versions/compare/page.tsx` - Fix dropdowns, add publish refresh
  - `src/app/products/[id]/versions/page.tsx` - Fix Compare button, show test diff
  - `src/lib/engine/regression-runner.ts` - Skip override for invalid-product tests
- **Out of Scope:**
  - Version deletion (confirmed: no deletion for audit compliance)
  - Version-to-version regression comparison (deferred to future sprint)
  - Real-time WebSocket updates

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [x] Claims Simulator shows input data in trace steps when "View Input Data" is expanded
- [x] Changing version dropdown in Compare page updates the comparison
- [x] Compare button on Version History shows "Compare with Active" and links to correct comparison
- [x] Regression tests for invalid products (test-deny-invalid-version, test-deny-invalid-product) pass correctly
- [x] Failed regression tests show the `diff` explaining why they failed
- [x] Publishing a version refreshes the page to show updated status
- [x] No linting errors
- [x] Build passes

## 5. Implementation Notes (Filled by Agent/Dev)
### Root Causes Identified:
1. **View Input Data empty**: API route explicitly omits `input` field in trace mapping (line 164-170)
2. **Dropdown no refresh**: Select components use `defaultValue` without `onValueChange` handlers
3. **Compare button unclear**: Links to previous version comparison, not active version
4. **Invalid product tests fail**: `runRegressionPack` overrides productId/Version for ALL tests including ones designed to test invalid scenarios
5. **No diff shown**: UI displays Expected/Actual but not the `diff` field from RegressionResult

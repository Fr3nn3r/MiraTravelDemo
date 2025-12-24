# [T-005] API Foundation (Versioning, Validation, OpenAPI)

**Status:** Backlog
**Priority:** High
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Establish API best practices for production readiness: versioned endpoints, request validation, and auto-generated documentation for integration partners.

## 2. Requirements (SSOT)

### R1: API Versioning
- [ ] Move `/api/decision` to `/api/v1/decision`
- [ ] Add version header support (`X-API-Version`)
- [ ] Maintain backward compatibility redirect from old endpoint (temporary)

### R3: Request Validation
- [ ] JSON schema validation for decision request body
- [ ] Return 400 with detailed validation errors
- [ ] Validate required fields: bookingRef, flightNo, flightDate, passengerToken, productId, productVersion

### R7: OpenAPI Specification
- [ ] Create OpenAPI 3.0 spec file for all public endpoints
- [ ] Document request/response schemas
- [ ] Include example payloads
- [ ] Serve spec at `/api/docs` or `/api/openapi.json`

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `src/app/api/v1/decision/route.ts` (new versioned route)
- `src/app/api/decision/route.ts` (add redirect)
- `src/lib/api/validation.ts` (new validation module)
- `src/lib/api/openapi.ts` or `public/openapi.json` (new spec)
- `src/app/api/docs/route.ts` (optional: serve spec)

**Patterns:**
- Use Zod for schema validation (already in project patterns)
- Follow existing error response format from decision engine
- OpenAPI spec should match TypeScript types

**Out of Scope:**
- Rate limiting (R2 - separate ticket)
- Batch endpoints (R4)
- Async processing (R5)

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [ ] `/api/v1/decision` returns same response as current `/api/decision`
- [ ] Invalid requests return 400 with field-level errors
- [ ] OpenAPI spec accessible and valid (passes linter)
- [ ] Existing E2E tests updated for new endpoint
- [ ] API demo page updated to use v1 endpoint

## 5. Implementation Notes (Filled by Agent/Dev)
*To be filled during implementation.*

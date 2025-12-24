# [T-006] Observability Foundation (Logging & Health)

**Status:** Backlog
**Priority:** High
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Establish foundational observability for production monitoring: structured logs for debugging and a health endpoint for uptime monitoring.

## 2. Requirements (SSOT)

### O1: Structured Logging
- [ ] Create logger utility with JSON output format
- [ ] Include correlation ID (request ID) in all logs
- [ ] Log levels: debug, info, warn, error
- [ ] Log decision engine inputs/outputs with trace ID
- [ ] Redact sensitive fields (passengerToken, etc.)

### O4: Health Endpoint
- [ ] Create `/api/health` endpoint
- [ ] Return 200 OK with status payload
- [ ] Include checks: database connectivity, app version
- [ ] Response time < 100ms (no heavy operations)

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `src/lib/logger.ts` (new)
- `src/app/api/health/route.ts` (new)
- `src/app/api/decision/route.ts` (add logging)
- `src/lib/engine/decision-engine.ts` (add trace logging)

**Patterns:**
- Use pino or winston for structured logging
- Correlation ID passed via headers or generated per request
- Health check follows standard format: `{ status: "ok", checks: {...} }`

**Out of Scope:**
- Error tracking/Sentry (O2 - T-007)
- Performance metrics (O3 - T-007)
- Alerting (O5)
- Dashboards (O6)

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [ ] All API requests logged with correlation ID
- [ ] Decision trace includes structured log entries
- [ ] `/api/health` returns 200 with DB status
- [ ] Sensitive data not visible in logs
- [ ] Log output is valid JSON (parseable by log aggregators)

## 5. Implementation Notes (Filled by Agent/Dev)
*To be filled during implementation.*

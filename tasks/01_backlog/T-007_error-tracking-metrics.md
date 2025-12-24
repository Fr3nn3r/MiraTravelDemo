# [T-007] Error Tracking & Metrics

**Status:** Backlog
**Priority:** Medium
**Owner:** Unassigned
**Date Created:** 2024-12-24

## 1. Context & Goal
Capture errors in production for rapid debugging and track performance metrics to identify bottlenecks before they impact users.

## 2. Requirements (SSOT)

### O2: Error Tracking
- [ ] Integrate Sentry SDK for error capture
- [ ] Configure source maps for readable stack traces
- [ ] Set up environment tags (production, preview)
- [ ] Capture unhandled exceptions and rejections
- [ ] Include correlation ID in error context

### O3: Performance Metrics
- [ ] Track API response times per endpoint
- [ ] Track decision engine processing time
- [ ] Track database query latency
- [ ] Expose metrics endpoint or push to collector
- [ ] Define baseline thresholds (p50, p95, p99)

## 3. Technical Constraints & Out of Scope

**Files to Modify:**
- `sentry.client.config.ts` (new)
- `sentry.server.config.ts` (new)
- `next.config.js` (Sentry plugin)
- `src/lib/metrics.ts` (new)
- `src/app/api/decision/route.ts` (add timing)
- `src/lib/engine/decision-engine.ts` (add timing)

**Patterns:**
- Use @sentry/nextjs for Next.js integration
- Metrics can use simple in-memory collection or Prometheus format
- Timing should use `performance.now()` or equivalent

**Dependencies:**
- T-006 (Observability Foundation) - uses correlation ID from logger

**Out of Scope:**
- Alerting rules (O5)
- Grafana/Datadog dashboards (O6)
- Custom error pages

## 4. Acceptance Criteria (Definition of Done)
The task is complete when:
- [ ] Errors in production appear in Sentry dashboard
- [ ] Stack traces show original TypeScript source
- [ ] Response times logged for each decision request
- [ ] Metrics accessible via endpoint or logs
- [ ] No performance regression from instrumentation (< 10ms overhead)

## 5. Implementation Notes (Filled by Agent/Dev)
*To be filled during implementation.*

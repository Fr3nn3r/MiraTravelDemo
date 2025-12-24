# Post-MVP Backlog

## Overview

This backlog captures all features, improvements, and technical debt items beyond the MVP demo. Items are grouped by category. Prioritization TBD based on stakeholder feedback and design partner requirements.

---

## Recently Completed (December 2024)

**Tier 1: Demo Hardening (PR #2)**
- [x] F1: Expanded mock flights to 27 (EU, US, APAC regions, all delay tiers)
- [x] F2: Deterministic flight generator for any flight number
- [x] E1: Enhanced input validation (flight format, date, version format)
- [x] E2-E3: Graceful handling for unknown flights (dynamic generation)
- [x] E4: Explicit version validation with DENIED_INVALID_VERSION
- [x] 5 new E2E API validation tests

**Supabase Integration (PR #1)**
- [x] P1-P5: Full persistence layer with Supabase PostgreSQL
- [x] X2-X5: Preview deployments, E2E tests, environment configs, secrets management
- [x] Dual-environment setup: Production (MiraCenter-Prod) + Dev/Preview (MiraCenter)
- [x] Database schema: products, product_versions, decisions, audit_log tables
- [x] Row-level security (RLS) policies for all tables
- [x] Seed data for 3 products (EU, US, APAC) with 4 versions

---

## 1. Persistence Layer

| ID | Item | Description | Effort | Status |
|----|------|-------------|--------|--------|
| P1 | Database setup | PostgreSQL/Supabase for structured data | M | [DONE] |
| P2 | Product persistence | Store products, versions, configs in DB | M | [DONE] |
| P3 | Decision persistence | Store all decisions with full trace | M | [DONE] |
| P4 | Audit log storage | Immutable append-only audit trail | M | [DONE] |
| P5 | Migration system | Schema versioning (Supabase migrations) | S | [DONE] |

---

## 2. Flight Data

| ID | Item | Description | Effort | Status |
|----|------|-------------|--------|--------|
| F1 | Expand mock flights | 20+ realistic flight scenarios | S | [DONE] |
| F2 | Dynamic flight generator | Generate random delays for any flight number | S | [DONE] |
| F3 | External flight API | Integrate real provider (FlightAware, AeroAPI) | L | |
| F4 | Flight API fallback | Graceful degradation when API unavailable | M | |
| F5 | Historical flight cache | Store past lookups for consistency | M | |

---

## 3. Authentication & Authorization

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| A1 | User authentication | Login/logout (NextAuth, Clerk, or Auth0) | M |
| A2 | Role-based access | Roles: Admin, Underwriter, Viewer, API | M |
| A3 | API key management | Generate/revoke keys for integrations | M |
| A4 | Session management | Secure session handling, token refresh | S |
| A5 | Audit user actions | Log who did what and when | S |

---

## 4. Decision Engine Enhancements

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| D1 | Configurable exclusions | UI to add/remove exclusion rules | M |
| D2 | Custom rule builder | Define rules beyond hardcoded logic | L |
| D3 | Multi-benefit products | Support multiple coverage types per product | L |
| D4 | Partial payouts | Pro-rata or partial claim approvals | M |
| D5 | Claim deduplication | Detect and reject duplicate claims | S |
| D6 | Idempotency keys | Prevent double-processing same request | S |
| D7 | Manual review queue | Flag edge cases for human review | M |
| D8 | Appeal/override flow | Allow manual override of decisions | M |

---

## 5. Error Handling & Edge Cases

| ID | Item | Description | Effort | Status |
|----|------|-------------|--------|--------|
| E1 | Input validation | Comprehensive request validation with clear errors | S | [DONE] |
| E2 | Flight not found | Graceful handling when flight doesn't exist | S | [DONE] |
| E3 | Product not found | Clear error when product ID invalid | S | [DONE] |
| E4 | Version mismatch | Handle requests for non-existent versions | S | [DONE] |
| E5 | Timeout handling | Timeouts for external API calls | S | |
| E6 | Circuit breaker | Prevent cascade failures | M | |
| E7 | Retry logic | Automatic retry with backoff | S | |

---

## 6. API Robustness

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| R1 | API versioning | /api/v1/decision with version headers | S |
| R2 | Rate limiting | Prevent abuse, per-client limits | M |
| R3 | Request validation | JSON schema validation | S |
| R4 | Batch endpoint | Process multiple claims in one request | M |
| R5 | Async processing | Queue for high-volume processing | L |
| R6 | Webhook callbacks | Notify external systems on decision | M |
| R7 | OpenAPI spec | Auto-generated API documentation | S |

---

## 7. Observability & Monitoring

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| O1 | Structured logging | JSON logs with correlation IDs | S |
| O2 | Error tracking | Sentry or similar for error capture | S |
| O3 | Performance metrics | Response times, throughput tracking | M |
| O4 | Health endpoint | /api/health for uptime monitoring | S |
| O5 | Alerting | Notify on errors, latency spikes | M |
| O6 | Dashboard | Ops dashboard (Grafana, Datadog) | M |

---

## 8. Compliance & Audit

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| C1 | Immutable audit log | Append-only, tamper-evident storage | M |
| C2 | Regulatory export | Export decisions in required formats | M |
| C3 | Data retention | Configurable retention policies | S |
| C4 | PII handling | Mask/encrypt sensitive passenger data | M |
| C5 | GDPR compliance | Data deletion, export on request | M |

---

## 9. Integrations

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| I1 | Webhook notifications | POST to external URL on decision | M |
| I2 | Payment rails | Trigger payout via Stripe, bank API | L |
| I3 | Policy system sync | Pull policy/booking data from insurer | L |
| I4 | CRM integration | Push decision data to CRM | M |
| I5 | Email notifications | Notify passengers of decisions | M |

---

## 10. UI/UX Improvements

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| U1 | Error states | User-friendly error messages throughout | S |
| U2 | Loading skeletons | Consistent loading states | S |
| U3 | Empty states | Helpful messaging when no data | S |
| U4 | Mobile responsive | Test and fix mobile layouts | M |
| U5 | Accessibility | WCAG 2.1 AA compliance | M |
| U6 | Dark mode | Theme toggle | S |
| U7 | Keyboard navigation | Full keyboard accessibility | S |
| U8 | Confirmation dialogs | Confirm destructive actions | S |

---

## 11. Testing

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| T1 | Increase unit coverage | Target 80%+ coverage | M |
| T2 | API integration tests | Test API endpoints with test DB | M |
| T3 | Load testing | k6 or Artillery for performance testing | M |
| T4 | Visual regression | Screenshot comparison (Chromatic) | M |
| T5 | Contract testing | API contract validation | S |

---

## 12. DevOps & Infrastructure

| ID | Item | Description | Effort | Status |
|----|------|-------------|--------|--------|
| X1 | CI/CD pipeline | GitHub Actions for test + deploy | M | |
| X2 | Preview deployments | Auto-deploy PRs to preview URLs (Vercel) | S | [DONE] |
| X3 | E2E tests | Playwright E2E smoke tests | S | [DONE] |
| X4 | Environment configs | Dev/preview + prod Supabase environments | S | [DONE] |
| X5 | Secrets management | Vercel env vars per environment | S | [DONE] |
| X6 | Database backups | Automated backup strategy | M | |
| X7 | CDN/caching | Static asset optimization | S | |

---

## 13. Product Features (New Capabilities)

| ID | Item | Description | Effort |
|----|------|-------------|--------|
| N1 | Multi-product types | Beyond flight delay (weather, baggage) | L |
| N2 | Product templates library | Pre-built templates for common products | M |
| N3 | A/B testing | Test different product configs | L |
| N4 | Bulk import | Import products/rules from CSV/JSON | M |
| N5 | Product cloning | Duplicate and modify existing products | S |
| N6 | Scheduled publishing | Publish version at future date | M |
| N7 | Rollback | One-click rollback to previous version | S |

---

## Effort Key

- **S** = Small (< 1 day)
- **M** = Medium (1-3 days)
- **L** = Large (1+ week)

---

## Suggested Priority Tiers

**Tier 1 - Demo Hardening (before design partner pilots)** [COMPLETE]
- ~~F1, F2 (more flight scenarios)~~ [DONE - PR #2]
- ~~E1-E4 (error handling basics)~~ [DONE - PR #2]
- ~~P1-P5 (persistence)~~ [DONE - PR #1]

**Tier 2 - Production Readiness**
- A1-A3 (auth)
- O1-O4 (observability)
- R1, R3, R7 (API basics)
- X1 (CI/CD pipeline) - ~~X2-X5~~ [DONE]

**Tier 3 - Scale & Compliance**
- C1-C5 (compliance)
- R2, R5 (rate limiting, async)
- I1-I2 (webhooks, payments)

**Tier 4 - Advanced Features**
- D2, D7, D8 (rule builder, manual review)
- N1-N7 (new product types)

---

## Notes

- Prioritization should be driven by design partner feedback
- Some items may be descoped if not validated by market
- Effort estimates are rough - refine during planning

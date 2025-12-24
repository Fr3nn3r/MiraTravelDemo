# BUSINESS_CONTEXT.md
# Product Goals & Domain Logic

## 1. Project Goal

A **deterministic insurance decisioning engine** for insurers to configure parametric products and return instant, traceable payout determinations from flight delay data.

> "Show insurers they can cut claims handling to near-zero, with full auditability, starting small."

## 2. Core User Personas

| Persona | Role | Access |
|---------|------|--------|
| **Product Manager** | Configures products, sets payout tiers, manages exclusions | Full config access |
| **Underwriter** | Reviews version changes, approves for production | Version compare, regression tests |
| **Claims Analyst** | Runs simulations, reviews decision traces | Simulator, audit export |
| **Integration Engineer** | Connects via API, tests payloads | API demo, documentation |
| **Executive/Investor** | Views metrics, understands business value | Metrics dashboard |

## 3. Domain Glossary (Naming Standards)

*Use these exact terms in code variable names.*

| Term | Definition | NOT |
|------|------------|-----|
| **Product** | A configured insurance benefit (e.g., Flight Delay EU) | "Policy", "Plan" |
| **Version** | A specific configuration snapshot (e.g., v1.2) | "Revision", "Edition" |
| **Claim** | A request for payout evaluation | "Request", "Submission" |
| **Decision** | The engine's determination (approved/denied) | "Result", "Outcome" |
| **Payout** | Amount in USD to be paid | "Benefit", "Amount" |
| **Tier** | A delay range with associated payout | "Level", "Band" |
| **Exclusion** | A reason that disqualifies a claim | "Exception", "Override" |
| **Trace** | Step-by-step audit of decision logic | "Log", "History" |
| **Delay** | Flight arrival delay in minutes | "Lateness" |
| **Flight** | The flight being evaluated | "Trip", "Journey" |

## 4. Critical Business Rules

### Payout Logic
- Payouts are **always in USD** and stored as integers (no floats)
- Delay is measured in **minutes** from scheduled arrival
- Only **one tier** matches per claim (highest qualifying tier)
- **$0 payout** for denied claims (never negative)

### Eligibility Rules
- Claims must be filed within **eligibility window** (default: 72 hours)
- Flight date cannot be **more than 1 year in future**
- Product and version must **exist and be active**

### Exclusions (Default)
- **Force Majeure** - Always excluded (war, terrorism, natural disaster)
- **Acts of God** - Always excluded
- **Crew Strike** - Configurable per product version
- **Weather** - Configurable per product version

### Version Governance
- Versions are **immutable** once created
- Only **one active version** per product at a time
- Version changes require **regression testing** before publish

### Decision Engine Flow (Order Matters)
1. Product Validation (fail fast if invalid)
2. Version Validation (fail fast if version not found)
3. Flight Data Fetch
4. Eligibility Window Check
5. Exclusion Check
6. Payout Tier Match
7. Final Decision

## 5. Payout Tier Structure (EU Product v1.2)

| Tier | Delay Range | Payout USD |
|------|-------------|------------|
| Tier 1 | 60-120 min | $75 |
| Tier 2 | 121-240 min | $175 |
| Tier 3 | 241-480 min | $350 |
| Tier 4 | 481+ min | $600 |
| No Tier | < 60 min | $0 (denied) |

## 6. Reason Codes

### Approval Codes
| Code | Meaning |
|------|---------|
| `APPROVED_TIER_1` | Delay 60-120 min, tier 1 payout |
| `APPROVED_TIER_2` | Delay 121-240 min, tier 2 payout |
| `APPROVED_TIER_3` | Delay 241-480 min, tier 3 payout |
| `APPROVED_TIER_4` | Delay 481+ min, tier 4 payout |

### Denial Codes
| Code | Meaning |
|------|---------|
| `DENIED_INVALID_PRODUCT` | Product ID not found |
| `DENIED_INVALID_VERSION` | Version not found for product |
| `DENIED_OUTSIDE_WINDOW` | Claim filed too late |
| `DENIED_EXCLUSION` | Delay reason is excluded |
| `DENIED_NO_DELAY` | Delay below minimum threshold |

## 7. Value Proposition (Demo Narrative)

After viewing the demo, an insurer should believe:

1. **"Near-zero claims handling"** - Automation rate ~92%
2. **"Safer than spreadsheets"** - Versioned, traceable, testable
3. **"Auditable and defensible"** - Full decision trace + export
4. **"Start small"** - Sidecar integration, one benefit at a time

## 8. Non-Goals (Explicit Scope Boundaries)

- No enterprise RBAC/multi-tenant hardening
- No general-purpose policy modeling
- No payment rails or bank integrations
- No full claims workflow (focus is decisioning only)
- No real-time flight data (mock/deterministic for demo)

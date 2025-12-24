## Business Context Brief: "Decisioning Console" Demo MVP

### Background

We are developing a deterministic insurance decisioning engine that can represent insurance products and return payout determinations from parametric claim/event data.

### Core Problem to Solve

Insurers want solutions that either:

* **reduce claims costs** (automation, lower handling expense, reduce leakage/errors), or
* **increase market share** (faster product launch, better customer experience).

The key commercial risk is building a powerful engine without a validated buyer need ("solution looking for a problem"). The key product risk is drifting into a bespoke modeling/service business due to modeling complexity and maintenance burdens (Guidewire-like change pain).

### Goal of This Project

Create a **killer demo** that convinces insurer stakeholders that:

1. a parametric product can be configured quickly,
2. claims decisions can be returned instantly with a clear decision trace,
3. product updates (renewals) can be governed safely with versioning + impact visibility,
4. adoption can start with a low "blast radius" integration (i.e., sidecar decisioning for one benefit).

This demo is primarily to show an associate/stakeholder/investor, and later to support design-partner conversations with insurers.

### Strategic Decisions Made

**Market focus (initial wedge):**

* Start with **travel parametric insurance**, specifically **Flight Arrival Delay Benefit**, because it is:

  * narrow, high-frequency, and explainable,
  * integration-light compared to broad P&C,
  * a strong "straight-through processing" showcase.

**Buyer focus:**

* Stay close to **insurers** first (our background and credibility), rather than distributors/OTAs. (MGAs were explained as faster-moving product operators, but insurer remains the initial anchor.)

**Product shape:**

* Even if delivered via API, the demo must include a **minimal UI** to:

  * configure product parameters,
  * run simulations,
  * show decision trace and audit artifacts.
* We do **not** attempt a full policy admin platform or general-purpose modeling environment.

**Scope discipline:**

* The demo should present a **constrained product template** with guided configuration, not a complex rule/node builder.

### The Demo's "Value Proof" (what the viewer must believe)

After the demo, an insurer should believe:

* "This can cut claims handling effort for this benefit to near-zero."
* "This is safer to change than our current scattered rules/policy documents because it is versioned and traceable."
* "This is auditable/defensible (decision trace + exportable audit artifact)."
* "We can start small without rewriting core systems."

### Main Capabilities the Demo Must Demonstrate (high level)

* Product catalog with **status + versioning** (shows governance maturity).
* Guided product setup: configure **eligibility + tiers + exclusions + data source** (shows time-to-market).
* Claim simulator returning **decision + payout + reason codes + readable trace** (shows trust + automation).
* Change safety narrative: show that updates are **controlled and reviewable** (avoid renewal nightmare).

### Success Criteria (business)

* Internal stakeholder aligns on the MVP direction and narrative.
* The demo is credible enough to support outreach for a **design partner** (LOI/pilot discussion).
* We learn quickly whether insurers care more about:

  * reduced handling cost,
  * reduced disputes/leakage,
  * faster product iteration / competitive differentiation.

### Non-goals (explicit)

* No enterprise-grade SaaS maturity (RBAC depth, full compliance posture, multi-tenant hardening).
* No attempt to support "any policy/reinsurance treaty" in the demo UI.
* No full claims workflow or payment rails; focus is decisioning + trace.

### Why This Approach

We are optimizing for **validated demand** and **belief creation** rather than feature completeness. The narrative must sell ROI and defensibility in minutes, not showcase generic capability. This reduces the risk of building an over-engineered platform before the market pulls for it.

---

## Implementation Status (Updated: December 2024)

### Completed Work Packages

All four MVP work packages have been implemented and tested.

#### WP1: Core Demo Fixes [COMPLETE]
- Jest testing framework setup with TypeScript support
- Product store implementation with in-memory persistence and subscription pattern
- Template-to-Product creation flow
- Regression test runner for version comparison
- Publish workflow with version bumping

#### WP2: Rule Preview [COMPLETE]
- Visual decision flowchart component (`RulePreview.tsx`)
- Shows 5-step evaluation: Product Validation -> Flight Data -> Eligibility -> Exclusions -> Payout Tiers
- Pass/fail branches with color coding
- Payout tier visualization with delay ranges
- Exclusion list display
- Added as "Preview Rules" tab on product detail page

#### WP3: Metrics Dashboard [COMPLETE]
- Metrics service with simulated historical data
- Key metrics: total decisions, approval rate, automation rate, processing times
- Decision volume trend chart (7/14/30 day views)
- Payout distribution by tier
- Executive summary with business value narrative
- Enhanced version compare with computed change impact (flipped decisions, payout delta)

#### WP4: API Demo [COMPLETE]
- Decision API endpoint (`POST /api/decision`)
- Request validation with proper error handling
- Full decision response with trace, flight data, timing
- Interactive API tester page with example payloads
- Integration guide with cURL examples
- Audit artifact export functionality

### Test Coverage

**106 tests passing across 6 test suites:**
- `decision-engine.test.ts` - Core decisioning logic
- `regression-runner.test.ts` - Version regression testing
- `product-store.test.ts` - Product persistence
- `RulePreview.test.tsx` - Rule visualization component
- `metrics-service.test.ts` - Metrics calculations
- `route.test.ts` - API endpoint

---

## Technical Architecture

### Stack
- **Framework:** Next.js 16.1.0 with App Router
- **Runtime:** React 19.2.3
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS + shadcn/ui components
- **Testing:** Jest + React Testing Library

### Application Routes

| Route | Description |
|-------|-------------|
| `/` | Landing redirect to products |
| `/products` | Product catalog with status, versioning |
| `/products/[id]` | Product detail with config + rule preview tabs |
| `/products/[id]/versions` | Version history with regression testing |
| `/products/[id]/versions/compare` | Version diff with change impact |
| `/simulator` | Claim simulation with decision trace |
| `/metrics` | Executive metrics dashboard |
| `/api-demo` | Interactive API tester |
| `/api/decision` | REST API endpoint (POST) |

### Key Files

#### Engine Layer (`src/lib/engine/`)
| File | Purpose |
|------|---------|
| `types.ts` | Core type definitions (ProductConfig, ClaimInput, DecisionResult, etc.) |
| `decision-engine.ts` | 5-step claim evaluation, payout calculation, trace generation |
| `regression-runner.ts` | Run test packs against versions, detect decision flips |
| `metrics-service.ts` | Dashboard metrics, trend data, payout distribution |

#### Data Layer (`src/lib/data/`)
| File | Purpose |
|------|---------|
| `products.ts` | Product templates and configurations |
| `flights.ts` | Mock flight status database |
| `claims.ts` | Sample claim test cases |
| `product-store.ts` | In-memory product persistence with subscription pattern |

#### Components (`src/components/`)
| File | Purpose |
|------|---------|
| `RulePreview.tsx` | Visual decision flowchart |
| `MetricsDashboard.tsx` | Executive metrics with charts |
| `NewProductDialog.tsx` | Template-based product creation |
| `layout/Sidebar.tsx` | Navigation sidebar |
| `ui/*.tsx` | shadcn/ui base components |

#### Pages (`src/app/`)
| File | Purpose |
|------|---------|
| `products/page.tsx` | Product catalog list |
| `products/[id]/page.tsx` | Product detail with config/preview tabs |
| `products/[id]/versions/page.tsx` | Version history |
| `products/[id]/versions/compare/page.tsx` | Version diff with impact |
| `simulator/page.tsx` | Claim simulator |
| `metrics/page.tsx` | Metrics dashboard |
| `api-demo/page.tsx` | API tester UI |
| `api/decision/route.ts` | Decision API endpoint |

### Decision Engine Logic

The engine evaluates claims through 5 sequential steps:

1. **Product Validation** - Verify product exists and is active
2. **Flight Data Fetch** - Get flight status from mock database
3. **Eligibility Window** - Check claim is within allowed timeframe
4. **Exclusion Check** - Apply exclusion rules (force majeure, etc.)
5. **Payout Tier Match** - Calculate payout based on delay duration

Each step produces a trace entry with:
- `id` - Step identifier
- `rule` - Rule name
- `description` - Human-readable description
- `result` - 'pass' | 'fail' | 'skip'
- `explanation` - Why this result occurred

### Mock Data

**Flight Database** (`flights.ts`):
- BA123 (2024-12-20): 150 min delay, mechanical issues
- LH456 (2024-12-20): 390 min delay, crew shortage
- DL300 (2024-12-19): 95 min delay, force_majeure (excluded)
- AA789 (2024-12-19): 45 min delay, weather
- UA555 (2024-12-20): on_time, no delay

**Product Configuration** (`prod-eu-delay` v1.2):
- Eligibility: 72 hours from event
- Payout Tiers:
  - Tier 1: 60-120 min -> $50
  - Tier 2: 121-240 min -> $175
  - Tier 3: 241-480 min -> $350
  - Tier 4: 481+ min -> $600
- Exclusions: Force majeure, Acts of God (enabled by default)

---

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

---

## Demo Script Outline

1. **Products Page** (2 min)
   - Show product catalog with versioning
   - Create new product from template
   - Demonstrate quick configuration

2. **Product Detail** (2 min)
   - Review configuration parameters
   - Preview rules as visual flowchart
   - Show version history

3. **Simulator** (2 min)
   - Run claim with delayed flight
   - Show instant decision + trace
   - Export audit artifact

4. **Metrics Dashboard** (1 min)
   - Highlight automation rate (~92%)
   - Show decision volume trends
   - Business value narrative

5. **API Demo** (1 min)
   - Send test payload
   - Show JSON response with trace
   - Demonstrate integration simplicity

6. **Version Compare** (2 min)
   - Compare two versions
   - Show computed change impact
   - Regression test results

---

## Future Considerations (Not In MVP)

- Real flight data API integration (currently mocked)
- User authentication and RBAC
- Database persistence (currently in-memory)
- Multi-product support beyond flight delay
- Payment rails integration
- Webhook notifications

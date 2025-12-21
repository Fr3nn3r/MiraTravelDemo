## Business Context Brief: “Decisioning Console” Demo MVP

### Background

We are developing a deterministic insurance decisioning engine that can represent insurance products and return payout determinations from parametric claim/event data.

### Core Problem to Solve

Insurers want solutions that either:

* **reduce claims costs** (automation, lower handling expense, reduce leakage/errors), or
* **increase market share** (faster product launch, better customer experience).

The key commercial risk is building a powerful engine without a validated buyer need (“solution looking for a problem”). The key product risk is drifting into a bespoke modeling/service business due to modeling complexity and maintenance burdens (Guidewire-like change pain).

### Goal of This Project

Create a **killer demo** that convinces insurer stakeholders that:

1. a parametric product can be configured quickly,
2. claims decisions can be returned instantly with a clear decision trace,
3. product updates (renewals) can be governed safely with versioning + impact visibility,
4. adoption can start with a low “blast radius” integration (i.e., sidecar decisioning for one benefit).

This demo is primarily to show an associate/stakeholder/investor, and later to support design-partner conversations with insurers.

### Strategic Decisions Made

**Market focus (initial wedge):**

* Start with **travel parametric insurance**, specifically **Flight Arrival Delay Benefit**, because it is:

  * narrow, high-frequency, and explainable,
  * integration-light compared to broad P&C,
  * a strong “straight-through processing” showcase.

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

### The Demo’s “Value Proof” (what the viewer must believe)

After the demo, an insurer should believe:

* “This can cut claims handling effort for this benefit to near-zero.”
* “This is safer to change than our current scattered rules/policy documents because it is versioned and traceable.”
* “This is auditable/defensible (decision trace + exportable audit artifact).”
* “We can start small without rewriting core systems.”

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
* No attempt to support “any policy/reinsurance treaty” in the demo UI.
* No full claims workflow or payment rails; focus is decisioning + trace.

### Why This Approach

We are optimizing for **validated demand** and **belief creation** rather than feature completeness. The narrative must sell ROI and defensibility in minutes, not showcase generic capability. This reduces the risk of building an over-engineered platform before the market pulls for it.

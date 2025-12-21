## 1-Page Demo PRD — Decisioning Console (MVP Demo)

### Product Name

**Decisioning Console (Demo MVP)** — Parametric claims decisioning with traceable, versioned product logic.

### Objective

Create a **credible 7–10 minute demo** that makes an insurer believe:

1. A parametric product can be configured quickly (time-to-market),
2. A claim decision is instant and **explainable** (trust/audit),
3. Product updates are **safe and reviewable** (renewal/change governance),
4. Adoption can start small (low integration risk).

### Target Users (Personas)

* **Insurance Product Owner / Underwriting**: wants faster product iteration without heavy IT.
* **Claims Ops Lead**: wants lower handling cost and consistent decisions.
* **QA / Governance / Compliance**: wants controlled change, traceability, replay.
* Secondary: **Integration Engineer** (wants minimal integration surface).

### Scope Choice (Wedge)

**Flight Arrival Delay Benefit** (Travel parametric)
Why: narrow + repeatable + integration-light + strong “straight-through” story.

### Demo Narrative (Flow)

1. **Products list**: show versioned products (credibility/governance).
2. **Product setup**: configure delay tiers + eligibility + exclusions + data source (speed).
3. **Claim simulator**: run example claim → decision + payout + reason codes + readable trace (wow).
4. **Change safety**: compare versions + show “what changed / decision impact summary” (renewal antidote).

### In Scope (Demo Must-Haves)

* **Product catalog**: status (Draft/Active), active version, last updated, open/duplicate/compare.
* **Constrained product setup UI** (template-driven, not generic modeling):

  * payout tiers editor
  * eligibility window selector
  * data source selector (stub/live concept)
  * exclusions checkboxes (minimal)
  * reason codes mapping (simple table)
  * version indicator (vX.Y + hash)
* **Claim simulator**:

  * input fields (booking ref, flight no, date, passenger token)
  * “Run decision”
  * outputs: Approved/Denied, payout amount, reason codes, model version/hash
  * **Trace view**: step-by-step readable rule evaluation
  * **Export audit artifact** (e.g., “Download Audit JSON”)
* **Change safety screen**:

  * version compare summary
  * regression/test pack result summary (can be mocked)
  * “publish” concept with controlled change

### Out of Scope (Explicit)

* Generic “supports any contract + reinsurance” UI exposure
* Full claims workflow/case management
* Payment execution rails
* Enterprise SaaS hardening (multi-tenant security, deep RBAC, compliance packs)
* Complex integrations into core systems

### Success Criteria (What “Good” Looks Like)

* Internal associate agrees the demo is **credible** and aligned with insurer value.
* Demo viewers can repeat back the value proposition in their words:

  * “This reduces manual handling and improves defensibility.”
  * “Updates are safer than our current renewal process.”
* Next-step outcome: agreement to pursue **design partner** conversations (pilot/LOI + data access).

### Key Assumptions / Risks

* Assumption: insurers will value **trace + governance** as much as speed.
* Risk: UI looks like a policy admin system → triggers “Guidewire replacement” fear.
* Risk: over-explaining engine generality dilutes the wedge story.
* Risk: unclear ROI → mitigate by emphasizing handling cost reduction + safe change.

### Open Questions (Not blockers for demo, but track)

* Which insurer persona is the primary “hero” in the demo: Claims Ops vs Product Owner?
* What is the minimal “impact report” that feels believable (count of changed decisions, payout delta)?
* What level of external data realism is needed for credibility (stub vs real provider)?

### Deliverables (2 weeks)

* High-fidelity mock screens (1–4)
* Demo script (click path + talk track)
* Demo dataset (example claims/events) and “expected outcomes”

If you want, I’ll also produce a **demo script** (minute-by-minute + exact lines) that matches the PRD and keeps you from rambling into “engine theory.”

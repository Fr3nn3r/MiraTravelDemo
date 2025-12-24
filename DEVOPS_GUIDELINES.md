# DEV_OPS_GUIDELINES.md

## 1. Git Workflow
**Branching Strategy:** `type/task-id-description`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`.
- Example: `feat/T-101-user-auth-flow`
- **Rule:** Never push directly to `main`.

**Commit Protocol:**
- Atomic commits (one logical change per commit).
- Format: `[T-101] feat: add login validation logic`

## 2. Definition of Done (DoD)
A task is NOT complete until:
1.  **Code:** Implements requirements cleanly (SOLID). No unmanaged technical debt.
2.  **Unit Tests:** Added/Updated. Coverage must not decrease.
3.  **Local Check:** `npm run lint` and `npm run test:unit` pass locally.
4.  **E2E:** Playwright tests written for UI flows. (Run via CI).
5.  **Cleanup:** Unused comments/logs removed.

## 3. The Pull Request (PR) Protocol
**Before Creating PR:**
1.  Rebase on latest `main`: `git pull --rebase origin main`.
2.  Run full local build one last time.

**PR Description Template:**
- **Summary:** High-level overview of changes.
- **Key Decisions:** Why did you choose this architecture? (Trade-off explanation).
- **Verification:** How can the reviewer verify this? (Screenshots or reproduction steps).
- **Checklist:** [ ] Tests Pass [ ] Linter Pass [ ] No Secrets Committed.

**Review Process:**
- **Human/Agent Review:** Focus on logic holes, security, and scalability.
- **CI Gate:** PR cannot be merged if CI (Tests/Build) fails.

## 4. Testing Strategy
**Pyramid Approach:**
1.  **Unit Tests (80%):** Fast. Mock everything. Test logic/functions. (Run: Local + CI).
2.  **Integration Tests (15%):** Test DB queries / API routes. (Run: CI).
3.  **E2E Tests (5%):** Happy paths only. Login -> Checkout. (Run: CI on Preview).

## 5. Deployment & Environment
- **Preview:** Auto-deployed on PR creation. Used for manual verification & E2E.
- **Staging:** Deployed on merge to `main`.
- **Production:** Tagged release (e.g., `v1.0.0`).

## 6. Project Management (File-Based)
- **Source:** `/project-management/` directory.
- **Start:** Move ticket file from `/backlog` to `/in_progress`.
- **Update:** If requirements change, update the T-XXX.md file *first*.
- **Finish:** Move ticket file to `/done` in a standalone commit.
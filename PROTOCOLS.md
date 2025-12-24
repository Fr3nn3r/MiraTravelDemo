# PROTOCOLS.md
# Operational & Development Workflow

## 1. Project Management (The Board)
**Source of Truth:** The `/tasks` directory.

### Ticket Creation
**Goal:** Define clear requirements before coding starts.
1.  **Setup:**
    - Duplicate `tasks/T-000_TEMPLATE.md`.
    - Rename it to `tasks/01_backlog/T-{ID}-{description}.md`.
      *(Use a timestamp or incremental number for ID, e.g., T-101-add-login.md)*.
2.  **Define:**
    - **Context:** One sentence on user value/goal.
    - **Requirements:** Specific, binary (pass/fail) items.
    - **Acceptance:** Definition of Done (e.g., "E2E passed").

### Task Lifecycle
1.  **Pickup:**
    - Locate ticket in `/tasks/01_backlog/`.
    - **Move file** to `/tasks/02_active/`.
2.  **Development:**
    - Create branch `feat/{ticket-id}-{short-desc}`.
    - Implement code & tests.
    - Check off `[x]` items in the ticket file as you go.
3.  **Completion:**
    - Ensure all Acceptance Criteria in the ticket are met.
    - **Move file** to `/tasks/03_done/`.
    - Commit this file move as the final step of your work.

## 2. Git Workflow
**Branching Strategy:** `type/ticket-id-description`
- Types: `feat`, `fix`, `refactor`, `chore`, `docs`.
- Example: `feat/T-101-user-auth`

**Branch Safety Checklist (CRITICAL for parallel agents):**
Before every commit, verify you're on the correct branch:
1. Run `git branch --show-current`
2. Verify branch name matches your ticket (e.g., `feat/T-003-*` for T-003 work)
3. If on wrong branch, switch back: `git checkout feat/T-{YOUR_TICKET}-*`
4. Never commit to another agent's branch

**Commit Protocol:**
- Atomic commits.
- Format: `[T-101] feat: add login validation`

## 3. Definition of Done (DoD)
1.  **Code:** Complies with patterns in `TECH_STACK.md` & `CLAUDE.md`.
2.  **Tests:** Unit tests passed locally.
3.  **CI:** Automation checks passed on PR.
4.  **Cleanup:** No debug logs.

## 4. Environment
- **Local:** Use `.env.local` for sensitive keys.
- **Preview:** Automated Vercel deployments.
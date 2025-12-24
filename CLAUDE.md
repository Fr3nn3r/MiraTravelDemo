# CLAUDE.md
# Guidelines for AI Agent

## CRITICAL INSTRUCTION
- **ACTION PROTOCOL:**
  - **Complex Tasks:** 1. Plan -> 2. List Questions -> 3. Wait for Consent -> 4. Execute.
  - **Trivial Tasks (Typos, renames, small bugs):** Execute immediately.
- **CONCISION:** Be terse but **precise**. Do not sacrifice clarity on architectural decisions or trade-offs.
- **CONTEXT:** Reference `PROJECT_CONTEXT.md` for domain rules if knowledge is missing.

## 1. Design Philosophy: SOLID & SSOT
- **Architecture:** Strictly enforce SOLID principles.
  - *Frontend:* Components must be small and props-lean (ISP). API calls separated from UI (SRP).
  - *Backend:* Service layers decoupled from infrastructure (DIP).
- **SSOT (Single Source of Truth):** Logic/State exists in one place. No duplicate logic.
- **DRY:** Extract shared logic to utilities/services immediately.
- **Error Handling:** Fail fast and loudly. Never swallow exceptions without logging. Use custom error types.
- **Standard Libs:** Prefer stdlib over custom implementations (e.g., `hashlib`, `crypto`).

## 2. Naming & Self-Documenting Code
**Goal:** Code must explain *how* and *what*. Comments explain *why*.

- **Variable/Func Names:** Optimize for semantic density.
  - ❌ `data`, `list`, `flag`, `process()`
  - ✅ `pendingClaims`, `activePolicyList`, `shouldRetry`, `calculateRiskScore()`
- **Boolean:** Must read as a question/statement (`isValid`, `hasConsent`). No double negatives.
- **Units:** Encode units in names where ambiguous (`timeoutMs`, `priceUSD`).
- **No Types in Names:** `userList` ❌ -> `users` ✅.
- **Conventions:**
  - Python: `snake_case` (vars/funcs), `PascalCase` (classes).
  - JS/TS: `camelCase` (vars/funcs), `PascalCase` (classes).
  - Constants: `SCREAMING_SNAKE`.

## 3. Minimal Comment Policy
- **NO:** Explaining syntax, reiterating code, or "what" the code is doing.
- **YES:**
  - **Why:** Business logic rationale (e.g., `# >2yr claims are legally void`).
  - **Edge Cases:** Known limitations or assumptions.
  - **Weirdness:** Explaining non-standard approaches (e.g., `# Regex used due to malformed legacy input`).
- **Docs:** Public Interfaces/APIs require Docstrings (Args, Returns, Raises).

## 4. Development & Output
- **Complexity:** Anti-complexity. YAGNI (You Ain't Gonna Need It). Do exactly what is asked.
- **Refactoring:** If SSOT is violated, refactor before merging.
- **Testing:**
  - **Primary:** Write persistent Unit Tests (Jest/PyTest) covering new logic.
  - **Secondary:** Only use `scripts/` for temporary data exploration or one-off tasks.
- **Output:** ASCII-only (Use `[OK]` not `✓`).

## 5. Interaction Loop (Complex Tasks)
1. **Plan:** Propose approach.
2. **Questions:** List unresolved ambiguities.
3. **Execute:** Write code.
4. **Verify:** Check against SOLID/SSOT/Testing requirements.

## 6. Task Protocol
**Source of Truth:** The `/tasks` directory.

1.  **Start:**
    - Find ticket in `/tasks/01_backlog/`.
    - **Move** to `/tasks/02_active/`.
    - **Branch** `feat/{id}-{short-desc}`.

2.  **Finish:**
    - verify `[x]` requirements.
    - **Move** to `/tasks/03_done/`.
    - **Commit** the move.
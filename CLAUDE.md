# CLAUDE.md
# Guidelines for AI Agent

## CRITICAL INSTRUCTION
- **ACTION PROTOCOL:**
  - **Complex Tasks:** 1. Plan -> 2. List Questions -> 3. Wait for Consent -> 4. Execute.
  - **Trivial Tasks:** Execute immediately.
- **CONCISION:** Be terse but **precise**.
- **CONTEXT:**
  - **Technical:** Read `TECH_STACK.md` first.
  - **Domain:** Read `BUSINESS_CONTEXT.md` for glossary.
  - **Process:** **STRICTLY** follow `PROTOCOLS.md` for Git & Task moves.

## 1. Design Philosophy: SOLID & SSOT
- **Architecture:** Strictly enforce SOLID principles.
- **SSOT:** Logic/State exists in one place. No duplicate logic.
- **DRY:** Extract shared logic to utilities/services immediately.
- **Error Handling:** Fail fast and loudly. Never swallow exceptions.

## 2. Naming & Self-Documenting Code
- **Goal:** Code explains *how* and *what*. Comments explain *why*.
- **Naming:** Use terms from `BUSINESS_CONTEXT.md`.
- **Conventions:** Follow standard idioms for the language in use.
- **Booleans:** Must read as a question (`isValid`, `hasAccess`).

## 3. Minimal Comment Policy
- **NO:** Explaining syntax or "what" code does.
- **YES:** Business logic rationale ("Why"), Edge cases.
- **Docs:** Public Interfaces/APIs require standard documentation.
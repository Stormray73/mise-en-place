# Pipeline Quality Gates

An implementation is considered "Push-Ready" only when it satisfies all of the following gates:

## 1. The Implementation Gate

- All requirements in the target user story are implemented.
- Files follow [AGENT_ERGONOMICS.md](../../../docs/AGENT_ERGONOMICS.md) standards.
- Strict TypeScript typing is maintained (no `any`).

## 2. The Verification Gate (TDD)

- **Unit Tests**: Pass with 100% path coverage for new logic.
- **E2E Tests**: Corresponding Playwright spec passes consistently (3+ runs).
- **Regression**: Full domain test suite passes (all tests in the affected `__tests__/` and `tests/e2e/` scopes).

## 3. The Quality Gate (Static Analysis)

- **Linting**: `npm run lint` (or equivalent) returns zero errors and zero warnings.
- **Auto-Fix**: Use `eslint --fix` where possible, but manual fixes are required for logic/architectural lint issues.
- **Type Check**: `tsc --noEmit` passes with no errors.

## 4. The Review Gate (Fresh Eyes)

- A separate agent instance (via `invoke_agent`) using the `peer-reviewer` skill must return a **PASS**.
- All identified "Critical" and "Major" issues in the review report must be resolved.

## 5. The Documentation Gate

- Every directory touched during the process contains an updated (or new) `GEMINI.md`.
- Local documentation accurately reflects the final implementation, including any changes made during the "Fix" phase.

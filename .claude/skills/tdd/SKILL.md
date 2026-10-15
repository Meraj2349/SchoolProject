---
name: tdd
description: Test-driven development workflow for this school project (Express server with Jest + Supertest, Next.js frontend with Vitest + Testing Library). Use whenever adding a feature, fixing a bug, or changing behaviour in server/ or frontend/ — write the failing test first, make it pass, then refactor.
---

# Test-Driven Development

Every behaviour change starts with a failing test. No production code is written
without a test that needs it.

## The cycle

1. **Red** — write one small test for the next piece of behaviour. Run it and
   **see it fail for the right reason** (an assertion, not a typo or a bad import
   path you didn't intend). Paste the failure in your notes/PR.
2. **Green** — write the *simplest* code that makes it pass. Hard-coding is fine
   if the next test will force the generalisation.
3. **Refactor** — with all tests green, clean up names, duplication and layering
   (see the `clean-architecture` skill). Re-run the tests after every change.
4. Repeat. Commit at green.

For a **bug**: first write a test that reproduces it (red), then fix it.

## Commands

| Where | Run once | Watch mode | Coverage |
|---|---|---|---|
| `server/` | `npm test` | `npm run test:watch` | `npm run test:coverage` |
| `frontend/` | `npm test` | `npm run test:watch` | `npx vitest run --coverage` |

Run a single file: `npm test -- path/to/file.test.js`.

## Where tests live

Tests sit next to the code they test, named `*.test.js`:

```
server/src/modules/branch/domain/branch.entity.js
server/src/modules/branch/domain/branch.entity.test.js
frontend/src/store/branchStore.js
frontend/src/store/branchStore.test.js
```

Characterisation tests for legacy code outside `server/src` go in
`server/tests/unit/...`.

## What to test at each layer (server)

| Layer | Test style | Doubles |
|---|---|---|
| `domain/` | Pure unit tests, input → output / thrown `ValidationError` | none |
| `application/` (use cases) | Unit tests with **in-memory fake** repositories and storage | hand-written fakes (see `branch.usecases.test.js`) |
| `interface/` (controllers) | Supertest against a tiny Express app wrapping the controller | fake use cases |
| `infrastructure/` | Integration tests against a real MySQL (only when a DB is available) | none |

Prefer hand-written fakes over `jest.fn()` mocks: they test behaviour (state),
not call order, and survive refactors. In ESM test files import Jest APIs
explicitly: `import { describe, it, expect, jest } from "@jest/globals";`.

## Frontend

- Test **what the user sees**: `screen.getByRole(...)`, `getByText`, not class
  names or component internals.
- Zustand stores: drive them through `useXStore.getState()` actions and assert
  on state. `localStorage` is cleared after each test (`frontend/test/setup.js`).
- Services/hooks that call the API: mock the HTTP layer (`@/lib/httpClient`)
  with `vi.mock`, never hit the real backend.
- JSX lives in `.js` files; the Vitest config already handles that.

## Good tests

- One behaviour per test; the name says the behaviour in plain words
  ("rejects a branch without a name"), not the method name.
- Arrange / Act / Assert, separated by a blank line.
- No logic (loops, ifs) in tests. No shared mutable state between tests —
  rebuild fixtures in `beforeEach`.
- Deterministic: no real network, clock or randomness. Inject them.
- A test that never failed proves nothing — always watch it go red first.

## Definition of done

- [ ] New behaviour is covered by a test that was seen failing first
- [ ] `npm test` passes in every package you touched
- [ ] `npm run lint` passes in `frontend/` if you touched it
- [ ] No skipped (`.skip`/`.only`) or commented-out tests

---
name: test-driven-development
description: Use when implementing any feature, bug fix, refactor, or behavior change, before writing production code
---

# Test-Driven Development

## Core Rule

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

If production code exists before its test, discard that production change and restart from RED. Do not keep it as reference or adapt it while writing tests. Tests written afterward validate what code does; test-first defines what it must do.

## RED-GREEN-REFACTOR

| Phase | Required action |
|---|---|
| RED | Write one focused test for the next observable behavior using real code. |
| Verify RED | Run it. Confirm it fails, not errors, for the expected missing-behavior reason. |
| GREEN | Write only the minimum production change that makes the test pass. |
| Verify GREEN | Run the focused test and relevant broader tests. Require clean output. |
| REFACTOR | Improve structure only while all tests remain green. |

Repeat for the next behavior. Never combine multiple unproven behaviors in one cycle.

## Example

```typescript
test('rejects a blank account name', () => {
  expect(createAccount({ name: '  ' })).toEqual({ error: 'Name required' });
});
```

Run it before implementing validation. It must fail because blank names are still accepted, then add only the validation needed to pass.

## Exceptions

Skipping TDD requires explicit user approval and is limited to:

- Throwaway prototypes that will be discarded
- Generated code
- Configuration-only changes

Exploration is allowed, but discard exploratory production code before starting the real RED cycle.

## Rationalizations

| Excuse | Required response |
|---|---|
| “It is too small to test.” | Small behavior still regresses. Write the small test. |
| “Tests afterward protect the release.” | They do not prove the test detects the missing behavior. Restart at RED. |
| “Deleting working code wastes effort.” | Sunk cost does not make tests-after test-first. Discard it. |
| “Keep it as reference.” | Reference code biases the test and implementation. Do not retain it. |
| “Existing code has no tests.” | Add a characterization or regression test for the behavior being changed. |
| “I already manually tested it.” | Manual checks are not repeatable regression protection. |

## Red Flags

Stop and restart at RED when you see:

- Production code before a failing test
- A test that passes immediately
- A failure caused by setup, syntax, or environment errors
- Tests promised “later”
- Existing implementation retained as reference
- Manual verification used in place of automated RED

## Completion Checklist

- [ ] Each behavior had a focused test first
- [ ] Each test was observed failing for the expected reason
- [ ] Production changes were minimal
- [ ] Focused and relevant broader tests pass
- [ ] Refactoring stayed green
- [ ] Test output is clean

If any item is unchecked, the change is not complete.

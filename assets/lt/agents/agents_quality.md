Quality Agent – Testing & Reliability Charter

Prime Directive: Prevent regression, ensure confidence, and champion user trust by catching defects before they reach prod.

1. Testing Strategy

Layer

Tooling

Target

Unit

vitest + ts‑auto‑mock

Pure functions, utils

Integration

@testing‑library/react / supertest

Component logic, API routes

Contract

PactFlow

Service boundaries

E2E

Playwright

Critical user journeys

Visual

Chromatic

UI diffs per PR

Load

k6

API p95, error rates

2. Coverage Gates

Unit ≥ 90 % lines, branches.

Integration ≥ 75 % lines.

Thresholds enforced via vitest --coverage and nyc.

3. CI Pipeline Ownership

Workflows defined in .github/workflows/qa‑*.yml.

Failing test = red PR = your pager, not Ops.

Flaky tests must be quarantined within 24 h or deleted.

4. Non‑Functional Checks

Lighthouse CI on PR → score ≥ 85 performance, ≥ 90 a11y.

Dependency audit: pnpm audit --prod must pass.

Bundle size diff bot comments if increase > 5 KB.

5. Bug Workflow

Create GitHub Issue with STR, Expected, Actual, Env.

Add bug 🐞 label + affected package label.

Attach minimal repro (CodeSandbox or failing test branch).

Hotfix commits go to main; feature fixes go to develop.

6. Changelog Prefix

🐛 Fixed 062425-1135 quality/playwright: Silence 404 noise in image preloads.

7. Review Checklist



"Green builds are a feature, not a luxury."


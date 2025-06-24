Core Agent – Domain & Business Logic Playbook

Prime Directive: Solve the actual problem, not the symptom. Your code is the backbone of Z1; treat it accordingly.

1. Architectural Boundaries

🍰 Layer Cake

apps/*            ➜ Application orchestrators / API routes
└─ core/*         ➜ Pure business logic – **YOU LIVE HERE**
   ├─ domain/     ➜ Entities, Value Objects, Aggregates (DDD)
   ├─ services/   ➜ Stateless orchestration of domain rules
   └─ policies/   ➜ Cross‑cutting guards (auth, rate‑limits)

No React, no SQL, no HTTP – keep it framework‑agnostic.

Cross‑layer calls always downward; never import apps/* inside core/*.

🔄 Idempotency & Purity

Functions named calculate*, transform*, map* must be pure.

Side‑effect functions must return void and be located in core/tasks.

2. Coding Standards

Category

Rule

Language

TypeScript 5.x – "strict": true everywhere

Lint

@typescript-eslint/recommended-requiring-type-checking

Tests

vitest + ts‑up (100 % type‑safe mocks)

Docs

TSDoc on every public symbol

Patterns

Prefer FP + dependency injection over OOP singletons

🧩 Module Naming

Use kebab‑case for file names: calculate-total-price.ts.

Export a single symbol per file. Index‑barrels are forbidden.

3. Error Handling

Never throw raw strings – create an InvariantViolation subclass.

Use Result <T,E> or Either for recoverable workflows.

Centralised error maps live in core/errors.ts.

4. Performance Budget

Sync functions ➜ ≤ 1 ms median under unit test harness.

Async workflows ➜ stream where possible; avoid await Promise.all on > 50 items.

5. Changelog Drill‑Down

When logging domain changes, prefix with core:.

🐛 Fixed 062425-0941 core/pricing: Correct VAT rounding for EU edge‑cases.

6. Code Review Gotchas

Leakage: imports creeping in from UI/Data/Ops – block the PR.

Implicit casting: any as any is grounds for immediate rejection.

Business rules in controllers: bounce them back to core/services.

7. Golden Path Cheat‑Sheet

import { Money } from "@z1/core/domain";
import { calculateTotal } from "@z1/core/services";

export const checkout = (items: CartItem[], currency: ISO4217) => {
  const subtotal = items.reduce((acc, item) => acc.add(item.price), Money.zero(currency));
  return calculateTotal({ subtotal, country: "DE" });
};

That’s it. No express handlers, no ORM sorcery – just pure, portable logic ready for any adapter.


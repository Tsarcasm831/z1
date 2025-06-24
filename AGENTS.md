Z1 Agent Workflow – Master Guide

Mission StatementEmpower every contributor to ship resilient, traceable, future-proof code through a clear, no-nonsense playbook.

☰ Table of Contents

Global Environment Rules

Universal Changelog Policy

Five Official Agent Archetypes• Core Agent• UI Agent• Data Agent• Quality Agent• Ops Agent

Pull-Request Gate Checklist

Getting Help

Global Environment Rules

Requirement

Value

Runtime

Node.js ≥ 18.x

Package Mgr

pnpm 8.x (preferred) or npm 10.x

Lint

ESLint + Prettier (auto-run via Git hooks)

Git Hooks

Husky + lint-staged

After every environment change run:

node --version

If it prints anything other than v18.* – stop and fix your PATH.

🔒 Dependency Discipline

Never commit a package-lock.json and a pnpm-lock.yaml in the same PR.

External binaries belong in /tools, checked-in only if the license allows redistribution.

Universal Changelog Policy

Mandatory for every commit touching production code. No entry → no merge.

Timestamp format MMDDYY-HHMM (24-hour clock, local). Example: 062425-1422.

One of four sections per module:

✨ Added – new features / files

🛠 Changed – modifications / refactors

🐛 Fixed – bug squashes

🔥 Removed – deletions / deprecations

Keep the language short, active, past tense. Begin with the module path.packages/ui: Fixed button focus-ring bleed on Safari.

See docs/CHANGELOG.md for formatting examples.

Five Official Agent Archetypes

Each PR must declare one (and only one) of the following roles in its description:

Archetype

One-liner

Dedicated Spec

Core Agent

Owns domain & business logic

agents_core.md

UI Agent

Crafts all user-facing surfaces

agents_ui.md

Data Agent

Guards persistence & migrations

agents_data.md

Quality Agent

Breaks the build before users do

agents_quality.md

Ops Agent

Automates the road to prod

agents_ops.md

📌  Why roles? Because "full-stack" means everything and therefore nothing. Specialise, own, deliver.

Pull-Request Gate Checklist

Before requesting review, tick every box:



Fail one – fail all. The merge button hides until your checklist is spotless.

Getting Help

Slack #z1-dev-support – fastest human eyes.

Docs folder – if the answer isn’t there, add it once you learn.

Escalate early, escalate often. Surprises belong in birthday parties, not release nights.
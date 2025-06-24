UI Agent – Front‑End & Accessibility Handbook

Prime Directive: Delight users without betraying their trust or their assistive technologies.

1. Tech Stack

React 19 + TypeScript

Next.js 15 (app router, RSC)

Tailwind CSS v4 – purge enabled, JIT mode

Component library ⇒ shadcn/ui extended via @z1/ui‑primitives

2. Accessibility Non‑Negotiables

Every interactive element needs discernible text ‑ aria‑label alone is not enough.

Color contrast ≥ WCAG AA (use @z1/a11y‑lint).

Keyboard nav as first‑class citizen: Tab, Shift+Tab, Enter, Space.

Dynamic regions must fire aria‑live="polite" announcements.

Screen‑Reader Test Matrix

 Browser 

 SR 

 OS 

 Chrome 

 NVDA 

 Windows 11 

 Safari 

 VoiceOver 

 macOS 

 Firefox ESR 

 Orca 

 Ubuntu 

3. Component Conventions

File structure:

components/
 └─ cart/
    ├─ cart.tsx          (public entry)
    ├─ cart.styles.ts    (tailwind‑merge helpers)
    └─ cart.test.tsx

Export default React component; named exports for hooks/utilities only.

Props interface must extend ComponentPropsWithoutRef<'div'> unless unavoidable.

4. State Management

Prefer React Context + useReducer for view state.

Cross‑page/shared state ⇒ TanStack Query v6.

No Redux, no MobX – keep the bundle lean.

5. Testing Pyramid

 Layer 

 Tool 

 Coverage 

 Unit 

 vitest + @testing‑library/react 

 90 % lines

 Integration 

 Cypress component runner 

 Key flows

 E2E 

 Playwright 

 Smoke paths

CI fails if UI unit coverage < 90 %.

6. Performance Budgets

LCP ≤ 2.5 s over 4G on median device.

JS ≤ 150 KB gzipped per route.

CLS ≤ 0.1 – avoid layout shifts with aspect‑ratio.

7. Changelog Tagging

Prefix entries with ui:

✨ Added 062425-1013 ui/nav: Mobile slide‑out menu with trap‑focus.

8. Review Checklist



"Pixels are cheap, empathy is priceless."


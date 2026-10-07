---
target: home + compras flow
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:/home/mtocora26/Projects/trabajo/sg_chaterria_el_cocha/src/app/page.tsx"
target_fingerprint: "sha256:4adc01c0251a4faca4f67404539293f9ace487cedc027c1de1c24b7520cb7ef2"
target_path: /home/mtocora26/Projects/trabajo/sg_chaterria_el_cocha/src/app/page.tsx
timestamp: 2026-10-07T20-35-17Z
slug: src-app-page-tsx
---
Method: dual-agent. Target: src/app/page.tsx (home) + compras flow. Score 23/40 (Acceptable).
Priority issues:
- [P0] Mobile bottom nav unusable for admin: 10 columns at 11px (navegacion-principal.tsx:122-123). adapt, layout.
- [P1] No save-success moment, no loading.tsx/error.tsx. harden, delight.
- [P1] Weight is not the hero; no scale integration. shape, bolder.
- [P2] Home lacks single focus/hierarchy; section grid duplicates header nav. distill, typeset.
- [P2] Server-only validation, generic error message. clarify.
Detector: 2 findings, 0 confirmed (gray-on-color mostly FP but resting x button is stone-400 ~2.5:1; 11px nav label documented exception).
A11y notes: stone-400/stone-500/oro-600 on oro-100 contrast; missing aria-describedby on material selector error; total not announced.

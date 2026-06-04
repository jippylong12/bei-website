Please follow the `linear-project-workflow` skill.

Work in the current repository/workspace at `/Users/marcus.salinas/Programming/BEI/bei-webiste`.
Linear project: `BEI Next-Gen Brand Alignment` - `https://linear.app/jippylong12/project/bei-next-gen-brand-alignment-676301636cac`
Linear milestone: `Brand Source Of Truth`
Use this project as the source of truth. Do not select work from the global Linear issue list unless Marcus explicitly asks for global triage.

Implement this Linear milestone pass in order:
- `JIP-299`: Commit official brand guidelines and approved assets - https://linear.app/jippylong12/issue/JIP-299/commit-official-brand-guidelines-and-approved-assets
- `JIP-300`: Organize web and print brand assets - https://linear.app/jippylong12/issue/JIP-300/organize-web-and-print-brand-assets
- `JIP-301`: Create DESIGN.md brand implementation reference - https://linear.app/jippylong12/issue/JIP-301/create-designmd-brand-implementation-reference
- `JIP-302`: Create AGENTS.md brand compliance requirement - https://linear.app/jippylong12/issue/JIP-302/create-agentsmd-brand-compliance-requirement

Context:
- The official brand guide is `BEI_Brand_Guidelines.pdf` at the repository root.
- Organized web assets should live under `public/brand/`.
- Print/source PDFs and the asset map should live under `docs/brand-assets/`.
- `DESIGN.md` should summarize brand voice, colors, typography, logo rules, imagery direction, and implementation constraints.
- `AGENTS.md` should make `DESIGN.md` and `BEI_Brand_Guidelines.pdf` mandatory for future work.
- No UI implementation should happen in this milestone pass.

Classify the work state as `non-ui-code`.

Completion rules:
- For investigation-only work, report findings, comment on Linear with evidence, and move the issue to Done if acceptance criteria are met.
- For non-UI code work, run relevant automated validation, comment on Linear with results, and move completed issues to Done.
- For UI code work, run automated validation, provide a concrete manual test script, and wait for Marcus's manual approval before moving issues to Done.
- For blocked work, comment on Linear with the blocker and keep the issue open.

Work milestone-first: complete/update each included issue as its acceptance criteria are met, then continue to the next ready included issue. Perform code handoff actions or workspace cleanup only if Marcus explicitly requests those actions.

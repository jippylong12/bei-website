Please follow the `linear-project-workflow` skill.

We are working in `/Users/marcus.salinas/Programming/BEI/bei-webiste`.
Linear project: `BEI Next-Gen Brand Alignment` - `https://linear.app/jippylong12/project/bei-next-gen-brand-alignment-676301636cac`
Linear milestone context: `Visual System Alignment`
Use this project as the source of truth. Do not select work from the global Linear issue list unless Marcus explicitly asks for global triage.

Completed and updated in Linear:
- `JIP-299`: Commit official brand guidelines and approved assets
- `JIP-300`: Organize web and print brand assets
- `JIP-301`: Create DESIGN.md brand implementation reference
- `JIP-302`: Create AGENTS.md brand compliance requirement

Relevant code references:
- `BEI_Brand_Guidelines.pdf`: Official brand guideline source.
- `DESIGN.md`: Implementation reference for brand voice, colors, typography, logo use, imagery, and UI tone.
- `AGENTS.md`: Repo instruction requiring future work to follow `DESIGN.md` and the brand guideline PDF.
- `public/brand/`: Web-ready SVG/PNG brand assets.
- `docs/brand-assets/`: Print/source PDFs and asset map.

Current context:
- The current site still uses exploratory themes and non-brand typography/colors.
- Tiempos is required by the brand guide when licensed webfont files are available. Until then, use a high-contrast serif fallback such as Georgia or Source Serif. Inter is the body/interface font.
- UI code changes require automated validation, a concrete manual test script, and Marcus approval before Linear issues move to Done.
- Do not use Browser or browser automation unless Marcus explicitly asks for it in the current request.

Recommended next milestone pass:
- `JIP-303`: Replace exploratory theme system with BEI brand system - https://linear.app/jippylong12/issue/JIP-303/replace-exploratory-theme-system-with-bei-brand-system
- `JIP-304`: Apply official color palette and contrast rules - https://linear.app/jippylong12/issue/JIP-304/apply-official-color-palette-and-contrast-rules
- `JIP-305`: Implement typography stack with Tiempos fallback and Inter - https://linear.app/jippylong12/issue/JIP-305/implement-typography-stack-with-tiempos-fallback-and-inter
- `JIP-306`: Apply primary logo, secondary mark, favicon, and minimum-size rules - https://linear.app/jippylong12/issue/JIP-306/apply-primary-logo-secondary-mark-favicon-and-minimum-size-rules

Validation already run:
- `npm run build`: passed during brand-source setup.
- `git diff --check`: passed during brand-source setup.

UI/manual verification:
- No UI code changed in the brand-source setup milestone.
- The next milestone is UI-code and must wait for Marcus manual approval before moving issues to Done.

Closeout state:
- Brand-source setup files are ready to commit on `codex/next-gen`.
- Linear project, milestones, and issues exist.
- Please inspect the current Linear project, milestone, issue bodies, and existing code first, then implement the next milestone pass in order.

You are starting implementation of a new physics simulation for the physics-sims project.

**Sim slug:** $ARGUMENTS

## Startup workflow — follow in this exact order before writing any code

**Step 1 — Read the brief:**
Read `$ARGUMENTS/BRIEF.md`. This is the primary spec: physics decisions, UX decisions, canvas layout, color language, edu panel topics, and which reference sims to consult.

**Step 2 — Read project conventions:**
Read `AGENTS.md`. Focus on:
- *Key Conventions* (bottom section) — file structure, CSS rules, p5.js CDN version
- *Quantum series conventions* if this is a quantum sim
- *Layout Compatibility Notes* — which layout class to use and why
Skip the Completed sim entries in the Roadmap.

**Step 3 — Read the primary reference sim:**
Read `sketch.js` from whichever sim the BRIEF names as the layout/style anchor. This gives you the exact code patterns to match (computeGeometry, readControls, updateEduPanel, EDU object, draw loop structure).

**Step 4 — Confirm before coding:**
Briefly state your understanding of:
- (a) The physics being visualized and the key formula(s)
- (b) Canvas layout (which regions, what's in each)
- (c) Controls and what they drive
- (d) Edu panel content (how many modes, what each explains)

Then proceed to implementation.

## Files to produce

- `$ARGUMENTS/meta.json`
- `$ARGUMENTS/index.html` (use layout-c for quantum sims unless BRIEF says otherwise)
- `$ARGUMENTS/style.css`
- `$ARGUMENTS/sketch.js`
- Update root `index.html`: add slug to `SIM_SLUGS` array and an entry to `SIM_COLORS`

## After building

- Update `AGENTS.md` Roadmap with a compact "Completed" entry (3–5 bullet points)
- Add sim to the inventory table in `AGENTS.md`
- Note that `preview.webp` needs capturing: `node scripts/capture-previews.js $ARGUMENTS`
- Commit with a descriptive message following the pattern in `git log --oneline -5`

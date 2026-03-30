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
- (e) Which edu modes have a canonical parameter set that best demonstrates the described phenomenon

Then proceed to implementation.

## Files to produce

- `$ARGUMENTS/meta.json`
- `$ARGUMENTS/index.html` (use layout-c for quantum sims unless BRIEF says otherwise)
- `$ARGUMENTS/style.css`
- `$ARGUMENTS/sketch.js`
- Update root `index.html`: add slug to `SIM_SLUGS` array and an entry to `SIM_COLORS`

## Edu panel ↔ sim state convention

Each edu mode button should **auto-set the sim parameters** to immediately demonstrate
the phenomenon described in that panel. Implement a `setSliders(...)` helper and call it
from `setEduMode()` for any mode that has a canonical parameter set.

Requirements:
- The BRIEF must specify canonical parameters for each edu mode that needs them.
- `setEduMode(m)` calls `setSliders(eRatio, v0, l)` (or equivalent) before calling
  `updateEduPanel(m)`, then resets dirty-detection flags so the new values take effect.
- Each edu panel that auto-sets parameters includes a **`.param-hint`** block — a short
  styled line (blue border for ψ/quantum, teal border for probability/resonance) that
  tells the user what was set and what to interact with next. Use the `.param-hint` and
  `.param-hint-teal` CSS classes defined in `quantum-tunneling/style.css` as the template
  (copy those classes into each new sim's own `style.css`).
- Edu modes that describe general phenomena without a unique canonical parameter set
  (e.g., "Applications") do not need to auto-set parameters — leave the sim as-is.

## After building

- Update `AGENTS.md` Roadmap with a compact "Completed" entry (3–5 bullet points)
- Add sim to the inventory table in `AGENTS.md`
- Note that `preview.webp` needs capturing: `node scripts/capture-previews.js $ARGUMENTS`
- Commit with a descriptive message following the pattern in `git log --oneline -5`

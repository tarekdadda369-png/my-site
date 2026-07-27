# DESIGN.md — service.co.im

The design language for Tarik Dadda's site. **Read this before changing any
UI.** Most rules here are asserted by the browser test (see Enforcement).

The system is called **Pulse**: the Ledger structure (sharp edges, serif
display, hairline rules) recoloured and recharged around the n8n palette —
raspberry `#ea4b71` on ink-navy `#07080f` — with a living canvas backdrop and
a reticle cursor.

It began as an adaptation of the Linear analysis in
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(kept at `DESIGN-reference-linear.md` for provenance). Pulse keeps Linear's
structural discipline — a surface ladder, hairline borders, one scarce accent —
and deliberately breaks with it on shape, type, colour and atmosphere. Where
the two disagree, **this file wins**.

---

## The six rules

1. **Every rectangle is square.** 0px, everywhere: buttons, cards, panels,
   inputs, tabs, chips, message bubbles, diagram nodes. The global reset sets
   `border-radius: 0` so corners must be opted into, never inherited. Only
   genuine circles stay round — avatars, status dots, the logo mark, and
   pictogram glyphs whose shape depends on it.
2. **One accent: n8n raspberry `#ea4b71`.** Primary CTA, eyebrow rules,
   metrics, section numbers, focus rings, active nav, the AI-core node.
   White text on raspberry, exactly as n8n sets it. The canvas particles may
   additionally use a violet `rgba(122,91,234,…)` at low alpha — it exists
   only inside the motion canvas, never on UI.
3. **Ink-navy, not black.** The canvas is `#07080f` with navy-tinted
   surfaces stepping up from it. Text is off-white `#fcfcfd`.
4. **Serif display, sans interface, mono labels.** Instrument Serif carries
   headlines and large numerals. IBM Plex Sans carries body and dense UI.
   IBM Plex Mono carries every label, button, eyebrow, and technical meta.
5. **The page has a backdrop.** Never a flat fill. Ruled lines, a raspberry
   bloom, a vignette, film grain — plus the canvas flow-field and a reticle
   cursor that locks onto anything interactive.
6. **Depth is hairlines and surface lift.** No drop shadows. The only "shadow"
   is a 1px inset top-edge highlight (`--edge`) on lifted panels.

## Tokens

### Surfaces — ink-navy ladder

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#07080f` | Page background |
| `--surface-1` | `#0d0f1a` | Cards, panels, lifted sections |
| `--surface-2` | `#121525` | Panel bars, inputs, incoming messages |
| `--surface-3` | `#181c30` | Hovered cards, callouts, status chips |
| `--surface-4` | `#1f2440` | Deepest lift — selected tab |
| `--hairline` | `#21263c` | Default 1px borders |
| `--hairline-strong` | `#2e3552` | Buttons, inputs, stronger divisions |
| `--hairline-bright` | `#414a70` | Link underlines, list rules |

Lifted sections and panels use **translucent** surface colours
(`rgba(13,15,26,0.78)` and similar) so the canvas motion and backdrop read
through them. An opaque panel would black out the particles passing behind it.

### Ink — bone

| Token | Value | Use |
|---|---|---|
| `--ink` | `#fcfcfd` | Headlines, emphasised body |
| `--ink-muted` | `#c8ccdc` | Lead paragraphs, message text |
| `--ink-subtle` | `#8b90a6` | Body copy, nav |
| `--ink-tertiary` | `#5e647d` | Captions, mono meta, icon rest state |

### Raspberry (n8n Mandy)

| Token | Value | Use |
|---|---|---|
| `--accent` | `#ea4b71` | Primary CTA fill, eyebrow rule, metrics, focus |
| `--accent-hover` | `#ff7195` | Hover states, link emphasis, packets |
| `--accent-deep` | `#b73557` | Pressed CTA |
| `--on-accent` | `#ffffff` | Text **on** raspberry |
| `--success` | `#3dbb85` | Status dots only. |

### Type

| Role | Family | Size | Notes |
|---|---|---|---|
| display-xl | Instrument Serif | `clamp(2.9rem, 6.2vw, 5.25rem)` | -0.018em |
| h1 | Instrument Serif | `clamp(2.3rem, 4.4vw, 3.75rem)` | -0.016em |
| h2 | Instrument Serif | `clamp(1.9rem, 3.1vw, 2.75rem)` | -0.014em |
| h3 / card title | IBM Plex Sans 500 | 17px dense, 20px in `.card--wide` | |
| body | IBM Plex Sans 400 | 15px / 1.6 | |
| eyebrow | IBM Plex Mono 500 | 11px | uppercase, +0.18em, raspberry rule before |
| button | IBM Plex Mono 500 | 13px | uppercase, +0.09em |
| caption / meta | IBM Plex Mono 400 | 12px | |

Serifs need far less negative tracking than a grotesque — the display values
above are roughly half what a sans would take at the same size.

The fallback stack matters: `'Iowan Old Style', 'Palatino Linotype', Georgia,
'Times New Roman', serif`. If Google Fonts is blocked the page still renders in
a classic serif rather than collapsing to Arial.

### Spacing & frame

4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48, section rhythm
`clamp(64px, 8vw, 104px)`. Content max width 1240px. Header 60px.

## The backdrop & cursor

Layering, bottom to top:

- `body::before` (z −2): raspberry bloom, vignette, ruled lines.
- `.bg-motion` (z −1): **the motion background** — a canvas flow-field of
  raspberry/violet particles drifting through curl noise, leaving comet
  trails. Generated live: weighs nothing, loops forever, never buffers, and
  matches the palette exactly. Paused on hidden tabs; absent on touch and
  under reduced motion, where the static backdrop carries the texture alone.
- content
- `.cursor` (z 80): **the reticle** — a centre dot inside four corner
  brackets that trails the pointer. It idles rotated 45° (a diamond, echoing
  the sharp-edge system) and locks square + raspberry onto anything
  interactive; over text fields it opens wide and fades so it never fights
  the caret. The native cursor is hidden only after JS confirms the reticle
  is live (`html.cursor-live`), so a script failure can never leave the user
  cursorless. Touch and reduced-motion users keep the native cursor.
- `body::after` (z 90): film grain.

## Do

- Set headlines in the serif, sentence case.
- Let cards share hairlines with their neighbours — the grid reads as a ruled
  table, not as floating tiles.
- Let the conic sweep on the CTA border be the one framing flourish.
- Keep metrics, contact details and process steps on hairline rules.
- Put white text on raspberry, as n8n does.

## Don't

- Don't round anything. If a corner looks soft, it is a bug.
- Don't add a second accent hue, a gradient text fill, or a drop shadow.
- Don't make panels fully opaque — it kills the backdrop and the light.
- Don't set body copy in the serif, or headlines in the mono.
- Don't ship a light theme.

## Motion

Motion is purposeful, not decorative. It is spent on things that explain the
product, and withheld everywhere else.

**The animatic** is the centrepiece: a five-beat sequence following one
customer message from arrival to done. It is an `anime` timeline built with
`autoplay: false` and scrubbed by scroll position, so the viewer controls
playback in both directions and can stop on any beat.

Everything else:

- One reveal gesture: 12px rise + fade, ~560ms, `outExpo`.
- The hero headline and every section heading resolve word by word.
- Card icons draw themselves on, stroke by stroke.
- The hero diagram draws its wires once, then loops travelling packets.
- The demo panel replays a conversation with typing indicators.
- Navigation dissolves the outgoing page rather than blinking to white.
- The reticle cursor trails the pointer and locks onto interactive elements.
- Mono labels (eyebrows, panel names) decode out of glyph noise on entry.
- A raspberry arc perpetually sweeps the CTA border (conic `@property`
  animation; browsers without support just show the static border).
- Primary CTAs lean a few pixels toward the pointer — attraction, not
  elasticity.

Still banned: parallax, spring hovers, anything that moves on its own without
explaining something.

### Motion must never be load-bearing

Every sequence has a static finished state that renders without JS:

- `prefers-reduced-motion` renders everything at its final state, the animatic
  never engages its scroll track, and the cursor light is hidden.
- The animatic's timeline is built **before** `is-live` is added to the track.
  If construction throws, the class never lands, the track stays a normal
  block, and CSS shows the completed scene.
- Elements revealed by drawing (wires, icons) must not also be hidden by
  opacity, or they never appear. Opacity-driven scene ids use the `a-` prefix
  and draw-driven ids use `w-`; the CSS reset targets `a-` only.

## Enforcement

`.check.js` (dev-only, not shipped) runs headless Chromium over all eight pages
and fails on:

- any element with `border-radius > 0.5px` among buttons, cards, panels, CTAs,
  tabs, chips, inputs, threads and messages
- any surviving blue/indigo colour on buttons, eyebrows, metrics, stats, step
  numbers, links or chevrons
- a backdrop with fewer than 3 gradient layers, or a missing `.cursor-light`
- any legacy icon-tile element
- console errors, horizontal overflow, or text left invisible after scrolling

It also verifies the animatic scrubs monotonically and reverses, the cursor
light tracks the pointer on `screen` blend and is hidden on touch and under
reduced motion, and that the site still works with the vendor bundles blocked
and with `script.js` blocked.

# DESIGN.md — service.co.im

The design language for Tarik Dadda's site. **Read this before changing any
UI.** Most rules here are asserted by the browser test (see Enforcement).

The system is called **Ledger**: warm ink, bone text, antique brass, square
corners, a serif display voice, and a page that has an actual backdrop.

It began as an adaptation of the Linear analysis in
[VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(kept at `DESIGN-reference-linear.md` for provenance). Ledger keeps Linear's
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
2. **One accent: antique brass `#c2a15b`.** Primary CTA, eyebrow rules,
   metrics, section numbers, focus rings, active nav, the AI-core node. No
   blue, no indigo, no second hue, no gradient ramps.
3. **Warm, not neutral.** The canvas is `#100e0b` — ink with an amber cast,
   never blue-black and never pure `#000`. Text is bone `#f0eadd`, not white.
4. **Serif display, sans interface, mono labels.** Instrument Serif carries
   headlines and large numerals. IBM Plex Sans carries body and dense UI.
   IBM Plex Mono carries every label, button, eyebrow, and technical meta.
5. **The page has a backdrop.** Never a flat fill. Ledger rules, a warm bloom,
   a vignette, paper grain — plus a brass light that follows the pointer.
6. **Depth is hairlines and surface lift.** No drop shadows. The only "shadow"
   is a 1px inset top-edge highlight (`--edge`) on lifted panels.

## Tokens

### Surfaces — warm ink ladder

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#100e0b` | Page background |
| `--surface-1` | `#17140f` | Cards, panels, lifted sections |
| `--surface-2` | `#1d1a14` | Panel bars, inputs, incoming messages |
| `--surface-3` | `#24201a` | Hovered cards, callouts, status chips |
| `--surface-4` | `#2b261e` | Deepest lift — selected tab |
| `--hairline` | `#2e2a22` | Default 1px borders |
| `--hairline-strong` | `#403a2e` | Buttons, inputs, stronger divisions |
| `--hairline-bright` | `#554c3b` | Link underlines, list rules |

Lifted sections and panels use **translucent** surface colours
(`rgba(23,20,15,0.78)` and similar) so the backdrop and the cursor light read
through them. An opaque panel would black out the light passing behind it.

### Ink — bone

| Token | Value | Use |
|---|---|---|
| `--ink` | `#f0eadd` | Headlines, emphasised body |
| `--ink-muted` | `#cfc5b2` | Lead paragraphs, message text |
| `--ink-subtle` | `#9a9080` | Body copy, nav |
| `--ink-tertiary` | `#6f6656` | Captions, mono meta, icon rest state |

### Brass

| Token | Value | Use |
|---|---|---|
| `--accent` | `#c2a15b` | Primary CTA fill, eyebrow rule, metrics, focus |
| `--accent-hover` | `#d9be83` | Hover states, link emphasis |
| `--accent-deep` | `#8e7134` | Pressed CTA |
| `--on-accent` | `#14110c` | Text **on** brass — dark ink, never white |
| `--success` | `#8aa06e` | Muted sage. Status dots only. |

### Type

| Role | Family | Size | Notes |
|---|---|---|---|
| display-xl | Instrument Serif | `clamp(2.9rem, 6.2vw, 5.25rem)` | -0.018em |
| h1 | Instrument Serif | `clamp(2.3rem, 4.4vw, 3.75rem)` | -0.016em |
| h2 | Instrument Serif | `clamp(1.9rem, 3.1vw, 2.75rem)` | -0.014em |
| h3 / card title | IBM Plex Sans 500 | 17px dense, 20px in `.card--wide` | |
| body | IBM Plex Sans 400 | 15px / 1.6 | |
| eyebrow | IBM Plex Mono 500 | 11px | uppercase, +0.18em, brass rule before |
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

## The backdrop

Three fixed layers, all `pointer-events: none`:

- `body::before` (z −2): warm bloom from the top, a vignette that drops the
  edges away, and ledger rules — horizontal at 2.1% and vertical at 1.2%
  opacity on a 46px pitch.
- `body::after` (z 70): SVG-turbulence paper grain at 5%, `overlay` blend.
- `.cursor-light` (z 60): a 560px brass radial on `screen` blend that trails
  the pointer, so it **lifts** whatever it passes over rather than washing it
  out. Eased with a rAF lerp that parks itself once it catches up.

The light is a pointer affordance: it is hidden on touch (`hover: none`) and
under `prefers-reduced-motion`.

## Do

- Set headlines in the serif, sentence case.
- Let cards share hairlines with their neighbours — the grid reads as a ruled
  table, not as floating tiles.
- Use the brass corner marks on the CTA panel as the one framing flourish.
- Keep metrics, contact details and process steps on hairline rules.
- Put dark ink on brass, never white.

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
- The cursor light trails the pointer.

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

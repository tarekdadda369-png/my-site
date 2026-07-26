# DESIGN.md — service.co.im

The design language for Tarik Dadda's site. Adapted from the Linear design
analysis in [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md)
(the original is kept verbatim at `DESIGN-reference-linear.md`).

Read this before changing any UI. Every rule here is enforced somewhere in
`my-site/styles.css`, and the browser test asserts the four hard bans.

---

## The five rules

1. **Depth comes from a surface ladder and hairline borders.** Never from drop
   shadows, glows, or atmospheric gradients. A card is one step up from the
   canvas with a 1px border — that is the whole mechanism.
2. **One chromatic accent.** `#5e6ad2`, used scarcely: brand mark, primary CTA,
   focus ring, link emphasis, the AI-core node in the diagram. Never a card
   fill, never a section background, never a second hue alongside it.
3. **Shape is a hierarchy, not a mood.** Buttons and inputs 8px. Cards 12px.
   Panels 16px. Pills are reserved for status badges, tabs and avatars.
   **CTAs are never pill-rounded.**
4. **Icons are bare stroked glyphs.** 18px, 1.5px stroke, `--ink-subtle`,
   brightening to accent on card hover. **No boxed, tinted or filled icon
   containers.**
5. **Display type tracks tight, the eyebrow tracks open.** Display runs
   -0.0375em at the largest size; the eyebrow is the one element with positive
   tracking (+0.4px), which is what marks it as taxonomy.

## Tokens

### Surfaces

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#010102` | Page background |
| `--surface-1` | `#0f1011` | Cards, panels, lifted sections |
| `--surface-2` | `#141516` | Hovered cards, panel bars, inputs |
| `--surface-3` | `#18191a` | Nested surfaces, avatars, tags |
| `--surface-4` | `#191a1b` | Deepest lift — selected tab |
| `--hairline` | `#23252a` | Default 1px borders |
| `--hairline-strong` | `#34343a` | Hovered borders, focus |
| `--hairline-tertiary` | `#3e3e44` | Nested borders |

Never skip a level in the ladder.

### Ink

| Token | Value | Use |
|---|---|---|
| `--ink` | `#f7f8f8` | Headlines, emphasised body |
| `--ink-muted` | `#d0d6e0` | Lead paragraphs, labels |
| `--ink-subtle` | `#8a8f98` | Body copy, nav links |
| `--ink-tertiary` | `#62666d` | Captions, meta, mono labels |

### Accent

| Token | Value | Use |
|---|---|---|
| `--accent` | `#5e6ad2` | Primary CTA, brand mark, eyebrow, core node |
| `--accent-hover` | `#828fff` | CTA hover, link emphasis, travelling packets |
| `--accent-focus` | `#5e69d1` | Focus ring, pressed CTA |
| `--success` | `#27a644` | Status dots only — the sole semantic colour |

### Type

`Inter` 400/500/600 for everything, `JetBrains Mono` 400 for technical labels
(index numbers, panel names, timings). Mono never sets body copy.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| display-xl | `clamp(2.25rem, 5vw, 4.25rem)` | 600 | -0.0375em |
| display-lg / h1 | `clamp(2rem, 3.6vw, 3.5rem)` | 600 | -0.032em |
| display-md / h2 | `clamp(1.6rem, 2.6vw, 2.5rem)` | 600 | -0.025em |
| headline | `clamp(1.35rem, 2vw, 1.75rem)` | 600 | -0.021em |
| card title | 17px in dense grids, 22px in `.card--wide` | 500 | -0.012em |
| body | 16px | 400 | -0.05px |
| body-sm | 14px | 400 | 0 |
| caption / button | 12px / 14px | 400 / 500 | 0 |
| eyebrow | 13px | 500 | **+0.4px** |

Display weight ceiling is 600. Never 700.

### Spacing

4px base: 4 · 8 · 12 · 16 · 24 · 32 · 48, section rhythm `clamp(64px, 8vw, 96px)`.
Card padding 24px. CTA banner padding 48px. Content max width 1280px.

## Do

- Separate sections by lifting onto `.section--lift`, not by adding gaps.
- Let the pipeline diagram and the conversation replay be the protagonists —
  they are this site's equivalent of product screenshots.
- Put the faint top-edge highlight (`--edge`) on lifted panels. It is the only
  "shadow" in the system.
- Keep metric rows and contact details on hairline rules rather than in boxes.
- Set headlines in sentence case.

## Don't

- Don't pill-round a CTA.
- Don't put an icon in a coloured or bordered tile.
- Don't add a second accent hue, a gradient text fill, or an aurora blob.
- Don't reach for a drop shadow or a glow to create hierarchy.
- Don't ship a light theme — this system is dark-only.
- Don't set headlines in all-caps.

## Motion

Motion is purposeful, not decorative. It is spent on things that explain the
product, and withheld everywhere else.

**The animatic** is the centrepiece: a five-beat sequence following one
customer message from arrival to done. It is an `anime` timeline built with
`autoplay: false` and scrubbed by scroll position, so the viewer controls
playback in both directions and can stop on any beat. Beats are captioned and
tracked by a five-segment indicator in the panel bar.

Everything else:

- One reveal gesture: 12px rise + fade, ~560ms, `outExpo`.
- The hero headline and every section heading resolve word by word.
- Card icons draw themselves on, stroke by stroke.
- The hero diagram draws its wires once, then loops travelling packets.
- The demo panel replays a real conversation with typing indicators.
- Navigation dissolves the outgoing page rather than blinking to white.

Still banned: parallax, cursor-tracked glow, spring hovers.

### Motion must never be load-bearing

Every sequence has a static finished state that renders without JS:

- `prefers-reduced-motion` renders everything at its final state and the
  animatic never engages its scroll track.
- The animatic's timeline is built **before** `is-live` is added to the track.
  If construction throws, the class never lands, the track stays a normal
  block, and CSS shows the completed scene.
- Elements revealed by drawing (wires, icons) must not also be hidden by
  opacity, or they never appear. Keep opacity-driven ids under the `a-`
  prefix and draw-driven ids under `w-`; the CSS reset targets `a-` only.

## Enforcement

`.check.js` (dev-only, not shipped) asserts on every page that there are zero
pill-radius CTAs, zero icon-tile elements, and zero accent-coloured glow
shadows — plus no console errors, no horizontal overflow, and no element left
invisible after scrolling.

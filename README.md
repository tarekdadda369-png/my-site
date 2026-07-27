# service.co.im — Tarik Dadda

Marketing site for a custom AI-automation studio serving businesses in Algeria.

Static HTML, CSS and vanilla JS. No build step, no framework, no runtime
dependency on any CDN — deploy the `my-site/` folder as-is.

**Read [`DESIGN.md`](DESIGN.md) before changing any UI.** The design system is
called *Pulse* — the n8n palette (raspberry `#ea4b71` on ink-navy) on sharp
square edges, a serif display voice, a live canvas motion background, and a
reticle cursor that locks onto anything interactive. Its rules are enforced by
the browser test described below.

---

## Structure

```
DESIGN.md                   The design system — read this first
DESIGN-reference-linear.md  The upstream Linear analysis it was adapted from
my-site/
  index.html          Home — hero, pipeline panel, services, animatic, demo, process, FAQ
  services.html       Full service breakdown (anchors: #instagram #whatsapp …)
  about.html          Who you work with, principles, delivery
  contact.html        Contact channels + working enquiry form
  privacy.html        Privacy policy
  terms.html          Terms of service
  data-deletion.html  Meta-compliant data deletion instructions
  404.html            Not-found page
  styles.css          The whole design system, tokens → components → responsive
  script.js           Interaction & motion layer
  favicon.svg
  robots.txt · sitemap.xml · _headers
  vendor/
    anime.umd.min.js    anime.js v4  (MIT)
    motion.umd.min.js   motion  v12  (MIT)
```

## Animation libraries

Both are installed via npm and **vendored** into `my-site/vendor/` as UMD
bundles, so the site stays a plain static folder and never calls out to a CDN.

```bash
npm install          # installs animejs + motion, then runs `npm run vendor`
npm run vendor       # re-copy the bundles after upgrading a version
npm run dev          # serve my-site/ on http://localhost:4173
```

| Library                       | Used for |
| ----------------------------- | -------- |
| **anime.js** (`window.anime`) | the scroll-scrubbed animatic timeline, headline + heading word splits, self-drawing icons, scroll reveals, counters, SVG wire draw + travelling packets, conversation replay, accordion height, page dissolve |
| **motion** (`window.Motion`)  | `inView` triggers for every reveal, and `scroll()` to scrub the animatic |

The reticle cursor and the motion background are deliberately **not**
library-driven: both run on plain rAF loops that park themselves when idle or
hidden, which is cheaper than spawning animations per pointer event.

### The motion background

The "background video" is a generated canvas flow-field, not an MP4: raspberry
and violet particles drifting through curl noise with comet trails. Generated
live, it weighs zero bytes, loops forever, never buffers and matches the
palette exactly. To swap in a real video instead, replace the `bg-motion`
module with a `<video autoplay muted loop playsinline>` and keep the same
fixed-position CSS.

### The animatic

The homepage centrepiece (`#how`) is a five-beat sequence following one
customer message from arrival to done. It is an anime timeline built with
`autoplay: false` and seeked from scroll progress, so the viewer scrubs it in
both directions and can stop on any beat.

It is written to fail safe: the timeline is constructed **before** `is-live` is
added to the track, so if anything throws, the section stays a normal-height
block showing the finished scene. To change the pacing, edit `BEATS` /
`BEAT_AT` and the timeline positions in the `animatic` module of `script.js`.

Motion is purposeful rather than decorative — see the Motion section of
`DESIGN.md`. No parallax and no spring hovers.

## Resilience

Every animated element degrades safely:

- `prefers-reduced-motion: reduce` renders everything at its final state.
- An inline script in each `<head>` flips `html.reveal-all` after 2.5s **if
  `script.js` never ran**, so a failed asset can never leave the page blank.
- If the vendor bundles fail to load, `script.js` falls back to
  `IntersectionObserver` and applies end states directly.
- Every module runs inside a `mod()` wrapper — one broken feature cannot take
  the page down.

## The contact form

There is no backend, so the form **composes a pre-filled email** in the
visitor's own mail client addressed to `contact@service.co.im`, plus a
copy-to-clipboard fallback. It validates inline, has a honeypot field, and
never claims a message was sent when it wasn't.

To switch to a hosted form service later, point the `<form>` at the endpoint
and delete the `contact-form` module in `script.js`.

## Before you go live — owner TODOs

Search the HTML for `data-todo` to find each spot:

| Marker | What to do |
| ------ | ---------- |
| `data-todo="instagram-url"` | Replace `href="contact.html"` with your Instagram profile URL |
| `data-todo="facebook-url"` | Replace with your Facebook page URL |
| `data-todo="whatsapp-number"` | Replace with `https://wa.me/213XXXXXXXXX` |

Then delete the `data-todo` attribute. Also worth doing:

- Add a real `og:image` (1200×630) and reference it in each page's `<head>` —
  link previews on Facebook and WhatsApp currently have no image. Match the
  raspberry-on-navy palette so the preview matches the site.
- Update the "Last updated" dates on the three legal pages when you edit them.
- Add a phone number to `contact.html` if you want one (it was removed rather
  than left as `+213 XXX XXX XXX`).

## Deploying on Cloudflare Pages

- **Build command:** none
- **Output directory:** `my-site`
- `_headers` sets security headers and caches `vendor/*` for a year.
- `404.html` is picked up automatically for static sites.

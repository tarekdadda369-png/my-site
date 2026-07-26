# service.co.im — TARIK DADDA

Marketing site for a custom AI-automation studio serving businesses in Algeria.

Static HTML, CSS and vanilla JS. No build step, no framework, no runtime
dependency on any CDN — deploy the `my-site/` folder as-is.

---

## Structure

```
my-site/
  index.html          Home — hero, services bento, live demo, process, FAQ, CTA
  services.html       Full service breakdown (anchors: #instagram #whatsapp …)
  about.html          Who you work with, principles, delivery
  contact.html        Contact channels + working enquiry form
  privacy.html        Privacy policy
  terms.html          Terms of service
  data-deletion.html  Meta-compliant data deletion instructions
  404.html            Not-found page
  styles.css          The whole design system (tokens → components → responsive)
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

| Library                         | Used for                                                            |
| ------------------------------- | ------------------------------------------------------------------- |
| **anime.js** (`window.anime`)   | headline word-split reveal, scroll reveals, counters, SVG wire draw + travelling packets, chat replay, accordion height |
| **motion** (`window.Motion`)    | `inView` triggers, scroll-linked progress bar and timeline rail, spring hovers on cards and magnetic buttons |

Component patterns (bento grid, spotlight cards, gradient hairline borders,
shimmer button, marquee) are re-implementations of
[kokonutui](https://github.com/kokonut-labs/kokonutui) ideas in plain CSS —
kokonutui itself is React + Tailwind and cannot be dropped into a static site.

## Motion & resilience rules

Every animated element degrades safely:

- `prefers-reduced-motion: reduce` → all motion is skipped and content renders
  at its final state.
- An inline script in each `<head>` flips `html.reveal-all` after 2.5s **if
  `script.js` never ran**, so a failed asset can never leave the page blank.
- If the vendor bundles fail to load, `script.js` falls back to
  `IntersectionObserver` and applies end-states directly.
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

| Marker                  | What to do                                                   |
| ----------------------- | ------------------------------------------------------------ |
| `data-todo="instagram-url"` | Replace `href="contact.html"` with your Instagram profile URL |
| `data-todo="facebook-url"`  | Replace with your Facebook page URL                          |
| `data-todo="whatsapp-number"` | Replace with `https://wa.me/213XXXXXXXXX`                  |

Then delete the `data-todo` attribute. Also worth doing:

- Add a real `og:image` (1200×630) and reference it in each page's `<head>` —
  link previews on Facebook and WhatsApp currently have no image.
- Update the "Last updated" dates on the three legal pages when you edit them.
- Add a phone number to `contact.html` if you want one (it was removed rather
  than left as `+213 XXX XXX XXX`).

## Deploying on Cloudflare Pages

- **Build command:** none
- **Output directory:** `my-site`
- `_headers` sets security headers and caches `vendor/*` for a year.
- Point `404.html` at Cloudflare's not-found handling (it is picked up
  automatically for static sites).

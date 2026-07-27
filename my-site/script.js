/* ==========================================================================
   TARIK DADDA — AI Automation
   Interaction & motion layer

   Libraries (vendored UMD globals, no build step, no CDN):
     window.anime   → anime.js v4   vendor/anime.umd.min.js
     window.Motion  → motion v12    vendor/motion.umd.min.js

   Motion is purposeful rather than decorative. The design language carries
   hierarchy through surfaces and hairlines, so animation is spent on things
   that explain the product:

     · the scroll-scrubbed animatic (a five-beat sequence the viewer scrubs
       in both directions by scrolling)
     · the conversation replay in the demo panel
     · the travelling packets in the hero pipeline
     · entrances: headline, headings word by word, icons drawing themselves

   Still no parallax, no cursor-tracking glow, no springy hovers.

   Every module runs inside mod() so one failure cannot take the page down,
   and the reveal watchdog in each <head> guarantees content is visible even
   if these bundles never load.
   ========================================================================== */

(function () {
  'use strict';

  var anime = window.anime || null;
  var Motion = window.Motion || null;
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var EASE = 'outExpo';

  /* ---------------------------------------------------------------- helpers */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function mod(name, fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[site] module "' + name + '" skipped:', err && err.message);
      }
    }
  }

  /** anime.animate when available, otherwise snap to the end state. */
  function tween(targets, props) {
    if (anime && anime.animate && !REDUCED) return anime.animate(targets, props);

    var list = typeof targets === 'string' ? $$(targets) : [].concat(targets);
    list.forEach(function (el) {
      if (el && el.style) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
    });
    return null;
  }

  function onceInView(el, cb, amount) {
    var threshold = amount == null ? 0.2 : amount;

    if (Motion && Motion.inView) {
      var stop = Motion.inView(
        el,
        function () {
          cb();
          if (stop) stop();
        },
        { amount: threshold }
      );
      return;
    }
    if (!('IntersectionObserver' in window)) {
      cb();
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            cb();
            io.disconnect();
          }
        });
      },
      { threshold: threshold }
    );
    io.observe(el);
  }

  /* ============================================================= 1. Boot */

  mod('boot', function () {
    document.documentElement.classList.remove('no-js');

    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    if (REDUCED) document.documentElement.classList.add('reveal-all');
    window.__siteReady = true;
  });

  /* ================================================= 1b. Reticle cursor

     A viewfinder that trails the pointer: a centre dot inside four corner
     brackets. It idles as a diamond and locks square onto anything
     interactive — the "targeting" read suits an automation studio. The
     native cursor is only hidden after the reticle is confirmed running.
     ------------------------------------------------------------------- */

  mod('cursor', function () {
    var cursor = $('.cursor');
    if (!cursor || REDUCED) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var INTERACTIVE = 'a, button, [role="tab"], .acc-btn, summary, label';
    var TEXTUAL = 'input, textarea, select';

    var tx = window.innerWidth / 2;
    var ty = window.innerHeight / 2;
    var x = tx;
    var y = ty;
    var running = false;
    var engaged = false;

    function loop() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      cursor.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) < 0.15 && Math.abs(ty - y) < 0.15) {
        running = false;
        return;
      }
      requestAnimationFrame(loop);
    }

    function start() {
      if (!running) {
        running = true;
        requestAnimationFrame(loop);
      }
    }

    document.addEventListener(
      'pointermove',
      function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        tx = e.clientX;
        ty = e.clientY;

        if (!engaged) {
          engaged = true;
          /* Snap to the pointer before first paint so the reticle never
             flies in from the viewport centre. */
          x = tx;
          y = ty;
          cursor.classList.add('is-on');
          document.documentElement.classList.add('cursor-live');
        }

        var t = e.target;
        cursor.classList.toggle('is-lock', !!(t.closest && t.closest(INTERACTIVE)));
        cursor.classList.toggle('is-text', !!(t.closest && t.closest(TEXTUAL)));
        start();
      },
      { passive: true }
    );

    document.addEventListener('pointerdown', function () {
      cursor.classList.add('is-down');
    });
    document.addEventListener('pointerup', function () {
      cursor.classList.remove('is-down');
    });

    function off() {
      cursor.classList.remove('is-on');
      document.documentElement.classList.remove('cursor-live');
      engaged = false;
    }
    document.documentElement.addEventListener('mouseleave', off);
    window.addEventListener('blur', off);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) off();
    });
  });

  /* ============================================ 1c. Motion background

     The "background video": a flow-field of raspberry and violet particles
     drifting through curl noise on a full-screen canvas. Generated live, it
     weighs nothing, loops forever, never buffers, and matches the palette
     exactly — everything an MP4 background is not.
     ------------------------------------------------------------------- */

  mod('bg-motion', function () {
    var canvas = $('.bg-motion');
    if (!canvas || REDUCED) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0;
    var H = 0;
    var parts = [];
    var raf = null;
    var running = true;
    var t = 0;

    var COLOURS = ['rgba(234, 75, 113, 0.30)', 'rgba(255, 113, 149, 0.22)', 'rgba(122, 91, 234, 0.20)'];

    function spawn(anywhere) {
      return {
        x: Math.random() * W,
        y: anywhere ? Math.random() * H : (Math.random() < 0.5 ? -8 : H + 8),
        life: 0,
        max: 400 + Math.random() * 500,
        speed: 0.22 + Math.random() * 0.5,
        c: COLOURS[(Math.random() * COLOURS.length) | 0]
      };
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = 'rgba(7, 8, 15, 1)';
      ctx.fillRect(0, 0, W, H);

      var count = Math.min(90, Math.max(36, Math.round((W * H) / 26000)));
      parts = [];
      for (var i = 0; i < count; i++) parts.push(spawn(true));
    }

    /* Cheap curl-ish field from summed sines — organic without a noise lib */
    function angle(x, y, t) {
      return (
        Math.sin(x * 0.0016 + t * 0.00022) +
        Math.cos(y * 0.0019 - t * 0.00017) +
        Math.sin((x + y) * 0.0008 + t * 0.0001)
      ) * 1.35;
    }

    function frame(now) {
      if (!running) return;
      t = now || 0;

      /* Translucent wipe leaves short comet trails */
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(7, 8, 15, 0.055)';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < parts.length; i++) {
        var pt = parts[i];
        var a = angle(pt.x, pt.y, t);
        pt.x += Math.cos(a) * pt.speed;
        pt.y += Math.sin(a) * pt.speed;
        pt.life++;

        if (pt.life > pt.max || pt.x < -12 || pt.x > W + 12 || pt.y < -12 || pt.y > H + 12) {
          parts[i] = spawn(false);
          continue;
        }

        ctx.fillStyle = pt.c;
        ctx.fillRect(pt.x, pt.y, 1.4, 1.4);
      }

      raf = requestAnimationFrame(frame);
    }

    function setRunning(next) {
      if (next === running) return;
      running = next;
      if (running) raf = requestAnimationFrame(frame);
      else if (raf) cancelAnimationFrame(raf);
    }

    var rT;
    window.addEventListener('resize', function () {
      clearTimeout(rT);
      rT = setTimeout(resize, 180);
    });
    document.addEventListener('visibilitychange', function () {
      setRunning(!document.hidden);
    });

    resize();
    raf = requestAnimationFrame(frame);
  });

  /* ============================================== 1d. Scramble decode

     Mono labels resolve out of automation noise — a terminal-style decode
     on eyebrows and panel names, run once when they enter the viewport.
     ------------------------------------------------------------------- */

  mod('scramble', function () {
    if (REDUCED || !anime) return;

    var GLYPHS = '#/<>[]{}|=+*10';

    function scramble(el) {
      if (el.dataset.scrambled) return;
      el.dataset.scrambled = '1';

      var final = el.textContent.replace(/\s+/g, ' ').trim();
      if (!final || final.length < 3 || final.length > 48) return;

      var frame = 0;
      var total = Math.min(26, 8 + final.length);
      el.setAttribute('aria-label', final);

      function tick() {
        frame++;
        var resolved = Math.floor((frame / total) * final.length);
        var out = '';
        for (var i = 0; i < final.length; i++) {
          var ch = final[i];
          if (i < resolved || ch === ' ') out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (frame < total) setTimeout(tick, 28);
        else el.textContent = final;
      }
      tick();
    }

    $$('.eyebrow, .panel-bar .name').forEach(function (el) {
      /* Eyebrows keep their ::before rule; only the text node scrambles. */
      onceInView(el, function () {
        scramble(el);
      }, 0.5);
    });
  });

  /* ============================================== 1e. Magnetic pull

     Primary CTAs lean a few pixels toward the reticle when it comes close.
     Small on purpose: attraction, not elasticity.
     ------------------------------------------------------------------- */

  mod('magnetic', function () {
    if (REDUCED) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('.btn--primary').forEach(function (btn) {
      btn.style.transition = 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)';

      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (dx * 0.12).toFixed(1) + 'px,' + (dy * 0.18).toFixed(1) + 'px)';
      });

      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  });

  /* =========================================================== 2. Header */

  mod('header', function () {
    var header = $('.header');
    if (!header) return;

    var state = null;
    function sync() {
      var next = window.scrollY > 8;
      if (next !== state) {
        header.classList.toggle('is-scrolled', next);
        state = next;
      }
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();
  });

  /* =========================================================== 3. Drawer */

  mod('drawer', function () {
    var burger = $('.burger');
    var drawer = $('.drawer');
    if (!burger || !drawer) return;

    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);

      if (open) {
        tween($$('.drawer-link, .drawer-foot > *', drawer), {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 320,
          delay: anime && anime.stagger ? anime.stagger(30) : 0,
          ease: EASE
        });
      }
    }

    burger.addEventListener('click', function () {
      setOpen(!drawer.classList.contains('is-open'));
    });

    $$('a', drawer).forEach(function (a) {
      a.addEventListener('click', function () {
        setOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setOpen(false);
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 860 && drawer.classList.contains('is-open')) setOpen(false);
    });
  });

  /* ========================================================== 4. Reveals */

  /* Section headings resolve word by word — the same gesture as the hero,
     one step quieter. Only plain-text headings are split, so nested markup
     is never destroyed. */
  function revealWords(root) {
    $$('h2', root).forEach(function (h2) {
      /* NB: the marker must not be `data-split` — that attribute is the hero
         headline's hook and carries an `opacity: 0` rule. */
      if (h2.children.length || h2.dataset.wordsDone) return;
      var words = h2.textContent.trim().split(/\s+/);
      if (words.length < 2) return;

      h2.dataset.wordsDone = '1';
      h2.setAttribute('aria-label', h2.textContent.replace(/\s+/g, ' ').trim());
      h2.textContent = '';

      var spans = words.map(function (w, i) {
        var span = document.createElement('span');
        span.style.display = 'inline-block';
        span.textContent = w;
        h2.appendChild(span);
        if (i < words.length - 1) h2.appendChild(document.createTextNode(' '));
        return span;
      });

      tween(spans, {
        opacity: [0, 1],
        translateY: [14, 0],
        duration: 620,
        delay: anime && anime.stagger ? anime.stagger(26) : 0,
        ease: EASE
      });
    });
  }

  /* Card icons draw themselves on, stroke by stroke. Shapes that cannot
     report a length just fade — no browser is left with a blank icon. */
  function drawGlyphs(root) {
    $$('.glyph', root).forEach(function (glyph) {
      if (glyph.dataset.drawn) return;
      glyph.dataset.drawn = '1';

      Array.prototype.slice.call(glyph.children).forEach(function (shape, i) {
        var len = 0;
        try {
          if (typeof shape.getTotalLength === 'function') len = shape.getTotalLength();
        } catch (e) {
          len = 0;
        }

        if (!len) {
          tween(shape, { opacity: [0, 1], duration: 400, delay: i * 60, ease: EASE });
          return;
        }

        shape.style.strokeDasharray = len;
        shape.style.strokeDashoffset = len;
        tween(shape, {
          strokeDashoffset: [len, 0],
          duration: 620,
          delay: 120 + i * 90,
          ease: 'inOutSine'
        });
      });
    });
  }

  /* One gesture, used everywhere: a short rise with a fade. Values are kept
     small on purpose — big travel reads as a template. */
  mod('reveal', function () {
    if (REDUCED) return;

    $$('[data-reveal]').forEach(function (el) {
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      var stagger = el.getAttribute('data-reveal-stagger');

      onceInView(
        el,
        function () {
          el.classList.add('is-in');
          revealWords(el);
          drawGlyphs(el);

          if (stagger !== null) {
            var kids = Array.prototype.slice.call(el.children);
            if (kids.length) {
              tween(kids, {
                opacity: [0, 1],
                translateY: [10, 0],
                duration: 520,
                delay: anime && anime.stagger ? anime.stagger(parseInt(stagger, 10) || 50, { start: delay }) : delay,
                ease: EASE
              });
              return;
            }
          }

          tween(el, {
            opacity: [0, 1],
            translateY: [12, 0],
            duration: 560,
            delay: delay,
            ease: EASE
          });
        },
        0.15
      );
    });
  });

  /* ================================================== 5. Hero headline */

  /* Word-level split done by hand so the markup stays predictable and the
     accessible name is preserved on the <h1>. */
  function splitWords(el) {
    var out = [];
    $$('.line', el).forEach(function (line) {
      var words = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      words.forEach(function (w, i) {
        var clip = document.createElement('span');
        clip.style.display = 'inline-block';
        clip.style.overflow = 'hidden';
        clip.style.verticalAlign = 'top';

        var word = document.createElement('span');
        word.style.display = 'inline-block';
        word.textContent = w;

        clip.appendChild(word);
        line.appendChild(clip);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
        out.push(word);
      });
    });
    return out;
  }

  mod('hero-headline', function () {
    var h1 = $('[data-split]');
    if (!h1) return;

    if (!h1.getAttribute('aria-label')) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    }
    if (REDUCED) return;

    var words = splitWords(h1);
    if (!words.length) {
      h1.classList.add('is-in');
      return;
    }

    /* Park the words below their clip before the <h1> becomes visible,
       otherwise there is one frame of un-animated text. */
    if (anime && anime.utils && anime.utils.set) {
      anime.utils.set(words, { translateY: '100%' });
    }
    h1.classList.add('is-in');

    tween(words, {
      translateY: ['100%', '0%'],
      duration: 860,
      delay: anime && anime.stagger ? anime.stagger(38, { start: 60 }) : 60,
      ease: EASE
    });

    var trail = $$('[data-hero-seq]');
    if (trail.length) {
      if (anime && anime.utils && anime.utils.set) {
        anime.utils.set(trail, { opacity: 0, translateY: 10 });
      }
      trail.forEach(function (el) {
        el.classList.add('is-in');
      });
      tween(trail, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 600,
        delay: anime && anime.stagger ? anime.stagger(70, { start: 220 }) : 220,
        ease: EASE
      });
    }
  });

  /* ==================================================== 6. Flow diagram */

  mod('flow-diagram', function () {
    var svg = $('.flow');
    if (!svg) return;

    var nodes = $$('[data-node]', svg);
    var packets = $$('.packet', svg);

    if (REDUCED) {
      nodes.forEach(function (g) {
        g.setAttribute('opacity', '1');
      });
      packets.forEach(function (p) {
        p.style.display = 'none';
      });
      return;
    }

    onceInView(
      svg,
      function () {
        /* Draw the wires in. */
        try {
          if (anime && anime.svg && anime.svg.createDrawable) {
            anime.animate(anime.svg.createDrawable('.flow .wire'), {
              draw: ['0 0', '0 1'],
              duration: 900,
              delay: anime.stagger(70),
              ease: 'inOutSine'
            });
          }
        } catch (e) {
          /* Wires just appear already drawn — still correct. */
        }

        tween(nodes, {
          opacity: [0, 1],
          duration: 520,
          delay: anime && anime.stagger ? anime.stagger(55, { start: 200 }) : 200,
          ease: EASE
        });

        /* Packets travelling the wires: the one piece of looping motion on
           the page, and the thing that makes the diagram read as running. */
        try {
          if (anime && anime.svg && anime.svg.createMotionPath) {
            packets.forEach(function (packet, i) {
              var path = $('#' + packet.getAttribute('data-path'), svg);
              if (!path) return;
              var mp = anime.svg.createMotionPath(path);
              anime.animate(packet, {
                translateX: mp.translateX,
                translateY: mp.translateY,
                opacity: [
                  { to: 1, duration: 200 },
                  { to: 1, duration: 1300 },
                  { to: 0, duration: 240 }
                ],
                duration: 1740,
                delay: 800 + i * 300,
                loop: true,
                loopDelay: 700,
                ease: 'inOutQuad'
              });
            });
          }
        } catch (e) {
          packets.forEach(function (p) {
            p.style.display = 'none';
          });
        }
      },
      0.25
    );
  });

  /* ================================================== 6b. Scroll animatic

     A five-beat sequence built as a paused anime timeline and scrubbed by
     scroll position, so the viewer controls playback in both directions.

     The timeline is built BEFORE `is-live` is added: if anything throws, the
     class never lands, the track stays a normal-height block, and the CSS
     fallback renders the scene in its finished state.
     ------------------------------------------------------------------- */

  var BEATS = [
    ['01', 'A customer messages you at 23:40, long after everyone has gone home.'],
    ['02', 'It reaches your automation instantly — nobody has to open an app.'],
    ['03', 'The agent reads the intent and checks your own stock, prices and orders.'],
    ['04', 'It answers in your tone, reserves the item, and writes the lead into your CRM.'],
    ['05', 'You are pulled in only when a decision actually needs a human.']
  ];

  /* Progress thresholds where each beat begins. */
  var BEAT_AT = [0, 0.2, 0.42, 0.62, 0.82];

  mod('animatic', function () {
    var track = $('[data-animatic]');
    if (!track) return;

    var svg = $('.scene', track);
    var dots = $$('.beat-dot', track);
    var beatN = $('[data-beat-n]', track);
    var beatText = $('[data-beat-text]', track);
    if (!svg) return;

    function showLastBeat() {
      if (beatN) beatN.textContent = BEATS[BEATS.length - 1][0];
      if (beatText) beatText.textContent = BEATS[BEATS.length - 1][1];
      dots.forEach(function (d) {
        d.classList.add('is-on');
      });
    }

    if (REDUCED || !anime || !anime.createTimeline) {
      showLastBeat();
      return;
    }

    /* Dash-based line drawing using plain SVG geometry — deterministic under
       seek, and no dependency on a library-specific drawable helper. */
    function drawable(id) {
      var el = $('#' + id, svg);
      if (!el || typeof el.getTotalLength !== 'function') return null;
      var len = el.getTotalLength();
      if (!len) return null;
      el.style.strokeDasharray = len;
      el.style.strokeDashoffset = len;
      return { el: el, len: len };
    }

    var tl;
    try {
      var w1 = drawable('w-main');
      var w2 = drawable('w-crm');
      var w3 = drawable('w-human');
      var c1 = drawable('w-chip1');
      var c2 = drawable('w-chip2');
      var c3 = drawable('w-chip3');

      tl = anime.createTimeline({ autoplay: false, defaults: { ease: 'inOutQuad' } });

      function line(d, at, dur) {
        if (d) tl.add(d.el, { strokeDashoffset: [d.len, 0], duration: dur }, at);
      }

      /* Beat 1 — the message arrives */
      tl.add('#a-device', { opacity: [0, 1], translateY: [14, 0], duration: 120 }, 0);
      tl.add('#a-msg-in', { opacity: [0, 1], translateY: [10, 0], duration: 110 }, 90);

      /* Beat 2 — it travels to the automation */
      line(w1, 200, 140);
      tl.add('#a-packet', { opacity: [0, 1], duration: 40 }, 250);
      tl.add('#a-packet', { translateX: [0, 118], duration: 170 }, 250);
      tl.add('#a-packet', { opacity: [1, 0], duration: 40 }, 400);

      /* Beat 3 — the agent reads it against your data */
      tl.add('#a-agent', { opacity: [0, 1], scale: [0.96, 1], duration: 120 }, 380);
      tl.add('#a-ring', { opacity: [0, 0.85], scale: [0.82, 1.05], duration: 210 }, 420);
      tl.add('#a-ring', { opacity: [0.85, 0], duration: 130 }, 630);

      line(c1, 440, 100);
      line(c2, 470, 100);
      line(c3, 500, 100);
      tl.add('#a-chip1', { opacity: [0, 1], translateY: [-10, 0], duration: 100 }, 450);
      tl.add('#a-chip2', { opacity: [0, 1], translateY: [-10, 0], duration: 100 }, 480);
      tl.add('#a-chip3', { opacity: [0, 1], translateY: [-10, 0], duration: 100 }, 510);

      tl.add('#a-scan-track', { opacity: [0, 1], duration: 50 }, 455);
      tl.add('#a-scan', { opacity: [0, 1], duration: 50 }, 465);
      tl.add('#a-scan', { scaleX: [0, 1], duration: 200 }, 465);
      tl.add(['#a-scan', '#a-scan-track'], { opacity: [1, 0], duration: 60 }, 690);

      /* Beat 4 — it answers, and the record is written */
      line(w2, 600, 120);
      tl.add('#a-table', { opacity: [0, 1], translateY: [10, 0], duration: 110 }, 620);
      tl.add('#a-packet-back', { opacity: [0, 1], duration: 40 }, 640);
      tl.add('#a-packet-back', { translateX: [118, 0], duration: 160 }, 640);
      tl.add('#a-packet-back', { opacity: [1, 0], duration: 40 }, 790);
      tl.add('#a-row1', { opacity: [0, 1], translateX: [12, 0], duration: 90 }, 680);
      tl.add('#a-row2', { opacity: [0, 1], translateX: [12, 0], duration: 90 }, 716);
      tl.add('#a-row3', { opacity: [0, 1], translateX: [12, 0], duration: 90 }, 752);
      tl.add('#a-msg-out', { opacity: [0, 1], translateY: [12, 0], duration: 120 }, 780);

      /* Beat 5 — the handover */
      line(w3, 830, 120);
      tl.add('#a-human', { opacity: [0, 1], translateY: [10, 0], duration: 110 }, 870);
      tl.add('#a-badge', { opacity: [0, 1], scale: [0.4, 1], duration: 120 }, 930);

      if (typeof tl.seek !== 'function' || !tl.duration) throw new Error('timeline not seekable');
      tl.seek(0);
    } catch (err) {
      showLastBeat();
      return;
    }

    /* Only now is it safe to hand layout over to the scroll track. */
    track.classList.add('is-live');

    var beat = -1;
    function setBeat(i) {
      if (i === beat) return;
      beat = i;
      dots.forEach(function (d, n) {
        d.classList.toggle('is-on', n <= i);
      });
      if (!beatN || !beatText) return;
      beatN.textContent = BEATS[i][0];
      beatText.textContent = BEATS[i][1];
      anime.animate([beatN, beatText], { opacity: [0, 1], translateY: [4, 0], duration: 300, ease: EASE });
    }

    function frame(p) {
      p = p < 0 ? 0 : p > 1 ? 1 : p;
      tl.seek(tl.duration * p);
      var i = 0;
      for (var n = BEAT_AT.length - 1; n >= 0; n--) {
        if (p >= BEAT_AT[n]) {
          i = n;
          break;
        }
      }
      setBeat(i);
    }

    if (Motion && Motion.scroll) {
      Motion.scroll(
        function (a, b) {
          var p = typeof a === 'number' ? a : a && a.y && typeof a.y.progress === 'number' ? a.y.progress : null;
          if (p === null && b && b.y && typeof b.y.progress === 'number') p = b.y.progress;
          frame(p == null ? 0 : p);
        },
        { target: track, offset: ['start start', 'end end'] }
      );
    } else {
      /* Manual scrub: how far the sticky stage has travelled through the track */
      var ticking = false;
      var onScroll = function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var r = track.getBoundingClientRect();
          var travel = r.height - window.innerHeight;
          frame(travel > 0 ? -r.top / travel : 0);
        });
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      onScroll();
    }

    setBeat(0);
  });

  /* ======================================================== 7. Counters */

  mod('counters', function () {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var suffix = el.getAttribute('data-suffix') || '';

      function render(v) {
        el.textContent = Math.round(v) + suffix;
      }

      if (REDUCED || !anime || !anime.animate) {
        render(target);
        return;
      }

      render(0);
      onceInView(
        el,
        function () {
          var box = { v: 0 };
          anime.animate(box, {
            v: target,
            duration: 1200,
            ease: 'outQuint',
            onUpdate: function () {
              render(box.v);
            },
            onComplete: function () {
              render(target);
            }
          });
        },
        0.6
      );
    });
  });

  /* ========================================================= 8. Process */

  mod('steps', function () {
    var steps = $$('.step');
    if (!steps.length) return;

    if (REDUCED) {
      steps.forEach(function (s) {
        s.classList.add('is-lit');
      });
      return;
    }

    steps.forEach(function (step, i) {
      onceInView(
        step,
        function () {
          setTimeout(function () {
            step.classList.add('is-lit');
          }, i * 110);
        },
        0.4
      );
    });
  });

  /* ============================================ 9. Demo tabs + thread */

  var THREADS = {
    instagram: [
      { side: 'in', text: 'Hi, is the black one still available in size L?', meta: 'Instagram DM' },
      { side: 'out', text: 'Yes — size L is in stock. Want me to reserve it for you?', meta: 'Answered from your stock sheet' },
      { side: 'in', text: 'Yes please, and how much is delivery to Oran?' },
      { side: 'out', text: 'Reserved. Delivery to Oran is 600 DA, 24–48h. Shall I confirm the order?', meta: 'Lead saved to CRM' }
    ],
    whatsapp: [
      { side: 'in', text: 'Where is my order? #4821', meta: 'WhatsApp Business' },
      { side: 'out', text: 'Order #4821 left the warehouse this morning and is out for delivery today.', meta: 'Live order lookup' },
      { side: 'in', text: 'Can I change the delivery address?' },
      { side: 'out', text: 'Passing this to a human — Amine will reply here in a few minutes.', meta: 'Escalated · rule matched' }
    ],
    email: [
      { side: 'in', text: 'Quote request: 300 units, delivery before the 20th.', meta: 'Shared inbox' },
      { side: 'out', text: 'Classified as "Quote — high value" and logged against the customer.', meta: 'Triage · 2s' },
      { side: 'out', text: 'Draft quote prepared from your price list and queued for your review.', meta: 'Awaiting your approval' }
    ],
    internal: [
      { side: 'in', text: 'New supplier invoice added to the shared Drive folder.', meta: 'Trigger' },
      { side: 'out', text: 'Extracted supplier, total, VAT and due date.', meta: 'Document parsing' },
      { side: 'out', text: 'Row written to the accounting sheet, summary posted to your team channel.', meta: 'Workflow complete' }
    ]
  };

  mod('demo', function () {
    var demo = $('[data-demo]');
    if (!demo) return;

    var tabs = $$('.tab', demo);
    var panels = $$('.tab-panel', demo);
    if (!tabs.length) return;

    function msgEl(m) {
      var el = document.createElement('div');
      el.className = 'msg ' + m.side;
      el.textContent = m.text;
      if (m.meta) {
        var meta = document.createElement('span');
        meta.className = 'm';
        meta.textContent = m.meta;
        el.appendChild(meta);
      }
      if (REDUCED) el.style.opacity = '1';
      return el;
    }

    function play(panel) {
      var body = $('.thread-body', panel);
      if (!body) return;

      var script = THREADS[panel.getAttribute('data-thread')];
      if (!script) return;

      body.innerHTML = '';

      if (REDUCED || !anime || !anime.animate) {
        script.forEach(function (m) {
          body.appendChild(msgEl(m));
        });
        return;
      }

      var t = 220;
      script.forEach(function (m, i) {
        /* A typing indicator before each automated reply — the detail that
           makes the replay read as a real conversation. */
        if (m.side === 'out') {
          var typing = document.createElement('div');
          typing.className = 'typing';
          typing.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(typing);

          anime.animate(typing, { opacity: [0, 1], duration: 180, delay: t, ease: EASE });
          t += 200;
          var hideAt = t + 560;
          anime.animate(typing, {
            opacity: 0,
            duration: 140,
            delay: hideAt,
            ease: 'linear',
            onComplete: function () {
              if (typing.parentNode) typing.parentNode.removeChild(typing);
            }
          });
          t = hideAt + 120;
        }

        var el = msgEl(m);
        body.appendChild(el);
        anime.animate(el, {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 420,
          delay: t,
          ease: EASE
        });
        t += i === 0 ? 460 : 620;
      });
    }

    function select(index, replay) {
      tabs.forEach(function (tab, i) {
        tab.setAttribute('aria-selected', i === index ? 'true' : 'false');
        tab.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      panels.forEach(function (panel, i) {
        if (i === index) panel.setAttribute('data-active', '');
        else panel.removeAttribute('data-active');
      });

      var panel = panels[index];
      if (!panel) return;

      if (!REDUCED && anime && anime.animate) {
        tween($$('.demo-copy > *', panel), {
          opacity: [0, 1],
          translateY: [8, 0],
          duration: 420,
          delay: anime.stagger ? anime.stagger(40) : 0,
          ease: EASE
        });
      }
      if (replay) play(panel);
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(i, true);
      });
      tab.addEventListener('keydown', function (e) {
        var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!dir) return;
        e.preventDefault();
        var next = (i + dir + tabs.length) % tabs.length;
        tabs[next].focus();
        select(next, true);
      });
    });

    onceInView(
      demo,
      function () {
        select(0, true);
      },
      0.25
    );
  });

  /* ====================================================== 10. Accordion */

  mod('accordion', function () {
    $$('.accordion').forEach(function (acc) {
      var buttons = $$('.acc-btn', acc);

      function expand(panel) {
        panel.hidden = false;
        var target = panel.firstElementChild ? panel.firstElementChild.offsetHeight : panel.scrollHeight;
        if (REDUCED || !anime || !anime.animate) {
          panel.style.height = 'auto';
          return;
        }
        anime.animate(panel, {
          height: [panel.offsetHeight, target],
          duration: 340,
          ease: EASE,
          onComplete: function () {
            panel.style.height = 'auto';
          }
        });
      }

      function collapse(panel) {
        if (REDUCED || !anime || !anime.animate) {
          panel.style.height = '0px';
          panel.hidden = true;
          return;
        }
        anime.animate(panel, {
          height: [panel.offsetHeight, 0],
          duration: 260,
          ease: 'inOutQuad',
          onComplete: function () {
            panel.hidden = true;
          }
        });
      }

      buttons.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;

        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';

          /* Single-open: close whatever else is expanded first. */
          buttons.forEach(function (other) {
            if (other === btn) return;
            var otherPanel = document.getElementById(other.getAttribute('aria-controls'));
            if (other.getAttribute('aria-expanded') === 'true' && otherPanel) {
              other.setAttribute('aria-expanded', 'false');
              collapse(otherPanel);
            }
          });

          btn.setAttribute('aria-expanded', open ? 'false' : 'true');
          if (open) collapse(panel);
          else expand(panel);
        });
      });
    });
  });

  /* =============================================== 11. Legal page TOC */

  mod('toc', function () {
    var toc = $('.toc');
    if (!toc) return;

    var links = $$('a[href^="#"]', toc);
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var section = document.getElementById(a.getAttribute('href').slice(1));
      if (!section) return;
      map[section.id] = a;
      sections.push(section);
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.remove('is-current');
          });
          if (map[e.target.id]) map[e.target.id].classList.add('is-current');
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach(function (s) {
      io.observe(s);
    });
  });

  /* ==================================================== 12. Contact form */

  /* No backend on this host, so the form composes a fully formatted mail in
     the visitor's own client. Nothing is swallowed, and nothing pretends to
     have been sent. */
  mod('contact-form', function () {
    var form = $('[data-contact-form]');
    if (!form) return;

    var status = $('.form-status', form);
    var statusBody = status ? $('[data-status-body]', status) : null;
    var submit = $('button[type="submit"]', form);
    var target = form.getAttribute('data-mailto') || 'contact@service.co.im';

    function fieldOf(input) {
      return input.closest('.field');
    }

    function showError(input, message) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.add('is-invalid');
      var err = $('.err', field);
      if (err) err.textContent = message;
      input.setAttribute('aria-invalid', 'true');
    }

    function clearError(input) {
      var field = fieldOf(input);
      if (!field) return;
      field.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    }

    function validate(input) {
      var value = (input.value || '').trim();

      if (input.hasAttribute('required') && !value) {
        showError(input, 'This field is required.');
        return false;
      }
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showError(input, 'Enter a valid email address, e.g. you@company.com');
        return false;
      }
      if (input.name === 'message' && value && value.length < 12) {
        showError(input, 'Please add a little more detail (at least 12 characters).');
        return false;
      }
      clearError(input);
      return true;
    }

    var inputs = $$('input, select, textarea', form).filter(function (i) {
      return i.type !== 'submit' && !i.closest('.hp');
    });

    inputs.forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.value.trim()) validate(input);
      });
      input.addEventListener('input', function () {
        var field = fieldOf(input);
        if (field && field.classList.contains('is-invalid')) validate(input);
      });
    });

    function compose(data) {
      return [
        'Name: ' + data.name,
        'Email: ' + data.email,
        data.phone ? 'Phone: ' + data.phone : null,
        data.company ? 'Company: ' + data.company : null,
        'Service of interest: ' + (data.service || 'Not specified'),
        '',
        'Message:',
        data.message,
        '',
        '— Sent from service.co.im'
      ]
        .filter(Boolean)
        .join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Honeypot: bots fill hidden fields, humans never see them. */
      var trap = form.querySelector('.hp input');
      if (trap && trap.value) return;

      var ok = true;
      var firstBad = null;
      inputs.forEach(function (input) {
        if (!validate(input)) {
          ok = false;
          if (!firstBad) firstBad = input;
        }
      });

      if (!ok) {
        if (firstBad) firstBad.focus();
        return;
      }

      var data = {};
      inputs.forEach(function (input) {
        data[input.name] = (input.value || '').trim();
      });

      var subject = 'New enquiry from ' + data.name + (data.company ? ' (' + data.company + ')' : '');
      var body = compose(data);

      if (status && statusBody) {
        statusBody.innerHTML =
          '<strong>Your email app is opening now.</strong>' +
          'If nothing happened, send the details to ' +
          '<a class="link link--accent" href="mailto:' + target + '">' + target + '</a>' +
          ' — or <button type="button" class="link link--accent" data-copy>copy your message</button> ' +
          'and paste it into any mail client.';
        status.classList.add('is-shown');

        var copyBtn = $('[data-copy]', status);
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            var payload = 'To: ' + target + '\nSubject: ' + subject + '\n\n' + body;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(payload).then(function () {
                copyBtn.textContent = 'copied';
              });
            }
          });
        }
      }

      if (submit) {
        submit.textContent = 'Opening your mail app…';
        submit.disabled = true;
        setTimeout(function () {
          submit.textContent = 'Send message';
          submit.disabled = false;
        }, 4000);
      }

      window.location.href =
        'mailto:' + target + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  });

  /* =============================================== 12b. Page transitions

     A short dissolve out of the current page. The incoming page runs its own
     entrance, so navigation between pages reads as one continuous surface
     rather than a white blink.
     ------------------------------------------------------------------- */

  mod('page-transition', function () {
    if (REDUCED) return;

    var main = $('main');
    if (!main) return;

    /* Restoring from the back/forward cache must never leave a faded page. */
    window.addEventListener('pageshow', function (e) {
      if (e.persisted) {
        main.style.opacity = '';
        main.style.transform = '';
      }
    });

    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target.closest ? e.target.closest('a') : null;
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      var href = link.getAttribute('href') || '';
      if (!href || href.charAt(0) === '#' || /^(mailto|tel|https?):/i.test(href) && link.origin !== location.origin) return;
      if (link.origin && link.origin !== location.origin) return;
      if (link.pathname === location.pathname && link.hash) return;

      e.preventDefault();

      var go = function () {
        window.location.href = link.href;
      };

      if (!anime || !anime.animate) {
        go();
        return;
      }

      /* Navigate regardless, in case the animation never reports completion. */
      var done = false;
      var navigate = function () {
        if (done) return;
        done = true;
        go();
      };
      setTimeout(navigate, 320);

      anime.animate(main, {
        opacity: [1, 0],
        translateY: [0, -8],
        duration: 190,
        ease: 'inQuad',
        onComplete: navigate
      });
    });
  });

  /* ============================================= 12c. Custom listbox

     The native <select> popup cannot be styled, so the service picker gets
     a designed replacement: a button + listbox that follows the ruled-panel
     look. The real <select> stays in the DOM carrying the form value, which
     keeps the mailto composition and the no-JS fallback intact.
     ------------------------------------------------------------------- */

  mod('listbox', function () {
    $$('.field > select').forEach(function (select) {
      var field = select.closest('.field');
      if (!field || select.multiple) return;

      var wrap = document.createElement('div');
      wrap.className = 'listbox';

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'listbox-btn';
      btn.setAttribute('aria-haspopup', 'listbox');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = select.options[select.selectedIndex] ? select.options[select.selectedIndex].text : '';

      var panel = document.createElement('div');
      panel.className = 'listbox-panel';
      panel.setAttribute('role', 'listbox');
      panel.id = select.id + '-listbox';
      btn.setAttribute('aria-controls', panel.id);

      var opts = [];
      Array.prototype.forEach.call(select.options, function (opt, i) {
        var o = document.createElement('button');
        o.type = 'button';
        o.className = 'listbox-opt';
        o.setAttribute('role', 'option');
        o.setAttribute('aria-selected', i === select.selectedIndex ? 'true' : 'false');

        var n = document.createElement('span');
        n.className = 'n';
        n.textContent = i === 0 ? '—' : (i < 10 ? '0' + i : '' + i);
        o.appendChild(n);
        o.appendChild(document.createTextNode(opt.text));

        o.addEventListener('click', function () {
          choose(i);
          close();
          btn.focus();
        });
        panel.appendChild(o);
        opts.push(o);
      });

      var focusIdx = select.selectedIndex;

      function choose(i) {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        btn.textContent = select.options[i].text;
        opts.forEach(function (o, n) {
          o.setAttribute('aria-selected', n === i ? 'true' : 'false');
        });
        focusIdx = i;
      }

      function setFocus(i) {
        focusIdx = Math.max(0, Math.min(opts.length - 1, i));
        opts.forEach(function (o, n) {
          o.classList.toggle('is-focus', n === focusIdx);
        });
        opts[focusIdx].scrollIntoView({ block: 'nearest' });
      }

      function open() {
        panel.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        setFocus(select.selectedIndex);
        if (!REDUCED && anime && anime.animate) {
          anime.animate(panel, { opacity: [0, 1], translateY: [-6, 0], duration: 220, ease: EASE });
          anime.animate(opts, {
            opacity: [0, 1],
            translateX: [-8, 0],
            duration: 260,
            delay: anime.stagger ? anime.stagger(22) : 0,
            ease: EASE
          });
        }
      }

      function close() {
        panel.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
      }

      function isOpen() {
        return panel.classList.contains('is-open');
      }

      btn.addEventListener('click', function () {
        if (isOpen()) close();
        else open();
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          if (!isOpen()) open();
          else setFocus(focusIdx + (e.key === 'ArrowDown' ? 1 : -1));
        } else if ((e.key === 'Enter' || e.key === ' ') && isOpen()) {
          e.preventDefault();
          choose(focusIdx);
          close();
        } else if (e.key === 'Escape' && isOpen()) {
          close();
        } else if (e.key === 'Home' && isOpen()) {
          e.preventDefault();
          setFocus(0);
        } else if (e.key === 'End' && isOpen()) {
          e.preventDefault();
          setFocus(opts.length - 1);
        }
      });

      document.addEventListener('pointerdown', function (e) {
        if (isOpen() && !wrap.contains(e.target)) close();
      });

      wrap.appendChild(btn);
      wrap.appendChild(panel);
      select.parentNode.insertBefore(wrap, select.nextSibling);
      field.classList.add('has-listbox');

      /* External validation may focus the select — forward it to the button */
      select.addEventListener('focus', function () {
        btn.focus();
      });
    });
  });

  /* ================================================ 13. Anchor scrolling */

  mod('anchors', function () {
    $$('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;

      a.addEventListener('click', function (e) {
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();

        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 56;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset - 24;

        window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
        history.replaceState(null, '', href);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  });
})();

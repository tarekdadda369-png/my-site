/* ==========================================================================
   TARIK DADDA — AI Automation Agency
   Interaction & motion layer
   --------------------------------------------------------------------------
   Libraries (vendored as UMD globals, no build step, no CDN):
     window.anime   → anime.js v4        vendor/anime.umd.min.js
     window.Motion  → motion v12         vendor/motion.umd.min.js

   Everything here is defensive: each module runs inside `mod()`, so a single
   failure can never take the page down, and the CSS reveal watchdog on <html>
   guarantees content is visible even if the vendor bundles never load.
   ========================================================================== */

(function () {
  'use strict';

  var anime = window.anime || null;
  var Motion = window.Motion || null;

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Easing shared with the CSS custom properties. */
  var EASE_OUT = 'outExpo';
  var EASE_SOFT = 'outQuint';

  /* ---------------------------------------------------------------- helpers */

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /** Run a module in isolation so one broken feature never breaks the rest. */
  function mod(name, fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.warn) {
        console.warn('[site] module "' + name + '" skipped:', err && err.message);
      }
    }
  }

  /** anime.animate when available, otherwise apply the end state instantly. */
  function tween(targets, props) {
    if (anime && anime.animate && !REDUCED) return anime.animate(targets, props);

    var list = typeof targets === 'string' ? $$(targets) : [].concat(targets);
    list.forEach(function (el) {
      if (!el || !el.style) return;
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
    });
    return null;
  }

  /** Fire `cb` the first time `el` scrolls into view. */
  function onceInView(el, cb, amount) {
    if (Motion && Motion.inView) {
      var stop = Motion.inView(
        el,
        function () {
          cb();
          if (stop) stop();
        },
        { amount: amount == null ? 0.25 : amount }
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
      { threshold: amount == null ? 0.25 : amount }
    );
    io.observe(el);
  }

  /** Normalise Motion's scroll callback, which has changed shape across majors. */
  function onScrollProgress(cb, options) {
    if (!Motion || !Motion.scroll) return;
    Motion.scroll(function (a, b) {
      var p = typeof a === 'number' ? a : a && a.y && typeof a.y.progress === 'number' ? a.y.progress : null;
      if (p === null && b && b.y && typeof b.y.progress === 'number') p = b.y.progress;
      cb(p == null ? 0 : p);
    }, options || {});
  }

  /* ============================================================ 1. Boot */

  mod('boot', function () {
    var html = document.documentElement;
    html.classList.remove('no-js');

    /* Current year in every footer. */
    $$('[data-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });

    /* Reduced motion: reveal everything and stop here for motion work. */
    if (REDUCED) html.classList.add('reveal-all');

    /* Tells the inline watchdog in <head> that the real thing took over. */
    window.__siteReady = true;
  });

  /* ==================================================== 2. Header & nav */

  mod('header', function () {
    var header = $('.header');
    if (!header) return;

    var lastState = null;
    function sync() {
      var next = window.scrollY > 12;
      if (next !== lastState) {
        header.classList.toggle('is-scrolled', next);
        lastState = next;
      }
    }
    window.addEventListener('scroll', sync, { passive: true });
    sync();

    /* Sliding pill behind the active / hovered nav item. */
    var nav = $('.nav');
    var pill = $('.nav-pill');
    if (!nav || !pill) return;

    var active = $('.nav-link.is-active', nav);

    function moveTo(link) {
      if (!link) {
        pill.style.opacity = '0';
        return;
      }
      pill.style.opacity = '1';
      pill.style.width = link.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + (link.offsetLeft - nav.clientLeft) + 'px)';
    }

    moveTo(active);
    window.addEventListener('resize', function () {
      moveTo($('.nav-link:hover', nav) || active);
    });

    $$('.nav-link', nav).forEach(function (link) {
      link.addEventListener('mouseenter', function () {
        moveTo(link);
      });
      link.addEventListener('focus', function () {
        moveTo(link);
      });
    });
    nav.addEventListener('mouseleave', function () {
      moveTo(active);
    });
  });

  /* ===================================================== 3. Mobile drawer */

  mod('drawer', function () {
    var burger = $('.burger');
    var drawer = $('.drawer');
    if (!burger || !drawer) return;

    var links = $$('.drawer-link, .drawer-foot > *', drawer);

    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);

      if (open) {
        tween(links, {
          opacity: [0, 1],
          translateY: [14, 0],
          duration: 460,
          delay: anime && anime.stagger ? anime.stagger(45) : 0,
          ease: EASE_OUT
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

    /* A resize past the desktop breakpoint should never leave the body locked. */
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && drawer.classList.contains('is-open')) setOpen(false);
    });
  });

  /* =================================================== 4. Scroll progress */

  mod('scroll-progress', function () {
    var bar = $('.scroll-progress');
    if (!bar || REDUCED) return;

    if (Motion && Motion.scroll) {
      onScrollProgress(function (p) {
        bar.style.transform = 'scaleX(' + p + ')';
      });
      return;
    }

    window.addEventListener(
      'scroll',
      function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
      },
      { passive: true }
    );
  });

  /* ========================================================= 5. Reveals */

  /* [data-reveal] values: up (default) | fade | scale | left | right
     [data-reveal-delay] ms, [data-reveal-stagger] applies to direct children */

  mod('reveal', function () {
    if (REDUCED) return;

    var els = $$('[data-reveal]');
    if (!els.length) return;

    var FROM = {
      up: { opacity: [0, 1], translateY: [26, 0], filter: ['blur(7px)', 'blur(0px)'] },
      fade: { opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'] },
      scale: { opacity: [0, 1], scale: [0.94, 1], translateY: [16, 0] },
      left: { opacity: [0, 1], translateX: [-28, 0] },
      right: { opacity: [0, 1], translateX: [28, 0] }
    };

    els.forEach(function (el) {
      var kind = el.getAttribute('data-reveal') || 'up';
      var props = FROM[kind] || FROM.up;
      var delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
      var staggerAttr = el.getAttribute('data-reveal-stagger');

      onceInView(
        el,
        function () {
          el.classList.add('is-in');

          if (staggerAttr !== null) {
            var kids = Array.prototype.slice.call(el.children);
            if (kids.length) {
              tween(kids, {
                opacity: [0, 1],
                translateY: [22, 0],
                duration: 700,
                delay: anime && anime.stagger ? anime.stagger(parseInt(staggerAttr, 10) || 70, { start: delay }) : delay,
                ease: EASE_OUT
              });
              return;
            }
          }

          var params = {};
          for (var k in props) params[k] = props[k];
          params.duration = 760;
          params.delay = delay;
          params.ease = EASE_OUT;
          tween(el, params);
        },
        0.15
      );
    });
  });

  /* ================================================== 6. Hero headline */

  /* Word-level split done by hand: deterministic, and it keeps the markup
     accessible because the original text stays readable to screen readers. */
  function splitWords(el) {
    var out = [];
    $$('.line', el).forEach(function (line) {
      /* A line marked data-accent hands its gradient treatment to each word,
         because background-clip:text cannot survive the wrapper spans. */
      var accent = line.hasAttribute('data-accent');
      var words = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      line.setAttribute('aria-hidden', 'false');
      words.forEach(function (w, i) {
        var outer = document.createElement('span');
        outer.style.display = 'inline-block';
        outer.style.overflow = 'hidden';
        outer.style.verticalAlign = 'top';

        var inner = document.createElement('span');
        inner.style.display = 'inline-block';
        inner.style.willChange = 'transform, opacity';
        if (accent) inner.className = 'shine-text';
        inner.textContent = w;

        outer.appendChild(inner);
        line.appendChild(outer);
        if (i < words.length - 1) line.appendChild(document.createTextNode(' '));
        out.push(inner);
      });

      /* Drop the marker so the CSS fallback for un-split lines stops applying. */
      line.removeAttribute('data-accent');
    });
    return out;
  }

  mod('hero-headline', function () {
    var h1 = $('[data-split]');
    if (!h1) return;

    /* Preserve the accessible name before we shred the text nodes. */
    if (!h1.getAttribute('aria-label')) {
      h1.setAttribute('aria-label', h1.textContent.replace(/\s+/g, ' ').trim());
    }

    if (REDUCED) return;

    var words = splitWords(h1);
    if (!words.length) {
      h1.classList.add('is-in');
      return;
    }

    /* Park the words out of frame before the <h1> itself becomes visible,
       otherwise there is a single frame of un-animated text. */
    if (anime && anime.utils && anime.utils.set) {
      anime.utils.set(words, { translateY: '105%', opacity: 0 });
    }
    h1.classList.add('is-in');

    tween(words, {
      translateY: ['105%', '0%'],
      opacity: [0, 1],
      duration: 1050,
      delay: anime && anime.stagger ? anime.stagger(52, { start: 120 }) : 120,
      ease: EASE_OUT
    });

    /* Everything else in the hero cascades behind the headline. */
    var trail = $$('[data-hero-seq]');
    if (trail.length) {
      if (anime && anime.utils && anime.utils.set) {
        anime.utils.set(trail, { opacity: 0, translateY: 18 });
      }
      trail.forEach(function (el) {
        el.classList.add('is-in');
      });
      tween(trail, {
        opacity: [0, 1],
        translateY: [18, 0],
        filter: ['blur(6px)', 'blur(0px)'],
        duration: 800,
        delay: anime && anime.stagger ? anime.stagger(90, { start: 320 }) : 320,
        ease: EASE_OUT
      });
    }
  });

  /* ============================================== 7. Hero node network */

  mod('hero-canvas', function () {
    var canvas = $('.hero-canvas');
    if (!canvas || REDUCED) return;

    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [];
    var w = 0;
    var h = 0;
    var raf = null;
    var running = true;

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      /* Density scales with area, capped so phones stay smooth. */
      var count = Math.min(64, Math.max(18, Math.round((w * h) / 26000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          r: Math.random() * 1.4 + 0.6
        });
      }
    }

    var LINK = 132;

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        for (var j = i + 1; j < nodes.length; j++) {
          var m = nodes[j];
          var dx = n.x - m.x;
          var dy = n.y - m.y;
          var d2 = dx * dx + dy * dy;
          if (d2 < LINK * LINK) {
            var a = (1 - Math.sqrt(d2) / LINK) * 0.3;
            ctx.strokeStyle = 'rgba(129, 140, 248, ' + a.toFixed(3) + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }

        ctx.fillStyle = 'rgba(165, 180, 252, 0.5)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    resize();
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 180);
    });

    /* Stop painting when the hero is off screen or the tab is hidden. */
    function setRunning(next) {
      if (next === running) return;
      running = next;
      if (running) frame();
      else if (raf) cancelAnimationFrame(raf);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        setRunning(entries[0].isIntersecting && !document.hidden);
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      setRunning(!document.hidden);
    });

    frame();
  });

  /* ================================================ 8. Hero flow diagram */

  mod('flow-diagram', function () {
    var svg = $('.flow-svg');
    if (!svg) return;

    /* The node groups ship at opacity 0 so they can fade in. Without motion
       they must be shown immediately rather than left invisible. */
    if (REDUCED) {
      $$('[data-node]', svg).forEach(function (g) {
        g.setAttribute('opacity', '1');
      });
      $$('.packet', svg).forEach(function (p) {
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
            var drawables = anime.svg.createDrawable('.flow-svg .wire');
            anime.animate(drawables, {
              draw: ['0 0', '0 1'],
              duration: 1200,
              delay: anime.stagger(90),
              ease: 'inOutSine'
            });
          }
        } catch (e) {
          /* Wires simply appear undrawn — still correct. */
        }

        /* Fade the node boxes and labels up. */
        tween('.flow-svg [data-node]', {
          opacity: [0, 1],
          scale: [0.9, 1],
          duration: 700,
          delay: anime && anime.stagger ? anime.stagger(70, { start: 260 }) : 260,
          ease: EASE_OUT
        });

        /* Send packets travelling along each wire, forever. */
        try {
          if (anime && anime.svg && anime.svg.createMotionPath) {
            $$('.flow-svg .packet').forEach(function (packet, i) {
              var pathId = packet.getAttribute('data-path');
              var path = pathId ? $('#' + pathId, svg) : null;
              if (!path) return;
              var mp = anime.svg.createMotionPath(path);
              anime.animate(packet, {
                translateX: mp.translateX,
                translateY: mp.translateY,
                opacity: [
                  { to: 1, duration: 220 },
                  { to: 1, duration: 1400 },
                  { to: 0, duration: 260 }
                ],
                duration: 1900,
                delay: 900 + i * 320,
                loop: true,
                loopDelay: 600,
                ease: 'inOutQuad'
              });
            });
          }
        } catch (e) {
          $$('.flow-svg .packet').forEach(function (p) {
            p.style.display = 'none';
          });
        }

        /* Breathing ring around the AI core. */
        tween('.flow-svg .core-ring', {
          scale: [1, 1.16],
          opacity: [0.55, 0],
          duration: 2400,
          delay: anime && anime.stagger ? anime.stagger(800) : 0,
          loop: true,
          ease: 'outSine'
        });
      },
      0.3
    );
  });

  /* ======================================================= 9. Counters */

  mod('counters', function () {
    $$('[data-count]').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-count'));
      if (isNaN(target)) return;
      var prefix = el.getAttribute('data-prefix') || '';
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);

      function render(v) {
        el.textContent = prefix + v.toFixed(decimals) + suffix;
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
            duration: 1700,
            ease: EASE_SOFT,
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

  /* ================================================= 10. Process timeline */

  mod('timeline', function () {
    var timeline = $('.timeline');
    if (!timeline) return;

    var fill = $('.timeline-rail i', timeline);
    var steps = $$('.step', timeline);

    if (REDUCED) {
      if (fill) fill.style.transform = 'scaleX(1)';
      steps.forEach(function (s) {
        s.classList.add('is-lit');
      });
      return;
    }

    /* Light each badge as it arrives. */
    steps.forEach(function (step, i) {
      onceInView(
        step,
        function () {
          setTimeout(function () {
            step.classList.add('is-lit');
          }, i * 120);
        },
        0.5
      );
    });

    if (!fill) return;

    if (Motion && Motion.scroll) {
      onScrollProgress(
        function (p) {
          fill.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
        },
        { target: timeline, offset: ['start 85%', 'center 55%'] }
      );
    } else {
      onceInView(timeline, function () {
        fill.style.transition = 'transform 1.2s cubic-bezier(0.16,1,0.3,1)';
        fill.style.transform = 'scaleX(1)';
      });
    }
  });

  /* ========================================== 11. Demo tabs + chat replay */

  var CHAT_SCRIPTS = {
    instagram: [
      { side: 'in', text: 'Hi, is the black one still available in size L?', meta: 'Instagram DM' },
      { side: 'out', text: 'Yes — size L is in stock. Want me to reserve it for you?', meta: 'AI reply · 4s' },
      { side: 'in', text: 'Yes please, and how much is delivery to Oran?' },
      { side: 'out', text: 'Reserved. Delivery to Oran is 600 DA, 24–48h. Shall I confirm the order?', meta: 'Lead saved to CRM' }
    ],
    whatsapp: [
      { side: 'in', text: 'Where is my order? #4821', meta: 'WhatsApp Business' },
      { side: 'out', text: 'Order #4821 left our warehouse this morning and is out for delivery today.', meta: 'Pulled from your sheet' },
      { side: 'in', text: 'Can I change the address?' },
      { side: 'out', text: 'Sent to a human agent — Amine will reply here in a few minutes.', meta: 'Escalated · rule matched' }
    ],
    email: [
      { side: 'in', text: 'Quote request: 300 units, delivery before the 20th.', meta: 'contact@ inbox' },
      { side: 'out', text: 'Read, categorised as "Quote — high value", and logged.', meta: 'Classified · 2s' },
      { side: 'out', text: 'Draft quote prepared with your price list and pushed to your review queue.', meta: 'Awaiting your approval' }
    ],
    internal: [
      { side: 'in', text: 'New invoice PDF dropped in the shared Drive folder.', meta: 'Trigger' },
      { side: 'out', text: 'Fields extracted: supplier, total, due date, VAT.', meta: 'Document parsing' },
      { side: 'out', text: 'Row added to the accounting sheet and a summary posted to your team channel.', meta: 'n8n workflow · done' }
    ]
  };

  mod('demo', function () {
    var demo = $('.demo');
    if (!demo) return;

    var tabs = $$('.tab', demo);
    var panels = $$('.tab-panel', demo);
    if (!tabs.length) return;

    function playChat(panel) {
      var body = $('.chat-body', panel);
      if (!body) return;

      var key = panel.getAttribute('data-chat');
      var script = CHAT_SCRIPTS[key];
      if (!script) return;

      body.innerHTML = '';

      /* No motion: render the whole conversation at rest. */
      if (REDUCED || !anime || !anime.animate) {
        script.forEach(function (m) {
          body.appendChild(bubbleEl(m));
        });
        return;
      }

      var t = 260;
      script.forEach(function (m, i) {
        /* Typing indicator before each outgoing (automated) message. */
        if (m.side === 'out') {
          var typing = document.createElement('div');
          typing.className = 'typing';
          typing.innerHTML = '<i></i><i></i><i></i>';
          body.appendChild(typing);

          anime.animate(typing, { opacity: [0, 1], duration: 220, delay: t, ease: EASE_OUT });
          t += 240;
          var hideAt = t + 620;
          anime.animate(typing, {
            opacity: 0,
            duration: 160,
            delay: hideAt,
            ease: 'linear',
            onComplete: function () {
              if (typing.parentNode) typing.parentNode.removeChild(typing);
            }
          });
          t = hideAt + 140;
        }

        var el = bubbleEl(m);
        body.appendChild(el);
        anime.animate(el, {
          opacity: [0, 1],
          translateY: [10, 0],
          scale: [0.97, 1],
          duration: 520,
          delay: t,
          ease: EASE_OUT
        });
        t += i === 0 ? 520 : 700;
      });
    }

    function bubbleEl(m) {
      var el = document.createElement('div');
      el.className = 'bubble ' + m.side;
      el.textContent = m.text;
      if (m.meta) {
        var meta = document.createElement('span');
        meta.className = 'meta';
        meta.textContent = m.meta;
        el.appendChild(meta);
      }
      if (REDUCED) {
        el.style.opacity = '1';
        el.style.transform = 'none';
      }
      return el;
    }

    function select(index, replay) {
      tabs.forEach(function (t, i) {
        t.setAttribute('aria-selected', i === index ? 'true' : 'false');
        t.setAttribute('tabindex', i === index ? '0' : '-1');
      });
      panels.forEach(function (p, i) {
        if (i === index) p.setAttribute('data-active', '');
        else p.removeAttribute('data-active');
      });

      var panel = panels[index];
      if (!panel) return;

      if (!REDUCED && anime && anime.animate) {
        tween($$('.demo-copy > *', panel), {
          opacity: [0, 1],
          translateY: [12, 0],
          duration: 560,
          delay: anime.stagger ? anime.stagger(55) : 0,
          ease: EASE_OUT
        });
      }
      if (replay) playChat(panel);
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

    /* Wait until the demo is on screen before the first replay. */
    onceInView(
      demo,
      function () {
        select(0, true);
      },
      0.3
    );
  });

  /* ====================================================== 12. Accordion */

  mod('accordion', function () {
    $$('.accordion').forEach(function (acc) {
      var buttons = $$('.acc-btn', acc);

      buttons.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;

        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') === 'true';

          /* Single-open accordion: close the others first. */
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

      function expand(panel) {
        panel.hidden = false;
        var target = panel.firstElementChild ? panel.firstElementChild.offsetHeight : panel.scrollHeight;
        if (REDUCED || !anime || !anime.animate) {
          panel.style.height = 'auto';
          return;
        }
        anime.animate(panel, {
          height: [panel.offsetHeight, target],
          duration: 420,
          ease: EASE_OUT,
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
          duration: 320,
          ease: 'inOutQuad',
          onComplete: function () {
            panel.hidden = true;
          }
        });
      }
    });
  });

  /* ============================================ 13. Spotlight & magnetism */

  mod('spotlight', function () {
    if (REDUCED) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    var targets = $$('.spotlight, .glow-border');
    if (!targets.length) return;

    targets.forEach(function (el) {
      el.addEventListener(
        'pointermove',
        function (e) {
          var r = el.getBoundingClientRect();
          el.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
          el.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
        },
        { passive: true }
      );
    });
  });

  mod('magnetic', function () {
    if (REDUCED || !window.matchMedia('(hover: hover)').matches) return;

    var els = $$('[data-magnetic]');
    if (!els.length) return;

    els.forEach(function (el) {
      var strength = parseFloat(el.getAttribute('data-magnetic')) || 0.18;
      var animator = Motion && Motion.animate ? Motion.animate : null;

      function move(x, y) {
        if (animator) {
          animator(el, { x: x, y: y }, { type: 'spring', stiffness: 320, damping: 22, mass: 0.6 });
        } else {
          el.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        }
      }

      el.addEventListener(
        'pointermove',
        function (e) {
          var r = el.getBoundingClientRect();
          move((e.clientX - (r.left + r.width / 2)) * strength, (e.clientY - (r.top + r.height / 2)) * strength);
        },
        { passive: true }
      );

      el.addEventListener('pointerleave', function () {
        move(0, 0);
      });
    });
  });

  /* Cards lift with a spring rather than a linear transition. */
  mod('card-spring', function () {
    if (REDUCED || !Motion || !Motion.animate) return;
    if (!window.matchMedia('(hover: hover)').matches) return;

    $$('[data-lift]').forEach(function (el) {
      el.addEventListener('pointerenter', function () {
        Motion.animate(el, { y: -6, scale: 1.012 }, { type: 'spring', stiffness: 340, damping: 26, mass: 0.7 });
      });
      el.addEventListener('pointerleave', function () {
        Motion.animate(el, { y: 0, scale: 1 }, { type: 'spring', stiffness: 280, damping: 24 });
      });
    });
  });

  /* ============================================== 14. Legal page TOC sync */

  mod('toc', function () {
    var toc = $('.toc');
    if (!toc) return;

    var links = $$('a[href^="#"]', toc);
    if (!links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    var sections = [];
    links.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (!section) return;
      map[id] = a;
      sections.push(section);
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.remove('is-current');
          });
          var a = map[e.target.id];
          if (a) a.classList.add('is-current');
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );

    sections.forEach(function (s) {
      io.observe(s);
    });
  });

  /* ==================================================== 15. Contact form */

  /* No backend on this host, so the form composes a fully formatted mail in
     the visitor's mail client and also offers a copy-to-clipboard fallback.
     Nothing is silently swallowed and nothing pretends to have been sent. */

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
        if (fieldOf(input) && fieldOf(input).classList.contains('is-invalid')) validate(input);
      });
    });

    function shake(el) {
      if (REDUCED || !anime || !anime.animate) return;
      anime.animate(el, {
        translateX: [0, -7, 6, -4, 3, 0],
        duration: 420,
        ease: 'outQuad'
      });
    }

    function compose(data) {
      var lines = [
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
      ].filter(Boolean);
      return lines.join('\n');
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
        if (firstBad) {
          firstBad.focus();
          var field = fieldOf(firstBad);
          if (field) shake(field);
        }
        return;
      }

      var data = {};
      inputs.forEach(function (input) {
        data[input.name] = (input.value || '').trim();
      });

      var subject = 'New enquiry from ' + data.name + (data.company ? ' (' + data.company + ')' : '');
      var body = compose(data);
      var href = 'mailto:' + target + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

      if (status && statusBody) {
        statusBody.innerHTML =
          '<strong>Your email client is opening now.</strong>' +
          'If nothing happened, send the details straight to ' +
          '<a class="link link--brand" href="mailto:' +
          target +
          '">' +
          target +
          '</a> — or ' +
          '<button type="button" class="link link--brand" data-copy>copy your message</button> and paste it into any mail app.';
        status.classList.add('is-shown');

        var copyBtn = $('[data-copy]', status);
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            var payload = 'To: ' + target + '\nSubject: ' + subject + '\n\n' + body;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(payload).then(function () {
                copyBtn.textContent = 'copied ✓';
              });
            }
          });
        }

        if (!REDUCED && anime && anime.animate) {
          anime.animate(status, { opacity: [0, 1], translateY: [8, 0], duration: 420, ease: EASE_OUT });
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

      window.location.href = href;
    });
  });

  /* ============================================== 16. Anchor smooth scroll */

  mod('anchors', function () {
    $$('a[href^="#"]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;

      a.addEventListener('click', function (e) {
        var target = document.getElementById(href.slice(1));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'), 10) || 68) - 24;
        window.scrollTo({ top: top, behavior: REDUCED ? 'auto' : 'smooth' });
        /* Keep the URL and focus in sync for keyboard and screen-reader users. */
        history.replaceState(null, '', href);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  });
})();

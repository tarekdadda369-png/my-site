/* ==========================================================================
   TARIK DADDA — AI Automation
   Interaction & motion layer

   Libraries (vendored UMD globals, no build step, no CDN):
     window.anime   → anime.js v4   vendor/anime.umd.min.js
     window.Motion  → motion v12    vendor/motion.umd.min.js

   Motion here is deliberately quiet. The design language carries hierarchy
   through surfaces and hairlines, so animation only ever does two things:
   bring content in once, and replay the product demo. No parallax, no
   cursor-tracking glow, no springy hovers.

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

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

  /* ============================================== 1a. Language (AR/EN)

     The Arabic voice. Direction and fonts are set pre-paint by the inline
     head script; here the strings are swapped by walking every text node
     and translating exact (whitespace-collapsed) matches. Strings missing
     from the dictionary simply stay English — nothing can break.
     ------------------------------------------------------------------- */

  var IS_AR = document.documentElement.lang === 'ar';

  var AR = {
    /* chrome */
    "Skip to content": "تخطَّ إلى المحتوى",
    "Automation studio": "استوديو الأتمتة",
    "Home": "الرئيسية",
    "Services": "الخدمات",
    "About": "من نحن",
    "Contact": "تواصل",
    "Email": "البريد",
    "Book an audit": "احجز تقييماً",
    "Pages": "الصفحات",
    "Legal": "قانوني",
    "Instagram automation": "أتمتة إنستغرام",
    "WhatsApp automation": "أتمتة واتساب",
    "AI agent workflows": "وكلاء ذكاء اصطناعي",
    "n8n workflows": "مسارات n8n",
    "Privacy policy": "سياسة الخصوصية",
    "Terms of service": "شروط الخدمة",
    "Data deletion": "حذف البيانات",
    "Custom AI automation systems for businesses in Algeria. Practical solutions, real results, no hype.": "أنظمة أتمتة بالذكاء الاصطناعي مصمّمة خصيصاً للشركات في الجزائر. حلول عملية ونتائج حقيقية، بلا مبالغات.",
    "Available for new projects": "متاح لمشاريع جديدة",
    /* hero */
    "Automation that": "أتمتة تجيب،",
    "answers, sorts and": "وترتّب، وتتابع",
    "follows up for you.": "نيابةً عنك.",
    "I build custom AI systems for businesses in Algeria that handle the repetitive half of the job — replying to customers, qualifying leads, moving data between tools — so your team spends its hours on work that needs a human.": "أبني أنظمة ذكاء اصطناعي مخصّصة للشركات في الجزائر تتكفّل بالنصف المتكرر من العمل — الردّ على العملاء، وفرز الطلبات، ونقل البيانات بين أدواتك — ليقضي فريقك وقته في العمل الذي يحتاج إنساناً فعلاً.",
    "Book a free audit": "احجز تقييماً مجانياً",
    "See it working": "شاهده يعمل",
    "Automation services": "خدمة أتمتة",
    "Coverage once live": "تغطية بعد التشغيل",
    "Reply to enquiries": "للرد على الاستفسارات",
    "Languages handled": "لغات مدعومة",
    "day": "يوم",
    "no message missed": "لا رسالة تضيع",
    "escalates to a human": "يصعّد إلى إنسان",
    "you stay in control": "القرار يبقى لك",
    "running": "يعمل",
    "Connects the tools you already use": "يربط الأدوات التي تستخدمها أصلاً",
    /* services grid */
    "Eight systems that take work off your team": "ثمانية أنظمة ترفع العبء عن فريقك",
    "Each one is built around your workflow, your tools and your language. Nothing here is a template you have to bend your business around.": "كل نظام يُبنى حول طريقة عملك وأدواتك ولغتك. لا شيء هنا قالب جاهز تُجبر عملك على التأقلم معه.",
    "DMs, comments and story replies answered in seconds, with every serious enquiry captured as a lead.": "الرسائل والتعليقات وردود القصص تُجاب في ثوانٍ، مع تسجيل كل استفسار جاد كعميل محتمل.",
    "WhatsApp Business": "واتساب أعمال",
    "Order status, reminders and support triage on the channel your customers actually check.": "حالة الطلبات والتذكيرات وفرز الدعم على القناة التي يتابعها عملاؤك فعلاً.",
    "Messenger flows": "مسارات ماسنجر",
    "Guided conversations that answer the common questions and qualify buyers before a human steps in.": "محادثات موجّهة تجيب عن الأسئلة الشائعة وتؤهّل المشترين قبل تدخّل أي موظف.",
    "Email automation": "أتمتة البريد",
    "Enquiries classified and logged, with draft replies prepared from your own pricing.": "الاستفسارات تُصنّف وتُسجّل، مع مسودات ردود مُعدّة من أسعارك أنت.",
    "Agents that read, decide and act inside boundaries you define, with a human checkpoint where it matters.": "وكلاء يقرؤون ويقررون وينفّذون ضمن حدود تضعها أنت، مع نقطة مراجعة بشرية حيث يلزم.",
    "Document automation": "أتمتة المستندات",
    "Invoices and forms read automatically — fields extracted, rows written, reports generated.": "الفواتير والنماذج تُقرأ تلقائياً — الحقول تُستخرج، والصفوف تُكتب، والتقارير تُنشأ.",
    "Lead handling": "إدارة العملاء المحتملين",
    "Leads from every channel, de-duplicated, scored on your criteria and routed while still warm.": "عملاء محتملون من كل قناة، بلا تكرار، يُقيَّمون وفق معاييرك ويُوجَّهون وهم في ذروة الاهتمام.",
    "Internal workflows": "مسارات داخلية",
    "n8n pipelines that move data between your tools on a trigger or a schedule, with no re-typing.": "مسارات n8n تنقل البيانات بين أدواتك عند حدث أو بجدولة، من دون إعادة إدخال.",
    "Full service breakdown": "تفاصيل الخدمات كاملة",
    /* animatic */
    "How it runs": "كيف يعمل",
    "Follow one message from 23:40 to done": "تابع رسالة واحدة من 23:40 حتى الإنجاز",
    "The same pipeline, played out step by step. Scroll to move through it.": "المسار نفسه، خطوة بخطوة. مرّر للتنقل فيه.",
    "keep scrolling to play the sequence": "واصل التمرير لتشغيل المشهد",
    "A customer messages you at 23:40, long after everyone has gone home.": "عميل يراسلك في 23:40، بعد أن غادر الجميع بوقت طويل.",
    /* demo */
    "See it working": "شاهده يعمل",
    "What an automated conversation looks like": "هكذا تبدو المحادثة المؤتمتة",
    "Four illustrative scenarios showing how a system handles a real message — and how it knows when to hand the conversation to you.": "أربعة سيناريوهات توضيحية تُظهر كيف يتعامل النظام مع رسالة حقيقية — وكيف يعرف متى يسلّمك المحادثة.",
    "Instagram DM": "رسالة إنستغرام",
    "WhatsApp support": "دعم واتساب",
    "Email triage": "فرز البريد",
    "Internal workflow": "مسار داخلي",
    "A buyer asks about stock at midnight": "مشترٍ يسأل عن التوفر في منتصف الليل",
    "The system checks availability, answers in your tone, reserves the item and records the lead — before anyone on your team wakes up.": "يتحقق النظام من التوفر، ويجيب بأسلوبك، ويحجز المنتج، ويسجّل العميل — قبل أن يستيقظ أي أحد من فريقك.",
    "Reads intent, not just keywords": "يقرأ القصد، لا الكلمات المفتاحية فقط",
    "Answers from your live stock or price sheet": "يجيب من مخزونك أو قائمة أسعارك المباشرة",
    "Saves the contact and what they asked for": "يحفظ جهة الاتصال وما سألت عنه",
    "Hands over to a person the moment it should": "يسلّم لإنسان في اللحظة المناسبة",
    "automated": "مؤتمت",
    "assisted": "بمساعدة",
    "illustrative example": "مثال توضيحي",
    "reply in seconds": "رد في ثوانٍ",
    "\"Where is my order?\" answered instantly": "«أين طلبي؟» يُجاب فوراً",
    "The most common message in Algerian commerce, handled without a human. Anything unusual is escalated with the full context attached.": "الرسالة الأكثر شيوعاً في التجارة الجزائرية، تُعالج بلا تدخل بشري. وكل ما هو غير معتاد يُصعَّد مع كامل السياق.",
    "Looks up the order in your sheet or system": "يبحث عن الطلب في جدولك أو نظامك",
    "Replies with real status and timing": "يجيب بالحالة والتوقيت الحقيقيين",
    "Escalates address changes to a named agent": "يصعّد تغيير العنوان إلى موظف محدد",
    "Keeps the whole thread in one place": "يبقي المحادثة كاملة في مكان واحد",
    "escalation rules on": "قواعد التصعيد مفعّلة",
    "Quote requests never sit unread": "طلبات عروض الأسعار لا تبقى دون قراءة",
    "Incoming mail is classified, logged and turned into a draft reply built from your own pricing — waiting for your approval, not sent behind your back.": "البريد الوارد يُصنّف ويُسجّل ويتحول إلى مسودة رد مبنية من أسعارك — تنتظر موافقتك، ولا يُرسل شيء من خلف ظهرك.",
    "Categorises by intent and value": "يصنّف حسب القصد والقيمة",
    "Drafts from your real documents": "يصيغ المسودات من مستنداتك الحقيقية",
    "Nothing goes out without your approval": "لا شيء يخرج دون موافقتك",
    "Every enquiry logged and searchable": "كل استفسار مسجّل وقابل للبحث",
    "human approval step": "خطوة موافقة بشرية",
    "Paperwork that files itself": "أوراق تؤرشف نفسها بنفسها",
    "A supplier invoice lands in a folder. Fields are extracted, the accounting sheet is updated, and your team gets a short summary. No re-typing.": "فاتورة مورّد تصل إلى مجلد. تُستخرج الحقول، ويُحدَّث جدول المحاسبة، ويصل فريقك ملخص قصير. بلا إعادة إدخال.",
    "Triggered by a file, form or schedule": "يبدأ بملف أو نموذج أو جدولة",
    "Extracts supplier, totals, VAT and due dates": "يستخرج المورّد والمجاميع والضريبة وتواريخ الاستحقاق",
    "Writes to Sheets, Airtable or your database": "يكتب في Sheets أو Airtable أو قاعدة بياناتك",
    "Posts a digest to your team channel": "ينشر ملخصاً في قناة فريقك",
    "runs on every file": "يعمل مع كل ملف",
    /* why + stats */
    "Why work with me": "لماذا تعمل معي",
    "Built for your business, measured in hours saved": "مبني لعملك، ويُقاس بالساعات الموفَّرة",
    "Automation is only worth it if it survives contact with reality — your suppliers, your team, your busiest week. That is the standard everything here is held to.": "الأتمتة لا تستحق إلا إذا صمدت أمام الواقع — مورّدوك، فريقك، وأسبوعك الأكثر ازدحاماً. هذا هو المعيار الذي يُحاسب عليه كل شيء هنا.",
    "How I work": "كيف أعمل",
    "Custom-built, never templated.": "مبني خصيصاً، لا قوالب.",
    "Designed around your workflows, tools and goals.": "مصمَّم حول مساراتك وأدواتك وأهدافك.",
    "Outcomes, not features.": "نتائج، لا مزايا.",
    "Success is time saved and messages answered, not a longer feature list.": "النجاح هو وقت يُوفَّر ورسائل تُجاب، لا قائمة مزايا أطول.",
    "Days, not months.": "أيام، لا أشهر.",
    "Most systems are live within a week and improved from there.": "معظم الأنظمة تعمل خلال أسبوع ثم تُحسَّن تباعاً.",
    "Plain language.": "لغة واضحة.",
    "You will always know what is running, why, and how to change it.": "ستعرف دائماً ما الذي يعمل، ولماذا، وكيف تغيّره.",
    "You keep control.": "التحكم يبقى لك.",
    "Human approval wherever a mistake would cost you.": "موافقة بشرية حيثما كان الخطأ مكلفاً.",
    "You own it.": "النظام ملكك.",
    "Workflows run in your accounts. No platform holding your automation hostage.": "المسارات تعمل في حساباتك أنت. لا منصة تحتجز أتمتتك رهينة.",
    "Services offered": "خدمة متاحة",
    "Built per client": "يُبنى لكل عميل",
    "Lock-in platforms": "منصات احتكارية",
    /* process */
    "Process": "المنهجية",
    "Three steps from first call to running system": "ثلاث خطوات من أول مكالمة إلى نظام يعمل",
    "No long discovery phase, no twenty-page proposal. Find the bottleneck, build it, refine it with you.": "لا مرحلة استكشاف طويلة ولا عرض من عشرين صفحة. نجد عنق الزجاجة، نبنيه، ونصقله معك.",
    "Find the bottleneck": "إيجاد عنق الزجاجة",
    "A short call to map what your team repeats every day, where messages get lost, and what a good week would look like.": "مكالمة قصيرة لرسم ما يكرره فريقك يومياً، وأين تضيع الرسائل، وكيف يبدو الأسبوع الجيد.",
    "30–45 minutes · free": "30–45 دقيقة · مجاناً",
    "Build the system": "بناء النظام",
    "Built with the right tools for the job, connected to what you already use, with your rules and your tone of voice.": "يُبنى بالأدوات المناسبة للمهمة، موصولاً بما تستخدمه أصلاً، بقواعدك وبأسلوبك.",
    "Usually days, not months": "عادةً أيام، لا أشهر",
    "Test, train, improve": "اختبار وتدريب وتحسين",
    "Tested against real messages, handed over with training, then tuned once the system meets actual customers.": "يُختبر على رسائل حقيقية، ويُسلَّم مع تدريب، ثم يُضبط حين يواجه عملاء فعليين.",
    "Ongoing support": "دعم مستمر",
    /* about block */
    "Who you work with": "مع من تعمل",
    "A specialist, not a call centre": "متخصص، لا مركز اتصال",
    "I'm Tarik Dadda. I build AI automation for small and medium businesses across Algeria — distributors, importers, wholesalers, service companies and local shops losing hours to messages, forms and copy-paste.": "أنا طارق دادة. أبني أتمتة بالذكاء الاصطناعي للشركات الصغيرة والمتوسطة في الجزائر — موزّعون ومستوردون وتجار جملة وشركات خدمات ومحلات تخسر ساعات في الرسائل والنماذج والنسخ واللصق.",
    "You talk to the person who builds the system. No account managers relaying requirements, no surprises about what was actually delivered.": "تتحدث مباشرة مع من يبني النظام. لا مدراء حسابات ينقلون المتطلبات، ولا مفاجآت فيما سُلِّم فعلاً.",
    "The work is deliberately unglamorous: fewer missed messages, faster quotes, cleaner data, and a team that stops doing the same thing forty times a day.": "العمل بلا بهرجة عن قصد: رسائل ضائعة أقل، عروض أسعار أسرع، بيانات أنظف، وفريق يتوقف عن تكرار الشيء نفسه أربعين مرة في اليوم.",
    "Start a conversation": "ابدأ محادثة",
    "More about the approach": "المزيد عن المنهجية",
    "Tarik Dadda": "طارق دادة",
    "AI Automation Specialist · Algeria": "متخصص أتمتة بالذكاء الاصطناعي · الجزائر",
    "Works remotely with clients nationwide": "يعمل عن بُعد مع عملاء في كل الولايات",
    "Arabic, French and English — including the mix customers write in": "العربية والفرنسية والإنجليزية — بما فيها الخليط الذي يكتب به العملاء",
    "Systems run in your accounts, documented for your team": "الأنظمة تعمل في حساباتك، موثّقة لفريقك",
    "Honest about what should not be automated yet": "صراحة فيما لا يجب أتمتته بعد",
    /* FAQ home */
    "Questions": "أسئلة",
    "Before we start": "قبل أن نبدأ",
    "How much does an automation project cost?": "كم يكلّف مشروع الأتمتة؟",
    "It depends entirely on scope, so I quote per project rather than publishing a price list. A single channel — Instagram replies, for example — is a small, fast build. A connected system spanning several channels plus your internal tools is a larger one. The first call is free, and you get a fixed number before any work starts.": "يعتمد كلياً على النطاق، لذلك أسعّر لكل مشروع بدل نشر قائمة أسعار. قناة واحدة — ردود إنستغرام مثلاً — بناء صغير وسريع. أما نظام مترابط يشمل عدة قنوات مع أدواتك الداخلية فهو أكبر. المكالمة الأولى مجانية، وتحصل على رقم ثابت قبل بدء أي عمل.",
    "Do I need to change the tools my team already uses?": "هل عليّ تغيير الأدوات التي يستخدمها فريقي؟",
    "No — the point is the opposite. I connect what you already have. WhatsApp, Instagram, Gmail, Google Sheets, Drive, Airtable, Telegram, Slack, Notion and anything with an API or webhook can all be part of the same workflow. If a tool genuinely blocks the automation, I will say so and explain the options.": "لا — الفكرة عكس ذلك تماماً. أربط ما لديك أصلاً: واتساب، إنستغرام، Gmail، Google Sheets، Drive، Airtable، تيليغرام، Slack، Notion، وأي أداة لها API أو Webhook يمكن أن تكون جزءاً من المسار نفسه. وإن كانت أداةٌ ما تعيق الأتمتة فعلاً، سأقول ذلك وأشرح الخيارات.",
    "Will an AI reply to my customers with something wrong?": "هل سيجيب الذكاء الاصطناعي عملائي بمعلومة خاطئة؟",
    "That risk is designed out rather than hoped away. Answers come from your own data — stock, prices, order status — not from a model's guesswork. Anything outside the rules is escalated to a person instead of improvised. And for high-stakes messages such as quotes, the system prepares a draft and waits for your approval.": "هذا الخطر يُعالج بالتصميم لا بالتمني. الإجابات تأتي من بياناتك أنت — المخزون والأسعار وحالة الطلبات — لا من تخمين النموذج. وكل ما يخرج عن القواعد يُصعَّد إلى إنسان بدل الارتجال. وفي الرسائل الحساسة كعروض الأسعار، يجهّز النظام مسودة وينتظر موافقتك.",
    "What languages can the automations handle?": "ما اللغات التي تدعمها الأتمتة؟",
    "Arabic, French and English, including the mix of Algerian Arabic and French that customers actually write in. Tone is tuned on your real message history so replies sound like your business rather than a translated script.": "العربية والفرنسية والإنجليزية، بما في ذلك خليط الدارجة الجزائرية والفرنسية الذي يكتب به العملاء فعلاً. تُضبط النبرة على سجل رسائلك الحقيقي لتبدو الردود بصوت عملك لا كنص مترجم.",
    "Who owns the system once it is built?": "من يملك النظام بعد بنائه؟",
    "You do. Workflows run in your accounts wherever possible, and you get the documentation and training to operate them. There is no proprietary platform holding your automation hostage, and leaving does not mean starting over.": "أنت. تعمل المسارات في حساباتك حيثما أمكن، وتحصل على التوثيق والتدريب لتشغيلها. لا منصة مغلقة تحتجز أتمتتك، والمغادرة لا تعني البدء من الصفر.",
    "How long until something is actually running?": "كم يستغرق تشغيل شيء فعلي؟",
    "For a focused single-channel automation, usually within days of getting access to the accounts involved. Larger multi-system projects take longer, but I deliver in working pieces so you see value before the whole thing is finished.": "لأتمتة قناة واحدة محددة، عادةً خلال أيام من الحصول على صلاحيات الحسابات المعنية. المشاريع الأكبر متعددة الأنظمة تستغرق أطول، لكنني أسلّم على دفعات عاملة لترى القيمة قبل اكتمال كل شيء.",
    /* CTA */
    "Free audit · no obligation": "تقييم مجاني · بلا التزام",
    "Find out what an hour of your week is worth": "اكتشف كم تساوي ساعة من أسبوعك",
    "Tell me the task your team repeats most. I will tell you honestly whether automation is worth it — and what it would take.": "أخبرني بالمهمة التي يكررها فريقك أكثر. سأخبرك بصراحة إن كانت الأتمتة تستحق — وما الذي تتطلبه.",
    "Book the free audit": "احجز التقييم المجاني",
    "Email directly": "راسلني مباشرة",
    "contact@service.co.im · reply within one business day": "contact@service.co.im · رد خلال يوم عمل واحد",
    /* contact page */
    "Let's find the bottleneck": "لنجد عنق الزجاجة",
    "Tell me the task your team repeats most often. The first call is free, and if automation is not the answer I will say so.": "أخبرني بالمهمة التي يكررها فريقك أكثر. المكالمة الأولى مجانية، وإن لم تكن الأتمتة هي الحل فسأقول ذلك.",
    "Replying within one business day": "أرد خلال يوم عمل واحد",
    "Direct channels": "قنوات مباشرة",
    "Response time": "زمن الرد",
    "Within one business day": "خلال يوم عمل واحد",
    "Based in": "المقر",
    "Algeria · working remotely nationwide": "الجزائر · أعمل عن بُعد في كل الولايات",
    "Languages": "اللغات",
    "Arabic, French, English": "العربية، الفرنسية، الإنجليزية",
    "What to include": "ماذا تُضمِّن رسالتك",
    "The task your team repeats most often": "المهمة التي يكررها فريقك أكثر",
    "Roughly how many messages or documents per day": "تقريباً كم رسالة أو مستنداً في اليوم",
    "Which tools you already use": "ما الأدوات التي تستخدمها حالياً",
    "What \"solved\" would look like for you": "كيف يبدو «الحل» بالنسبة لك",
    "Prefer to talk it through? Say so in the message and I will suggest a time.": "تفضّل مكالمة؟ اذكر ذلك في الرسالة وسأقترح موعداً.",
    "Send a message": "أرسل رسالة",
    "Fields marked": "الحقول المعلّمة بـ",
    "are required.": "إلزامية.",
    "Full name": "الاسم الكامل",
    "Email address": "البريد الإلكتروني",
    "Phone / WhatsApp": "الهاتف / واتساب",
    "Company": "الشركة",
    "What are you interested in?": "بمَ أنت مهتم؟",
    "Not sure yet — help me decide": "لست متأكداً بعد — ساعدني في الاختيار",
    "WhatsApp Business automation": "أتمتة واتساب أعمال",
    "Facebook Messenger automation": "أتمتة فيسبوك ماسنجر",
    "Lead handling automation": "أتمتة إدارة العملاء المحتملين",
    "Internal workflow automation (n8n)": "أتمتة المسارات الداخلية (n8n)",
    "Something else": "شيء آخر",
    "What would you like to automate?": "ما الذي تودّ أتمتته؟",
    "Send message": "أرسل الرسالة",
    "This form opens your own email app with the details filled in, so your message goes straight to me with nothing stored on this website. By sending it you agree to the": "هذا النموذج يفتح تطبيق بريدك مع تعبئة التفاصيل، فتصلني رسالتك مباشرة دون تخزين أي شيء على هذا الموقع. بإرسالها فأنت توافق على",
    "privacy policy": "سياسة الخصوصية",
    /* form runtime strings */
    "This field is required.": "هذا الحقل إلزامي.",
    "Enter a valid email address, e.g. you@company.com": "أدخل بريداً إلكترونياً صحيحاً، مثل you@company.com",
    "Please add a little more detail (at least 12 characters).": "أضف مزيداً من التفاصيل من فضلك (12 حرفاً على الأقل).",
    "Opening your mail app…": "جارٍ فتح تطبيق البريد…",
    "Your email app is opening now.": "تطبيق بريدك يُفتح الآن.",
    "If nothing happened, send the details to": "إن لم يحدث شيء، أرسل التفاصيل إلى",
    "copy your message": "انسخ رسالتك",
    "and paste it into any mail client.": "والصقها في أي تطبيق بريد.",
    "copied": "نُسخت",
    /* placeholders */
    "Your full name": "اسمك الكامل",
    "you@company.com": "you@company.com",
    "Optional": "اختياري",
    "Tell me about your business and the task that eats the most time — the more concrete, the better the first answer.": "حدّثني عن عملك وعن المهمة التي تلتهم أكبر وقت — كلما كانت أدق، كانت الإجابة الأولى أفضل.",
    /* contact FAQ */
    "Before you write": "قبل أن تكتب",
    "Quick answers": "إجابات سريعة",
    "Is the first call really free?": "هل المكالمة الأولى مجانية فعلاً؟",
    "Yes. It is 30–45 minutes going through your workflow to find where automation would pay for itself. There is no obligation afterwards, and you get a straight answer even when that answer is \"this is not worth automating yet\".": "نعم. 30–45 دقيقة نمرّ فيها على طريقة عملك لنجد أين تسدّد الأتمتة تكلفتها بنفسها. لا التزام بعدها، وتحصل على إجابة صريحة حتى لو كانت «هذا لا يستحق الأتمتة بعد».",
    "What happens after I send this form?": "ماذا يحدث بعد إرسال النموذج؟",
    "You get a reply within one business day, usually with two or three questions about your setup. If it looks like a fit, we book the audit call. If it does not, I will tell you that too rather than keep you in a pipeline.": "يصلك رد خلال يوم عمل واحد، غالباً مع سؤالين أو ثلاثة عن وضعك. إن بدا الأمر مناسباً نحجز مكالمة التقييم، وإن لم يكن كذلك فسأخبرك بذلك أيضاً بدل إبقائك في قائمة انتظار.",
    "Do you need access to my accounts up front?": "هل تحتاج صلاحيات حساباتي منذ البداية؟",
    "No. Nothing is needed for the first conversation. Access is only requested once scope and price are agreed, and only for the specific accounts the automation touches. Credentials stay in your accounts wherever the platform allows it.": "لا. لا حاجة لأي شيء في المحادثة الأولى. تُطلب الصلاحيات فقط بعد الاتفاق على النطاق والسعر، ولحسابات محددة تمسّها الأتمتة. وتبقى بيانات الدخول في حساباتك حيثما سمحت المنصة.",
    "Which languages can we talk in?": "بأي لغة يمكننا التحدث؟",
    "Arabic, French or English — whichever you are most comfortable with. The automations themselves handle all three, including mixed Algerian Arabic and French.": "العربية أو الفرنسية أو الإنجليزية — أيّها كانت أريح لك. والأتمتة نفسها تتعامل مع الثلاث، بما فيها خليط الدارجة والفرنسية.",
    /* 404 */
    "Error 404": "الخطأ 404",
    "This page": "هذه الصفحة",
    "went missing.": "غير موجودة.",
    "The link is broken or the page has moved. Nothing automated about that — sorry. Try one of these instead.": "الرابط معطوب أو الصفحة انتقلت. لا شيء مؤتمت في هذا — عذراً. جرّب أحد هذه بدلاً منها.",
    "Back to homepage": "عودة إلى الرئيسية",
    "Browse services": "تصفّح الخدمات",
    "Report a broken link": "بلّغ عن رابط معطوب",
    /* legal chrome */
    "Last updated · 26 July 2026": "آخر تحديث · 26 جويلية 2026",
    "On this page": "في هذه الصفحة",
    "User data deletion": "حذف بيانات المستخدم"
  };

  var AR_LEGAL = {
    "How we collect, use and protect your personal information — written to be read, not skimmed past.": "كيف نجمع معلوماتك الشخصية ونستخدمها ونحميها — كُتبت لتُقرأ، لا لتُتجاوز.",
    "1. Information we collect": "1. المعلومات التي نجمعها",
    "2. How we use it": "2. كيف نستخدمها",
    "3. Meta platform integrations": "3. تكاملات منصات ميتا",
    "4. Data security": "4. أمن البيانات",
    "5. Data retention": "5. الاحتفاظ بالبيانات",
    "6. Sharing your information": "6. مشاركة معلوماتك",
    "7. Your rights": "7. حقوقك",
    "8. Cookies": "8. ملفات تعريف الارتباط",
    "9. Third-party links": "9. روابط الأطراف الثالثة",
    "10. Changes to this policy": "10. تعديلات هذه السياسة",
    "11. Contact us": "11. تواصل معنا",
    "This Privacy Policy describes how TARIK DADDA (\"we\", \"us\", or \"our\") collects, uses and protects your personal information when you visit our website at service.co.im or use our services.": "توضح سياسة الخصوصية هذه كيف يجمع طارق دادة («نحن») معلوماتك الشخصية ويستخدمها ويحميها عند زيارتك موقعنا service.co.im أو استخدامك خدماتنا.",
    "The short version.": "الخلاصة.",
    "We collect what you send us so we can reply and do the work. We do not sell your data. We only touch your social or business accounts after you explicitly connect them, and only for the automation you asked for.": "نجمع ما ترسله إلينا لنتمكن من الرد وإنجاز العمل. لا نبيع بياناتك. ولا نلمس حساباتك الاجتماعية أو التجارية إلا بعد أن تربطها بنفسك صراحةً، ولأجل الأتمتة التي طلبتها فقط.",
    "We collect information that you provide directly to us, as well as information collected automatically when you use our website or services.": "نجمع المعلومات التي تقدمها لنا مباشرة، إضافة إلى معلومات تُجمع تلقائياً عند استخدامك موقعنا أو خدماتنا.",
    "1.1 Information you provide": "1.1 المعلومات التي تقدمها",
    "When you contact us through our website or otherwise engage with our services, we may collect:": "عند تواصلك معنا عبر موقعنا أو تعاملك مع خدماتنا، قد نجمع:",
    "Your name and contact information (email address, phone number)": "اسمك ومعلومات الاتصال (البريد الإلكتروني، رقم الهاتف)",
    "Your company name and business details": "اسم شركتك وتفاصيل نشاطك",
    "Information about your automation needs and project requirements": "معلومات عن احتياجات الأتمتة لديك ومتطلبات مشروعك",
    "Any other information you choose to provide in your messages": "أي معلومات أخرى تختار تقديمها في رسائلك",
    "The contact form on this website does not store anything on our servers — it opens your own email application with the details filled in, so your message travels directly from you to us.": "نموذج التواصل في هذا الموقع لا يخزّن شيئاً على خوادمنا — بل يفتح تطبيق بريدك مع تعبئة التفاصيل، فتنتقل رسالتك مباشرة منك إلينا.",
    "1.2 Information collected automatically": "1.2 المعلومات المُجمَّعة تلقائياً",
    "When you visit our website, we may automatically collect:": "عند زيارتك موقعنا، قد نجمع تلقائياً:",
    "Your IP address and browser type": "عنوان IP الخاص بك ونوع المتصفح",
    "Pages you visit and time spent on our website": "الصفحات التي تزورها والوقت الذي تقضيه في موقعنا",
    "Referring website or search terms": "الموقع المُحيل أو عبارات البحث",
    "Device information and operating system": "معلومات الجهاز ونظام التشغيل",
    "2. How we use your information": "2. كيف نستخدم معلوماتك",
    "We use the information we collect for the following purposes:": "نستخدم المعلومات التي نجمعها للأغراض التالية:",
    "To respond to your enquiries:": "للرد على استفساراتك:",
    "contact data you provide through our contact form or email is used solely to respond to your questions, provide quotes and discuss potential projects.": "بيانات الاتصال التي تقدمها عبر نموذج التواصل أو البريد تُستخدم حصراً للرد على أسئلتك وتقديم عروض الأسعار ومناقشة المشاريع المحتملة.",
    "To provide our services:": "لتقديم خدماتنا:",
    "we use project-related information to design, build and maintain your custom automation systems.": "نستخدم معلومات المشروع لتصميم أنظمة الأتمتة المخصّصة لك وبنائها وصيانتها.",
    "To improve our website:": "لتحسين موقعنا:",
    "analytics data helps us understand how visitors use our site and improve the experience.": "بيانات التحليلات تساعدنا على فهم كيفية استخدام الزوار للموقع وتحسين التجربة.",
    "To communicate with you:": "للتواصل معك:",
    "we may send you updates about your project or respond to follow-up questions.": "قد نرسل إليك مستجدات مشروعك أو نرد على أسئلتك اللاحقة.",
    "Our automation services may interact with Meta platforms (Instagram, Facebook Messenger, WhatsApp)": "قد تتفاعل خدمات الأتمتة لدينا مع منصات ميتا (إنستغرام، فيسبوك ماسنجر، واتساب)",
    "only when you, the business owner, explicitly connect your accounts": "فقط عندما تربط أنت، صاحب النشاط، حساباتك صراحةً",
    "and authorise the integration. We do not:": "وتأذن بالتكامل. نحن لا:",
    "Access your Meta accounts without your explicit permission": "ندخل إلى حساباتك على ميتا دون إذنك الصريح",
    "Collect or store data from your social media followers without authorisation": "نجمع أو نخزّن بيانات متابعيك دون تفويض",
    "Use your social media data for any purpose other than the automation services you have requested": "نستخدم بيانات حساباتك الاجتماعية لأي غرض غير خدمات الأتمتة التي طلبتها",
    "All Meta platform integrations are configured according to Meta's Platform Terms and Data Processing Terms. You retain full control over what data is shared and can disconnect integrations at any time.": "كل تكاملات منصات ميتا مُهيّأة وفق شروط منصة ميتا وشروط معالجة البيانات لديها. وتحتفظ بالتحكم الكامل في ما يُشارك من بيانات ويمكنك فصل التكاملات في أي وقت.",
    "If you want data collected through one of these integrations deleted, see our": "إن أردت حذف بيانات جُمعت عبر أحد هذه التكاملات، راجع",
    "data deletion instructions": "تعليمات حذف البيانات",
    "We take reasonable measures to protect your information from unauthorised access, disclosure or destruction. However, no method of transmission over the internet or electronic storage is completely secure. We handle your data responsibly and limit access to only those who need it to provide our services.": "نتخذ تدابير معقولة لحماية معلوماتك من الوصول أو الإفشاء أو الإتلاف غير المصرّح به. ومع ذلك، لا توجد وسيلة نقل عبر الإنترنت أو تخزين إلكتروني آمنة تماماً. نتعامل مع بياناتك بمسؤولية ونحصر الوصول فيمن يحتاجه لتقديم خدماتنا.",
    "We retain your personal information only for as long as necessary to fulfil the purposes for which it was collected, including:": "نحتفظ بمعلوماتك الشخصية للمدة اللازمة فقط لتحقيق الأغراض التي جُمعت لأجلها، بما في ذلك:",
    "Providing the services you have requested": "تقديم الخدمات التي طلبتها",
    "Complying with legal obligations": "الالتزام بالواجبات القانونية",
    "Resolving disputes and enforcing our agreements": "حل النزاعات وإنفاذ اتفاقياتنا",
    "When your information is no longer needed, we will securely delete or anonymise it.": "عندما لا تعود معلوماتك لازمة، نحذفها أو نجعلها مجهولة الهوية بشكل آمن.",
    "We do not sell, trade or rent your personal information to third parties. We may share your information only in the following circumstances:": "لا نبيع معلوماتك الشخصية ولا نتاجر بها ولا نؤجّرها لأطراف ثالثة. وقد نشاركها فقط في الحالات التالية:",
    "Service providers:": "مزوّدو الخدمات:",
    "we may share information with trusted third-party service providers who assist us in operating our website or delivering our services, subject to confidentiality obligations.": "قد نشارك المعلومات مع مزوّدي خدمات موثوقين يساعدوننا في تشغيل موقعنا أو تقديم خدماتنا، مع التزامهم بالسرية.",
    "Legal requirements:": "المتطلبات القانونية:",
    "we may disclose information if required by law, court order or governmental regulation.": "قد نفصح عن المعلومات إذا اقتضى ذلك قانونٌ أو أمر قضائي أو لائحة حكومية.",
    "Business transfers:": "انتقال النشاط:",
    "in the event of a merger, acquisition or sale of assets, your information may be transferred as part of that transaction.": "في حال اندماج أو استحواذ أو بيع أصول، قد تُنقل معلوماتك ضمن تلك الصفقة.",
    "Depending on your location, you may have the right to:": "بحسب مكان إقامتك، قد يكون لك الحق في:",
    "Access the personal information we hold about you": "الاطلاع على المعلومات الشخصية التي نحتفظ بها عنك",
    "Request correction of inaccurate information": "طلب تصحيح المعلومات غير الدقيقة",
    "Request deletion of your personal information": "طلب حذف معلوماتك الشخصية",
    "Object to or restrict certain processing of your data": "الاعتراض على معالجات معينة لبياناتك أو تقييدها",
    "Withdraw consent where processing is based on consent": "سحب الموافقة حيث تستند المعالجة إليها",
    "To exercise any of these rights, contact us using the details below.": "لممارسة أي من هذه الحقوق، تواصل معنا عبر البيانات أدناه.",
    "Our website may use cookies and similar technologies to enhance your browsing experience. You can set your browser to refuse cookies or alert you when cookies are being sent. Note that some parts of our website may not function properly without cookies.": "قد يستخدم موقعنا ملفات تعريف الارتباط وتقنيات مشابهة لتحسين تجربتك. يمكنك ضبط متصفحك لرفضها أو تنبيهك عند إرسالها، علماً أن بعض أجزاء الموقع قد لا تعمل جيداً من دونها.",
    "Our website may contain links to third-party websites, and loads a web font from Google Fonts. We are not responsible for the privacy practices or content of those services. We encourage you to review the privacy policies of any third-party sites you visit.": "قد يحتوي موقعنا على روابط لمواقع خارجية، ويحمّل خطاً من Google Fonts. لسنا مسؤولين عن ممارسات الخصوصية أو محتوى تلك الخدمات، وننصحك بمراجعة سياسات الخصوصية لأي موقع خارجي تزوره.",
    "We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated \"Last updated\" date. We encourage you to review this policy periodically.": "قد نحدّث سياسة الخصوصية هذه من وقت لآخر، وتُنشر أي تعديلات في هذه الصفحة مع تحديث تاريخ «آخر تحديث». ننصحك بمراجعتها دورياً.",
    "If you have any questions or concerns about this Privacy Policy or our data practices, contact us:": "إن كانت لديك أي أسئلة أو مخاوف بشأن هذه السياسة أو ممارساتنا مع البيانات، تواصل معنا:",
    "Email:": "البريد:",
    "Website:": "الموقع:",
    "Location:": "العنوان:",
    "Algeria": "الجزائر",
    "The terms that govern this website and the custom automation systems built for you.": "الشروط التي تحكم هذا الموقع وأنظمة الأتمتة المخصّصة المبنية لك.",
    "1. Service description": "1. وصف الخدمة",
    "2. Acceptable use": "2. الاستخدام المقبول",
    "3. Customer responsibilities": "3. مسؤوليات العميل",
    "4. Intellectual property": "4. الملكية الفكرية",
    "5. Payment terms": "5. شروط الدفع",
    "6. Changes & maintenance": "6. التغييرات والصيانة",
    "7. Limitations of liability": "7. حدود المسؤولية",
    "8. Support": "8. الدعم",
    "9. Termination": "9. الإنهاء",
    "10. Governing law": "10. القانون المطبَّق",
    "11. Changes to these terms": "11. تعديلات هذه الشروط",
    "12. Contact": "12. التواصل",
    "These Terms of Service (\"Terms\") govern your access to and use of the services provided by TARIK DADDA (\"we\", \"us\", or \"our\"), including our website at service.co.im and any custom AI automation systems we build for you. By using our services, you agree to be bound by these Terms.": "تحكم شروط الخدمة هذه («الشروط») وصولك إلى الخدمات التي يقدمها طارق دادة («نحن») واستخدامك لها، بما في ذلك موقعنا service.co.im وأي أنظمة أتمتة مخصّصة نبنيها لك. باستخدامك خدماتنا فأنت توافق على الالتزام بهذه الشروط.",
    "TARIK DADDA provides custom AI automation services for businesses, including but not limited to:": "يقدم طارق دادة خدمات أتمتة مخصّصة بالذكاء الاصطناعي للشركات، ومنها على سبيل المثال لا الحصر:",
    "Social media automation (Instagram, Facebook Messenger, WhatsApp)": "أتمتة وسائل التواصل (إنستغرام، فيسبوك ماسنجر، واتساب)",
    "Email automation and workflow design": "أتمتة البريد الإلكتروني وتصميم المسارات",
    "AI agent development and deployment": "تطوير وكلاء الذكاء الاصطناعي ونشرهم",
    "Document automation and data processing": "أتمتة المستندات ومعالجة البيانات",
    "Lead handling and internal workflow automation": "إدارة العملاء المحتملين وأتمتة المسارات الداخلية",
    "n8n workflow design and implementation": "تصميم مسارات n8n وتنفيذها",
    "All services are custom-built based on individual client requirements. We do not provide off-the-shelf software or subscription-based platforms. Each engagement is scoped and priced individually based on the complexity and requirements of the project.": "كل الخدمات تُبنى خصيصاً وفق متطلبات كل عميل. لا نقدم برمجيات جاهزة ولا منصات اشتراك، ويُحدَّد نطاق كل تعاقد وسعره على حدة بحسب تعقيد المشروع ومتطلباته.",
    "You agree to use our services only for lawful purposes and in accordance with these Terms. You may not:": "توافق على استخدام خدماتنا للأغراض المشروعة فقط ووفقاً لهذه الشروط. ولا يجوز لك:",
    "Use our services to violate any applicable local, national or international law or regulation": "استخدام خدماتنا لانتهاك أي قانون أو لائحة محلية أو وطنية أو دولية",
    "Use our automation systems to send spam, unsolicited messages or harassing content": "استخدام أنظمتنا لإرسال رسائل مزعجة أو غير مرغوبة أو محتوى مضايق",
    "Attempt to gain unauthorised access to any part of our systems or third-party platforms integrated with our services": "محاولة الوصول غير المصرّح به إلى أي جزء من أنظمتنا أو المنصات الخارجية المتكاملة مع خدماتنا",
    "Use our services to infringe upon the intellectual property rights of others": "استخدام خدماتنا للتعدي على حقوق الملكية الفكرية للآخرين",
    "Interfere with or disrupt the integrity or performance of our services or connected third-party services": "التدخل في سلامة أو أداء خدماتنا أو الخدمات الخارجية المتصلة أو تعطيلها",
    "Use our automation for deceptive, fraudulent or malicious purposes": "استخدام الأتمتة لأغراض خادعة أو احتيالية أو خبيثة",
    "We reserve the right to suspend or terminate services if we determine, in our sole discretion, that you are violating these acceptable use provisions.": "نحتفظ بحق تعليق الخدمات أو إنهائها إذا رأينا، وفق تقديرنا، أنك تخالف أحكام الاستخدام المقبول هذه.",
    "To ensure successful delivery of our services, you agree to:": "لضمان نجاح تسليم خدماتنا، توافق على أن:",
    "Provide accurate and complete information about your business needs and existing systems": "تقدم معلومات دقيقة وكاملة عن احتياجات نشاطك وأنظمتك الحالية",
    "Grant necessary access to tools, accounts and APIs required for automation implementation": "تمنح الصلاحيات اللازمة للأدوات والحسابات وواجهات API المطلوبة لتنفيذ الأتمتة",
    "Respond to requests for feedback, approval and testing in a timely manner": "تستجيب لطلبات الملاحظات والموافقة والاختبار في وقت مناسب",
    "Maintain valid credentials and permissions for all third-party platforms integrated with our automations": "تحافظ على صلاحية بيانات الدخول والأذونات لكل المنصات الخارجية المتكاملة مع الأتمتة",
    "Ensure that your use of automated messaging and communication complies with applicable laws, including anti-spam regulations": "تتأكد من أن استخدامك للمراسلة المؤتمتة يلتزم بالقوانين السارية، بما فيها لوائح مكافحة الرسائل المزعجة",
    "Review and test automations before full deployment and report any issues promptly": "تراجع الأتمتة وتختبرها قبل التشغيل الكامل وتبلّغ عن أي مشكلات فوراً",
    "Delays caused by failure to meet these responsibilities may affect project timelines and are not our responsibility.": "التأخيرات الناتجة عن الإخلال بهذه المسؤوليات قد تؤثر على مواعيد المشروع ولا نتحمل مسؤوليتها.",
    "Upon full payment for our services, you receive a licence to use the custom automation workflows and configurations we build for your business. You may not resell, redistribute or use these automations to provide similar services to third parties without our written consent.": "بعد سداد كامل قيمة خدماتنا، تحصل على ترخيص باستخدام مسارات الأتمتة والإعدادات المبنية لنشاطك. ولا يجوز لك إعادة بيعها أو توزيعها أو استخدامها لتقديم خدمات مماثلة للغير دون موافقتنا الكتابية.",
    "We retain ownership of any proprietary tools, templates or methodologies developed during the course of our work. General industry knowledge and skills gained while working on your project are not considered your intellectual property.": "نحتفظ بملكية أي أدوات أو قوالب أو منهجيات خاصة طُوّرت أثناء عملنا. والمعرفة والمهارات العامة المكتسبة خلال مشروعك لا تُعد ملكية فكرية لك.",
    "Payment terms are agreed upon on a per-project basis and documented in our project proposal or agreement. Unless otherwise specified:": "تُتفق شروط الدفع لكل مشروع على حدة وتُوثَّق في عرضنا أو اتفاقيتنا. وما لم يُنص على خلاف ذلك:",
    "A deposit may be required before work begins": "قد تُطلب دفعة مقدمة قبل بدء العمل",
    "Final payment is due upon project completion or according to the agreed milestone schedule": "تُستحق الدفعة الأخيرة عند اكتمال المشروع أو وفق جدول المراحل المتفق عليه",
    "Late payments may result in suspension of services or support": "قد يؤدي التأخر في السداد إلى تعليق الخدمات أو الدعم",
    "6. Service changes and maintenance": "6. تغييرات الخدمة والصيانة",
    "We reserve the right to modify, suspend or discontinue any aspect of our services at any time. For ongoing automation maintenance:": "نحتفظ بحق تعديل أي جانب من خدماتنا أو تعليقه أو إيقافه في أي وقت. وبخصوص صيانة الأتمتة المستمرة:",
    "Changes to third-party APIs or platforms (such as Meta, WhatsApp or email providers) may require updates to your automations": "قد تستلزم تغييرات المنصات أو واجهات API الخارجية (مثل ميتا أو واتساب أو مزوّدي البريد) تحديثات على أتمتتك",
    "We will notify you of any changes that may affect your automations when commercially reasonable to do so": "سنخطرك بأي تغييرات قد تؤثر على أتمتتك متى كان ذلك معقولاً تجارياً",
    "Additional fees may apply for significant rework caused by third-party platform changes": "قد تُطبَّق رسوم إضافية على إعادة العمل الجوهرية الناتجة عن تغييرات المنصات الخارجية",
    "We are not responsible for service interruptions caused by third-party platform outages or policy changes": "لسنا مسؤولين عن انقطاع الخدمة الناتج عن أعطال المنصات الخارجية أو تغيّر سياساتها",
    "To the maximum extent permitted by applicable law:": "إلى أقصى حد يسمح به القانون المطبَّق:",
    "Our services are provided \"as is\" without warranties of any kind, either express or implied": "تُقدَّم خدماتنا «كما هي» دون ضمانات من أي نوع، صريحة كانت أو ضمنية",
    "We do not guarantee that our automations will be error-free, uninterrupted or meet all of your specific requirements": "لا نضمن أن تكون الأتمتة خالية من الأخطاء أو غير منقطعة أو ملبية لكل متطلباتك",
    "We are not liable for any indirect, incidental, special, consequential or punitive damages arising from your use of our services": "لسنا مسؤولين عن أي أضرار غير مباشرة أو عرضية أو خاصة أو تبعية أو عقابية تنشأ عن استخدامك خدماتنا",
    "Our total liability for any claim arising from our services shall not exceed the total amount you paid us for the specific project giving rise to the claim": "لا يتجاوز إجمالي مسؤوليتنا عن أي مطالبة ناشئة عن خدماتنا إجمالي ما دفعته لنا عن المشروع محل المطالبة",
    "We are not responsible for data loss, business interruption or reputational damage resulting from the use or failure of automation systems": "لسنا مسؤولين عن فقدان البيانات أو توقف الأعمال أو الضرر بالسمعة الناتج عن استخدام أنظمة الأتمتة أو تعطلها",
    "You acknowledge that AI and automation technologies have inherent limitations and that human oversight may be required for critical business decisions.": "تقرّ بأن لتقنيات الذكاء الاصطناعي والأتمتة حدوداً متأصلة، وأن القرارات التجارية الحرجة قد تتطلب إشرافاً بشرياً.",
    "Support terms are defined in our project agreement. Unless otherwise specified:": "تُحدَّد شروط الدعم في اتفاقية المشروع. وما لم يُنص على خلاف ذلك:",
    "We provide reasonable support to address bugs or issues with automations we have built during an agreed support period": "نقدم دعماً معقولاً لمعالجة الأخطاء أو المشكلات في الأتمتة التي بنيناها خلال فترة الدعم المتفق عليها",
    "Support does not cover issues caused by changes you make to the automation, third-party platform changes or misuse of the system": "لا يشمل الدعم المشكلات الناتجة عن تعديلاتك على الأتمتة أو تغييرات المنصات الخارجية أو سوء استخدام النظام",
    "Response times will be communicated at the start of each engagement": "تُبلَّغ أزمنة الاستجابة في بداية كل تعاقد",
    "Support requests should be sent to the contact email provided during onboarding": "تُرسل طلبات الدعم إلى بريد التواصل المقدم عند بدء التعامل",
    "Either party may terminate the service engagement with written notice:": "يجوز لأي من الطرفين إنهاء التعاقد بإشعار كتابي:",
    "You may terminate at any time by providing written notice": "يمكنك الإنهاء في أي وقت بإشعار كتابي",
    "We may terminate if you violate these Terms, fail to make payments or engage in unlawful activities using our services": "يجوز لنا الإنهاء إذا خالفت هذه الشروط أو تخلفت عن السداد أو مارست أنشطة غير مشروعة عبر خدماتنا",
    "Upon termination, you remain responsible for any outstanding payments for work completed": "عند الإنهاء، تظل مسؤولاً عن أي مستحقات عن العمل المُنجز",
    "We will provide reasonable assistance to transition or export your automation configurations upon request": "سنقدم مساعدة معقولة لنقل إعدادات الأتمتة أو تصديرها عند الطلب",
    "These Terms shall be governed by and construed in accordance with the laws of Algeria. Any disputes arising from these Terms or our services shall be subject to the exclusive jurisdiction of the courts of Algeria.": "تخضع هذه الشروط لقوانين الجزائر وتُفسَّر وفقها، وتختص محاكم الجزائر حصرياً بأي نزاع ينشأ عنها أو عن خدماتنا.",
    "We may update these Terms from time to time. Any changes will be posted on this page with an updated \"Last updated\" date. Your continued use of our services after any changes constitutes acceptance of the revised Terms.": "قد نحدّث هذه الشروط من وقت لآخر، وتُنشر أي تعديلات في هذه الصفحة مع تحديث تاريخ «آخر تحديث». واستمرارك في استخدام خدماتنا بعد أي تعديل يُعد قبولاً بالشروط المعدَّلة.",
    "12. Contact information": "12. بيانات التواصل",
    "If you have any questions about these Terms, contact us:": "إن كانت لديك أي أسئلة عن هذه الشروط، تواصل معنا:",
    "We respect your privacy and your right to control your personal data. Here is exactly how to have it deleted.": "نحترم خصوصيتك وحقك في التحكم ببياناتك الشخصية. إليك بالضبط كيفية حذفها.",
    "In one line:": "باختصار:",
    "email": "أرسل بريداً إلى",
    "with the subject": "بالموضوع",
    ", and your data is removed within 30 days.": "، وتُحذف بياناتك خلال 30 يوماً.",
    "How to request deletion": "كيفية طلب الحذف",
    "If you have connected your Facebook, Instagram, Messenger or WhatsApp account to our services and wish to delete your personal data, send us an email:": "إذا ربطت حسابك على فيسبوك أو إنستغرام أو ماسنجر أو واتساب بخدماتنا وأردت حذف بياناتك الشخصية، أرسل إلينا بريداً:",
    "Subject:": "الموضوع:",
    "Please include": "يُرجى تضمين",
    "Your full name.": "اسمك الكامل.",
    "The Facebook, Instagram or WhatsApp account associated with the request.": "حساب فيسبوك أو إنستغرام أو واتساب المرتبط بالطلب.",
    "Your email address, if it differs from the one you are writing from.": "بريدك الإلكتروني، إن كان مختلفاً عن الذي تراسلنا منه.",
    "A brief description of the data you want deleted.": "وصف موجز للبيانات التي تريد حذفها.",
    "We ask for these details only to confirm the request comes from you and to locate the right records. They are not used for anything else.": "نطلب هذه التفاصيل فقط للتأكد من أن الطلب صادر منك ولتحديد السجلات الصحيحة، ولا تُستخدم لأي غرض آخر.",
    "What happens next": "ماذا يحدث بعد ذلك",
    "We acknowledge your request, usually within one business day.": "نؤكد استلام طلبك، عادةً خلال يوم عمل واحد.",
    "We verify the request so that nobody can delete someone else's data.": "نتحقق من الطلب حتى لا يتمكن أحد من حذف بيانات غيره.",
    "We remove your personal data from our systems within 30 days, unless we are legally required to retain certain records.": "نحذف بياناتك الشخصية من أنظمتنا خلال 30 يوماً، ما لم يُلزمنا القانون بالاحتفاظ بسجلات معينة.",
    "You receive written confirmation by email once the deletion is complete.": "يصلك تأكيد كتابي بالبريد فور اكتمال الحذف.",
    "What this covers": "ما الذي يشمله هذا",
    "A deletion request covers the personal data held in our own systems as part of an automation we operate or have built. It does not delete data held by Meta, Google or any other platform under their own terms — for those, use the platform's own privacy settings and deletion tools.": "يشمل طلب الحذف البيانات الشخصية المحفوظة في أنظمتنا ضمن أتمتة نشغّلها أو بنيناها. ولا يحذف البيانات المحفوظة لدى ميتا أو غوغل أو أي منصة أخرى وفق شروطها — لتلك، استخدم إعدادات الخصوصية وأدوات الحذف في المنصة نفسها.",
    "If you are a business client and want an entire automation and its stored data removed, say so in the message and we will confirm the scope with you before deleting anything irreversible.": "إن كنت عميلاً تجارياً وأردت إزالة أتمتة كاملة مع بياناتها المخزنة، اذكر ذلك في الرسالة وسنؤكد معك النطاق قبل حذف أي شيء لا رجعة فيه.",
    "Privacy contact": "بيانات التواصل للخصوصية",
    "For any privacy question, including this process:": "لأي سؤال عن الخصوصية، بما في ذلك هذه العملية:",
    "See also our": "راجع أيضاً",
    "for what we collect and why.": "لمعرفة ما نجمعه ولماذا.",
    "Open a pre-filled request": "افتح طلباً مُعبَّأً مسبقاً",
    "Read the privacy policy": "اقرأ سياسة الخصوصية"
  };
  for (var _k in AR_LEGAL) AR[_k] = AR_LEGAL[_k];

  function t(s) {
    return (IS_AR && AR[s]) || s;
  }

  mod('theme', function () {
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        try {
          var light = document.documentElement.dataset.theme === 'light';
          localStorage.setItem('site-theme', light ? 'dark' : 'light');
        } catch (e) {}
        /* Reload so the canvas, fonts and every literal pick the theme up
           cleanly — same contract as the language toggle. */
        window.location.reload();
      });
    });
  });

  mod('i18n', function () {
    /* Toggle buttons work in both directions */
    $$('[data-lang-toggle]').forEach(function (btn) {
      if (IS_AR) {
        btn.textContent = btn.closest('.drawer-foot') ? 'English · EN' : 'EN';
        btn.setAttribute('aria-label', 'Switch to English');
      }
      btn.addEventListener('click', function () {
        try {
          localStorage.setItem('site-lang', IS_AR ? 'en' : 'ar');
        } catch (e) {}
        window.location.reload();
      });
    });

    if (!IS_AR) return;

    /* Swap every translatable text node in one pass */
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    var batch = [];
    while ((node = walker.nextNode())) {
      var parent = node.parentNode;
      if (!parent || parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE') continue;
      var key = node.nodeValue.replace(/\s+/g, ' ').trim();
      if (key && AR[key]) batch.push([node, AR[key]]);
    }
    batch.forEach(function (pair) {
      pair[0].nodeValue = pair[1];
    });

    /* Placeholders */
    $$('input[placeholder], textarea[placeholder]').forEach(function (el) {
      var key = el.getAttribute('placeholder').replace(/\s+/g, ' ').trim();
      if (AR[key]) el.setAttribute('placeholder', AR[key]);
    });
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

    var LIGHT = document.documentElement.dataset.theme === 'light';
    var WIPE = LIGHT ? 'rgba(246, 245, 241, 0.07)' : 'rgba(7, 8, 15, 0.055)';
    var COMPOSITE = LIGHT ? 'source-over' : 'lighter';
    var COLOURS = LIGHT
      ? ['rgba(234, 75, 113, 0.4)', 'rgba(183, 53, 87, 0.32)', 'rgba(122, 91, 234, 0.3)']
      : ['rgba(234, 75, 113, 0.30)', 'rgba(255, 113, 149, 0.22)', 'rgba(122, 91, 234, 0.20)'];

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
      ctx.fillStyle = LIGHT ? 'rgba(246, 245, 241, 1)' : 'rgba(7, 8, 15, 1)';
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
      ctx.fillStyle = WIPE;
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = COMPOSITE;
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
    if (document.documentElement.lang === 'ar') return;

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

  var BEATS = document.documentElement.lang === 'ar' ? [
    ['01', 'عميل يراسلك في 23:40، بعد أن غادر الجميع بوقت طويل.'],
    ['02', 'تصل الرسالة إلى نظام الأتمتة فوراً — لا أحد يحتاج إلى فتح تطبيق.'],
    ['03', 'يقرأ الوكيل القصد ويراجع مخزونك وأسعارك وطلباتك.'],
    ['04', 'يجيب بأسلوبك، يحجز المنتج، ويسجّل العميل المحتمل في نظامك.'],
    ['05', 'لا يتم إشراكك إلا عندما يحتاج القرار إلى إنسان فعلاً.']
  ] : [
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

  var THREADS = document.documentElement.lang === 'ar' ? {
    instagram: [
      { side: 'in', text: 'مرحباً، هل الأسود لا يزال متوفراً بمقاس L؟', meta: 'رسالة إنستغرام' },
      { side: 'out', text: 'نعم — مقاس L متوفر. هل أحجزه لك؟', meta: 'إجابة من جدول المخزون' },
      { side: 'in', text: 'نعم من فضلك، وكم سعر التوصيل إلى وهران؟' },
      { side: 'out', text: 'تم الحجز. التوصيل إلى وهران 600 دج خلال 24–48 ساعة. أؤكد الطلب؟', meta: 'سُجّل العميل في النظام' }
    ],
    whatsapp: [
      { side: 'in', text: 'أين طلبي؟ #4821', meta: 'واتساب أعمال' },
      { side: 'out', text: 'الطلب #4821 غادر المستودع هذا الصباح وهو في طريقه إليك اليوم.', meta: 'استعلام مباشر عن الطلب' },
      { side: 'in', text: 'هل يمكن تغيير عنوان التوصيل؟' },
      { side: 'out', text: 'حوّلت الطلب إلى موظف — سيجيبك أمين هنا خلال دقائق.', meta: 'تصعيد · تطابقت القاعدة' }
    ],
    email: [
      { side: 'in', text: 'طلب عرض سعر: 300 وحدة، التسليم قبل يوم 20.', meta: 'البريد المشترك' },
      { side: 'out', text: 'صُنّفت الرسالة \u00abعرض سعر — قيمة عالية\u00bb وسُجّلت باسم العميل.', meta: 'فرز · ثانيتان' },
      { side: 'out', text: 'جُهّزت مسودة العرض من قائمة أسعارك وهي بانتظار موافقتك.', meta: 'بانتظار موافقتك' }
    ],
    internal: [
      { side: 'in', text: 'فاتورة مورّد جديدة أُضيفت إلى مجلد Drive المشترك.', meta: 'مشغّل' },
      { side: 'out', text: 'استُخرج المورّد والمجموع والضريبة وتاريخ الاستحقاق.', meta: 'قراءة المستند' },
      { side: 'out', text: 'أُضيف صف إلى جدول المحاسبة ونُشر ملخص في قناة فريقك.', meta: 'اكتمل المسار' }
    ]
  } : {
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
        showError(input, t('This field is required.'));
        return false;
      }
      if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        showError(input, t('Enter a valid email address, e.g. you@company.com'));
        return false;
      }
      if (input.name === 'message' && value && value.length < 12) {
        showError(input, t('Please add a little more detail (at least 12 characters).'));
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
          '<strong>' + t('Your email app is opening now.') + '</strong>' +
          t('If nothing happened, send the details to') + ' ' +
          '<a class="link link--accent" href="mailto:' + target + '">' + target + '</a>' +
          ' — <button type="button" class="link link--accent" data-copy>' + t('copy your message') + '</button> ' +
          t('and paste it into any mail client.');
        status.classList.add('is-shown');

        var copyBtn = $('[data-copy]', status);
        if (copyBtn) {
          copyBtn.addEventListener('click', function () {
            var payload = 'To: ' + target + '\nSubject: ' + subject + '\n\n' + body;
            if (navigator.clipboard && navigator.clipboard.writeText) {
              navigator.clipboard.writeText(payload).then(function () {
                copyBtn.textContent = t('copied');
              });
            }
          });
        }
      }

      if (submit) {
        submit.textContent = t('Opening your mail app…');
        submit.disabled = true;
        setTimeout(function () {
          submit.textContent = t('Send message');
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

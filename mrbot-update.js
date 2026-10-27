(() => {
  'use strict';

  const AMAZON = 'https://www.amazon.com/gp/product/B0GM8M5BBX';
  const API = 'https://purge-shimmy-polish.ngrok-free.dev';
  const MODELS = [
    ['MRBot mini (Fast)', '/generate', '⚡'],
    ['MRBot MultiModal (Balanced)', '/generate2', '⚖️'],
    ['MRBot Complex/deep', '/generate3', '🧠']
  ];
  const ICON = 'MRBot_icon.png';
  const FILE = 'MRBot_Convertions.txt';
  const OFFLINE = 'MRBot is Offline. Please try again in 3-4 hours...';
  const GREET = "Hello! I'm MR Bot, your multimodal AI assistant. How can I help you today?";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const R = document.documentElement;

  const LS = {
    get(key) {
      try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn('MRBot LS:', e); }
    }
  };

  const tryFn = fn => { try { fn(); } catch (e) { console.warn('MRBot patch:', e); } };
  const formatTime = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const escapeHtml = s => String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c] || c));
  const fmt = s => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  const inFrame = window.top !== window.self;

  const style = document.createElement('style');
  style.textContent = `
    :root { --mr-a: #7c3aed; }
    html.mr-bn .en, html:not(.mr-bn) .bn { display: none !important; }
    .mr-meta { font-size: .7rem; opacity: .7; margin-top: 4px; }
    .mr-think { display: inline-block; font-size: .72rem; padding: 2px 8px; margin-bottom: 6px; border-radius: 10px; background: rgba(127,127,127,.18); }
    .mr-pop, .mr-drawer {
      position: absolute; z-index: 30; background: rgba(20, 20, 32, .97); color: #fff;
      border: 1px solid rgba(255,255,255,.15); box-shadow: 0 10px 30px rgba(0,0,0,.35);
      animation: mrIn .16s ease-out;
    }
    .mr-pop { top: 54px; right: 10px; border-radius: 12px; padding: 6px; min-width: 240px; }
    .mr-pop button, .mr-hi { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 10px; border: 0; border-radius: 8px; background: none; color: inherit; font: inherit; text-align: left; cursor: pointer; }
    .mr-pop button:hover, .mr-hi:hover { background: rgba(255,255,255,.12); }
    .mr-pop hr { border: 0; border-top: 1px solid rgba(255,255,255,.14); margin: 4px 0; }
    .mr-drawer { top: 0; left: 0; bottom: 0; width: min(290px, 82%); padding: 10px; overflow: auto; border-radius: 0 12px 12px 0; }
    .mr-hi { justify-content: space-between; }
    .mr-chips { display: flex; gap: 6px; overflow: auto; padding: 6px 10px; }
    .mr-chips button { flex: none; border: 1px solid var(--mr-a); background: transparent; border-radius: 16px; padding: 4px 11px; cursor: pointer; color: inherit; font: inherit; font-size: .78rem; }
    .mr-chips button:hover { background: var(--mr-a); color: #fff; }
    .mr-ad { display: flex; justify-content: center; margin: 8px 0; }
    .mr-fs { position: fixed !important; inset: 0 !important; z-index: 99999 !important; width: 100vw !important; height: 100dvh !important; max-width: none !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; }
    .mr-fs [data-mrbox] { height: auto !important; max-height: none !important; flex: 1 1 auto !important; }
    @keyframes mrIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { .mr-pop, .mr-drawer { animation: none; } }
  `;
  document.head.appendChild(style);

  // 1) Install / Get Full Access -> Amazon new tab
  tryFn(() => {
    $$('a[href*=".apk"]').forEach(a => {
      a.href = AMAZON;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    document.addEventListener('click', e => {
      const link = e.target.closest('a,button');
      if (!link) return;
      const text = (link.textContent || '').trim();
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href.includes('.apk') || /^(Install|Get Full Access)/i.test(text)) {
        e.preventDefault();
        e.stopPropagation();
        window.open(AMAZON, '_blank', 'noopener,noreferrer');
      }
    }, true);
  });

  // 2) Remove noisy sections and fix business hours / footer text
  tryFn(() => {
    const sectionHeading = [...$$('h1,h2,h3,h4,h5,h6')].find(h => /What Our Users Say|প্রশংসা/i.test(h.textContent || ''));
    const section = sectionHeading && (sectionHeading.closest('section') || sectionHeading.parentElement?.parentElement);
    if (section) section.remove();

    const removeBlocks = [/Our Team|আমাদের দল/i, /By the Numbers|সংখ্যা অনুসারে/i];
    removeBlocks.forEach(rx => {
      const heading = [...$$('h1,h2,h3,h4,h5,h6')].find(h => rx.test(h.textContent || ''));
      if (!heading) return;
      const parent = heading.parentElement;
      let next = heading.nextElementSibling;
      while (next && !(next.tagName.match(/^H[1-6]$/) && /Journey|Values|Get In Touch|Contact|যাত্রা|মূল্যবোধ|যোগাযোগ/i.test(next.textContent || ''))) {
        const tmp = next.nextElementSibling;
        next.remove();
        next = tmp;
      }
      heading.remove();
      if (parent && !parent.children.length && parent.tagName !== 'BODY') parent.remove();
    });

    const footer = $('footer');
    if (footer) {
      const p = $$('p', footer).find(x => /Our goal is to create|আমরা এমন মাল্টিমিডিয়া/i.test(x.textContent || ''));
      if (p) {
        const prev = p.previousElementSibling;
        if (prev && prev.querySelector('img') && !prev.textContent.trim()) prev.remove();
        p.remove();
      }
      const copyright = $$('p,div,span', footer).filter(x => /©/.test(x.textContent || '') && (x.textContent || '').length < 90).pop();
      if (copyright) {
        const parent = copyright.parentElement;
        copyright.remove();
        if (parent && parent !== footer && !parent.textContent.trim()) parent.remove();
      }
    }

    const rows = [
      [/Monday|Tuesday|Wednesday|Thursday/i, 'Sunday - Thursday: 11:00 AM - 11:00 PM (±1-2 hrs)', 'রবিবার - বৃহস্পতিবার: সকাল ১১:০০ - রাত ১১:০০ (১ - ২ ঘন্টা কমবেশি)'],
      [/Saturday/i, 'Saturday: 11:00 AM - 10:00 PM (±1-2 hrs)', 'শনিবার: সকাল ১১:০০ - রাত ১০:০০ (১ - ২ ঘন্টা কমবেশি)'],
      [/Sunday|Friday/i, 'Friday: Closed / Open by appointment', 'শুক্রবার: বন্ধ/খোলা']
    ];
    rows.forEach(([rx, en, bn]) => {
      const el = $$('p,div,li').filter(x => rx.test(x.textContent || '') && /\d|Closed|বন্ধ|খোলা/.test(x.textContent || '') && (x.textContent || '').length < 120).pop();
      if (el) el.innerHTML = `<span class="en">${en}</span><span class="bn notranslate">${bn}</span>`;
    });

    $$('img').forEach(img => {
      if (/poecdn/.test(img.src || '') || /MR Bot/i.test(img.alt || '')) {
        img.removeAttribute('srcset');
        img.src = ICON;
      }
    });
    let fav = $('link[rel~="icon"]');
    if (!fav) {
      fav = document.createElement('link');
      fav.rel = 'icon';
      document.head.appendChild(fav);
    }
    fav.href = ICON;
  });

  // 3) Full Bangla page fix (Google Translate + language state)
  tryFn(() => {
    let googleTranslateLoaded = 0;
    const applyLang = on => {
      R.classList.toggle('mr-bn', on);
      LS.set('mrbot_lang', on ? 'bn' : 'en');
      document.documentElement.lang = on ? 'bn' : 'en';
      if (!googleTranslateLoaded && !on) return;
      if (!googleTranslateLoaded) {
        googleTranslateLoaded = 1;
        const wrap = document.createElement('div');
        wrap.id = 'gte';
        wrap.hidden = true;
        document.body.appendChild(wrap);
        window.gtInit = () => {
          if (window.google && google.translate) {
            new google.translate.TranslateElement({ pageLanguage: 'en', includedLanguages: 'bn,en', autoDisplay: false }, 'gte');
          }
        };
        const s = document.createElement('script');
        s.src = 'https://translate.google.com/translate_a/element.js?cb=gtInit';
        document.head.appendChild(s);
      }
      const tick = () => {
        const combo = $('.goog-te-combo');
        if (combo) {
          combo.value = on ? 'bn' : 'en';
          combo.dispatchEvent(new Event('change'));
        } else setTimeout(tick, 250);
      };
      tick();
    };

    document.addEventListener('click', e => {
      const it = e.target.closest('button, a, span, div');
      if (!it) return;
      const txt = (it.textContent || '').trim();
      if (/^(\S+\s*)?বাংলা$/.test(txt)) { applyLang(true); }
      if (/^(\S+\s*)?English$/.test(txt)) { applyLang(false); }
    });

    const saved = LS.get('mrbot_lang');
    if (saved === 'bn' || R.lang === 'bn') applyLang(true);
    else { R.classList.remove('mr-bn'); document.documentElement.lang = 'en'; }
  });

  // 4) Accessibility extras
  tryFn(() => {
    const row = [...$$('*')].find(el => /Reduce Motion/i.test(el.textContent || ''))?.parentElement;
    if (!row) return;
    [['Highlight Links', 'mr-hl'], ['Readable Font', 'mr-read'], ['Line Spacing', 'mr-lh']].reverse().forEach(([label, cls]) => {
      const clone = row.cloneNode(true);
      clone.querySelectorAll('*').forEach(x => x.removeAttribute('onclick'));
      const labelNode = [...clone.querySelectorAll('*')].find(x => /Reduce Motion/i.test(x.textContent || ''));
      if (labelNode) labelNode.textContent = label;
      const sw = [...clone.querySelectorAll('*')].find(x => !x.children.length && /^(On|Off)$/.test((x.textContent || '').trim()));
      const setState = on => {
        R.classList.toggle(cls, on);
        if (sw) sw.textContent = on ? 'On' : 'Off';
        LS.set('mrbot_' + cls, on);
      };
      clone.addEventListener('click', () => setState(!R.classList.contains(cls)));
      setState(!!LS.get('mrbot_' + cls));
      row.after(clone);
    });
  });

  // 5) Scroll progress + back to top
  tryFn(() => {
    const bar = document.createElement('div');
    const up = document.createElement('button');
    bar.className = 'mr-bar';
    up.className = 'mr-top';
    up.textContent = '↑';
    up.title = 'Top';
    up.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });
    document.body.append(bar, up);
    const updateBar = () => {
      const max = Math.max(1, R.scrollHeight - innerHeight);
      const pct = (scrollY / max) * 100;
      bar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
      up.classList.toggle('on', scrollY > 700);
    };
    addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  });

  // 6) Real chatbot in demo
  tryFn(() => {
    const demo = $('#demo');
    if (!demo) return;

    const botTitle = [...$$('p,div', demo)].find(el => /Hello! I'm MR Bot|Hello! I am MR Bot/i.test(el.textContent || ''));
    const userText = [...$$('p,div', demo)].find(el => /Can you explain what makes you multimodal/i.test(el.textContent || ''));
    const input = $('input,textarea', demo) || $('#chat-input');
    const online = [...$$('p,div,span', demo)].find(el => /Online/i.test(el.textContent || ''));

    if (!botTitle || !userText || !input || !online) return;

    const box = botTitle.closest('[data-mrbox]') || botTitle.parentElement?.parentElement || demo;
    const common = demo.querySelector('.flex-1') || demo.querySelector('#chat-messages');
    if (common) common.dataset.mrbox = '1';
    const msgWrap = common || box;

    const strip = node => {
      const clone = node.cloneNode(true);
      clone.querySelectorAll('*').forEach(el => el.removeAttribute('onclick'));
      node.replaceWith(clone);
      return clone;
    };

    const getChatHeader = () => online.closest('[class*=head]') || online.parentElement?.parentElement || demo;
    let all = LS.get('mrbot_chats') || [];
    let cur = all[all.length - 1] || { id: Date.now(), msgs: [] };
    let modelIndex = +LS.get('mrbot_model') || 0;
    let busy = 0;
    let bannerCount = 0;

    const save = () => {
      LS.set('mrbot_chats', all.slice(-30).map(chat => ({ ...chat, msgs: (chat.msgs || []).slice(-200) })));
    };

    const chip = (meta) => {
      const d = document.createElement('div');
      d.className = 'mr-think';
      d.textContent = `${MODELS[meta.m][2]} ${MODELS[meta.m][0]} · 🤔 ${meta.d.toFixed(2)}s`;
      return d;
    };

    const metaText = (at, meta) => `📤 ${formatTime(at - meta.d * 1000)} → 📥 ${formatTime(at)} · ⏱ ${meta.d.toFixed(2)}s`;
    const addBubble = (role, text, at, meta) => {
      const row = document.createElement('div');
      row.className = 'flex items-start chat-bubble active';
      if (role === 'user') row.classList.add('justify-end');
      row.innerHTML = role === 'user'
        ? `<div class="mr-3 bg-blue-100 dark:bg-blue-900 rounded-lg rounded-tr-none px-4 py-2 max-w-xs sm:max-w-md"><p class="text-sm text-gray-900 dark:text-white">${fmt(text)}</p></div><div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center"><svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg></div>`
        : `<img src="${ICON}" alt="MR Bot" class="h-8 w-8 rounded-full" /><div class="ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 max-w-xs sm:max-w-md"><p class="text-sm text-gray-900 dark:text-white">${fmt(text)}</p></div>`;
      msgWrap.appendChild(row);
      if (meta) {
        const m = document.createElement('div');
        m.className = 'mr-meta';
        m.textContent = metaText(at, meta);
        msgWrap.appendChild(m);
      }
      msgWrap.scrollTop = msgWrap.scrollHeight;
      return row;
    };

    const renderChat = () => {
      if (!msgWrap) return;
      msgWrap.innerHTML = '';
      if (!cur?.msgs?.length) {
        addBubble('bot', GREET, Date.now());
      }
      (cur.msgs || []).forEach(msg => {
        if (msg.r === 'u') addBubble('user', msg.t, msg.at);
        if (msg.r === 'b') addBubble('bot', msg.t, msg.at, { m: msg.m, d: msg.d || 0 });
      });
      drawer();
    };

    const ensureChat = () => {
      if (!cur || !cur.msgs) cur = { id: Date.now(), msgs: [] };
      if (!all.some(c => c.id === cur.id)) all.push(cur);
      save();
    };

    const startNewChat = () => {
      cur = { id: Date.now(), msgs: [] };
      renderChat();
      ensureChat();
    };

    const typeText = (el, text) => new Promise(resolve => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.innerHTML = fmt(text);
        return resolve();
      }
      let i = 0;
      const step = Math.max(1, Math.ceil(text.length / 150));
      const timer = setInterval(() => {
        i += step;
        el.innerHTML = fmt(text.slice(0, i));
        msgWrap.scrollTop = msgWrap.scrollHeight;
        if (i >= text.length) { clearInterval(timer); resolve(); }
      }, 18);
    });

    const showAd = () => {
      if (inFrame) return;
      const adWrap = document.createElement('div');
      adWrap.className = 'mr-ad';
      const iframe = document.createElement('iframe');
      iframe.width = 300; iframe.height = 250; iframe.style.border = '0'; iframe.scrolling = 'no';
      iframe.srcdoc = `<body style="margin:0"><script>atOptions={key:'166cd95a37781f8e08654d0446ac7445',format:'iframe',height:250,width:300,params:{}};<\/script><script src="https://www.highperformanceformat.com/166cd95a37781f8e08654d0446ac7445/invoke.js"><\/script></body>`;
      adWrap.appendChild(iframe);
      msgWrap.appendChild(adWrap);
    };

    async function sendMsg(text) {
      const prompt = (text || input.value).trim();
      if (!prompt || busy) return;
      busy = 1;
      input.value = '';
      const startedAt = Date.now();
      const userMsg = { r: 'u', t: prompt, at: startedAt };
      if (!cur.msgs) cur.msgs = [];
      cur.msgs.push(userMsg);
      ensureChat();
      const [name, endpoint, icon] = MODELS[modelIndex];
      const responseBox = document.createElement('div');
      responseBox.className = 'flex items-start chat-bubble active';
      responseBox.innerHTML = `<img src="${ICON}" alt="MR Bot" class="h-8 w-8 rounded-full" /><div class="ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 max-w-xs sm:max-w-md"><p class="text-sm text-gray-900 dark:text-white">${icon} ${name}\n🤔 Thinking...\n      0.00s</p></div>`;
      msgWrap.appendChild(responseBox);
      msgWrap.scrollTop = msgWrap.scrollHeight;
      const t0 = performance.now();
      const timer = setInterval(() => {
        const textNode = responseBox.querySelector('p');
        if (textNode) {
          textNode.innerHTML = `${icon} ${name}<br>🤔 Thinking...<br>      ${((performance.now() - t0) / 1000).toFixed(2)}s`;
        }
      }, 60);

      let reply = OFFLINE;
      let ok = 1;
      try {
        const r = await fetch(API + endpoint + '?prompt=' + encodeURIComponent(prompt), {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': '1',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ prompt, max_length: '400', temperature: '0.7' }),
          signal: AbortSignal.timeout(120000)
        });
        const payload = await r.json();
        reply = payload?.response || OFFLINE;
      } catch (e) {
        ok = 0;
        reply = OFFLINE;
      }

      clearInterval(timer);
      const duration = (performance.now() - t0) / 1000;
      const meta = { m: modelIndex, d: duration };
      const textNode = responseBox.querySelector('p');
      if (textNode) {
        textNode.textContent = '';
        textNode.before(chip(meta));
        const msg = document.createElement('div');
        msg.className = 'text-sm text-gray-900 dark:text-white';
        textNode.replaceWith(msg);
        await typeText(msg, reply);
        const metaLine = document.createElement('div');
        metaLine.className = 'mr-meta';
        metaLine.textContent = metaText(Date.now(), meta);
        responseBox.appendChild(metaLine);
      }

      cur.msgs.push({ r: 'b', t: reply, at: Date.now(), m: modelIndex, d: duration });
      save();
      online.textContent = ok ? 'Online' : 'Offline';
      busy = 0;
      if (ok && ++bannerCount % 3 === 0) showAd();
      renderChat();
      if (document.body.classList.contains('mr-fs')) setTimeout(() => msgWrap.scrollTop = msgWrap.scrollHeight, 50);
    }

    const makeDownload = () => {
      const lines = all.map((chat, index) => `=== Chat ${index + 1} · ${new Date(chat.id).toLocaleString()} ===\n` + (chat.msgs || []).map(msg => `[${formatTime(msg.at)}] ${msg.r === 'u' ? 'You: ' : `MR Bot (${MODELS[msg.m]?.[0] || 'MRBot'}): `}${msg.t}`).join('\n'));
      const blob = new Blob(['\ufeffMR Bot - Conversations\n\n' + (lines.join('\n\n') || '(no messages yet)'), { type: 'text/plain;charset=utf-8' }]);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = FILE;
      document.body.appendChild(a);
      a.click();
      a.remove();
    };

    const downloadBtn = [...$$('button', demo)].find(el => /download|history|chat/i.test(el.textContent || ''));
    const leftIcon = [...$$('button', demo)].find(el => el.querySelector('svg')) || $('button', demo);
    if (leftIcon) {
      leftIcon.title = 'Download chat history (.txt)';
      leftIcon.addEventListener('click', e => { e.preventDefault(); makeDownload(); });
    }

    const chips = document.createElement('div');
    chips.className = 'mr-chips';
    chips.innerHTML = [
      'What can you do?',
      'Explain AI in simple words',
      'Write a short poem',
      'আমাকে একটি মজার গল্প লিখে দাও'
    ].map(text => `<button type="button">${text}</button>`).join('');
    const header = getChatHeader();
    if (header && header.parentElement) {
      header.parentElement.insertBefore(chips, header.nextElementSibling || null);
    }
    chips.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (btn) {
        const prompt = btn.textContent.trim();
        sendMsg(prompt);
      }
    });

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMsg();
      }
    });

    const sendBtn = $('#demo-send-button') || [...$$('button', demo)].find(btn => /send|submit/i.test(btn.textContent || ''));
    if (sendBtn) {
      sendBtn.addEventListener('click', e => {
        e.preventDefault();
        sendMsg();
      });
    }

    const head = getChatHeader();
    let dots = [...$$('button,[class*=dots],[class*=more],[class*=ellipsis],[class*=menu]', head)].pop();
    if (!dots) {
      dots = document.createElement('button');
      dots.textContent = '⋮';
      dots.style.cssText = 'margin-left:auto;background:none;border:0;color:inherit;font-size:22px;cursor:pointer;';
      head.appendChild(dots);
    }

    const win = head.closest('.max-w-3xl') || head.parentElement?.parentElement || demo;
    if (getComputedStyle(win).position === 'static') win.style.position = 'relative';

    const pop = document.createElement('div');
    const drawer = document.createElement('div');
    pop.className = 'mr-pop';
    drawer.className = 'mr-drawer';
    pop.hidden = true;
    drawer.hidden = true;
    win.append(pop, drawer);

    const fs = (enabled) => {
      win.classList.toggle('mr-fs', enabled);
      document.body.style.overflow = enabled ? 'hidden' : '';
      LS.set('mrbot_fs', enabled);
    };

    const makeHistoryDrawer = () => {
      if (drawer.hidden) return;
      drawer.innerHTML = '<button class="mr-hi" data-new>➕ New chat</button>' +
        all.slice().reverse().map(chat => `<div class="mr-hi" data-id="${chat.id}"><span>${escapeHtml((chat.msgs?.[0]?.t) || 'Chat')}</span><small>${new Date(chat.id).toLocaleString()}</small></div>`).join('');
    };

    const actions = {
      hist: () => { drawer.hidden = !drawer.hidden; makeHistoryDrawer(); },
      new: () => { startNewChat(); drawer.hidden = true; },
      fs: () => fs(!win.classList.contains('mr-fs')),
      dl: makeDownload,
      cp: async () => { const lastBot = [...(cur.msgs || [])].reverse().find(x => x.r === 'b'); if (lastBot && navigator.clipboard) await navigator.clipboard.writeText(lastBot.t); },
      clr: () => { if (confirm('Clear all chat history?')) { all = []; LS.set('mrbot_chats', []); startNewChat(); drawer.hidden = true; } }
    };

    const items = [
      ['🗂 Chat history', 'hist'],
      ['➕ New chat', 'new'],
      ['⛶ Fullscreen', 'fs'],
      ['⬇ Download history (.txt)', 'dl'],
      ['📋 Copy last reply', 'cp'],
      ['🗑 Clear history', 'clr']
    ];

    dots.addEventListener('click', e => {
      e.stopPropagation();
      pop.hidden = false;
      pop.innerHTML = items.map(([label, key]) => `<button data-k="${key}">${label}</button>`).join('') + '<hr>' + MODELS.map((m, i) => `<button data-m="${i}">${MODELS[i][2]} ${m[0]}</button>`).join('');
    });

    pop.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.dataset.m !== undefined) {
        modelIndex = +btn.dataset.m;
        LS.set('mrbot_model', modelIndex);
        pop.hidden = true;
        return;
      }
      const key = btn.dataset.k;
      if (key && actions[key]) { actions[key](); }
      pop.hidden = true;
    });

    drawer.addEventListener('click', e => {
      const newBtn = e.target.closest('[data-new]');
      if (newBtn) { startNewChat(); drawer.hidden = true; return; }
      const item = e.target.closest('[data-id]');
      if (!item) return;
      const id = Number(item.dataset.id);
      const content = all.find(c => c.id === id);
      if (content) {
        cur = content;
        renderChat();
        drawer.hidden = true;
      }
    });

    document.addEventListener('click', e => {
      if (!pop.contains(e.target) && !dots.contains(e.target)) pop.hidden = true;
      if (!drawer.contains(e.target) && !dots.contains(e.target) && !e.target.closest('[data-k]')) drawer.hidden = true;
    });

    addEventListener('keydown', e => {
      if (e.key === 'Escape' && win.classList.contains('mr-fs')) fs(false);
    });

    if (LS.get('mrbot_fs')) fs(true);
    if (all.length) {
      cur = all[all.length - 1];
      renderChat();
    } else startNewChat();
  });

  // 7) Left icon fallback download and safe external link handling
  tryFn(() => {
    const icon = [...$$('button, a, svg, i')].find(el => /chat|message|history/i.test((el.textContent || '').trim()) || el.querySelector('svg'));
    if (icon && !icon.dataset.fixed) {
      icon.dataset.fixed = '1';
      icon.addEventListener('click', e => {
        const text = (icon.textContent || '').trim();
        if (/history|download|chat/i.test(text)) {
          e.preventDefault();
          const fileName = 'MRBot_Convertions.txt';
          const blob = new Blob(['\ufeffMR Bot History\n\n' + new Date().toISOString()], { type: 'text/plain;charset=utf-8' });
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = fileName;
          document.body.appendChild(a); a.click(); a.remove();
        }
      });
    }
  });

})();

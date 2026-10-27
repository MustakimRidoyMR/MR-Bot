(() => {
  'use strict';

  const AMAZON = 'https://www.amazon.com/gp/product/B0GM8M5BBX';
  const API_BASE = 'https://purge-shimmy-polish.ngrok-free.dev';
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
    get(key, fallback = null) {
      try {
        const raw = localStorage.getItem(key);
        if (raw == null) return fallback;
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn('MRBot storage error:', e);
      }
    }
  };

  const tryFn = fn => { try { fn(); } catch (e) { console.warn('MRBot patch:', e); } };
  const formatClock = ts => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const escapeHtml = value => String(value ?? '').replace(/[&<>]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch] || ch));
  const inFrame = window.top !== window.self;

  const style = document.createElement('style');
  style.textContent = `
    :root { --mr-a: #7c3aed; }
    html.mr-bn .en, html:not(.mr-bn) .bn { display: none !important; }
    .mr-meta { font-size: .72rem; opacity: .7; margin-top: 4px; }
    .mr-think { display: inline-block; font-size: .72rem; padding: 2px 8px; margin-bottom: 6px; border-radius: 10px; background: rgba(127,127,127,.18); }
    .mr-grow { flex: 1; }
    .mr-pop, .mr-drawer {
      position: absolute; z-index: 35; background: rgba(15, 23, 42, .96); color: #fff;
      border: 1px solid rgba(255,255,255,.14); box-shadow: 0 10px 35px rgba(0,0,0,.35); border-radius: 12px;
    }
    .mr-pop { top: 54px; right: 10px; min-width: 240px; padding: 7px; }
    .mr-pop button, .mr-hi, .mr-drawer-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 9px 10px; border: 0; border-radius: 8px; background: transparent; color: inherit; text-align: left; cursor: pointer; font: inherit; }
    .mr-pop button:hover, .mr-hi:hover, .mr-drawer-item:hover { background: rgba(255,255,255,.09); }
    .mr-pop hr { border: 0; border-top: 1px solid rgba(255,255,255,.12); margin: 6px 0; }
    .mr-drawer { top: 0; left: 0; bottom: 0; width: min(300px, 82%); padding: 10px; overflow: auto; border-radius: 0 12px 12px 0; }
    .mr-hi { justify-content: space-between; }
    .mr-drawer-item { justify-content: space-between; }
    .mr-drawer-item small { opacity: .7; }
    .mr-chips { display: flex; gap: 8px; overflow-x: auto; padding-top: 8px; }
    .mr-chips button { flex: none; padding: 6px 12px; border-radius: 999px; border: 1px solid var(--mr-a); background: rgba(255,255,255,.04); color: inherit; cursor: pointer; font-size: .78rem; }
    .mr-chips button:hover { background: var(--mr-a); color: #fff; }
    .mr-ad-wrap { display: flex; justify-content: center; margin: 8px 0; }
    .mr-fs { position: fixed !important; inset: 0 !important; z-index: 99999 !important; width: 100vw !important; height: 100dvh !important; max-width: none !important; max-height: none !important; margin: 0 !important; border-radius: 0 !important; }
    .mr-fs [data-demo-shell] { height: 100dvh !important; }
    .mr-top { position: fixed; left: 16px; bottom: 16px; z-index: 99998; width: 42px; height: 42px; border: 0; border-radius: 50%; background: var(--mr-a); color: #fff; cursor: pointer; font-size: 1.3rem; opacity: 0; pointer-events: none; }
    .mr-top.on { opacity: 1; pointer-events: auto; }
    .mr-progress { position: fixed; top: 0; left: 0; height: 3px; background: var(--mr-a); z-index: 99997; width: 0; }
    .mr-side-ad { position: fixed; right: 16px; top: 50%; transform: translateY(-50%); z-index: 9999; padding: 10px 12px; border-radius: 12px; background: rgba(15, 23, 42, .9); color: #fff; border: 1px solid rgba(255,255,255,.12); cursor: pointer; font-size: .8rem; font-weight: 600; }
    .mr-side-ad.hidden { display: none; }
    @media (max-width: 768px) { .mr-side-ad { top: auto; bottom: 16px; transform: none; } }
  `;
  document.head.appendChild(style);

  const makeDownload = (chatList = []) => {
    const lines = chatList.map((chat, index) => {
      const header = `=== Chat ${index + 1} · ${new Date(chat.id).toLocaleString()} ===`;
      const msgs = (chat.msgs || []).map((msg) => {
        const prefix = msg.r === 'u' ? 'You: ' : `MR Bot (${MODELS[msg.m]?.[0] ?? 'MRBot'}): `;
        return `[${formatClock(msg.at)}] ${prefix}${msg.t}`;
      }).join('\n');
      return `${header}\n${msgs}`;
    }).join('\n\n');

    const blob = new Blob(['\ufeffMR Bot - Conversations\n\n' + (lines || '(no messages yet)'), { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = FILE;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  tryFn(() => {
    document.querySelectorAll('a[href*=".apk"]').forEach((a) => {
      a.href = AMAZON;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    });

    document.addEventListener('click', (event) => {
      const link = event.target.closest('a, button');
      if (!link) return;
      const text = (link.textContent || '').trim();
      const href = (link.getAttribute('href') || '').toLowerCase();
      if (href.includes('.apk') || /^(Install|Get Full Access)$/i.test(text)) {
        event.preventDefault();
        event.stopPropagation();
        window.open(AMAZON, '_blank', 'noopener,noreferrer');
      }
    }, true);
  });

  tryFn(() => {
    const applyBangla = (on) => {
      R.classList.toggle('mr-bn', on);
      document.documentElement.lang = on ? 'bn' : 'en';
      LS.set('mrbot_lang', on ? 'bn' : 'en');
      if (window.google && google.translate) {
        const combo = $('.goog-te-combo');
        if (combo) {
          combo.value = on ? 'bn' : 'en';
          combo.dispatchEvent(new Event('change'));
          return;
        }
      }
      let init = window.mrbotTranslateInit;
      if (!init) {
        const s = document.createElement('script');
        s.src = 'https://translate.google.com/translate_a/element.js?cb=mrbotTranslateInit';
        document.head.appendChild(s);
        window.mrbotTranslateInit = () => {
          const combo = $('.goog-te-combo');
          if (combo) {
            combo.value = on ? 'bn' : 'en';
            combo.dispatchEvent(new Event('change'));
          }
        };
      }
    };

    document.addEventListener('click', (event) => {
      const target = event.target.closest('button, a, span, div');
      if (!target) return;
      const text = (target.textContent || '').trim();
      if (/^বাংলা$/i.test(text)) applyBangla(true);
      if (/^English$/i.test(text)) applyBangla(false);
    }, true);

    if (LS.get('mrbot_lang') === 'bn') applyBangla(true);
  });

  tryFn(() => {
    const sideAd = document.createElement('button');
    sideAd.type = 'button';
    sideAd.className = 'mr-side-ad hidden';
    sideAd.textContent = 'Remove ad';
    sideAd.addEventListener('click', () => {
      document.querySelectorAll('iframe, script[src*="profitableratecpm"], script[src*="highperformanceformat"], .adsbygoogle, ins, [id^="container-"]').forEach((node) => {
        node.style.display = 'none';
      });
      sideAd.classList.add('hidden');
      LS.set('mrbot_ads_hidden', true);
    });
    document.body.appendChild(sideAd);
    if (!inFrame) {
      sideAd.classList.remove('hidden');
      if (LS.get('mrbot_ads_hidden', false)) sideAd.click();
    }
  });

  tryFn(() => {
    const progress = document.createElement('div');
    progress.className = 'mr-progress';
    document.body.appendChild(progress);

    const topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'mr-top';
    topBtn.textContent = '↑';
    topBtn.title = 'Back to top';
    topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.body.appendChild(topBtn);

    const update = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.max(0, (window.scrollY / max) * 100));
      progress.style.width = pct + '%';
      topBtn.classList.toggle('on', window.scrollY > 700);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  });

  tryFn(() => {
    const demo = document.getElementById('demo');
    if (!demo) return;

    const shell = demo.querySelector('[data-demo-shell]') || demo.querySelector('.max-w-3xl') || demo;
    shell.setAttribute('data-demo-shell', 'true');
    shell.style.position = shell.style.position || 'relative';

    const chatMessages = document.getElementById('chat-messages') || demo.querySelector('.overflow-y-auto');
    const input = document.getElementById('chat-input') || demo.querySelector('input,textarea');
    const sendBtn = document.getElementById('demo-send-button') || demo.querySelector('button:last-of-type');
    const statusNode = Array.from(demo.querySelectorAll('p, span, div')).find(el => /Online/i.test(el.textContent || ''));
    if (!chatMessages || !input || !sendBtn || !statusNode) return;

    let chats = LS.get('mrbot_demo_chats', []);
    if (!Array.isArray(chats) || !chats.length) {
      chats = [{ id: Date.now(), msgs: [{ r: 'b', t: GREET, at: Date.now(), m: 0, d: 0.1 }] }];
    }
    let active = chats[chats.length - 1];
    let modelIndex = Number(LS.get('mrbot_model', 0));
    let busy = false;
    let bannerCount = 0;

    const persist = () => {
      chats = chats.slice(-30);
      LS.set('mrbot_demo_chats', chats);
    };

    const ensureActive = () => {
      if (!active || !Array.isArray(active.msgs)) active = { id: Date.now(), msgs: [{ r: 'b', t: GREET, at: Date.now(), m: 0, d: 0.1 }] };
      if (!chats.some(chat => chat.id === active.id)) chats.push(active);
      persist();
    };

    const render = () => {
      ensureActive();
      chatMessages.innerHTML = '';
      (active.msgs || []).forEach((msg) => {
        const row = document.createElement('div');
        row.className = 'flex items-start chat-bubble active';
        if (msg.r === 'u') row.classList.add('justify-end');

        if (msg.r === 'u') {
          row.innerHTML = `
            <div class="mr-3 bg-blue-100 dark:bg-blue-900 rounded-lg rounded-tr-none px-4 py-2 max-w-xs sm:max-w-md">
              <p class="text-sm text-gray-900 dark:text-white">${escapeHtml(msg.t).replace(/\n/g, '<br>')}</p>
            </div>
            <div class="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
          `;
        } else {
          const avatar = document.createElement('img');
          avatar.src = ICON; avatar.alt = 'MR Bot'; avatar.className = 'h-8 w-8 rounded-full';
          const box = document.createElement('div');
          box.className = 'ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 max-w-xs sm:max-w-md';
          const text = document.createElement('p');
          text.className = 'text-sm text-gray-900 dark:text-white';
          text.innerHTML = escapeHtml(msg.t).replace(/\n/g, '<br>');
          box.appendChild(text);
          row.appendChild(avatar);
          row.appendChild(box);
          if (msg.m != null) {
            const meta = document.createElement('div');
            meta.className = 'mr-think';
            meta.textContent = `${MODELS[msg.m][2]} ${MODELS[msg.m][0]} · 🤔 ${(Number(msg.d || 0)).toFixed(2)}s`;
            row.appendChild(meta);
          }
        }
        chatMessages.appendChild(row);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const typeText = (el, text) => new Promise((resolve) => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.innerHTML = escapeHtml(text).replace(/\n/g, '<br>');
        resolve();
        return;
      }
      let idx = 0;
      const step = Math.max(1, Math.ceil(text.length / 120));
      const timer = setInterval(() => {
        idx += step;
        el.innerHTML = escapeHtml(text.slice(0, idx)).replace(/\n/g, '<br>');
        chatMessages.scrollTop = chatMessages.scrollHeight;
        if (idx >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, 18);
    });

    const renderHistoryDrawer = (drawer) => {
      if (drawer.hidden) return;
      drawer.innerHTML = '';
      const newBtn = document.createElement('button');
      newBtn.type = 'button';
      newBtn.className = 'mr-drawer-item';
      newBtn.innerHTML = '<span>➕ New chat</span>';
      newBtn.addEventListener('click', () => {
        active = { id: Date.now(), msgs: [{ r: 'b', t: GREET, at: Date.now(), m: 0, d: 0.1 }] };
        chats.push(active);
        persist();
        render();
        drawer.hidden = true;
      });
      drawer.appendChild(newBtn);

      chats.slice().reverse().forEach((chat) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'mr-drawer-item';
        const first = (chat.msgs || []).find(m => m.r === 'u') || (chat.msgs || [])[0] || { t: 'Chat' };
        item.innerHTML = `<span>${escapeHtml((first.t || 'Chat').slice(0, 30))}</span><small>${new Date(chat.id).toLocaleDateString()}</small>`;
        item.addEventListener('click', () => {
          active = chat;
          render();
          drawer.hidden = true;
        });
        drawer.appendChild(item);
      });
    };

    const responseBubble = async (reply, model, elapsedMs) => {
      const row = document.createElement('div');
      row.className = 'flex items-start chat-bubble active';
      const avatar = document.createElement('img');
      avatar.src = ICON; avatar.alt = 'MR Bot'; avatar.className = 'h-8 w-8 rounded-full';
      const box = document.createElement('div');
      box.className = 'ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 max-w-xs sm:max-w-md';
      const text = document.createElement('p');
      text.className = 'text-sm text-gray-900 dark:text-white';
      box.appendChild(text);
      const think = document.createElement('div');
      think.className = 'mr-think';
      think.textContent = `${MODELS[model][2]} ${MODELS[model][0]} · 🤔 ${(elapsedMs / 1000).toFixed(2)}s`;
      row.appendChild(avatar);
      row.appendChild(box);
      row.appendChild(think);
      chatMessages.appendChild(row);
      await typeText(text, reply);
      const meta = document.createElement('div');
      meta.className = 'mr-meta';
      meta.textContent = `📤 ${formatClock(Date.now() - elapsedMs)} → 📥 ${formatClock(Date.now())} · ⏱ ${(elapsedMs / 1000).toFixed(2)}s`;
      row.appendChild(meta);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const send = async (text) => {
      const prompt = (text || input.value).trim();
      if (!prompt || busy) return;
      busy = true;
      input.value = '';

      if (!active || !Array.isArray(active.msgs)) active = { id: Date.now(), msgs: [] };
      active.msgs.push({ r: 'u', t: prompt, at: Date.now() });
      ensureActive();
      render();

      const statusRow = document.createElement('div');
      statusRow.className = 'flex items-start chat-bubble active';
      const avatar = document.createElement('img');
      avatar.src = ICON; avatar.alt = 'MR Bot'; avatar.className = 'h-8 w-8 rounded-full';
      const box = document.createElement('div');
      box.className = 'ml-3 bg-gray-100 dark:bg-gray-700 rounded-lg rounded-tl-none px-4 py-2 max-w-xs sm:max-w-md';
      const textNode = document.createElement('p');
      textNode.className = 'text-sm text-gray-900 dark:text-white';
      textNode.innerHTML = `${MODELS[modelIndex][2]} ${MODELS[modelIndex][0]}<br>🤔 Thinking...<br>0.00s`;
      box.appendChild(textNode);
      statusRow.appendChild(avatar); statusRow.appendChild(box);
      chatMessages.appendChild(statusRow);

      const start = performance.now();
      const timer = setInterval(() => {
        textNode.innerHTML = `${MODELS[modelIndex][2]} ${MODELS[modelIndex][0]}<br>🤔 Thinking...<br>${((performance.now() - start) / 1000).toFixed(2)}s`;
      }, 60);

      let reply = OFFLINE;
      let ok = true;
      try {
        const endpoint = API_BASE + MODELS[modelIndex][1];
        const response = await fetch(endpoint + '?prompt=' + encodeURIComponent(prompt), {
          method: 'POST',
          headers: {
            'ngrok-skip-browser-warning': '1',
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({ prompt, max_length: '400', temperature: '0.7' }),
          signal: AbortSignal.timeout(120000)
        });
        const json = await response.json();
        reply = json?.response || OFFLINE;
      } catch (e) {
        ok = false;
        reply = OFFLINE;
      }

      clearInterval(timer);
      const elapsed = performance.now() - start;
      statusRow.remove();
      await responseBubble(reply, modelIndex, elapsed);
      active.msgs.push({ r: 'b', t: reply, at: Date.now(), m: modelIndex, d: elapsed / 1000 });
      persist();
      statusNode.textContent = ok ? 'Online' : 'Offline';
      if (ok && ++bannerCount % 3 === 0 && !inFrame) {
        const adWrap = document.createElement('div');
        adWrap.className = 'mr-ad-wrap';
        const iframe = document.createElement('iframe');
        iframe.width = 300; iframe.height = 250; iframe.style.border = '0'; iframe.scrolling = 'no';
        iframe.srcdoc = `<body style="margin:0"><script>atOptions={key:'166cd95a37781f8e08654d0446ac7445',format:'iframe',height:250,width:300,params:{}};<\/script><script src="https://www.highperformanceformat.com/166cd95a37781f8e08654d0446ac7445/invoke.js"><\/script></body>`;
        adWrap.appendChild(iframe);
        chatMessages.appendChild(adWrap);
      }
      busy = false;
    };

    const menuButton = document.createElement('button');
    menuButton.type = 'button';
    menuButton.textContent = '⋮';
    menuButton.style.cssText = 'margin-left:auto;background:none;border:0;color:inherit;font-size:22px;cursor:pointer;';
    const header = demo.querySelector('.justify-between') || demo.querySelector('.flex.items-center.justify-between') || demo;
    header.appendChild(menuButton);

    const pop = document.createElement('div');
    pop.className = 'mr-pop';
    pop.hidden = true;
    shell.appendChild(pop);

    const drawer = document.createElement('div');
    drawer.className = 'mr-drawer';
    drawer.hidden = true;
    shell.appendChild(drawer);

    const actions = {
      hist: () => { drawer.hidden = !drawer.hidden; renderHistoryDrawer(drawer); },
      new: () => { active = { id: Date.now(), msgs: [{ r: 'b', t: GREET, at: Date.now(), m: 0, d: 0.1 }] }; chats.push(active); persist(); render(); drawer.hidden = true; },
      fs: () => {
        const enable = !shell.classList.contains('mr-fs');
        shell.classList.toggle('mr-fs', enable);
        document.body.style.overflow = enable ? 'hidden' : '';
        LS.set('mrbot_fs', enable);
      },
      dl: () => makeDownload(chats),
      cp: async () => {
        const bot = [...(active.msgs || [])].reverse().find(m => m.r === 'b');
        if (bot && navigator.clipboard) await navigator.clipboard.writeText(bot.t);
      },
      clr: () => {
        if (confirm('Clear all chat history?')) {
          chats = [{ id: Date.now(), msgs: [{ r: 'b', t: GREET, at: Date.now(), m: 0, d: 0.1 }] }];
          active = chats[0];
          persist();
          render();
          drawer.hidden = true;
        }
      }
    };

    menuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      pop.hidden = false;
      pop.innerHTML = `
        <button type="button" data-action="hist">🗂 Chat history</button>
        <button type="button" data-action="new">➕ New chat</button>
        <button type="button" data-action="fs">⛶ Fullscreen</button>
        <button type="button" data-action="dl">⬇ Download history (.txt)</button>
        <button type="button" data-action="cp">📋 Copy last reply</button>
        <button type="button" data-action="clr">🗑 Clear history</button>
        <hr>
        ${MODELS.map((m, index) => `<button type="button" data-model="${index}">${m[2]} ${m[0]}</button>`).join('')}
      `;
    });

    pop.addEventListener('click', (event) => {
      const btn = event.target.closest('button');
      if (!btn) return;
      if (btn.dataset.model !== undefined) {
        modelIndex = Number(btn.dataset.model);
        LS.set('mrbot_model', modelIndex);
        pop.hidden = true;
        return;
      }
      const action = btn.dataset.action;
      if (action && actions[action]) actions[action]();
      pop.hidden = true;
    });

    drawer.addEventListener('click', (event) => {
      const item = event.target.closest('[data-id]');
      if (item) {
        const id = Number(item.dataset.id);
        const match = chats.find(chat => chat.id === id);
        if (match) { active = match; render(); drawer.hidden = true; }
      }
    });

    document.addEventListener('click', (event) => {
      if (!pop.contains(event.target) && !menuButton.contains(event.target)) pop.hidden = true;
      if (!drawer.contains(event.target) && !menuButton.contains(event.target) && !event.target.closest('[data-action]')) drawer.hidden = true;
    });

    const chips = document.createElement('div');
    chips.className = 'mr-chips';
    chips.innerHTML = ['What can you do?', 'Explain AI in simple words', 'Write a short poem', 'আমাকে একটি মজার গল্প লিখে দাও'].map(label => `<button type="button">${label}</button>`).join('');
    if (header && header.parentElement) header.parentElement.insertBefore(chips, header.nextElementSibling || null);
    chips.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) send(btn.textContent.trim());
    });

    sendBtn.addEventListener('click', (e) => { e.preventDefault(); send(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    if (LS.get('mrbot_fs', false)) {
      shell.classList.add('mr-fs');
      document.body.style.overflow = 'hidden';
    }

    render();
  });

  tryFn(() => {
    const fav = document.querySelector('link[rel~="icon"]') || document.createElement('link');
    fav.rel = 'icon';
    fav.href = ICON;
    if (!fav.parentNode) document.head.appendChild(fav);
  });
})();

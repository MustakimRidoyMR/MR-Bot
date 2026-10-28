// MR Bot proxy (Cloudflare Worker): keeps your ngrok URL and the x-api-token OFF the public page.
// 1) Cloudflare dashboard > Workers & Pages > Create > Hello World > Edit code > paste this file > Deploy.
// 2) Settings > Variables and Secrets (type "Secret"):
//      UPSTREAM = https://purge-shimmy-polish.ngrok-free.dev   (your ngrok base URL, no trailing slash)
//      TOKEN    = MR_BOT_SECRET_2026                            (the x-api-token your server expects)
// 3) Copy the worker URL (https://<name>.<you>.workers.dev) into  PROXY=''  near the top of the last <script> in index.html.
// 4) In index.html also change DIRECT=atob('...') to DIRECT='' so the ngrok address is no longer in the page source.
const ALLOWED = ['https://mustakimridoymr.github.io']; // add other site origins here
const EP = ['/generate', '/generate2', '/generate3'];

export default {
  async fetch(req, env) {
    const o = req.headers.get('Origin') || '', u = new URL(req.url);
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED.includes(o) ? o : ALLOWED[0],
      'Access-Control-Allow-Headers': 'content-type',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Vary': 'Origin'
    };
    const out = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, 'content-type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!ALLOWED.includes(o)) return out({ error: 'forbidden' }, 403);
    const h = { 'x-api-token': env.TOKEN, 'ngrok-skip-browser-warning': '1' };
    try {
      if (u.pathname === '/status') { // online check for the chat header
        const r = await fetch(env.UPSTREAM, { headers: h, signal: AbortSignal.timeout(6000) });
        return out({ online: !r.headers.get('ngrok-error-code') });
      }
      if (u.pathname === '/chat' && req.method === 'POST') {
        const b = await req.json(), p = String(b.prompt || '').trim().slice(0, 2000);
        if (!p) return out({ error: 'empty' }, 400);
        const ep = EP[+u.searchParams.get('m')] || EP[0];
        const body = new URLSearchParams({
          prompt: p,
          max_length: String(Math.min(Math.max(+b.max_length || 400, 50), 800)),
          temperature: String(Math.min(Math.max(+b.temperature || 0.7, 0.1), 1.5))
        });
        const r = await fetch(env.UPSTREAM + ep + '?prompt=' + encodeURIComponent(p), { method: 'POST', headers: h, body, signal: AbortSignal.timeout(110000) });
        let j;
        try { j = JSON.parse(await r.text()); } catch (e) { return out({ error: 'bad upstream reply' }, 502); }
        return out(j, r.ok ? 200 : 502);
      }
    } catch (e) { return out({ error: 'upstream' }, 502); }
    return out({ error: 'not found' }, 404);
  }
};

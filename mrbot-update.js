/* MR Bot page update. Add ONE line before </body> of index.html:  <script src="mrbot-update.js"></script>
   Put MRBot_icon.png next to index.html. Design/colors/other sections stay as they are. */
(()=>{'use strict';
const AMAZON='https://www.amazon.com/gp/product/B0GM8M5BBX',API=atob('aHR0cHM6Ly9wdXJnZS1zaGltbXktcG9saXNoLm5ncm9rLWZyZWUuZGV2'),
MODELS=[['MRBot mini (Fast)','/generate','⚡'],['MRBot MultiModal (Balanced)','/generate2','⚖️'],['MRBot Complex/deep','/generate3','🧠']],
ICON='MRBot_icon.png',AD='166cd95a37781f8e08654d0446ac7445',AD_EVERY=3,FILE='MRBot_Convertions.txt',
OFFLINE='MRBot is Offline. Please try again in 3-4 hours...',GREET="Hello! I'm MR Bot, your multimodal AI assistant. How can I help you today?";
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)],R=document.documentElement;
const LS={g(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},s(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const T=f=>{try{f()}catch(e){console.warn('MRBot patch:',e)}};
const hd=r=>$$('h1,h2,h3,h4,h5,h6').find(h=>r.test(h.textContent));
const leaf=(re,root=document)=>$$('*',root).filter(x=>re.test(x.textContent)&&![...x.children].some(c=>re.test(c.textContent))).pop();
const lca=(a,b)=>{while(a&&!a.contains(b))a=a.parentElement;return a};
const clock=t=>new Date(t).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const esc=s=>s.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const fmt=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\n/g,'<br>');
const strip=n=>{const c=n.cloneNode(true);[c,...$$('*',c)].forEach(x=>x.removeAttribute('onclick'));n.replaceWith(c);return c};
const inFrame=window.top!==window.self;

T(()=>{const s=document.createElement('style');s.textContent=`:root{--mr-a:#7c3aed}
.mr-bn .en,html:not(.mr-bn) .bn{display:none!important}
.skiptranslate>iframe,#goog-gt-tt,.goog-te-banner-frame{display:none!important}body{top:0!important}
.mr-meta{font-size:.7rem;opacity:.7;margin-top:4px}
.mr-think{display:inline-block;font-size:.72rem;padding:2px 8px;margin-bottom:6px;border-radius:10px;background:rgba(127,127,127,.18)}
.mr-pop,.mr-drawer{position:absolute;z-index:30;background:rgba(24,24,36,.97);color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:0 10px 30px rgba(0,0,0,.35);animation:mrIn .16s ease-out}
.mr-pop{top:54px;right:10px;border-radius:12px;padding:6px;min-width:240px}
.mr-pop button,.mr-hi{display:flex;gap:8px;align-items:center;width:100%;padding:9px 10px;border:0;border-radius:8px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}
.mr-pop button:hover,.mr-hi:hover{background:rgba(255,255,255,.12)}
.mr-pop hr{border:0;border-top:1px solid rgba(255,255,255,.14);margin:4px 0}
.mr-drawer{top:0;left:0;bottom:0;width:min(290px,82%);padding:10px;overflow:auto;border-radius:0 12px 12px 0}
.mr-hi{justify-content:space-between}.mr-hi small{opacity:.6;display:block}
.mr-chips{display:flex;gap:6px;overflow:auto;padding:6px 10px}
.mr-chips button{flex:none;border:1px solid var(--mr-a);background:none;color:inherit;border-radius:16px;padding:4px 11px;cursor:pointer;font:inherit;font-size:.78rem;transition:.15s}
.mr-chips button:hover{background:var(--mr-a);color:#fff}
.mr-ad{display:flex;justify-content:center;margin:8px 0}
.mr-fs{position:fixed!important;inset:0!important;z-index:99999!important;width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;margin:0!important;border-radius:0!important;display:flex!important;flex-direction:column}
.mr-fs [data-mrbox]{height:auto!important;max-height:none!important;flex:1 1 auto!important}
.mr-hl a{outline:2px solid #fb0;background:rgba(255,187,0,.18)!important;text-decoration:underline!important}
.mr-read *{font-family:Verdana,Arial,sans-serif!important;letter-spacing:.03em;word-spacing:.08em}
.mr-lh p,.mr-lh li{line-height:2!important}
.mr-top{position:fixed;left:16px;bottom:16px;z-index:900;width:42px;height:42px;border-radius:50%;border:0;background:var(--mr-a);color:#fff;font-size:20px;cursor:pointer;opacity:0;pointer-events:none;transition:opacity .2s}
.mr-top.on{opacity:1;pointer-events:auto}.mr-bar{position:fixed;top:0;left:0;height:3px;background:var(--mr-a);z-index:99998;width:0}
@keyframes mrIn{from{opacity:0;transform:translateY(-6px)}}@media(prefers-reduced-motion:reduce){.mr-pop,.mr-drawer{animation:none}}`;
document.head.append(s)});

/* 1. App links -> Amazon (new tab, no download) */
T(()=>{$$('a[href*=".apk"]').forEach(a=>{a.href=AMAZON;a.target='_blank';a.rel='noopener'});
document.addEventListener('click',e=>{const a=e.target.closest('a,button');if(!a)return;
if(/\.apk/.test(a.href||'')||/^(Install|Get Full Access)/i.test(a.textContent.trim())){e.preventDefault();e.stopImmediatePropagation();open(AMAZON,'_blank','noopener')}},true)});

/* 2. Remove sections / footer text, fix business hours, new icon */
T(()=>{const h=hd(/What Our Users Say|প্রশংসা/);if(h)(h.closest('section')||h.parentElement.parentElement).remove()});
T(()=>{const stop=/Journey|Values|Get In Touch|Contact|যাত্রা|মূল্যবোধ|যোগাযোগ/;
for(const r of[/Our Team|আমাদের দল/,/By the Numbers|সংখ্যা অনুসারে/]){const h=hd(r);if(!h)continue;const p=h.parentElement;let n=h.nextElementSibling;
while(n&&!(/^H[1-6]$/.test(n.tagName)&&stop.test(n.textContent))){const x=n.nextElementSibling;n.remove();n=x}
h.remove();if(p&&!p.children.length&&p.tagName!=='BODY')p.remove()}});
T(()=>{const f=$('footer');if(!f)return;const p=$$('p',f).find(x=>/Our goal is to create|আমরা এমন মাল্টিমিডিয়া/.test(x.textContent));
if(p){const b=p.previousElementSibling;if(b&&$('img',b)&&b.textContent.trim().length<20)b.remove();p.remove()}
const c=$$('p,div,span',f).filter(x=>/©/.test(x.textContent)&&x.textContent.length<90).pop();if(c){const q=c.parentElement;c.remove();if(q&&q!==f&&!q.textContent.trim())q.remove()}});
T(()=>{const rows=[[/Monday/,'Sunday - Thursday: 11:00 AM - 11:00 PM (±1-2 hrs)','রবিবার - বৃহস্পতিবার: সকাল ১১:০০ - রাত ১১:০০ (১-২ ঘন্টা কমবেশি)'],
[/Saturday/,'Saturday: 11:00 AM - 10:00 PM (±1-2 hrs)','শনিবার: সকাল ১১:০০ - রাত ১০:০০ (১ - ২ ঘন্টা কমবেশি)'],[/Sunday/,'Friday: Closed/Opened','শুক্রবার: বন্ধ/খোলা']];
rows.forEach(([r,en,bn])=>{const el=$$('p,div,li').filter(x=>r.test(x.textContent)&&/\d|Closed/.test(x.textContent)&&x.textContent.length<80).pop();
if(el)el.innerHTML=`<span class="en">${en}</span><span class="bn notranslate">${bn}</span>`})});
T(()=>{$$('img').forEach(i=>{if(/poecdn/.test(i.src)||/MR Bot/i.test(i.alt)){i.removeAttribute('srcset');i.src=ICON}});
let l=$('link[rel~=icon]');if(!l){l=document.createElement('link');l.rel='icon';document.head.append(l)}l.href=ICON});

/* 3. Full-page Bangla (Google Translate engine behind the existing language buttons) */
T(()=>{let gt=0;const bnOn=on=>{R.classList.toggle('mr-bn',on);LS.s('mrbot_lang',on?'bn':'en');if(!gt&&!on)return;
if(!gt){gt=1;const d=document.createElement('div');d.id='gte';d.hidden=true;document.body.append(d);
window.gtInit=()=>new google.translate.TranslateElement({pageLanguage:'en',includedLanguages:'bn,en',autoDisplay:false},'gte');
const s=document.createElement('script');s.src='https://translate.google.com/translate_a/element.js?cb=gtInit';document.head.append(s)}
const go=n=>{const c=$('.goog-te-combo');if(c){c.value=on?'bn':'en';c.dispatchEvent(new Event('change'))}else if(n<40)setTimeout(()=>go(n+1),300)};go(0)};
document.addEventListener('click',e=>{for(let b=e.target,i=0;b&&i<4;b=b.parentElement,i++){const t=b.textContent.trim();
if(/^(\S+\s*)?বাংলা$/.test(t)){bnOn(true);break}if(/^(\S+\s*)?English$/.test(t)){bnOn(false);break}}});
if(LS.g('mrbot_lang')==='bn'||R.lang==='bn')bnOn(true);else R.classList.remove('mr-bn')});

/* 4. Extra accessibility options */
T(()=>{const lab=leaf(/^Reduce Motion$/);if(!lab)return;const row=lab.parentElement;
[['Highlight Links','mr-hl'],['Readable Font','mr-read'],['Line Spacing','mr-lh']].reverse().forEach(([n,c])=>{const r=row.cloneNode(true);
[r,...$$('*',r)].forEach(x=>x.removeAttribute('onclick'));leaf(/^Reduce Motion$/,r).textContent=n;
const sw=$$('*',r).find(x=>!x.children.length&&/^(On|Off)$/.test(x.textContent.trim())),
set=on=>{R.classList.toggle(c,on);if(sw)sw.textContent=on?'On':'Off';LS.s('mrbot_'+c,on)};
r.addEventListener('click',()=>set(!R.classList.contains(c)));set(!!LS.g('mrbot_'+c));row.after(r)})});

/* 5. Scroll progress + back-to-top */
T(()=>{const bar=document.createElement('div'),up=document.createElement('button');bar.className='mr-bar';up.className='mr-top';up.textContent='↑';up.title='Top';
up.onclick=()=>scrollTo({top:0,behavior:'smooth'});document.body.append(bar,up);
addEventListener('scroll',()=>{bar.style.width=scrollY/(R.scrollHeight-innerHeight||1)*100+'%';up.classList.toggle('on',scrollY>700)},{passive:true})});

/* 6. Real chatbot in the demo */
T(()=>{const demo=$('#demo');if(!demo)return;
const bt=leaf(/Hello! I'm MR Bot/,demo),ut=leaf(/Can you explain what makes you multimodal/,demo),
inp0=$$('input,textarea',demo).find(i=>/essage/i.test(i.placeholder))||$('input,textarea',demo),on=leaf(/^\s*Online\s*$/,demo);
if(!bt||!ut||!inp0||!on)return;const box=lca(bt,ut);if(!box||box===demo)return;
const win=lca(lca(box,inp0),on);win.dataset.mrwin=1;box.dataset.mrbox=1;box.setAttribute('translate','no');
const wrap=n=>{while(n.parentElement!==box)n=n.parentElement;return n};bt.dataset.slot=ut.dataset.slot=1;
const tB=wrap(bt).cloneNode(true),tU=wrap(ut).cloneNode(true);
let bar=inp0.parentElement;while(bar!==win&&!$('button,[role=button]',bar))bar=bar.parentElement;
const cl=$$('button,[role=button]',bar),pre=cl.filter(b=>inp0.compareDocumentPosition(b)&2),post=cl.filter(b=>inp0.compareDocumentPosition(b)&4);
const sd0=post.pop()||cl.pop(),lf0=pre[0],inp=strip(inp0),send=strip(sd0),left=lf0&&strip(lf0);
const acc=()=>{const c=getComputedStyle(send).backgroundColor;if(c&&c!=='transparent'&&!/, 0\)$/.test(c))R.style.setProperty('--mr-a',c)};acc();
document.addEventListener('click',()=>setTimeout(acc,80));
let all=LS.g('mrbot_chats')||[],cur,mi=+LS.g('mrbot_model')||0,busy=0,nbot=0;
const save=()=>LS.s('mrbot_chats',all.slice(-30).map(c=>({...c,msgs:c.msgs.slice(-200)}))),sc=()=>{box.scrollTop=box.scrollHeight},
meta=(at,o)=>`📤 ${clock(at-o.d*1000)} → 📥 ${clock(at)} · ⏱ ${o.d.toFixed(2)}s`,
chip=(o)=>{const c=document.createElement('div');c.className='mr-think';c.textContent=`${MODELS[o.m][2]} ${MODELS[o.m][0]} · 🤔 ${o.d.toFixed(2)}s`;return c},
push=m=>{if(!all.includes(cur))all.push(cur);cur.msgs.push(m);save()};
function bub(r,txt,at,o){const w=(r==='u'?tU:tB).cloneNode(true);box.append(w);const s=$('[data-slot]',w)||w;s.innerHTML=fmt(txt);
if(o)s.before(chip(o));if(at){const m=document.createElement('div');m.className='mr-meta';m.textContent=o?meta(at,o):'🕒 '+clock(at);s.after(m);var mm=m}
sc();return{w,s,m:mm}}
const render=()=>{box.replaceChildren();bub('b',GREET);cur.msgs.forEach(x=>bub(x.r,x.t,x.at,x.r==='b'&&x.m!=null?x:null));drawer()},
nc=()=>{cur={id:Date.now(),msgs:[]};render()};
const type=(el,txt)=>new Promise(res=>{if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.innerHTML=fmt(txt);return res()}
let i=0;const st=Math.max(1,Math.ceil(txt.length/150)),id=setInterval(()=>{i+=st;el.innerHTML=fmt(txt.slice(0,i));sc();if(i>=txt.length){clearInterval(id);res()}},18)});
const ad=w=>{if(inFrame)return;const d=document.createElement('div'),f=document.createElement('iframe');d.className='mr-ad';f.width=300;f.height=250;f.style.border=0;f.scrolling='no';f.loading='lazy';
f.srcdoc=`<body style="margin:0"><script>atOptions={key:'${AD}',format:'iframe',height:250,width:300,params:{}}<\/script><script src="https://www.highperformanceformat.com/${AD}/invoke.js"><\/script>`;d.append(f);w.after(d);sc()};
async function go(txt){txt=(txt||inp.value).trim();if(!txt||busy)return;busy=1;inp.value='';const t1=Date.now();bub('u',txt,t1);push({r:'u',t:txt,at:t1});
const[mn,ep,ic]=MODELS[mi],th=bub('b','',t1),t0=performance.now();th.s.style.whiteSpace='pre-wrap';on.textContent='🤔 Thinking…';
const tick=setInterval(()=>{th.s.textContent=`${ic} ${mn}\n🤔 Thinking...\n      ${((performance.now()-t0)/1000).toFixed(2)}s`;sc()},50);
let rep,ok=1;try{const r=await fetch(API+ep+'?prompt='+encodeURIComponent(txt),{method:'POST',headers:{'ngrok-skip-browser-warning':'1','Content-Type':'application/x-www-form-urlencoded'},
body:new URLSearchParams({prompt:txt,max_length:400,temperature:.7}),signal:AbortSignal.timeout(120000)});rep=(await r.json()).response;if(!rep)throw 0}catch(e){ok=0;rep=OFFLINE}
clearInterval(tick);const d=(performance.now()-t0)/1000,at=Date.now(),o={m:mi,d};th.s.style.whiteSpace='';th.s.textContent='';th.s.before(chip(o));th.m.textContent=meta(at,o);
await type(th.s,rep);push({r:'b',t:rep,at,m:mi,d});busy=0;on.textContent=ok?'Online':'Offline';if(ok&&++nbot%AD_EVERY===0)ad(th.m);drawer()}
function dlh(){const t=all.map((c,i)=>`=== Chat ${i+1} · ${new Date(c.id).toLocaleString()} ===\n`+c.msgs.map(x=>`[${clock(x.at)}] `+(x.r==='u'?'You: ':`MR Bot${x.m!=null?` (${MODELS[x.m][0]}, ${x.d.toFixed(2)}s)`:''}: `)+x.t).join('\n')).join('\n\n');
const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeffMR Bot - Conversations\n\n'+(t||'(no messages yet)')],{type:'text/plain;charset=utf-8'}));a.download=FILE;document.body.append(a);a.click();a.remove()}
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}});send.addEventListener('click',e=>{e.preventDefault();go()});
if(left){left.title='Download chat history (.txt)';left.addEventListener('click',e=>{e.preventDefault();dlh()})}
const ch=document.createElement('div');ch.className='mr-chips';ch.innerHTML=['What can you do?','Explain AI in simple words','Write a short poem','আমাকে একটি মজার তথ্য বলো'].map(x=>`<button>${x}</button>`).join('');
bar.before(ch);ch.addEventListener('click',e=>{const b=e.target.closest('button');b&&go(b.textContent)});
addEventListener('offline',()=>on.textContent='Offline');addEventListener('online',()=>on.textContent='Online');if(!navigator.onLine)on.textContent='Offline';
/* three-dot menu, history drawer, fullscreen */
const head=on.closest('[class*=head]')||on.parentElement.parentElement;
let dots=$$('button,[class*=dots],[class*=more],[class*=ellipsis],[class*=menu]',head).pop();
if(dots)dots=strip(dots);else{dots=document.createElement('button');dots.textContent='⋮';dots.style.cssText='margin-left:auto;background:none;border:0;color:inherit;font-size:22px;cursor:pointer';head.append(dots)}
if(getComputedStyle(win).position==='static')win.style.position='relative';
const pop=document.createElement('div'),dr=document.createElement('div');pop.className='mr-pop';dr.className='mr-drawer';pop.hidden=dr.hidden=true;win.append(pop,dr);
const fs=v=>{win.classList.toggle('mr-fs',v);document.body.style.overflow=v?'hidden':'';LS.s('mrbot_fs',v);setTimeout(sc,60)};
function drawer(){if(dr.hidden)return;dr.innerHTML='<button class="mr-hi" data-n>➕ New chat</button>'+all.slice().reverse().map(c=>`<div class="mr-hi" data-id="${c.id}"><span>${esc((c.msgs[0]?c.msgs[0].t:'New chat').slice(0,34))}<small>${new Date(c.id).toLocaleString()}</small></span><b data-x>✕</b></div>`).join('')}
const act={hist:()=>{dr.hidden=!dr.hidden;drawer()},new:()=>{nc();dr.hidden=true},fs:()=>fs(!win.classList.contains('mr-fs')),dl:dlh,
cp:()=>{const l=[...cur.msgs].reverse().find(x=>x.r==='b');l&&navigator.clipboard&&navigator.clipboard.writeText(l.t)},clr:()=>{if(confirm('Clear all chat history?')){all=[];save();nc()}}},
items=[['🗂 Chat history','hist'],['➕ New chat','new'],['⛶ Fullscreen','fs'],['⬇ Download history (.txt)','dl'],['📋 Copy last reply','cp'],['🗑 Clear history','clr']];
dots.addEventListener('click',e=>{e.stopPropagation();acc();pop.innerHTML=items.map(([l,k])=>`<button data-k="${k}">${l}</button>`).join('')+'<hr>'+MODELS.map((m,i)=>`<button data-m="${i}">${i===mi?'✅':'⚪'} ${m[0]}</button>`).join('');pop.hidden=!pop.hidden});
pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.m!=null){mi=+b.dataset.m;LS.s('mrbot_model',mi)}else act[b.dataset.k]();pop.hidden=true});
document.addEventListener('click',e=>{if(!pop.contains(e.target))pop.hidden=true});
dr.addEventListener('click',e=>{if(e.target.closest('[data-n]')){nc();drawer();return}const it=e.target.closest('[data-id]');if(!it)return;const id=+it.dataset.id;
if(e.target.closest('[data-x]')){all=all.filter(c=>c.id!==id);save();if(cur.id===id)nc();drawer()}else{cur=all.find(c=>c.id===id);render();dr.hidden=true}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&win.classList.contains('mr-fs'))fs(false)});
cur=all[all.length-1];if(cur)render();else nc();if(LS.g('mrbot_fs'))fs(true)});
})();

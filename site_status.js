// Local status and reply-bank helpers for the MR Bot website.
const MRBOT = {
  STATUS_URL: "https://mrbot-kv.mdmustakimbillah992.workers.dev",
  CACHE_MS: 10 * 60 * 1000,
};

// Keep normalization aligned with the app and Kaggle cell.
function mrbotNorm(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ").replace(/[?.!।]+$/, "");
}

// Board status is cached in sessionStorage for 10 minutes.
async function mrbotBoard(force) {
  const key = "mrbot_board";
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (!force && cached && Date.now() - cached.t < MRBOT.CACHE_MS) return cached.d;
  } catch (e) {}

  try {
    const response = await fetch(MRBOT.STATUS_URL + "/status");
    if (!response.ok) throw new Error("Status request failed");
    const data = await response.json();
    try {
      sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) {}
    return data;
  } catch (e) {
    return { online: false };
  }
}

async function mrbotShowStatus(el) {
  if (!el) return;
  const board = await mrbotBoard(false);
  el.textContent = board.online ? "Online" : "Offline";
}

// Reply bank is refreshed only when its version differs from the status board.
async function mrbotBank() {
  let cached = null;
  try {
    cached = JSON.parse(localStorage.getItem("mrbot_bank") || "null");
  } catch (e) {}

  try {
    const board = await mrbotBoard(false);
    if (cached && (!board.bank_v || cached.v === board.bank_v)) return cached;
    const response = await fetch(MRBOT.STATUS_URL + "/bank");
    if (!response.ok) throw new Error("Reply bank request failed");
    const data = await response.json();
    try {
      localStorage.setItem("mrbot_bank", JSON.stringify(data));
    } catch (e) {}
    return data;
  } catch (e) {
    return cached || { v: 0, items: [] };
  }
}

const MRBOT_BUILTIN = {
  hi: "Hello! I'm MRBot. How can I help you today?",
  hello: "Hello! I'm MRBot. How can I help you today?",
  hey: "Hello! I'm MRBot. How can I help you today?",
  thanks: "You're welcome! 😊",
  "thank you": "You're welcome! 😊",
  bye: "Goodbye! Come back anytime.",
  "what is your name": "I'm MRBot, an AI chat assistant. 🤖",
  "who are you": "I'm MRBot, an AI chat assistant. 🤖",
};

async function mrbotAnswer(prompt) {
  const key = mrbotNorm(prompt);
  if (!key) return null;
  if (MRBOT_BUILTIN[key]) return MRBOT_BUILTIN[key];

  const bank = await mrbotBank();
  const items = (bank && bank.items) || [];
  for (const item of items) {
    if (item.p === key && item.a && item.a.length) {
      return item.a[Math.floor(Math.random() * item.a.length)];
    }
  }
  return null;
}

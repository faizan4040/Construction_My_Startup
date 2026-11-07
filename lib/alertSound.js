// Ringtone for new job alerts, generated with WebAudio (no mp3 file needed).
// Browsers only allow sound after the user touched the page once, so unlockAudio()
// is wired to the first click / tap by LabourAlerts.

let ctx = null;
let timer = null;
let stopAt = 0;

function getCtx() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

export function audioReady() {
  return getCtx()?.state === "running";
}

function chime() {
  const c = getCtx();
  if (!c || c.state !== "running") return;
  const t = c.currentTime;
  [[880, 0], [1175, 0.16], [1568, 0.32], [1175, 0.62], [1568, 0.78]].forEach(([f, d]) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + d);
    g.gain.exponentialRampToValueAtTime(0.4, t + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.3);
    o.connect(g).connect(c.destination);
    o.start(t + d);
    o.stop(t + d + 0.32);
  });
}

export function startRinging(ms = 30000) {
  stopRinging();
  unlockAudio();
  stopAt = Date.now() + ms;
  chime();
  timer = setInterval(() => {
    if (Date.now() > stopAt) return stopRinging();
    chime();
  }, 1800);
  try { navigator.vibrate?.([400, 150, 400, 150, 400]); } catch { /* not supported */ }
}

export function stopRinging() {
  clearInterval(timer);
  timer = null;
  try { navigator.vibrate?.(0); } catch { /* not supported */ }
}

// system notification when the tab is in the background
export function systemNotify(title, body, tag) {
  try {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (document.visibilityState === "visible") return;
    const n = new Notification(title, { body, tag, renotify: true, requireInteraction: true });
    n.onclick = () => { window.focus(); n.close(); };
  } catch { /* ignore */ }
}

export function askNotificationPermission() {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission();
  } catch { /* ignore */ }
}

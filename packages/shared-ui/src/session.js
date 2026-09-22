// Minimal cross-remote "auth" contract. This is intentionally the simplest
// thing that could work across independently-deployed apps that don't share
// a runtime store: a well-known localStorage key, plus a window CustomEvent
// so anyone *already mounted* (in another tab-of-the-app, or another remote)
// finds out immediately instead of on next reload. Same pattern as
// remote-notifications' unread-count broadcast.
const KEY = "nimbus-session";
const EVENT = "nimbus:session-changed";

export function getSession() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSession(session) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore (private browsing, blocked storage, etc.) */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { session } }));
}

export function clearSession() {
  setSession(null);
}

// Subscribes to session changes broadcast by *any* remote (or another tab,
// via the native `storage` event). Returns an unsubscribe function.
export function onSessionChange(handler) {
  function onCustom(ev) {
    handler(ev.detail.session);
  }
  function onStorage(ev) {
    if (ev.key === KEY) handler(getSession());
  }
  window.addEventListener(EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

export const SESSION_EVENT = EVENT;
export const SESSION_KEY = KEY;

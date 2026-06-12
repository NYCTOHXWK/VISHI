"use strict";
const AUTH = (() => {
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;
  const sessionKey = () => cfg().unlockSettings.sessionKey;
  const rateKey = () => cfg().unlockSettings.rateLimitKey;
  const reauthKey = "vishi_admin_reauth_until_v2";

  function storageFor(remember) { return remember ? localStorage : sessionStorage; }

  function getRateState() {
    try { return JSON.parse(localStorage.getItem(rateKey()) || "{}"); } catch { return {}; }
  }

  function setRateState(state) { localStorage.setItem(rateKey(), JSON.stringify(state)); }

  function lockoutRemaining() {
    const state = getRateState();
    return Math.max(0, (state.lockedUntil || 0) - Date.now());
  }

  function registerFailure() {
    const settings = cfg().security || {};
    const state = getRateState();
    const attempts = (state.attempts || 0) + 1;
    const max = settings.maxLoginAttempts || 5;
    const lockoutMinutes = settings.lockoutMinutes || 10;
    setRateState({ attempts, lockedUntil: attempts >= max ? Date.now() + lockoutMinutes * 60000 : 0 });
  }

  function clearFailures() { localStorage.removeItem(rateKey()); }

  async function login(username, password, remember) {
    const wait = lockoutRemaining();
    if (wait > 0) return { ok: false, message: `Too many attempts. Try again in ${Math.ceil(wait / 60000)} minute(s).` };
    const cleanUsername = Security.sanitizeText(username, 80).trim();
    const passwordHash = await Security.sha256(password || "");
    const user = cfg().users.find(account => account.username === cleanUsername && account.passwordHash === passwordHash && Security.validateRole(account.role));
    if (!user) {
      registerFailure();
      return { ok: false, message: "The username or password is not correct." };
    }
    clearFailures();
    const now = Date.now();
    const timeout = (remember ? cfg().session.rememberDays * 86400000 : cfg().session.timeoutMinutes * 60000);
    const session = {
      username: user.username,
      role: user.role,
      issuedAt: now,
      expiresAt: now + timeout,
      remember: !!remember,
      fingerprint: await Security.fingerprint()
    };
    storageFor(remember).setItem(sessionKey(), JSON.stringify(session));
    if (remember) sessionStorage.removeItem(sessionKey());
    else localStorage.removeItem(sessionKey());
    return { ok: true, user: session };
  }

  function readSession() {
    const raw = sessionStorage.getItem(sessionKey()) || localStorage.getItem(sessionKey());
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  async function current() {
    const session = readSession();
    if (!session || !Security.validateRole(session.role) || session.expiresAt <= Date.now()) {
      logout(false);
      return null;
    }
    const account = cfg().users.find(user => user.username === session.username && user.role === session.role);
    if (!account || session.fingerprint !== await Security.fingerprint()) {
      logout(false);
      return null;
    }
    return session;
  }

  function logout(redirect = true) {
    localStorage.removeItem(sessionKey());
    sessionStorage.removeItem(sessionKey());
    sessionStorage.removeItem(reauthKey);
    if (redirect) location.href = "login.html";
  }

  async function requireRole(role) {
    const session = await current();
    if (!session || (role && session.role !== role)) {
      location.replace("login.html");
      return null;
    }
    return session;
  }

  async function requireAdminReauth() {
    const currentSession = await requireRole("admin");
    if (!currentSession) return false;
    const until = Number(sessionStorage.getItem(reauthKey()) || 0);
    if (until > Date.now()) return true;
    const password = window.prompt("Re-enter the admin password to continue.");
    if (!password) return false;
    const account = cfg().users.find(user => user.username === currentSession.username && user.role === "admin");
    if (!account || await Security.sha256(password) !== account.passwordHash) return false;
    sessionStorage.setItem(reauthKey, String(Date.now() + (cfg().session.adminReauthMinutes || 5) * 60000));
    return true;
  }

  return { login, current, requireRole, requireAdminReauth, logout, lockoutRemaining };
})();

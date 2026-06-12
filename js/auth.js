"use strict";
const AUTH = (() => {
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;
  const sessionKey = () => cfg().unlockSettings.sessionKey;

  function storageFor(remember) { return remember ? localStorage : sessionStorage; }

  async function login(username, password, remember) {
    const cleanUsername = Security.sanitizeText(username, 80).trim();
    const user = cfg().users.find(account => 
      account.username === cleanUsername && 
      account.password === password && 
      Security.validateRole(account.role)
    );
    
    if (!user) {
      return { ok: false, message: "The username or password is not correct." };
    }

    const now = Date.now();
    const timeout = (remember ? cfg().session.rememberDays * 86400000 : cfg().session.timeoutMinutes * 60000);
    const session = {
      username: user.username,
      role: user.role,
      issuedAt: now,
      expiresAt: now + timeout,
      remember: !!remember
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
    if (!account) {
      logout(false);
      return null;
    }
    return session;
  }

  function logout(redirect = true) {
    localStorage.removeItem(sessionKey());
    sessionStorage.removeItem(sessionKey());
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
    const password = window.prompt("Re-enter the admin password to continue.");
    if (!password) return false;
    const account = cfg().users.find(user => user.username === currentSession.username && user.role === "admin");
    if (!account || password !== account.password) return false;
    return true;
  }

  return { login, current, requireRole, requireAdminReauth, logout };
})();

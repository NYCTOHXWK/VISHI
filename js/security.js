"use strict";
const Security = (() => {
  const encoder = new TextEncoder();
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function sanitizeText(value = "", limit = 12000) {
    return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, limit);
  }

  async function sha256(value) {
    const data = encoder.encode(String(value));
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
  }

  function safePath(path, fallback = "") {
    const value = sanitizeText(path, 500).trim();
    if (/^(https?:)?\/\//i.test(value) || value.includes("..")) return fallback;
    return value || fallback;
  }

  function fingerprintSource() {
    return [navigator.userAgent, navigator.language, screen.width, screen.height, screen.colorDepth].join("|");
  }

  async function fingerprint() {
    return sha256(fingerprintSource());
  }

  function applyPrivateMode() {
    const mode = cfg().privateMode || {};
    if (!mode.enabled) return;
    document.documentElement.classList.add("private-mode");
    if (mode.disableRightClick) document.addEventListener("contextmenu", event => event.preventDefault());
    if (mode.disableImageDragging) document.addEventListener("dragstart", event => {
      if (event.target && event.target.closest && event.target.closest("img, video, .protected-content")) event.preventDefault();
    });
    if (mode.disableTextSelection) document.documentElement.classList.add("no-select");
    if (mode.blurOnTabHidden) document.addEventListener("visibilitychange", () => {
      document.documentElement.classList.toggle("privacy-blur", document.hidden);
      if (document.hidden) window.dispatchEvent(new CustomEvent("vishi:pauseAnimations"));
      else window.dispatchEvent(new CustomEvent("vishi:resumeAnimations"));
    });
    if (mode.watermark && !document.querySelector(".recipient-watermark")) {
      const mark = document.createElement("div");
      mark.className = "recipient-watermark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = (mode.watermarkText || "For {girlName} only").replace("{girlName}", cfg().girlName || "you");
      document.body.appendChild(mark);
    }
  }


  function integrityCheck() {
    const config = cfg();
    const problems = [];
    if (!Array.isArray(config.users) || config.users.some(user => !/^[a-f0-9]{64}$/i.test(user.passwordHash || ""))) problems.push("Password hashes must be SHA-256 hex strings.");
    if (!Array.isArray(config.chapters) || config.chapters.length !== 19) problems.push("Exactly 19 chapters are required.");
    if (config.users && config.users.some(user => !validateRole(user.role))) problems.push("Unknown user role detected.");
    if (config.chapters && config.chapters.some(chapter => /^(https?:)?\/\//i.test(chapter.image || ""))) problems.push("Chapter media must remain local for offline/private mode.");
    return { ok: problems.length === 0, problems };
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  function validateRole(role) {
    return role === "admin" || role === "birthdayGirl";
  }

  return { escapeHTML, sanitizeText, sha256, safePath, fingerprint, applyPrivateMode, registerServiceWorker, validateRole, integrityCheck };
})();

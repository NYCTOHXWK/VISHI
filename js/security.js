"use strict";
const Security = (() => {
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function sanitizeText(value = "", limit = 12000) {
    return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, limit);
  }

  function safePath(path, fallback = "") {
    const value = sanitizeText(path, 500).trim();
    if (/^(https?:)?\/\//i.test(value) || value.includes("..")) return fallback;
    return value || fallback;
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

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || location.protocol === "file:") return;
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }

  function validateRole(role) {
    return role === "admin" || role === "birthdayGirl" || role === "tester";
  }

  return { escapeHTML, sanitizeText, safePath, applyPrivateMode, registerServiceWorker, validateRole };
})();

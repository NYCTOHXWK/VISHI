"use strict";
const UnlockSystem = (() => {
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;
  const ms = value => new Date(value).getTime();
  const key = () => cfg().unlockSettings.storageKey;

  function finalUnlock() { return ms(cfg().unlockSettings.finalUnlock); }
  function preFinalUnlock() { return ms(cfg().unlockSettings.preFinalUnlock); }

  function validSchedule(schedule) {
    if (!schedule || typeof schedule !== "object" || !schedule.unlocks) return false;
    const total = cfg().unlockSettings.totalChapters;
    if (Number(schedule.finalUnlock) !== finalUnlock() || Number(schedule.preFinalUnlock) !== preFinalUnlock()) return false;
    if (Number(schedule.unlocks[1]) > Number(schedule.unlocks[2] || Infinity)) return false;
    for (let chapter = 1; chapter <= total; chapter += 1) {
      if (!Number.isFinite(Number(schedule.unlocks[chapter]))) return false;
      if (chapter > 1 && chapter < 19 && Number(schedule.unlocks[chapter]) < Number(schedule.unlocks[chapter - 1])) return false;
    }
    return Number(schedule.unlocks[18]) <= preFinalUnlock() && (Number(schedule.unlocks[19]) === finalUnlock() || schedule.adminOverride === true);
  }

  function persist(schedule) { localStorage.setItem(key(), JSON.stringify(schedule)); }

  function buildSchedule() {
    const existing = localStorage.getItem(key());
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        if (validSchedule(parsed)) return parsed;
      } catch {}
    }
    const now = Date.now();
    const pre = preFinalUnlock();
    const final = finalUnlock();
    const unlocks = {};
    if (now >= pre) {
      for (let chapter = 1; chapter <= 18; chapter += 1) unlocks[chapter] = now;
    } else {
      const interval = (pre - now) / 17;
      for (let chapter = 1; chapter <= 18; chapter += 1) unlocks[chapter] = chapter === 1 ? now : Math.round(now + interval * (chapter - 1));
      unlocks[18] = pre;
    }
    unlocks[19] = final;
    const schedule = { journeyStart: now, timezone: cfg().timezone, preFinalUnlock: pre, finalUnlock: final, unlocks };
    persist(schedule);
    return schedule;
  }

  function getSchedule() { return buildSchedule(); }
  function isUnlocked(chapter) { return Date.now() >= Number(getSchedule().unlocks[chapter]); }
  function nextLocked() {
    const schedule = getSchedule();
    for (let chapter = 1; chapter <= cfg().unlockSettings.totalChapters; chapter += 1) {
      if (Date.now() < Number(schedule.unlocks[chapter])) return { chapter, time: Number(schedule.unlocks[chapter]) };
    }
    return null;
  }
  function unlockAll() {
    const schedule = getSchedule();
    for (let chapter = 1; chapter <= 19; chapter += 1) schedule.unlocks[chapter] = Date.now() - 1000;
    schedule.adminOverride = true;
    persist(schedule);
  }
  function lockAll() {
    const now = Date.now();
    const schedule = { journeyStart: now, timezone: cfg().timezone, preFinalUnlock: preFinalUnlock(), finalUnlock: finalUnlock(), unlocks: {} };
    for (let chapter = 1; chapter <= 18; chapter += 1) schedule.unlocks[chapter] = preFinalUnlock();
    schedule.unlocks[1] = now;
    schedule.unlocks[19] = finalUnlock();
    persist(schedule);
  }
  function reset() { localStorage.removeItem(key()); return buildSchedule(); }
  function countdownParts(target) {
    let diff = Math.max(0, Number(target) - Date.now());
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
    const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
    const seconds = Math.floor(diff / 1000);
    return { days, hours, minutes, seconds };
  }

  return { getSchedule, isUnlocked, nextLocked, unlockAll, lockAll, reset, countdownParts, validSchedule };
})();

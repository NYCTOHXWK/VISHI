"use strict";
const UnlockSystem = (() => {
  const cfg = () => window.getStoryConfig ? window.getStoryConfig() : window.STORY_CONFIG;
  const ms = value => new Date(value).getTime();
  const key = () => cfg().unlockSettings.storageKey;

  function finalUnlock() { return ms(cfg().unlockSettings.finalUnlock); }
  function preFinalUnlock() { return ms(cfg().unlockSettings.preFinalUnlock); }
  function journeyStart() { return new Date("2026-06-12T23:11:00+05:30").getTime(); }

  function buildFixedSchedule() {
    const start = journeyStart();
    const pre = preFinalUnlock();
    const final = finalUnlock();
    const unlocks = {};
    const interval = (pre - start) / 17;

    for (let chapter = 1; chapter <= 18; chapter += 1) {
      unlocks[chapter] = chapter === 1 ? start : Math.round(start + interval * (chapter - 1));
    }

    unlocks[18] = pre;
    unlocks[19] = final;

    return {
      journeyStart: start,
      timezone: cfg().timezone,
      preFinalUnlock: pre,
      finalUnlock: final,
      unlocks
    };
  }

  function validSchedule(schedule) {
    if (!schedule || typeof schedule !== "object" || !schedule.unlocks) return false;
    return Number(schedule.finalUnlock) === finalUnlock() && Number(schedule.preFinalUnlock) === preFinalUnlock();
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

    const schedule = buildFixedSchedule();
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
    const schedule = buildFixedSchedule();
    for (let chapter = 2; chapter <= 18; chapter += 1) schedule.unlocks[chapter] = preFinalUnlock();
    schedule.unlocks[19] = finalUnlock();
    schedule.adminOverride = true;
    persist(schedule);
  }

  function reset() {
    const schedule = buildFixedSchedule();
    persist(schedule);
    return schedule;
  }

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
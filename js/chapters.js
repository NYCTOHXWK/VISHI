"use strict";
function cloneConfig() { return JSON.parse(JSON.stringify(window.STORY_CONFIG)); }
window.getStoryConfig = function getStoryConfig() {
  const raw = localStorage.getItem("vishi_config_override");
  if (!raw) return window.STORY_CONFIG;
  try {
    const override = JSON.parse(raw);
    return { ...cloneConfig(), ...override };
  } catch { return window.STORY_CONFIG; }
};

function chapterUrl(number) { return `chapter-${String(number).padStart(2, "0")}.html`; }
function readingTime(text) { return Math.max(1, Math.ceil(Security.sanitizeText(text).trim().split(/\s+/).length / 180)); }
function htmlText(text) { return Security.escapeHTML(Security.sanitizeText(text)).replace(/\n/g, "<br>"); }
function mediaImage(src, alt) {
  const safe = Security.safePath(src, "assets/images/ch1.jpg");
  return `<img class="memory-photo" src="${Security.escapeHTML(safe)}" alt="${Security.escapeHTML(alt || "Personal memory photo")}" loading="lazy" decoding="async" draggable="false">`;
}

let animationPaused = false;
window.addEventListener("vishi:pauseAnimations", () => { animationPaused = true; });
window.addEventListener("vishi:resumeAnimations", () => { animationPaused = false; });

function createParticles(kind = "petal", count = 12) {
  if (animationPaused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.querySelector(kind === "heart" ? ".hearts" : kind === "confetto" ? ".confetti" : ".petals");
  if (!layer) return;
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const el = document.createElement("span");
    el.className = kind;
    if (kind === "heart") el.textContent = "❤️";
    el.style.setProperty("--x", `${Math.random() * 100}vw`);
    el.style.setProperty("--fall", `${6 + Math.random() * 8}s`);
    el.style.setProperty("--delay", `${Math.random() * 3}s`);
    fragment.appendChild(el);
    setTimeout(() => el.remove(), 15000);
  }
  requestAnimationFrame(() => layer.appendChild(fragment));
}

function renderCountdown(element, target) {
  if (!element) return null;
  function tick() {
    const parts = UnlockSystem.countdownParts(target);
    element.innerHTML = ["days", "hours", "minutes", "seconds"].map(label => `
      <div class="timebox" aria-label="${parts[label]} ${label}">
        <strong>${String(parts[label]).padStart(2, "0")}</strong>
        <span>${label}</span>
      </div>`).join("");
    if (Number(target) - Date.now() <= 0) location.reload();
  }
  tick();
  return setInterval(tick, 1000);
}

function showMissingMedia(event) {
  const target = event.target;
  if (!target || !target.classList.contains("memory-photo")) return;
  const holder = document.createElement("div");
  holder.className = "media-placeholder";
  holder.setAttribute("role", "img");
  holder.setAttribute("aria-label", target.alt || "Photo placeholder");
  holder.innerHTML = "<span>♡</span><strong>Replace with your personal image</strong>";
  target.replaceWith(holder);
}

document.addEventListener("error", showMissingMedia, true);

function lockedView(number) {
  const schedule = UnlockSystem.getSchedule();
  document.body.classList.add("protected-content");
  document.body.innerHTML = `
    <div class="bg-ornaments" aria-hidden="true"><span class="orb one"></span><span class="orb two"></span><span class="orb three"></span></div>
    <div class="petals" aria-hidden="true"></div>
    <main class="center-wrap shell" aria-labelledby="locked-title">
      <section class="glass login-card fade-up protected-content">
        <p class="eyebrow">Chapter ${number} is locked</p>
        <h1 id="locked-title">Your next memory unlocks in</h1>
        <div id="countdown" class="countdown" aria-live="polite"></div>
        <p class="subtitle">This story is meant to be experienced one chapter at a time.</p>
        <a class="btn secondary" href="index.html">Return to story</a>
      </section>
    </main>`;
  renderCountdown(document.getElementById("countdown"), schedule.unlocks[number]);
  Security.applyPrivateMode();
  setInterval(() => createParticles("petal", 4), 3000);
}

async function renderChapter(number) {
  const session = await AUTH.requireRole();
  if (!session) return;
  const config = getStoryConfig();
  const chapter = config.chapters[number - 1];
  if (!chapter) {
    document.getElementById("app").innerHTML = "<main class='shell center-wrap'><section class='glass login-card'><h1>Chapter not found</h1><a class='btn' href='index.html'>Return home</a></section></main>";
    return;
  }
  const adminPreview = session.role === "admin" && !UnlockSystem.isUnlocked(number);
  if (!UnlockSystem.isUnlocked(number) && !adminPreview) return lockedView(number);
  document.title = `${chapter.title} · 19 Years, 19 Chapters`;
  const next = number < 19 ? `<a class="btn gold" href="${chapterUrl(number + 1)}">Next Chapter</a>` : `<button class="btn gold" id="finishBtn" type="button">Finish the Story</button>`;
  document.getElementById("app").innerHTML = `
    <div class="loader" aria-hidden="true"><div class="initials">${Security.escapeHTML(config.theme.initials)}</div></div>
    <div class="bg-ornaments" aria-hidden="true"><span class="orb one"></span><span class="orb two"></span><span class="orb three"></span></div>
    <div class="petals" aria-hidden="true"></div><div class="hearts" aria-hidden="true"></div><div class="confetti" aria-hidden="true"></div>
    <audio id="bgMusic" preload="none" loop src="${Security.escapeHTML(Security.safePath(number === 19 ? config.media.birthdaySongPath : config.media.musicPath))}"></audio>
    <main class="chapter-layout shell protected-content">
      <nav class="glass topbar" aria-label="Chapter navigation">
        <a class="btn secondary" href="index.html">All Chapters</a>
        <button class="btn secondary" id="musicToggle" type="button" aria-pressed="false">Music</button>
        <button class="btn secondary" id="logoutBtn" type="button">Logout</button>
      </nav>
      <article class="glass chapter-card fade-up">
        ${adminPreview ? "<div class='reveal'><strong>Admin preview:</strong> this chapter is still locked for the birthday experience.</div>" : ""}
        <p class="eyebrow">Chapter ${number} of 19 · ${readingTime(chapter.text)} min read</p>
        <div class="progress" aria-label="Story progress"><span class="progress-fill progress-${number}"></span></div>
        <h1 class="title">${Security.escapeHTML(chapter.title)}</h1>
        ${number === 18 ? "<section class='midnight-note'><h2>We've reached the final memory.</h2><p>There is only one chapter left. Come back when the clock strikes midnight.</p><div id='finalCountdown' class='countdown' aria-live='polite'></div></section>" : ""}
        <figure class="chapter-image">
          <!-- Replace with your personal image -->
          ${mediaImage(chapter.image, chapter.alt)}
          <figcaption>Replace with your personal image</figcaption>
        </figure>
        <section class="story" aria-label="Chapter story">${htmlText(chapter.text)}</section>
        <aside class="reveal">${htmlText(chapter.reveal)}</aside>
        ${number === 19 ? renderFinalExtras(config) : ""}
        <div class="chapter-actions">
          ${number > 1 ? `<a class="btn secondary" href="${chapterUrl(number - 1)}">Previous</a>` : "<span></span>"}
          ${next}
        </div>
      </article>
    </main>
    <section class="final-screen" id="finalScreen" aria-live="polite"><div class="typed" id="typedFinal"></div></section>`;
  wireChapter(number, config);
}

function renderFinalExtras(config) {
  const images = config.chapters.map(chapter => `<!-- Replace with your personal image -->${mediaImage(chapter.image, chapter.alt)}`).join("");
  return `
    <section class="reveal final-reveal" aria-label="Birthday reveal">
      <h2>Memory Montage</h2>
      <div class="slideshow">${images}</div>
      <h2>Video Reveal</h2>
      <!-- Replace with your personal video -->
      <video id="surpriseVideo" controls playsinline preload="metadata" src="${Security.escapeHTML(Security.safePath(config.media.videoPath))}">
        Your browser cannot play this video. Replace with your personal video.
      </video>
      <p class="small video-fallback" hidden>Replace with your personal video, or check that the file path in config.js is correct.</p>
      <h2>Letter Reveal</h2>
      <p class="story">Of all the people I could have met, I am grateful life introduced me to you.</p>
    </section>`;
}

function wireChapter(number, config) {
  setTimeout(() => document.querySelector(".loader")?.classList.add("hide"), 600);
  document.getElementById("logoutBtn")?.addEventListener("click", () => AUTH.logout());
  const audio = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");
  audio?.addEventListener("error", () => { if (musicToggle) { musicToggle.disabled = true; musicToggle.textContent = "Music unavailable"; } });
  musicToggle?.addEventListener("click", async () => {
    if (!audio) return;
    try {
      if (audio.paused) { await audio.play(); musicToggle.setAttribute("aria-pressed", "true"); }
      else { audio.pause(); musicToggle.setAttribute("aria-pressed", "false"); }
    } catch { musicToggle.textContent = "Music unavailable"; }
  });
  document.getElementById("surpriseVideo")?.addEventListener("error", () => {
    document.querySelector(".video-fallback")?.removeAttribute("hidden");
  });
  if (number === 18) renderCountdown(document.getElementById("finalCountdown"), UnlockSystem.getSchedule().unlocks[19]);
  if (number === 19) {
    finalEffects();
    document.getElementById("finishBtn")?.addEventListener("click", showFinalScreen);
  }
  Security.applyPrivateMode();
  setInterval(() => createParticles("petal", 4), 3200);
  createParticles("petal", 14);
}

function finalEffects() {
  setInterval(() => createParticles("heart", 6), 1500);
  setInterval(() => createParticles("confetto", 10), 1200);
}

function showFinalScreen() {
  const screen = document.getElementById("finalScreen");
  const output = document.getElementById("typedFinal");
  screen?.classList.add("show");
  const message = "Of all the people I could have met,\n\nI'm grateful life introduced me to you.\n\n❤️ Happy Birthday ❤️";
  let index = 0;
  function type() {
    if (!output) return;
    output.textContent = message.slice(0, index += 1);
    if (index <= message.length) setTimeout(type, 55);
  }
  type();
}

"use strict";
document.addEventListener("DOMContentLoaded", async () => {
  Security.registerServiceWorker();
  Security.applyPrivateMode();
  document.querySelector(".loader")?.classList.add("hide-delay");
  const page = document.body.dataset.page;
  if (page === "login") initLogin();
  if (page === "home") await initHome();
  if (page === "admin") await initAdmin();
  if (page === "debug") await initDebugMobile();
  if (document.body.dataset.chapter) await renderChapter(Number(document.body.dataset.chapter));
});

function routeFor(role) { return role === "admin" ? "admin-dashboard.html" : "index.html"; }

async function initLogin() {
  const session = await AUTH.current();
  if (session) { location.replace(routeFor(session.role)); return; }
  const form = document.getElementById("loginForm");
  const error = document.getElementById("loginError");
  form?.addEventListener("submit", async event => {
    event.preventDefault();
    const data = new FormData(form);
    const result = await AUTH.login(data.get("username"), data.get("password"), data.get("remember") === "on");
    if (!result.ok) { error.textContent = result.message; return; }
    location.replace(routeFor(result.user.role));
  });
}

async function initHome() {
  const session = await AUTH.requireRole();
  if (!session) return;
  const config = getStoryConfig();
  document.getElementById("girlName").textContent = config.girlName;
  document.getElementById("logoutBtn")?.addEventListener("click", () => AUTH.logout());
  if (session.role === "admin") document.getElementById("adminLink")?.removeAttribute("hidden");
  UnlockSystem.getSchedule();
  const grid = document.getElementById("chapterGrid");
  grid.innerHTML = config.chapters.map(chapter => {
    const unlocked = UnlockSystem.isUnlocked(chapter.number);
    return `<a class="glass chapter-tile ${unlocked ? "" : "locked"}" href="${chapterUrl(chapter.number)}" aria-label="${Security.escapeHTML(chapter.title)} ${unlocked ? "unlocked" : "locked"}">
      <span class="number">${String(chapter.number).padStart(2, "0")}</span>
      <strong>${Security.escapeHTML(chapter.title)}</strong>
      <span>${unlocked ? "Unlocked" : "Locked · opens soon"}</span>
    </a>`;
  }).join("");
  const next = UnlockSystem.nextLocked();
  if (next) renderCountdown(document.getElementById("nextCountdown"), next.time);
  else document.getElementById("nextCountdown").innerHTML = "<p class='subtitle'>Every chapter is unlocked.</p>";
}

async function initAdmin() {
  const session = await AUTH.requireRole("admin");
  if (!session) return;
  const config = getStoryConfig();
  let current = 1;
  const list = document.getElementById("adminList");
  const form = document.getElementById("chapterEditor");
  document.getElementById("debugLink")?.removeAttribute("hidden");

  function drawList() {
    list.innerHTML = config.chapters.map(chapter => `<button class="btn secondary admin-chapter-button" type="button" data-chapter="${chapter.number}">Chapter ${chapter.number}: ${Security.escapeHTML(chapter.title)}</button>`).join("");
    list.querySelectorAll("button").forEach(button => button.addEventListener("click", () => { current = Number(button.dataset.chapter); drawForm(); }));
  }

  function drawForm() {
    const chapter = config.chapters[current - 1];
    form.innerHTML = `
      <h2>${Security.escapeHTML(chapter.title)}</h2>
      <label class="field"><span>Title</span><input name="title" value="${Security.escapeHTML(chapter.title)}" autocomplete="off"></label>
      <label class="field"><span>Image path</span><input name="image" value="${Security.escapeHTML(chapter.image)}" autocomplete="off"></label>
      <label class="field"><span>Chapter text</span><textarea name="text">${Security.escapeHTML(chapter.text)}</textarea></label>
      <label class="field"><span>Reveal</span><textarea name="reveal">${Security.escapeHTML(chapter.reveal)}</textarea></label>
      <button class="btn gold" type="submit">Save Chapter</button>`;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!await AUTH.requireAdminReauth()) return;
    const data = new FormData(form);
    const chapter = config.chapters[current - 1];
    chapter.title = Security.sanitizeText(data.get("title"), 160);
    chapter.image = Security.safePath(data.get("image"), chapter.image);
    chapter.text = Security.sanitizeText(data.get("text"), 12000);
    chapter.reveal = Security.sanitizeText(data.get("reveal"), 2000);
    saveOverride(config);
    drawList();
    alert("Chapter saved locally.");
  });

  document.getElementById("unlockAll")?.addEventListener("click", async () => { if (await AUTH.requireAdminReauth()) { UnlockSystem.unlockAll(); renderSchedule(); } });
  document.getElementById("lockAll")?.addEventListener("click", async () => { if (await AUTH.requireAdminReauth()) { UnlockSystem.lockAll(); renderSchedule(); } });
  document.getElementById("resetProgress")?.addEventListener("click", async () => { if (await AUTH.requireAdminReauth()) { UnlockSystem.reset(); renderSchedule(); } });
  document.getElementById("previewFinal")?.addEventListener("click", () => location.href = "chapter-19.html");
  document.getElementById("logoutBtn")?.addEventListener("click", () => AUTH.logout());

  function saveOverride(value) { localStorage.setItem("vishi_config_override", JSON.stringify(value)); }
  function renderSchedule() {
    const schedule = UnlockSystem.getSchedule();
    document.getElementById("schedule").innerHTML = Object.entries(schedule.unlocks).map(([chapter, time]) => `<p><strong>Chapter ${chapter}</strong> — ${new Date(Number(time)).toLocaleString()}</p>`).join("");
  }

  drawList(); drawForm(); renderSchedule();
}

async function initDebugMobile() {
  const session = await AUTH.requireRole("admin");
  if (!session) return;
  document.getElementById("logoutBtn")?.addEventListener("click", () => AUTH.logout());
  const output = document.getElementById("debugOutput");
  function breakpoint(width) {
    if (width <= 320) return "320px / iPhone SE narrow";
    if (width <= 375) return "375px / compact phone";
    if (width <= 414) return "390–414px / modern phone";
    if (width <= 768) return "tablet";
    return "desktop";
  }
  function draw() {
    const schedule = UnlockSystem.getSchedule();
    const perf = performance.getEntriesByType("navigation")[0];
    output.innerHTML = `
      <dl class="debug-grid">
        <dt>Viewport</dt><dd>${innerWidth} × ${innerHeight}</dd>
        <dt>Device pixel ratio</dt><dd>${devicePixelRatio}</dd>
        <dt>Safe area top/right/bottom/left</dt><dd>${getComputedStyle(document.documentElement).getPropertyValue("--sat") || "env() active"}</dd>
        <dt>Breakpoint</dt><dd>${breakpoint(innerWidth)}</dd>
        <dt>Session</dt><dd>${Security.escapeHTML(session.username)} · ${Security.escapeHTML(session.role)} · expires ${new Date(session.expiresAt).toLocaleString()}</dd>
        <dt>Unlock status</dt><dd>${Object.entries(schedule.unlocks).map(([chapter, time]) => `Ch ${chapter}: ${Date.now() >= Number(time) ? "open" : "locked"}`).join(" · ")}</dd>
        <dt>Performance</dt><dd>Load ${perf ? Math.round(perf.loadEventEnd) : "n/a"}ms · DOM ${perf ? Math.round(perf.domContentLoadedEventEnd) : "n/a"}ms</dd>
      </dl>`;
  }
  draw();
  addEventListener("resize", () => requestAnimationFrame(draw));
}

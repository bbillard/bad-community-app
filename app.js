const STORAGE_KEY = "badminton-progress-mvp";
const SKILLS = ["Technique", "DÃ©placements", "Tactique", "Physique", "Matchs"];

const SKILL_COLORS = {
  Technique: { start: "#34d1ff", end: "#1f8fff" },
  "DÃ©placements": { start: "#8eff5a", end: "#44c92b" },
  Tactique: { start: "#ff8f5a", end: "#ff4f2e" },
  Physique: { start: "#b88cff", end: "#7b58ff" },
  Matchs: { start: "#ffd24a", end: "#f7a600" },
};

const XP_BASE = {
  training: 70,
  match_practice: 90,
  match_official: 120,
  cardio: 60,
};

const seededFriends = [
  { name: "Emma", xp: 1740, club: "Aigles de Lyon" },
  { name: "Lucas", xp: 1310, club: "Aigles de Lyon" },
  { name: "Yanis", xp: 980, club: "Volants 93" },
  { name: "Sarah", xp: 1650, club: "Aigles de Lyon" },
];

const appState = loadState();
let activePage = "home";

initNav();
renderAll();

function initNav() {
  const nav = document.getElementById("bottom-nav");
  nav.querySelectorAll("[data-page]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activePage = btn.dataset.page;
      renderPagesVisibility();
      renderAllPages();
    });
  });
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return getInitialState();
  }

  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return loadState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

function renderAll() {
  renderOnboarding();

  const nav = document.getElementById("bottom-nav");
  if (!appState.onboarded) {
    nav.classList.add("hidden");
    hideAllPages();
    return;
  }

  nav.classList.remove("hidden");
  renderPagesVisibility();
  renderAllPages();
}

function renderPagesVisibility() {
  const pages = {
    home: document.getElementById("page-home"),
    session: document.getElementById("page-session"),
    challenges: document.getElementById("page-challenges"),
    community: document.getElementById("page-community"),
    profile: document.getElementById("page-profile"),
  };

  Object.entries(pages).forEach(([key, el]) => {
    if (key === activePage) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });

  document.querySelectorAll("#bottom-nav .nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.page === activePage);
  });
}

function hideAllPages() {
  ["page-home", "page-session", "page-challenges", "page-community", "page-profile"].forEach((id) => {
    document.getElementById(id).classList.add("hidden");
  });
}

function getInitialState() {
  return {
    onboarded: false,
    player: null,
    sessions: [],
    skillXp: Object.fromEntries(SKILLS.map((s) => [s, 0])),
    badges: [],
    challenges: [],
    challengeWeek: null,
  };
}

function renderAllPages() {
  renderHomePage();
  renderSessionPage();
  renderChallengesPage();
  renderCommunityPage();
  renderProfilePage();
}

function renderOnboarding() {
  const container = document.getElementById("onboarding-card");
  const tpl = document.getElementById("onboarding-template");
  container.innerHTML = "";

  if (appState.onboarded) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  container.append(tpl.content.cloneNode(true));

  const form = container.querySelector("#onboarding-form");
  form.querySelector('input[name="name"]').value = "Alex";
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);

    appState.onboarded = true;
    appState.player = {
      name: data.get("name").trim(),
      initialLevel: data.get("level"),
      weeklyFrequencyTarget: Number(data.get("frequency")),
      club: "Aigles de Lyon",
      avatarDataUrl: "",
      avatarName: "",
    };

    appState.challenges = createWeeklyChallenges(appState.player.weeklyFrequencyTarget);
    appState.challengeWeek = getCurrentWeekKey();

    bootstrapDemoProgress();
    evaluateChallenges();
    evaluateBadges();

    saveState();
    renderAll();
  });
}

function bootstrapDemoProgress() {
  if (appState.sessions.length > 0) return;

  appState.skillXp = {
    Technique: 420,
    "DÃ©placements": 330,
    Tactique: 260,
    Physique: 390,
    Matchs: 280,
  };

  appState.sessions = [
    {
      id: crypto.randomUUID(),
      type: "training",
      duration: 75,
      friendTag: "Lucas",
      photoName: "",
      comment: "Routine services + retours croisÃ©s.",
      skills: ["Technique", "DÃ©placements"],
      xp: 85,
      performedAt: dateDaysAgo(1).slice(0, 10),
      createdAt: dateDaysAgo(1),
    },
    {
      id: crypto.randomUUID(),
      type: "cardio",
      duration: 50,
      friendTag: "",
      photoName: "cardio.jpg",
      comment: "FractionnÃ© + gainage.",
      skills: ["Physique"],
      xp: 70,
      performedAt: dateDaysAgo(2).slice(0, 10),
      createdAt: dateDaysAgo(2),
    },
    {
      id: crypto.randomUUID(),
      type: "match_practice",
      duration: 90,
      friendTag: "Emma",
      photoName: "",
      comment: "Match en 3 sets contre Lucas.",
      skills: ["Tactique", "Matchs"],
      xp: 123,
      performedAt: dateDaysAgo(3).slice(0, 10),
      createdAt: dateDaysAgo(3),
    },
  ];

  unlockBadge(true, "ðŸ¥‡ Premier pas: 1 sÃ©ance enregistrÃ©e");
  unlockBadge(true, "ðŸŽ® Profil starter dÃ©bloquÃ©");
}

function renderHomePage() {
  const el = document.getElementById("page-home");
  const totalXp = getTotalXp();
  const global = xpToLevel(totalXp);
  const recent = [...appState.sessions].slice(-3).reverse();
  const badgeList = appState.badges.length ? appState.badges : ["ðŸ Premier objectif: ajouter une sÃ©ance"];

  el.innerHTML = `
    <section class="hero-card">
      <div class="pixel-avatar-wrap">${renderAvatarMarkup(appState.player, appState.player.name)}</div>
      <div>
        <p class="hero-label">Joueur</p>
        <h2 class="player-name">${appState.player.name}</h2>
        <p class="hero-xp">Niveau ${global.level} â€¢ ${totalXp} XP</p>
      </div>
    </section>

    <h3>Progression globale</h3>
    <div class="xp-bar"><span style="width:${global.progressPercent}%; --bar-start:#4ff8b8; --bar-end:#25b8ff;"></span></div>
    <p class="notice">XP actuel: ${global.currentInLevel}/${global.nextLevelTarget}</p>

    <h3>Progression par compÃ©tence</h3>
    ${SKILLS.map((skill) => renderSkillRow(skill)).join("")}

    <h3>Badges</h3>
    ${badgeList.map((b) => `<div class="badge-item">${b}</div>`).join("")}

    <h3>DerniÃ¨res sÃ©ances</h3>
    ${recent.length ? recent.map(renderSessionItem).join("") : '<p class="notice">Aucune sÃ©ance enregistrÃ©e.</p>'}

    <button id="go-session" class="secondary">Ajouter une sÃ©ance</button>
  `;

  el.querySelector("#go-session").addEventListener("click", () => {
    activePage = "session";
    renderPagesVisibility();
  });
}

function renderSkillRow(skill) {
  const xp = appState.skillXp[skill] || 0;
  const levelData = xpToLevel(xp);
  const color = SKILL_COLORS[skill] || { start: "#21b1ff", end: "#58f0ff" };

  return `
    <div class="skill-row skill-${slugify(skill)}">
      <div class="title"><strong>${skill}</strong><strong>Niv ${levelData.level}</strong></div>
      <div class="xp-bar"><span style="width:${levelData.progressPercent}%; --bar-start:${color.start}; --bar-end:${color.end};"></span></div>
      <p class="notice">${xp} XP (${levelData.currentInLevel}/${levelData.nextLevelTarget})</p>
    </div>
  `;
}

function renderSessionPage() {
  const el = document.getElementById("page-session");
  const todayIso = getTodayIsoDate();
  const friendOptions = seededFriends
    .map((friend) => `<option value="${friend.name}">${friend.name}</option>`)
    .join("");

  el.innerHTML = `
    <h2>Ajouter une sÃ©ance</h2>

    <form id="session-form" class="stack">
      <label>
        Date de la sÃ©ance
        <input type="date" name="sessionDate" max="${todayIso}" value="${todayIso}" required />
      </label>

      <label>
        Type de sÃ©ance
        <select name="type" required>
          <option value="training">EntraÃ®nement badminton</option>
          <option value="match_practice">Match (entraÃ®nement)</option>
          <option value="match_official">Match officiel</option>
          <option value="cardio">Physique / cardio</option>
        </select>
      </label>

      <label>
        DurÃ©e (minutes)
        <input type="number" name="duration" min="20" max="240" required value="60" />
      </label>

      <fieldset>
        <legend>CompÃ©tences travaillÃ©es</legend>
        <div class="inline">
          ${SKILLS.map((skill) => `<label><input type="checkbox" name="skills" value="${skill}" /> ${skill}</label>`).join("")}
        </div>
      </fieldset>

      <label>
        Tagger un ami
        <select name="friendTag">
          <option value="">Aucun ami taggÃ©</option>
          ${friendOptions}
        </select>
      </label>

      <label>
        Photo (facultatif)
        <input type="file" name="photoFile" accept="image/*" />
      </label>

      <label>
        Commentaire
        <textarea name="comment" rows="2" maxlength="180" placeholder="Smash + dÃ©placements latÃ©raux"></textarea>
      </label>

      <button type="submit">Valider la sÃ©ance</button>
      <p id="session-feedback" class="notice"></p>
    </form>
  `;

  el.querySelector("#session-form").addEventListener("submit", handleSessionSubmit);
}

async function handleSessionSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  const feedback = form.querySelector("#session-feedback");

  const type = data.get("type");
  const duration = Number(data.get("duration"));
  const skills = data.getAll("skills");
  const sessionDate = data.get("sessionDate");

  if (!skills.length) {
    feedback.className = "error";
    feedback.textContent = "SÃ©lectionnez au moins une compÃ©tence travaillÃ©e.";
    return;
  }

  if (!sessionDate) {
    feedback.className = "error";
    feedback.textContent = "SÃ©lectionnez une date pour la sÃ©ance.";
    return;
  }

  const todayIso = getTodayIsoDate();
  if (sessionDate > todayIso) {
    feedback.className = "error";
    feedback.textContent = "La date de sÃ©ance ne peut pas Ãªtre dans le futur.";
    return;
  }

  const friendTag = data.get("friendTag") || "";
  const photoFile = data.get("photoFile");
  const hasPhoto = photoFile && photoFile.size > 0;
  const photoDataUrl = hasPhoto ? await readFileAsDataUrl(photoFile) : "";
  const comment = data.get("comment").trim();

  let xp = XP_BASE[type] ?? 50;
  if (duration < 45) xp *= 0.8;
  if (duration >= 90) xp *= 1.2;
  if (friendTag) xp += 15;
  if (hasPhoto) xp += 10;
  xp = Math.round(xp);

  const perSkill = Math.max(1, Math.round(xp / skills.length));
  skills.forEach((skill) => {
    appState.skillXp[skill] = (appState.skillXp[skill] || 0) + perSkill;
  });

  appState.sessions.push({
    id: crypto.randomUUID(),
    type,
    duration,
    friendTag,
    photoName: hasPhoto ? photoFile.name : "",
    photoDataUrl,
    comment,
    skills,
    xp,
    performedAt: sessionDate,
    createdAt: new Date().toISOString(),
  });

  evaluateBadges();
  evaluateChallenges();
  saveState();

  feedback.className = "notice";
  feedback.textContent = `SÃ©ance enregistrÃ©e: +${xp} XP ðŸŽ‰`;
  form.reset();
  const dateInput = form.querySelector('input[name="sessionDate"]');
  if (dateInput) dateInput.value = todayIso;

  alert(`SÃ©ance enregistrÃ©e avec succÃ¨s (+${xp} XP) !`);
  activePage = "home";
  renderPagesVisibility();
  renderAllPages();
}

function renderChallengesPage() {
  const el = document.getElementById("page-challenges");

  if (appState.challengeWeek !== getCurrentWeekKey()) {
    appState.challenges = createWeeklyChallenges(appState.player.weeklyFrequencyTarget);
    appState.challengeWeek = getCurrentWeekKey();
    saveState();
  }

  el.innerHTML = `
    <h2>DÃ©fis hebdomadaires</h2>
    ${appState.challenges.map((c) => `
      <div class="challenge-item">
        <strong>${c.title}</strong>
        <p class="notice">${c.description}</p>
        <div class="xp-bar"><span style="width:${Math.min(100, Math.round((c.progress / c.target) * 100))}%; --bar-start:#ffd24a; --bar-end:#ff7a00;"></span></div>
        <p>${c.progress}/${c.target} ${c.completed ? "âœ… ComplÃ©tÃ©" : "â³ En cours"}</p>
        <p class="notice">RÃ©compense: ${c.rewardXp} XP</p>
      </div>
    `).join("")}
  `;
}

function renderCommunityPage() {
  const el = document.getElementById("page-community");
  const user = { name: appState.player.name, xp: getTotalXp(), club: appState.player.club, isYou: true };
  const all = [...seededFriends, user].sort((a, b) => b.xp - a.xp);
  const sameClub = all.filter((p) => p.club === appState.player.club);

  el.innerHTML = `
    <h2>CommunautÃ©</h2>
    <h3>Classement entre amis</h3>
    ${all.map((p, idx) => renderRankItem(p, idx)).join("")}

    <h3>Classement du club (${appState.player.club})</h3>
    ${sameClub.map((p, idx) => renderRankItem(p, idx)).join("")}
  `;
}

function renderProfilePage() {
  const el = document.getElementById("page-profile");
  const player = appState.player;

  el.innerHTML = `
    <h2>Profil</h2>
    <div class="profile-avatar-wrap">
      ${renderAvatarMarkup(player, player.name)}
    </div>

    <form id="profile-form" class="stack">
      <label>
        Nom joueur
        <input required name="name" minlength="2" maxlength="24" value="${escapeHtml(player.name || "")}" />
      </label>

      <label>
        Club
        <input required name="club" minlength="2" maxlength="48" value="${escapeHtml(player.club || "")}" />
      </label>

      <label>
        Niveau
        <select name="level">
          <option value="debutant" ${player.initialLevel === "debutant" ? "selected" : ""}>Debutant</option>
          <option value="intermediaire" ${player.initialLevel === "intermediaire" ? "selected" : ""}>Intermediaire</option>
          <option value="avance" ${player.initialLevel === "avance" ? "selected" : ""}>Avance</option>
        </select>
      </label>

      <label>
        Frequence hebdo
        <select name="frequency">
          <option value="1" ${player.weeklyFrequencyTarget === 1 ? "selected" : ""}>1 seance / semaine</option>
          <option value="2" ${player.weeklyFrequencyTarget === 2 ? "selected" : ""}>2 seances / semaine</option>
          <option value="3" ${player.weeklyFrequencyTarget === 3 ? "selected" : ""}>3 seances / semaine</option>
          <option value="4" ${player.weeklyFrequencyTarget >= 4 ? "selected" : ""}>4+ seances / semaine</option>
        </select>
      </label>

      <label>
        Photo de profil
        <input type="file" name="avatarFile" accept="image/*" />
      </label>

      <div class="inline">
        <button type="submit">Mettre a jour</button>
        <button type="button" id="logout-btn" class="danger">Se deconnecter</button>
      </div>
      <p id="profile-feedback" class="notice"></p>
    </form>
  `;

  el.querySelector("#profile-form").addEventListener("submit", handleProfileSubmit);
  el.querySelector("#logout-btn").addEventListener("click", handleLogout);
}

async function handleProfileSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget;
  const data = new FormData(form);
  const feedback = form.querySelector("#profile-feedback");

  const name = String(data.get("name") || "").trim();
  const club = String(data.get("club") || "").trim();
  const level = String(data.get("level") || "debutant");
  const frequency = Number(data.get("frequency"));

  if (!name || !club) {
    feedback.className = "error";
    feedback.textContent = "Nom et club sont obligatoires.";
    return;
  }

  const avatarFile = data.get("avatarFile");
  const hasNewAvatar = avatarFile && avatarFile.size > 0;

  appState.player.name = name;
  appState.player.club = club;
  appState.player.initialLevel = level;
  appState.player.weeklyFrequencyTarget = Math.max(1, Math.min(4, frequency || 1));

  if (hasNewAvatar) {
    appState.player.avatarDataUrl = await readFileAsDataUrl(avatarFile);
    appState.player.avatarName = avatarFile.name || "";
  }

  saveState();
  feedback.className = "notice";
  feedback.textContent = "Profil mis a jour.";
  renderAllPages();
}

function handleLogout() {
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(appState, getInitialState());
  activePage = "home";
  renderAll();
}

function renderRankItem(player, idx) {
  return `
    <div class="rank-item ${player.isYou ? "you" : ""}">
      <span>${idx + 1}. ${player.name} ${player.isYou ? "(vous)" : ""}</span>
      <strong>${xpToLevel(player.xp).level} â€¢ ${player.xp} XP</strong>
    </div>
  `;
}

function renderSessionItem(session) {
  const dateLabel = session.performedAt
    ? new Date(`${session.performedAt}T12:00:00`).toLocaleDateString("fr-FR")
    : new Date(session.createdAt).toLocaleDateString("fr-FR");

  return `
    <div class="session-item">
      <strong>${sessionLabel(session.type)} â€¢ +${session.xp} XP</strong>
      <p class="notice">${session.duration} min â€” ${dateLabel}</p>
      <div class="chips">${session.skills.map((s) => `<span class="chip">${s}</span>`).join("")}</div>
      ${session.friendTag ? `<p class="notice">ðŸ¤ Ami taggÃ©: ${session.friendTag}</p>` : ""}
      ${session.photoName ? `<p class="notice">ðŸ“· Photo: ${session.photoName}</p>` : ""}
      ${session.photoDataUrl ? `<img class="session-photo" src="${session.photoDataUrl}" alt="Photo de sÃ©ance ${session.photoName || ""}" />` : ""}
      ${session.comment ? `<p>â€œ${session.comment}â€</p>` : ""}
    </div>
  `;
}

function evaluateBadges() {
  const sessions = appState.sessions.length;
  const totalXp = getTotalXp();

  unlockBadge(sessions >= 1, "ðŸ¥‡ Premier pas: 1 sÃ©ance enregistrÃ©e");
  unlockBadge(sessions >= 10, "ðŸ”¥ RÃ©gulier: 10 sÃ©ances complÃ©tÃ©es");
  unlockBadge(totalXp >= 1000, "ðŸ’Ž 1000 XP atteints");

  const uniqueDays = new Set(appState.sessions.map((s) => (s.performedAt || s.createdAt.slice(0, 10)))).size;
  unlockBadge(uniqueDays >= 7, "ðŸ“… PersÃ©vÃ©rant: 7 jours d'activitÃ©");
}

function unlockBadge(condition, badgeName) {
  if (condition && !appState.badges.includes(badgeName)) {
    appState.badges.push(badgeName);
  }
}

function createWeeklyChallenges(freq) {
  return [
    {
      id: "sessions",
      title: `ComplÃ©ter ${Math.max(2, freq)} sÃ©ances cette semaine`,
      description: "Validez vos sÃ©ances pour progresser rÃ©guliÃ¨rement.",
      target: Math.max(2, freq),
      progress: 0,
      rewardXp: 80,
      completed: false,
    },
    {
      id: "cardio",
      title: "Travailler le cardio 2 fois",
      description: "Ajoutez 2 sÃ©ances de type Physique / cardio.",
      target: 2,
      progress: 0,
      rewardXp: 60,
      completed: false,
    },
    {
      id: "match",
      title: "Participer Ã  1 match",
      description: "Match entraÃ®nement ou officiel.",
      target: 1,
      progress: 0,
      rewardXp: 50,
      completed: false,
    },
  ];
}

function evaluateChallenges() {
  for (const c of appState.challenges) {
    if (c.id === "sessions") c.progress = appState.sessions.length;
    if (c.id === "cardio") c.progress = appState.sessions.filter((s) => s.type === "cardio").length;
    if (c.id === "match") c.progress = appState.sessions.filter((s) => s.type.includes("match")).length;

    const justCompleted = !c.completed && c.progress >= c.target;
    c.completed = c.progress >= c.target;

    if (justCompleted) {
      appState.skillXp.Technique += Math.round(c.rewardXp * 0.3);
      appState.skillXp.Physique += Math.round(c.rewardXp * 0.3);
      appState.skillXp.Tactique += Math.round(c.rewardXp * 0.4);
      unlockBadge(true, `ðŸ† DÃ©fi complÃ©tÃ©: ${c.title}`);
    }
  }
}

function getTotalXp() {
  return Object.values(appState.skillXp).reduce((sum, val) => sum + val, 0);
}

function xpToLevel(xp) {
  let level = 1;
  let remaining = xp;
  let threshold = 120;

  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = Math.round(threshold * 1.12);
  }

  return {
    level,
    currentInLevel: remaining,
    nextLevelTarget: threshold,
    progressPercent: Math.min(100, Math.round((remaining / threshold) * 100)),
  };
}

function sessionLabel(type) {
  return {
    training: "EntraÃ®nement badminton",
    match_practice: "Match entraÃ®nement",
    match_official: "Match officiel",
    cardio: "Physique / cardio",
  }[type] ?? "SÃ©ance";
}


function renderAvatarMarkup(player, altName) {
  if (player?.avatarDataUrl) {
    const safeAlt = escapeHtml(altName || "Photo de profil");
    return `<img class="avatar-photo" src="${player.avatarDataUrl}" alt="${safeAlt}" />`;
  }

  return `<div aria-hidden="true">${pixelBadmintonAvatar()}</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
    reader.readAsDataURL(file);
  });
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentWeekKey() {
  const now = new Date();
  const first = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil((((now - first) / 86400000) + first.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

function dateDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function slugify(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

function pixelBadmintonAvatar() {
  return `
    <svg viewBox="0 0 260 340" width="112" height="112" role="img" aria-label="Avatar joueur de badminton illustrÃ©" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shirtRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#d81f35"/>
          <stop offset="100%" stop-color="#a00f24"/>
        </linearGradient>
        <linearGradient id="shortBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#243455"/>
          <stop offset="100%" stop-color="#1a2742"/>
        </linearGradient>
      </defs>

      <rect width="260" height="340" rx="32" fill="#0f325a"/>
      <rect x="8" y="8" width="244" height="324" rx="26" fill="#123f73" stroke="#6ec2ff" stroke-width="3"/>

      <ellipse cx="132" cy="322" rx="70" ry="12" fill="#99b1d7" opacity="0.7"/>

      <path d="M92 58c18-16 58-14 76 2-6-18-23-29-43-30-20-1-35 10-43 28z" fill="#4e2c1d"/>
      <circle cx="132" cy="74" r="28" fill="#f5c79f"/>
      <path d="M103 67c4-17 50-19 57-2-13-7-34-7-57 2z" fill="#5a321f"/>
      <rect x="98" y="60" width="68" height="10" rx="5" fill="#e8f0ff"/>
      <rect x="98" y="63" width="68" height="3" fill="#ef233c"/>
      <circle cx="122" cy="77" r="3" fill="#26170f"/>
      <circle cx="142" cy="77" r="3" fill="#26170f"/>
      <path d="M124 88c5 4 10 4 15 0" stroke="#b8614c" stroke-width="2.4" fill="none" stroke-linecap="round"/>

      <path d="M95 108h74l8 76h-90z" fill="url(#shirtRed)"/>
      <path d="M92 182h78v17c0 13-11 24-24 24h-30c-13 0-24-11-24-24z" fill="url(#shortBlue)"/>

      <rect x="72" y="120" width="18" height="57" rx="9" fill="#f2bf95"/>
      <rect x="170" y="121" width="18" height="50" rx="9" fill="#f2bf95"/>
      <rect x="67" y="143" width="22" height="16" rx="6" fill="#1d2741"/>
      <rect x="168" y="143" width="22" height="16" rx="6" fill="#1d2741"/>

      <rect x="109" y="220" width="21" height="65" rx="10" fill="#efc29b"/>
      <rect x="136" y="220" width="21" height="65" rx="10" fill="#efc29b"/>

      <path d="M102 278h33l7 10-6 10h-38l-6-8z" fill="#245dd6" stroke="#122b6d" stroke-width="2"/>
      <path d="M130 278h35l7 10-7 10h-40l-4-8z" fill="#245dd6" stroke="#122b6d" stroke-width="2"/>
      <path d="M108 286h20" stroke="#fff" stroke-width="3"/>
      <path d="M137 286h20" stroke="#fff" stroke-width="3"/>

      <ellipse cx="188" cy="86" rx="28" ry="34" fill="#f7fbff" stroke="#1d4f99" stroke-width="5"/>
      <line x1="161" y1="58" x2="215" y2="114" stroke="#9db9e0" stroke-width="1.5"/>
      <line x1="161" y1="114" x2="215" y2="58" stroke="#9db9e0" stroke-width="1.5"/>
      <rect x="148" y="96" width="56" height="6" rx="3" transform="rotate(-20 148 96)" fill="#2d5fa4"/>

      <path d="M169 170l15 6-11 13-6-15z" fill="#ffffff" stroke="#c7ced9" stroke-width="2"/>
      <path d="M175 173l4 1-3 3z" fill="#dce6f5"/>
    </svg>
  `;
}




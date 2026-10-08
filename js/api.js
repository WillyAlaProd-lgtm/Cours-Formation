// =============================================================================
//  Accès aux données.
//  - Si config.js contient vos clés Supabase : mode « en ligne » (partagé).
//  - Sinon : mode « local » (données dans ce navigateur, pratique pour tester).
//  Les deux modes exposent exactement les mêmes fonctions.
// =============================================================================
import { CONFIG } from "./config.js";

const configured =
  CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY &&
  !CONFIG.SUPABASE_URL.includes("VOTRE") && !CONFIG.SUPABASE_ANON_KEY.includes("VOTRE");

export let api;

if (configured) {
  const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm");
  // Tolère une URL copiée avec /rest/v1/ à la fin
  const url = CONFIG.SUPABASE_URL.trim().replace(/\/(rest|auth)\/v1\/?$/, "").replace(/\/+$/, "");
  const sb = createClient(url, CONFIG.SUPABASE_ANON_KEY.trim(), {
    auth: { persistSession: true, storageKey: "mpc-auth" },
  });
  const rpc = async (name, params = {}) => {
    const { data, error } = await sb.rpc(name, params);
    if (error) throw new Error(cleanError(error));
    return data;
  };
  api = {
    mode: "supabase",
    createTeam: (name, members) => rpc("create_team", { p_name: name, p_members: members }),
    joinTeam: (name, code) => rpc("join_team", { p_name: name, p_code: code }),
    teamState: (id, code, withData = true) => rpc("team_state", { p_team: id, p_code: code, p_with_data: withData }),
    saveSubmission: (id, code, stage, patch) => rpc("save_submission", { p_team: id, p_code: code, p_stage: stage, p_patch: patch }),
    saveQuest: (id, code, stage, questId, score, max, passed) =>
      rpc("save_quest", { p_team: id, p_code: code, p_stage: stage, p_quest: questId, p_score: score, p_max: max, p_passed: passed }),
    submitStage: (id, code, stage) => rpc("submit_stage", { p_team: id, p_code: code, p_stage: stage }),
    cancelSubmission: (id, code, stage) => rpc("cancel_submission", { p_team: id, p_code: code, p_stage: stage }),
    postComment: (id, code, stage, body, authorName) =>
      rpc("post_comment", { p_team: id, p_code: code, p_stage: stage, p_body: body, p_author_name: authorName }),
    updateMembers: (id, code, members) => rpc("update_members", { p_team: id, p_code: code, p_members: members }),
    publicOverview: () => rpc("public_overview"),

    async teacherLogin(email, password) {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw new Error("Connexion refusée : vérifiez l’e-mail et le mot de passe.");
      const ok = await rpc("am_i_teacher");
      if (!ok) {
        await sb.auth.signOut();
        throw new Error("Ce compte n’est pas déclaré comme professeur (table « teachers » dans Supabase).");
      }
      return true;
    },
    async teacherSession() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return false;
      try { return await rpc("am_i_teacher"); } catch { return false; }
    },
    teacherLogout: () => sb.auth.signOut(),
    teacherOverview: () => rpc("teacher_overview"),
    teacherTeam: (id) => rpc("teacher_team", { p_team: id }),
    teacherReview: (id, stage, { scores, grade, feedback, extra }, action) =>
      rpc("teacher_review", { p_team: id, p_stage: stage, p_scores: scores, p_grade: grade, p_feedback: feedback, p_extra: extra, p_action: action }),
    teacherSetStage: (id, stage) => rpc("teacher_set_stage", { p_team: id, p_stage: stage }),
    teacherComment: (id, stage, body) => rpc("teacher_comment", { p_team: id, p_stage: stage, p_body: body }),
    teacherUpdateSettings: (patch) => rpc("teacher_update_settings", { p_patch: patch }),
    teacherResetTeam: (id, stage = null) => rpc("teacher_reset_team", { p_team: id, p_stage: stage }),
    teacherDeleteTeam: (id) => rpc("teacher_delete_team", { p_team: id }),
    teacherResetProgress: () => rpc("teacher_reset_progress"),
    teacherDeleteAll: () => rpc("teacher_delete_all"),
  };
} else {
  api = localApi();
}

function cleanError(error) {
  const m = error?.message || String(error);
  if (/Failed to fetch|NetworkError/i.test(m)) return "Connexion impossible au serveur. Vérifiez internet (ou que le projet Supabase n’est pas en pause).";
  if (/Could not find the function/i.test(m)) return "Fonction introuvable dans Supabase : avez-vous bien exécuté supabase/schema.sql ?";
  return m;
}

// =============================================================================
//  MODE LOCAL (sans Supabase) — reproduit les règles du script SQL
// =============================================================================
function localApi() {
  const KEY = "mpc-local-db";
  const SESSION = "mpc-local-teacher";
  const now = () => new Date().toISOString();
  const fresh = () => ({
    settings: { id: 1, team_creation_open: true, max_stage: 1, spotlight_team: null, spotlight_stage: null },
    teams: [], submissions: [], quests: [], reviews: [], comments: [], seq: 1,
  });
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || fresh(); } catch { return fresh(); } };
  const save = (db) => localStorage.setItem(KEY, JSON.stringify(db));
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const fail = (m) => { throw new Error(m); };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "t" + Math.random().toString(16).slice(2) + Date.now().toString(16));
  const isTeacher = () => sessionStorage.getItem(SESSION) === "1" || localStorage.getItem(SESSION) === "1";
  const requireTeacher = () => { if (!isTeacher()) fail("Accès réservé au professeur."); };

  function checkTeam(db, id, code, stage = null) {
    const t = db.teams.find((x) => x.id === id && x.code === String(code || "").trim().toUpperCase());
    if (!t) fail("Équipe introuvable ou code incorrect.");
    if (stage != null) {
      if (stage < 1 || stage > 4) fail("Étape inconnue.");
      if (stage > t.current_stage) fail("Cette étape est encore verrouillée : le professeur doit valider l'étape précédente.");
      if (stage > db.settings.max_stage) fail("Cette étape n'est pas encore ouverte par le professeur.");
    }
    return t;
  }
  function teamJson(db, t, withData, teacher) {
    return copy({
      team: { id: t.id, name: t.name, code: t.code, members: t.members, current_stage: t.current_stage, created_at: t.created_at },
      settings: { max_stage: db.settings.max_stage, team_creation_open: db.settings.team_creation_open },
      submissions: db.submissions.filter((s) => s.team_id === t.id).sort((a, b) => a.stage - b.stage)
        .map((s) => ({ stage: s.stage, status: s.status, updated_at: s.updated_at, submitted_at: s.submitted_at, data: withData ? s.data : null })),
      quests: db.quests.filter((q) => q.team_id === t.id).map(({ team_id, ...q }) => q),
      reviews: db.reviews.filter((r) => r.team_id === t.id).map((r) => ({
        stage: r.stage, validated: r.validated, feedback: r.feedback,
        grade: r.validated || teacher ? r.grade : null, scores: r.validated || teacher ? r.scores : null,
        extra: r.extra, updated_at: r.updated_at,
      })),
      comments: db.comments.filter((c) => c.team_id === t.id).map(({ team_id, ...c }) => c),
    });
  }
  const cleanMembers = (m) => {
    const out = (m || []).map((x) => String(x).trim().slice(0, 40)).filter(Boolean);
    if (out.length > 8) fail("8 membres maximum.");
    return out;
  };
  const sub = (db, id, stage) => db.submissions.find((s) => s.team_id === id && s.stage === stage);
  const ensureSub = (db, id, stage) => {
    let s = sub(db, id, stage);
    if (!s) { s = { team_id: id, stage, data: {}, status: "en_cours", submitted_at: null, updated_at: now() }; db.submissions.push(s); }
    return s;
  };
  const delWhere = (db, pred) => {
    for (const k of ["submissions", "quests", "reviews", "comments"]) db[k] = db[k].filter((x) => !pred(x));
  };

  return {
    mode: "local",
    async createTeam(name, members) {
      const db = load();
      const n = String(name || "").trim();
      if (!db.settings.team_creation_open) fail("La création d'équipes est fermée. Demandez à votre professeur.");
      if (n.length < 2 || n.length > 40) fail("Le nom d'équipe doit faire entre 2 et 40 caractères.");
      if (db.teams.some((t) => t.name.toLowerCase() === n.toLowerCase())) fail("Ce nom d'équipe est déjà pris. Si c'est la vôtre, utilisez « Rejoindre ».");
      const A = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
      const code = Array.from({ length: 6 }, () => A[Math.floor(Math.random() * A.length)]).join("");
      const t = { id: uid(), name: n, code, members: cleanMembers(members), current_stage: 1, created_at: now() };
      db.teams.push(t);
      save(db);
      return { id: t.id, name: t.name, code };
    },
    async joinTeam(name, code) {
      const db = load();
      const t = db.teams.find((x) => x.name.toLowerCase() === String(name || "").trim().toLowerCase() && x.code === String(code || "").trim().toUpperCase());
      if (!t) fail("Nom d'équipe ou code incorrect.");
      return { id: t.id, name: t.name, code: t.code };
    },
    async teamState(id, code, withData = true) {
      const db = load();
      return teamJson(db, checkTeam(db, id, code), withData, false);
    },
    async saveSubmission(id, code, stage, patch) {
      const db = load();
      checkTeam(db, id, code, stage);
      const s = sub(db, id, stage);
      if (s && (s.status === "soumis" || s.status === "valide")) fail("Étape soumise ou validée : modifications impossibles.");
      const row = ensureSub(db, id, stage);
      row.data = { ...row.data, ...patch };
      row.updated_at = now();
      save(db);
      return row.updated_at;
    },
    async saveQuest(id, code, stage, questId, score, max, passed) {
      const db = load();
      checkTeam(db, id, code, stage);
      let q = db.quests.find((x) => x.team_id === id && x.quest_id === questId);
      if (!q) { q = { team_id: id, stage, quest_id: questId, best_score: 0, max_score: 0, passed: false, attempts: 0 }; db.quests.push(q); }
      q.best_score = Math.max(q.best_score, score);
      q.max_score = max;
      q.passed = q.passed || !!passed;
      q.attempts += 1;
      q.updated_at = now();
      save(db);
    },
    async submitStage(id, code, stage) {
      const db = load();
      checkTeam(db, id, code, stage);
      const s = ensureSub(db, id, stage);
      if (s.status === "valide") fail("Cette étape est déjà validée.");
      s.status = "soumis"; s.submitted_at = now(); s.updated_at = now();
      save(db);
    },
    async cancelSubmission(id, code, stage) {
      const db = load();
      checkTeam(db, id, code, stage);
      const s = sub(db, id, stage);
      if (s && s.status === "soumis") { s.status = "en_cours"; s.updated_at = now(); }
      save(db);
    },
    async postComment(id, code, stage, body, authorName) {
      const db = load();
      checkTeam(db, id, code);
      if (!String(body || "").trim()) fail("Message vide.");
      db.comments.push({ id: db.seq++, team_id: id, stage, author: "equipe", author_name: String(authorName || "").slice(0, 40), body: String(body).trim().slice(0, 2000), created_at: now() });
      save(db);
    },
    async updateMembers(id, code, members) {
      const db = load();
      const t = checkTeam(db, id, code);
      t.members = cleanMembers(members);
      save(db);
    },
    async publicOverview() {
      const db = load();
      const st = db.settings;
      const sp = st.spotlight_team && st.spotlight_stage ? db.teams.find((t) => t.id === st.spotlight_team) : null;
      return copy({
        settings: { max_stage: st.max_stage, team_creation_open: st.team_creation_open, spotlight_team: st.spotlight_team, spotlight_stage: st.spotlight_stage },
        teams: db.teams.map((t) => ({
          id: t.id, name: t.name, members: t.members, current_stage: t.current_stage,
          stages: db.submissions.filter((s) => s.team_id === t.id).map((s) => ({ stage: s.stage, status: s.status })),
          quests: db.quests.filter((q) => q.team_id === t.id && q.passed).map((q) => q.quest_id),
        })),
        spotlight: sp ? { team_name: sp.name, stage: st.spotlight_stage, datas: Object.fromEntries(db.submissions.filter((s) => s.team_id === sp.id).map((s) => [String(s.stage), s.data])) } : null,
      });
    },

    async teacherLogin(_email, password) {
      if (password !== CONFIG.LOCAL_TEACHER_PASSWORD) fail("Mot de passe incorrect (mode local : voir LOCAL_TEACHER_PASSWORD dans js/config.js).");
      sessionStorage.setItem(SESSION, "1");
      return true;
    },
    async teacherSession() { return isTeacher(); },
    async teacherLogout() { sessionStorage.removeItem(SESSION); localStorage.removeItem(SESSION); },
    async teacherOverview() {
      requireTeacher();
      const db = load();
      const last = (id, a) => db.comments.filter((c) => c.team_id === id && c.author === a).map((c) => c.created_at).sort().pop() || null;
      return copy({
        settings: db.settings,
        teams: db.teams.map((t) => ({
          ...t,
          submissions: db.submissions.filter((s) => s.team_id === t.id).map(({ data, team_id, ...s }) => s),
          quests: db.quests.filter((q) => q.team_id === t.id).map(({ team_id, ...q }) => q),
          reviews: db.reviews.filter((r) => r.team_id === t.id).map((r) => ({ stage: r.stage, grade: r.grade, validated: r.validated, extra: r.extra })),
          last_team_comment: last(t.id, "equipe"),
          last_prof_comment: last(t.id, "prof"),
        })),
      });
    },
    async teacherTeam(id) {
      requireTeacher();
      const db = load();
      const t = db.teams.find((x) => x.id === id) || fail("Équipe introuvable.");
      return teamJson(db, t, true, true);
    },
    async teacherReview(id, stage, { scores, grade, feedback, extra }, action) {
      requireTeacher();
      const db = load();
      const t = db.teams.find((x) => x.id === id) || fail("Équipe introuvable.");
      let r = db.reviews.find((x) => x.team_id === id && x.stage === stage);
      if (!r) { r = { team_id: id, stage, validated: false }; db.reviews.push(r); }
      Object.assign(r, { scores: scores || {}, grade, feedback, extra: extra || {}, updated_at: now() });
      if (action !== "save") r.validated = action === "validate";
      if (action === "validate") {
        const s = ensureSub(db, id, stage);
        s.status = "valide"; s.updated_at = now();
        t.current_stage = Math.max(t.current_stage, Math.min(stage + 1, 5));
      } else if (action === "return") {
        const s = sub(db, id, stage);
        if (s) { s.status = "en_cours"; s.updated_at = now(); }
      }
      save(db);
    },
    async teacherSetStage(id, stage) {
      requireTeacher();
      const db = load();
      const t = db.teams.find((x) => x.id === id);
      if (t) t.current_stage = stage;
      save(db);
    },
    async teacherComment(id, stage, body) {
      requireTeacher();
      const db = load();
      db.comments.push({ id: db.seq++, team_id: id, stage, author: "prof", author_name: "Professeur", body: String(body).trim().slice(0, 2000), created_at: now() });
      save(db);
    },
    async teacherUpdateSettings(patch) {
      requireTeacher();
      const db = load();
      Object.assign(db.settings, patch);
      if (patch.spotlight_team === "") db.settings.spotlight_team = null;
      if (patch.spotlight_stage === "") db.settings.spotlight_stage = null;
      save(db);
    },
    async teacherResetTeam(id, stage = null) {
      requireTeacher();
      const db = load();
      const t = db.teams.find((x) => x.id === id);
      if (stage == null) { delWhere(db, (x) => x.team_id === id); if (t) t.current_stage = 1; }
      else { delWhere(db, (x) => x.team_id === id && x.stage === stage); if (t) t.current_stage = Math.min(t.current_stage, stage); }
      save(db);
    },
    async teacherDeleteTeam(id) {
      requireTeacher();
      const db = load();
      db.teams = db.teams.filter((t) => t.id !== id);
      delWhere(db, (x) => x.team_id === id);
      if (db.settings.spotlight_team === id) db.settings.spotlight_team = null;
      save(db);
    },
    async teacherResetProgress() {
      requireTeacher();
      const db = load();
      delWhere(db, () => true);
      db.teams.forEach((t) => (t.current_stage = 1));
      Object.assign(db.settings, { max_stage: 1, spotlight_team: null, spotlight_stage: null });
      save(db);
    },
    async teacherDeleteAll() {
      requireTeacher();
      save(fresh());
    },
  };
}

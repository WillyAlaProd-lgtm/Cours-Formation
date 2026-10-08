import { h, clear, toast, confirmBox, confirmTyped, STATUS, pill, timeAgo, parseNum } from "../ui.js";
import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { STAGES, stageByN } from "../content.js";
import { renderActivity, completion } from "../components/activity.js";
import { renderComments } from "../components/comments.js";
import { renderBlocks } from "../components/fiche.js";
import { renderFinal } from "../components/final.js";

export function teacherView(root) {
  let timer = null;
  let destroyed = false;
  let current = { kind: "list" }; // ou { kind: 'team', id, stage }
  let ov = null;
  let detail = null; // { el, poll }
  const ui = { spTeam: undefined, spStage: undefined, dangerOpen: false };

  init();
  return { destroy: () => { destroyed = true; clearInterval(timer); } };

  async function init() {
    clear(root);
    root.append(h("div", { class: "loading" }, "Vérification de la session…"));
    const ok = await api.teacherSession();
    if (destroyed) return;
    ok ? dashboard() : renderLogin();
  }

  // ===========================================================================
  //  Connexion
  // ===========================================================================
  function renderLogin() {
    clear(root);
    const email = h("input", { class: "input", type: "email", placeholder: "prof@exemple.fr", autocomplete: "username" });
    const pwd = h("input", { class: "input", type: "password", placeholder: "Mot de passe", autocomplete: "current-password" });
    const btn = h("button", { class: "btn btn-primary" }, "Se connecter");
    btn.onclick = async () => {
      btn.disabled = true;
      try { await api.teacherLogin(email.value.trim(), pwd.value); dashboard(); }
      catch (e) { toast(e.message, "error"); }
      finally { btn.disabled = false; }
    };
    pwd.addEventListener("keydown", (e) => e.key === "Enter" && btn.click());
    root.append(h("div", { class: "container narrow" },
      h("div", { class: "card login-card" },
        h("h1", {}, "Espace professeur"),
        api.mode === "local"
          ? h("div", { class: "banner banner-info" }, "Mode local (Supabase non configuré) : seul le mot de passe compte. Par défaut : ", h("strong", {}, CONFIG.LOCAL_TEACHER_PASSWORD), ".")
          : h("p", { class: "muted" }, "Connectez-vous avec le compte créé dans Supabase (Authentication › Users)."),
        api.mode === "local" ? null : h("label", { class: "field-label" }, "E-mail"),
        api.mode === "local" ? null : email,
        h("label", { class: "field-label" }, "Mot de passe"), pwd,
        h("div", { class: "card-actions" }, btn)
      )
    ));
    (api.mode === "local" ? pwd : email).focus();
  }

  // ===========================================================================
  //  Tableau de bord
  // ===========================================================================
  async function dashboard() {
    clearInterval(timer);
    timer = setInterval(tick, CONFIG.POLL_INTERVAL_MS || 5000);
    await tick(true);
  }

  async function tick(force = false) {
    try {
      if (current.kind === "list") {
        ov = await api.teacherOverview();
        if (!destroyed && current.kind === "list") renderList();
      } else if (detail) {
        await detail.poll();
      } else if (force) {
        await openTeam(current.id, current.stage);
      }
    } catch (e) {
      if (/réservé/i.test(e.message)) { clearInterval(timer); renderLogin(); }
      else if (force) toast(e.message, "error");
    }
  }

  function renderList() {
    const ae = document.activeElement;
    if (ae && root.contains(ae) && (ae.tagName === "SELECT" || ae.tagName === "INPUT")) return; // ne pas gêner une saisie
    const scrollY = window.scrollY;
    clear(root);
    const s = ov.settings;
    const teams = ov.teams;
    const toGrade = teams.reduce((n, t) => n + t.submissions.filter((x) => x.status === "soumis").length, 0);
    const unread = teams.filter((t) => t.last_team_comment && (!t.last_prof_comment || t.last_team_comment > t.last_prof_comment)).length;

    // --- réglages ---
    const stageSeg = h("div", { class: "seg" }, [1, 2, 3, 4].map((n) =>
      h("button", { class: "seg-btn" + (s.max_stage === n ? " on" : ""), onclick: () => setSettings({ max_stage: n }) }, `Séance ${n}`)));
    const creationBtn = h("button", { class: "btn btn-sm " + (s.team_creation_open ? "btn-ghost" : "btn-warn"), onclick: () => setSettings({ team_creation_open: !s.team_creation_open }) },
      s.team_creation_open ? "Ouverte · cliquer pour fermer" : "Fermée · cliquer pour ouvrir");
    const spTeam = h("select", { class: "input", onchange: () => (ui.spTeam = spTeam.value) }, h("option", { value: "" }, "— Aucune équipe —"), teams.map((t) => h("option", { value: t.id }, t.name)));
    spTeam.value = ui.spTeam ?? (s.spotlight_team || "");
    if (spTeam.value !== (ui.spTeam ?? (s.spotlight_team || ""))) spTeam.value = "";
    const spStage = h("select", { class: "input", onchange: () => (ui.spStage = spStage.value) }, STAGES.map((st) => h("option", { value: String(st.n) }, `Étape ${st.n}`)));
    spStage.value = ui.spStage ?? String(s.spotlight_stage || s.max_stage);

    root.append(h("div", { class: "container" },
      h("div", { class: "page-head row" },
        h("div", {}, h("h1", {}, "Tableau de bord professeur"), h("p", { class: "muted" }, api.mode === "local" ? "Mode local : données de ce navigateur uniquement." : "Mise à jour automatique toutes les quelques secondes.")),
        h("div", { class: "row-actions" },
          h("button", { class: "btn btn-ghost", onclick: exportCsv }, "Exporter les notes (CSV)"),
          h("button", { class: "btn btn-ghost", onclick: async () => { await api.teacherLogout(); clearInterval(timer); renderLogin(); } }, "Se déconnecter")
        )
      ),
      h("div", { class: "kpis" },
        kpi(teams.length, "équipes"),
        kpi(toGrade, "étape(s) à corriger", toGrade ? "warn" : ""),
        kpi(unread, "équipe(s) avec un message non répondu", unread ? "warn" : ""),
        kpi(teams.filter((t) => t.current_stage >= 5).length, "parcours terminés")
      ),
      h("div", { class: "card settings" },
        h("div", { class: "setting" }, h("div", {}, h("strong", {}, "Étape ouverte"), h("p", { class: "muted small" }, "Les équipes ne peuvent pas dépasser cette étape, même validées.")), stageSeg),
        h("div", { class: "setting" }, h("div", {}, h("strong", {}, "Création d’équipes"), h("p", { class: "muted small" }, "Fermez-la une fois la classe constituée.")), creationBtn),
        h("div", { class: "setting" }, h("div", {}, h("strong", {}, "Projection sur l’écran spectateur"), h("p", { class: "muted small" }, "Affiche le livrable d’une équipe (ex. : oral devant le CSE).")),
          h("div", { class: "inline-form" }, spTeam, spStage,
            h("button", { class: "btn btn-sm btn-primary", onclick: () => setSettings({ spotlight_team: spTeam.value || "", spotlight_stage: spTeam.value ? Number(spStage.value) : "" }) }, "Projeter"),
            s.spotlight_team ? h("button", { class: "btn btn-sm btn-ghost", onclick: () => { ui.spTeam = ""; setSettings({ spotlight_team: "", spotlight_stage: "" }); } }, "Arrêter") : null))
      ),
      h("h2", { class: "section-title" }, "Équipes"),
      teams.length ? teamsTable(teams) : h("div", { class: "empty-box" }, "Aucune équipe pour l’instant. Les élèves créent leur équipe depuis l’accueil › « Je suis une équipe »."),
      dangerZone()
    ));
    window.scrollTo(0, scrollY);
  }

  function kpi(v, label, kind = "") {
    return h("div", { class: "kpi " + kind }, h("div", { class: "kpi-value" }, v), h("div", { class: "kpi-label" }, label));
  }

  function teamsTable(teams) {
    return h("div", { class: "table-wrap" }, h("table", { class: "table table-teams" },
      h("thead", {}, h("tr", {}, h("th", {}, "Équipe"), h("th", {}, "Code"), STAGES.map((s) => h("th", {}, `Étape ${s.n}`)), h("th", {}, "Activité"), h("th", {}, ""))),
      h("tbody", {}, teams.map((t) => {
        const unread = t.last_team_comment && (!t.last_prof_comment || t.last_team_comment > t.last_prof_comment);
        const lastAct = [t.created_at, ...t.submissions.map((x) => x.updated_at), ...t.quests.map((q) => q.updated_at), t.last_team_comment].filter(Boolean).sort().pop();
        return h("tr", { class: t.submissions.some((x) => x.status === "soumis") ? "row-attn" : "" },
          h("td", {}, h("strong", {}, t.name), unread ? h("span", { class: "badge", title: "Message de l’équipe non répondu" }, "💬") : null, h("div", { class: "hint" }, t.members.join(", ") || "—")),
          h("td", {}, h("code", {}, t.code)),
          STAGES.map((s) => {
            const sub = t.submissions.find((x) => x.stage === s.n);
            const status = s.n > t.current_stage ? "verrouille" : sub?.status || "en_cours";
            const req = s.quests.filter((q) => q.required);
            const done = req.filter((q) => t.quests.some((r) => r.quest_id === q.id && r.passed)).length;
            const rv = t.reviews.find((r) => r.stage === s.n);
            return h("td", { class: "stage-cell" },
              h("button", { class: "cell-btn", onclick: () => openTeam(t.id, s.n), title: "Ouvrir" },
                pill(STATUS[status].icon + " " + STATUS[status].label, STATUS[status].kind),
                status !== "verrouille" ? h("div", { class: "hint" }, `Quêtes ${done}/${req.length}${rv?.grade != null ? ` · ${String(rv.grade).replace(".", ",")}/20` : ""}`) : null
              ));
          }),
          h("td", { class: "hint" }, timeAgo(lastAct)),
          h("td", {}, h("button", { class: "btn btn-sm btn-primary", onclick: () => openTeam(t.id, Math.min(t.current_stage, 4)) }, "Ouvrir"))
        );
      }))
    ));
  }

  function dangerZone() {
    const d = h("details", { class: "card danger-zone", open: ui.dangerOpen },
      h("summary", {}, "Zone de réinitialisation"),
      h("p", { class: "muted" }, "Actions irréversibles. Pensez à exporter les notes avant."),
      h("div", { class: "danger-actions" },
        h("div", {}, h("strong", {}, "Réinitialiser toute la progression"), h("p", { class: "muted small" }, "Garde les équipes et leurs codes, mais efface réponses, quêtes, notes et messages. Toutes les équipes repartent à l’étape 1."),
          h("button", { class: "btn btn-danger", onclick: async () => {
            if (!(await confirmTyped("Réinitialiser toute la progression", "Toutes les réponses, quêtes, notes et messages de toutes les équipes seront effacés.", "RÉINITIALISER"))) return;
            try { await api.teacherResetProgress(); toast("Progression réinitialisée.", "ok"); tick(true); } catch (e) { toast(e.message, "error"); }
          } }, "Réinitialiser la progression")),
        h("div", {}, h("strong", {}, "Tout supprimer"), h("p", { class: "muted small" }, "Supprime toutes les équipes et toutes leurs données, et rouvre la création d’équipes. Idéal pour une nouvelle classe."),
          h("button", { class: "btn btn-danger", onclick: async () => {
            if (!(await confirmTyped("Tout supprimer", "Toutes les équipes et toutes leurs données seront définitivement supprimées.", "SUPPRIMER"))) return;
            try { await api.teacherDeleteAll(); toast("Tout a été supprimé.", "ok"); tick(true); } catch (e) { toast(e.message, "error"); }
          } }, "Tout supprimer"))
      )
    );
    d.addEventListener("toggle", () => (ui.dangerOpen = d.open));
    return d;
  }

  async function setSettings(patch) {
    try { await api.teacherUpdateSettings(patch); await tick(true); toast("Réglage enregistré.", "ok"); }
    catch (e) { toast(e.message, "error"); }
  }

  async function exportCsv() {
    try {
      const data = await api.teacherOverview();
      const head = ["Équipe", "Membres", "Code", "Étape actuelle", ...STAGES.map((s) => `Note étape ${s.n} (/20)`), ...STAGES.map((s) => `Quêtes étape ${s.n}`), "Moyenne (/20)"];
      const lines = data.teams.map((t) => {
        const grades = STAGES.map((s) => t.reviews.find((r) => r.stage === s.n)?.grade);
        const g = grades.filter((x) => x != null).map(Number);
        const quests = STAGES.map((s) => `${s.quests.filter((q) => t.quests.some((r) => r.quest_id === q.id && r.passed)).length}/${s.quests.length}`);
        return [t.name, t.members.join(" / "), t.code, t.current_stage >= 5 ? "Terminé" : t.current_stage, ...grades.map((x) => (x == null ? "" : String(x).replace(".", ","))), ...quests, g.length ? (g.reduce((a, b) => a + b, 0) / g.length).toFixed(2).replace(".", ",") : ""];
      });
      const csv = [head, ...lines].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
      const a = h("a", { href: URL.createObjectURL(blob), download: `notes-plan-competences-${new Date().toISOString().slice(0, 10)}.csv` });
      document.body.append(a); a.click(); a.remove();
    } catch (e) { toast(e.message, "error"); }
  }

  // ===========================================================================
  //  Détail d'une équipe
  // ===========================================================================
  async function openTeam(id, stageN = 1) {
    current = { kind: "team", id, stage: stageN };
    detail = null;
    clear(root);
    root.append(h("div", { class: "loading" }, "Chargement de l’équipe…"));
    let st;
    try { st = await api.teacherTeam(id); } catch (e) { toast(e.message, "error"); backToList(); return; }
    if (destroyed) return;
    renderTeam(st);
    window.scrollTo(0, 0);
  }

  function backToList() {
    current = { kind: "list" };
    detail = null;
    tick(true);
  }

  function renderTeam(st) {
    const n = current.stage;
    const stage = stageByN(n);
    const sub = st.submissions.find((s) => s.stage === n);
    const status = n > st.team.current_stage ? "verrouille" : sub?.status || "en_cours";
    const data = JSON.parse(JSON.stringify(sub?.data || {}));
    const datas = Object.fromEntries(st.submissions.map((s) => [s.stage, s.data || {}]));
    const review = st.reviews.find((r) => r.stage === n) || {};
    const lastSeenUpdate = sub?.updated_at;

    clear(root);
    const stageSel = h("select", { class: "input input-sm" }, [1, 2, 3, 4, 5].map((k) => h("option", { value: String(k) }, k === 5 ? "Parcours terminé" : `Étape ${k}`)));
    stageSel.value = String(st.team.current_stage);
    stageSel.onchange = async () => {
      if (!(await confirmBox("Changer l’étape débloquée", `L’équipe aura accès jusqu’à : ${stageSel.selectedOptions[0].textContent}.`, "Confirmer"))) { stageSel.value = String(st.team.current_stage); return; }
      try { await api.teacherSetStage(st.team.id, Number(stageSel.value)); toast("Étape mise à jour.", "ok"); openTeam(st.team.id, n); } catch (e) { toast(e.message, "error"); }
    };

    // --- quêtes ---
    const questTable = h("div", { class: "table-wrap" }, h("table", { class: "table" },
      h("thead", {}, h("tr", {}, ["Quête", "Type", "Meilleur score", "Essais", "Statut"].map((x) => h("th", {}, x)))),
      h("tbody", {}, stage.quests.map((q) => {
        const r = st.quests.find((x) => x.quest_id === q.id);
        return h("tr", {}, h("td", {}, q.title), h("td", {}, q.required ? "Obligatoire" : "Bonus"),
          h("td", {}, r ? `${r.best_score}/${r.max_score}` : "—"), h("td", {}, r?.attempts || 0),
          h("td", {}, r?.passed ? pill("✓ Réussie", "pill-ok") : r ? pill("En cours", "pill-warn") : pill("Non tentée", "pill-muted")));
      }))
    ));

    // --- commentaires ---
    const comments = renderComments({ me: "prof", onSend: async (body) => { await api.teacherComment(st.team.id, n, body); await detail.poll(); } });
    comments.update(st.comments.filter((c) => c.stage === n));

    // --- évaluation ---
    const scores = { ...(review.scores || {}) };
    const totalEl = h("strong", {});
    const calcTotal = () => {
      const t = stage.rubric.reduce((s, c) => s + (Number.isNaN(parseNum(scores[c.id])) ? 0 : parseNum(scores[c.id])), 0);
      totalEl.textContent = `${String(Math.round(t * 100) / 100).replace(".", ",")} / 20`;
      return t;
    };
    const rubricRows = stage.rubric.map((c) => {
      const inp = h("input", { class: "input input-score", inputmode: "decimal", value: scores[c.id] ?? "", placeholder: "0" });
      inp.addEventListener("input", () => {
        const v = parseNum(inp.value);
        scores[c.id] = inp.value.trim() === "" ? "" : Number.isNaN(v) ? inp.value : Math.max(0, Math.min(c.max, v));
        calcTotal();
      });
      return h("tr", {}, h("td", {}, c.label), h("td", { class: "score-cell" }, inp, h("span", { class: "muted" }, ` / ${c.max}`)));
    });
    calcTotal();
    const feedback = h("textarea", { class: "input", rows: 4, placeholder: "Commentaire visible par l’équipe (points forts, à améliorer…)", value: review.feedback || "" });
    let extraSel = null;
    if (stage.extraReview) {
      extraSel = h("select", { class: "input" }, h("option", { value: "" }, "—"), stage.extraReview.options.map((o) => h("option", { value: o }, o)));
      extraSel.value = review.extra?.[stage.extraReview.id] || "";
    }
    const doReview = async (action) => {
      for (const c of stage.rubric) {
        if (scores[c.id] !== "" && scores[c.id] !== undefined && Number.isNaN(parseNum(scores[c.id]))) { toast(`Note invalide : ${c.label}`, "error"); return; }
      }
      const filled = stage.rubric.some((c) => scores[c.id] !== "" && scores[c.id] !== undefined);
      const grade = filled ? Math.round(calcTotal() * 100) / 100 : null;
      if (action === "validate") {
        const msg = n < 4 ? `L’équipe « ${st.team.name} » pourra commencer l’étape ${n + 1} (dès que la séance ${n + 1} sera ouverte).` : `L’équipe « ${st.team.name} » termine le parcours.`;
        if (!(await confirmBox(`Valider l’étape ${n}`, msg + (grade == null ? " Aucune note n’a été saisie." : ` Note : ${String(grade).replace(".", ",")}/20.`), "Valider"))) return;
      }
      if (action === "return" && !(await confirmBox("Renvoyer à l’équipe", "L’équipe pourra de nouveau modifier son activité. Pensez à expliquer pourquoi dans le commentaire.", "Renvoyer"))) return;
      try {
        const extra = extraSel ? { [stage.extraReview.id]: extraSel.value } : {};
        const cleanScores = Object.fromEntries(Object.entries(scores).filter(([, v]) => v !== "" && v !== undefined).map(([k, v]) => [k, parseNum(v)]));
        await api.teacherReview(st.team.id, n, { scores: cleanScores, grade, feedback: feedback.value.trim(), extra }, action);
        toast(action === "validate" ? "Étape validée." : action === "return" ? "Étape renvoyée à l’équipe." : "Évaluation enregistrée.", "ok");
        openTeam(st.team.id, n);
      } catch (e) { toast(e.message, "error"); }
    };

    const refreshBtn = h("button", { class: "btn btn-sm btn-primary hidden", onclick: () => openTeam(st.team.id, n) }, "Nouvelles modifications de l’équipe : actualiser");
    const statusPill = h("span", {});
    const setStatusPill = (s) => { clear(statusPill); statusPill.append(pill(STATUS[s].icon + " " + STATUS[s].label, STATUS[s].kind)); };
    setStatusPill(status);

    const corrigeBox = h("details", { class: "card corrige-box" }, h("summary", {}, "Voir le corrigé de l’étape"),
      stage.corrige.map((s) => h("section", { class: "fiche-section" }, h("h3", {}, s.title), renderBlocks(s.blocks))));

    root.append(h("div", { class: "container" },
      h("button", { class: "link-btn back", onclick: backToList }, "← Toutes les équipes"),
      h("div", { class: "page-head row" },
        h("div", {},
          h("h1", {}, st.team.name),
          h("p", { class: "muted" }, (st.team.members.join(", ") || "Aucun membre renseigné"), " · code ", h("code", {}, st.team.code))
        ),
        h("div", { class: "row-actions" },
          h("label", { class: "inline-label" }, "Débloquée jusqu’à ", stageSel),
          h("button", { class: "btn btn-ghost btn-sm", onclick: () => showFinal(st, datas) }, "Dossier final"),
          h("button", { class: "btn btn-ghost btn-sm", onclick: async () => {
            if (!(await confirmTyped("Réinitialiser l’équipe", `Toutes les données de « ${st.team.name} » (réponses, quêtes, notes, messages) seront effacées. L’équipe et son code sont conservés.`, "RÉINITIALISER"))) return;
            try { await api.teacherResetTeam(st.team.id, null); toast("Équipe réinitialisée.", "ok"); openTeam(st.team.id, 1); } catch (e) { toast(e.message, "error"); }
          } }, "Réinitialiser l’équipe"),
          h("button", { class: "btn btn-danger btn-sm", onclick: async () => {
            if (!(await confirmTyped("Supprimer l’équipe", `L’équipe « ${st.team.name} » et toutes ses données seront supprimées.`, "SUPPRIMER"))) return;
            try { await api.teacherDeleteTeam(st.team.id); toast("Équipe supprimée.", "ok"); backToList(); } catch (e) { toast(e.message, "error"); }
          } }, "Supprimer")
        )
      ),
      h("div", { class: "tabs" }, STAGES.map((s) => {
        const sb = st.submissions.find((x) => x.stage === s.n);
        const ss = s.n > st.team.current_stage ? "verrouille" : sb?.status || "en_cours";
        return h("button", { class: "tab" + (s.n === n ? " on" : ""), onclick: () => { current.stage = s.n; renderTeam(st); } }, `${STATUS[ss].icon} Étape ${s.n}`);
      })),
      h("div", { class: "detail-grid" },
        h("div", { class: "detail-main" },
          h("div", { class: "card" },
            h("div", { class: "row" }, h("div", {}, h("div", { class: "eyebrow" }, stage.seance), h("h2", {}, `${stage.n}. ${stage.title}`)), h("div", { class: "row-actions" }, statusPill, pill(`Activité ${Math.round(completion(stage, data) * 100)} %`, "pill-muted"))),
            refreshBtn,
            h("h3", {}, "Quêtes secondaires"), questTable,
            h("h3", {}, stage.activity.title),
            Object.keys(data).length ? renderActivity(stage, { data, editable: false, context: { allData: datas, members: st.team.members } }).el : h("div", { class: "empty-box" }, "L’équipe n’a encore rien saisi pour cette étape.")
          ),
          corrigeBox
        ),
        h("div", { class: "detail-side" },
          h("div", { class: "card" },
            h("h3", {}, "Évaluation"),
            h("table", { class: "table rubric" }, h("tbody", {}, rubricRows, h("tr", { class: "row-total" }, h("td", {}, "Total"), h("td", {}, totalEl)))),
            stage.extraReview ? h("div", { class: "field" }, h("label", { class: "field-label" }, stage.extraReview.label), extraSel) : null,
            h("label", { class: "field-label" }, "Commentaire pour l’équipe"), feedback,
            h("div", { class: "review-actions" },
              h("button", { class: "btn btn-ghost", onclick: () => doReview("save") }, "Enregistrer"),
              status === "soumis" || status === "valide" ? h("button", { class: "btn btn-warn", onclick: () => doReview("return") }, "Renvoyer à l’équipe") : null,
              h("button", { class: "btn btn-primary", onclick: () => doReview("validate") }, n < 4 ? "Valider et débloquer l’étape suivante" : "Valider le parcours")
            ),
            review.validated ? h("p", { class: "muted small" }, "Étape déjà validée. Vous pouvez modifier la note et réenregistrer.") : null,
            h("details", { class: "mini-danger" }, h("summary", {}, "Réinitialiser cette étape"),
              h("p", { class: "muted small" }, "Efface les réponses, quêtes, note et messages de cette étape. L’équipe revient à cette étape (les suivantes sont reverrouillées)."),
              h("button", { class: "btn btn-danger btn-sm", onclick: async () => {
                if (!(await confirmBox(`Réinitialiser l’étape ${n}`, "Les données de cette étape seront effacées.", "Réinitialiser", true))) return;
                try { await api.teacherResetTeam(st.team.id, n); toast("Étape réinitialisée.", "ok"); openTeam(st.team.id, n); } catch (e) { toast(e.message, "error"); }
              } }, "Réinitialiser l’étape " + n))
          ),
          h("div", { class: "card" }, h("h3", {}, "Échanges avec l’équipe"), comments.el)
        )
      )
    ));

    detail = {
      async poll() {
        if (current.kind !== "team") return;
        const next = await api.teacherTeam(st.team.id);
        if (destroyed || current.kind !== "team" || current.id !== st.team.id) return;
        comments.update(next.comments.filter((c) => c.stage === current.stage));
        const ns = next.submissions.find((s) => s.stage === current.stage);
        const nstatus = current.stage > next.team.current_stage ? "verrouille" : ns?.status || "en_cours";
        setStatusPill(nstatus);
        if (ns?.updated_at && ns.updated_at !== lastSeenUpdate || JSON.stringify(next.quests) !== JSON.stringify(st.quests)) refreshBtn.classList.remove("hidden");
      },
    };
  }

  function showFinal(st, datas) {
    const w = h("div", { class: "container" },
      h("button", { class: "link-btn back no-print", onclick: () => openTeam(st.team.id, current.stage) }, "← Retour à l’équipe"),
      renderFinal({ teamName: st.team.name, members: st.team.members, datas, statuses: Object.fromEntries(STAGES.map((s) => [s.n, STATUS[s.n > st.team.current_stage ? "verrouille" : st.submissions.find((x) => x.stage === s.n)?.status || "en_cours"].label])) })
    );
    detail = null;
    current = { kind: "final", id: st.team.id, stage: current.stage };
    clear(root);
    root.append(w);
    window.scrollTo(0, 0);
  }
}

import { h, clear, pill, STATUS, toast, confirmBox, debounce, md } from "../ui.js";
import { renderFiche, renderBlocks } from "./fiche.js";
import { renderQuestList, playQuest } from "./quests.js";
import { renderActivity, completion } from "./activity.js";
import { renderComments } from "./comments.js";

// -----------------------------------------------------------------------------
//  Panneau d'une étape, côté équipe (mode 'team') ou démonstration ('demo')
//  state : { status, locked, data, quests:{id:result}, review, comments }
//  io    : { saveData(patch) -> ts, saveQuest(q,score,max,passed), submit(), cancel(), comment(body,name) }
// -----------------------------------------------------------------------------
export function createStagePanel(stage, { mode, state, io, context, initialTab }) {
  const demo = mode === "demo";
  let tab = initialTab || (state.locked ? "fiche" : "fiche");
  let data = state.data || {};
  const editable = () => !state.locked && state.status === "en_cours";

  const root = h("div", { class: "stage-panel" });
  const header = h("div", { class: "stage-header" });
  const tabsBar = h("div", { class: "tabs", role: "tablist" });
  const body = h("div", { class: "tab-body" });
  root.append(header, tabsBar, body);

  // ---- sauvegarde automatique ------------------------------------------------
  const dirty = new Set();
  const saveState = h("span", { class: "save-state" });
  const setSave = (txt, kind = "") => { saveState.textContent = txt; saveState.className = "save-state " + kind; };
  let saving = false;
  const flush = async () => {
    if (!dirty.size || saving) return;
    const keys = [...dirty];
    dirty.clear();
    const patch = {};
    keys.forEach((k) => (patch[k] = data[k]));
    saving = true;
    setSave("Enregistrement…");
    try {
      await io.saveData(patch);
      setSave(demo ? "Démo : non enregistré" : "Enregistré ✓", "ok");
    } catch (e) {
      keys.forEach((k) => dirty.add(k));
      setSave("Non enregistré : " + e.message, "err");
    } finally {
      saving = false;
      if (dirty.size) saveLater();
    }
  };
  const saveLater = debounce(flush, 1200);
  const onChange = (id) => {
    dirty.add(id);
    setSave("Modifications en cours…");
    saveLater();
    renderHeader();
  };

  // ---- en-tête --------------------------------------------------------------
  function requiredStatus() {
    const req = stage.quests.filter((q) => q.required);
    return { done: req.filter((q) => state.quests[q.id]?.passed).length, total: req.length };
  }
  function renderHeader() {
    clear(header);
    const st = STATUS[state.locked ? "verrouille" : state.status];
    const rq = requiredStatus();
    const comp = Math.round(completion(stage, data) * 100);
    const canSubmit = !state.locked && state.status === "en_cours" && rq.done === rq.total;
    let action = null;
    if (!demo && !state.locked) {
      if (state.status === "en_cours") {
        const btn = h("button", { class: "btn btn-primary", disabled: !canSubmit }, "Soumettre l’étape au professeur");
        btn.onclick = async () => {
          await flush();
          const msg = comp < 80
            ? `Votre activité n’est complétée qu’à ${comp} %. Une fois soumise, vous ne pourrez plus la modifier (sauf si le professeur vous la renvoie). Soumettre quand même ?`
            : "Une fois soumise, l’étape n’est plus modifiable, sauf si le professeur vous la renvoie. On y va ?";
          if (!(await confirmBox("Soumettre l’étape " + stage.n, msg, "Soumettre"))) return;
          try { await io.submit(); toast("Étape soumise au professeur.", "ok"); } catch (e) { toast(e.message, "error"); }
        };
        action = h("div", { class: "submit-box" }, btn, !canSubmit ? h("div", { class: "muted small" }, `Réussissez d’abord les quêtes obligatoires (${rq.done}/${rq.total}).`) : null);
      } else if (state.status === "soumis") {
        action = h("div", { class: "submit-box" }, h("div", { class: "banner banner-warn" }, "En attente de la validation du professeur."),
          h("button", { class: "btn btn-ghost btn-sm", onclick: async () => { try { await io.cancel(); toast("Soumission annulée : vous pouvez modifier."); } catch (e) { toast(e.message, "error"); } } }, "Annuler la soumission"));
      } else if (state.status === "valide") {
        const g = state.review?.grade;
        action = h("div", { class: "submit-box" }, h("div", { class: "banner banner-ok" }, "Étape validée", g != null ? ` · ${String(g).replace(".", ",")}/20` : "", stage.n < 4 ? " · l’étape suivante est débloquée !" : " · parcours terminé, bravo !"));
      }
    }
    header.append(
      h("div", { class: "stage-title" },
        h("div", { class: "eyebrow" }, `Étape ${stage.n} · ${stage.seance} · ${stage.cycle}`),
        h("h2", {}, stage.title),
        h("p", { class: "muted" }, stage.intro)
      ),
      h("div", { class: "stage-meta" },
        pill(st.icon + " " + st.label, st.kind),
        state.locked ? null : pill(`Quêtes obligatoires ${rq.done}/${rq.total}`, rq.done === rq.total ? "pill-ok" : "pill-muted"),
        state.locked ? null : pill(`Activité ${comp} %`, comp >= 80 ? "pill-ok" : "pill-muted"),
        saveState
      ),
      state.locked && state.lockReason ? h("div", { class: "banner banner-info" }, state.lockReason) : null,
      action
    );
  }

  // ---- onglets --------------------------------------------------------------
  const tabsDef = () => [
    { id: "fiche", label: "Fiche révision" },
    { id: "quetes", label: `Quêtes ${requiredStatus().done}/${requiredStatus().total}`, hidden: false },
    { id: "activite", label: "Activité principale" },
    { id: "echanges", label: "Échanges" + (state.comments?.length ? ` (${state.comments.length})` : ""), hidden: demo },
    { id: "evaluation", label: "Évaluation", hidden: demo || !(state.review && (state.review.feedback || state.review.validated)) },
    { id: "corrige", label: "Corrigé", hidden: demo || state.status !== "valide" },
  ];
  function renderTabs() {
    clear(tabsBar);
    tabsDef().filter((t) => !t.hidden).forEach((t) => {
      tabsBar.append(h("button", { role: "tab", class: "tab" + (t.id === tab ? " on" : ""), "aria-selected": t.id === tab ? "true" : "false", onclick: () => { tab = t.id; renderTabs(); renderBody(); } }, t.label));
    });
  }

  // ---- contenu ----------------------------------------------------------------
  let comments = null;
  function renderBody() {
    clear(body);
    comments = null;
    if (tab === "fiche") {
      body.append(
        h("div", { class: "objectifs" },
          h("div", {}, h("strong", {}, "Objectifs"), h("ul", { class: "list compact" }, stage.objectifs.map((o) => h("li", {}, o)))),
          h("div", {}, h("strong", {}, "Livrable"), h("p", {}, stage.livrable))
        ),
        renderFiche(stage.fiche, { title: `Fiche révision · ${stage.theme}`, subtitle: stage.seance })
      );
    } else if (tab === "quetes") {
      if (state.locked) { body.append(h("div", { class: "empty-box" }, "Les quêtes s’ouvriront quand l’étape sera débloquée. En attendant, révisez la fiche !")); return; }
      body.append(renderQuestList(stage, state.quests, {
        onPlay: (q) => playQuest(q, {
          demo,
          onResult: async (score, max, passed) => {
            await io.saveQuest(q, score, max, passed);
            const prev = state.quests[q.id] || { best_score: 0, attempts: 0, passed: false };
            state.quests[q.id] = { ...prev, best_score: Math.max(prev.best_score, score), max_score: max, passed: prev.passed || passed, attempts: prev.attempts + 1 };
            renderHeader(); renderTabs(); if (tab === "quetes") renderBody();
          },
        }),
      }));
    } else if (tab === "activite") {
      if (state.locked) { body.append(h("div", { class: "empty-box" }, "L’activité s’ouvrira quand l’étape sera débloquée.")); return; }
      body.append(
        h("div", { class: "act-intro" }, h("h3", {}, stage.activity.title), h("p", {}, stage.activity.intro),
          demo ? h("div", { class: "banner banner-info" }, "Mode démonstration : vous pouvez tout essayer, rien n’est enregistré.") : null,
          !demo && editable() ? h("p", { class: "muted small" }, "Enregistrement automatique. Conseil : un seul « secrétaire » par équipe remplit l’activité, les autres jouent les quêtes sur leur appareil.") : null,
          !editable() && !demo ? h("div", { class: "banner banner-info" }, state.status === "valide" ? "Étape validée : lecture seule." : "Étape soumise : lecture seule.") : null
        ),
        renderActivity(stage, { data, editable: editable() || demo, onChange, context }).el
      );
    } else if (tab === "echanges") {
      comments = renderComments({ me: "equipe", askName: true, onSend: async (body, name) => { await io.comment(body, name); } });
      comments.update(state.comments || []);
      body.append(h("p", { class: "muted" }, "Posez vos questions au professeur ; ses conseils et commentaires apparaissent ici."), comments.el);
    } else if (tab === "evaluation") {
      const r = state.review || {};
      body.append(h("div", { class: "evaluation" },
        r.validated && r.grade != null ? h("div", { class: "grade-big" }, String(r.grade).replace(".", ","), h("span", {}, "/20")) : h("p", { class: "muted" }, "La note sera visible quand l’étape sera validée."),
        r.validated && r.scores ? h("table", { class: "table" }, h("tbody", {}, stage.rubric.map((c) => h("tr", {}, h("td", {}, c.label), h("td", { class: "num" }, `${r.scores[c.id] ?? "—"} / ${c.max}`))))) : null,
        r.extra?.avis_cse ? h("p", {}, h("strong", {}, "Avis du CSE : "), r.extra.avis_cse) : null,
        r.feedback ? h("div", { class: "callout callout-key" }, h("strong", { class: "callout-title" }, "Commentaire du professeur"), h("div", { class: "ro-text" }, r.feedback)) : null
      ));
    } else if (tab === "corrige") {
      body.append(h("div", { class: "fiche" }, h("p", { class: "muted" }, "Éléments de corrigé, à comparer avec votre travail."),
        stage.corrige.map((s) => h("section", { class: "fiche-section" }, h("h3", {}, s.title), renderBlocks(s.blocks)))));
    }
  }

  renderHeader();
  renderTabs();
  renderBody();

  return {
    el: root,
    flush,
    hasPending: () => dirty.size > 0 || saving,
    // Mise à jour légère (sondage) : ne touche pas au formulaire en cours d'édition
    update(next) {
      const statusChanged = next.status !== state.status || next.locked !== state.locked;
      Object.assign(state, next, { data: state.data });
      renderHeader();
      renderTabs();
      if (statusChanged) { renderBody(); return; }
      if (tab === "echanges" && comments) comments.update(state.comments || []);
      if (tab === "evaluation") renderBody();
    },
    replaceData(newData) {
      data = newData || {};
      state.data = data;
      renderHeader();
      if (tab === "activite") renderBody();
    },
    setContext(ctx) { context = ctx; },
  };
}

export function lockedTeaser(stage, reason) {
  return h("div", { class: "stage-panel" },
    h("div", { class: "stage-header" },
      h("div", { class: "stage-title" }, h("div", { class: "eyebrow" }, `Étape ${stage.n} · ${stage.seance}`), h("h2", {}, "🔒 " + stage.title), h("p", { class: "muted" }, md(stage.intro))),
      h("div", { class: "banner banner-info" }, reason)
    )
  );
}

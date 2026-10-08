import { h, clear, STATUS, md } from "../ui.js";
import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { STAGES, COMPANY, COURSE, XP, allQuests } from "../content.js";
import { createStagePanel } from "../components/stageview.js";
import { renderFiche, renderBlocks } from "../components/fiche.js";
import { renderDeliverable } from "../components/activity.js";

const QUESTS = allQuests();

export function teamXp(t) {
  let xp = 0;
  (t.quests || []).forEach((id) => {
    const q = QUESTS.find((x) => x.id === id);
    if (q) xp += q.required ? XP.required : XP.bonus;
  });
  (t.stages || []).forEach((s) => s.status === "valide" && (xp += XP.validated));
  return xp;
}

export function spectatorView(root) {
  let tab = "presentation";
  let timer = null;
  let destroyed = false;
  const demoState = {}; // n -> state en mémoire
  let demoStage = 1;

  const tabs = h("div", { class: "tabs tabs-big" });
  const body = h("div", { class: "spect-body" });
  root.append(h("div", { class: "container wide" }, tabs, body));
  renderTabs();
  renderBody();
  return { destroy: () => { destroyed = true; clearInterval(timer); } };

  function renderTabs() {
    clear(tabs);
    [["presentation", "Présentation du jeu"], ["live", "Tableau en direct"], ["demo", "Explorer les étapes (démo)"]].forEach(([id, label]) =>
      tabs.append(h("button", { class: "tab" + (tab === id ? " on" : ""), onclick: () => { tab = id; renderTabs(); renderBody(); } }, label)));
  }

  function renderBody() {
    clearInterval(timer);
    clear(body);
    if (tab === "presentation") body.append(presentation());
    else if (tab === "live") { liveBoard(); timer = setInterval(liveBoard, CONFIG.POLL_INTERVAL_MS || 5000); }
    else demo();
  }

  // ===========================================================================
  //  Présentation du jeu
  // ===========================================================================
  function presentation() {
    const url = location.href.split("#")[0];
    return h("div", { class: "present" },
      h("section", { class: "hero" },
        h("div", { class: "eyebrow" }, COURSE.subtitle),
        h("h1", {}, COURSE.title),
        h("p", { class: "hero-lead" }, COURSE.pitch),
        h("div", { class: "join-url" }, h("span", { class: "muted" }, "Rejoignez le jeu : "), h("strong", {}, url))
      ),
      h("section", {},
        h("h2", { class: "section-title" }, "Comment on joue"),
        h("ol", { class: "how" },
          howItem("Créez votre équipe", "Sur le site : « Je suis une équipe ». Un membre crée l’équipe et obtient un code à 6 caractères ; les autres la rejoignent avec ce code."),
          howItem("Révisez la fiche", "Chaque étape a sa fiche révision : toutes les notions du cours, à consulter à tout moment."),
          howItem("Réussissez les quêtes", "Quiz de vocabulaire, classements, associations, calculs… Les quêtes obligatoires débloquent la soumission de l’étape ; les quêtes bonus rapportent des points."),
          howItem("Réalisez l’activité principale", "C’est le cœur de l’étape : elle produit un morceau de votre plan. Le professeur suit votre avancée en direct, commente et vous aide."),
          howItem("Soumettez, faites valider", "Le professeur note votre travail et valide l’étape : la suivante se débloque. Il peut aussi vous la renvoyer pour l’améliorer.")
        )
      ),
      h("section", {},
        h("h2", { class: "section-title" }, "4 séances, 4 étapes, un plan de compétences"),
        h("div", { class: "stage-cards" }, STAGES.map((s) =>
          h("div", { class: "stage-card" },
            h("div", { class: "stage-num" }, s.n),
            h("div", { class: "eyebrow" }, `${s.seance} · ${s.cycle}`),
            h("h3", {}, s.title),
            h("p", { class: "muted" }, s.theme),
            h("p", { class: "small" }, h("strong", {}, "Activité : "), s.activity.title),
            h("p", { class: "small" }, h("strong", {}, "Livrable : "), s.livrable),
            h("p", { class: "small muted" }, `${s.quests.filter((q) => q.required).length} quêtes obligatoires · ${s.quests.filter((q) => !q.required).length} bonus`)
          )
        ))
      ),
      h("section", { class: "two-cols" },
        h("div", { class: "card" },
          h("h2", {}, "Le fil rouge : MécaLoire"),
          renderBlocks(COMPANY.sections[0].blocks),
          h("p", {}, md("Enjeux : **robotiser la soudure**, décrocher la **certification EN 9100**, déployer un **nouvel ERP**… avec 22 % de salariés de plus de 55 ans et des formations obligatoires à échéance."))
        ),
        h("div", { class: "card" },
          h("h2", {}, "Points d’expérience"),
          h("ul", { class: "list" },
            h("li", {}, md(`Quête obligatoire réussie : **+${XP.required} XP**`)),
            h("li", {}, md(`Quête bonus réussie : **+${XP.bonus} XP**`)),
            h("li", {}, md(`Étape validée par le professeur : **+${XP.validated} XP**`))
          ),
          h("p", { class: "muted" }, "Mais le vrai classement, c’est la pertinence du plan final, défendu devant le CSE.")
        )
      )
    );
  }
  function howItem(title, text) {
    return h("li", {}, h("strong", {}, title), h("span", {}, text));
  }

  // ===========================================================================
  //  Tableau en direct
  // ===========================================================================
  async function liveBoard() {
    let ov;
    try { ov = await api.publicOverview(); } catch (e) {
      clear(body); body.append(h("div", { class: "banner banner-warn" }, e.message)); return;
    }
    if (destroyed || tab !== "live") return;
    const y = window.scrollY;
    clear(body);
    const teams = ov.teams.map((t) => ({ ...t, xp: teamXp(t) })).sort((a, b) => b.xp - a.xp);
    body.append(
      h("div", { class: "live-head" },
        h("h1", {}, "Tableau en direct"),
        h("div", { class: "muted" }, `Séance ouverte : ${ov.settings.max_stage} · ${teams.length} équipe(s) · mise à jour automatique`)
      ),
      teams.length ? h("div", { class: "board" }, teams.map((t, i) => teamCard(t, i))) : h("div", { class: "empty-box big" }, "Aucune équipe pour l’instant. À vous de jouer !"),
      ov.spotlight ? spotlight(ov.spotlight) : null
    );
    window.scrollTo(0, y);
  }

  function teamCard(t, rank) {
    const stageStatus = (n) => (n > t.current_stage ? "verrouille" : t.stages.find((s) => s.stage === n)?.status || "en_cours");
    return h("div", { class: "board-card" },
      h("div", { class: "board-top" },
        h("span", { class: "rank" }, `#${rank + 1}`),
        h("div", { class: "board-name" }, h("strong", {}, t.name), h("div", { class: "hint" }, t.members.join(", "))),
        h("div", { class: "xp" }, t.xp, h("span", {}, " XP"))
      ),
      h("div", { class: "track" }, STAGES.map((s) => {
        const st = stageStatus(s.n);
        const passed = s.quests.filter((q) => t.quests.includes(q.id)).length;
        return h("div", { class: "track-step st-" + st, title: `Étape ${s.n} : ${STATUS[st].label}` },
          h("div", { class: "track-label" }, `${STATUS[st].icon} Étape ${s.n}`),
          h("div", { class: "track-quests" }, s.quests.map((q) => h("span", { class: "dot" + (t.quests.includes(q.id) ? " on" : "") + (q.required ? "" : " bonus") }))),
          h("div", { class: "hint" }, `${passed}/${s.quests.length} quêtes`)
        );
      }))
    );
  }

  function spotlight(sp) {
    const datas = sp.datas || {};
    const s = STAGES.find((x) => x.n === Number(sp.stage));
    return h("section", { class: "card spotlight" },
      h("div", { class: "eyebrow" }, "Projection"),
      h("h2", {}, `${sp.team_name} · Étape ${s.n} : ${s.activity.title}`),
      datas[s.n] && Object.keys(datas[s.n]).length ? renderDeliverable(s.n, datas[s.n], { allData: datas }) : h("div", { class: "empty-box" }, "Cette équipe n’a pas encore de contenu pour cette étape.")
    );
  }

  // ===========================================================================
  //  Démo : naviguer dans les étapes sans rien enregistrer
  // ===========================================================================
  function demo() {
    const sel = h("div", { class: "seg" });
    const holder = h("div", {});
    const draw = () => {
      clear(sel);
      STAGES.forEach((s) => sel.append(h("button", { class: "seg-btn" + (demoStage === s.n ? " on" : ""), onclick: () => { demoStage = s.n; draw(); } }, `Étape ${s.n}`)));
      sel.append(h("button", { class: "seg-btn" + (demoStage === 0 ? " on" : ""), onclick: () => { demoStage = 0; draw(); } }, "Dossier MécaLoire"));
      clear(holder);
      if (demoStage === 0) { holder.append(renderFiche(COMPANY.sections, { title: COMPANY.title })); return; }
      const s = STAGES.find((x) => x.n === demoStage);
      const state = (demoState[s.n] = demoState[s.n] || { status: "en_cours", locked: false, data: {}, quests: {}, review: null, comments: [] });
      const panel = createStagePanel(s, {
        mode: "demo",
        state,
        context: { allData: Object.fromEntries(Object.entries(demoState).map(([k, v]) => [k, v.data])), members: [] },
        io: { saveData: async () => {}, saveQuest: async () => {}, submit: async () => {}, cancel: async () => {}, comment: async () => {} },
      });
      holder.append(panel.el);
    };
    draw();
    body.append(h("div", { class: "banner banner-info" }, "Mode démonstration : idéal pour présenter le jeu en classe. Tout est accessible et rien n’est enregistré."), sel, holder);
  }
}

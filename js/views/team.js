import { h, clear, toast, modal, confirmBox, STATUS } from "../ui.js";
import { api } from "../api.js";
import { CONFIG } from "../config.js";
import { STAGES, COMPANY, COURSE, stageByN } from "../content.js";
import { createStagePanel, lockedTeaser } from "../components/stageview.js";
import { renderFiche } from "../components/fiche.js";
import { renderFinal } from "../components/final.js";

const KEY = "mpc-team";
const getSaved = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };
const setSaved = (v) => { try { v ? localStorage.setItem(KEY, JSON.stringify(v)) : localStorage.removeItem(KEY); } catch {} };

export function teamView(root) {
  let timer = null;
  let destroyed = false;

  const destroy = () => { destroyed = true; clearInterval(timer); };
  const saved = getSaved();
  saved ? start(saved) : renderJoin();
  return { destroy };

  // ===========================================================================
  //  Créer / rejoindre une équipe
  // ===========================================================================
  function renderJoin(message) {
    clear(root);
    const memberBox = h("div", { class: "member-inputs" });
    const addMember = (v = "") => {
      if (memberBox.children.length >= 8) return;
      memberBox.append(h("input", { class: "input", placeholder: `Prénom ${memberBox.children.length + 1}`, maxlength: 40, value: v }));
    };
    for (let i = 0; i < 4; i++) addMember();

    const cName = h("input", { class: "input", placeholder: "Ex. : Les Robots RH", maxlength: 40 });
    const cBtn = h("button", { class: "btn btn-primary" }, "Créer l’équipe");
    cBtn.onclick = async () => {
      cBtn.disabled = true;
      try {
        const members = [...memberBox.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean);
        const t = await api.createTeam(cName.value, members);
        setSaved({ id: t.id, code: t.code, name: t.name });
        modal({
          title: "Équipe créée !",
          body: h("div", { class: "code-reveal" },
            h("p", {}, "Voici le code de votre équipe. ", h("strong", {}, "Notez-le"), " : il permet à chaque membre de vous rejoindre et de retrouver votre travail à la prochaine séance, sur n’importe quel appareil."),
            h("div", { class: "code-big" }, t.code),
            h("p", { class: "muted" }, `Nom de l’équipe : ${t.name}`)
          ),
          actions: [{ label: "C’est noté", class: "btn-primary" }],
        });
        start({ id: t.id, code: t.code, name: t.name });
      } catch (e) { toast(e.message, "error"); } finally { cBtn.disabled = false; }
    };

    const jName = h("input", { class: "input", placeholder: "Nom exact de l’équipe", maxlength: 40 });
    const jCode = h("input", { class: "input input-code", placeholder: "Code à 6 caractères", maxlength: 6, autocomplete: "off" });
    const jBtn = h("button", { class: "btn btn-primary" }, "Rejoindre");
    jBtn.onclick = async () => {
      jBtn.disabled = true;
      try {
        const t = await api.joinTeam(jName.value, jCode.value);
        setSaved({ id: t.id, code: t.code, name: t.name });
        start({ id: t.id, code: t.code, name: t.name });
      } catch (e) { toast(e.message, "error"); } finally { jBtn.disabled = false; }
    };
    jCode.addEventListener("keydown", (e) => e.key === "Enter" && jBtn.click());

    root.append(h("div", { class: "container narrow" },
      h("div", { class: "page-head" }, h("h1", {}, "Espace équipe"), h("p", { class: "muted" }, COURSE.pitch)),
      message ? h("div", { class: "banner banner-warn" }, message) : null,
      h("div", { class: "two-cols" },
        h("div", { class: "card" },
          h("h2", {}, "Créer une équipe"),
          h("p", { class: "muted small" }, "Une seule équipe par groupe : un membre la crée, les autres la rejoignent avec le code."),
          h("label", { class: "field-label" }, "Nom de l’équipe"), cName,
          h("label", { class: "field-label" }, "Membres"), memberBox,
          h("button", { class: "btn btn-ghost btn-sm", onclick: () => addMember() }, "+ Ajouter un membre"),
          h("div", { class: "card-actions" }, cBtn)
        ),
        h("div", { class: "card" },
          h("h2", {}, "Rejoindre mon équipe"),
          h("p", { class: "muted small" }, "Votre équipe existe déjà ? Entrez son nom et son code (demandez-le à un coéquipier ou au professeur)."),
          h("label", { class: "field-label" }, "Nom de l’équipe"), jName,
          h("label", { class: "field-label" }, "Code"), jCode,
          h("div", { class: "card-actions" }, jBtn)
        )
      )
    ));
  }

  // ===========================================================================
  //  Espace de jeu
  // ===========================================================================
  async function start(cred) {
    clear(root);
    root.append(h("div", { class: "loading" }, "Chargement de votre équipe…"));
    let st;
    try {
      st = await api.teamState(cred.id, cred.code, true);
    } catch (e) {
      setSaved(null);
      renderJoin("Impossible de retrouver votre équipe (" + e.message + "). Elle a peut-être été supprimée par le professeur.");
      return;
    }
    if (destroyed) return;

    const datas = {};
    const lastSeen = {};
    st.submissions.forEach((s) => { datas[s.stage] = s.data || {}; lastSeen[s.stage] = s.updated_at; });
    let view = { kind: "stage", n: Math.min(st.team.current_stage, st.settings.max_stage, 4) };
    let panel = null;
    let panelKind = null;

    const nav = h("nav", { class: "side-nav" });
    const main = h("main", { class: "main" });
    const reloadBanner = h("div", { class: "banner banner-info hidden" });
    const teamCard = h("div", { class: "team-card" });
    clear(root);
    root.append(h("div", { class: "layout" }, h("aside", { class: "sidebar" }, teamCard, nav), h("div", { class: "main-wrap" }, reloadBanner, main)));

    const stageStatus = (n) => {
      if (n > st.settings.max_stage || n > st.team.current_stage) return "verrouille";
      return st.submissions.find((s) => s.stage === n)?.status || "en_cours";
    };
    const stageState = (n) => {
      const locked = n > st.team.current_stage;
      return {
        status: st.submissions.find((s) => s.stage === n)?.status || "en_cours",
        locked,
        lockReason: locked ? "Étape verrouillée : le professeur doit d’abord valider l’étape précédente. Vous pouvez déjà réviser la fiche." : "",
        data: datas[n] || (datas[n] = {}),
        quests: Object.fromEntries(st.quests.filter((q) => q.stage === n).map((q) => [q.quest_id, q])),
        review: st.reviews.find((r) => r.stage === n) || null,
        comments: st.comments.filter((c) => c.stage === n),
      };
    };

    function renderTeamCard() {
      clear(teamCard);
      const codeEl = h("span", { class: "code-mask" }, "••••••");
      let shown = false;
      teamCard.append(
        h("div", { class: "eyebrow" }, "Mon équipe"),
        h("div", { class: "team-name" }, st.team.name),
        h("div", { class: "team-code" }, "Code : ", codeEl, h("button", { class: "link-btn", onclick: (e) => { shown = !shown; codeEl.textContent = shown ? st.team.code : "••••••"; e.target.textContent = shown ? "masquer" : "afficher"; } }, "afficher")),
        h("div", { class: "team-members" }, st.team.members.length ? st.team.members.join(", ") : h("span", { class: "muted" }, "Aucun membre renseigné")),
        h("button", { class: "link-btn", onclick: editMembers }, "Modifier les membres")
      );
    }

    function renderNav() {
      clear(nav);
      const item = (label, sub, active, onclick, icon, extra) =>
        h("button", { class: "nav-item" + (active ? " active" : ""), onclick }, h("span", { class: "nav-icon" }, icon), h("span", { class: "nav-text" }, h("span", {}, label), sub ? h("span", { class: "nav-sub" }, sub) : null), extra || null);
      nav.append(h("div", { class: "nav-title" }, "Les 4 étapes"));
      STAGES.forEach((s) => {
        const status = stageStatus(s.n);
        const nb = st.comments.filter((c) => c.stage === s.n && c.author === "prof").length;
        nav.append(item(`${s.n}. ${s.title}`, `${s.seance} · ${STATUS[status].label}`, view.kind === "stage" && view.n === s.n, () => go({ kind: "stage", n: s.n }), STATUS[status].icon,
          nb ? h("span", { class: "badge", title: "Messages du professeur" }, nb) : null));
      });
      nav.append(h("div", { class: "nav-title" }, "Ressources"));
      nav.append(item("Dossier MécaLoire", "Le cas fil rouge", view.kind === "company", () => go({ kind: "company" }), "▤"));
      nav.append(item("Dossier final", "Tous nos livrables", view.kind === "final", () => go({ kind: "final" }), "★"));
      nav.append(h("button", { class: "link-btn nav-leave", onclick: leave }, "Quitter l’équipe sur cet appareil"));
    }

    async function go(v) {
      if (panel) await panel.flush();
      view = v;
      renderNav();
      renderMain();
      main.scrollIntoView({ block: "start" });
    }

    function renderMain() {
      clear(main);
      panel = null;
      panelKind = null;
      reloadBanner.classList.add("hidden");
      if (view.kind === "company") {
        main.append(renderFiche(COMPANY.sections, { title: COMPANY.title, subtitle: "Cas fictif utilisé de l’étape 2 à l’étape 4" }));
        return;
      }
      if (view.kind === "final") {
        main.append(h("div", { class: "loading" }, "Chargement…"));
        api.teamState(cred.id, cred.code, true).then((full) => {
          if (view.kind !== "final") return;
          full.submissions.forEach((s) => (datas[s.stage] = s.data || {}));
          clear(main);
          main.append(renderFinal({ teamName: st.team.name, members: st.team.members, datas, statuses: Object.fromEntries(STAGES.map((s) => [s.n, STATUS[stageStatus(s.n)].label])) }));
        }).catch((e) => toast(e.message, "error"));
        return;
      }
      const stage = stageByN(view.n);
      if (view.n > st.settings.max_stage) {
        panelKind = "teaser";
        main.append(lockedTeaser(stage, `Cette étape s’ouvrira à la séance ${stage.n}, quand le professeur l’activera.`));
        return;
      }
      panelKind = "panel";
      panel = createStagePanel(stage, {
        mode: "team",
        state: stageState(view.n),
        context: { allData: datas, members: st.team.members },
        io: {
          saveData: async (patch) => {
            const ts = await api.saveSubmission(cred.id, cred.code, stage.n, patch);
            lastSeen[stage.n] = ts;
          },
          saveQuest: async (q, score, max, passed) => {
            await api.saveQuest(cred.id, cred.code, stage.n, q.id, score, max, passed);
            if (passed) toast(`Quête « ${q.title} » réussie !`, "ok");
            await poll();
          },
          submit: async () => { await api.submitStage(cred.id, cred.code, stage.n); await poll(); },
          cancel: async () => { await api.cancelSubmission(cred.id, cred.code, stage.n); await poll(); },
          comment: async (body, name) => { await api.postComment(cred.id, cred.code, stage.n, body, name); await poll(); },
        },
      });
      main.append(panel.el);
    }

    async function poll() {
      let next;
      try { next = await api.teamState(cred.id, cred.code, false); }
      catch (e) {
        if (/introuvable/i.test(e.message)) { clearInterval(timer); setSaved(null); renderJoin("Votre équipe n’existe plus (supprimée par le professeur)."); }
        return;
      }
      if (destroyed) return;
      // notifications
      next.submissions.forEach((s) => {
        const before = st.submissions.find((x) => x.stage === s.stage);
        if (s.status === "valide" && before?.status !== "valide") toast(`Le professeur a validé l’étape ${s.stage} !`, "ok");
        if (s.status === "en_cours" && before?.status === "soumis") toast(`L’étape ${s.stage} vous a été renvoyée : voyez l’onglet Évaluation ou Échanges.`, "info");
      });
      const newProf = next.comments.filter((c) => c.author === "prof" && !st.comments.some((o) => o.id === c.id));
      newProf.forEach((c) => toast(`Nouveau message du professeur (étape ${c.stage})`, "info"));
      const maxChanged = next.settings.max_stage !== st.settings.max_stage;
      st = next;
      renderTeamCard();
      renderNav();
      if (view.kind !== "stage") return;
      if (panelKind === "teaser" && !(view.n > st.settings.max_stage)) { renderMain(); return; }
      if (panelKind === "panel" && view.n > st.settings.max_stage) { renderMain(); return; }
      if (maxChanged && panelKind !== "panel") renderMain();
      if (panel) {
        panel.update(stageState(view.n));
        const remote = st.submissions.find((s) => s.stage === view.n);
        if (remote?.updated_at && lastSeen[view.n] && new Date(remote.updated_at) > new Date(lastSeen[view.n]) && !panel.hasPending() && remote.status === "en_cours") {
          clear(reloadBanner);
          reloadBanner.append("Un membre de votre équipe a modifié cette activité sur un autre appareil. ",
            h("button", { class: "btn btn-sm btn-primary", onclick: reloadData }, "Charger ses modifications"));
          reloadBanner.classList.remove("hidden");
        }
      }
    }

    async function reloadData() {
      const full = await api.teamState(cred.id, cred.code, true);
      full.submissions.forEach((s) => { datas[s.stage] = s.data || {}; lastSeen[s.stage] = s.updated_at; });
      reloadBanner.classList.add("hidden");
      if (panel) panel.replaceData(datas[view.n]);
      toast("Activité mise à jour.");
    }

    function editMembers() {
      const box = h("div", { class: "member-inputs" });
      const add = (v = "") => box.children.length < 8 && box.append(h("input", { class: "input", value: v, maxlength: 40, placeholder: "Prénom" }));
      st.team.members.forEach((m) => add(m));
      add();
      modal({
        title: "Membres de l’équipe",
        body: h("div", {}, box, h("button", { class: "btn btn-ghost btn-sm", onclick: () => add() }, "+ Ajouter")),
        actions: [
          { label: "Annuler", class: "btn-ghost" },
          { label: "Enregistrer", class: "btn-primary", onClick: async () => {
            try {
              await api.updateMembers(cred.id, cred.code, [...box.querySelectorAll("input")].map((i) => i.value.trim()).filter(Boolean));
              await poll();
              toast("Membres mis à jour.", "ok");
            } catch (e) { toast(e.message, "error"); return false; }
          } },
        ],
      });
    }

    async function leave() {
      if (!(await confirmBox("Quitter l’équipe sur cet appareil ?", `Votre travail reste enregistré. Pour revenir, il faudra le nom de l’équipe et son code : ${st.team.code}.`, "Quitter"))) return;
      if (panel) await panel.flush();
      clearInterval(timer);
      setSaved(null);
      renderJoin();
    }

    renderTeamCard();
    renderNav();
    renderMain();
    timer = setInterval(poll, CONFIG.POLL_INTERVAL_MS || 5000);
  }
}

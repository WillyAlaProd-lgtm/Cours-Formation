import { h, clear } from "./ui.js";
import { api } from "./api.js";
import { COURSE, STAGES } from "./content.js";
import { teamView } from "./views/team.js";
import { teacherView } from "./views/teacher.js";
import { spectatorView } from "./views/spectator.js";

const app = document.getElementById("app");
const topbar = document.getElementById("topbar");
let current = null;

function renderTopbar(route) {
  clear(topbar);
  const labels = { equipe: "Équipe", prof: "Professeur", spectateur: "Spectateur" };
  topbar.append(
    h("a", { class: "brand", href: "#/" }, h("span", { class: "brand-mark" }, "PC"), h("span", {}, COURSE.title)),
    h("div", { class: "topbar-right" },
      route && labels[route] ? h("span", { class: "role-badge" }, labels[route]) : null,
      api.mode === "local" ? h("span", { class: "mode-badge", title: "Supabase n’est pas configuré : données stockées dans ce navigateur uniquement." }, "Mode local") : null,
      route ? h("a", { class: "btn btn-ghost btn-sm", href: "#/" }, "Accueil") : null
    )
  );
}

function home(root) {
  root.append(h("div", { class: "container" },
    h("section", { class: "hero" },
      h("div", { class: "eyebrow" }, COURSE.subtitle),
      h("h1", {}, COURSE.title),
      h("p", { class: "hero-lead" }, COURSE.pitch)
    ),
    api.mode === "local" ? h("div", { class: "banner banner-info" }, "Mode local : Supabase n’est pas encore configuré (js/config.js). Le jeu fonctionne, mais les données restent dans ce navigateur. Parfait pour tester avant la mise en ligne.") : null,
    h("div", { class: "role-grid" },
      roleCard("#/equipe", "Je suis une équipe", "Créer ou rejoindre mon équipe, réviser, jouer les quêtes et construire notre plan.", "Entrer"),
      roleCard("#/prof", "Je suis le professeur", "Suivre les équipes en direct, commenter, noter et valider chaque étape.", "Se connecter"),
      roleCard("#/spectateur", "Spectateur", "Présenter le jeu en classe, afficher le tableau en direct et projeter un livrable.", "Regarder")
    ),
    h("section", { class: "stage-strip" }, STAGES.map((s) =>
      h("div", { class: "strip-item" }, h("span", { class: "strip-num" }, s.n), h("div", {}, h("strong", {}, s.title), h("div", { class: "hint" }, s.seance)))
    ))
  ));
  return { destroy() {} };
}

function roleCard(href, title, text, cta) {
  return h("a", { class: "role-card", href }, h("h2", {}, title), h("p", { class: "muted" }, text), h("span", { class: "role-cta" }, cta + " →"));
}

function route() {
  const key = (location.hash.replace(/^#\/?/, "").split("/")[0] || "").toLowerCase();
  if (current?.destroy) current.destroy();
  clear(app);
  window.scrollTo(0, 0);
  const views = { equipe: teamView, prof: teacherView, spectateur: spectatorView };
  const view = views[key];
  renderTopbar(view ? key : "");
  current = view ? view(app) : home(app);
  document.title = (view ? { equipe: "Équipe", prof: "Professeur", spectateur: "Spectateur" }[key] + " · " : "") + COURSE.title;
}

window.addEventListener("hashchange", route);
route();

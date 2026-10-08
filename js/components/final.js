import { h } from "../ui.js";
import { STAGES, COURSE } from "../content.js";
import { renderDeliverable } from "./activity.js";

// Dossier final : tous les livrables de l'équipe, imprimable
export function renderFinal({ teamName, members = [], datas = {}, statuses = {} }) {
  const context = { allData: datas, members };
  return h("div", { class: "final" },
    h("div", { class: "final-head" },
      h("div", {},
        h("div", { class: "eyebrow" }, COURSE.title),
        h("h2", {}, `Dossier final · ${teamName}`),
        members.length ? h("p", { class: "muted" }, members.join(" · ")) : null
      ),
      h("button", { class: "btn btn-ghost no-print", onclick: () => window.print() }, "Imprimer / PDF")
    ),
    h("p", { class: "muted" }, "Le plan de développement des compétences de MécaLoire, construit étape par étape : du cycle de formation au plan chiffré défendu devant le CSE."),
    STAGES.map((s) =>
      h("section", { class: "final-stage" },
        h("h3", {}, `Étape ${s.n} · ${s.activity.title}`, statuses[s.n] ? h("span", { class: "muted small" }, ` (${statuses[s.n]})`) : null),
        datas[s.n] && Object.keys(datas[s.n]).length
          ? renderDeliverable(s.n, datas[s.n], context)
          : h("div", { class: "empty-box" }, "Pas encore de contenu pour cette étape.")
      )
    )
  );
}

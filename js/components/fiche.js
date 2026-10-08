import { h, md } from "../ui.js";

export function renderBlocks(blocks) {
  return blocks.map((b) => {
    switch (b.t) {
      case "p":
        return h("p", {}, md(b.text));
      case "list":
        return h("ul", { class: "list" }, b.items.map((i) => h("li", {}, md(i))));
      case "key":
        return h("div", { class: "callout callout-key" }, h("strong", { class: "callout-title" }, "À retenir"), h("div", {}, md(b.text)));
      case "note":
        return h("div", { class: "callout callout-note" }, h("strong", { class: "callout-title" }, "Attention"), h("div", {}, md(b.text)));
      case "table":
        return h(
          "div",
          { class: "table-wrap" },
          h("table", { class: "table" },
            h("thead", {}, h("tr", {}, b.head.map((c) => h("th", {}, md(c))))),
            h("tbody", {}, b.rows.map((r) => h("tr", {}, r.map((c) => h("td", {}, md(c))))))
          )
        );
      case "cards":
        return h(
          "div",
          { class: "cards" },
          b.items.map((c) =>
            h("div", { class: "card-mini" },
              h("div", { class: "card-mini-title" }, md(c.title)),
              c.sub ? h("div", { class: "card-mini-sub" }, c.sub) : null,
              Array.isArray(c.text) ? h("ul", { class: "list compact" }, c.text.map((t) => h("li", {}, md(t)))) : h("p", {}, md(c.text))
            )
          )
        );
      case "steps":
        return h(
          "ol",
          { class: "steps" },
          b.items.map((s) => h("li", {}, h("strong", {}, md(s.title)), h("span", {}, md(s.text))))
        );
      case "stats":
        return h("div", { class: "stats" }, b.items.map((s) => h("div", { class: "stat" }, h("div", { class: "stat-value" }, s.value), h("div", { class: "stat-label" }, md(s.label)))));
      default:
        return null;
    }
  });
}

// Fiche de révision : sommaire + sections dépliables
export function renderFiche(sections, { title, subtitle } = {}) {
  const toc = h(
    "nav",
    { class: "fiche-toc" },
    h("div", { class: "fiche-toc-title" }, "Sommaire"),
    h("ol", {}, sections.map((s, i) => h("li", {}, h("a", { href: "#", onclick: (e) => { e.preventDefault(); document.getElementById(`fs-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); } }, s.title))))
  );
  return h(
    "div",
    { class: "fiche" },
    title ? h("div", { class: "fiche-head" }, h("h2", {}, title), subtitle ? h("p", { class: "muted" }, subtitle) : null,
      h("button", { class: "btn btn-ghost btn-sm no-print", onclick: () => window.print() }, "Imprimer la fiche")) : null,
    toc,
    sections.map((s, i) => h("section", { class: "fiche-section", id: `fs-${i}` }, h("h3", {}, s.title), renderBlocks(s.blocks)))
  );
}

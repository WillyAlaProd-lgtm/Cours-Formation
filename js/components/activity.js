import { h, clear, fmtEur, parseNum, confirmBox, pill, toast } from "../ui.js";
import { renderBlocks } from "./fiche.js";
import { CATALOG, BUDGET, MASSE_SALARIALE, TAUX_HORAIRE, STRATEGIC_GOALS, stageByN } from "../content.js";

// -----------------------------------------------------------------------------
//  Activité principale : rendu éditable ou en lecture seule
//  data     : objet des réponses (modifié sur place)
//  onChange : appelé avec l'identifiant du champ racine modifié
//  context  : { allData: {1:{},2:{},3:{},4:{}}, members: [] }
// -----------------------------------------------------------------------------
export function renderActivity(stage, { data, editable, onChange = () => {}, context = {} }) {
  const refreshers = [];
  const changed = (id) => {
    onChange(id);
    refreshers.forEach((r) => r());
  };
  const env = { stage, data, editable, changed, refreshers, context };
  const el = h(
    "div",
    { class: "activity" + (editable ? "" : " is-readonly") },
    stage.activity.sections.map((sec) =>
      h(
        "section",
        { class: "act-section" },
        h("h3", {}, sec.title),
        sec.help ? h("p", { class: "muted" }, sec.help) : null,
        sec.fields.map((f) => renderField(f, env))
      )
    )
  );
  return { el, refresh: () => refreshers.forEach((r) => r()) };
}

function renderField(f, env) {
  const { data, editable, changed } = env;
  switch (f.type) {
    case "info":
      return h("div", { class: "act-info" }, renderBlocks(f.blocks));
    case "memo":
      return memoField(f, env);
    case "grid":
      return gridField(f, env);
    case "repeater":
      return repeaterField(f, env);
    case "codir":
      return codirField(f, env);
    case "plan":
      return planField(f, env);
    default: {
      const wrap = h("div", { class: "field" }, h("label", { class: "field-label" }, f.label));
      wrap.append(
        editable
          ? control(f, data[f.id], (v) => { data[f.id] = v; changed(f.id); })
          : display(f, data[f.id])
      );
      return wrap;
    }
  }
}

// --- Contrôles élémentaires ---------------------------------------------------
function autosize(t) {
  t.style.height = "auto";
  t.style.height = Math.min(t.scrollHeight + 2, 600) + "px";
}

export function control(col, value, set) {
  switch (col.type) {
    case "textarea": {
      const t = h("textarea", { class: "input", rows: 2, placeholder: col.placeholder || "", value: value || "", maxlength: 3000 });
      t.addEventListener("input", () => { autosize(t); set(t.value); });
      requestAnimationFrame(() => autosize(t));
      return t;
    }
    case "number": {
      const i = h("input", { class: "input input-num", inputmode: "decimal", placeholder: col.placeholder || "0", value: value ?? "" });
      i.addEventListener("input", () => { const n = parseNum(i.value); set(i.value.trim() === "" ? "" : Number.isNaN(n) ? i.value : n); });
      return col.unit ? h("div", { class: "num-line" }, i, h("span", { class: "unit" }, col.unit)) : i;
    }
    case "select": {
      const s = h("select", { class: "input", onchange: () => set(s.value) },
        h("option", { value: "" }, "— Choisir —"),
        col.options.map((o) => h("option", { value: o }, o))
      );
      s.value = value || "";
      return s;
    }
    case "chips": {
      const cur = new Set(Array.isArray(value) ? value : []);
      return h("div", { class: "chips" }, col.options.map((o) => {
        const b = h("button", { type: "button", class: "chip" + (cur.has(o) ? " on" : ""), "aria-pressed": cur.has(o) ? "true" : "false" }, o);
        b.onclick = () => {
          cur.has(o) ? cur.delete(o) : cur.add(o);
          b.classList.toggle("on", cur.has(o));
          b.setAttribute("aria-pressed", cur.has(o) ? "true" : "false");
          set(col.options.filter((x) => cur.has(x)));
        };
        return b;
      }));
    }
    default: {
      const i = h("input", { class: "input", placeholder: col.placeholder || "", value: value || "", maxlength: 300 });
      i.addEventListener("input", () => set(i.value));
      return i;
    }
  }
}

function isFilled(v) {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  return String(v).trim() !== "";
}

export function display(col, value) {
  if (!isFilled(value)) return h("span", { class: "empty" }, "—");
  if (col.type === "chips") return h("div", { class: "chips" }, value.map((v) => h("span", { class: "chip on static" }, v)));
  if (col.type === "number") return h("span", {}, `${String(value).replace(".", ",")}${col.unit ? " " + col.unit : ""}`);
  return h("div", { class: "ro-text" }, String(value));
}

// --- Grille : lignes fixes × colonnes ---------------------------------------
function gridField(f, env) {
  const { data, editable, changed } = env;
  if (!data[f.id] || typeof data[f.id] !== "object") data[f.id] = {};
  const val = data[f.id];
  if (!editable) {
    return h("div", { class: "table-wrap" }, h("table", { class: "table table-ro" },
      h("thead", {}, h("tr", {}, h("th", {}, ""), f.columns.map((c) => h("th", {}, c.label)))),
      h("tbody", {}, f.rows.map((r) => h("tr", {},
        h("th", { scope: "row" }, r.label, r.hint ? h("div", { class: "hint" }, r.hint) : null),
        f.columns.map((c) => h("td", {}, display(c, val[r.id]?.[c.id])))
      )))
    ));
  }
  return h("div", { class: "grid-field" }, f.rows.map((r) =>
    h("div", { class: "grid-row" },
      h("div", { class: "grid-row-head" }, h("strong", {}, r.label), r.hint ? h("span", { class: "hint" }, r.hint) : null),
      h("div", { class: "grid-cols cols-" + Math.min(f.columns.length, 4) }, f.columns.map((c) =>
        h("div", { class: "field" + (c.type === "chips" || c.type === "textarea" && f.columns.length > 3 ? " span-2" : "") },
          f.columns.length > 1 ? h("label", { class: "field-label" }, c.label) : null,
          control(c, val[r.id]?.[c.id], (v) => {
            val[r.id] = val[r.id] || {};
            val[r.id][c.id] = v;
            changed(f.id);
          })
        )
      ))
    )
  ));
}

// --- Répéteur : lignes ajoutées par l'équipe ---------------------------------
function repeaterField(f, env) {
  const { data, editable, changed, refreshers, context } = env;
  if (!Array.isArray(data[f.id])) data[f.id] = [];
  const rows = data[f.id];
  if (editable && rows.length === 0) {
    const n = f.id === "selfmap" && context.members?.length ? context.members.length : Math.min(f.min || 1, 3);
    for (let i = 0; i < n; i++) rows.push(f.id === "selfmap" && context.members?.[i] ? { nom: context.members[i] } : {});
  }
  const numericCols = f.columns.filter((c) => c.numeric);
  const avgRow = () => numericCols.map((c) => {
    const vals = rows.map((r) => parseNum(r[c.id])).filter((v) => !Number.isNaN(v));
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1).replace(".", ",") : "—";
  });

  if (!editable) {
    return h("div", { class: "table-wrap" }, h("table", { class: "table table-ro" },
      h("thead", {}, h("tr", {}, h("th", {}, "#"), f.columns.map((c) => h("th", {}, c.label)))),
      h("tbody", {},
        rows.length ? rows.map((r, i) => h("tr", {}, h("td", {}, i + 1), f.columns.map((c) => h("td", {}, display(c, r[c.id]))))) :
          h("tr", {}, h("td", { colspan: f.columns.length + 1, class: "empty" }, "Aucune ligne")),
        f.average && rows.length ? h("tr", { class: "row-total" }, h("td", {}, "Moy."), f.columns.map((c) => h("td", {}, c.numeric ? avgRow()[numericCols.indexOf(c)] : ""))) : null
      )
    ));
  }

  const list = h("div", { class: "rep-list" });
  const avgBox = f.average ? h("div", { class: "rep-avg" }) : null;
  const renderAvg = () => {
    if (!avgBox) return;
    clear(avgBox);
    avgBox.append(h("strong", {}, "Moyenne de l’équipe : "), numericCols.map((c, i) => h("span", { class: "avg-item" }, `${c.label} ${avgRow()[i]}`)));
  };
  const render = () => {
    clear(list);
    rows.forEach((r, i) => {
      list.append(h("div", { class: "rep-row" },
        h("div", { class: "rep-num" }, i + 1),
        h("div", { class: "grid-cols cols-" + Math.min(f.columns.length, 4) + (f.columns.length > 4 ? " cols-many" : "") }, f.columns.map((c) =>
          h("div", { class: "field" },
            h("label", { class: "field-label" }, c.label),
            control(c, r[c.id], (v) => { r[c.id] = v; changed(f.id); })
          )
        )),
        h("button", { type: "button", class: "icon-btn rep-del", title: "Supprimer la ligne", "aria-label": "Supprimer la ligne", onclick: () => { rows.splice(i, 1); changed(f.id); render(); } }, "✕")
      ));
    });
    renderAvg();
  };
  render();
  if (avgBox) refreshers.push(renderAvg);
  const counter = h("span", { class: "muted small" });
  const renderCounter = () => (counter.textContent = f.min ? `${rows.length} ligne(s) · minimum conseillé : ${f.min}` : `${rows.length} ligne(s)`);
  renderCounter();
  refreshers.push(renderCounter);
  return h("div", { class: "rep" }, list, avgBox,
    h("div", { class: "rep-foot" },
      h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: () => { if (rows.length >= 30) return; rows.push({}); changed(f.id); render(); } }, "+ " + (f.addLabel || "Ajouter une ligne")),
      counter
    )
  );
}

// --- Fiche mémo (calculée à partir d'une grille) ------------------------------
function memoField(f, env) {
  const { data, stage, refreshers } = env;
  const src = stage.activity.sections.flatMap((s) => s.fields).find((x) => x.id === f.source);
  const box = h("div", { class: "memo" });
  const render = () => {
    clear(box);
    const val = data[f.source] || {};
    box.append(h("div", { class: "table-wrap" }, h("table", { class: "table table-memo" },
      h("thead", {}, h("tr", {}, h("th", {}, "Salarié"), src.columns.filter((c) => c.id !== "justif").map((c) => h("th", {}, c.label)))),
      h("tbody", {}, src.rows.map((r) => h("tr", {}, h("th", { scope: "row" }, r.label.replace(/,.*$/, "")),
        src.columns.filter((c) => c.id !== "justif").map((c) => {
          const v = val[r.id]?.[c.id];
          return h("td", {}, isFilled(v) ? (Array.isArray(v) ? v.join(" · ") : v) : h("span", { class: "empty" }, "—"));
        })
      )))
    )));
  };
  render();
  refreshers.push(render);
  return box;
}

// --- CODIR : arbitrage budgétaire -------------------------------------------
const DECISIONS = ["Retenir", "Réduire", "Reporter", "Financer autrement"];
const ALT_FIN = ["CPF + abondement employeur", "OPCO – période de reconversion", "Formation interne / AFEST / tutorat", "OPCO – alternance"];

export function codirImputed(a, d) {
  if (!d || !d.decision) return 0;
  if (d.decision === "Retenir") return a.cost;
  if (d.decision === "Reporter") return 0;
  const n = parseNum(d.cout);
  return Number.isNaN(n) ? 0 : n;
}

export function codirSummary(val = {}) {
  const total = CATALOG.reduce((s, a) => s + codirImputed(a, val[a.id]), 0);
  const warnings = [];
  CATALOG.filter((a) => a.mandatory).forEach((a) => {
    const d = val[a.id]?.decision;
    if (d && d !== "Retenir") warnings.push(`« ${a.action} » est une formation obligatoire : elle doit être retenue en totalité.`);
  });
  if (total > BUDGET) warnings.push(`Budget dépassé de ${fmtEur(total - BUDGET)}.`);
  const undecided = CATALOG.filter((a) => !val[a.id]?.decision).length;
  return { total, warnings, undecided };
}

function budgetBar(total, label) {
  const pct = Math.min(100, (total / BUDGET) * 100);
  const over = total > BUDGET;
  return h("div", { class: "budget" },
    h("div", { class: "budget-line" },
      h("strong", {}, label || "Imputé au budget"),
      h("span", { class: over ? "danger-text" : "" }, `${fmtEur(total)} / ${fmtEur(BUDGET)}`),
      h("span", { class: "muted" }, over ? `dépassement ${fmtEur(total - BUDGET)}` : `reste ${fmtEur(BUDGET - total)}`)
    ),
    h("div", { class: "bar" }, h("div", { class: "bar-fill" + (over ? " over" : ""), style: { width: pct + "%" } }))
  );
}

function codirField(f, env) {
  const { data, editable, changed, refreshers } = env;
  if (!data[f.id] || typeof data[f.id] !== "object") data[f.id] = {};
  const val = data[f.id];
  const summaryBox = h("div", { class: "codir-summary" });
  const renderSummary = () => {
    clear(summaryBox);
    const s = codirSummary(val);
    summaryBox.append(budgetBar(s.total));
    if (s.undecided) summaryBox.append(h("div", { class: "muted small" }, `${s.undecided} action(s) sans décision.`));
    s.warnings.forEach((w) => summaryBox.append(h("div", { class: "banner banner-warn" }, w)));
    if (!s.warnings.length && !s.undecided) summaryBox.append(h("div", { class: "banner banner-ok" }, "Arbitrage complet et dans le budget."));
  };

  if (!editable) {
    renderSummary();
    return h("div", {},
      h("div", { class: "table-wrap" }, h("table", { class: "table table-ro" },
        h("thead", {}, h("tr", {}, ["Action", "Catalogue", "Décision", "Financement", "Imputé", "Justification"].map((x) => h("th", {}, x)))),
        h("tbody", {}, CATALOG.map((a) => {
          const d = val[a.id] || {};
          return h("tr", {},
            h("td", {}, a.action, a.mandatory ? h("span", { class: "tag-oblig" }, "obligatoire") : null, h("div", { class: "hint" }, a.public)),
            h("td", { class: "num" }, fmtEur(a.cost)),
            h("td", {}, d.decision || h("span", { class: "empty" }, "—")),
            h("td", {}, d.decision === "Financer autrement" ? d.financement || "—" : d.decision ? "Fonds propres" : "—"),
            h("td", { class: "num" }, fmtEur(codirImputed(a, d))),
            h("td", {}, d.note || "")
          );
        }))
      )),
      summaryBox
    );
  }

  const rows = CATALOG.map((a) => {
    const d = (val[a.id] = val[a.id] || {});
    const extra = h("div", { class: "codir-extra" });
    const renderExtra = () => {
      clear(extra);
      if (d.decision === "Réduire" || d.decision === "Financer autrement") {
        if (d.cout === undefined || d.cout === "") d.cout = d.decision === "Réduire" ? Math.round(a.cost / 2) : 0;
        extra.append(h("div", { class: "field" }, h("label", { class: "field-label" }, "Montant imputé au budget"),
          control({ type: "number", unit: "€" }, d.cout, (v) => { d.cout = v; changed(f.id); })));
      }
      if (d.decision === "Financer autrement") {
        extra.append(h("div", { class: "field" }, h("label", { class: "field-label" }, "Autre financement"),
          control({ type: "select", options: ALT_FIN }, d.financement, (v) => { d.financement = v; changed(f.id); })));
      }
    };
    const segs = DECISIONS.map((dec) => {
      const b = h("button", { type: "button", class: "seg-btn" + (d.decision === dec ? " on" : "") }, dec);
      b.onclick = () => {
        d.decision = dec;
        if (dec === "Retenir" || dec === "Reporter") delete d.cout;
        if (dec !== "Financer autrement") delete d.financement;
        segs.forEach((x) => x.classList.toggle("on", x === b));
        renderExtra();
        changed(f.id);
      };
      return b;
    });
    renderExtra();
    return h("div", { class: "codir-row" + (a.mandatory ? " is-mandatory" : "") },
      h("div", { class: "codir-head" },
        h("div", {}, h("strong", {}, a.action), a.mandatory ? h("span", { class: "tag-oblig" }, "obligatoire") : null, h("div", { class: "hint" }, a.public)),
        h("div", { class: "codir-cost" }, fmtEur(a.cost))
      ),
      h("div", { class: "seg" }, segs),
      extra,
      h("div", { class: "field" }, control({ type: "text", placeholder: "Justification (lien avec la stratégie, l’obligation…)" }, d.note, (v) => { d.note = v; changed(f.id); }))
    );
  });
  renderSummary();
  refreshers.push(renderSummary);
  return h("div", { class: "codir" }, h("div", { class: "codir-sticky" }, summaryBox), rows);
}

// --- Plan chiffré ------------------------------------------------------------
const MODALITES = ["Présentiel", "Distanciel synchrone", "E-learning", "Blended", "AFEST", "Tutorat", "Coaching"];
const PLAN_FIN = ["Fonds propres", "Fonds propres (formation interne / AFEST)", "CPF + abondement employeur", "OPCO – période de reconversion", "OPCO – alternance"];
const KIRK = ["1 · Réaction", "2 · Apprentissage", "3 · Comportement", "4 · Résultats"];

function orientationOptions(context) {
  const o = context.allData?.[3]?.orientations || {};
  const titles = ["o1", "o2", "o3"].map((k) => (o[k]?.titre || "").trim()).filter(Boolean);
  return titles.length ? [...titles, "Autre"] : [...STRATEGIC_GOALS, "Autre"];
}

export function planRowCalc(r, taux) {
  const eff = parseNum(r.effectif) || 0;
  const hrs = parseNum(r.heures) || 0;
  const cout = parseNum(r.cout) || 0;
  const salaires = eff * hrs * (parseNum(taux) || TAUX_HORAIRE);
  return { salaires, complet: cout + salaires, cout, budget: parseNum(r.budget) || 0 };
}

export function planSummary(plan) {
  const rows = plan?.rows || [];
  const taux = plan?.taux ?? TAUX_HORAIRE;
  let cout = 0, budget = 0, salaires = 0;
  rows.forEach((r) => { const c = planRowCalc(r, taux); cout += c.cout; budget += c.budget; salaires += c.salaires; });
  const txt = rows.map((r) => (r.action || "").toLowerCase()).join(" | ");
  const orients = new Set(rows.map((r) => r.orientation).filter(Boolean));
  const checks = [
    { ok: rows.length > 0 && budget <= BUDGET, label: `Budget respecté (≤ ${fmtEur(BUDGET)})` },
    { ok: /habilitation/.test(txt) && /caces/.test(txt), label: "Formations obligatoires présentes (habilitation électrique, CACES)" },
    { ok: rows.length > 0 && rows.every((r) => r.orientation), label: "Chaque action est rattachée à une orientation" },
    { ok: orients.size >= 3, label: "Les 3 orientations sont couvertes" },
    { ok: rows.length > 0 && rows.every((r) => (r.indicateur || "").trim()), label: "Chaque action a un indicateur mesurable" },
    { ok: rows.length > 0 && rows.every((r) => r.modalite), label: "Chaque action a une modalité" },
  ];
  return { cout, budget, salaires, complet: cout + salaires, effort: (budget / MASSE_SALARIALE) * 100, checks, n: rows.length };
}

function planSummaryEl(plan) {
  const s = planSummary(plan);
  return h("div", { class: "plan-summary" },
    budgetBar(s.budget, "Imputé au budget formation"),
    h("div", { class: "kpis" },
      kpi("Coûts pédagogiques", fmtEur(s.cout)),
      kpi("Salaires des stagiaires", fmtEur(s.salaires)),
      kpi("Coût complet", fmtEur(s.complet)),
      kpi("Effort (budget / masse salariale)", s.effort.toFixed(2).replace(".", ",") + " %")
    ),
    h("ul", { class: "checklist" }, s.checks.map((c) => h("li", { class: c.ok ? "ok" : "ko" }, (c.ok ? "✓ " : "✗ ") + c.label)))
  );
}
function kpi(label, value) {
  return h("div", { class: "kpi" }, h("div", { class: "kpi-value" }, value), h("div", { class: "kpi-label" }, label));
}

export function planTable(plan) {
  const rows = plan?.rows || [];
  const taux = plan?.taux ?? TAUX_HORAIRE;
  return h("div", { class: "table-wrap" }, h("table", { class: "table table-ro table-plan" },
    h("thead", {}, h("tr", {}, ["Orientation", "Action", "Public", "Modalité", "Durée & période", "Coût péda.", "Imputé budget", "Coût complet", "Financement", "Indicateur", "Niveau"].map((x) => h("th", {}, x)))),
    h("tbody", {}, rows.length ? rows.map((r) => {
      const c = planRowCalc(r, taux);
      return h("tr", {},
        h("td", {}, r.orientation || "—"),
        h("td", {}, r.action || "—", r.obligatoire === "Oui" ? h("span", { class: "tag-oblig" }, "obligatoire") : null),
        h("td", {}, [r.public, r.effectif ? `(${r.effectif})` : ""].filter(Boolean).join(" ") || "—"),
        h("td", {}, r.modalite || "—"),
        h("td", {}, [r.heures ? `${r.heures} h` : "", r.periode].filter(Boolean).join(" · ") || "—"),
        h("td", { class: "num" }, fmtEur(c.cout)),
        h("td", { class: "num" }, fmtEur(c.budget)),
        h("td", { class: "num" }, fmtEur(c.complet)),
        h("td", {}, r.financement || "—"),
        h("td", {}, r.indicateur || "—"),
        h("td", {}, r.kirk ? r.kirk.slice(0, 1) : "—")
      );
    }) : h("tr", {}, h("td", { colspan: 11, class: "empty" }, "Aucune action")))
  ));
}

function planField(f, env) {
  const { data, editable, changed, refreshers, context } = env;
  if (!data[f.id] || typeof data[f.id] !== "object") data[f.id] = { taux: TAUX_HORAIRE, rows: [] };
  const plan = data[f.id];
  if (!Array.isArray(plan.rows)) plan.rows = [];
  if (!editable) return h("div", {}, planTable(plan), planSummaryEl(plan));

  const summaryBox = h("div", { class: "codir-sticky" });
  const renderSummary = () => { clear(summaryBox); summaryBox.append(planSummaryEl(plan)); };
  const list = h("div", { class: "plan-rows" });
  const options = orientationOptions(context);

  const cols = [
    { id: "orientation", label: "Orientation", type: "select", options },
    { id: "action", label: "Action", type: "text" },
    { id: "public", label: "Public", type: "text", placeholder: "Ex. : soudeurs" },
    { id: "effectif", label: "Effectif", type: "number" },
    { id: "modalite", label: "Modalité", type: "select", options: MODALITES },
    { id: "heures", label: "Heures / stagiaire", type: "number" },
    { id: "periode", label: "Période", type: "text", placeholder: "Ex. : mars-avril" },
    { id: "obligatoire", label: "Obligatoire ?", type: "select", options: ["Oui", "Non"] },
    { id: "cout", label: "Coût pédagogique", type: "number", unit: "€" },
    { id: "budget", label: "Dont imputé au budget", type: "number", unit: "€" },
    { id: "financement", label: "Financement", type: "select", options: PLAN_FIN },
    { id: "kirk", label: "Niveau d’évaluation visé", type: "select", options: KIRK },
    { id: "indicateur", label: "Indicateur mesurable", type: "text", placeholder: "Ex. : 8 soudeurs autonomes à 3 mois" },
  ];

  const render = () => {
    clear(list);
    plan.rows.forEach((r, i) => {
      const calc = h("div", { class: "plan-calc" });
      const renderCalc = () => {
        const c = planRowCalc(r, plan.taux);
        clear(calc);
        calc.append(`Salaires : ${fmtEur(c.salaires)} · Coût complet : `, h("strong", {}, fmtEur(c.complet)));
      };
      renderCalc();
      list.append(h("div", { class: "rep-row plan-row" },
        h("div", { class: "rep-num" }, i + 1),
        h("div", {},
          h("div", { class: "grid-cols cols-4" }, cols.map((c) =>
            h("div", { class: "field" + (c.id === "action" || c.id === "indicateur" ? " span-2" : "") },
              h("label", { class: "field-label" }, c.label),
              control(c, r[c.id], (v) => { r[c.id] = v; renderCalc(); changed(f.id); })
            )
          )),
          calc
        ),
        h("button", { type: "button", class: "icon-btn rep-del", "aria-label": "Supprimer l’action", title: "Supprimer l’action", onclick: () => { plan.rows.splice(i, 1); changed(f.id); render(); } }, "✕")
      ));
    });
    if (!plan.rows.length) list.append(h("div", { class: "empty-box" }, "Aucune action pour l’instant. Importez vos décisions du CODIR ou ajoutez une action."));
  };

  const importCodir = async () => {
    const s3 = context.allData?.[3] || {};
    const cod = s3.codir || {};
    const orient = s3.orientations || {};
    const kept = CATALOG.filter((a) => cod[a.id]?.decision && cod[a.id].decision !== "Reporter");
    if (!kept.length) { toast("Aucune décision trouvée dans le CODIR de l’étape 3.", "error"); return; }
    if (plan.rows.length && !(await confirmBox("Importer le CODIR", "Les actions importées seront ajoutées à la suite de votre plan actuel.", "Importer"))) return;
    kept.forEach((a) => {
      const d = cod[a.id];
      const o = ["o1", "o2", "o3"].map((k) => orient[k]).find((x) => (x?.actions || []).includes(a.action));
      plan.rows.push({
        orientation: o?.titre || "",
        action: a.action,
        public: a.public.replace(/,.*$/, ""),
        effectif: a.effectif,
        heures: a.heures,
        obligatoire: a.mandatory ? "Oui" : "Non",
        cout: d.decision === "Réduire" ? codirImputed(a, d) : a.cost,
        budget: codirImputed(a, d),
        financement: d.decision === "Financer autrement" ? ({ "CPF + abondement employeur": "CPF + abondement employeur", "OPCO – période de reconversion": "OPCO – période de reconversion", "Formation interne / AFEST / tutorat": "Fonds propres (formation interne / AFEST)", "OPCO – alternance": "OPCO – alternance" }[d.financement] || "") : "Fonds propres",
        modalite: a.id === "afest" ? "AFEST" : "",
        indicateur: "",
        note: d.note || "",
      });
    });
    changed(f.id);
    render();
  };

  render();
  renderSummary();
  refreshers.push(renderSummary);
  const tauxCtl = control({ type: "number", unit: "€ / h" }, plan.taux, (v) => { plan.taux = v; changed(f.id); render(); });
  return h("div", { class: "plan" },
    h("div", { class: "plan-tools" },
      h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: importCodir }, "⇩ Importer mes décisions du CODIR (étape 3)"),
      h("div", { class: "field inline" }, h("label", { class: "field-label" }, "Coût horaire chargé moyen"), tauxCtl)
    ),
    summaryBox,
    list,
    h("div", { class: "rep-foot" }, h("button", { type: "button", class: "btn btn-ghost btn-sm", onclick: () => { plan.rows.push({}); changed(f.id); render(); } }, "+ Ajouter une action"))
  );
}

// -----------------------------------------------------------------------------
//  Taux de complétion de l'activité (0 à 1)
// -----------------------------------------------------------------------------
export function completion(stage, data = {}) {
  const parts = [];
  stage.activity.sections.forEach((sec) => sec.fields.forEach((f) => {
    const v = data[f.id];
    switch (f.type) {
      case "info": case "memo": return;
      case "grid": {
        const total = f.rows.length * f.columns.length;
        let filled = 0;
        f.rows.forEach((r) => f.columns.forEach((c) => isFilled(v?.[r.id]?.[c.id]) && filled++));
        parts.push(filled / total);
        return;
      }
      case "repeater": {
        const rows = Array.isArray(v) ? v : [];
        const full = rows.filter((r) => f.columns.filter((c) => isFilled(r[c.id])).length >= Math.ceil(f.columns.length / 2)).length;
        parts.push(Math.min(1, full / (f.min || 1)));
        return;
      }
      case "codir":
        parts.push(CATALOG.filter((a) => v?.[a.id]?.decision).length / CATALOG.length);
        return;
      case "plan": {
        const rows = v?.rows || [];
        const full = rows.filter((r) => r.action && isFilled(r.cout) && r.orientation && (r.indicateur || "").trim()).length;
        parts.push(Math.min(1, full / 5));
        return;
      }
      default:
        parts.push(isFilled(v) ? 1 : 0);
    }
  }));
  return parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0;
}

// -----------------------------------------------------------------------------
//  Livrable résumé (spectateur / dossier final)
// -----------------------------------------------------------------------------
export function renderDeliverable(n, data = {}, context = {}) {
  const stage = stageByN(n);
  return renderActivity(stage, { data: JSON.parse(JSON.stringify(data || {})), editable: false, context }).el;
}

export { pill };

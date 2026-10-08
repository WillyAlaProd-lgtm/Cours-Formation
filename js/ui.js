// Petits utilitaires d'interface (sans dépendance)

// append() tolérant : ignore null/false et aplatit les tableaux
// (permet d'écrire el.append(cond ? x : null, [a, b]) partout dans le code)
const nativeAppend = Element.prototype.append;
Element.prototype.append = function (...nodes) {
  const list = nodes.flat(Infinity).filter((n) => n != null && n !== false);
  return nativeAppend.apply(this, list);
};

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  let value;
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "html") el.innerHTML = v;
    else if (k === "value") value = v;
    else if (k === "checked" || k === "disabled" || k === "selected" || k === "readOnly") el[k] = !!v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  appendChildren(el, children);
  if (value !== undefined) el.value = value;
  return el;
}

function appendChildren(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Texte du contenu pédagogique : **gras**
export function md(text) {
  const span = document.createElement("span");
  span.innerHTML = esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  return span;
}

export function fmtEur(n) {
  const v = Math.round(Number(n) || 0);
  return v.toLocaleString("fr-FR").replace(/ | /g, " ") + " €";
}

export function fmtDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function timeAgo(d) {
  if (!d) return "—";
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "à l’instant";
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  return fmtDate(d);
}

export function parseNum(v) {
  if (v === null || v === undefined || v === "") return NaN;
  return Number(String(v).replace(/\s| | |€|%/g, "").replace(",", "."));
}

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function debounce(fn, ms) {
  let t;
  const d = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
  d.flush = (...args) => {
    clearTimeout(t);
    fn(...args);
  };
  return d;
}

// --- Toasts ----------------------------------------------------------------
let toastBox;
export function toast(msg, type = "info") {
  if (!toastBox) {
    toastBox = h("div", { class: "toasts", role: "status", "aria-live": "polite" });
    document.body.append(toastBox);
  }
  const t = h("div", { class: `toast toast-${type}` }, msg);
  toastBox.append(t);
  setTimeout(() => t.classList.add("out"), 3500);
  setTimeout(() => t.remove(), 4000);
}

// --- Modale ----------------------------------------------------------------
export function modal({ title, body, actions = [], wide = false, onClose }) {
  const overlay = h("div", { class: "modal-overlay" });
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    onClose && onClose();
  };
  const onKey = (e) => e.key === "Escape" && close();
  document.addEventListener("keydown", onKey);
  const box = h(
    "div",
    { class: "modal" + (wide ? " modal-wide" : ""), role: "dialog", "aria-modal": "true" },
    h("div", { class: "modal-head" }, h("h2", {}, title), h("button", { class: "icon-btn", "aria-label": "Fermer", onclick: close }, "✕")),
    h("div", { class: "modal-body" }, body),
    actions.length
      ? h(
          "div",
          { class: "modal-actions" },
          actions.map((a) =>
            h("button", { class: "btn " + (a.class || ""), onclick: async () => { const r = a.onClick ? await a.onClick() : true; if (r !== false) close(); } }, a.label)
          )
        )
      : null
  );
  overlay.addEventListener("mousedown", (e) => e.target === overlay && close());
  overlay.append(box);
  document.body.append(overlay);
  return { close, box };
}

export function confirmBox(title, text, okLabel = "Confirmer", danger = false) {
  return new Promise((resolve) => {
    let done = false;
    modal({
      title,
      body: h("p", {}, text),
      actions: [
        { label: "Annuler", class: "btn-ghost", onClick: () => { done = true; resolve(false); } },
        { label: okLabel, class: danger ? "btn-danger" : "btn-primary", onClick: () => { done = true; resolve(true); } },
      ],
      onClose: () => !done && resolve(false),
    });
  });
}

// Confirmation renforcée : il faut taper un mot
export function confirmTyped(title, text, word) {
  return new Promise((resolve) => {
    let done = false;
    const input = h("input", { class: "input", placeholder: word, autocomplete: "off" });
    modal({
      title,
      body: h("div", {}, h("p", {}, text), h("p", { class: "muted" }, `Pour confirmer, tapez `, h("strong", {}, word), " :"), input),
      actions: [
        { label: "Annuler", class: "btn-ghost", onClick: () => { done = true; resolve(false); } },
        {
          label: "Confirmer",
          class: "btn-danger",
          onClick: () => {
            if (input.value.trim().toUpperCase() !== word) { toast(`Tapez « ${word} » pour confirmer.`, "error"); return false; }
            done = true;
            resolve(true);
          },
        },
      ],
      onClose: () => !done && resolve(false),
    });
    setTimeout(() => input.focus(), 50);
  });
}

export function pill(text, kind = "") {
  return h("span", { class: `pill ${kind}` }, text);
}

export const STATUS = {
  verrouille: { label: "Verrouillée", kind: "pill-muted", icon: "🔒" },
  en_cours: { label: "En cours", kind: "pill-accent", icon: "✎" },
  soumis: { label: "Soumise au prof", kind: "pill-warn", icon: "⏳" },
  valide: { label: "Validée", kind: "pill-ok", icon: "✓" },
};

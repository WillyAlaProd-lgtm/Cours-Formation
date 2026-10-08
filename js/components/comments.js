import { h, clear, fmtDate, toast } from "../ui.js";

// Fil d'échanges équipe ↔ professeur pour une étape
// me : 'equipe' | 'prof'
export function renderComments({ me, onSend, askName = false, readonly = false }) {
  const list = h("div", { class: "thread" });
  const nameInput = askName
    ? h("input", { class: "input input-name", placeholder: "Votre prénom", maxlength: 40, value: safeGet("mpc-author") || "" })
    : null;
  const text = h("textarea", { class: "input", rows: 2, placeholder: me === "prof" ? "Un conseil, une piste, une question pour l’équipe…" : "Une question pour le professeur ?", maxlength: 2000 });
  const send = h("button", { class: "btn btn-primary" }, "Envoyer");
  send.onclick = async () => {
    const body = text.value.trim();
    if (!body) return;
    if (nameInput) safeSet("mpc-author", nameInput.value.trim());
    send.disabled = true;
    try {
      await onSend(body, nameInput ? nameInput.value.trim() : "");
      text.value = "";
    } catch (e) {
      toast(e.message, "error");
    } finally {
      send.disabled = false;
    }
  };
  text.addEventListener("keydown", (e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send.click(); });
  let lastKey = "";
  const update = (comments) => {
    const key = comments.map((c) => c.id).join(",");
    if (key === lastKey) return;
    lastKey = key;
    clear(list);
    if (!comments.length) list.append(h("div", { class: "empty-box" }, me === "prof" ? "Aucun échange pour cette étape." : "Aucun message. Le professeur peut vous écrire ici, et vous pouvez lui poser vos questions."));
    comments.forEach((c) =>
      list.append(h("div", { class: "msg " + (c.author === "prof" ? "msg-prof" : "msg-team") + (c.author === me ? " msg-me" : "") },
        h("div", { class: "msg-meta" }, c.author === "prof" ? "Professeur" : c.author_name || "Équipe", " · ", fmtDate(c.created_at)),
        h("div", { class: "msg-body" }, c.body)
      ))
    );
    list.scrollTop = list.scrollHeight;
  };
  const el = h("div", { class: "comments" }, list,
    readonly ? null : h("div", { class: "comment-form" }, nameInput, text, h("div", { class: "comment-actions" }, h("span", { class: "muted small" }, "Ctrl + Entrée pour envoyer"), send))
  );
  return { el, update };
}

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

import { h, clear, md, modal, shuffle, parseNum, pill } from "../ui.js";

const TYPE_LABEL = {
  qcm: "Quiz",
  classify: "Classement",
  match: "Association",
  order: "Remise en ordre",
  numeric: "Calculs",
};

function questSize(q) {
  switch (q.type) {
    case "qcm": case "numeric": return q.questions.length;
    case "classify": return q.items.length;
    case "match": return q.pairs.length;
    case "order": return q.items.length;
  }
  return 0;
}

// Liste des quêtes d'une étape
export function renderQuestList(stage, results, { onPlay, readonly = false } = {}) {
  const required = stage.quests.filter((q) => q.required);
  const passedReq = required.filter((q) => results[q.id]?.passed).length;
  return h(
    "div",
    { class: "quests" },
    h("p", { class: "lead" },
      `Les quêtes secondaires débloquent la soumission de l’étape : réussissez les ${required.length} quêtes obligatoires (${passedReq}/${required.length} pour l’instant). `,
      "Les quêtes bonus rapportent des points d’expérience. Vous pouvez rejouer autant que vous voulez : seul le meilleur score compte."),
    h(
      "div",
      { class: "quest-grid" },
      stage.quests.map((q) => {
        const r = results[q.id];
        const max = questSize(q);
        return h(
          "div",
          { class: "quest-card" + (r?.passed ? " is-done" : "") },
          h("div", { class: "quest-top" },
            pill(TYPE_LABEL[q.type], "pill-muted"),
            q.required ? pill("Obligatoire", "pill-accent") : pill("Bonus", "pill-soft"),
            r?.passed ? pill("✓ Réussie", "pill-ok") : null
          ),
          h("h4", {}, q.title),
          h("p", { class: "muted small" }, q.intro),
          h("div", { class: "quest-meta" },
            h("span", {}, `${max} éléments · seuil ${Math.round(q.pass * 100)} %`),
            r ? h("span", {}, `Meilleur score : ${r.best_score}/${r.max_score || max} · ${r.attempts} essai${r.attempts > 1 ? "s" : ""}`) : h("span", {}, "Pas encore tentée")
          ),
          readonly ? null : h("button", { class: "btn " + (r?.passed ? "btn-ghost" : "btn-primary"), onclick: () => onPlay(q) }, r ? "Rejouer" : "Lancer la quête")
        );
      })
    )
  );
}

// Lance une quête dans une fenêtre
export function playQuest(quest, { onResult, demo = false } = {}) {
  const body = h("div", { class: "quest-run" });
  const m = modal({ title: quest.title, body, wide: true });
  const start = () => {
    clear(body);
    body.append(
      demo ? h("div", { class: "banner banner-info" }, "Mode démonstration : le résultat n’est pas enregistré.") : null,
      h("p", { class: "muted" }, quest.intro)
    );
    const game = buildGame(quest);
    body.append(game.el);
    const result = h("div", { class: "quest-result", "aria-live": "polite" });
    const actions = h("div", { class: "quest-actions" });
    const check = h("button", { class: "btn btn-primary" }, "Valider mes réponses");
    check.onclick = async () => {
      if (!game.complete()) {
        result.className = "quest-result banner banner-warn";
        result.textContent = "Répondez à toutes les questions avant de valider.";
        return;
      }
      const { score, max } = game.correct();
      const passed = score / max >= quest.pass - 1e-9;
      game.lock(passed);
      clear(result);
      result.className = "quest-result banner " + (passed ? "banner-ok" : "banner-warn");
      result.append(
        h("strong", {}, passed ? "Quête réussie ! " : "Pas encore… "),
        `Score : ${score}/${max} (${Math.round((score / max) * 100)} %). `,
        passed ? "Les explications sont affichées sous chaque question." : `Il faut ${Math.round(quest.pass * 100)} %. Relisez la fiche révision et retentez : l’ordre change à chaque essai.`
      );
      clear(actions);
      actions.append(
        h("button", { class: "btn btn-ghost", onclick: start }, "Réessayer"),
        h("button", { class: "btn btn-primary", onclick: () => m.close() }, "Fermer")
      );
      if (onResult) {
        try { await onResult(score, max, passed); } catch (e) { result.append(h("div", { class: "error-text" }, "Résultat non enregistré : " + e.message)); }
      }
    };
    actions.append(check);
    body.append(result, actions);
    body.scrollTop = 0;
  };
  start();
}

function buildGame(q) {
  switch (q.type) {
    case "qcm": return gameQcm(q);
    case "classify": return gameClassify(q);
    case "match": return gameMatch(q);
    case "order": return gameOrder(q);
    case "numeric": return gameNumeric(q);
  }
}

function explainEl(text) {
  return text ? h("div", { class: "explain hidden" }, md(text)) : null;
}

function gameQcm(q) {
  const name = "q" + Math.random().toString(36).slice(2);
  const items = shuffle(q.questions.map((qq, i) => ({ ...qq, i })));
  const answers = {};
  const blocks = items.map((qq, k) => {
    const opts = shuffle(qq.options.map((o, oi) => ({ o, oi })));
    const ex = explainEl(qq.explain);
    const el = h(
      "fieldset",
      { class: "qblock" },
      h("legend", {}, `${k + 1}. `, md(qq.q)),
      opts.map(({ o, oi }) =>
        h("label", { class: "choice" },
          h("input", { type: "radio", name: `${name}-${k}`, onchange: () => (answers[k] = oi) }),
          h("span", {}, o)
        )
      ),
      ex
    );
    return { el, qq, k, ex };
  });
  return {
    el: h("div", {}, blocks.map((b) => b.el)),
    complete: () => blocks.every((b) => answers[b.k] !== undefined),
    correct: () => ({ score: blocks.filter((b) => answers[b.k] === b.qq.answer).length, max: blocks.length }),
    lock: (passed) => blocks.forEach((b) => {
      const ok = answers[b.k] === b.qq.answer;
      b.el.classList.add(ok ? "is-ok" : "is-ko");
      b.el.querySelectorAll("input").forEach((i) => (i.disabled = true));
      if (b.ex && (passed || ok)) b.ex.classList.remove("hidden");
    }),
  };
}

function gameClassify(q) {
  const items = shuffle(q.items.map((it, i) => ({ ...it, i })));
  const answers = {};
  const rows = items.map((it) => {
    const btns = q.categories.map((c, ci) => {
      const b = h("button", { type: "button", class: "seg-btn", onclick: () => { answers[it.i] = ci; btns.forEach((x, xi) => x.classList.toggle("on", xi === ci)); } }, c);
      return b;
    });
    const el = h("div", { class: "qrow" }, h("div", { class: "qrow-text" }, md(it.text)), h("div", { class: "seg" }, btns));
    return { el, it, btns };
  });
  return {
    el: h("div", { class: "qrows" }, rows.map((r) => r.el)),
    complete: () => rows.every((r) => answers[r.it.i] !== undefined),
    correct: () => ({ score: rows.filter((r) => answers[r.it.i] === r.it.cat).length, max: rows.length }),
    lock: (passed) => rows.forEach((r) => {
      const ok = answers[r.it.i] === r.it.cat;
      r.el.classList.add(ok ? "is-ok" : "is-ko");
      r.btns.forEach((b) => (b.disabled = true));
      if (passed && !ok) r.el.append(h("div", { class: "explain" }, "Bonne réponse : " + q.categories[r.it.cat]));
    }),
  };
}

function gameMatch(q) {
  const lefts = shuffle(q.pairs.map((p, i) => ({ ...p, i })));
  const rights = shuffle(q.pairs.map((p, i) => ({ text: p.right, i })));
  const answers = {};
  const rows = lefts.map((p) => {
    const sel = h("select", { class: "input", onchange: (e) => (answers[p.i] = e.target.value === "" ? undefined : Number(e.target.value)) },
      h("option", { value: "" }, "— Choisir —"),
      rights.map((r) => h("option", { value: String(r.i) }, r.text))
    );
    const el = h("div", { class: "qrow" }, h("div", { class: "qrow-text" }, h("strong", {}, p.left)), sel);
    return { el, p, sel };
  });
  return {
    el: h("div", { class: "qrows" }, rows.map((r) => r.el)),
    complete: () => rows.every((r) => answers[r.p.i] !== undefined),
    correct: () => ({ score: rows.filter((r) => answers[r.p.i] === r.p.i).length, max: rows.length }),
    lock: (passed) => rows.forEach((r) => {
      const ok = answers[r.p.i] === r.p.i;
      r.el.classList.add(ok ? "is-ok" : "is-ko");
      r.sel.disabled = true;
      if (passed && !ok) r.el.append(h("div", { class: "explain" }, "Bonne réponse : " + r.p.right));
    }),
  };
}

function gameOrder(q) {
  let order = q.items.map((t, i) => i);
  do { order = shuffle(order); } while (order.every((v, i) => v === i) && order.length > 1);
  const list = h("ol", { class: "order-list" });
  let locked = false;
  const render = () => {
    clear(list);
    order.forEach((idx, pos) => {
      list.append(
        h("li", { class: "order-item", "data-pos": pos },
          h("span", { class: "order-text" }, q.items[idx]),
          h("span", { class: "order-btns" },
            h("button", { type: "button", class: "icon-btn", "aria-label": "Monter", disabled: locked || pos === 0, onclick: () => move(pos, -1) }, "↑"),
            h("button", { type: "button", class: "icon-btn", "aria-label": "Descendre", disabled: locked || pos === order.length - 1, onclick: () => move(pos, 1) }, "↓")
          )
        )
      );
    });
  };
  const move = (pos, d) => {
    const n = pos + d;
    [order[pos], order[n]] = [order[n], order[pos]];
    render();
  };
  render();
  const ex = explainEl(q.explain);
  return {
    el: h("div", {}, list, ex),
    complete: () => true,
    correct: () => ({ score: order.filter((v, i) => v === i).length, max: order.length }),
    lock: (passed) => {
      locked = true;
      render();
      [...list.children].forEach((li, i) => li.classList.add(order[i] === i ? "is-ok" : "is-ko"));
      if (passed && ex) ex.classList.remove("hidden");
    },
  };
}

function gameNumeric(q) {
  const items = q.questions.map((qq, i) => ({ ...qq, i }));
  const rows = items.map((qq, k) => {
    const input = h("input", { class: "input input-num", inputmode: "decimal", placeholder: "Votre réponse" });
    const ex = explainEl(qq.explain);
    const el = h("div", { class: "qblock" }, h("div", { class: "qblock-q" }, `${k + 1}. `, md(qq.q)), h("div", { class: "num-line" }, input, h("span", { class: "unit" }, qq.unit || "")), ex);
    return { el, qq, input, ex };
  });
  const ok = (r) => {
    const v = parseNum(r.input.value);
    return !Number.isNaN(v) && Math.abs(v - r.qq.answer) <= (r.qq.tol || 0) + 1e-9;
  };
  return {
    el: h("div", {}, rows.map((r) => r.el)),
    complete: () => rows.every((r) => r.input.value.trim() !== "" && !Number.isNaN(parseNum(r.input.value))),
    correct: () => ({ score: rows.filter(ok).length, max: rows.length }),
    lock: (passed) => rows.forEach((r) => {
      const good = ok(r);
      r.el.classList.add(good ? "is-ok" : "is-ko");
      r.input.disabled = true;
      if (r.ex && (passed || good)) r.ex.classList.remove("hidden");
    }),
  };
}

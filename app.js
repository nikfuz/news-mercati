(() => {
  "use strict";

  const ACCENT = {
    home: "#60A5FA",
    azionario: "#3B82F6",
    tech: "#A78BFA",
    energia: "#FACC15",
    crypto: "#F7931A",
    agenda: "#2DD4BF",
  };
  const TABS = [
    { id: "home", label: "Home" },
    { id: "azionario", label: "Azionario" },
    { id: "tech", label: "Tech" },
    { id: "energia", label: "Energia" },
    { id: "crypto", label: "Crypto" },
    { id: "agenda", label: "Agenda" },
  ];
  const SCREENS = TABS.map((t) => t.id);

  const SVG = {
    home: '<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-7.5z"/>',
    agenda:
      '<rect x="4" y="5.5" width="16" height="14" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 10h16M8 14h3M8 17h6"/>',
    azionario: '<path d="M4 19V11M10 19V6M16 19v-8M21 19H3"/>',
    tech: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M12 4v3M12 17v3M4 12h3M17 12h3"/>',
    energia: '<path d="M13 3 6 13h6l-1 8 7-10h-6l1-8z"/>',
    crypto:
      '<circle cx="12" cy="12" r="8"/><path d="M8 10.5c1.2-1 2.6-1.5 4-1.5 2.2 0 4 1 4 2.4 0 1.5-1.6 2.3-4 2.6-2.2.3-4 1.1-4 2.5 0 1.5 1.9 2.5 4.2 2.5 1.5 0 2.9-.5 4-1.4"/><path d="M12 7v2.2M12 16.8V19"/>',
    back: '<path d="M15 5 8 12l7 7"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    ext: '<path d="M7 17 17 7M9 7h8v8"/>',
    warn: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17.5v.5"/>',
  };

  let REPORT = null;
  let current = "home";

  function el(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === "class") node.className = v;
        else if (k === "style" && typeof v === "object") Object.assign(node.style, v);
        else if (k === "dataset") Object.assign(node.dataset, v);
        else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "text") node.textContent = v;
        else if (k === "html") node.innerHTML = v;
        else if (v === true) node.setAttribute(k, "");
        else node.setAttribute(k, String(v));
      }
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      node.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
    }
    return node;
  }

  function svgIcon(kind, color, size) {
    const inner = SVG[kind] || SVG.crypto;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", color);
    svg.setAttribute("stroke-width", "1.9");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = inner;
    return svg;
  }

  function svgPath(d, fill, size, vb) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", vb || "0 0 10 10");
    svg.setAttribute("aria-hidden", "true");
    const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", fill);
    svg.append(p);
    return svg;
  }

  function iconBadge(kind, size) {
    const accent = ACCENT[kind];
    const wrap = el("div", {
      class: "nm-icon-badge",
      style: {
        width: size + "px",
        height: size + "px",
        background: accent + "1F",
        border: "1px solid " + accent + "40",
      },
    });
    wrap.append(svgIcon(kind, accent, Math.round(size * 0.5)));
    return wrap;
  }

  function changeChip(pct, label, small) {
    const up = pct > 0;
    const down = pct < 0;
    const color = up ? "#4ADE80" : down ? "#FB7185" : "#94A3B8";
    const cls = "nm-chip" + (small ? " sm" : "") + (up ? " up" : down ? " down" : " flat");
    const chip = el("span", { class: cls });
    if (up) chip.append(svgPath("M5 1 9.5 8.5h-9z", color, 9));
    else if (down) chip.append(svgPath("M5 9 .5 1.5h9z", color, 9));
    else {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "9");
      svg.setAttribute("height", "9");
      svg.setAttribute("viewBox", "0 0 10 10");
      svg.setAttribute("aria-hidden", "true");
      const r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      r.setAttribute("x", "1");
      r.setAttribute("y", "4");
      r.setAttribute("width", "8");
      r.setAttribute("height", "2");
      r.setAttribute("fill", color);
      svg.append(r);
      chip.append(svg);
    }
    chip.append(document.createTextNode(label));
    return chip;
  }

  function card(children, opts) {
    const optsSafe = opts || {};
    const node = el("div", { class: "nm-card" + (optsSafe.pad === 14 ? " nm-card-pad-14" : "") });
    if (optsSafe.accent) {
      node.append(el("div", { class: "nm-card-accent", "aria-hidden": "true", style: { background: "linear-gradient(90deg, " + optsSafe.accent + ", " + optsSafe.accent + "00)" } }));
    }
    node.append(...[].concat(children));
    return node;
  }

  function sectionTitle(title, caption) {
    const wrap = el("div", { class: "nm-section-title" }, el("p", { class: "nm-overline", text: title }));
    if (caption) wrap.append(el("p", { class: "nm-meta", text: caption }));
    return wrap;
  }

  function findKpi(label) {
    return (REPORT.kpis || []).find((k) => k.label === label);
  }

  function pickFrom(source, labels) {
    const list = REPORT[source] || [];
    if (!labels || !labels.length) return list;
    return labels.map((l) => list.find((x) => x.label === l)).filter(Boolean);
  }

  function screenHeader(screen, title, lead) {
    const accent = ACCENT[screen];
    const back = el(
      "button",
      { type: "button", class: "nm-back nm-press", "aria-label": "Indietro", onclick: () => go("home") }
    );
    const chev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chev.setAttribute("width", "18");
    chev.setAttribute("height", "18");
    chev.setAttribute("viewBox", "0 0 24 24");
    chev.setAttribute("fill", "none");
    chev.setAttribute("stroke", "#E8EDF5");
    chev.setAttribute("stroke-width", "2.2");
    chev.setAttribute("stroke-linecap", "round");
    chev.setAttribute("stroke-linejoin", "round");
    chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = SVG.back;
    back.append(chev, document.createTextNode("Indietro"));

    return el(
      "div",
      { class: "nm-header" },
      el("div", { class: "nm-header-row" }, back, el("p", { class: "nm-meta", text: REPORT.dateLabel })),
      el(
        "div",
        { class: "nm-header-title" },
        iconBadge(screen, 48),
        el(
          "div",
          { style: { minWidth: 0 } },
          el("p", { class: "nm-overline", style: { color: accent }, text: "Settore" }),
          el("h2", { class: "nm-h1", text: title })
        )
      ),
      el("p", { class: "nm-small", text: lead })
    );
  }

  function kpiCard(kpi, accent) {
    return card(
      el(
        "div",
        { class: "nm-kpi" },
        el("p", { class: "nm-overline", text: kpi.label }),
        el("p", { class: "nm-bignum", text: kpi.value }),
        el("div", {}, changeChip(kpi.changePct, kpi.changeLabel)),
        el("p", { class: "nm-meta", text: kpi.detail })
      ),
      { accent, pad: 14 }
    );
  }

  function barChart(chart, accent) {
    const bars = pickFrom(chart.source, chart.labels);
    const level = chart.kind === "level";
    const maxPos = Math.max(0, ...bars.map((b) => b.value));
    const maxNeg = Math.max(0, ...bars.map((b) => -b.value));
    const span = maxPos + maxNeg || 1;
    const zero = (maxNeg / span) * 100;
    const wrap = el("div", { class: "nm-bars" });
    bars.forEach((b, i) => {
      const w = (Math.abs(b.value) / span) * 100;
      const left = b.value >= 0 ? zero : zero - w;
      const emph = typeof chart.emphasis === "number" ? chart.emphasis === i : false;
      const color = level
        ? emph || chart.emphasis === "none"
          ? accent
          : accent + "66"
        : b.value > 0
          ? "#22C55E"
          : b.value < 0
            ? "#F43F5E"
            : "#94A3B8";
      const valueColor = level ? "#E8EDF5" : b.value > 0 ? "#4ADE80" : b.value < 0 ? "#FB7185" : "#94A3B8";
      const track = el("div", { class: "nm-bar-track" });
      if (maxNeg > 0 && maxPos > 0) {
        track.append(el("div", { class: "nm-bar-zero", "aria-hidden": "true", style: { left: zero + "%" } }));
      }
      const fill = el("div", {
        class: "nm-bar nm-bar-fill",
        style: {
          left: left + "%",
          width: Math.max(w, 1.5) + "%",
          background: color,
          transformOrigin: b.value >= 0 ? "left center" : "right center",
          animationDelay: i * 40 + "ms",
          boxShadow: "0 0 12px " + color + "55",
        },
      });
      track.append(fill);
      wrap.append(
        el(
          "div",
          { class: "nm-bar-row" },
          el(
            "div",
            { class: "nm-bar-label" },
            el("span", { class: "nm-small", style: { color: emph ? "#E8EDF5" : "#A3AFC2", fontWeight: emph ? "650" : "500" }, text: b.label }),
            el("span", { class: "nm-small nm-num", style: { color: valueColor, fontWeight: "650" }, text: b.display })
          ),
          track
        )
      );
    });
    return wrap;
  }

  function chartCard(chart, accent) {
    const inner = el(
      "div",
      { class: "nm-chart" },
      el(
        "div",
        { class: "nm-cluster-6" },
        el("h3", { class: "nm-h3", text: chart.heading }),
        el("p", { class: "nm-meta", text: chart.caption })
      ),
      barChart(chart, accent)
    );
    if (chart.note) {
      inner.append(el("p", { class: "nm-small nm-chart-note", text: chart.note }));
    }
    return card(inner);
  }

  function safeHref(href) {
    try {
      const u = new URL(href, location.href);
      if (u.protocol === "https:" || u.protocol === "http:") return u.href;
    } catch (_) {}
    return null;
  }

  function newsCard(item, accent) {
    const sources = el("div", { class: "nm-sources" }, el("p", { class: "nm-overline", text: "Fonti" }));
    (item.sources || []).forEach((s) => {
      const href = safeHref(s.href);
      if (!href) return;
      const a = el("a", {
        class: "nm-link nm-source",
        href,
        target: "_blank",
        rel: "noopener noreferrer",
      });
      const text = el("span", { class: "nm-source-text" }, el("span", { class: "nm-small", style: { color: "#E8EDF5", fontWeight: "550" }, text: s.title }));
      if (s.site) text.append(el("span", { class: "nm-meta", text: s.site }));
      const ext = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      ext.setAttribute("width", "16");
      ext.setAttribute("height", "16");
      ext.setAttribute("viewBox", "0 0 24 24");
      ext.setAttribute("fill", "none");
      ext.setAttribute("stroke", "#A3AFC2");
      ext.setAttribute("stroke-width", "2");
      ext.setAttribute("stroke-linecap", "round");
      ext.setAttribute("stroke-linejoin", "round");
      ext.setAttribute("aria-hidden", "true");
      ext.style.flex = "0 0 auto";
      ext.innerHTML = SVG.ext;
      a.append(text, ext);
      sources.append(a);
    });
    const why = el(
      "div",
      { class: "nm-why", style: { borderLeftColor: accent, background: accent + "12" } },
      el("p", { class: "nm-overline", style: { color: accent, marginBottom: "4px" }, text: "Perché conta" }),
      el("p", { class: "nm-small", style: { color: "#C9D2E0" }, text: item.why })
    );
    return card(
      el(
        "div",
        { class: "nm-cluster" },
        el("h3", { class: "nm-h3", style: { fontSize: "17px", lineHeight: "23px" }, text: item.title }),
        el("p", { class: "nm-body", text: item.summary }),
        why,
        sources
      )
    );
  }

  function rumorBlock(rumors) {
    const wrap = el("div", { class: "nm-cluster-10" }, sectionTitle("Rumors e da verificare"));
    const warnIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    warnIcon.setAttribute("width", "20");
    warnIcon.setAttribute("height", "20");
    warnIcon.setAttribute("viewBox", "0 0 24 24");
    warnIcon.setAttribute("fill", "none");
    warnIcon.setAttribute("stroke", "#FBBF24");
    warnIcon.setAttribute("stroke-width", "2");
    warnIcon.setAttribute("stroke-linecap", "round");
    warnIcon.setAttribute("stroke-linejoin", "round");
    warnIcon.setAttribute("aria-hidden", "true");
    warnIcon.style.flex = "0 0 auto";
    warnIcon.style.marginTop = "1px";
    warnIcon.innerHTML = SVG.warn;
    const bannerText = el("p", {});
    const strong = el("span", { style: { fontWeight: "700", color: "#FBBF24" }, text: "Non confermato. " });
    bannerText.append(strong, document.createTextNode("Queste voci e opinioni non sono fatti verificati allo stesso modo dei numeri di chiusura. Restano da riscontrare su fonti primarie prima di qualsiasi decisione."));
    wrap.append(el("div", { class: "nm-rumor-banner" }, warnIcon, bannerText));
    rumors.forEach((r) => {
      wrap.append(
        card(
          el(
            "div",
            { class: "nm-cluster-8" },
            el(
              "div",
              { class: "nm-row-between" },
              el("h3", { class: "nm-h3", text: r.title }),
              el("span", { class: "nm-badge-warn", text: "Non confermato" })
            ),
            el("p", { class: "nm-small", text: r.detail })
          ),
          { pad: 14 }
        )
      );
    });
    return wrap;
  }

  function sectorTile(tile) {
    const kpi = findKpi(tile.kpiLabel);
    if (!kpi) return null;
    const accent = ACCENT[tile.screen];
    const btn = el("button", {
      type: "button",
      class: "nm-tile nm-press",
      "aria-label": tile.title + ", " + kpi.label + " " + kpi.changeLabel,
      style: {
        background:
          "linear-gradient(135deg, " + accent + "14 0%, rgba(14,21,36,0) 55%), linear-gradient(180deg, #151F33 0%, #0F1727 100%)",
      },
      onclick: () => go(tile.screen),
    });
    const chev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chev.setAttribute("width", "16");
    chev.setAttribute("height", "16");
    chev.setAttribute("viewBox", "0 0 24 24");
    chev.setAttribute("fill", "none");
    chev.setAttribute("stroke", "#6E7A8E");
    chev.setAttribute("stroke-width", "2.2");
    chev.setAttribute("stroke-linecap", "round");
    chev.setAttribute("stroke-linejoin", "round");
    chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = SVG.chevron;
    btn.append(
      iconBadge(tile.screen, 44),
      el(
        "div",
        { class: "nm-tile-body" },
        el("span", { class: "nm-h3", style: { fontSize: "17px" }, text: tile.title }),
        el("span", { class: "nm-meta" }, kpi.label + " · ", el("span", { class: "nm-num", style: { color: "#A3AFC2" }, text: kpi.value }))
      ),
      el("div", { class: "nm-tile-end" }, changeChip(kpi.changePct, kpi.changeLabel), chev)
    );
    return btn;
  }

  function renderHome() {
    const pills = [
      { k: "Data del report", v: REPORT.dateLabel },
      { k: "Aggiornato alle", v: REPORT.updatedAt + " " + REPORT.timezone },
      { k: "Destinatario", v: REPORT.audience },
    ].map((r) =>
      el(
        "span",
        { class: "nm-meta-pill" },
        el("span", { class: "nm-overline", text: r.k }),
        el("span", { class: "nm-small nm-num", style: { color: "#E8EDF5" }, text: r.v })
      )
    );

    const headlines = el("div", { class: "nm-cluster" }, el("p", { class: "nm-overline", style: { color: ACCENT.home }, text: "Le tre notizie della giornata" }));
    (REPORT.headlines || []).forEach((h, i) => {
      headlines.append(
        el(
          "div",
          { class: "nm-headline" },
          el("span", { class: "nm-headline-n nm-num", text: String(i + 1) }),
          el("p", { class: "nm-body", text: h })
        )
      );
    });

    const root = el(
      "div",
      { class: "nm-stagger" },
      el(
        "div",
        { class: "nm-cluster-6", style: { padding: "4px 2px" } },
        el("p", { class: "nm-overline", style: { color: ACCENT.home }, text: "News Mercati Globali" }),
        el("h2", { class: "nm-h1", text: "Oggi" }),
        el("div", { class: "nm-meta-row" }, ...pills)
      ),
      card(headlines, { accent: ACCENT.home }),
      sectionTitle("Settori", "Tocca una scheda per aprire KPI, grafici e notizie di quel mercato.")
    );

    (REPORT.homeTiles || []).forEach((tile) => {
      const t = sectorTile(tile);
      if (t) root.append(t);
    });

    const agendaBtn = el("button", {
      type: "button",
      class: "nm-agenda-entry nm-press",
      onclick: () => go("agenda"),
    });
    const chev = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chev.setAttribute("width", "16");
    chev.setAttribute("height", "16");
    chev.setAttribute("viewBox", "0 0 24 24");
    chev.setAttribute("fill", "none");
    chev.setAttribute("stroke", "#6E7A8E");
    chev.setAttribute("stroke-width", "2.2");
    chev.setAttribute("stroke-linecap", "round");
    chev.setAttribute("stroke-linejoin", "round");
    chev.setAttribute("aria-hidden", "true");
    chev.innerHTML = SVG.chevron;
    agendaBtn.append(
      iconBadge("agenda", 40),
      el(
        "span",
        { style: { flex: "1 1 auto", display: "flex", flexDirection: "column" } },
        el("span", { class: "nm-h3", text: "Da seguire" }),
        el("span", { class: "nm-meta", text: (REPORT.agenda || []).length + " appuntamenti in agenda" })
      ),
      chev
    );
    root.append(agendaBtn);
    return root;
  }

  function renderSector(sector) {
    const config = (REPORT.sectors || {})[sector];
    if (!config) return el("p", { class: "nm-error", text: "Settore non trovato nel report di oggi." });
    const accent = ACCENT[sector];
    const kpis = (config.kpiLabels || []).map(findKpi).filter(Boolean);
    const news = (REPORT.news || []).filter((item) => (item.sectors || []).includes(sector));
    const rumors = (REPORT.rumors || []).filter((item) => (item.sectors || []).includes(sector));
    const root = el("div", { class: "nm-stagger" }, screenHeader(sector, config.title, config.lead));
    const grid = el("div", { class: "nm-kpi-grid" });
    kpis.forEach((kpi) => grid.append(kpiCard(kpi, accent)));
    root.append(grid);
    (config.charts || []).forEach((chart) => root.append(chartCard(chart, accent)));
    root.append(sectionTitle("Notizie", "Solo fatti già verificati nel report di oggi, con fonte."));
    news.forEach((item) => root.append(newsCard(item, accent)));
    if (rumors.length) root.append(rumorBlock(rumors));
    return root;
  }

  function renderAgenda() {
    const root = el(
      "div",
      { class: "nm-stagger" },
      screenHeader(
        "agenda",
        "Da seguire",
        "Eventi in calendario nella settimana e nei giorni subito successivi, come riportati nel report."
      )
    );
    const timeline = el("div", { class: "nm-timeline" }, el("div", { class: "nm-timeline-line", "aria-hidden": "true" }));
    (REPORT.agenda || []).forEach((item) => {
      const parts = (item.title || "").split(" — ");
      const when = parts[0] || item.title;
      const rest = parts.slice(1).join(" — ");
      const cardInner = el("div", { class: "nm-cluster-6" }, el("p", { class: "nm-overline", style: { color: ACCENT.agenda }, text: when }));
      if (rest) cardInner.append(el("h3", { class: "nm-h3", text: rest }));
      cardInner.append(el("p", { class: "nm-small", text: item.detail }));
      timeline.append(
        el("div", { class: "nm-timeline-item" }, el("div", { class: "nm-timeline-dot", "aria-hidden": "true" }), card(cardInner, { pad: 14 }))
      );
    });
    root.append(timeline);
    return root;
  }

  function renderTabs(screen) {
    const wrap = document.getElementById("tabbar-wrap");
    wrap.hidden = false;
    wrap.replaceChildren();
    const bar = el("div", { class: "nm-tabbar", role: "tablist" });
    TABS.forEach((tab) => {
      const active = tab.id === screen;
      const accent = ACCENT[tab.id];
      const btn = el("button", {
        type: "button",
        class: "nm-tab" + (active ? " is-active" : ""),
        role: "tab",
        "aria-selected": active ? "true" : "false",
        "aria-label": tab.label,
        style: { background: active ? accent + "22" : "transparent" },
        onclick: () => go(tab.id),
      });
      btn.append(svgIcon(tab.id, active ? accent : "#6E7A8E", 20), el("span", { text: tab.label }));
      bar.append(btn);
    });
    wrap.append(bar);
  }

  function parseHash() {
    const raw = (location.hash || "").replace(/^#\/?/, "").replace(/\/$/, "");
    const id = raw || "home";
    return SCREENS.includes(id) ? id : "home";
  }

  function go(screen) {
    const next = SCREENS.includes(screen) ? screen : "home";
    const hash = next === "home" ? "#/" : "#/" + next;
    if ((location.hash || "#/") === hash || (next === "home" && !location.hash)) {
      current = next;
      paint();
      return;
    }
    location.hash = hash;
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function paint() {
    const mount = document.getElementById("screen");
    let view;
    if (current === "home") view = renderHome();
    else if (current === "agenda") view = renderAgenda();
    else view = renderSector(current);
    const fresh = el("div", { id: "screen", class: "nm-screen", role: "main" });
    fresh.append(view);
    mount.replaceWith(fresh);
    renderTabs(current);
    if (REPORT.pageTitle) document.title = REPORT.pageTitle;
    window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
  }

  function onHash() {
    current = parseHash();
    if (REPORT) paint();
  }

  async function init() {
    try {
      const res = await fetch("./data.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      REPORT = await res.json();
    } catch (err) {
      const mount = document.getElementById("screen");
      mount.replaceChildren(
        el("p", { class: "nm-error", text: "Non riesco a caricare il report (data.json). Controlla la connessione e riprova." })
      );
      console.error(err);
      return;
    }
    current = parseHash();
    if (!location.hash) history.replaceState(null, "", "#/");
    paint();
    window.addEventListener("hashchange", onHash);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();

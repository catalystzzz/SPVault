import { QuartzComponentProps } from "./types"

/**
 * Option A ("Confronto in basso a destra"): session-only side-by-side note
 * comparison on desktop (>= 1000px) using sessionStorage with zero tracking.
 * Keeps note headers 100% clean by docking controls in a fixed bottom-right pill.
 */
export default function ComparePanel(_props: QuartzComponentProps) {
  return (
    <>
      <button
        type="button"
        id="sp-compare-menu-btn"
        class="sp-compare-menu-btn"
        aria-label="Apri menu laterale"
        title="Apri menu di navigazione"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div id="sp-compare-sidebar-backdrop" class="sp-compare-sidebar-backdrop"></div>

      <aside id="sp-compare-pane" class="sp-compare-pane" aria-label="Nota a confronto">
        <div class="sp-compare-pane-header">
          <div class="sp-compare-pane-heading">
            <span class="sp-compare-eyebrow">Confronto</span>
            <a id="sp-compare-pane-title" class="sp-compare-pane-title" href="#">
              Nota fissata
            </a>
          </div>
          <div class="sp-compare-pane-actions">
            <button
              type="button"
              id="sp-compare-hide-btn"
              class="sp-compare-icon-btn"
              title="Riduci a icona (mantiene la nota fissata)"
            >
              Nascondi
            </button>
            <button
              type="button"
              id="sp-compare-clear-btn"
              class="sp-compare-icon-btn is-danger"
              aria-label="Rimuovi confronto"
              title="Chiudi e rimuovi nota fissata"
            >
              ×
            </button>
          </div>
        </div>
        <div id="sp-compare-pane-body" class="sp-compare-pane-body"></div>
      </aside>

      <div id="sp-compare-dock" class="sp-compare-dock" aria-live="polite"></div>

      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  const PIN_KEY = "sp_compare_pin_v1";
  const OPEN_KEY = "sp_compare_open_v1";
  const MIN_WIDTH = 1000;
  let loadedUrl = null;

  function normPath(urlStr) {
    try {
      const u = new URL(urlStr, window.location.origin);
      return u.pathname.replace(/\\.html$/i, "").replace(/\\/+$/, "") || "/";
    } catch {
      return "";
    }
  }

  function getPin() {
    try {
      const raw = sessionStorage.getItem(PIN_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed.url && parsed.title ? parsed : null;
    } catch {
      return null;
    }
  }

  function setPin(pin) {
    try {
      if (pin) {
        sessionStorage.setItem(PIN_KEY, JSON.stringify(pin));
      } else {
        sessionStorage.removeItem(PIN_KEY);
        sessionStorage.removeItem(OPEN_KEY);
      }
    } catch {}
  }

  function isSplitWanted() {
    try {
      return sessionStorage.getItem(OPEN_KEY) === "1";
    } catch {
      return false;
    }
  }

  function setSplitWanted(val) {
    try {
      sessionStorage.setItem(OPEN_KEY, val ? "1" : "0");
    } catch {}
  }

  function isDesktop() {
    return window.innerWidth >= MIN_WIDTH;
  }

  function isEligibleNote() {
    const slug = document.body?.dataset?.slug || "";
    if (!slug || slug === "index" || slug.endsWith("/index") || slug.startsWith("tags/") || slug === "note-recenti") {
      return false;
    }
    return Boolean(document.querySelector(".center article[data-quartz-component='ContentPage']"));
  }

  function getCurrentTitle() {
    const h1 = document.querySelector(".center h1.article-title");
    return (h1?.textContent || document.title || "Nota").trim();
  }

  function resolveUrlAttrs(root, baseUrl) {
    const elems = root.querySelectorAll("[href], [src], [poster]");
    for (const el of elems) {
      for (const attr of ["href", "src", "poster"]) {
        const val = el.getAttribute(attr);
        if (!val) continue;
        const trimmed = val.trim();
        if (
          trimmed.startsWith("#") ||
          trimmed.startsWith("data:") ||
          trimmed.startsWith("mailto:") ||
          trimmed.startsWith("javascript:")
        ) {
          continue;
        }
        try {
          el.setAttribute(attr, new URL(trimmed, baseUrl).href);
        } catch {}
      }
    }
  }

  function syncPaneTheme() {
    const body = document.getElementById("sp-compare-pane-body");
    if (!body) return;
    const isDark = document.documentElement.getAttribute("saved-theme") === "dark";
    const tweets = body.querySelectorAll("blockquote.twitter-tweet");
    for (const t of tweets) {
      t.setAttribute("data-theme", isDark ? "dark" : "light");
    }
  }

  function loadTwitterInPane(container) {
    const tweets = container.querySelectorAll("blockquote.twitter-tweet");
    if (!tweets.length) return;
    syncPaneTheme();
    if (window.twttr && window.twttr.widgets) {
      window.twttr.widgets.load(container);
      return;
    }
    if (!document.getElementById("sp-twitter-widgets-js")) {
      const s = document.createElement("script");
      s.id = "sp-twitter-widgets-js";
      s.async = true;
      s.src = "https://platform.twitter.com/widgets.js";
      s.charset = "utf-8";
      s.onload = function() {
        if (window.twttr && window.twttr.widgets) {
          window.twttr.widgets.load(container);
        }
      };
      document.body.appendChild(s);
    }
  }

  async function loadPinnedIntoPane(pin) {
    const paneBody = document.getElementById("sp-compare-pane-body");
    const titleEl = document.getElementById("sp-compare-pane-title");
    if (!paneBody || !titleEl) return;

    titleEl.textContent = pin.title;
    titleEl.href = pin.url;
    titleEl.title = "Apri " + pin.title + " a schermo intero";

    if (loadedUrl === pin.url && paneBody.dataset.loaded === "1") {
      return;
    }

    loadedUrl = pin.url;
    paneBody.dataset.loaded = "0";
    paneBody.innerHTML = '<div class="sp-compare-loading">Caricamento nota...</div>';

    try {
      const res = await fetch(pin.url, { credentials: "same-origin" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const html = await res.text();
      if (loadedUrl !== pin.url) return;

      const doc = new DOMParser().parseFromString(html, "text/html");
      const center = doc.querySelector(".center");
      if (!center) throw new Error("Contenuto non trovato");

      const wrapper = document.createElement("div");
      wrapper.className = "sp-compare-fragment";

      const bc = center.querySelector(".breadcrumb-container");
      if (bc) {
        const crumbs = Array.from(bc.querySelectorAll(".breadcrumb-element a"))
          .map((a) => (a.textContent || "").trim())
          .filter(Boolean);
        if (crumbs.length > 1) {
          const trail = document.createElement("div");
          trail.className = "sp-compare-crumbs";
          trail.textContent = crumbs.slice(0, -1).join(" › ");
          wrapper.appendChild(trail);
        }
      }

      const fetchedH1 = center.querySelector("h1.article-title");
      if (fetchedH1) {
        const clonedH1 = fetchedH1.cloneNode(true);
        wrapper.appendChild(clonedH1);
        titleEl.textContent = (fetchedH1.textContent || pin.title).trim();
      }

      const props = center.querySelector(".page-header .properties, .page-header .note-properties");
      if (props) {
        wrapper.appendChild(props.cloneNode(true));
      }

      const banner = center.querySelector(".sp-char-banner");
      if (banner) {
        wrapper.appendChild(banner.cloneNode(true));
      }

      const article = center.querySelector('article[data-quartz-component="ContentPage"]');
      if (article) {
        wrapper.appendChild(article.cloneNode(true));
      }

      resolveUrlAttrs(wrapper, pin.url);
      paneBody.innerHTML = "";
      paneBody.appendChild(wrapper);
      paneBody.dataset.loaded = "1";
      loadTwitterInPane(paneBody);
    } catch {
      if (loadedUrl !== pin.url) return;
      paneBody.innerHTML = \`
        <div class="sp-compare-error">
          Impossibile caricare l'anteprima affiancata.
          <a href="\${pin.url}">Apri la nota direttamente</a>
        </div>
      \`;
    }
  }

  function pinCurrentNote() {
    setPin({
      url: window.location.href.split("#")[0],
      title: getCurrentTitle(),
    });
    setSplitWanted(false);
    loadedUrl = null;
    syncCompareUI();
  }

  function renderDock() {
    const dock = document.getElementById("sp-compare-dock");
    if (!dock) return;

    const pin = getPin();
    const eligible = isEligibleNote();
    const isSelf = Boolean(pin && normPath(pin.url) === normPath(window.location.href));
    const splitActive = Boolean(pin && !isSelf && isDesktop() && isSplitWanted());

    if (!isDesktop() || splitActive || (!pin && !eligible)) {
      dock.classList.remove("visible", "is-idle");
      dock.innerHTML = "";
      return;
    }

    dock.innerHTML = "";

    // Stato 1: nessuna nota fissata -> pulsante compatto "Fissa per confronto"
    if (!pin) {
      dock.classList.add("visible", "is-idle");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sp-compare-dock-trigger";
      btn.title = "Salva questa nota per confrontarla con un'altra durante la visita";
      btn.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="8" height="16" rx="1.5"></rect><rect x="13" y="4" width="8" height="16" rx="1.5"></rect></svg>' +
        '<span>Fissa per confronto</span>';
      btn.addEventListener("click", pinCurrentNote);
      dock.appendChild(btn);
      return;
    }

    dock.classList.remove("is-idle");

    const badge = document.createElement("span");
    badge.className = "sp-compare-dock-badge";
    badge.textContent = "Fissata";
    dock.appendChild(badge);

    const link = document.createElement("a");
    link.className = "sp-compare-dock-link";
    link.href = pin.url;
    link.textContent = pin.title;
    link.title = "Vai a " + pin.title;
    dock.appendChild(link);

    if (isSelf) {
      const note = document.createElement("span");
      note.className = "sp-compare-dock-hint";
      note.textContent = "Apri un'altra nota";
      dock.appendChild(note);
    } else {
      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "sp-compare-dock-action";
      openBtn.textContent = "Affianca ora";
      openBtn.addEventListener("click", function() {
        setSplitWanted(true);
        syncCompareUI();
      });
      dock.appendChild(openBtn);

      if (eligible) {
        const replaceBtn = document.createElement("button");
        replaceBtn.type = "button";
        replaceBtn.className = "sp-compare-dock-secondary";
        replaceBtn.title = "Sostituisci la nota fissata con questa";
        replaceBtn.textContent = "Fissa questa";
        replaceBtn.addEventListener("click", pinCurrentNote);
        dock.appendChild(replaceBtn);
      }
    }

    const clearBtn = document.createElement("button");
    clearBtn.type = "button";
    clearBtn.className = "sp-compare-dock-close";
    clearBtn.setAttribute("aria-label", "Rimuovi nota fissata");
    clearBtn.title = "Rimuovi nota fissata";
    clearBtn.textContent = "×";
    clearBtn.addEventListener("click", function() {
      setPin(null);
      loadedUrl = null;
      syncCompareUI();
    });
    dock.appendChild(clearBtn);

    dock.classList.add("visible");
  }

  function syncCompareUI() {
    const pin = getPin();
    const isSelf = Boolean(pin && normPath(pin.url) === normPath(window.location.href));
    const shouldShowSplit = Boolean(pin && !isSelf && isDesktop() && isSplitWanted());

    document.body.classList.toggle("sp-compare-active", shouldShowSplit);
    if (!shouldShowSplit) {
      document.body.classList.remove("sp-compare-sidebar-open");
    }

    if (shouldShowSplit && pin) {
      loadPinnedIntoPane(pin);
    }

    renderDock();
  }

  function bindStaticEvents() {
    if (document.body.dataset.spCompareBound === "1") return;
    document.body.dataset.spCompareBound = "1";

    document.getElementById("sp-compare-hide-btn")?.addEventListener("click", function() {
      setSplitWanted(false);
      syncCompareUI();
    });

    document.getElementById("sp-compare-clear-btn")?.addEventListener("click", function() {
      setPin(null);
      loadedUrl = null;
      syncCompareUI();
    });

    document.getElementById("sp-compare-menu-btn")?.addEventListener("click", function() {
      document.body.classList.toggle("sp-compare-sidebar-open");
    });

    document.getElementById("sp-compare-sidebar-backdrop")?.addEventListener("click", function() {
      document.body.classList.remove("sp-compare-sidebar-open");
    });

    document.getElementById("sp-compare-pane-body")?.addEventListener("click", function(e) {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const hash = a.getAttribute("href");
      if (!hash || hash === "#") return;
      const paneBody = document.getElementById("sp-compare-pane-body");
      const target = paneBody?.querySelector(CSS.escape ? ("#" + CSS.escape(hash.slice(1))) : hash);
      if (target && paneBody) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && document.body.classList.contains("sp-compare-sidebar-open")) {
        document.body.classList.remove("sp-compare-sidebar-open");
      }
    });

    document.addEventListener("themechange", syncPaneTheme);
    window.addEventListener("resize", syncCompareUI);
  }

  function initComparePanel() {
    bindStaticEvents();
    syncCompareUI();
  }

  document.addEventListener("DOMContentLoaded", initComparePanel);
  document.addEventListener("nav", initComparePanel);
  document.addEventListener("render", initComparePanel);
  if (document.readyState !== "loading") {
    initComparePanel();
  }
})();
`,
        }}
      />
    </>
  )
}

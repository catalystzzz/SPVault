import { QuartzComponentProps } from "./types"
import { isFolderPath } from "../util/path"

/**
 * Computes recursive non-index note counts per folder slug at build time,
 * and injects lightweight progressive UI enhancements:
 * - Folder badges ("Vuota" / "N note") on folder listing cards
 * - Local instant filter bar on large lists (>= 6 items), /tag/, and /_multimedia/
 * - Automatic collapsible inline Table of Contents on long notes (>= 3 headings)
 */
export default function DatabaseEnhancements({ allFiles }: QuartzComponentProps) {
  const folderCounts: Record<string, number> = {}
  const knownFolders = new Set<string>()

  for (const f of allFiles) {
    const slug = f.slug
    if (!slug || f.unlisted === true || slug.startsWith("tags/")) continue

    const isIdx = slug === "index" || slug.endsWith("/index") || isFolderPath(slug)
    const parts = slug.split("/")

    // Registra tutte le cartelle antenate
    const maxFolderDepth = isIdx ? parts.length - 1 : parts.length - 1
    for (let i = 1; i <= maxFolderDepth; i++) {
      const prefix = parts.slice(0, i).join("/")
      if (prefix && !prefix.startsWith("_")) {
        knownFolders.add(prefix)
      }
    }

    // Conta solo le note reali (non index) per tutte le cartelle antenate
    if (!isIdx) {
      for (let i = 1; i < parts.length; i++) {
        const prefix = parts.slice(0, i).join("/")
        folderCounts[prefix] = (folderCounts[prefix] ?? 0) + 1
      }
    }
  }

  // Assicura valore 0 esplicito anche per le cartelle vuote
  for (const folder of knownFolders) {
    if (!(folder in folderCounts)) {
      folderCounts[folder] = 0
    }
  }

  const serializedCounts = JSON.stringify(folderCounts)

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  const FOLDER_COUNTS = ${serializedCounts};

  function enhanceFolderBadges() {
    const folderLinks = document.querySelectorAll('.page-listing li.section-li .desc a[href$="/"]');
    for (const a of folderLinks) {
      const li = a.closest("li.section-li");
      const section = a.closest(".section");
      if (!li || !section || section.querySelector(".sp-folder-badge")) continue;

      let key = "";
      try {
        key = decodeURIComponent(new URL(a.href, window.location.origin).pathname)
          .replace(/^\\/+|\\/+$/g, "")
          .toLowerCase();
      } catch {
        continue;
      }

      if (!(key in FOLDER_COUNTS)) continue;
      const count = FOLDER_COUNTS[key];
      const badge = document.createElement("span");
      badge.className = count === 0 ? "sp-folder-badge is-empty" : "sp-folder-badge";
      badge.textContent = count === 0 ? "Vuota" : (count === 1 ? "1 nota" : count + " note");
      if (count === 0) {
        li.classList.add("sp-folder-is-empty");
      }
      section.appendChild(badge);
    }
  }

  function createFilterBar(placeholder, initialTotal) {
    const wrap = document.createElement("div");
    wrap.className = "sp-filter-bar";
    wrap.innerHTML = \`
      <svg class="sp-filter-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input type="search" class="sp-filter-input" placeholder="\${placeholder}" aria-label="\${placeholder}" />
      <span class="sp-filter-counter">\${initialTotal} elementi</span>
    \`;
    return wrap;
  }

  function attachEmptyState(container, msg) {
    let empty = container.nextElementSibling;
    if (!empty || !empty.classList.contains("sp-filter-empty")) {
      empty = document.createElement("div");
      empty.className = "sp-filter-empty";
      empty.textContent = msg;
      empty.style.display = "none";
      container.parentNode.insertBefore(empty, container.nextSibling);
    }
    return empty;
  }

  function initLocalFilter() {
    // 1. Roster Personaggi
    const rosterGrid = document.querySelector(".sp-roster-grid");
    if (rosterGrid && !rosterGrid.previousElementSibling?.classList.contains("sp-filter-bar")) {
      const cards = Array.from(rosterGrid.querySelectorAll(".sp-roster-card"));
      if (cards.length >= 6) {
        const bar = createFilterBar("Filtra personaggi per nome...", cards.length);
        rosterGrid.parentNode.insertBefore(bar, rosterGrid);
        const empty = attachEmptyState(rosterGrid, "Nessun personaggio corrisponde al filtro.");
        const input = bar.querySelector("input");
        const counter = bar.querySelector(".sp-filter-counter");
        input.addEventListener("input", () => {
          const q = input.value.trim().toLowerCase();
          let shown = 0;
          for (const card of cards) {
            const name = (card.querySelector(".sp-roster-name")?.textContent || "").toLowerCase();
            const match = !q || name.includes(q);
            card.classList.toggle("sp-filter-hidden", !match);
            if (match) shown++;
          }
          counter.textContent = q ? (shown + " / " + cards.length) : (cards.length + " elementi");
          empty.style.display = shown === 0 ? "block" : "none";
        });
      }
    }

    // 2. Liste cartelle e Note Recenti (>= 6 voci)
    const sectionUls = document.querySelectorAll(".page-listing ul.section-ul");
    for (const ul of sectionUls) {
      if (ul.closest(".sp-roster-grid")) continue;
      if (ul.previousElementSibling?.classList.contains("sp-filter-bar")) continue;
      const items = Array.from(ul.querySelectorAll(":scope > li.section-li"));
      if (items.length >= 6) {
        const bar = createFilterBar("Filtra in questa sezione...", items.length);
        ul.parentNode.insertBefore(bar, ul);
        const empty = attachEmptyState(ul, "Nessuna voce corrisponde al filtro.");
        const input = bar.querySelector("input");
        const counter = bar.querySelector(".sp-filter-counter");
        input.addEventListener("input", () => {
          const q = input.value.trim().toLowerCase();
          let shown = 0;
          for (const li of items) {
            const text = (li.textContent || "").toLowerCase();
            const match = !q || text.includes(q);
            li.classList.toggle("sp-filter-hidden", !match);
            if (match) shown++;
          }
          counter.textContent = q ? (shown + " / " + items.length) : (items.length + " elementi");
          empty.style.display = shown === 0 ? "block" : "none";
        });
      }
    }

    // 3. Pagina Indice per Tag (/tag/)
    const slug = document.body?.dataset?.slug || "";
    if (slug === "tag/index") {
      const cloudBox = document.querySelector(".sp-tag-cloud-box");
      const article = document.querySelector("article");
      if (cloudBox && article && !cloudBox.previousElementSibling?.classList.contains("sp-filter-bar")) {
        const headings = Array.from(article.querySelectorAll("h3"));
        const pills = Array.from(cloudBox.querySelectorAll(".sp-tag-cloud-pill"));
        const bar = createFilterBar("Filtra tag o note nell'indice...", headings.length);
        cloudBox.parentNode.insertBefore(bar, cloudBox);
        const input = bar.querySelector("input");
        const counter = bar.querySelector(".sp-filter-counter");

        input.addEventListener("input", () => {
          const q = input.value.trim().toLowerCase();
          let shown = 0;
          for (const h3 of headings) {
            const ul = h3.nextElementSibling?.tagName === "UL" ? h3.nextElementSibling : null;
            const hay = ((h3.textContent || "") + " " + (ul?.textContent || "")).toLowerCase();
            const match = !q || hay.includes(q);
            h3.classList.toggle("sp-filter-hidden", !match);
            if (ul) ul.classList.toggle("sp-filter-hidden", !match);
            if (match) shown++;
          }
          for (const pill of pills) {
            const pText = (pill.textContent || "").toLowerCase();
            pill.classList.toggle("sp-filter-hidden", Boolean(q && !pText.includes(q)));
          }
          counter.textContent = q ? (shown + " / " + headings.length + " tag") : (headings.length + " tag");
        });
      }
    }

    // 4. Pagina Multimedia (/_multimedia/)
    if (slug === "_multimedia/index") {
      const archive = document.querySelector(".sp-media-archive");
      if (archive && !archive.previousElementSibling?.classList.contains("sp-filter-bar")) {
        const groups = Array.from(archive.querySelectorAll(".sp-media-group"));
        const allCards = Array.from(archive.querySelectorAll(".sp-media-card"));
        if (allCards.length >= 6) {
          const bar = createFilterBar("Filtra immagini o cartelle per nome...", allCards.length);
          archive.parentNode.insertBefore(bar, archive);
          const empty = attachEmptyState(archive, "Nessun file multimediale corrisponde al filtro.");
          const input = bar.querySelector("input");
          const counter = bar.querySelector(".sp-filter-counter");

          input.addEventListener("input", () => {
            const q = input.value.trim().toLowerCase();
            let shownCards = 0;
            for (const g of groups) {
              const folderName = (g.querySelector(".sp-media-folder-name")?.textContent || "").toLowerCase();
              const cards = Array.from(g.querySelectorAll(".sp-media-card"));
              let groupMatches = 0;
              const folderMatch = q && folderName.includes(q);
              for (const c of cards) {
                const fname = (c.querySelector(".sp-media-name")?.textContent || "").toLowerCase();
                const match = !q || folderMatch || fname.includes(q);
                c.classList.toggle("sp-filter-hidden", !match);
                if (match) {
                  groupMatches++;
                  shownCards++;
                }
              }
              g.classList.toggle("sp-filter-hidden", groupMatches === 0);
              if (q && groupMatches > 0) {
                g.setAttribute("open", "");
              } else if (!q) {
                g.removeAttribute("open");
              }
            }
            counter.textContent = q ? (shownCards + " / " + allCards.length) : (allCards.length + " elementi");
            empty.style.display = shownCards === 0 ? "block" : "none";
          });
        }
      }
    }
  }

  function initAutoToc() {
    const slug = document.body?.dataset?.slug || "";
    if (!slug || slug === "index" || slug.endsWith("/index") || slug.startsWith("tags/")) return;

    const preview = document.querySelector('article[data-quartz-component="ContentPage"] .markdown-preview-view');
    if (!preview || preview.querySelector(".sp-inline-toc")) return;

    const headings = Array.from(preview.querySelectorAll("h2[id], h3[id]"));
    if (headings.length < 3) return;

    const toc = document.createElement("details");
    toc.className = "sp-inline-toc sp-media-group";
    const itemsHtml = headings.map((h) => {
      const level = h.tagName === "H3" ? "is-sub" : "";
      // Prendi solo il testo visibile senza eventuali svg ancore
      const clone = h.cloneNode(true);
      clone.querySelectorAll("a[role='anchor'], svg").forEach((el) => el.remove());
      const text = (clone.textContent || "").trim();
      return \`<li class="\${level}"><a href="#\${h.id}" data-no-popover="true">\${text}</a></li>\`;
    }).join("");

    toc.innerHTML = \`
      <summary><span class="sp-media-folder-name">Indice della nota</span><span class="sp-media-count">\${headings.length} sezioni</span></summary>
      <ul class="sp-inline-toc-list">\${itemsHtml}</ul>
    \`;

    preview.insertBefore(toc, preview.firstChild);
  }

  function runEnhancements() {
    enhanceFolderBadges();
    initLocalFilter();
    initAutoToc();
  }

  document.addEventListener("DOMContentLoaded", runEnhancements);
  document.addEventListener("nav", runEnhancements);
  document.addEventListener("render", runEnhancements);
  if (document.readyState !== "loading") {
    runEnhancements();
  }
})();
`,
      }}
    />
  )
}

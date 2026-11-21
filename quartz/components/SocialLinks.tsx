import { QuartzComponent, QuartzComponentProps } from "./types"

export default function SocialLinks(props: QuartzComponentProps) {
  return (
    <div class="sp-social-links">
      <a
        href="https://discord.gg/KAughr4AHc"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        title="Server Discord"
        class="sp-social-btn discord"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      </a>
      <a
        href="https://www.youtube.com/@CatalystOnline"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
        title="Canale YouTube"
        class="sp-social-btn youtube"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </a>
      <a
        href="https://www.twitch.tv/catalystonline"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Twitch"
        title="Canale Twitch"
        class="sp-social-btn twitch"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      </a>
      <button
        type="button"
        class="sp-social-btn darkmode theme-toggle"
        aria-label="Cambia tema chiaro/scuro"
        title="Cambia tema chiaro/scuro"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="dayIcon"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="nightIcon"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      </button>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  function ensureHomeNav() {
    const explorerUl = document.querySelector(".explorer ul.explorer-ul");
    if (!explorerUl) return;

    const p = window.location.pathname.replace(/\\/index\\.html$/, "").replace(/\\/$/, "");
    const isHome = p === "" || p === "/" || window.location.pathname === "/";

    let homeLi = explorerUl.querySelector(".nav-home-item");
    if (homeLi) {
      const container = homeLi.querySelector(".folder-container");
      const link = homeLi.querySelector("a.nav-home-link");
      if (container && link) {
        if (isHome) {
          container.classList.add("is-active");
          link.classList.add("active");
        } else {
          container.classList.remove("is-active");
          link.classList.remove("active");
        }
      }
      return;
    }

    homeLi = document.createElement("li");
    homeLi.className = "nav-home-item";
    homeLi.innerHTML = \`
      <div class="folder-container \${isHome ? "is-active" : ""}">
        <a href="/" class="folder-button nav-home-link \${isHome ? "active" : ""}">
          <span>Home</span>
        </a>
      </div>
    \`;

    explorerUl.insertBefore(homeLi, explorerUl.firstChild);
  }

  document.addEventListener("nav", ensureHomeNav);
  document.addEventListener("render", ensureHomeNav);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureHomeNav);
  } else {
    ensureHomeNav();
  }

  const observer = new MutationObserver(() => {
    const explorerUl = document.querySelector(".explorer ul.explorer-ul");
    if (explorerUl && !explorerUl.querySelector(".nav-home-item")) {
      ensureHomeNav();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    });
  }

  // Delegazione click: se si clicca sullo spazio vuoto del riquadro, attiva il link della cartella
  document.addEventListener("click", function(e) {
    const container = e.target.closest(".folder-container");
    if (!container) return;
    // Se il click è avvenuto sulla freccia per espandere/collassare, non intervenire
    if (e.target.closest(".folder-icon")) return;

    const link = container.querySelector("a.folder-button, a.nav-home-link");
    if (link && e.target !== link && !link.contains(e.target)) {
      link.click();
    }
  });
})();
`,
        }}
      />
    </div>
  )
}

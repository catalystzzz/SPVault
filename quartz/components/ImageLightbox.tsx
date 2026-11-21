import { QuartzComponent, QuartzComponentProps } from "./types"

export default function ImageLightbox(props: QuartzComponentProps) {
  return (
    <>
      <div id="sp-lightbox" class="sp-lightbox" aria-hidden="true">
        <div class="sp-lightbox-backdrop"></div>
        <button type="button" class="sp-lightbox-close" aria-label="Chiudi" title="Chiudi (Esc)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="sp-lightbox-container">
          <img id="sp-lightbox-img" src="" alt="" />
          <div id="sp-lightbox-caption" class="sp-lightbox-caption"></div>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  function getLightbox() {
    return document.getElementById("sp-lightbox");
  }

  function openLb(src, alt) {
    const lightbox = getLightbox();
    if (!lightbox || !src) return;
    const lbImg = document.getElementById("sp-lightbox-img");
    const lbCaption = document.getElementById("sp-lightbox-caption");
    if (lbImg) {
      lbImg.src = src;
      lbImg.alt = alt || "";
    }
    if (lbCaption) {
      lbCaption.textContent = (alt && alt !== "null" && alt !== "undefined") ? alt : "";
    }
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLb() {
    const lightbox = getLightbox();
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!lightbox.classList.contains("active")) {
        const lbImg = document.getElementById("sp-lightbox-img");
        if (lbImg) lbImg.src = "";
      }
    }, 250);
  }

  // Intercetta tutti i click in fase di capture (cattura prima del cambio pagina)
  document.addEventListener("click", function(e) {
    const lightbox = getLightbox();
    if (!lightbox) return;

    // Se si clicca sul tasto di chiusura o sullo sfondo scuro del lightbox
    if (e.target.closest(".sp-lightbox-close") || e.target.closest(".sp-lightbox-backdrop")) {
      e.preventDefault();
      e.stopPropagation();
      closeLb();
      return;
    }

    // Se il lightbox è attivo e si clicca fuori dall'immagine
    if (lightbox.classList.contains("active") && !e.target.closest("#sp-lightbox-img")) {
      e.preventDefault();
      e.stopPropagation();
      closeLb();
      return;
    }

    // 1. Clic su immagini all'interno delle note / articoli (esclude la sezione Personaggi dove le immagini fungono da cartella)
    const clickedImg = e.target.closest("article img, .markdown-rendered img, .markdown-preview-view img");
    if (clickedImg && !clickedImg.closest(".sp-lightbox") && !clickedImg.closest(".sp-social-btn") && !clickedImg.closest(".sp-roster-card")) {
      e.preventDefault();
      e.stopPropagation();
      openLb(clickedImg.src, clickedImg.alt || clickedImg.title || "");
      return;
    }

    // 2. Clic su collegamenti a file immagine (es. cartella Multimedia, esclude le card dei Personaggi)
    const anchor = e.target.closest("a");
    if (anchor && !anchor.closest(".sp-lightbox") && !anchor.closest(".sp-roster-card")) {
      const href = anchor.getAttribute("href") || "";
      const isImgFile = /\\.(jpe?g|png|gif|webp|svg|bmp|avif)(\\?.*)?$/i.test(href);
      const isMultimediaFile = href.toLowerCase().includes("/_multimedia/") && !href.endsWith("/");
      if (isImgFile || isMultimediaFile) {
        e.preventDefault();
        e.stopPropagation();
        const alt = anchor.textContent ? anchor.textContent.trim() : "";
        openLb(anchor.href || href, alt);
        return;
      }
    }
  }, true);

  // Chiusura con tasto Escape
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      const lightbox = getLightbox();
      if (lightbox && lightbox.classList.contains("active")) {
        closeLb();
      }
    }
  });
})();
`,
        }}
      />
    </>
  )
}

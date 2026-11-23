import fs from "fs"
import path from "path"
import { QuartzComponentProps } from "./types"
import { FilePath, isFolderPath, slugifyFilePath } from "../util/path"

interface SectionMeta {
  order: number
  title: string
  description: string
}

const EXCLUDED_TOP_FOLDERS = new Set(["template", "templates", "private", "dizionario"])

const CURATED_SECTIONS: Record<string, SectionMeta> = {
  "note-recenti": {
    order: 10,
    title: "Note Recenti",
    description: "File, schede e documenti aggiunti o modificati di recente nel database.",
  },
  personaggi: {
    order: 20,
    title: "Personaggi",
    description: "Note, documenti ed appunti sui personaggi.",
  },
  "npc--and--menzionati": {
    order: 30,
    title: "NPC & Menzionati",
    description: "Personaggi secondari, contatti e figure menzionate nella lore.",
  },
  fazioni: {
    order: 40,
    title: "Fazioni",
    description: "Organizzazioni e gruppi del mondo di gioco (MISS, River Constabulary, S.T.A.T.S., UMI...).",
  },
  mappe: {
    order: 50,
    title: "Mappe & Aree",
    description: "Informazioni, connessioni ed appunti sulle mappe e zone del gioco.",
  },
  "post-ufficiali": {
    order: 60,
    title: "Post Ufficiali & Trailer",
    description: "Presentazioni, video ufficiali e comunicazioni.",
  },
  "concetti-chiave": {
    order: 65,
    title: "Concetti Chiave",
    description: "Concetti chiave, termini fondamentali ed elementi del mondo di gioco.",
  },
  _multimedia: {
    order: 80,
    title: "Multimedia",
    description: "Galleria di illustrazioni, drip marketing, artwork e materiali visivi ufficiali.",
  },
  tag: {
    order: 90,
    title: "Indice per Tag",
    description: "Tutti i contenuti del database raggruppati per tag tematici.",
  },
}

/**
 * Dynamically renders the Home page hub cards (.sp-hub-grid) at build time
 * from top-level folders in `content/`, so newly added important folders
 * appear automatically without manual edits to `content/index.md`.
 */
export default function HomeHubCards({ fileData, allFiles }: QuartzComponentProps) {
  if (fileData.slug !== "index") {
    return null
  }

  const contentDir = path.join(process.cwd(), "content")
  const diskFolders = new Map<string, string>()

  if (fs.existsSync(contentDir)) {
    for (const entry of fs.readdirSync(contentDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith(".") || entry.name.startsWith("!")) continue
      const slug = slugifyFilePath(`${entry.name}/index` as FilePath)
        .replace(/\/index$/, "")
        .toLowerCase()
      if (!slug || EXCLUDED_TOP_FOLDERS.has(slug)) continue
      diskFolders.set(slug, entry.name)
    }
  }

  // Conta note reali e raccoglie eventuali titoli/descrizioni dagli index.md di primo livello
  const noteCounts: Record<string, number> = {}
  const folderFrontmatter: Record<string, { title?: string; description?: string }> = {}

  for (const f of allFiles) {
    const slug = f.slug
    if (!slug || f.unlisted === true || slug === "index" || slug.startsWith("tags/")) continue

    const topSlug = slug.split("/")[0]?.toLowerCase()
    if (!topSlug || EXCLUDED_TOP_FOLDERS.has(topSlug)) continue

    if (!diskFolders.has(topSlug)) {
      diskFolders.set(topSlug, topSlug)
    }

    const isIdx = slug === `${topSlug}/index` || slug.endsWith("/index") || isFolderPath(slug)
    if (slug === `${topSlug}/index`) {
      folderFrontmatter[topSlug] = {
        title: typeof f.frontmatter?.title === "string" ? f.frontmatter.title : undefined,
        description: typeof f.description === "string" ? f.description : undefined,
      }
    } else if (!isIdx) {
      noteCounts[topSlug] = (noteCounts[topSlug] ?? 0) + 1
    }
  }

  const cards = Array.from(diskFolders.entries())
    .map(([slug, dirName]) => {
      const curated = CURATED_SECTIONS[slug]
      const fm = folderFrontmatter[slug]
      const count = noteCounts[slug] ?? 0
      const autoDesc =
        count === 0
          ? "Sezione del database."
          : count === 1
            ? "1 scheda o nota presente in questa sezione."
            : `${count} schede e note presenti in questa sezione.`

      return {
        slug,
        order: curated?.order ?? 70,
        title: curated?.title ?? fm?.title ?? dirName,
        description: curated?.description ?? fm?.description ?? autoDesc,
      }
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title))

  return (
    <div class="sp-hub-grid">
      {cards.map((card) => (
        <a href={`/${card.slug}/`} class="sp-hub-card">
          <div class="sp-hub-title">{card.title}</div>
          <p class="sp-hub-desc">{card.description}</p>
        </a>
      ))}
    </div>
  )
}

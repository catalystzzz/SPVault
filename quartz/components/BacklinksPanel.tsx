import { QuartzComponentProps } from "./types"
import { isFolderPath, resolveRelative, simplifySlug } from "../util/path"

const EXCLUDED_INDEX_SLUGS = new Set([
  "index",
  "tag/index",
  "note-recenti/index",
  "_multimedia/index",
  "personaggi/index",
])

/**
 * Renders a compact "Citato in" backlinks block at the bottom of regular notes,
 * excluding auto-generated index/tag/folder pages to avoid noisy citations.
 */
export default function BacklinksPanel({ fileData, allFiles }: QuartzComponentProps) {
  const rawSlug = fileData.slug
  if (
    !rawSlug ||
    rawSlug === "index" ||
    rawSlug.endsWith("/index") ||
    isFolderPath(rawSlug) ||
    rawSlug.startsWith("tags/")
  ) {
    return null
  }

  const targetSlug = simplifySlug(rawSlug)
  const sources = allFiles
    .filter((f) => {
      const s = f.slug
      if (!s || f.unlisted === true) return false
      if (s === rawSlug || EXCLUDED_INDEX_SLUGS.has(s) || s.startsWith("tags/")) return false
      return f.links?.includes(targetSlug) ?? false
    })
    .sort((a, b) => {
      const ta = (a.frontmatter?.title ?? a.slug ?? "").toLowerCase()
      const tb = (b.frontmatter?.title ?? b.slug ?? "").toLowerCase()
      return ta.localeCompare(tb)
    })

  if (sources.length === 0) {
    return null
  }

  return (
    <div class="sp-backlinks-panel">
      <div class="sp-backlinks-header">
        <span>Citato in</span>
        <span class="sp-backlinks-count">{sources.length}</span>
      </div>
      <div class="sp-backlinks-list">
        {sources.map((src) => (
          <a href={resolveRelative(rawSlug, src.slug!)} class="internal sp-backlink-card">
            <span class="sp-backlink-title">{src.frontmatter?.title ?? src.slug}</span>
            <span class="sp-backlink-arrow">›</span>
          </a>
        ))}
      </div>
    </div>
  )
}

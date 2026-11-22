import { QuartzComponentProps } from "./types"
import { transparentArtMap } from "./transparentArtMap"

/**
 * Displays a compact database header card with the character's Transparent Art
 * on top-level character folder pages (`/personaggi/<name>/`).
 */
export default function CharacterBanner({ fileData, allFiles }: QuartzComponentProps) {
  const rawSlug = fileData.slug ?? ""
  const match = /^personaggi\/([^/]+)\/index$/.exec(rawSlug)
  if (!match) {
    return null
  }

  const charSlug = match[1]
  const arts = transparentArtMap[charSlug]
  if (!arts || arts.length === 0) {
    return null
  }

  const prefix = `personaggi/${charSlug}/`
  const itemCount = allFiles.filter(
    (f) => f.slug && f.slug.startsWith(prefix) && f.slug !== `${prefix}index` && f.unlisted !== true,
  ).length

  const countLabel =
    itemCount === 0
      ? "Nessun documento presente"
      : itemCount === 1
        ? "1 documento collegato"
        : `${itemCount} documenti collegati`

  return (
    <div class="sp-char-banner">
      <div class="sp-char-banner-info">
        <span class="sp-char-banner-eyebrow">Archivio Personaggio</span>
        <div class="sp-char-banner-meta">{countLabel}</div>
      </div>
      <div class="sp-char-banner-arts">
        {arts.map((art) => (
          <a
            href={art.src}
            class="sp-char-banner-art-link"
            data-no-popover="true"
            title={`Ingrandisci ${art.label}`}
          >
            <img src={art.src} alt={art.label} class="sp-char-banner-img" />
          </a>
        ))}
      </div>
    </div>
  )
}

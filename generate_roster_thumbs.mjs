import fs from "fs"
import path from "path"
import sharp from "sharp"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.join(__dirname, "content", "_Multimedia", "Personaggi", "Profile Art")
const outDir = path.join(__dirname, "quartz", "static", "roster-thumbs")

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"])
const THUMB_SIZE = 520

function toThumbName(filename) {
  const stem = path.parse(filename).name
  const slug = stem
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
  return `${slug}.webp`
}

async function run() {
  if (!fs.existsSync(srcDir)) {
    console.log("[RosterThumbs] Cartella Profile Art non trovata, salto.")
    return
  }

  fs.mkdirSync(outDir, { recursive: true })
  const entries = fs.readdirSync(srcDir)
  const expectedThumbs = new Set()
  let generated = 0
  let skipped = 0

  for (const file of entries) {
    const ext = path.extname(file).toLowerCase()
    if (!ALLOWED_EXT.has(ext)) continue

    const srcPath = path.join(srcDir, file)
    const stat = fs.statSync(srcPath)
    if (!stat.isFile()) continue

    const thumbName = toThumbName(file)
    expectedThumbs.add(thumbName)
    const outPath = path.join(outDir, thumbName)

    if (fs.existsSync(outPath)) {
      const outStat = fs.statSync(outPath)
      if (outStat.mtimeMs >= stat.mtimeMs && outStat.size > 0) {
        skipped++
        continue
      }
    }

    await sharp(srcPath)
      .rotate()
      .resize(THUMB_SIZE, THUMB_SIZE, {
        fit: "cover",
        position: "top",
        withoutEnlargement: true,
      })
      .webp({ quality: 84, effort: 4 })
      .toFile(outPath)

    generated++
  }

  // Rimuove eventuali miniature orfane se un file Profile Art viene rimosso o rinominato
  for (const existing of fs.readdirSync(outDir)) {
    if (!expectedThumbs.has(existing)) {
      fs.unlinkSync(path.join(outDir, existing))
    }
  }

  console.log(`[RosterThumbs] Pronte ${expectedThumbs.size} miniature WebP (${generated} generate, ${skipped} invariate).`)
}

run().catch((err) => {
  console.error("[RosterThumbs] Errore:", err)
  process.exit(1)
})

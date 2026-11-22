import json
import os
import re
import unicodedata

script_dir = os.path.dirname(os.path.abspath(__file__))
chars_dir = os.path.join(script_dir, "content", "Personaggi")
output_file = os.path.join(chars_dir, "index.md")
art_dir = os.path.join(script_dir, "content", "_Multimedia", "Personaggi", "Profile Art")
transparent_dir = os.path.join(script_dir, "content", "_Multimedia", "Personaggi", "Transparent Art")
transparent_map_ts = os.path.join(script_dir, "quartz", "components", "transparentArtMap.ts")

folders = [d for d in os.listdir(chars_dir) if os.path.isdir(os.path.join(chars_dir, d))]
arts = os.listdir(art_dir) if os.path.exists(art_dir) else []
transparent_arts = sorted(os.listdir(transparent_dir)) if os.path.exists(transparent_dir) else []


def slugify(text):
    s = text.lower()
    s = re.sub(r"[^a-z0-9']+", "-", s)
    return s.strip("-")


def quartz_slugify_segment(s):
    s = unicodedata.normalize("NFC", s)
    s = re.sub(r"\s", "-", s)
    s = s.replace("&", "-and-").replace("%", "-percent")
    s = re.sub(r'[?#<>:"|*]', "", s).lower()
    return s


def find_art(char_name):
    clean_name = re.sub(r"[^a-zA-Z0-9]+", "", char_name).lower()
    # 1. Match esatto o parziale
    for a in arts:
        clean_a = re.sub(r"[^a-zA-Z0-9]+", "", a).lower()
        if clean_name in clean_a or clean_a.startswith(clean_name):
            slug_a = re.sub(r"[^a-zA-Z0-9\.]+", "-", a).lower().strip("-")
            return f"/_multimedia/personaggi/profile-art/{slug_a}"

    # 2. Match sulla prima parola (es. Cynthia II -> Cynthia)
    first_word = char_name.split()[0].lower()
    for a in arts:
        clean_a = re.sub(r"[^a-zA-Z0-9]+", "", a).lower()
        if first_word in clean_a:
            slug_a = re.sub(r"[^a-zA-Z0-9\.]+", "-", a).lower().strip("-")
            return f"/_multimedia/personaggi/profile-art/{slug_a}"

    return "/static/icon.png"


def normalize_token(text):
    return re.sub(r"[^a-z0-9]+", "", text.lower()).replace("cynthia", "cinthia")


def find_transparent_arts(char_name):
    norm_char = normalize_token(char_name)
    first_word = normalize_token(char_name.split()[0])
    matches = []
    for filename in transparent_arts:
        if not filename.lower().endswith((".png", ".webp", ".jpg", ".jpeg")):
            continue
        stem = os.path.splitext(filename)[0]
        norm_file = normalize_token(stem)
        stem_first = normalize_token(stem.split()[0]) if stem.split() else ""
        if norm_file == norm_char or (len(char_name.split()) == 1 and stem_first == first_word):
            matches.append({
                "src": f"/_multimedia/personaggi/transparent-art/{quartz_slugify_segment(filename)}",
                "label": stem,
            })
    return matches


content = """---
title: Personaggi
---

Elenco dei personaggi di **Silver Palace**: seleziona un personaggio per accedere alla sua cartella dedicata e consultare tutte le relative note, schede e materiali.

<div class="sp-roster-grid">
"""

transparent_map = {}

for f in sorted(folders, key=lambda x: x.lower()):
    slug = slugify(f)
    q_slug = quartz_slugify_segment(f)
    img_url = find_art(f)
    content += f"""
<a href="/personaggi/{slug}/" class="sp-roster-card">
  <div class="sp-roster-img-box">
    <img src="{img_url}" alt="{f} Profile Art" loading="lazy" />
  </div>
  <div class="sp-roster-body">
    <div class="sp-roster-name">{f}</div>
  </div>
</a>
"""
    t_arts = find_transparent_arts(f)
    if t_arts:
        transparent_map[q_slug] = t_arts

content += "\n</div>\n"

with open(output_file, "w", encoding="utf-8") as fh:
    fh.write(content)

os.makedirs(os.path.dirname(transparent_map_ts), exist_ok=True)
with open(transparent_map_ts, "w", encoding="utf-8") as tf:
    tf.write("// File generato automaticamente da update_roster.py — non modificare a mano.\n")
    tf.write("export interface TransparentArtEntry {\n  src: string\n  label: string\n}\n\n")
    tf.write(f"export const transparentArtMap: Record<string, TransparentArtEntry[]> = {json.dumps(transparent_map, indent=2, ensure_ascii=False)}\n")

print(f"Personaggi/index.md rigenerato automaticamente con successo ({len(folders)} cartelle rilevate)!")

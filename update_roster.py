import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
chars_dir = os.path.join(script_dir, "content", "Personaggi")
output_file = os.path.join(chars_dir, "index.md")
art_dir = os.path.join(script_dir, "content", "_Multimedia", "Personaggi", "Profile Art")

folders = [d for d in os.listdir(chars_dir) if os.path.isdir(os.path.join(chars_dir, d))]
arts = os.listdir(art_dir) if os.path.exists(art_dir) else []

def slugify(text):
    s = text.lower()
    s = re.sub(r'[^a-z0-9\']+', '-', s)
    return s.strip('-')

def find_art(char_name):
    clean_name = re.sub(r'[^a-zA-Z0-9]+', '', char_name).lower()
    # 1. Match esatto o parziale
    for a in arts:
        clean_a = re.sub(r'[^a-zA-Z0-9]+', '', a).lower()
        if clean_name in clean_a or clean_a.startswith(clean_name):
            slug_a = re.sub(r'[^a-zA-Z0-9\.]+', '-', a).lower().strip('-')
            return f"/_multimedia/personaggi/profile-art/{slug_a}"
            
    # 2. Match sulla prima parola (es. Cynthia II -> Cynthia)
    first_word = char_name.split()[0].lower()
    for a in arts:
        clean_a = re.sub(r'[^a-zA-Z0-9]+', '', a).lower()
        if first_word in clean_a:
            slug_a = re.sub(r'[^a-zA-Z0-9\.]+', '-', a).lower().strip('-')
            return f"/_multimedia/personaggi/profile-art/{slug_a}"
            
    return "/static/icon.png"

content = """---
title: Personaggi
---

Elenco dei personaggi di **Silver Palace**: seleziona un personaggio per accedere alla sua cartella dedicata e consultare tutte le relative note, schede e materiali.

<div class="sp-roster-grid">
"""

for f in sorted(folders, key=lambda x: x.lower()):
    slug = slugify(f)
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

content += "\n</div>\n"

with open(output_file, 'w', encoding='utf-8') as fh:
    fh.write(content)

print(f"Personaggi/index.md rigenerato automaticamente con successo ({len(folders)} cartelle rilevate)!")

import html
import os
import re
import unicodedata

script_dir = os.path.dirname(os.path.abspath(__file__))
multimedia_dir = os.path.join(script_dir, "content", "_Multimedia")
index_path = os.path.join(multimedia_dir, "index.md")

valid_extensions = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
grouped_files = {}


def quartz_slugify_path(s):
    s = unicodedata.normalize("NFC", s)
    segments = []
    for seg in s.split("/"):
        seg = re.sub(r"\s", "-", seg)
        seg = seg.replace("&", "-and-").replace("%", "-percent")
        seg = re.sub(r'[?#<>:"|*]', "", seg).lower()
        segments.append(seg)
    return "/".join(segments).rstrip("/")


for root, dirs, files in os.walk(multimedia_dir):
    rel_path = os.path.relpath(root, multimedia_dir)
    subfolder = "Radice Multimedia" if rel_path == "." else rel_path.replace("\\", "/")

    imgs = [f for f in files if f.lower().endswith(valid_extensions)]
    if imgs:
        grouped_files.setdefault(subfolder, []).extend(imgs)

sections_html = []
total_files = sum(len(v) for v in grouped_files.values())

for folder, imgs in sorted(grouped_files.items(), key=lambda kv: kv[0].lower()):
    cards = []
    for img in sorted(imgs, key=lambda x: x.lower()):
        if folder == "Radice Multimedia":
            rel_url = quartz_slugify_path(f"_Multimedia/{img}")
        else:
            rel_url = quartz_slugify_path(f"_Multimedia/{folder}/{img}")
        img_url = f"/{rel_url}"
        esc_img = html.escape(img)
        cards.append(
            f'    <a href="{img_url}" class="sp-media-card" data-no-popover="true">\n'
            f'      <div class="sp-media-thumb"><img src="{img_url}" alt="{esc_img}" loading="lazy" /></div>\n'
            f'      <div class="sp-media-name" title="{esc_img}">{esc_img}</div>\n'
            f'    </a>'
        )

    esc_folder = html.escape(folder)
    sections_html.append(
        f'<details class="sp-media-group">\n'
        f'  <summary><span class="sp-media-folder-name">{esc_folder}</span><span class="sp-media-count">{len(imgs)} file</span></summary>\n'
        f'  <div class="sp-media-grid">\n' + "\n".join(cards) + '\n  </div>\n'
        f'</details>'
    )

markdown_content = f"""---
title: Multimedia
---

Raccolta organizzata dei file multimediali presenti nel database ({total_files} file in {len(grouped_files)} cartelle). Clicca su una categoria per espandere le anteprime:

<div class="sp-media-archive">
{chr(10).join(sections_html)}
</div>
"""

os.makedirs(os.path.dirname(index_path), exist_ok=True)
with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Indice Immagini.md aggiornato con successo!")

import os
import re

script_dir = os.path.dirname(os.path.abspath(__file__))
content_dir = os.path.join(script_dir, "content")
index_path = os.path.join(content_dir, "Tag", "index.md")

tag_dict = {}

# Regex per trovare i tag in stile Obsidian (es. #lore, #gacha/zz_zero)
tag_regex = re.compile(r'(?<!\S)#([a-zA-Z0-9_\-/]+)')

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith(".md"):
            file_path = os.path.join(root, file)
            
            # Ignora il file di indice stesso per evitare loop
            if os.path.abspath(file_path) == os.path.abspath(index_path):
                continue
            
            rel_path = os.path.relpath(file_path, content_dir)
            link_target = os.path.splitext(rel_path)[0].replace("\\", "/")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    found_tags = tag_regex.findall(content)
                    
                    for tag in set(found_tags):
                        tag_clean = tag.strip()
                        if tag_clean not in tag_dict:
                            tag_dict[tag_clean] = []
                        tag_dict[tag_clean].append(link_target)
            except Exception as e:
                print(f"Errore nella lettura di {file_path}: {e}")

sorted_tags = sorted(tag_dict.keys(), key=lambda t: t.lower())

cloud_pills = []
for tag in sorted_tags:
    anchor = re.sub(r'[^a-z0-9_-]+', '', tag.lower().replace(' ', '-'))
    count = len(tag_dict[tag])
    cloud_pills.append(
        f'  <a href="#{anchor}" class="sp-tag-cloud-pill" data-no-popover="true">#{tag}<span class="sp-tag-count">{count}</span></a>'
    )

markdown_content = """---
title: Indice per Tag
---

Elenco dinamico di tutti i contenuti del vault organizzati per tag ({total_tags} tag totali):

<details class="sp-tag-cloud-box">
  <summary><span class="sp-media-folder-name">Indice rapido per Tag</span><span class="sp-media-count">{total_tags} tag</span></summary>
  <div class="sp-tag-cloud">
{cloud}
  </div>
</details>

""".format(total_tags=len(sorted_tags), cloud="\n".join(cloud_pills))

for tag in sorted_tags:
    markdown_content += f"\n### #{tag}\n"
    for link in sorted(tag_dict[tag]):
        file_name = os.path.basename(link)
        markdown_content += f"- [[{link}|{file_name}]]\n"

os.makedirs(os.path.dirname(index_path), exist_ok=True)
with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Indice per Tag (Tag/index.md) aggiornato con successo!")

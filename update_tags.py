import os
import re

content_dir = "content"
index_path = "content/!Indici/Indice per Tag.md"

tag_dict = {}

# Regex per trovare i tag in stile Obsidian (es. #lore, #gacha/zz_zero)
# Evita di confondere i cancelletti dei titoli markdown (# Titolo) controllando lo spazio prima
tag_regex = re.compile(r'(?<!\S)#([a-zA-Z0-9_\-/]+)')

for root, dirs, files in os.walk(content_dir):
    for file in files:
        if file.endswith(".md"):
            file_path = os.path.join(root, file)
            
            # Ignora il file di indice stesso per evitare loop
            if os.path.abspath(file_path) == os.path.abspath(index_path):
                continue
            
            rel_path = os.path.relpath(file_path, content_dir)
            # Percorso pulito per i link di Quartz (senza estensione .md e con slash corretti)
            link_target = os.path.splitext(rel_path)[0].replace("\\", "/")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    
                    # Trova tutti i tag unici in questa nota
                    found_tags = tag_regex.findall(content)
                    
                    for tag in set(found_tags):
                        tag_clean = tag.strip()
                        if tag_clean not in tag_dict:
                            tag_dict[tag_clean] = []
                        tag_dict[tag_clean].append(link_target)
            except Exception as e:
                print(f"Errore nella lettura di {file_path}: {e}")

# Scrittura del file Markdown per Quartz
markdown_content = """---
title: Indice per Tag
---

Elenco dinamico di tutti i contenuti del vault organizzati per tag:

"""

for tag in sorted(tag_dict.keys()):
    markdown_content += f"\n### 🏷️ #{tag}\n"
    for link in sorted(tag_dict[tag]):
        file_name = os.path.basename(link)
        markdown_content += f"- [[{link}|{file_name}]]\n"

with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Indice per Tag.md aggiornato con successo!")
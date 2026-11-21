import os

script_dir = os.path.dirname(os.path.abspath(__file__))
multimedia_dir = os.path.join(script_dir, "content", "_Multimedia")
index_path = os.path.join(multimedia_dir, "index.md")

valid_extensions = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg")
grouped_files = {}

for root, dirs, files in os.walk(multimedia_dir):
    rel_path = os.path.relpath(root, multimedia_dir)
    subfolder = "Radice Multimedia" if rel_path == "." else rel_path
    
    imgs = [f for f in files if f.lower().endswith(valid_extensions)]
    if imgs:
        if subfolder not in grouped_files:
            grouped_files[subfolder] = []
        grouped_files[subfolder].extend(imgs)

markdown_content = """---
title: Multimedia
---

Raccolta dei file multimediali presenti nel database:

"""

for folder, imgs in sorted(grouped_files.items()):
    clean_folder = folder.replace("\\", "/")
    markdown_content += f"\n### 📂 {clean_folder}\n"
    for img in sorted(imgs):
        if folder == "Radice Multimedia":
            link_path = f"_Multimedia/{img}"
        else:
            link_path = f"_Multimedia/{clean_folder}/{img}"
        
        # Link testuale pulito, cliccabile e senza anteprima pesante
        markdown_content += f"- [[{link_path}|{img}]]\n"
# Assicura che la cartella degli indici esista
os.makedirs(os.path.dirname(index_path), exist_ok=True)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Indice Immagini.md aggiornato con successo!")
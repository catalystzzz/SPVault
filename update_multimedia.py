import os

# Aggiornato con il trattino basso per puntare alla cartella nascosta dall'Explorer
multimedia_dir = "content/_Multimedia" 
index_path = "content/!Indici/Indice Immagini.md"

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
title: Indice Immagini
---

Indice di tutte le immagini presenti nel database:

"""

for folder, imgs in sorted(grouped_files.items()):
    markdown_content += f"\n### 📂 {folder}\n"
    for img in sorted(imgs):
        # I link puntano correttamente a _Multimedia per far trovare le immagini al sito
        if folder == "Radice Multimedia":
            link_path = f"_Multimedia/{img}"
        else:
            link_path = f"_Multimedia/{folder}/{img}"
        
        # Link testuale pulito, cliccabile e senza anteprima pesante
        markdown_content += f"- [[{link_path}|{img}]]\n"

# Assicura che la cartella degli indici esista
os.makedirs(os.path.dirname(index_path), exist_ok=True)

with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Indice Immagini.md aggiornato con successo!")
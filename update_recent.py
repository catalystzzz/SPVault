import os
import datetime

content_dir = "content"
index_path = "content/!Indici/Ultimi aggiornamenti.md"
max_files = 15  # Numero massimo di file da mostrare

file_list = []

# Parole chiave o cartelle da escludere completamente
excluded_keywords = ["indice", "ultimi aggiornamenti"]

for root, dirs, files in os.walk(content_dir):
    # Salta completamente la cartella Multimedia se è presente nel percorso
    if "_multimedia" in root.lower():
        continue
        
    for file in files:
        if file.endswith(".md"):
            file_lower = file.lower()
            
            # Salta i file che contengono parole chiave di servizio (es. indici)
            if any(exc in file_lower for exc in excluded_keywords):
                continue
                
            file_path = os.path.join(root, file)
            
            # Salta il file stesso degli aggiornamenti
            if os.path.abspath(file_path) == os.path.abspath(index_path):
                continue
            
            mtime = os.path.getmtime(file_path)
            rel_path = os.path.relpath(file_path, content_dir)
            link_target = os.path.splitext(rel_path)[0].replace("\\", "/")
            
            file_list.append({
                "path": link_target,
                "name": os.path.splitext(file)[0],
                "mtime": mtime
            })

# Ordina dal più recente al più vecchio
file_list.sort(key=lambda x: x["mtime"], reverse=True)

markdown_content = """---
title: Ultimi aggiornamenti
---

Elenco dei file di contenuto modificati di recente nel vault:

"""

for item in file_list[:max_files]:
    date_str = datetime.datetime.fromtimestamp(item["mtime"]).strftime("%d/%m/%Y %H:%M")
    markdown_content += f"- `{date_str}` — [[{item['path']}|{item['name']}]]\n"

with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Ultimi aggiornamenti.md pulito e aggiornato con successo!")
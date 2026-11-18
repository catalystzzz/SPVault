import os
import datetime
import subprocess

content_dir = "content"
index_path = "content/!Indici/Ultimi aggiornamenti.md"
max_files = 15  # Numero massimo di file da mostrare

file_list = []

# Parole chiave o cartelle da escludere completamente
excluded_keywords = ["indice", "ultimi aggiornamenti"]

def get_git_mtime(filepath):
    """Recupera la data dell'ultimo commit Git per il file, altrimenti usa mtime del file system."""
    try:
        # Chiede a git il timestamp Unix dell'ultimo commit per questo file
        cmd = ["git", "log", "-1", "--format=%ct", str(filepath)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        timestamp_str = result.stdout.strip()
        if timestamp_str:
            return float(timestamp_str)
    except Exception:
        pass
    
    # Fallback alla data di modifica del file system se git fallisce o non è tracciato
    return os.path.getmtime(filepath)

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
            
            # Usa git log per la data reale, isolando il file dalle sincronizzazioni locali
            mtime = get_git_mtime(file_path)
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

print("Ultimi aggiornamenti.md pulito e aggiornato con successo tramite Git log!")
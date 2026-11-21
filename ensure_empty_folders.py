import os

script_dir = os.path.dirname(os.path.abspath(__file__))
content_dir = os.path.join(script_dir, "content")

# Directory principali dove monitorare e gestire cartelle vuote
target_sections = ["Fazioni", "Mappe"]

PLACEHOLDER_MARKER = "*Nessuna nota presente in questa sezione.*"

def process_section(section_name):
    sec_dir = os.path.join(content_dir, section_name)
    if not os.path.exists(sec_dir):
        return
        
    for item in os.listdir(sec_dir):
        item_path = os.path.join(sec_dir, item)
        if os.path.isdir(item_path):
            index_path = os.path.join(item_path, "index.md")
            md_files = [f for f in os.listdir(item_path) if f.endswith(".md") and f.lower() != "index.md"]
            
            # Caso 1: La cartella non contiene note
            if len(md_files) == 0:
                if not os.path.exists(index_path):
                    content = f"""---
title: {item}
---

{PLACEHOLDER_MARKER}
"""
                    with open(index_path, "w", encoding="utf-8") as f:
                        f.write(content)
                    print(f"[{section_name}] Creato placeholder per cartella vuota: {item}")
                    
            # Caso 2: Sono state aggiunte note, e c'era il nostro placeholder
            else:
                if os.path.exists(index_path):
                    try:
                        with open(index_path, "r", encoding="utf-8") as f:
                            text = f.read()
                        if PLACEHOLDER_MARKER in text:
                            os.remove(index_path)
                            print(f"[{section_name}] Rimosso placeholder in {item} poiché ora contiene note.")
                    except Exception as e:
                        print(f"Errore rimozione placeholder: {e}")

if __name__ == "__main__":
    for sec in target_sections:
        process_section(sec)
    print("Verifica cartelle completata.")

import os

script_dir = os.path.dirname(os.path.abspath(__file__))
content_dir = os.path.join(script_dir, "content")

# Directory speciali gestite da altri script o che non devono mai ricevere placeholder
EXCLUDED_TOP_DIRS = {".obsidian", "Template", "_Multimedia", "Note Recenti", "Tag"}
PLACEHOLDER_MARKER = "*Nessuna nota presente in questa sezione.*"


def is_ignored_dir(name):
    return name.startswith(".") or name.startswith("!")


def process_directory(dir_path, rel_display):
    try:
        entries = os.listdir(dir_path)
    except OSError:
        return

    subdirs = [
        d for d in entries
        if os.path.isdir(os.path.join(dir_path, d))
        and not is_ignored_dir(d)
    ]
    md_notes = [
        f for f in entries
        if f.endswith(".md") and f.lower() != "index.md"
    ]

    index_path = os.path.join(dir_path, "index.md")
    folder_name = os.path.basename(dir_path)

    # Caso 1: Cartella foglia completamente vuota (né note né sottocartelle)
    if len(md_notes) == 0 and len(subdirs) == 0:
        if not os.path.exists(index_path):
            content = f"""---
title: {folder_name}
---

{PLACEHOLDER_MARKER}
"""
            with open(index_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"[EmptyFolder] Creato placeholder per cartella vuota: {rel_display}")
    # Caso 2: Ora contiene note o sottocartelle -> rimuovi eventuale placeholder automatico
    else:
        if os.path.exists(index_path):
            try:
                with open(index_path, "r", encoding="utf-8") as f:
                    text = f.read()
                if PLACEHOLDER_MARKER in text:
                    os.remove(index_path)
                    print(f"[EmptyFolder] Rimosso placeholder in {rel_display} poiché ora contiene elementi.")
            except Exception as e:
                print(f"Errore rimozione placeholder in {rel_display}: {e}")

    # Ricorsione su tutte le sottocartelle
    for sub in sorted(subdirs):
        sub_path = os.path.join(dir_path, sub)
        sub_rel = f"{rel_display}/{sub}" if rel_display else sub
        process_directory(sub_path, sub_rel)


if __name__ == "__main__":
    if os.path.exists(content_dir):
        for entry in sorted(os.listdir(content_dir)):
            full_path = os.path.join(content_dir, entry)
            if (
                os.path.isdir(full_path)
                and not is_ignored_dir(entry)
                and entry not in EXCLUDED_TOP_DIRS
            ):
                process_directory(full_path, entry)
    print("Verifica cartelle completata.")

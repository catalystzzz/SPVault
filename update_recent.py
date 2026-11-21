import os
import re
import json
import datetime
import subprocess

script_dir = os.path.dirname(os.path.abspath(__file__))
content_dir = os.path.join(script_dir, "content")
index_path = os.path.join(content_dir, "Note Recenti", "index.md")
content_index_path = os.path.join(script_dir, "public", "static", "contentIndex.json")
max_files = 12

file_list = []
excluded_keywords = ["indice", "ultimi aggiornamenti", "note recenti", "index"]

# Regex per estrarre i tag stile Obsidian
tag_regex = re.compile(r'(?<!\S)#([a-zA-Z0-9_\-/]+)')

# Carica l'indice esatto di Quartz se già generato per avere gli slug ufficiali precisi al 100%
quartz_slug_map = {}
if os.path.exists(content_index_path):
    try:
        with open(content_index_path, "r", encoding="utf-8") as f:
            cdata = json.load(f)
            for k, v in cdata.items():
                fp = v.get("filePath")
                if fp:
                    # Normalizza percorso con slash
                    norm_fp = fp.replace("\\", "/").lower()
                    quartz_slug_map[norm_fp] = v.get("slug")
    except Exception as e:
        print(f"Avviso lettura contentIndex.json: {e}")

# File con modifiche locali Git non committate
modified_files = set()
try:
    result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, check=True, cwd=script_dir)
    for line in result.stdout.splitlines():
        if len(line) > 3:
            path = line[3:].strip().replace('"', '').replace('\\', '/')
            modified_files.add(path)
except Exception:
    pass

def get_git_mtime(filepath):
    try:
        cmd = ["git", "log", "-1", "--format=%ct", str(filepath)]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True, cwd=script_dir)
        timestamp_str = result.stdout.strip()
        if timestamp_str:
            return float(timestamp_str)
    except Exception:
        pass
    return 0

def extract_tags(content):
    tags = []
    # Frontmatter tags
    fm_match = re.search(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if fm_match:
        fm = fm_match.group(1)
        m = re.search(r'tags:\s*\[(.*?)\]', fm)
        if m:
            tags.extend([t.strip().strip('"\'') for t in m.group(1).split(',') if t.strip()])
        else:
            m = re.search(r'tags:\s*\n((?:\s*-\s*[^\n]+\n)+)', fm)
            if m:
                for line in m.group(1).splitlines():
                    t = re.sub(r'^\s*-\s*', '', line).strip().strip('"\'')
                    if t:
                        tags.append(t)
    # Inline tags (#tag)
    for tag in tag_regex.findall(content):
        t_clean = tag.strip().lower()
        if not t_clean.isdigit() and len(t_clean) > 1 and t_clean not in ['tags', 'tag', 'traduzione']:
            tags.append(t_clean)
            
    # Deduplica preservando l'ordine
    seen = set()
    deduped = []
    for t in tags:
        clean = t.lstrip('#').lower()
        if clean and clean not in seen:
            seen.add(clean)
            deduped.append(clean)
    return deduped

def fallback_slugify(seg):
    # Riproduce esattamente lo slugifier di Quartz: preserva gli apostrofi '
    s = seg.lower()
    s = re.sub(r'[^a-z0-9\']+', '-', s)
    s = s.strip('-')
    return s

for root, dirs, files in os.walk(content_dir):
    if "_multimedia" in root.lower():
        continue
        
    for file in files:
        if file.endswith(".md"):
            file_base = os.path.splitext(file)[0]
            file_lower = file_base.lower()
            
            # 1. Ignora cartelle/indici esplicitamente esclusi
            if any(exc in file_lower for exc in excluded_keywords):
                continue
                
            file_path = os.path.join(root, file)
            if os.path.abspath(file_path) == os.path.abspath(index_path):
                continue
            
            # 2. ESCLUSIONE CARTELLE:
            # Se il nome del file coincide con il nome della cartella genitore (es. MISS/MISS.md o UMI/UMI.md),
            # in Quartz agisce da pagina cartella/indice (fazioni/miss/index). Dobbiamo mostrare solo vere NOTE.
            parent_dir_name = os.path.basename(root)
            if file_base.lower() == parent_dir_name.lower():
                continue
                
            rel_path = os.path.relpath(file_path, content_dir)
            norm_rel_path = rel_path.replace("\\", "/").lower()
            
            # Recupera lo slug ufficiale da Quartz o calcola il fallback identico
            if norm_rel_path in quartz_slug_map:
                slug = "/" + quartz_slug_map[norm_rel_path]
            else:
                rel_parts = os.path.splitext(rel_path)[0].replace('\\', '/').split('/')
                slug_parts = [fallback_slugify(p) for p in rel_parts]
                slug = "/" + "/".join(slug_parts)
                
            # Verifica ulteriore: se lo slug termina per /index, è una cartella e va scartata
            if slug.endswith("/index") or slug == "/index" or "/tags/" in slug:
                continue

            rel_file_path = os.path.relpath(file_path, script_dir).replace('\\', '/')
            if rel_file_path in modified_files:
                mtime = os.path.getmtime(file_path)
            else:
                mtime = get_git_mtime(file_path)
                if mtime == 0:
                    mtime = os.path.getmtime(file_path)
            
            name = file_base
            
            # Leggi i tag
            tags = []
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    tags = extract_tags(f.read())
            except Exception:
                pass

            file_list.append({
                "slug": slug,
                "name": name,
                "mtime": mtime,
                "tags": tags
            })

# Ordina dal più recente al più vecchio
file_list.sort(key=lambda x: x["mtime"], reverse=True)

# Genera il markup a riquadri (stile folder-page .page-listing)
cards_html = []
for item in file_list[:max_files]:
    # Solo la data nel formato GG/MM/AAAA (senza orario)
    date_str = datetime.datetime.fromtimestamp(item["mtime"]).strftime("%d/%m/%Y")
    
    tags_li = ""
    if item["tags"]:
        tags_li = '<ul class="tags">' + "".join([f'<li><a class="internal tag-link" href="/tags/{t}">{t}</a></li>' for t in item["tags"]]) + '</ul>'
    else:
        tags_li = '<ul class="tags"></ul>'
        
    card = f'''<li class="section-li">
  <div class="section">
    <div class="desc">
      <h3><a href="{item['slug']}" class="internal">{item['name']}</a></h3>
    </div>
    {tags_li}
    <div class="recent-date">
      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.7; vertical-align: middle; margin-right: 4px;"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect><line x1="16" x2="16" y1="2" y2="6"></line><line x1="8" x2="8" y1="2" y2="6"></line><line x1="3" x2="21" y1="10" y2="10"></line></svg>
      <span>{date_str}</span>
    </div>
  </div>
</li>'''
    cards_html.append(card)

grid_content = "\n".join(cards_html)

markdown_content = f"""---
title: Note Recenti
---

Elenco dei contenuti modificati o aggiunti di recente nel database:

<div class="page-listing sp-recent-listing">
<ul class="section-ul">
{grid_content}
</ul>
</div>
"""

os.makedirs(os.path.dirname(index_path), exist_ok=True)
with open(index_path, "w", encoding="utf-8") as f:
    f.write(markdown_content)

print("Note Recenti aggiornato con successo (solo NOTE, esclusi indici e cartelle)!")

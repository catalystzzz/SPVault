import os
import re

public_dir = "public"
print("Avvio della normalizzazione statica dei link dei tag...")

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Cerca qualsiasi attributo href contenente un percorso di tag e lo riscrive in modo assoluto
                # Intercetta sia i tag in formato cartella che gli alias generati da Quartz
                new_content, changes = re.subn(
                    r'href="[^"]*?(?:(?:\.\./)+|(?:\./)+)?tags/([^"/]+)"', 
                    r'href="/tags/\1"', 
                    content
                )
                
                if changes > 0:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    count += changes
                    
                # Secondo passaggio di sicurezza per eventuali varianti con singolo apice o attributi alternativi (es. data-slug)
                new_content_slug, slug_changes = re.subn(
                    r'data-slug="(?:(?:\.\./)+|(?:\./)+)?tags/([^"]+)"', 
                    r'data-slug="tags/\1"', 
                    content
                )
                if slug_changes > 0 and new_content == content: # Evita doppie scritture se già gestito sopra
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content_slug)

    print(f"[✅] Operazione completata: Corretti {count} collegamenti ai tag.")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
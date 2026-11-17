import os
import re

public_dir = "public"
print("Scansione e correzione globale dei link dei tag in corso...")

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Sostituisce qualsiasi link che punta a /tags/ o a domini senza /SPVault/tags/
                # Copre sia i link assoluti che quelli relativi generati nelle pagine dei tag
                content, c1 = re.subn(r'href=["\'](?:https://catalystzzz\.github\.io)?/tags/([^"\']*)["\']', r'href="/SPVault/tags/\1"', content)
                content, c2 = re.subn(r'href=["\'](?:\.\./)+tags/([^"\']*)["\']', r'href="/SPVault/tags/\1"', content)
                
                total_changes = c1 + c2
                if total_changes > 0:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    count += total_changes
                    
    print(f"[✅] Correzione completata! Aggiornati {count} link di tag in tutta la cartella public.")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
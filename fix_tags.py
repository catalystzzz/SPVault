import os
import re

public_dir = "public"
print("Correggendo i percorsi dei tag nei file HTML generati...")

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # 1. Corregge i link assoluti completi con il dominio
                content, c1 = re.subn(r'href=["\']https://catalystzzz\.github\.io/tags/([^"\']*)["\']', r'href="/SPVault/tags/\1"', content)
                
                # 2. Corregge i link relativi che partono dalla root
                content, c2 = re.subn(r'href=["\']?/tags/([^"\']*)["\']', r'href="/SPVault/tags/\1"', content)
                
                total_changes = c1 + c2
                if total_changes > 0:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    count += total_changes
                    
    print(f"[✅] Correzione completata! Aggiornati {count} link di tag.")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
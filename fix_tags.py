import os
import re

public_dir = "public"
print("Correzione statica avanzata dei link dei tag in corso...")

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Intercetta qualsiasi combinazione di tag (relativi con ../ o assoluti) e la normalizza
                new_content, changes = re.subn(
                    r'href=["\'](?:https://catalystzzz\.github\.io)?(?:\.\./)*/?tags/([^"\']*)["\']', 
                    r'href="/SPVault/tags/\1"', 
                    content
                )
                
                if changes > 0:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    count += changes
                    
    print(f"[✅] Fatto! Corretti {count} link di tag staticamente.")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
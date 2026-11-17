import os
import re

public_dir = "public"
print("Applicazione del fix definitivo per i link dei tag...")

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Cattura qualsiasi variante di link ai tag (relativi con ../ o assoluti errati) 
                # e li forza a puntare correttamente alla cartella /SPVault/tags/
                new_content, changes = re.subn(
                    r'href=["\'](?:https://[^"\']+)?(?:\.\./)*tags/([^"\']*)["\']', 
                    r'href="/SPVault/tags/\1"', 
                    content
                )
                
                if changes > 0:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(new_content)
                    count += changes
                    
    print(f"[✅] Fatto! Corretti {count} link di tag in modo permanente.")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
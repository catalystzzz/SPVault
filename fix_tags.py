import os

public_dir = "public"
print("Correggendo i percorsi dei tag nei file HTML...")

for root, _, files in os.walk(public_dir):
    for file in files:
        if file.endswith(".html"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Sostituisce i link errati dei tag con il prefisso corretto della repository
            if 'href="/tags/' in content:
                content = content.replace('href="/tags/', 'href="/SPVault/tags/')
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)

print("Corrections completate!")
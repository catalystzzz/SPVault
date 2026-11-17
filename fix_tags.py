import os

public_dir = "public"
print("Iniezione dello script di correzione tag in corso...")

# Il blocchetto di codice che risolve i tag al volo nel browser
js_snippet = """
<script>
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('a[href*="/tags/"]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.includes('/SPVault/tags/')) {
            const tagName = href.split('/tags/').pop();
            link.setAttribute('href', `/SPVault/tags/${tagName}`);
        }
    });
});
</script>
"""

if os.path.exists(public_dir):
    count = 0
    for root, _, files in os.walk(public_dir):
        for file in files:
            if file.endswith(".html"):
                path = os.path.join(root, file)
                with open(path, "r", encoding="utf-8") as f:
                    content = f.read()
                
                # Inserisce lo script prima della chiusura del body se non è già presente
                if "SPVault/tags" not in content and "</body>" in content:
                    content = content.replace("</body>", js_snippet + "\n</body>")
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(content)
                    count += 1
                    
    print(f"[✅] Correzione applicata con successo a {count} file HTML!")
else:
    print("[❌] Attenzione: Cartella 'public' non trovata.")
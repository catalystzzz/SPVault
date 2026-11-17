import subprocess
import sys

def run_command(command, description):
    print(f"\n[🔄] {description}...")
    result = subprocess.run(command, shell=True)
    if result.returncode != 0:
        print(f"[❌] Errore durante: {description}")
        sys.exit(result.returncode)
    print(f"[✅] Completato: {description}")

def main():
    print("=== 🚀 AVVIO AUTOMAZIONE SILVER PALACE ===")
    
    # 1. Esegue il master script che fa partire tutti gli altri (multimedia, recent, tags)
    run_command("python build_indexes.py", "Generazione indici e aggiornamento script")

    # 2. Automazione Git completa (Add, Commit, Push)
    run_command("git add .", "Aggiunta file modificati a Git (git add)")
    
    commit_msg = "Aggiornamento automatico Silver Palace"
    run_command(f'git commit -m "{commit_msg}"', "Creazione commit locale")
    
    run_command("git push origin main", "Invio delle modifiche a GitHub (git push)")

    print("\n✨ Fatto! Il tuo digital garden è aggiornato e online.")

if __name__ == "__main__":
    main()
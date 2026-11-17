import subprocess

print("Aggiornamento indice multimediale...")
subprocess.run(["python", "update_multimedia.py"])

print("Aggiornamento indice aggiornamenti...")
subprocess.run(["python", "update_recent.py"])

print("Aggiornamento indice per tag...")
subprocess.run(["python", "update_tags.py"])

print("Tutti gli indici sono aggiornati!")
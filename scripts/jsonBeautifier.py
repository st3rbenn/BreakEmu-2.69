import json
import sys


def embeautifier_json(fichier_entree, fichier_sortie):
    try:
        # Lire le fichier JSON minifié
        with open(fichier_entree, "r") as fichier:
            data = json.load(fichier)

        # Écrire le fichier JSON formaté
        with open(fichier_sortie, "w") as fichier:
            json.dump(data, fichier, indent=4)

        print("Le fichier a été embeautifié avec succès.")

    except Exception as e:
        print(f"Une erreur est survenue : {e}")

if len(sys.argv) <= 1:
    print("Veuillez fournir le chemin du fichier JSON comme argument.")
    sys.exit(1)

json_file_name = sys.argv[1]
# Remplacez ces chemins par les chemins de votre fichier
chemin_fichier_entree = f"../src/breakEmu_API/data/{json_file_name}.json"
chemin_fichier_sortie = f"../src/breakEmu_API/data/{json_file_name}.json"

embeautifier_json(chemin_fichier_entree, chemin_fichier_sortie)

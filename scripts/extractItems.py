import os
import json
import sys

def extract_items_with_keys(data, keys):
    """
    Extrait les éléments contenant au moins une des clés spécifiées d'une liste de dictionnaires.
    Retourne la liste mise à jour et la liste des éléments extraits.
    """
    extracted_items = []
    items_to_keep = []
    for item in data:
        if any(key in item for key in keys):
            extracted_items.append(item)
        else:
            items_to_keep.append(item)
    return items_to_keep, extracted_items

# Vérifier si le chemin du fichier JSON et au moins une clé sont fournis
if len(sys.argv) < 3:
    print("Veuillez fournir le chemin du fichier JSON et au moins une clé comme arguments.")
    sys.exit(1)

jsonFileArgs = sys.argv[1]
keys_to_extract = sys.argv[2:]

filename = os.path.basename(jsonFileArgs).split(".")[0]

try:
    with open(jsonFileArgs, "r") as file:
        data = json.load(file)

    # Extraire les éléments avec les clés spécifiées
    items_to_keep, extracted_items = extract_items_with_keys(data, keys_to_extract)

    # Enregistrer les éléments extraits dans un nouveau fichier JSON
    with open(f"extracted_{filename}.json", "w") as file:
        json.dump(extracted_items, file, indent=4)

    # Enregistrer les éléments restants dans le fichier d'origine
    with open(jsonFileArgs, "w") as file:
        json.dump(items_to_keep, file, indent=4)

    print(f"Fichier traité avec succès. Nouveau fichier créé : 'extracted_{filename}.json'")

except FileNotFoundError:
    print(f"Erreur : Le fichier '{jsonFileArgs}' n'a pas été trouvé.")
except json.JSONDecodeError:
    print(f"Erreur : Le contenu du fichier '{jsonFileArgs}' n'est pas un JSON valide.")

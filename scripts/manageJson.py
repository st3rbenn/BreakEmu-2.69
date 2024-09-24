import os
import json
import sys


def remove_keys_from_dict(dict_data, keys):
    """
    Fonction récursive pour supprimer des clés à tous les niveaux d'un dictionnaire.
    """
    if isinstance(dict_data, dict):
        for key in keys:
            dict_data.pop(key, None)
        for k, v in dict_data.items():
            remove_keys_from_dict(v, keys)
    elif isinstance(dict_data, list):
        for item in dict_data:
            remove_keys_from_dict(item, keys)
    return dict_data


# Vérifier si le chemin du fichier JSON est fourni
if len(sys.argv) <= 1:
    print("Veuillez fournir le chemin du fichier JSON comme argument.")
    sys.exit(1)

json_file_args = sys.argv[1]
keys_to_remove = ["$index", "$typeId"]
print(f"Clés à supprimer : {keys_to_remove}")
io_file = f"../src/breakEmu_API/data/{json_file_args}.json"



try:
    with open(io_file, "r") as file:
        data = json.load(file)
        updated_data = remove_keys_from_dict(data, keys_to_remove)
        newData = json.dumps(updated_data, indent=4)

    with open(io_file, "w") as file:
        file.write(newData)
    print(
        f"Fichier '{io_file}' traité avec succès. Nouveau fichier créé : '{json_file_args}.json'"
    )

except FileNotFoundError:
    print(f"Erreur : Le fichier '{io_file}' n'a pas été trouvé.")
except json.JSONDecodeError:
    print(f"Erreur : Le contenu du fichier '{io_file}' n'est pas un JSON valide.")

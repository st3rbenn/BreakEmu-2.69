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

jsonFileArgs = sys.argv[1]

filename = jsonFileArgs.split('/')[4].split('.')[0]

known_keys_to_remove = ["$index", "$typeId"]
keys_to_remove = ["typeId"]


try:
    with open(jsonFileArgs, 'r') as file:
        data = json.load(file)
        updated_data = remove_keys_from_dict(data, keys_to_remove)
        newData = json.dumps(updated_data, indent=4)
  
    with open('new' + filename + '.json', 'w') as file:
        file.write(newData)
    print(f"Fichier '{jsonFileArgs}' traité avec succès. Nouveau fichier créé : 'new{filename}.json'")

except FileNotFoundError:
    print(f"Erreur : Le fichier '{jsonFileArgs}' n'a pas été trouvé.")
except json.JSONDecodeError:
    print(f"Erreur : Le contenu du fichier '{jsonFileArgs}' n'est pas un JSON valide.")

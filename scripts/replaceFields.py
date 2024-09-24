import json
import sys



def load_json_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{file_path}' n'a pas été trouvé.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Erreur : Le contenu du fichier '{file_path}' n'est pas un JSON valide.")
        sys.exit(1)


def replace_field_with_i18n(data, i18n_data):
    for d in data:
        for key in keys_to_change:
            if key in d and str(d[key]) in i18n_data:
                d[key] = i18n_data[str(d[key])]
                print(f"Remplacement effectué pour la clé '{key}' avec la valeur '{d[key]}'.")


if len(sys.argv) <= 1:
    print("Veuillez fournir le chemin du fichier JSON des sorts comme argument.")
    sys.exit(1)

keys_to_change = sys.argv[1].split(',')
print(f"Clés à remplacer : {keys_to_change}")
jsonFileArgs = sys.argv[2]
i18n_data = f"../src/breakEmu_API/data/i18n_fr.json"
i18n_data = load_json_file(i18n_data)

filename = f"../src/breakEmu_API/data/{jsonFileArgs}.json"
output_file = f"../src/breakEmu_API/data/{jsonFileArgs}.json"


data = load_json_file(filename)

replace_field_with_i18n(data, i18n_data)

with open(output_file, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, indent=4)


print(f"Fichier traité avec succès. Nouveau fichier créé : '{output_file}'")

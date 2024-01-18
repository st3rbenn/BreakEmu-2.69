import json
import sys


keys_to_change = ["nameId"]


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


if len(sys.argv) <= 1:
    print("Veuillez fournir le chemin du fichier JSON des sorts comme argument.")
    sys.exit(1)

data_json_path = sys.argv[1]
i18n_data = load_json_file("src/breakEmu_API/data/i18n_fr.json")
data = load_json_file(data_json_path)

replace_field_with_i18n(data, i18n_data)

output_file_path = "updated_" + data_json_path.split("/")[-1]
with open(output_file_path, "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, indent=4)

print(f"Fichier traité avec succès. Nouveau fichier créé : '{output_file_path}'")

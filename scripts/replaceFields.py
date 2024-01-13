import json
import sys

def load_json_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Erreur : Le fichier '{file_path}' n'a pas été trouvé.")
        sys.exit(1)
    except json.JSONDecodeError:
        print(f"Erreur : Le contenu du fichier '{file_path}' n'est pas un JSON valide.")
        sys.exit(1)

def replace_field_with_i18n(spell_data, i18n_data):
    for spell in spell_data:
        for key in ['nameId', 'descriptionId', 'typeId']:
            if key in spell and str(spell[key]) in i18n_data:
                spell[key] = i18n_data[str(spell[key])]

if len(sys.argv) <= 1:
    print("Veuillez fournir le chemin du fichier JSON des sorts comme argument.")
    sys.exit(1)

spell_json_path = sys.argv[1]
i18n_data = load_json_file('src/breakEmu_API/data/i18n_fr.json')
spell_data = load_json_file(spell_json_path)

replace_field_with_i18n(spell_data, i18n_data)

output_file_path = 'updated_' + spell_json_path.split('/')[-1]
with open(output_file_path, 'w', encoding='utf-8') as outfile:
    json.dump(spell_data, outfile, indent=4)

print(f"Fichier traité avec succès. Nouveau fichier créé : '{output_file_path}'")

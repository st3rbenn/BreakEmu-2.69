import json


def count_objects_in_json(file_path):
    try:
        with open(file_path, "r") as file:
            data = json.load(file)
            if isinstance(data, list):
                return len(data)
            elif isinstance(data, dict):
                return 1
            else:
                return 0
    except Exception as e:
        print(f"Error reading the JSON file: {e}")
        return 0


# Chemin vers le fichier JSON
file_path = "src/breakEmu_API/data/skills.json"

# Compter les objets dans le fichier JSON
count = count_objects_in_json(file_path)
print(f"Number of objects in the JSON file: {count}")

import os
import sys
import subprocess

def convert_dlm_to_json(dlm_file_path):
    # Remplacez cette ligne par la commande pour lancer votre script de conversion
    # Par exemple : subprocess.run(["python", "votre_script_conversion.py", dlm_file_path])
    # print(dlm_file_path)
    try:
        # print(dlm_file_path)
        subprocess.run(["python3", "/Users/anthonincolas/Desktop/dofus/PyDofus/dlm_unpack.py", dlm_file_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Erreur lors de l'exécution du script d'extraction pour {dlm_file_path}: {e}")
    pass

def find_and_convert_dlm_files(folder_path):
    for root, dirs, files in os.walk(folder_path):
        for filename in files:
            if filename.endswith(".dlm"):
                file_path = os.path.join(root, filename)
                convert_dlm_to_json(file_path)
                print(f"Converted: {file_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <folder_path>")
        sys.exit(1)

    folder_path = sys.argv[1]
    # convert_dlm_to_json("/Users/anthonincolas/Desktop/dofus/mapDofus/maps6.d2p/6/177478666.dlm")
    find_and_convert_dlm_files(folder_path)
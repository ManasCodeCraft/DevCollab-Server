import os
import re

def modify_js_files(root_dir):
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules directory
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')
        
        for filename in filenames:
            if filename.endswith('.js'):
                file_path = os.path.join(dirpath, filename)
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()

                # Regex to find findByIdAndUpdate and add { new: true } if not already present
                updated_content = re.sub(
                    r'(findByIdAndUpdate\s*\([^,]+,[^,]+)(\))',
                    r'\1, { new: true }\2',
                    content
                )

                if content != updated_content:
                    with open(file_path, 'w', encoding='utf-8') as file:
                        file.write(updated_content)
                    print(f"Modified: {file_path}")

if __name__ == "__main__":
    # Start the search from the directory where the script is running
    current_directory = os.path.dirname(os.path.abspath(__file__))
    modify_js_files(current_directory)

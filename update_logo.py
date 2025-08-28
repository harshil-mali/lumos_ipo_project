import os
import mysql.connector
import re

# Folder path
logo_folder = r"C:\Users\govind\Desktop\copy_\static\logos"

# Connect to MySQL
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="chittorghar"
)
cursor = conn.cursor()

updated = 0
not_found = []

def clean_name(name):
    # File name ko clean karne ka function
    name = name.replace('_', ' ')
    name = re.sub(r'\bLtd\b\.?', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\bIPO\b\.?', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s+', ' ', name)  # Extra spaces hataayein
    return name.strip()

for filename in os.listdir(logo_folder):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        raw_name = os.path.splitext(filename)[0]
        cleaned_name = clean_name(raw_name)

        query = "UPDATE ipo_details SET logo_file = %s WHERE company_name LIKE %s"
        like_value = f"%{cleaned_name}%"
        cursor.execute(query, (filename, like_value))

        if cursor.rowcount > 0:
            updated += 1
        else:
            not_found.append(cleaned_name)

conn.commit()
cursor.close()
conn.close()

print(f"✅ Total companies updated: {updated}")
if not_found:
    print("❌ Companies not matched in DB:")
    for name in not_found:
        print(f"- {name}")

import pandas as pd
import json

# Load the Excel file
file_path = '/mnt/data/constituency-names-languages.xlsx'
df = pd.read_excel(file_path)

# Rename columns and handle 'Alternative Names'
df = df.rename(columns={
    'State': 'State/UT', 
    'PC Code': 'PC_Code', 
    'PC Name': 'PCName', 
    'Alternative Names': 'Alternate Spellings'
})

# Convert 'Alternate Spellings' to an array of strings if not NaN, else make it an empty array
df['Alternate Spellings'] = df['Alternate Spellings'].apply(lambda x: x.split(', ') if isinstance(x, str) else [])

# Convert DataFrame to JSON
json_output = df[['State/UT', 'PC_Code', 'PCName', 'Alternate Spellings']].to_dict(orient='records')

# Save the JSON output to a file
json_file_path = '/mnt/data/constituency_data.json'
with open(json_file_path, 'w') as file:
    json.dump(json_output, file, indent=4)

import os
import csv
import json
from collections import defaultdict

# Paths to the directories
base_dir = r"c:\Users\iamaa\Downloads\uidai data hackathon"
dirs = {
    "enrolment": os.path.join(base_dir, "given dataset", "aadhar_enrolment"),
    "biometric": os.path.join(base_dir, "given dataset", "aadhar_biometric"),
    "demographic": os.path.join(base_dir, "given dataset", "aadhar_demographic")
}
pincode_file = os.path.join(base_dir, "external dataset", "india_pincode.csv")

# 1. Load Pincode Mapping (Pincode -> Set of Locations)
pincode_locations = defaultdict(set)

print("Loading Pincode Directory...")
if os.path.exists(pincode_file):
    with open(pincode_file, 'r', encoding='utf-8', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            code = row.get('pincode', '').strip()
            # The CSV header has 'Taluk' for the area name based on inspection
            # Some rows might have 'Officename' if the format varies, but inspection showed 'Taluk'
            location = row.get('Taluk', '').strip()
            
            if code and location and location != 'N/A':
                pincode_locations[code].add(location)
else:
    print(f"Warning: Pincode file not found at {pincode_file}")

# Convert sets to sorted lists for JSON consistency
pincode_map_final = {k: sorted(list(v)) for k, v in pincode_locations.items()}
print(f"Loaded locations for {len(pincode_map_final)} pincodes.")


# 2. Data structure: data_map[month][pincode] = { state, district, metrics... }
data_map = defaultdict(lambda: defaultdict(lambda: {
    "state": "",
    "district": "",
    "enrolment": {"age_0_5": 0, "age_5_17": 0, "age_18_above": 0},
    "biometric": {"age_5_17": 0, "age_17_above": 0},
    "demographic": {"age_5_17": 0, "age_17_above": 0}
}))

def parse_int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return 0

def process_files(category, folder_path):
    if not os.path.exists(folder_path):
        print(f"Directory not found: {folder_path}")
        return

    for filename in os.listdir(folder_path):
        if filename.endswith(".csv"):
            file_path = os.path.join(folder_path, filename)
            print(f"Processing {category}: {filename}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Parse date to obtain YYYY-MM
                    date_str = row.get('date', '')
                    if not date_str: continue
                    
                    try:
                        # Assuming date format DD-MM-YYYY
                        day, month, year = date_str.split('-')
                        month_key = f"{year}-{month}"
                    except ValueError:
                        continue # Skip bad dates

                    pincode = row.get('pincode', '').strip()
                    if not pincode: continue

                    # Initialize entry if new
                    entry = data_map[month_key][pincode]
                    
                    # Update metadata (State/District) if not present
                    if not entry["state"] and row.get("state"):
                        entry["state"] = row.get("state")
                    if not entry["district"] and row.get("district"):
                        entry["district"] = row.get("district")

                    # Aggregate Metrics based on category
                    if category == "enrolment":
                        entry["enrolment"]["age_0_5"] += parse_int(row.get("age_0_5", 0))
                        entry["enrolment"]["age_5_17"] += parse_int(row.get("age_5_17", 0))
                        entry["enrolment"]["age_18_above"] += parse_int(row.get("age_18_greater", 0))
                    
                    elif category == "biometric":
                        entry["biometric"]["age_5_17"] += parse_int(row.get("bio_age_5_17", 0))
                        entry["biometric"]["age_17_above"] += parse_int(row.get("bio_age_17_", 0))
                        
                    elif category == "demographic":
                        entry["demographic"]["age_5_17"] += parse_int(row.get("demo_age_5_17", 0))
                        entry["demographic"]["age_17_above"] += parse_int(row.get("demo_age_17_", 0))

# Process all categories
process_files("enrolment", dirs["enrolment"])
process_files("biometric", dirs["biometric"])
process_files("demographic", dirs["demographic"])

# 3. Write Output to JSON files
output_dir = os.path.join(base_dir, "processed_json_monthly")
os.makedirs(output_dir, exist_ok=True)

for month, pincodes_data in data_map.items():
    output_filename = f"aadhaar_data_{month}.json"
    output_path = os.path.join(output_dir, output_filename)
    
    # Convert dict to list for JSON array
    json_list = []
    for pincode, data in pincodes_data.items():
        # Get Locations list from our loaded map
        locations_list = pincode_map_final.get(pincode, [])
        pass
        
        record = {
            "pincode": pincode,
            "month": month,
            "state": data["state"],
            "district": data["district"],
            "locations": locations_list, # Added locations field
            "data": {
                "enrolment": data["enrolment"],
                "biometric_update": data["biometric"],
                "demographic_update": data["demographic"]
            }
        }
        json_list.append(record)
    
    with open(output_path, 'w', encoding='utf-8') as json_file:
        json.dump(json_list, json_file, indent=2)
    
    print(f"Created {output_filename} with {len(json_list)} records.")

print("Processing complete.")

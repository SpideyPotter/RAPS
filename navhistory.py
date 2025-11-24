import requests
import pandas as pd
import re
import time

def get_regular_plan_history(fund_name_input):
    """
    Takes a fund name (e.g., 'Axis Large Cap Fund - Gr'), finds the 
    Regular Plan version, fetches history, saves to CSV, and returns DF.
    """
    
    # --- STEP 1: PARSE INPUT & DETERMINE OPTION (Growth vs IDCW) ---
    # Default to Growth if not specified, but check for specific keywords
    option_type = "Growth" # Default
    if re.search(r'IDCW|Dividend', fund_name_input, re.IGNORECASE):
        option_type = "IDCW"
    
    # --- STEP 2: CLEAN THE NAME FOR SEARCHING ---
    # Remove specific suffixes to get the "Base Name" for broader searching
    # Removes: - Gr, -Gr, - IDCW, -IDCW, - Growth, etc.
    clean_name = re.sub(r'\s*-\s*(Gr|Growth|IDCW|Dividend).*$', '', fund_name_input, flags=re.IGNORECASE).strip()
    
    print(f"1. Processing: '{fund_name_input}'")
    print(f"   -> Base Name: '{clean_name}'")
    print(f"   -> Target Plan: Regular Plan - {option_type}")

    # --- STEP 3: SEARCH FOR THE SCHEME CODE ---
    search_url = f"https://api.mfapi.in/mf/search?q={clean_name}"
    try:
        response = requests.get(search_url)
        response.raise_for_status()
        search_results = response.json()
    except Exception as e:
        print(f"Error searching for fund: {e}")
        return None

    # --- STEP 4: FILTER FOR 'REGULAR' + OPTION ---
    target_code = None
    target_scheme_name = None

    for item in search_results:
        name = item['schemeName']
        
        # LOGIC:
        # 1. Must contain "Regular" (To bypass Direct plans)
        # 2. Must contain the Option Type (Growth or IDCW)
        # 3. Must NOT contain "Direct" (Safety check)
        is_regular = "Regular" in name and "Direct" not in name
        
        # Check if it matches our desired option (Growth or IDCW)
        if option_type == "IDCW":
            # specific check because IDCW is sometimes listed as Dividend in older names
            matches_option = "IDCW" in name or "Dividend" in name
        else:
            matches_option = "Growth" in name

        if is_regular and matches_option:
            # Found a match!
            target_code = item['schemeCode']
            target_scheme_name = name
            break
    
    if not target_code:
        print(f"❌ Could not find a 'Regular - {option_type}' plan for '{clean_name}'")
        return None

    print(f"   -> Match Found: {target_scheme_name} (Code: {target_code})")

    # --- STEP 5: FETCH NAV HISTORY ---
    nav_url = f"https://api.mfapi.in/mf/{target_code}"
    try:
        nav_response = requests.get(nav_url)
        nav_data = nav_response.json()
    except Exception as e:
        print(f"Error fetching NAV data: {e}")
        return None

    if nav_data.get('status') == 'False' or not nav_data.get('data'):
        print("No data available for this fund.")
        return None

    # --- STEP 6: PROCESS TO DATAFRAME & SAVE CSV ---
    # Extract just the historical data list
    history_list = nav_data['data']
    
    df = pd.DataFrame(history_list)
    
    # Data Cleaning
    df['date'] = pd.to_datetime(df['date'], format='%d-%m-%Y')
    df['nav'] = df['nav'].astype(float)
    df = df.sort_values('date', ascending=False) # Ensure latest first

    # Create a safe filename (remove spaces/special chars)
    # User requested to keep the name as is (e.g. Axis Large Cap Fund - Gr)
    # We just replace spaces with underscores for safety
    safe_filename = fund_name_input.replace(' ', '_').replace('/', '_')
    filename = f"{safe_filename}.csv"
    
    # Also ensure the directory exists
    import os
    db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Database/NAV_History')
    os.makedirs(db_dir, exist_ok=True)
    
    full_path = os.path.join(db_dir, filename)
    df.to_csv(full_path, index=False)
    
    print(f"✅ Success! Data saved to: {full_path}")
    print(f"   Latest NAV: ₹{df.iloc[0]['nav']} (on {df.iloc[0]['date'].strftime('%Y-%m-%d')})")
    print("-" * 50)
    
    return df

# --- EXAMPLE USAGE ---
if __name__ == "__main__":
    # 1. Growth Example
    df1 = get_regular_plan_history("Axis Large Cap Fund - Gr")

    # 2. IDCW Example
    df2 = get_regular_plan_history("Axis Large & Mid Cap Fund - IDCW")

    # 3. Just checking the dataframe output
    if df1 is not None:
        print("\nFirst 5 rows of dataframe:")
        print(df1.head())
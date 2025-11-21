import json
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Load the scraped data from our JSON file
def load_data():
    try:
        with open('fund_data.json', 'r', encoding='utf-8') as f:
            # We assume for this demo that the JSON file contains ONE fund's data.
            # In a real app, this would be a list of funds.
            data = json.load(f)
            return data
    except FileNotFoundError:
        print("ERROR: fund_data.json not found. Please run scraper.py first.")
        return None
    except json.JSONDecodeError:
        print("ERROR: fund_data.json is corrupted or empty.")
        return None

# --- API Routes ---

@app.route('/api/search')
def api_search():
    """Powers the search bar dropdown."""
    query = request.args.get('q', '').lower()
    
    # For this demo, we just return the one fund we scraped if it matches
    # In a real app, you'd have a list of funds to search.
    fund_data = load_data()
    fund_name = fund_data.get("basic_info", {}).get("fund_name", "")
    
    if query and query in fund_name.lower():
        return jsonify([fund_name])
    
    # Return a mock list for a better demo
    mock_funds = [
        "Axis Aggressive Hybrid Fund - Gr",
        "Axis Arbitrage Fund - Regular Gr",
        "Axis Balanced Advantage Fund - Gr",
        "HDFC Balanced Advantage Fund",
        "ICICI Prudential Bluechip Fund"
    ]
    
    results = [fund for fund in mock_funds if query in fund.lower()]
    return jsonify(results)

# --- Page Routes ---

@app.route('/')
def home():
    """Renders the homepage (index.html)."""
    return render_template('index.html')

@app.route('/fund/<path:fund_name>')
def fund_details(fund_name):
    """
    Renders the fund details page.
    In this demo, it ignores the fund_name and just loads
    the one fund we have in fund_data.json.
    """
    fund_data = load_data()
    
    if not fund_data:
        return "Error: Could not load fund data. Please run scraper.py.", 500
        
    # Pass the entire data object to the template
    return render_template('fund_details.html', fund=fund_data)

if __name__ == '__main__':
    app.run(debug=True)
import pandas as pd
from yahooquery import Ticker
import time
import json

def get_full_fund_details(fund_ticker: str) -> dict:
    """
    Fetches all available fund details from the 'topHoldings',
    'fundProfile', 'summaryDetail', 'fundPerformance', 
    'assetProfile', and 'esg_scores' modules.
    """
    print(f"Attempting to fetch all data for: {fund_ticker}...")
    
    try:
        fund = Ticker(fund_ticker, asynchronous=True)
        
        # --- 1. Get All Data Objects Concurrently (with CORRECTED module name) ---
        
        # ------------------- THE FIX IS HERE -------------------
        # We changed "fundHoldingInfo" to "topHoldings"
        module_string = (
            "topHoldings fundProfile summaryDetail fundPerformance "
            "assetProfile esgScores quoteType"
        )
        all_data = fund.get_modules(module_string)
        # ------------------- END OF FIX -------------------

        if not all_data or fund_ticker not in all_data:
             return {"error": f"Ticker '{fund_ticker}' not found or no data available."}
        
        data = all_data[fund_ticker]
        
        # --- 2. Extract Data from Modules (with CORRECTED module name) ---
        
        # ------------------- THE FIX IS HERE -------------------
        holding_data = data.get('topHoldings', {})
        # ------------------- END OF FIX -------------------
        
        profile_data = data.get('fundProfile', {})
        summary_data = data.get('summaryDetail', {})
        performance_data = data.get('fundPerformance', {})
        asset_profile_data = data.get('assetProfile', {})
        esg_data = data.get('esgScores', {})
        quote_type_data = data.get('quoteType', {})

        # We can now be more specific in our error checking
        if not holding_data:
            return {"error": f"Critical data 'topHoldings' is missing for '{fund_ticker}'."}
        if not profile_data:
            print("Warning: 'fundProfile' data is missing. Some details will be N/A.")


        # --- 3. Get Fund Name ---
        fund_name = profile_data.get('legalName')
        if not fund_name:
            fund_name = quote_type_data.get('longName', 'Unknown Fund Name')

        # --- 4. Process Manager, Family, & Profile ---
        fund_family = profile_data.get('family', 'N/A')
        fund_category = profile_data.get('categoryName', 'N/A')
        mgmt_info = profile_data.get('managementInfo', {})
        manager = {
            "name": mgmt_info.get('managerName', 'N/A'),
            "bio": mgmt_info.get('managerBio', 'N/A'),
        }
        
        start_date_ts = mgmt_info.get('startDate')
        if start_date_ts:
            manager['start_date'] = time.strftime('%Y-%m-%d', time.gmtime(start_date_ts))
        else:
            manager['start_date'] = 'N/A'
            
        fund_description = asset_profile_data.get('longBusinessSummary', 'No description available.')

        # --- 5. Process Summary Data (NAV, AUM, etc.) ---
        # Safely get expense ratio
        expense_ratio = 0.0
        if profile_data.get('feesExpenses'):
             expense_ratio = profile_data['feesExpenses'].get('expenseRatio', 0)

        summary_stats = {
            "nav": summary_data.get('navPrice', 0),
            "aum": summary_data.get('totalAssets', 0),
            "ytd_return": summary_data.get('ytdReturn', 0) * 100,
            "expense_ratio": expense_ratio * 100
        }
        
        # --- 6. Process Performance Data ---
        trailing_returns = performance_data.get('trailingReturns', {}) or {}
        risk_stats = performance_data.get('riskStatistics', {}) or {}
        performance = {
            "1y_return": trailing_returns.get('oneYear', 0) * 100,
            "3y_return": trailing_returns.get('threeYear', 0) * 100,
            "5y_return": trailing_returns.get('fiveYear', 0) * 100,
            "alpha": risk_stats.get('alpha', 0),
            "beta": risk_stats.get('beta', 0),
            "sharpe_ratio": risk_stats.get('sharpeRatio', 0)
        }

        # --- 7. Process ESG Scores ---
        esg = {
            "total_score": esg_data.get('totalEsg', 'N/A'),
            "environment_score": esg_data.get('environmentScore', 'N/A'),
            "social_score": esg_data.get('socialScore', 'N/A'),
            "governance_score": esg_data.get('governanceScore', 'N/A')
        }
        
        # --- 8. Process Asset Allocation ---
        allocation = {
            "stock": holding_data.get('stockPosition', 0) * 100,
            "cash": holding_data.get('cashPosition', 0) * 100,
            "bond": holding_data.get('bondPosition', 0) * 100,
            "other": holding_data.get('otherPosition', 0) * 100,
        }

        # --- 9. Process Sector Weightings ---
        sectors = []
        sector_data = holding_data.get('sectorWeightings', [])
        if sector_data:
            for item in sector_data:
                for key, value in item.items():
                    sectors.append({"name": key.replace("_", " ").title(), "percent": value * 100})

        # --- 10. Process Top Holdings ---
        holdings = []
        holdings_data = holding_data.get('holdings', [])
        if holdings_data:
            df = pd.DataFrame(holdings_data)
            df = df[['holdingName', 'holdingPercent']]
            df.rename(columns={'holdingName': 'name', 'holdingPercent': 'percent'}, inplace=True)
            df['percent'] = df['percent'] * 100
            holdings = df.to_dict('records')

        # --- 11. Assemble the Final JSON Response ---
        return {
            "fund_name": fund_name,
            "fund_family": fund_family,
            "fund_category": fund_category,
            "fund_description": fund_description,
            "manager_info": manager,
            "summary_stats": summary_stats,
            "performance": performance,
            "esg_scores": esg,
            "asset_allocation": allocation,
            "sector_weighting": sectors,
            "top_holdings": holdings,
        }

    except Exception as e:
        # This will now catch any *new* errors
        print(f"\nAn unexpected error occurred: {e}")
        return {"error": f"An unexpected error occurred: {str(e)}"}

# --- This allows you to test this file directly ---
if __name__ == "__main__":
    ticker = "f0000043lz.BO"
    # ticker = "0P000188F3.BO" # Axis Bluechip
    
    fund_details = get_full_fund_details(ticker)
    
    print("\n--- FINAL JSON OUTPUT ---")
    print(json.dumps(fund_details, indent=2))
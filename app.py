from flask import Flask, render_template, jsonify, request
import json
import os
import pandas as pd
import numpy as np
import navhistory
import prediction_models
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/funds')
def get_funds():
    # Read funds from Funds.txt
    funds_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Funds.txt')
    funds = []
    if os.path.exists(funds_file):
        with open(funds_file, 'r') as f:
            funds = [line.strip() for line in f if line.strip()]
    return json.dumps(funds)

@app.route('/fund/<fund_name>')
def fund_details(fund_name):
    # Construct expected filename: lowercase, spaces to underscores
    safe_name = fund_name.lower().replace(' ', '_')
    # Try to find a matching file in Database
    db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Database')
    json_path = os.path.join(db_dir, f"{safe_name}.json")
    
    data = None
    
    # 1. Try exact match
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            data = json.load(f)
    else:
        # 2. Try finding a file that *starts with* the safe name (handling suffixes like -gr, -regular, etc.)
        # or contains the name
        found_file = None
        for f_name in os.listdir(db_dir):
            if f_name.endswith('.json'):
                if safe_name in f_name.lower():
                    found_file = os.path.join(db_dir, f_name)
                    break
        
        if found_file:
            with open(found_file, 'r') as f:
                data = json.load(f)
        else:
            # 3. Fallback to Scraper
            print(f"Fund '{fund_name}' not found in Database. Scraping...")
            try:
                from scraper import scrape_fund_data
                # We save it to the safe_name to make it easier to find next time
                data = scrape_fund_data(fund_name, save_to_file=True)
            except Exception as e:
                print(f"Error scraping fund: {e}")
                return f"Error fetching data for {fund_name}: {str(e)}", 500

    if not data:
        return "Fund not found", 404

    # --- NEW: Fetch NAV History & Predictions ---
    nav_data_for_template = None
    
    try:
        # 1. Check if we already have the NAV CSV
        # Filename logic from navhistory.py: fund_name_input.replace(' ', '_').replace('/', '_') + ".csv"
        safe_nav_filename = fund_name.replace(' ', '_').replace('/', '_') + ".csv"
        nav_db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Database/NAV_History')
        nav_csv_path = os.path.join(nav_db_dir, safe_nav_filename)
        
        df_nav = None
        
        if os.path.exists(nav_csv_path):
            print(f"Found existing NAV history: {nav_csv_path}")
            df_nav = pd.read_csv(nav_csv_path)
            # Ensure date is datetime
            df_nav['date'] = pd.to_datetime(df_nav['date'])
        else:
            print(f"NAV history not found. Fetching for: {fund_name}")
            # Fetch fresh
            df_nav = navhistory.get_regular_plan_history(fund_name)
            
        if df_nav is not None and not df_nav.empty:
            # Generate Predictions
            # We need a dataframe with 'NAV' column (uppercase) for the prediction model
            # The scraper returns 'nav' (lowercase). Let's standardize.
            df_nav.rename(columns={'nav': 'NAV', 'date': 'Date'}, inplace=True)
            
            # Sort by Date ascending for the model (it expects chronological order)
            df_nav = df_nav.sort_values('Date', ascending=True)
            
            # Set index to Date as expected by prediction_models
            df_nav.set_index('Date', inplace=True)
            
            # --- RUN PREDICTIONS ---
            # 1. Linear Regression
            recent_data = df_nav.tail(365).copy()
            pred_linear = prediction_models.predict_nav_linear(recent_data, days=30)
            
            # 2. ARIMA
            # Use more history for ARIMA to capture seasonality/trends better if possible
            pred_arima = prediction_models.predict_nav_arima(df_nav.tail(500), days=30)
            
            # 3. LSTM
            # LSTM needs scaling and sequence length, handled inside the function
            # It might return None if not enough data
            pred_lstm = prediction_models.predict_nav_lstm(df_nav.tail(1000), days=30)
            
            # --- GENERATE CHART ---
            import matplotlib
            matplotlib.use('Agg')
            import matplotlib.pyplot as plt
            import io
            import base64
            
            display_history = df_nav.tail(180).copy()
            last_date = display_history.index[-1]
            last_val = display_history['NAV'].iloc[-1]
            
            plt.figure(figsize=(10, 6))
            
            # Plot Historical
            plt.plot(display_history.index, display_history['NAV'], label='Historical NAV', color='#005eb8', linewidth=2)
            plt.fill_between(display_history.index, display_history['NAV'], alpha=0.1, color='#005eb8')
            
            # Plot Linear Prediction
            if pred_linear:
                dates = [last_date] + list(pred_linear['future_dates'])
                values = [last_val] + list(pred_linear['future_predictions'].flatten())
                plt.plot(dates, values, label='Linear Regression', color='#d32f2f', linestyle='--', linewidth=2)
            
            # Plot ARIMA Prediction
            if pred_arima:
                dates = [last_date] + list(pred_arima['future_dates'])
                values = [last_val] + list(pred_arima['future_predictions'].flatten())
                plt.plot(dates, values, label='ARIMA', color='#2e7d32', linestyle='-.', linewidth=2)
                
            # Plot LSTM Prediction
            if pred_lstm:
                dates = [last_date] + list(pred_lstm['future_dates'])
                values = [last_val] + list(pred_lstm['future_predictions'].flatten())
                plt.plot(dates, values, label='LSTM (Deep Learning)', color='#7b1fa2', linestyle=':', linewidth=2)
            
            plt.title('NAV Predictions: Linear vs ARIMA vs LSTM', fontsize=12, pad=10)
            plt.xlabel('Date', fontsize=10)
            plt.ylabel('NAV (₹)', fontsize=10)
            plt.legend(loc='upper left', frameon=True, fontsize=9)
            plt.grid(True, linestyle=':', alpha=0.6)
            plt.tight_layout()
            
            # Save
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            chart_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
            
            nav_data = {
                'chart_image': chart_base64,
                'latest_nav': display_history['NAV'].iloc[-1]
            }
            
    except Exception as e:
        print(f"Error processing NAV/Predictions: {e}")
        import traceback
        traceback.print_exc()
        # nav_data remains None if error occurs
        pass

    return render_template('fund_details.html', fund=data, nav_data=nav_data)

@app.route('/calculator')
def calculator():
    return render_template('calculator.html')

@app.route('/api/compare', methods=['POST'])
def compare_funds():
    try:
        req_data = request.get_json()
        fund_names = req_data.get('funds', [])
        
        if not fund_names or len(fund_names) < 2:
            return jsonify({'error': 'At least 2 funds required'}), 400
            
        results = {
            'funds': [],
            'charts': {},
            'intersection': [],
            'diversity_score': 0,
            'diversity_msg': ''
        }
        
        dfs = {} # Store dataframes for analysis
        
        # 1. Fetch Data for each fund
        for f_name in fund_names:
            # A. Basic Info (JSON)
            safe_name = f_name.lower().replace(' ', '_')
            db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Database')
            
            # Try finding file
            json_path = None
            for existing in os.listdir(db_dir):
                if existing.lower().startswith(safe_name) and existing.endswith('.json'):
                    json_path = os.path.join(db_dir, existing)
                    break
            
            fund_data = {}
            if json_path:
                with open(json_path, 'r') as f:
                    fund_data = json.load(f)
            else:
                # Scrape on the fly if needed (simplified for speed, maybe skip or use basic)
                # For now, let's assume if not found we might return empty or try to scrape
                try:
                    from scraper import scrape_fund_data
                    fund_data = scrape_fund_data(f_name, save_to_file=True)
                except:
                    pass
            
            # Extract key metrics
            scheme_details = fund_data.get('scheme_details', {})
            info = {
                'name': fund_data.get('selected_fund', f_name),
                'nav': fund_data.get('basic_info', {}).get('nav', 'N/A'),
                'aum': fund_data.get('basic_info', {}).get('aum', 'N/A'),
                'manager': ', '.join([m['name'] for m in fund_data.get('fund_managers', [])]),
                'category': scheme_details.get('Category', 'N/A'),
                'benchmark': scheme_details.get('Benchmark', 'N/A'),
                'age': scheme_details.get('Age', 'N/A'),
                'expense_ratio': scheme_details.get('Expense Ratio', 'N/A'),
                'exit_load': scheme_details.get('Exit Load', 'N/A'),
                'sectors': fund_data.get('sector_holdings', {}),
                'holdings': list(fund_data.get('top_holdings', {}).keys())
            }
            results['funds'].append(info)
            
            # B. NAV History (CSV)
            try:
                safe_nav_filename = f_name.replace(' ', '_').replace('/', '_') + ".csv"
                nav_db_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Database/NAV_History')
                nav_csv_path = os.path.join(nav_db_dir, safe_nav_filename)
                
                df = None
                if os.path.exists(nav_csv_path):
                    df = pd.read_csv(nav_csv_path)
                    df['date'] = pd.to_datetime(df['date'])
                else:
                    df = navhistory.get_regular_plan_history(f_name)
                    if df is not None:
                        df['date'] = pd.to_datetime(df['date'])
                
                if df is not None and not df.empty:
                    df = df.sort_values('date')
                    df.set_index('date', inplace=True)
                    dfs[info['name']] = df
            except Exception as e:
                print(f"Error fetching NAV for {f_name}: {e}")

        # 2. Generate Charts
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import io
        import base64
        
        # --- A. Combined History Chart (NAV + Log Returns) ---
        if dfs:
            # 1. Prepare data (Clean sort, no reindexing with 0s)
            colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
            fund_colors = {name: colors[i % len(colors)] for i, name in enumerate(dfs.keys())}
            
            # 2. Create Subplots
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 10), sharex=True)
            
            for name, df in dfs.items():
                # Ensure sorted and datetime
                df.index = pd.to_datetime(df.index)
                df = df.sort_index()
                df = df[~df.index.duplicated(keep='first')]
                
                # Plot NAV directly
                # Matplotlib handles gaps (weekends) by connecting points, avoiding the drop to 0
                ax1.plot(df.index, df['nav'], label=name, color=fund_colors[name], linewidth=1.5)
                
                # Calculate and Plot Log Returns
                # Calculate on original data
                df['log_ret'] = np.log(df['nav'] / df['nav'].shift(1))
                df['log_ret'] = df['log_ret'].fillna(0)
                df['cum_log_ret'] = df['log_ret'].cumsum()
                
                ax2.plot(df.index, df['cum_log_ret'], label=name, color=fund_colors[name], linewidth=1.5)

            ax1.set_title('NAV History', fontsize=12)
            ax1.set_ylabel('NAV (₹)')
            ax1.grid(True, alpha=0.3)
            
            ax2.set_title('Cumulative Log Returns', fontsize=12)
            ax2.set_ylabel('Cumulative Log Return')
            ax2.set_xlabel('Date')
            ax2.grid(True, alpha=0.3)
            
            # Single Legend
            handles, labels = ax1.get_legend_handles_labels()
            fig.legend(handles, labels, loc='upper center', bbox_to_anchor=(0.5, 0.98), ncol=3, fontsize=10)
            
            plt.tight_layout(rect=[0, 0, 1, 0.95]) # Adjust for legend space
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            results['charts']['history_combined'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()

        # --- B. Combined Predictions Chart (NAV + Log Returns) ---
        if dfs:
            fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(10, 12), sharex=False) # sharex=False because x-axis might differ slightly if models fail
            
            colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
            
            # Track handles/labels for the single legend
            legend_elements = {} 
            
            for i, (name, df) in enumerate(dfs.items()):
                if df.empty: continue
                
                color = colors[i % len(colors)]
                recent = df.tail(365).copy()
                recent.rename(columns={'nav': 'NAV'}, inplace=True)
                
                # --- 1. NAV Predictions (ax1) ---
                # Plot History (Last 60 days)
                history_plot = recent.tail(60)
                line, = ax1.plot(history_plot.index, history_plot['NAV'], label=f"{name} (Hist)", color=color, alpha=0.6, linewidth=2)
                legend_elements[f"{name}"] = line # Base legend on fund name
                
                last_date = history_plot.index[-1]
                last_val = history_plot['NAV'].iloc[-1]

                # Linear
                try:
                    pred_lin = prediction_models.predict_nav_linear(recent, days=30)
                    if pred_lin:
                        dates = [last_date] + list(pred_lin['future_dates'])
                        pred_vals = pred_lin['future_predictions']
                        if hasattr(pred_vals, 'flatten'): pred_vals = pred_vals.flatten()
                        values = [last_val] + list(pred_vals)
                        ax1.plot(dates, values, linestyle='--', color=color, linewidth=1.5, alpha=0.7)
                except: pass

                # ARIMA
                try:
                    arima_data = df.tail(500).copy()
                    arima_data.rename(columns={'nav': 'NAV'}, inplace=True)
                    pred_arima = prediction_models.predict_nav_arima(arima_data, days=30)
                    if pred_arima:
                        dates = [last_date] + list(pred_arima['future_dates'])
                        pred_vals = pred_arima['future_predictions']
                        if hasattr(pred_vals, 'flatten'): pred_vals = pred_vals.flatten()
                        values = [last_val] + list(pred_vals)
                        ax1.plot(dates, values, linestyle='-.', color=color, linewidth=2)
                except: pass

                # LSTM
                try:
                    lstm_data = df.tail(1000).copy()
                    lstm_data.rename(columns={'nav': 'NAV'}, inplace=True)
                    pred_lstm = prediction_models.predict_nav_lstm(lstm_data, days=30)
                    if pred_lstm:
                        dates = [last_date] + list(pred_lstm['future_dates'])
                        pred_vals = pred_lstm['future_predictions']
                        if hasattr(pred_vals, 'flatten'): pred_vals = pred_vals.flatten()
                        values = [last_val] + list(pred_vals)
                        ax1.plot(dates, values, linestyle=':', color=color, linewidth=2.5)
                except: pass

                # --- 2. Log Return Predictions (ax2) ---
                if len(df) > 1:
                    df_temp = df.copy()
                    df_temp['log_ret'] = np.log(df_temp['nav'] / df_temp['nav'].shift(1))
                    df_temp['log_ret'] = df_temp['log_ret'].fillna(0)
                    df_temp['cum_log_ret'] = df_temp['log_ret'].cumsum()
                    
                    pred_df = pd.DataFrame({'NAV': df_temp['cum_log_ret']}, index=df_temp.index)
                    
                    history_plot = pred_df.tail(60).copy()
                    rebase_val = history_plot['NAV'].iloc[0]
                    history_plot['NAV'] = history_plot['NAV'] - rebase_val
                    
                    ax2.plot(history_plot.index, history_plot['NAV'], color=color, alpha=0.6, linewidth=2)
                    
                    last_date = history_plot.index[-1]
                    last_val = history_plot['NAV'].iloc[-1]
                    
                    # ARIMA
                    try:
                        pred_arima = prediction_models.predict_nav_arima(pred_df.tail(500), days=30)
                        if pred_arima:
                            dates = [last_date] + list(pred_arima['future_dates'])
                            pred_vals = pred_arima['future_predictions']
                            if hasattr(pred_vals, 'flatten'): pred_vals = pred_vals.flatten()
                            values = [last_val] + list(pred_vals - rebase_val)
                            ax2.plot(dates, values, linestyle='-.', color=color, linewidth=2)
                    except: pass
                        
                    # LSTM
                    try:
                        pred_lstm = prediction_models.predict_nav_lstm(pred_df.tail(1000), days=30)
                        if pred_lstm:
                            dates = [last_date] + list(pred_lstm['future_dates'])
                            pred_vals = pred_lstm['future_predictions']
                            if hasattr(pred_vals, 'flatten'): pred_vals = pred_vals.flatten()
                            values = [last_val] + list(pred_vals - rebase_val)
                            ax2.plot(dates, values, linestyle=':', color=color, linewidth=2.5)
                    except: pass

            ax1.set_title('30-Day NAV Forecast (Linear vs ARIMA vs LSTM)', fontsize=12)
            ax1.set_ylabel('NAV (₹)')
            ax1.grid(True, alpha=0.3)
            
            ax2.set_title('30-Day Cumulative Log Returns Forecast (ARIMA vs LSTM)', fontsize=12)
            ax2.set_ylabel('Cumulative Log Return (Rebased)')
            ax2.set_xlabel('Date')
            ax2.grid(True, alpha=0.3)
            
            # Custom Legend for Models + Funds
            # We want to show:
            # 1. Fund Colors
            # 2. Model Line Styles
            from matplotlib.lines import Line2D
            custom_lines = [Line2D([0], [0], color=c, lw=2) for c in colors[:len(dfs)]]
            custom_labels = list(dfs.keys())
            
            # Add Model Styles
            custom_lines.append(Line2D([0], [0], color='black', linestyle='-', lw=2, alpha=0.6))
            custom_labels.append('History')
            custom_lines.append(Line2D([0], [0], color='black', linestyle='--', lw=1.5))
            custom_labels.append('Linear')
            custom_lines.append(Line2D([0], [0], color='black', linestyle='-.', lw=2))
            custom_labels.append('ARIMA')
            custom_lines.append(Line2D([0], [0], color='black', linestyle=':', lw=2.5))
            custom_labels.append('LSTM')
            
            fig.legend(custom_lines, custom_labels, loc='upper center', bbox_to_anchor=(0.5, 0.98), ncol=4, fontsize=9)
            
            plt.tight_layout(rect=[0, 0, 1, 0.95])
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            results['charts']['predictions_combined'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
        # C. Heatmap (Correlation)
        if len(dfs) >= 2:
            # Align dataframes
            combined_nav = pd.DataFrame()
            for name, df in dfs.items():
                combined_nav[name] = df['nav']
            
            # Drop NaNs (different holidays etc)
            combined_nav.dropna(inplace=True)
            
            # Calculate daily returns
            returns = combined_nav.pct_change().dropna()
            
            # Correlation
            corr = returns.corr()
            
            plt.figure(figsize=(8, 6))
            plt.imshow(corr, cmap='coolwarm', interpolation='nearest', vmin=-1, vmax=1)
            plt.colorbar()
            plt.xticks(range(len(corr)), corr.columns, rotation=45, ha='right')
            plt.yticks(range(len(corr)), corr.columns)
            plt.title('Correlation Matrix (Daily Returns)', fontsize=12)
            
            # Add text annotations
            for i in range(len(corr)):
                for j in range(len(corr)):
                    plt.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", color="black")
            
            plt.tight_layout()
            
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            results['charts']['heatmap'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
            
            # Diversity Score (Inverse of average correlation)
            off_diag = corr.values[np.triu_indices_from(corr.values, k=1)]
            avg_corr = np.mean(off_diag) if len(off_diag) > 0 else 1.0
            
            diversity_score = int((1 - avg_corr) * 10)
            diversity_score = max(0, min(10, diversity_score)) # Clamp 0-10
            
            results['diversity_score'] = diversity_score
            if diversity_score >= 7:
                results['diversity_msg'] = "Excellent Diversity! These funds behave very differently."
            elif diversity_score >= 4:
                results['diversity_msg'] = "Moderate Diversity. Some overlap in behavior."
            else:
                results['diversity_msg'] = "Low Diversity. These funds move very similarly."

        # C2. Rolling Correlation Matrix (Over Time)
        if len(dfs) >= 2:
            # Use the already aligned combined_nav dataframe
            # Calculate rolling correlation for pairs
            window = 30  # 30-day rolling window
            
            # For visualization, we'll plot rolling correlation for each unique pair
            fund_names = list(dfs.keys())
            n_funds = len(fund_names)
            
            # Calculate number of unique pairs
            from itertools import combinations
            pairs = list(combinations(range(n_funds), 2))
            n_pairs = len(pairs)
            
            if n_pairs > 0 and len(combined_nav) > window:
                # Create rolling correlation series for each pair
                fig, ax = plt.subplots(figsize=(12, 6))
                
                colors_palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
                
                for idx, (i, j) in enumerate(pairs):
                    fund_i = fund_names[i]
                    fund_j = fund_names[j]
                    
                    # Calculate rolling correlation
                    rolling_corr = returns[fund_i].rolling(window=window).corr(returns[fund_j])
                    
                    # Plot
                    ax.plot(rolling_corr.index, rolling_corr.values, 
                           label=f'{fund_i[:20]}... vs {fund_j[:20]}...',
                           color=colors_palette[idx % len(colors_palette)],
                           linewidth=2, alpha=0.8)
                
                ax.axhline(y=0, color='black', linestyle='--', linewidth=1, alpha=0.3)
                ax.set_title(f'Rolling Correlation Matrix ({window}-Day Window)', fontsize=13, fontweight='bold', pad=15)
                ax.set_xlabel('Date', fontsize=11)
                ax.set_ylabel('Correlation Coefficient', fontsize=11)
                ax.set_ylim(-1, 1)
                ax.grid(True, alpha=0.3, linestyle=':')
                ax.legend(loc='best', fontsize=9, framealpha=0.9)
                
                plt.tight_layout()
                
                buf = io.BytesIO()
                plt.savefig(buf, format='png', dpi=100)
                buf.seek(0)
                results['charts']['rolling_correlation'] = base64.b64encode(buf.getvalue()).decode('utf-8')
                plt.close()

        # D. Sector Analysis (Pie Charts)
        # We need to generate a figure with subplots
        valid_funds_for_sector = [f for f in results['funds'] if f['sectors']]
        if valid_funds_for_sector:
            n_funds = len(valid_funds_for_sector)
            fig, axes = plt.subplots(1, n_funds, figsize=(6 * n_funds, 6))
            if n_funds == 1:
                axes = [axes]
            
            for i, fund in enumerate(valid_funds_for_sector):
                sectors = fund['sectors']
                # Sort and take top 5 + others
                sorted_sectors = sorted(sectors.items(), key=lambda x: float(x[1].replace('%', '')), reverse=True)
                
                labels = [k for k, v in sorted_sectors[:5]]
                sizes = [float(v.replace('%', '')) for k, v in sorted_sectors[:5]]
                
                # Add others if any
                remaining = sum([float(v.replace('%', '')) for k, v in sorted_sectors[5:]])
                if remaining > 0:
                    labels.append('Others')
                    sizes.append(remaining)
                
                axes[i].pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, textprops={'fontsize': 8})
                axes[i].set_title(fund['name'], fontsize=10, pad=10)
            
            plt.tight_layout()
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=100)
            buf.seek(0)
            results['charts']['sector_pie'] = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()

        # 3. Intersection Analysis
        # Find common stocks in top holdings
        sets = [set(f['holdings']) for f in results['funds'] if f['holdings']]
        if sets:
            common = set.intersection(*sets)
            results['intersection'] = list(common)

        return jsonify(results)

    except Exception as e:
        print(f"Error in calculator: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/growth-simulator')
def growth_simulator():
    return render_template('growth_simulator.html')

@app.route('/api/simulate-growth', methods=['POST'])
def simulate_growth():
    try:
        fund_name = request.form.get('fund')
        investment_type = request.form.get('investment_type')  # 'sip' or 'lumpsum'
        amount = float(request.form.get('amount', 100000))
        years = int(request.form.get('years', 5))
        
        if not fund_name:
            return jsonify({'error': 'Fund name is required'}), 400
        
        # Use navhistory to fetch NAV data (will use cached CSV or fetch from API)
        print(f"Fetching NAV history for: {fund_name}")
        df = navhistory.get_regular_plan_history(fund_name)
        
        if df is None or df.empty:
            return jsonify({'error': f'NAV history not available for {fund_name}'}), 404
        
        # Ensure data is sorted by date ascending
        df = df.sort_values('date').reset_index(drop=True)
        
        # Filter by duration
        if years > 0:
            # Get data for the last N years
            end_date = df['date'].max()
            start_date = end_date - pd.DateOffset(years=years)
            df = df[df['date'] >= start_date].reset_index(drop=True)
        
        if len(df) < 2:
            return jsonify({'error': 'Insufficient historical data for the selected duration'}), 400
        
        # Simulation Logic
        df['units'] = 0.0
        df['cum_units'] = 0.0
        df['invested'] = 0.0
        df['cum_invested'] = 0.0
        df['value'] = 0.0
        
        if investment_type == 'lumpsum':
            # Lump Sum: Buy units on day 1
            units_bought = amount / df.loc[0, 'nav']
            df['cum_units'] = units_bought
            df['cum_invested'] = amount
            df['value'] = df['cum_units'] * df['nav']
            
        else:  # SIP
            # SIP: Buy units on 1st of every month
            monthly_amount = amount
            current_units = 0.0
            total_invested = 0.0
            last_month = None
            
            for idx, row in df.iterrows():
                current_date = row['date']
                current_month = (current_date.year, current_date.month)
                
                # Check if this is a new month and investment day (1st or first available day)
                if current_month != last_month:
                    # Invest on the first day of each month
                    units_to_buy = monthly_amount / row['nav']
                    current_units += units_to_buy
                    total_invested += monthly_amount
                    last_month = current_month
                
                df.at[idx, 'cum_units'] = current_units
                df.at[idx, 'cum_invested'] = total_invested
                df.at[idx, 'value'] = current_units * row['nav']
        
        # Calculate final metrics
        total_invested = df['cum_invested'].iloc[-1]
        current_value = df['value'].iloc[-1]
        absolute_return = ((current_value - total_invested) / total_invested) * 100
        
        # Generate Chart
        import matplotlib
        matplotlib.use('Agg')
        import matplotlib.pyplot as plt
        import io
        import base64
        
        plt.figure(figsize=(12, 7))
        
        # Plot Total Invested (Grey Dashed)
        plt.plot(df['date'], df['cum_invested'], label='Total Invested', 
                 color='#64748b', linestyle='--', linewidth=2, alpha=0.8)
        
        # Plot Current Value (Green Solid)
        plt.plot(df['date'], df['value'], label='Current Value', 
                 color='#059669', linestyle='-', linewidth=2.5)
        
        # Fill area between lines
        plt.fill_between(df['date'], df['cum_invested'], df['value'],
                         where=(df['value'] >= df['cum_invested']),
                         color='#059669', alpha=0.2, label='Profit')
        plt.fill_between(df['date'], df['cum_invested'], df['value'],
                         where=(df['value'] < df['cum_invested']),
                         color='#dc2626', alpha=0.2, label='Loss')
        
        # Chart styling
        title_text = f'{fund_name}\n'
        if investment_type == 'lumpsum':
            title_text += f'Lump Sum Investment of ₹{amount:,.0f} '
        else:
            title_text += f'SIP of ₹{amount:,.0f}/month '
        
        title_text += f'| Absolute Return: {absolute_return:+.2f}%'
        
        plt.title(title_text, fontsize=13, fontweight='bold', pad=15)
        plt.xlabel('Date', fontsize=11)
        plt.ylabel('Amount (₹)', fontsize=11)
        plt.legend(loc='upper left', fontsize=10)
        plt.grid(True, alpha=0.2)
        plt.tight_layout()
        
        # Convert to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        chart_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        plt.close()
        
        # Format currency for display
        def format_currency(val):
            if val >= 10000000:  # 1 crore
                return f"₹{val/10000000:.2f} Cr"
            elif val >= 100000:  # 1 lakh
                return f"₹{val/100000:.2f} L"
            else:
                return f"₹{val:,.0f}"
        
        return jsonify({
            'total_invested': format_currency(total_invested),
            'current_value': format_currency(current_value),
            'absolute_return': f"{absolute_return:+.2f}%",
            'is_profit': bool(absolute_return >= 0),
            'chart': chart_base64
        })
        
    except Exception as e:
        print(f"Error in growth simulator: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Flask app...")
    print("Please open http://127.0.0.1:5001 in your browser to verify the design.")
    app.run(debug=True, port=5001)
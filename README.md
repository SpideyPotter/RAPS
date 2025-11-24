# RAPS Wealth - Mutual Fund Analysis Platform

A comprehensive web application for analyzing, comparing, and simulating mutual fund investments with AI-powered predictions.

## Features

### 🏠 Home Dashboard
- Clean, modern interface
- Fund search functionality with autocomplete
- Quick access to all tools

### 📊 RAPS Calculator
- **Compare up to 3 mutual funds** side-by-side
- **Detailed Overview Table** with:
  - NAV, AUM, Category, Benchmark
  - Age, Expense Ratio, Exit Load
  - Fund Manager information
- **Historical Analysis Charts**:
  - NAV History (aligned from oldest fund)
  - Cumulative Log Returns
- **AI-Powered Predictions**:
  - 30-day NAV forecasts using Linear Regression, ARIMA, and LSTM
  - Cumulative log returns predictions
- **Correlation Heatmap** between funds
- **Sector Analysis** pie charts

### 📈 Investment Growth Simulator
- **Backtest historical investments**
- **Investment Types**:
  - Lump Sum (one-time investment)
  - SIP (Systematic Investment Plan - monthly)
- **Flexible Duration**: 1, 3, 5, 10 years, or Max
- **Visual Analysis**:
  - Growth chart with profit/loss areas
  - Total invested vs current value comparison
  - Absolute return percentage

### 🔍 Fund Details Page
- Comprehensive fund information
- Portfolio holdings breakdown
- Performance metrics (Lumpsum & SIP)
- NAV predictions with multiple models
- Risk assessment

## Installation

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)

### Setup

1. **Clone the repository**
   ```bash
   cd /Users/ravindrareddy/Projects/RAPS
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On macOS/Linux
   # OR
   venv\Scripts\activate     # On Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Access the application**
   Open your browser and navigate to: `http://127.0.0.1:5001`

## Project Structure

```
RAPS/
├── app.py                     # Main Flask application
├── navhistory.py              # NAV history fetching from MF API
├── prediction_models.py       # ML models (Linear, ARIMA, LSTM)
├── scraper.py                 # Web scraper for fund data
├── Funds.txt                  # List of available funds
├── templates/                 # HTML templates
│   ├── index.html
│   ├── calculator.html
│   ├── growth_simulator.html
│   └── fund_details.html
├── static/                    # Static assets
│   └── logo.jpg
├── Database/
│   ├── NAV_History/           # Cached NAV history CSVs
│   └── *.json                 # Fund detail JSON files
├── requirements.txt           # Python dependencies
├── README.md                  # This file
└── .gitignore
```

## Technology Stack

- **Backend**: Flask (Python)
- **Data Processing**: Pandas, NumPy
- **Visualization**: Matplotlib
- **Machine Learning**: 
  - Linear Regression (scikit-learn)
  - ARIMA (statsmodels)
  - LSTM (TensorFlow/Keras)
- **Data Source**: MF API (https://api.mfapi.in)
- **Web Scraping**: Selenium
- **Frontend**: HTML, TailwindCSS, JavaScript, Lucide Icons

## How It Works

### Investment Growth Simulator Math

**Lump Sum:**
- Invest ₹1,00,000 at NAV ₹20 → Get 5,000 units
- After 5 years, NAV is ₹50
- Current Value = 5,000 × 50 = ₹2,50,000
- Return = 150%

**SIP (Rupee Cost Averaging):**
- Month 1: ₹10k at NAV ₹20 → 500 units
- Month 2: ₹10k at NAV ₹25 → 400 units
- Month 3: ₹10k at NAV ₹20 → 500 units
- Total: 1,400 units from ₹30k investment
- You buy more units when prices are low!

### Prediction Models

1. **Linear Regression**: Simple trend-based forecasting
2. **ARIMA**: Statistical time series model
3. **LSTM**: Deep learning model for complex patterns

## API Endpoints

- `GET /` - Home page
- `GET /calculator` - Fund comparison tool
- `GET /growth-simulator` - Investment simulator
- `GET /fund/<fund_name>` - Individual fund details
- `GET /api/funds` - List all available funds
- `POST /api/compare` - Compare multiple funds
- `POST /api/simulate-growth` - Simulate investment growth

## Data Sources

- **MF API**: Real-time NAV data and fund information
- **Cached Data**: Historical NAV data stored locally for faster access

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is for educational and personal use.

## Disclaimer

⚠️ **Important**: Mutual fund investments are subject to market risks. This tool is for analysis purposes only and should not be considered as investment advice. Please read all scheme-related documents carefully before investing.

---

Built with ❤️ for smart investing

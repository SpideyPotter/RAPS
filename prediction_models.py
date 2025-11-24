"""Machine learning prediction models for NAV forecasting."""

import numpy as np
import pandas as pd
import streamlit as st
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
import warnings
warnings.filterwarnings('ignore')

def predict_nav_linear(data, days=30):
    """Predict NAV using Linear Regression."""
    df = data.copy()
    df['Days'] = np.arange(len(df))
    
    X = df[['Days']].values
    y = df['NAV'].values
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    
    last_day = len(df)
    future_days = np.arange(last_day, last_day + days).reshape(-1, 1)
    future_predictions = model.predict(future_days)
    
    future_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=days, freq='D')
    
    return {
        'test_actual': y_test,
        'test_predicted': y_pred,
        'test_dates': df.index[-len(y_test):],
        'future_predictions': future_predictions,
        'future_dates': future_dates,
        'model_score': model.score(X_test, y_test)
    }

def predict_nav_arima(data, days=30):
    """Predict NAV using ARIMA."""
    try:
        from statsmodels.tsa.arima.model import ARIMA
        
        df = data.copy()
        
        # Ensure index is datetime
        if not isinstance(df.index, pd.DatetimeIndex):
            df.index = pd.to_datetime(df.index)
            
        # Remove duplicates if any
        df = df[~df.index.duplicated(keep='first')]
        
        # Resample to daily frequency and forward fill missing values (weekends/holidays)
        # This fixes the ValueWarning about missing frequency
        df = df.asfreq('D', method='ffill')
        
        y = df['NAV']
        
        # Fit ARIMA model (using a standard order, e.g., (5,1,0))
        model = ARIMA(y, order=(5,1,0))
        model_fit = model.fit()
        
        # Forecast
        forecast_result = model_fit.get_forecast(steps=days)
        future_predictions = forecast_result.predicted_mean
        
        future_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=days, freq='D')
        
        return {
            'future_predictions': future_predictions.values,
            'future_dates': future_dates
        }
    except Exception as e:
        print(f"ARIMA prediction failed: {e}")
        return None
def build_lstm_model(sequence_length):
    """Build LSTM model architecture."""
    model = Sequential([
        LSTM(50, activation='relu', return_sequences=True, input_shape=(sequence_length, 1)),
        Dropout(0.2),
        LSTM(50, activation='relu'),
        Dropout(0.2),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    return model

def predict_nav_lstm(data, days=30, sequence_length=60):
    """Predict NAV using LSTM Deep Learning."""
    try:
        df = data.copy()
        values = df['NAV'].values.reshape(-1, 1)
        
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(values)
        
        if len(scaled_data) < sequence_length + 20:
            return None
        
        X, y = [], []
        for i in range(sequence_length, len(scaled_data)):
            X.append(scaled_data[i-sequence_length:i, 0])
            y.append(scaled_data[i, 0])
        
        X, y = np.array(X), np.array(y)
        X = X.reshape(X.shape[0], X.shape[1], 1)
        
        train_size = int(len(X) * 0.8)
        X_train, X_test = X[:train_size], X[train_size:]
        y_train, y_test = y[:train_size], y[train_size:]
        
        model = build_lstm_model(sequence_length)
        
        model.fit(X_train, y_train, epochs=20, batch_size=32, verbose=0, validation_split=0.1)
        
        y_pred = model.predict(X_test, verbose=0)
        
        # Future predictions
        last_sequence = scaled_data[-sequence_length:]
        future_predictions = []
        
        current_sequence = last_sequence.copy()
        
        for _ in range(days):
            current_sequence_reshaped = current_sequence.reshape(1, sequence_length, 1)
            next_pred = model.predict(current_sequence_reshaped, verbose=0)
            future_predictions.append(next_pred[0, 0])
            current_sequence = np.append(current_sequence[1:], next_pred[0, 0])
        
        future_predictions = np.array(future_predictions).reshape(-1, 1)
        future_predictions = scaler.inverse_transform(future_predictions)
        
        y_test_actual = scaler.inverse_transform(y_test.reshape(-1, 1))
        y_pred_rescaled = scaler.inverse_transform(y_pred)
        
        test_dates = df.index[-len(y_test):]
        future_dates = pd.date_range(start=df.index[-1] + timedelta(days=1), periods=days, freq='D')
        
        mse = np.mean((y_test_actual - y_pred_rescaled) ** 2)
        
        return {
            'test_actual': y_test_actual.flatten(),
            'test_predicted': y_pred_rescaled.flatten(),
            'test_dates': test_dates,
            'future_predictions': future_predictions.flatten(),
            'future_dates': future_dates,
            'mse': mse
        }
    except Exception as e:
        st.warning(f"LSTM prediction failed: {str(e)}")
        return None
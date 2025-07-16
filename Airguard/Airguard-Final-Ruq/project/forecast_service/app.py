from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.holtwinters import ExponentialSmoothing
import joblib
import os
from datetime import datetime, timedelta
from pymongo import MongoClient
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# MongoDB connection
try:
    client = MongoClient('mongodb://localhost:27017/')
    db = client['airguard']
    collection = db['aggregatedaqis']
    logger.info("Connected to MongoDB")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {str(e)}")

# Model storage
MODELS_DIR = 'models'
os.makedirs(MODELS_DIR, exist_ok=True)

def train_arima_model(data, order=(1, 0, 0)):
    try:
        model = ARIMA(data, order=order)
        model_fit = model.fit()
        logger.info("ARIMA model trained successfully")
        return model_fit
    except Exception as e:
        logger.error(f"ARIMA training failed: {str(e)}")
        raise

def train_holt_winters(data):
    try:
        model = ExponentialSmoothing(data, trend='add', seasonal=None)
        model_fit = model.fit()
        logger.info("Holt-Winters model trained successfully")
        return model_fit
    except Exception as e:
        logger.error(f"Holt-Winters training failed: {str(e)}")
        raise

def save_model(model, filename):
    try:
        path = os.path.join(MODELS_DIR, filename)
        joblib.dump(model, path)
        logger.info(f"Model saved to {path}")
    except Exception as e:
        logger.error(f"Failed to save model {filename}: {str(e)}")
        raise

def load_model(filename):
    try:
        path = os.path.join(MODELS_DIR, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Model file {path} not found")
        model = joblib.load(path)
        logger.info(f"Model loaded from {path}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model {filename}: {str(e)}")
        raise

@app.route('/train', methods=['POST'])
def train_model():
    try:
        # Log raw request body for debugging
        raw_data = request.get_data(as_text=True)
        logger.info(f"Raw request body: {raw_data}")

        if not request.is_json:
            logger.warning("Request content-type is not application/json")
            return jsonify({"error": "Request must be JSON"}), 400

        json_data = request.get_json(silent=True)
        if not json_data or 'data' not in json_data:
            logger.warning("No 'data' field in JSON payload")
            return jsonify({"error": "Missing 'data' field in request"}), 400

        data = json_data['data']
        if not isinstance(data, list) or len(data) < 2:
            logger.warning("Invalid or insufficient data for training")
            return jsonify({"error": "At least 2 data points are required for training"}), 400

        timestamps = [datetime.fromisoformat(d['intervalStart']) for d in data]
        aqi_values = [d['aqi'] for d in data]
        series = pd.Series(aqi_values, index=pd.DatetimeIndex(timestamps))

        arima_model = train_arima_model(series)
        hw_model = train_holt_winters(series)
        save_model(arima_model, 'arima_model.pkl')
        save_model(hw_model, 'hw_model.pkl')
        return jsonify({"status": "success"})
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({"error": f"Invalid JSON payload: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        return jsonify({"error": f"Training failed: {str(e)}"}), 400

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        # Log raw request body for debugging
        raw_data = request.get_data(as_text=True)
        logger.info(f"Raw request body: {raw_data}")
        
        data = request.json
        if not data:
            logger.warning("No JSON data provided")
            return jsonify({"error": "No JSON data provided"}), 400

        steps = int(data.get('steps', 6))
        zone = data.get('zone', 'Zone 1')
        historical = data.get('historical', {})
        logger.info(f"Received forecast request: steps={steps}, zone={zone}, historical_keys={list(historical.keys())}")

        # Check for historical data in request or fetch from MongoDB
        if not historical.get('timestamps') or not historical.get('aqi'):
            seven_days_ago = datetime.now() - timedelta(days=7)
            logger.info(f"Querying MongoDB for data since {seven_days_ago}")
            mongo_data = collection.find({
                'intervalStart': {'$gte': seven_days_ago}
            }).sort('intervalStart', 1)
            mongo_data = list(mongo_data)
            logger.info(f"Found {len(mongo_data)} records")
            if not mongo_data:
                logger.warning("No historical data found in MongoDB")
                return jsonify({"error": "No historical data available in database"}), 404
            timestamps = [d['intervalStart'] for d in mongo_data]
            aqi_values = [d['aqi'] for d in mongo_data]
        else:
            timestamps = [datetime.fromisoformat(t) for t in historical.get('timestamps', [])]
            aqi_values = historical.get('aqi', [])

        if not timestamps or not aqi_values or len(timestamps) != len(aqi_values):
            logger.warning("Invalid or missing historical data")
            return jsonify({"error": "Invalid or missing historical data"}), 400

        series = pd.Series(aqi_values, index=pd.DatetimeIndex(timestamps))

        # Check if models exist, train if not
        try:
            arima_model = load_model('arima_model.pkl')
            hw_model = load_model('hw_model.pkl')
        except FileNotFoundError:
            logger.warning("Model files not found, training new models")
            arima_model = train_arima_model(series)
            hw_model = train_holt_winters(series)
            save_model(arima_model, 'arima_model.pkl')
            save_model(hw_model, 'hw_model.pkl')

        arima_forecast = arima_model.forecast(steps=steps)
        hw_forecast = hw_model.forecast(steps=steps)
        last_time = timestamps[-1]
        forecast_times = [last_time + timedelta(minutes=10 * i) for i in range(1, steps + 1)]

        logger.info("Forecast generated successfully")
        return jsonify({
            "forecast": {
                "timestamps": [t.isoformat() for t in forecast_times],
                "arima": list(arima_forecast),
                "holt_winters": list(hw_forecast)
            },
            "historical": {
                "timestamps": [t.isoformat() for t in timestamps],
                "aqi": list(aqi_values)
            }
        })
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode error: {str(e)}")
        return jsonify({"error": f"Invalid JSON payload: {str(e)}"}), 400
    except Exception as e:
        logger.error(f"Forecast failed: {str(e)}")
        return jsonify({"error": f"Forecast failed: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
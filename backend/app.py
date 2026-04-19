from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from bert_model import predict_sentiment

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../frontend', path)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400

    text = data['text']

    label, confidence = predict_sentiment(text)

    return jsonify({
        "label": label,
        "confidence": confidence
    })

if __name__ == "__main__":
    app.run(debug=True)
from flask import Flask, request, jsonify
import nlp

app = Flask(__name__)

@app.route('/embed', methods=['POST'])
def embed_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "Invalid request. 'text' field is required."}), 400

    text = data['text']

    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Invalid input. 'text' must be a non-empty string."}), 400

    try:
        result = nlp.produce_embedding(text)
        return jsonify({"embeddings": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def health_check():
    return "Server is runnnnnnning!"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
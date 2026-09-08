from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

os.makedirs('storage', exist_ok=True)
os.makedirs('static', exist_ok=True)

@app.route('/')
def home():
    return 'EditOr Backend is running!'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

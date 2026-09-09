from flask import Flask
from flask_cors import CORS
from routes import init_routes
import os

app = Flask(__name__)
CORS(app)  # React'in erişmesine izin ver

# Klasörleri oluştur (dosyaların kaydedileceği yerler)
os.makedirs('storage', exist_ok=True)
os.makedirs('static', exist_ok=True)

# Route'ları başlat (routes.py'deki tüm API uç noktalarını yükle)
init_routes(app)

@app.route('/')
def home():
    return '🎬 Edit0r Backend is running! API endpoints are ready.'

if __name__ == '__main__':
    # Codespace'lerde ve tüm ağ arayüzlerinde çalışması için
    app.run(host='0.0.0.0', port=5000, debug=True)

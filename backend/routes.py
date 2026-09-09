from flask import request, jsonify, send_file
import os
import uuid
from werkzeug.utils import secure_filename
from video_processor import process_video

# Geçici oturum verileri (Bu basit bir örnek, normalde veritabanı kullanılır)
session_data = {
    'videos': [],      # list of dicts: { 'path': str, 'speed': float, 'volume': float, 'fade_in': float, 'fade_out': float, 'rotate': int, 'flip': str, 'brightness': float }
    'logos': [],       # [{'path':..., 'start':..., 'end':...}]
    'audios': []       # [{'path':..., 'start':..., 'end':..., 'volume':...}]
}

UPLOAD_FOLDER = 'storage'
OUTPUT_FOLDER = 'static'

def init_routes(app):
    @app.route('/api/upload/video', methods=['POST'])
    def upload_video():
        if 'file' not in request.files:
            return jsonify({'error': 'Dosya yok'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'Dosya seçilmedi'}), 400
        
        # Efekt ayarlarını form'dan al (varsayılan değerlerle)
        speed = float(request.form.get('speed', 1.0))
        volume = float(request.form.get('volume', 1.0))
        fade_in = float(request.form.get('fade_in', 0))
        fade_out = float(request.form.get('fade_out', 0))
        rotate = int(request.form.get('rotate', 0))
        flip = request.form.get('flip', 'none')
        brightness = float(request.form.get('brightness', 0))
        
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        
        video_data = {
            'path': path,
            'speed': speed,
            'volume': volume,
            'fade_in': fade_in,
            'fade_out': fade_out,
            'rotate': rotate,
            'flip': flip,
            'brightness': brightness
        }
        session_data['videos'].append(video_data)
        return jsonify({'message': 'Yüklendi', 'filename': filename, 'index': len(session_data['videos'])-1})

    @app.route('/api/timeline/videos', methods=['GET'])
    def get_videos():
        result = []
        for v in session_data['videos']:
            result.append({
                'name': os.path.basename(v['path']),
                'speed': v.get('speed', 1.0),
                'volume': v.get('volume', 1.0),
                'fade_in': v.get('fade_in', 0),
                'fade_out': v.get('fade_out', 0),
                'rotate': v.get('rotate', 0),
                'flip': v.get('flip', 'none'),
                'brightness': v.get('brightness', 0)
            })
        return jsonify({'videos': result})

    @app.route('/api/timeline/move', methods=['POST'])
    def move_video():
        data = request.json
        old_idx = data.get('oldIndex')
        new_idx = data.get('newIndex')
        if old_idx is None or new_idx is None:
            return jsonify({'error': 'Geçersiz indeks'}), 400
        if 0 <= old_idx < len(session_data['videos']) and 0 <= new_idx < len(session_data['videos']):
            session_data['videos'].insert(new_idx, session_data['videos'].pop(old_idx))
            return jsonify({'message': 'Sıralama güncellendi'})
        return jsonify({'error': 'İndeks hatası'}), 400

    @app.route('/api/timeline/update_video', methods=['POST'])
    def update_video():
        data = request.json
        idx = data.get('index')
        if idx is None or not (0 <= idx < len(session_data['videos'])):
            return jsonify({'error': 'Geçersiz indeks'}), 400
        
        video = session_data['videos'][idx]
        video['speed'] = float(data.get('speed', 1.0))
        video['volume'] = float(data.get('volume', 1.0))
        video['fade_in'] = float(data.get('fade_in', 0))
        video['fade_out'] = float(data.get('fade_out', 0))
        video['rotate'] = int(data.get('rotate', 0))
        video['flip'] = data.get('flip', 'none')
        video['brightness'] = float(data.get('brightness', 0))
        
        return jsonify({'message': 'Güncellendi'})

    @app.route('/api/timeline/delete_video', methods=['POST'])
    def delete_video():
        data = request.json
        idx = data.get('index')
        if idx is not None and 0 <= idx < len(session_data['videos']):
            removed_data = session_data['videos'].pop(idx)
            if os.path.exists(removed_data['path']):
                os.remove(removed_data['path'])
            return jsonify({'message': 'Silindi'})
        return jsonify({'error': 'Bulunamadı'}), 400

    @app.route('/api/logo/add', methods=['POST'])
    def add_logo():
        if 'file' not in request.files:
            return jsonify({'error': 'Dosya yok'}), 400
        file = request.files['file']
        start = float(request.form.get('start', 0))
        end = float(request.form.get('end', 5))
        
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        
        session_data['logos'].append({'path': path, 'start': start, 'end': end})
        return jsonify({'message': 'Logo eklendi', 'total': len(session_data['logos'])})

    @app.route('/api/audio/add', methods=['POST'])
    def add_audio():
        if 'file' not in request.files:
            return jsonify({'error': 'Dosya yok'}), 400
        file = request.files['file']
        start = float(request.form.get('start', 0))
        end = float(request.form.get('end', 10))
        volume = float(request.form.get('volume', 0.8))
        
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(path)
        
        session_data['audios'].append({'path': path, 'start': start, 'end': end, 'volume': volume})
        return jsonify({'message': 'Ses eklendi', 'total': len(session_data['audios'])})

    @app.route('/api/render', methods=['POST'])
    def render_video():
        if len(session_data['videos']) == 0:
            return jsonify({'error': 'En az 1 video yükleyin!'}), 400
        
        output_filename = str(uuid.uuid4()) + '_output.mp4'
        os.makedirs(OUTPUT_FOLDER, exist_ok=True)
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        
        try:
            process_video(
                session_data['videos'],
                session_data['logos'],
                session_data['audios'],
                output_path
            )
            return jsonify({'message': 'Render başarılı!', 'download_url': f'/static/{output_filename}'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    @app.route('/static/<filename>', methods=['GET'])
    def download_file(filename):
        path = os.path.join(OUTPUT_FOLDER, filename)
        if os.path.exists(path):
            return send_file(path, as_attachment=True)
        return jsonify({'error': 'Dosya bulunamadı'}), 404
    
    @app.route('/api/reset', methods=['POST'])
    def reset_session():
        global session_data
        # Dosyaları fiziksel olarak sil
        for v in session_data.get('videos', []):
            if os.path.exists(v.get('path', '')):
                try: os.remove(v['path'])
                except: pass
        for l in session_data.get('logos', []):
            if os.path.exists(l.get('path', '')):
                try: os.remove(l['path'])
                except: pass
        for a in session_data.get('audios', []):
            if os.path.exists(a.get('path', '')):
                try: os.remove(a['path'])
                except: pass
                
        session_data = {'videos': [], 'logos': [], 'audios': []}
        return jsonify({'message': 'Oturum sıfırlandı'})

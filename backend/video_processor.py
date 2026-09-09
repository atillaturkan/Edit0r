import os
from moviepy import VideoFileClip, AudioFileClip, ImageClip, CompositeVideoClip, CompositeAudioClip, concatenate_videoclips
from moviepy.video.fx import speedx, fadein, fadeout, mirror_x, mirror_y, colorx
from moviepy.audio.fx import volumex

def process_video(video_items, logo_data_list, audio_data_list, output_path):
    """
    video_items: List of dicts:
        {
            'path': str,
            'speed': float (0.5 - 2.0),
            'volume': float (0.0 - 2.0),
            'fade_in': float (saniye),
            'fade_out': float (saniye),
            'rotate': int (0, 90, 180, 270),
            'flip': str ('none', 'horizontal', 'vertical'),
            'brightness': float (-1.0 - 1.0)
        }
    """
    if not video_items:
        raise Exception("Hiç video yüklenmedi.")
    
    clips = []
    for v_data in video_items:
        v_path = v_data['path']
        if not os.path.exists(v_path):
            raise Exception(f"Dosya bulunamadı: {v_path}")
        
        clip = VideoFileClip(v_path)
        
        # 1. Hız Efekti (Speed)
        speed = v_data.get('speed', 1.0)
        if speed != 1.0 and speed > 0:
            clip = clip.fx(speedx.speedx, speed)
            # Ses hızını da değiştir
            if clip.audio is not None:
                clip.audio = clip.audio.fx(speedx.speedx, speed)
        
        # 2. Ses Seviyesi (Volume)
        volume = v_data.get('volume', 1.0)
        if volume != 1.0 and clip.audio is not None:
            clip.audio = clip.audio.fx(volumex.volumex, volume)
        
        # 3. Fade In (Açılış Kararması)
        fade_in_dur = v_data.get('fade_in', 0)
        if fade_in_dur > 0:
            clip = clip.fx(fadein.fadein, fade_in_dur)
        
        # 4. Fade Out (Kapanış Kararması)
        fade_out_dur = v_data.get('fade_out', 0)
        if fade_out_dur > 0:
            clip = clip.fx(fadeout.fadeout, fade_out_dur)
        
        # 5. Döndürme (Rotate)
        rotate_angle = v_data.get('rotate', 0)
        if rotate_angle != 0:
            clip = clip.rotate(rotate_angle)
        
        # 6. Aynalama (Flip)
        flip_mode = v_data.get('flip', 'none')
        if flip_mode == 'horizontal':
            clip = clip.fx(mirror_x.mirror_x)
        elif flip_mode == 'vertical':
            clip = clip.fx(mirror_y.mirror_y)
        
        # 7. Parlaklık (Brightness)
        brightness = v_data.get('brightness', 0)
        if brightness != 0:
            # brightness -1 ile 1 arasında, bunu 0.5 ile 2.0 arasına çevirelim
            factor = 1.0 + brightness  # -1->0, 0->1, 1->2
            if factor > 0:
                clip = clip.fx(colorx.colorx, factor)
        
        clips.append(clip)
    
    # Tüm videoları ilk videonun FPS ve çözünürlüğüne uyumlu hale getir
    target_fps = clips[0].fps
    target_size = clips[0].size
    
    resized = []
    for c in clips:
        if c.size != target_size:
            c = c.resize(target_size)
        if c.fps != target_fps:
            c = c.set_fps(target_fps)
        resized.append(c)
    
    # Videoları birleştir
    final_video = concatenate_videoclips(resized, method="compose")
    total_duration = final_video.duration

    # --- LOGO EKLE (Overlay) ---
    overlays = [final_video]
    for logo in logo_data_list:
        try:
            start = logo['start']
            end = logo['end']
            if start >= total_duration:
                continue
            dur = min(end, total_duration) - start
            if dur <= 0:
                continue
            
            img_clip = ImageClip(logo['path'], transparent=True)
            img_clip = img_clip.resize(height=150)
            img_clip = img_clip.set_start(start).set_duration(dur)
            img_clip = img_clip.set_position(('center', 'top'))
            overlays.append(img_clip)
        except Exception as e:
            print(f"Logo hatası: {e}")
    
    final_video = CompositeVideoClip(overlays)

    # --- SES KATMANLARI (Arkaplan müzikleri + Video sesleri) ---
    audio_tracks = []
    if final_video.audio is not None:
        audio_tracks.append(final_video.audio)
    
    for audio in audio_data_list:
        try:
            start = audio['start']
            end = audio['end']
            if start >= total_duration:
                continue
            dur = min(end, total_duration) - start
            if dur <= 0:
                continue
            
            aud_clip = AudioFileClip(audio['path'])
            aud_clip = aud_clip.set_start(start).set_duration(dur)
            aud_clip = aud_clip.volumex(audio.get('volume', 1.0))
            audio_tracks.append(aud_clip)
        except Exception as e:
            print(f"Ses hatası: {e}")
    
    if audio_tracks:
        final_audio = CompositeAudioClip(audio_tracks)
        final_video = final_video.set_audio(final_audio)

    # --- DIŞA AKTAR ---
    final_video.write_videofile(
        output_path, 
        codec='libx264', 
        audio_codec='aac', 
        fps=target_fps, 
        verbose=False, 
        logger=None
    )
    
    # Temizlik
    for c in clips:
        c.close()
    final_video.close()
    return output_path

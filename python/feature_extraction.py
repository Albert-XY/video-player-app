import numpy as np
import librosa
from moviepy.editor import VideoFileClip

def extract_audio_features(audio_path):
    y, sr = librosa.load(audio_path)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    return np.hstack([np.mean(mfcc, axis=1), np.mean(chroma, axis=1)])

def extract_video_features(video_path):
    clip = VideoFileClip(video_path)
    frames = [frame for frame in clip.iter_frames()]
    
    # 简单的视频特征：平均亮度和颜色直方图
    brightness = np.mean([np.mean(frame) for frame in frames])
    color_hist = np.mean([np.histogram(frame, bins=8, range=(0, 255))[0] for frame in frames], axis=0)
    
    return np.hstack([brightness, color_hist])

def extract_features(video_path):
    audio_features = extract_audio_features(video_path)
    video_features = extract_video_features(video_path)
    return np.hstack([audio_features, video_features])


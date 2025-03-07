import numpy as np
from sklearn.svm import SVR
from moviepy.editor import VideoFileClip
import librosa
import cv2
import joblib
import json
import sys

def extract_audio_features(video_path):
    """提取音频特征"""
    video = VideoFileClip(video_path)
    audio = video.audio
    y, sr = librosa.load(audio)
    
    # 提取音频特征
    mfcc = librosa.feature.mfcc(y=y, sr=sr)
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    
    # 合并特征
    features = np.concatenate([
        np.mean(mfcc, axis=1),
        np.mean(spectral_centroid, axis=1),
        np.mean(chroma, axis=1)
    ])
    
    return features

def extract_video_features(video_path):
    """提取视频特征"""
    cap = cv2.VideoCapture(video_path)
    frames = []
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        # 提取帧特征（颜色直方图）
        hist = cv2.calcHist([frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
        frames.append(hist.flatten())
        
    cap.release()
    
    # 计算视频特征的平均值
    features = np.mean(frames, axis=0)
    return features

def extract_features(video_path):
    """提取视频的音频和视频特征"""
    audio_features = extract_audio_features(video_path)
    video_features = extract_video_features(video_path)
    return np.concatenate([audio_features, video_features])

def train_rvm(X, y):
    """训练RVM模型"""
    rvm = SVR(kernel='rbf')
    rvm.fit(X, y)
    return rvm

def calculate_valence_arousal(video_path, valence_rvm, arousal_rvm):
    """计算视频的效价和唤醒度"""
    features = extract_features(video_path)
    valence = valence_rvm.predict([features])[0]
    arousal = arousal_rvm.predict([features])[0]
    return valence, arousal

def process_video(video_path, valence_rvm, arousal_rvm, threshold=5.0):
    """
    处理视频并决定是否保留
    
    参数:
        video_path: 视频文件路径
        valence_rvm: 效价RVM模型
        arousal_rvm: 唤醒度RVM模型
        threshold: 平方和阈值
        
    返回:
        (是否保留, 效价, 唤醒度)
    """
    valence, arousal = calculate_valence_arousal(video_path, valence_rvm, arousal_rvm)
    score = valence**2 + arousal**2
    return score > threshold, valence, arousal

def save_models(valence_rvm, arousal_rvm, model_path):
    """保存训练好的模型"""
    joblib.dump({
        'valence_rvm': valence_rvm,
        'arousal_rvm': arousal_rvm
    }, model_path)

def load_models(model_path):
    """加载训练好的模型"""
    models = joblib.load(model_path)
    return models['valence_rvm'], models['arousal_rvm']

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python video_processor.py [train/predict] ...")
        sys.exit(1)
        
    mode = sys.argv[1]
    model_path = "models/rvm_model.joblib"
    
    if mode == "train":
        # python video_processor.py train video_list.txt labels.txt
        video_list_file = sys.argv[2]
        labels_file = sys.argv[3]
        
        # 读取训练数据
        with open(video_list_file) as f:
            video_paths = f.read().splitlines()
            
        with open(labels_file) as f:
            labels = [list(map(float, line.split())) for line in f]
            
        # 提取特征
        X = np.array([extract_features(path) for path in video_paths])
        y_valence = np.array([label[0] for label in labels])
        y_arousal = np.array([label[1] for label in labels])
        
        # 训练模型
        valence_rvm = train_rvm(X, y_valence)
        arousal_rvm = train_rvm(X, y_arousal)
        
        # 保存模型
        save_models(valence_rvm, arousal_rvm, model_path)
        print("Model trained and saved successfully")
        
    elif mode == "predict":
        # python video_processor.py predict video_path
        video_path = sys.argv[2]
        
        # 加载模型
        valence_rvm, arousal_rvm = load_models(model_path)
        
        # 预测
        should_keep, valence, arousal = process_video(video_path, valence_rvm, arousal_rvm)
        
        # 输出结果（JSON格式，方便Java解析）
        result = {
            "passed": should_keep,
            "valence": float(valence),
            "arousal": float(arousal),
            "square_sum": float(valence**2 + arousal**2)
        }
        print(json.dumps(result))

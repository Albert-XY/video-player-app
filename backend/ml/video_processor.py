import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib
import librosa
import cv2
from moviepy.editor import VideoFileClip
from sqlalchemy import create_engine

class VideoFeatureExtractor:
    def __init__(self):
        self.audio_scaler = StandardScaler()
        self.video_scaler = StandardScaler()
        
    def extract_audio_features(self, video_path):
        """提取音频特征"""
        video = VideoFileClip(video_path)
        audio = video.audio
        y, sr = librosa.load(audio)
        
        # 提取音频特征
        mfcc = librosa.feature.mfcc(y=y, sr=sr)
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        loudness = np.mean(librosa.feature.rms(y=y))  # Loudness
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)  # Rhythm
        pitch = librosa.feature.pitch(y=y, sr=sr)  # Average pitch
        # 合并特征
        features = np.concatenate([
            np.mean(mfcc, axis=1),
            np.mean(spectral_centroid, axis=1),
            np.mean(chroma, axis=1),
            loudness,
            tempo,
            np.mean(pitch, axis=1)
        ])
        
        return features
        
    def extract_video_features(self, video_path):
        """提取视频特征"""
        cap = cv2.VideoCapture(video_path)
        frames = []
        lighting_keys = []
        color_variances = []
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            # Convert frame to HSV and extract lighting key
            hsv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            V = hsv_frame[:, :, 2]
            lighting_key = np.mean(V) * np.std(V)
            lighting_keys.append(lighting_key)
            # Compute color variance in CIE LUV color space
            luv_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2Luv)
            color_variance = np.linalg.det(np.cov(luv_frame.reshape(-1, 3), rowvar=False))
            color_variances.append(color_variance)
            frames.append(frame)
        cap.release()
        
        # Calculate average lighting key and color variance
        avg_lighting_key = np.mean(lighting_keys)
        avg_color_variance = np.mean(color_variances)
        
        # Compute color histogram for each frame
        hist_features = []
        for frame in frames:
            hist = cv2.calcHist([frame], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
            hist_features.append(hist.flatten())
        
        # Calculate average color histogram
        avg_hist_features = np.mean(hist_features, axis=0)
        
        return np.concatenate([avg_hist_features, [avg_lighting_key, avg_color_variance]])

class RVMRegressor:
    def __init__(self):
        self.valence_model = LinearRegression()
        self.arousal_model = LinearRegression()
        self.feature_extractor = VideoFeatureExtractor()
        
    def train(self, video_paths, labels):
        """
        训练RVM模型
        video_paths: 训练视频路径列表
        labels: 标注数据 [[valence, arousal], ...]
        """
        features = []
        for video_path in video_paths:
            # 提取特征
            audio_features = self.feature_extractor.extract_audio_features(video_path)
            video_features = self.feature_extractor.extract_video_features(video_path)
            combined_features = np.concatenate([audio_features, video_features])
            features.append(combined_features)
            
        X = np.array(features)
        y_valence = np.array([label[0] for label in labels])
        y_arousal = np.array([label[1] for label in labels])
        
        # 训练效价和唤醒度模型
        self.valence_model.fit(X, y_valence)
        self.arousal_model.fit(X, y_arousal)
        
    def predict(self, video_path):
        """预测视频的效价和唤醒度"""
        # 提取特征
        audio_features = self.feature_extractor.extract_audio_features(video_path)
        video_features = self.feature_extractor.extract_video_features(video_path)
        features = np.concatenate([audio_features, video_features]).reshape(1, -1)
        
        # 预测
        valence = self.valence_model.predict(features)[0]
        arousal = self.arousal_model.predict(features)[0]
        
        # 计算平方和（用于初筛）
        square_sum = valence**2 + arousal**2
        
        return valence, arousal, square_sum
        
    def save(self, model_path):
        """保存模型"""
        joblib.dump({
            'valence_model': self.valence_model,
            'arousal_model': self.arousal_model,
            'feature_extractor': self.feature_extractor
        }, model_path)
        
    @classmethod
    def load(cls, model_path):
        """加载模型"""
        saved = joblib.load(model_path)
        instance = cls()
        instance.valence_model = saved['valence_model']
        instance.arousal_model = saved['arousal_model']
        instance.feature_extractor = saved['feature_extractor']
        return instance

    def upload_video(self, video_path):
        """上传视频并存储在PendingVideo表中"""
        # 假设视频符合条件
        engine = create_engine('postgresql://user:password@host:port/dbname')
        video_info = {'path': video_path, 'title': video_path.split('/')[-1]}
        engine.execute("INSERT INTO PendingVideo (path, title) VALUES (:path, :title)", video_info)
        print(f"视频 {video_path} 已上传并存储在PendingVideo表中")

    def evaluate_video(self, video_id, sam_scores, threshold=0.5):
        """评估视频并存储到Video表中"""
        if len(sam_scores) > 16:
            # 计算方差
            variance = np.var(sam_scores)
            if variance < threshold:  # 设定阈值
                # 存储到Video表的逻辑
                engine = create_engine('postgresql://user:password@host:port/dbname')
                video_info = {'video_id': video_id, 'variance': variance}
                engine.execute("INSERT INTO video (video_id, variance) VALUES (:video_id, :variance)", video_info)
                print(f"视频 {video_id} 已评估并存储在Video表中")
        else:
            print("评估次数不足，无法存储到Video表")

    def record_experiment_data(self, video_id, eeg_file_url, start_time, end_time, valence, arousal):
        """记录实验数据"""
        engine = create_engine('postgresql://user:password@host:port/dbname')
        experiment_data = {'video_id': video_id, 'eeg_file_url': eeg_file_url, 'start_time': start_time, 'end_time': end_time, 'valence': valence, 'arousal': arousal}
        engine.execute("INSERT INTO experiment_data (video_id, eeg_file_url, start_time, end_time, valence, arousal) VALUES (:video_id, :eeg_file_url, :start_time, :end_time, :valence, :arousal)", experiment_data)
        print(f"实验数据已记录为视频 {video_id}")

def process_new_video(video_path, model_path, square_sum_threshold=5.0):
    """
    处理新视频
    返回: (是否通过初筛, 效价, 唤醒度, 平方和)
    """
    model = RVMRegressor.load(model_path)
    valence, arousal, square_sum = model.predict(video_path)
    
    # 初筛条件：平方和大于阈值
    passed_screening = square_sum > square_sum_threshold
    
    return passed_screening, valence, arousal, square_sum

if __name__ == "__main__":
    import sys
    
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
            
        # 训练模型
        model = RVMRegressor()
        model.train(video_paths, labels)
        model.save(model_path)
        print("Model trained and saved successfully")
        
    elif mode == "predict":
        # python video_processor.py predict video_path
        video_path = sys.argv[2]
        passed, valence, arousal, square_sum = process_new_video(video_path, model_path)
        print(f"Passed screening: {passed}")
        print(f"Valence: {valence:.2f}")
        print(f"Arousal: {arousal:.2f}")
        print(f"Square sum: {square_sum:.2f}")

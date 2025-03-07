import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler
import joblib

class RVMRegression:
    def __init__(self):
        self.scaler = StandardScaler()
        self.model = LinearRegression()
        
    def train(self, X, y):
        """
        训练RVM线性回归模型
        X: EEG特征数据
        y: 视频评分数据 (valence 或 arousal)
        """
        # 标准化特征
        X_scaled = self.scaler.fit_transform(X)
        # 训练模型
        self.model.fit(X_scaled, y)
        
    def predict(self, X):
        """
        使用训练好的模型进行预测
        X: EEG特征数据
        """
        X_scaled = self.scaler.transform(X)
        return self.model.predict(X_scaled)
        
    def save(self, model_path):
        """保存模型"""
        joblib.dump({
            'scaler': self.scaler,
            'model': self.model
        }, model_path)
        
    @classmethod
    def load(cls, model_path):
        """加载模型"""
        saved = joblib.load(model_path)
        instance = cls()
        instance.scaler = saved['scaler']
        instance.model = saved['model']
        return instance

def train_rvm_model(eeg_features, video_scores, model_path):
    """
    训练并保存RVM模型
    eeg_features: EEG特征矩阵 [n_samples, n_features]
    video_scores: 视频评分向量 [n_samples]
    model_path: 模型保存路径
    """
    model = RVMRegression()
    model.train(eeg_features, video_scores)
    model.save(model_path)
    return model

def evaluate_video(eeg_features, model_path):
    """
    使用训练好的模型评估视频
    eeg_features: EEG特征向量 [n_features]
    model_path: 模型路径
    返回: 预测的评分
    """
    model = RVMRegression.load(model_path)
    return model.predict(eeg_features.reshape(1, -1))[0]

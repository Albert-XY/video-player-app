from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from skrvm import RVR
import numpy as np
from feature_extraction import extract_features

def prepare_data(video_paths, labels):
    features = np.array([extract_features(path) for path in video_paths])
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)
    return train_test_split(features_scaled, labels, test_size=0.2, random_state=42)

def train_rvm(X_train, y_train):
    rvm = RVR(kernel='rbf')
    rvm.fit(X_train, y_train)
    return rvm

def analyze_videos(video_paths, valence_labels, arousal_labels):
    X_train_valence, X_test_valence, y_train_valence, y_test_valence = prepare_data(video_paths, valence_labels)
    X_train_arousal, X_test_arousal, y_train_arousal, y_test_arousal = prepare_data(video_paths, arousal_labels)

    rvm_valence = train_rvm(X_train_valence, y_train_valence)
    rvm_arousal = train_rvm(X_train_arousal, y_train_arousal)

    valence_score = rvm_valence.score(X_test_valence, y_test_valence)
    arousal_score = rvm_arousal.score(X_test_arousal, y_test_arousal)

    print(f"Valence prediction R^2 score: {valence_score}")
    print(f"Arousal prediction R^2 score: {arousal_score}")

    return rvm_valence, rvm_arousal

def predict_valence_arousal(rvm_valence, rvm_arousal, video_path):
    features = extract_features(video_path)
    features_scaled = StandardScaler().fit_transform(features.reshape(1, -1))
    valence = rvm_valence.predict(features_scaled)[0]
    arousal = rvm_arousal.predict(features_scaled)[0]
    return valence, arousal

